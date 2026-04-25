import pool from "../../config/database";
import { formatExamDateTime } from "./Exam";

export interface StudentExamData {
  id?: number;
  examId: number;
  studentId: number;
  studentName?: string;
  username?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  score?: number;
  correctCount?: number;
  wrongCount?: number;
  status: "not_started" | "in_progress" | "completed" | "timeout";
  answers?: StudentAnswerData[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentAnswerData {
  id?: number;
  studentExamId?: number;
  questionId: number;
  answer: string | number | boolean | null;
  isCorrect?: boolean;
  correctAnswer?: string | number | boolean | string[];
  createdAt?: Date;
}

export class StudentAnswer {
  id?: number;
  studentExamId?: number;
  questionId: number;
  answer: string | number | boolean | null;
  isCorrect?: boolean;
  correctAnswer?: string | number | boolean | string[];
  createdAt?: Date;

  constructor(data: StudentAnswerData) {
    this.id = data.id;
    this.studentExamId = data.studentExamId;
    this.questionId = data.questionId;
    this.answer = data.answer;
    this.isCorrect = data.isCorrect;
    this.correctAnswer = data.correctAnswer;
    this.createdAt = data.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      studentExamId: this.studentExamId,
      questionId: this.questionId,
      answer: this.answer,
      isCorrect: this.isCorrect,
      correctAnswer: this.correctAnswer,
      createdAt: this.createdAt,
    };
  }
}

export class StudentExam {
  id?: number;
  examId: number;
  studentId: number;
  studentName?: string;
  username?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  score?: number;
  correctCount?: number;
  wrongCount?: number;
  status: "not_started" | "in_progress" | "completed" | "timeout";
  answers?: StudentAnswer[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: StudentExamData) {
    this.id = data.id;
    this.examId = data.examId;
    this.studentId = data.studentId;
    this.studentName = data.studentName;
    this.username = data.username;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.score = data.score;
    this.correctCount = data.correctCount;
    this.wrongCount = data.wrongCount;
    this.status = data.status;
    this.answers = data.answers?.map((a) => new StudentAnswer(a));
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      examId: this.examId,
      studentId: this.studentId,
      studentName: this.studentName,
      username: this.username,
      startTime: this.startTime,
      endTime: this.endTime,
      score: this.score,
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
      status: this.status,
      answers: this.answers?.map((a) => a.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export async function startExam(
  examId: number,
  studentId: number
): Promise<StudentExam | null> {
  try {
    const [existing]: any = await pool.execute(
      "SELECT * FROM linux_student_exams WHERE exam_id = ? AND student_id = ?",
      [examId, studentId]
    );

    if (existing.length > 0) {
      const record = existing[0];
      if (record.status === "in_progress" || record.status === "completed") {
        return getStudentExam(record.id);
      }

      await pool.execute(
        `UPDATE linux_student_exams
         SET status = 'in_progress', start_time = NOW()
         WHERE id = ?`,
        [record.id]
      );
      return getStudentExam(record.id);
    }

    const [result]: any = await pool.execute(
      `INSERT INTO linux_student_exams (exam_id, student_id, status, start_time)
       VALUES (?, ?, 'in_progress', NOW())`,
      [examId, studentId]
    );

    return getStudentExam(result.insertId);
  } catch (error) {
    console.error("Error starting exam:", error);
    return null;
  }
}

export async function submitAnswer(
  studentExamId: number,
  questionId: number,
  answer: string | number | boolean | null,
  isCorrect: boolean,
  correctAnswer: string | number | boolean | string[]
): Promise<boolean> {
  const safeAnswer = answer ?? null;
  try {
    await pool.execute(
      `INSERT INTO linux_student_answers
       (student_exam_id, question_id, answer, is_correct, correct_answer)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       answer = VALUES(answer),
       is_correct = VALUES(is_correct),
       correct_answer = VALUES(correct_answer)`,
      [
        studentExamId,
        questionId,
        JSON.stringify(safeAnswer),
        isCorrect,
        JSON.stringify(correctAnswer),
      ]
    );
    return true;
  } catch (error) {
    console.error("Error submitting answer:", error);
    return false;
  }
}

export async function completeExam(
  studentExamId: number,
  score: number,
  correctCount: number,
  wrongCount: number
): Promise<StudentExam | null> {
  try {
    await pool.execute(
      `UPDATE linux_student_exams
       SET status = 'completed',
           end_time = NOW(),
           score = ?,
           correct_count = ?,
           wrong_count = ?
       WHERE id = ?`,
      [score, correctCount, wrongCount, studentExamId]
    );
    return getStudentExam(studentExamId);
  } catch (error) {
    console.error("Error completing exam:", error);
    return null;
  }
}

export async function getStudentExam(id: number): Promise<StudentExam | null> {
  try {
    const [rows]: any = await pool.execute(
      `SELECT se.*, e.title as exam_title, e.total_questions
       FROM linux_student_exams se
       JOIN linux_exams e ON se.exam_id = e.id
       WHERE se.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;
    const row = rows[0];

    const [answerRows]: any = await pool.execute(
      `SELECT * FROM linux_student_answers WHERE student_exam_id = ?`,
      [id]
    );

    return new StudentExam({
      id: row.id,
      examId: row.exam_id,
      studentId: row.student_id,
      startTime: row.start_time ? formatExamDateTime(row.start_time) : undefined,
      endTime: row.end_time ? formatExamDateTime(row.end_time) : undefined,
      score: row.score,
      correctCount: row.correct_count,
      wrongCount: row.wrong_count,
      status: row.status,
      answers: answerRows.map((r: any) => ({
        id: r.id,
        studentExamId: r.student_exam_id,
        questionId: r.question_id,
        answer: JSON.parse(r.answer || "null"),
        isCorrect: r.is_correct,
        correctAnswer: JSON.parse(r.correct_answer || "null"),
        createdAt: r.created_at,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("Error getting student exam:", error);
    return null;
  }
}

export async function getStudentExams(studentId: number): Promise<StudentExam[]> {
  try {
    const [rows]: any = await pool.execute(
      `SELECT se.*, e.title as exam_title, e.total_questions
       FROM linux_student_exams se
       JOIN linux_exams e ON se.exam_id = e.id
       WHERE se.student_id = ?
       ORDER BY se.created_at DESC`,
      [studentId]
    );

    return rows.map(
      (row: any) =>
        new StudentExam({
          id: row.id,
          examId: row.exam_id,
          studentId: row.student_id,
          startTime: row.start_time ? formatExamDateTime(row.start_time) : undefined,
          endTime: row.end_time ? formatExamDateTime(row.end_time) : undefined,
          score: row.score,
          correctCount: row.correct_count,
          wrongCount: row.wrong_count,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })
    );
  } catch (error) {
    console.error("Error getting student exams:", error);
    return [];
  }
}

export async function getExamResults(examId: number): Promise<{
  data: StudentExam[];
  stats: { total: number; completed: number; averageScore: number };
}> {
  try {
    const [rows]: any = await pool.execute(
      `SELECT se.*, u.username, u.real_name
       FROM linux_student_exams se
       JOIN users u ON se.student_id = u.id
       WHERE se.exam_id = ?
       ORDER BY se.score DESC, se.end_time ASC`,
      [examId]
    );

    const exams = rows.map(
      (row: any) =>
        new StudentExam({
          id: row.id,
          examId: row.exam_id,
          studentId: row.student_id,
          studentName: row.real_name,
          username: row.username,
          startTime: row.start_time ? formatExamDateTime(row.start_time) : undefined,
          endTime: row.end_time ? formatExamDateTime(row.end_time) : undefined,
          score: row.score,
          correctCount: row.correct_count,
          wrongCount: row.wrong_count,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })
    );

    const completed = exams.filter((e: StudentExam) => e.status === "completed");
    const averageScore =
      completed.length > 0
        ? Math.round(
            completed.reduce(
              (sum: number, e: StudentExam) => sum + (e.score || 0),
              0
            ) / completed.length
          )
        : 0;

    return {
      data: exams,
      stats: {
        total: exams.length,
        completed: completed.length,
        averageScore,
      },
    };
  } catch (error) {
    console.error("Error getting exam results:", error);
    return { data: [], stats: { total: 0, completed: 0, averageScore: 0 } };
  }
}

export async function hasCompletedExam(
  examId: number,
  studentId: number
): Promise<boolean> {
  try {
    const [rows]: any = await pool.execute(
      `SELECT status FROM linux_student_exams
       WHERE exam_id = ? AND student_id = ?
       AND (status = 'completed' OR status = 'timeout')`,
      [examId, studentId]
    );
    return rows.length > 0;
  } catch (error) {
    console.error("Error checking exam completion:", error);
    return false;
  }
}

export async function getWrongAnswers(
  studentExamId: number
): Promise<StudentAnswer[]> {
  try {
    const [rows]: any = await pool.execute(
      `SELECT * FROM linux_student_answers
       WHERE student_exam_id = ? AND is_correct = false`,
      [studentExamId]
    );

    return rows.map(
      (row: any) =>
        new StudentAnswer({
          id: row.id,
          studentExamId: row.student_exam_id,
          questionId: row.question_id,
          answer: JSON.parse(row.answer),
          isCorrect: row.is_correct,
          correctAnswer: JSON.parse(row.correct_answer || "null"),
          createdAt: row.created_at,
        })
    );
  } catch (error) {
    console.error("Error getting wrong answers:", error);
    return [];
  }
}
