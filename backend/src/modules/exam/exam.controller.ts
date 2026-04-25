import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { sendError, sendMessage, sendSuccess } from "../../shared/utils/response";
import { examService } from "./exam.service";

function parseId(value: string): number {
  const id = Number.parseInt(value, 10);
  if (Number.isNaN(id)) {
    throw new Error("INVALID_ID");
  }
  return id;
}

export async function getQuestionBank(req: Request, res: Response): Promise<void> {
  try {
    const result = examService.getQuestionBank({
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      type: typeof req.query.type === "string" ? req.query.type : undefined,
    });

    sendSuccess(res, result.data, { total: result.total });
  } catch (error) {
    console.error("Error getting question bank:", error);
    sendError(res, error, "获取题库失败");
  }
}

export async function createExamHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const exam = await examService.createExam(req.body, req.user!);
    sendSuccess(res, exam);
  } catch (error) {
    console.error("Error creating exam:", error);
    sendError(res, error, "创建考试失败");
  }
}

export async function getAllExamsHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await examService.getAllExams(req.query.page, req.query.limit);
    sendSuccess(res, result.data, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    console.error("Error getting exams:", error);
    sendError(res, error, "获取考试列表失败");
  }
}

export async function getExamDetailHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const exam = await examService.getExamDetail(parseId(req.params.id), req.user);
    sendSuccess(res, exam);
  } catch (error) {
    console.error("Error getting exam detail:", error);
    sendError(res, error, error instanceof Error && error.message === "INVALID_ID" ? "考试 ID 无效" : "获取考试详情失败");
  }
}

export async function updateExamHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const exam = await examService.updateExam(parseId(req.params.id), req.body, req.user!);
    sendSuccess(res, exam);
  } catch (error) {
    console.error("Error updating exam:", error);
    sendError(res, error, error instanceof Error && error.message === "INVALID_ID" ? "考试 ID 无效" : "更新考试失败");
  }
}

export async function deleteExamHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    await examService.deleteExam(parseId(req.params.id), req.user!);
    sendMessage(res, "删除成功");
  } catch (error) {
    console.error("Error deleting exam:", error);
    sendError(res, error, error instanceof Error && error.message === "INVALID_ID" ? "考试 ID 无效" : "删除考试失败");
  }
}

export async function publishExamHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const exam = await examService.publishExam(parseId(req.params.id));
    sendSuccess(res, exam);
  } catch (error) {
    console.error("Error publishing exam:", error);
    sendError(res, error, error instanceof Error && error.message === "INVALID_ID" ? "考试 ID 无效" : "发布考试失败");
  }
}

export async function endExamHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const exam = await examService.endExam(parseId(req.params.id));
    sendSuccess(res, exam);
  } catch (error) {
    console.error("Error ending exam:", error);
    sendError(res, error, error instanceof Error && error.message === "INVALID_ID" ? "考试 ID 无效" : "结束考试失败");
  }
}

export async function getExamResultsHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await examService.getExamResults(parseId(req.params.id));
    sendSuccess(res, result.data, { stats: result.stats });
  } catch (error) {
    console.error("Error getting exam results:", error);
    sendError(res, error, error instanceof Error && error.message === "INVALID_ID" ? "考试 ID 无效" : "获取考试结果失败");
  }
}

export async function getPublishedExamsHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const exams = await examService.getPublishedExams(req.user!.id);
    sendSuccess(res, exams);
  } catch (error) {
    console.error("Error getting published exams:", error);
    sendError(res, error, "获取考试列表失败");
  }
}

export async function startExamHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await examService.startExam(parseId(req.params.id), req.user!.id);
    sendSuccess(res, result);
  } catch (error) {
    console.error("Error starting exam:", error);
    sendError(res, error, error instanceof Error && error.message === "INVALID_ID" ? "考试 ID 无效" : "开始考试失败");
  }
}

export async function submitExamAnswerHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await examService.submitExamAnswers(
      parseId(req.params.id),
      req.user!,
      req.body.answers
    );
    sendSuccess(res, result);
  } catch (error) {
    console.error("Error submitting exam:", error);
    sendError(res, error, error instanceof Error && error.message === "INVALID_ID" ? "考试记录 ID 无效" : "提交答案失败");
  }
}

export async function getStudentExamsHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const exams = await examService.getStudentExams(req.user!.id);
    sendSuccess(res, exams);
  } catch (error) {
    console.error("Error getting student exams:", error);
    sendError(res, error, "获取考试记录失败");
  }
}

export async function getExamResultDetailHandler(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await examService.getExamResultDetail(parseId(req.params.id), req.user!);
    sendSuccess(res, result);
  } catch (error) {
    console.error("Error getting exam result:", error);
    sendError(res, error, error instanceof Error && error.message === "INVALID_ID" ? "考试记录 ID 无效" : "获取考试结果失败");
  }
}
