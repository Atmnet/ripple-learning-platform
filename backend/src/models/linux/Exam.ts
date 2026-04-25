import pool from "../../config/database";

export interface ExamData {
  id?: number;
  title: string;
  description: string;
  questionIds: number[];
  categories: string[];
  assignedStudentIds?: number[];
  isRandom: boolean;
  startTime: Date | string;
  endTime: Date | string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  status: "draft" | "published" | "ended";
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Exam {
  id?: number;
  title: string;
  description: string;
  questionIds: number[];
  categories: string[];
  assignedStudentIds: number[];
  isRandom: boolean;
  startTime: Date | string;
  endTime: Date | string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  status: "draft" | "published" | "ended";
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: ExamData) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.questionIds = data.questionIds || [];
    this.categories = data.categories || [];
    this.assignedStudentIds = data.assignedStudentIds || [];
    this.isRandom = data.isRandom || false;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.duration = data.duration || 60;
    this.totalQuestions = data.totalQuestions || 50;
    this.passingScore = data.passingScore || 60;
    this.status = data.status || "draft";
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      questionIds: this.questionIds,
      categories: this.categories,
      assignedStudentIds: this.assignedStudentIds,
      isRandom: this.isRandom,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      totalQuestions: this.totalQuestions,
      passingScore: this.passingScore,
      status: this.status,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export function formatExamDateTime(value: Date | string): string {
  if (typeof value === "string") {
    if (!value || value.startsWith("0000-00-00")) return "";
    const matched = value.match(
      /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/
    );
    if (!matched) return value;
    const [, year, month, day, hour, minute, second = "00"] = matched;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")} ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(2, "0")}`;
  }

  if (Number.isNaN(value.getTime())) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  const seconds = String(value.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function parseExamDateTime(value: string | Date): Date {
  if (value instanceof Date) return value;

  const normalized = value.replace(" ", "T").replace(/Z$/, "");
  return new Date(`${normalized.slice(0, 19)}+08:00`);
}

function safeParseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value === null || value === undefined) return [];
  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    if (!trimmed.includes(",")) return [];

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/^["'\[]+|["'\]]+$/g, "") as T);
  }
}

export function getChinaNowDateTime(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export async function createExam(data: ExamData): Promise<Exam | null> {
  try {
    const [result]: any = await pool.execute(
      `INSERT INTO linux_exams
       (title, description, question_ids, categories, assigned_student_ids, is_random, start_time, end_time,
        duration, total_questions, passing_score, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description,
        JSON.stringify(data.questionIds),
        JSON.stringify(data.categories),
        JSON.stringify(data.assignedStudentIds || []),
        data.isRandom,
        formatExamDateTime(data.startTime),
        formatExamDateTime(data.endTime),
        data.duration,
        data.totalQuestions,
        data.passingScore,
        data.status,
        data.createdBy,
      ]
    );

    if (result.insertId) {
      return getExamById(result.insertId);
    }
    return null;
  } catch (error) {
    console.error("Error creating exam:", error);
    return null;
  }
}

export async function updateExam(
  id: number,
  data: Partial<ExamData>
): Promise<Exam | null> {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      fields.push("title = ?");
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }
    if (data.questionIds !== undefined) {
      fields.push("question_ids = ?");
      values.push(JSON.stringify(data.questionIds));
    }
    if (data.categories !== undefined) {
      fields.push("categories = ?");
      values.push(JSON.stringify(data.categories));
    }
    if (data.assignedStudentIds !== undefined) {
      fields.push("assigned_student_ids = ?");
      values.push(JSON.stringify(data.assignedStudentIds));
    }
    if (data.isRandom !== undefined) {
      fields.push("is_random = ?");
      values.push(data.isRandom);
    }
    if (data.startTime !== undefined) {
      fields.push("start_time = ?");
      values.push(formatExamDateTime(data.startTime));
    }
    if (data.endTime !== undefined) {
      fields.push("end_time = ?");
      values.push(formatExamDateTime(data.endTime));
    }
    if (data.duration !== undefined) {
      fields.push("duration = ?");
      values.push(data.duration);
    }
    if (data.status !== undefined) {
      fields.push("status = ?");
      values.push(data.status);
    }

    if (fields.length === 0) return null;

    values.push(id);
    await pool.execute(
      `UPDATE linux_exams SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return getExamById(id);
  } catch (error) {
    console.error("Error updating exam:", error);
    return null;
  }
}

export async function deleteExam(id: number): Promise<boolean> {
  try {
    await pool.execute("DELETE FROM linux_exams WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.error("Error deleting exam:", error);
    return false;
  }
}

export async function getExamById(id: number): Promise<Exam | null> {
  try {
    const [rows]: any = await pool.execute(
      "SELECT * FROM linux_exams WHERE id = ?",
      [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return new Exam({
      id: row.id,
      title: row.title,
      description: row.description,
      questionIds: safeParseJsonArray<number | string>(row.question_ids)
        .map((item) => Number(item))
        .filter((item) => !Number.isNaN(item)),
      categories: safeParseJsonArray<string>(row.categories),
      assignedStudentIds: safeParseJsonArray<number | string>(row.assigned_student_ids)
        .map((item) => Number(item))
        .filter((item) => !Number.isNaN(item)),
      isRandom: row.is_random,
      startTime: formatExamDateTime(row.start_time),
      endTime: formatExamDateTime(row.end_time),
      duration: row.duration,
      totalQuestions: row.total_questions,
      passingScore: row.passing_score,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("Error getting exam:", error);
    return null;
  }
}

export async function getAllExams(
  page?: number,
  limit?: number
): Promise<{ data: Exam[]; total: number }> {
  try {
    let query = "SELECT * FROM linux_exams ORDER BY created_at DESC";

    if (page !== undefined && limit !== undefined) {
      const normalizedPage = Math.max(1, page);
      const normalizedLimit = Math.min(Math.max(1, limit), 100);
      const offset = (normalizedPage - 1) * normalizedLimit;
      query += ` LIMIT ${normalizedLimit} OFFSET ${offset}`;
    }

    const [rows]: any = await pool.execute(query);
    const [countRows]: any = await pool.execute(
      "SELECT COUNT(*) as total FROM linux_exams"
    );

    const exams = rows.map(
      (row: any) =>
        new Exam({
          id: row.id,
          title: row.title,
          description: row.description,
          questionIds: safeParseJsonArray<number | string>(row.question_ids)
            .map((item) => Number(item))
            .filter((item) => !Number.isNaN(item)),
          categories: safeParseJsonArray<string>(row.categories),
          assignedStudentIds: safeParseJsonArray<number | string>(row.assigned_student_ids)
            .map((item) => Number(item))
            .filter((item) => !Number.isNaN(item)),
          isRandom: row.is_random,
          startTime: formatExamDateTime(row.start_time),
          endTime: formatExamDateTime(row.end_time),
          duration: row.duration,
          totalQuestions: row.total_questions,
          passingScore: row.passing_score,
          status: row.status,
          createdBy: row.created_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })
    );

    return { data: exams, total: countRows[0].total };
  } catch (error) {
    console.error("Error getting exams:", error);
    return { data: [], total: 0 };
  }
}

export async function getPublishedExams(): Promise<Exam[]> {
  try {
    const [rows]: any = await pool.execute(
      `SELECT * FROM linux_exams
       WHERE status = 'published'
       AND end_time > ?
       ORDER BY start_time ASC`,
      [getChinaNowDateTime()]
    );

    return rows.map(
      (row: any) =>
        new Exam({
          id: row.id,
          title: row.title,
          description: row.description,
          questionIds: safeParseJsonArray<number | string>(row.question_ids)
            .map((item) => Number(item))
            .filter((item) => !Number.isNaN(item)),
          categories: safeParseJsonArray<string>(row.categories),
          assignedStudentIds: safeParseJsonArray<number | string>(row.assigned_student_ids)
            .map((item) => Number(item))
            .filter((item) => !Number.isNaN(item)),
          isRandom: row.is_random,
          startTime: formatExamDateTime(row.start_time),
          endTime: formatExamDateTime(row.end_time),
          duration: row.duration,
          totalQuestions: row.total_questions,
          passingScore: row.passing_score,
          status: row.status,
          createdBy: row.created_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })
    );
  } catch (error) {
    console.error("Error getting published exams:", error);
    return [];
  }
}

export async function publishExam(id: number): Promise<Exam | null> {
  return updateExam(id, { status: "published" });
}

export async function endExam(id: number): Promise<Exam | null> {
  return updateExam(id, { status: "ended" });
}
