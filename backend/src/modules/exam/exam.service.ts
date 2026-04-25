import { AppError } from "../../app/errors/AppError";
import { ERROR_CODES } from "../../app/errors/error-codes";
import { ExamRepository } from "./exam.repository";
import {
  AuthUser,
  CreateExamPayload,
  ExamQuestionBankFilters,
  SubmitExamAnswerPayload,
  UpdateExamPayload,
} from "./exam.types";

const examRepository = new ExamRepository();

function isAssignedStudent(assignedStudentIds: number[] | undefined, studentId: number): boolean {
  return !assignedStudentIds?.length || assignedStudentIds.includes(studentId);
}

function normalizePage(value: unknown): number | undefined {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export class ExamService {
  getQuestionBank(filters: ExamQuestionBankFilters) {
    let questions = examRepository.getAllQuestions();

    if (filters.category) {
      questions = questions.filter((question) => question.category === filters.category);
    }

    if (filters.type) {
      questions = questions.filter((question) => question.type === filters.type);
    }

    const data = questions.map((question) => ({
      id: question.id,
      type: question.type,
      category: question.category,
      question: question.question,
      options: question.type === "choice" ? question.options : undefined,
    }));

    return {
      data,
      total: data.length,
    };
  }

  async createExam(payload: CreateExamPayload, user: AuthUser) {
    const parsedStartTime = examRepository.parseExamDateTime(payload.startTime);
    const parsedEndTime = examRepository.parseExamDateTime(payload.endTime);

    if (!payload.title || !Array.isArray(payload.questionIds) || payload.questionIds.length !== 50) {
      throw new AppError("请提供标题和 50 道题目", 400, ERROR_CODES.EXAM_INVALID_QUESTION_COUNT);
    }

    if (Number.isNaN(parsedStartTime.getTime()) || Number.isNaN(parsedEndTime.getTime())) {
      throw new AppError("考试时间格式不正确", 400, ERROR_CODES.EXAM_INVALID_TIME_FORMAT);
    }

    if (parsedStartTime >= parsedEndTime) {
      throw new AppError("结束时间必须晚于开始时间", 400, ERROR_CODES.EXAM_INVALID_TIME_RANGE);
    }

    const exam = await examRepository.createExam({
      title: payload.title,
      description: payload.description ?? "",
      questionIds: payload.questionIds,
      categories: payload.categories || [],
      assignedStudentIds: payload.assignedStudentIds || [],
      isRandom: payload.isRandom || false,
      startTime: payload.startTime,
      endTime: payload.endTime,
      duration: payload.duration || 60,
      totalQuestions: 50,
      passingScore: payload.passingScore || 60,
      status: "draft",
      createdBy: user.id,
    });

    if (!exam) {
      throw new AppError("创建考试失败");
    }

    return exam.toJSON();
  }

  async getAllExams(pageValue?: unknown, limitValue?: unknown) {
    const page = normalizePage(pageValue) || 1;
    const limit = normalizePage(limitValue) || 10;
    const { data, total } = await examRepository.getAllExams(page, limit);

    return {
      data: data.map((exam) => exam.toJSON()),
      total,
      page,
      limit,
    };
  }

  async getExamDetail(examId: number, user?: AuthUser) {
    const exam = await examRepository.getExamById(examId);

    if (!exam) {
      throw new AppError("考试不存在", 404, ERROR_CODES.EXAM_NOT_FOUND);
    }

    const examData: Record<string, unknown> = exam.toJSON();

    if (user && user.role !== "admin") {
      const studentExams = await examRepository.getStudentExams(user.id);
      const activeExam = studentExams.find(
        (studentExam) => studentExam.examId === examId && studentExam.status === "in_progress"
      );

      if (activeExam) {
        const allQuestions = examRepository.getAllQuestions();
        examData.questions = exam.questionIds
          .map((questionId) => allQuestions.find((question) => question.id === questionId))
          .filter((question): question is NonNullable<typeof question> => Boolean(question))
          .map((question) => ({
            id: question.id,
            type: question.type,
            category: question.category,
            question: question.question,
            options: question.type === "choice" ? question.options : undefined,
          }));
      }
    }

    return examData;
  }

  async updateExam(examId: number, payload: UpdateExamPayload, user: AuthUser) {
    const exam = await examRepository.getExamById(examId);

    if (!exam) {
      throw new AppError("考试不存在", 404, ERROR_CODES.EXAM_NOT_FOUND);
    }

    if (exam.createdBy !== user.id && user.role !== "admin") {
      throw new AppError("无权修改此考试", 403, ERROR_CODES.FORBIDDEN);
    }

    if (payload.questionIds !== undefined && (!Array.isArray(payload.questionIds) || payload.questionIds.length !== 50)) {
      throw new AppError("考试必须包含 50 道题目", 400, ERROR_CODES.EXAM_INVALID_QUESTION_COUNT);
    }

    if (payload.startTime !== undefined) {
      const startTime = examRepository.parseExamDateTime(payload.startTime);
      if (Number.isNaN(startTime.getTime())) {
        throw new AppError("开始时间格式不正确", 400, ERROR_CODES.EXAM_INVALID_TIME_FORMAT);
      }
    }

    if (payload.endTime !== undefined) {
      const endTime = examRepository.parseExamDateTime(payload.endTime);
      if (Number.isNaN(endTime.getTime())) {
        throw new AppError("结束时间格式不正确", 400, ERROR_CODES.EXAM_INVALID_TIME_FORMAT);
      }
    }

    const nextStartTime = payload.startTime ?? String(exam.startTime);
    const nextEndTime = payload.endTime ?? String(exam.endTime);
    if (examRepository.parseExamDateTime(nextStartTime) >= examRepository.parseExamDateTime(nextEndTime)) {
      throw new AppError("结束时间必须晚于开始时间", 400, ERROR_CODES.EXAM_INVALID_TIME_RANGE);
    }

    const updated = await examRepository.updateExam(examId, payload);

    if (!updated) {
      throw new AppError("更新考试失败");
    }

    return updated.toJSON();
  }

  async deleteExam(examId: number, user: AuthUser) {
    const exam = await examRepository.getExamById(examId);

    if (!exam) {
      throw new AppError("考试不存在", 404, ERROR_CODES.EXAM_NOT_FOUND);
    }

    if (exam.createdBy !== user.id && user.role !== "admin") {
      throw new AppError("无权删除此考试", 403, ERROR_CODES.FORBIDDEN);
    }

    const success = await examRepository.deleteExam(examId);
    if (!success) {
      throw new AppError("删除考试失败");
    }
  }

  async publishExam(examId: number) {
    const exam = await examRepository.publishExam(examId);

    if (!exam) {
      throw new AppError("考试不存在", 404, ERROR_CODES.EXAM_NOT_FOUND);
    }

    return exam.toJSON();
  }

  async endExam(examId: number) {
    const exam = await examRepository.endExam(examId);

    if (!exam) {
      throw new AppError("考试不存在", 404, ERROR_CODES.EXAM_NOT_FOUND);
    }

    return exam.toJSON();
  }

  async getExamResults(examId: number) {
    const { data, stats } = await examRepository.getExamResults(examId);

    return {
      data: data.map((studentExam) => studentExam.toJSON()),
      stats,
    };
  }

  async getPublishedExams(studentId: number) {
    const exams = await examRepository.getPublishedExams();
    const visibleExams = exams.filter((exam) => isAssignedStudent(exam.assignedStudentIds, studentId));

    return Promise.all(
      visibleExams.map(async (exam) => {
        const hasCompleted = await examRepository.hasCompletedExam(exam.id!, studentId);
        return {
          ...exam.toJSON(),
          hasCompleted,
          isEnded: exam.status === "ended" || new Date() > examRepository.parseExamDateTime(exam.endTime),
          canStart:
            new Date() >= examRepository.parseExamDateTime(exam.startTime) &&
            new Date() <= examRepository.parseExamDateTime(exam.endTime),
        };
      })
    );
  }

  async startExam(examId: number, studentId: number) {
    const exam = await examRepository.getExamById(examId);
    if (!exam) {
      throw new AppError("考试不存在", 404, ERROR_CODES.EXAM_NOT_FOUND);
    }

    if (exam.status !== "published") {
      throw new AppError("考试未发布", 403, ERROR_CODES.EXAM_NOT_PUBLISHED);
    }

    if (!isAssignedStudent(exam.assignedStudentIds, studentId)) {
      throw new AppError("您不在本场考试的参考名单中", 403, ERROR_CODES.EXAM_NOT_ASSIGNED);
    }

    const now = new Date();
    if (now < examRepository.parseExamDateTime(exam.startTime)) {
      throw new AppError("考试尚未开始", 403, ERROR_CODES.BAD_REQUEST);
    }

    if (now > examRepository.parseExamDateTime(exam.endTime)) {
      throw new AppError("考试已结束", 403, ERROR_CODES.EXAM_ALREADY_ENDED);
    }

    if (await examRepository.hasCompletedExam(examId, studentId)) {
      throw new AppError("您已完成此考试", 403, ERROR_CODES.EXAM_ALREADY_COMPLETED);
    }

    const studentExam = await examRepository.startExam(examId, studentId);

    if (!studentExam) {
      throw new AppError("开始考试失败");
    }

    const allQuestions = examRepository.getAllQuestions();
    const questions = exam.questionIds
      .map((questionId) => allQuestions.find((question) => question.id === questionId))
      .filter((question): question is NonNullable<typeof question> => Boolean(question))
      .map((question) => ({
        id: question.id,
        type: question.type,
        category: question.category,
        question: question.question,
        options: question.type === "choice" ? question.options : undefined,
      }));

    return {
      studentExamId: studentExam.id,
      exam: exam.toJSON(),
      questions,
      startTime: studentExam.startTime,
      duration: exam.duration,
    };
  }

  async submitExamAnswers(studentExamId: number, user: AuthUser, answers: SubmitExamAnswerPayload[]) {
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new AppError("请提供答案", 400, ERROR_CODES.BAD_REQUEST);
    }

    const studentExam = await examRepository.getStudentExam(studentExamId);
    if (!studentExam) {
      throw new AppError("考试记录不存在", 404, ERROR_CODES.STUDENT_EXAM_NOT_FOUND);
    }

    if (studentExam.studentId !== user.id) {
      throw new AppError("无权提交", 403, ERROR_CODES.FORBIDDEN);
    }

    if (studentExam.status === "completed" || studentExam.status === "timeout") {
      throw new AppError("考试已结束", 403, ERROR_CODES.EXAM_ALREADY_ENDED);
    }

    const exam = await examRepository.getExamById(studentExam.examId);
    if (!exam) {
      throw new AppError("考试不存在", 404, ERROR_CODES.EXAM_NOT_FOUND);
    }

    const examQuestionIds = new Set(exam.questionIds);
    const allQuestions = examRepository.getAllQuestions();
    const questionMap = new Map(allQuestions.map((question) => [question.id, question]));

    let correctCount = 0;
    let wrongCount = 0;

    for (const answerItem of answers) {
      if (!examQuestionIds.has(answerItem.questionId)) {
        continue;
      }

      const question = questionMap.get(answerItem.questionId);
      if (!question) {
        continue;
      }

      const normalizedAnswer =
        typeof answerItem.answer === "string" ? answerItem.answer.trim() : answerItem.answer ?? null;
      let isCorrect = false;

      if (question.type === "choice" || question.type === "truefalse") {
        isCorrect = normalizedAnswer === question.answer;
      } else if (question.type === "fill") {
        const correctAnswer = question.answer;
        if (Array.isArray(correctAnswer)) {
          isCorrect = correctAnswer.some(
            (item) =>
              String(item).trim().toLowerCase() ===
              String(normalizedAnswer ?? "").trim().toLowerCase()
          );
        } else {
          isCorrect =
            String(correctAnswer).trim().toLowerCase() ===
            String(normalizedAnswer ?? "").trim().toLowerCase();
        }
      }

      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }

      await examRepository.submitAnswer(
        studentExamId,
        answerItem.questionId,
        normalizedAnswer,
        isCorrect,
        question.answer
      );
    }

    const score = correctCount * 2;
    const completed = await examRepository.completeExam(studentExamId, score, correctCount, wrongCount);
    const wrongAnswers = await examRepository.getWrongAnswers(studentExamId);

    const wrongQuestions = wrongAnswers.map((wrongAnswer) => {
      const question = questionMap.get(wrongAnswer.questionId);
      return {
        questionId: wrongAnswer.questionId,
        question: question?.question,
        category: question?.category,
        yourAnswer: wrongAnswer.answer,
        correctAnswer: wrongAnswer.correctAnswer,
        type: question?.type,
        options: question?.type === "choice" ? question.options : undefined,
      };
    });

    return {
      score,
      correctCount,
      wrongCount,
      totalQuestions: 50,
      percentage: score,
      status: completed?.status,
      wrongQuestions,
    };
  }

  async getStudentExams(studentId: number) {
    const exams = await examRepository.getStudentExams(studentId);
    return exams.map((exam) => exam.toJSON());
  }

  async getExamResultDetail(studentExamId: number, user: AuthUser) {
    const studentExam = await examRepository.getStudentExam(studentExamId);

    if (!studentExam) {
      throw new AppError("考试记录不存在", 404, ERROR_CODES.STUDENT_EXAM_NOT_FOUND);
    }

    if (studentExam.studentId !== user.id && user.role !== "admin" && user.role !== "teacher") {
      throw new AppError("无权查看", 403, ERROR_CODES.FORBIDDEN);
    }

    const allQuestions = examRepository.getAllQuestions();
    const questionMap = new Map(allQuestions.map((question) => [question.id, question]));
    const data = studentExam.toJSON() as Record<string, unknown>;

    data.wrongQuestions = (studentExam.answers || [])
      .filter((answer) => !answer.isCorrect)
      .map((answer) => {
        const question = questionMap.get(answer.questionId);
        return {
          questionId: answer.questionId,
          question: question?.question || "题目已不存在",
          category: question?.category,
          yourAnswer: answer.answer,
          correctAnswer: answer.correctAnswer,
          type: question?.type,
          options: question?.type === "choice" ? question.options : undefined,
        };
      });

    return data;
  }
}

export const examService = new ExamService();
