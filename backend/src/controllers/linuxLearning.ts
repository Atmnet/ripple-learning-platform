/**
 * Linux Learning Controller
 * Handles API endpoints for Linux command learning, practice, quiz, and virtual terminal
 */

import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  CATEGORIES,
  COMMAND_DB,
  getCommandsByCategory as getCommandsByCategoryModel,
  getCommandByName,
  searchCommands as searchCommandsModel,
} from "../models/linux/LinuxCommand";
import {
  PRACTICE_SCENARIOS,
  getScenarioById,
  getScenariosByCategory,
  getCategoryStats,
  ALL_PRACTICE_SCENARIOS,
} from "../models/linux/LinuxPractice";
import {
  getAllQuestions,
  getQuestionsByCategory as getQuestionsByCategoryModel,
  getQuestionsByType as getQuestionsByTypeModel,
  getRandomQuestions as getRandomQuestionsModel,
  QuizQuestion,
} from "../models/linux/LinuxQuiz";
import {
  CommandSimulator,
  getOrCreateSimulator,
  removeSimulator,
} from "../models/linux/VirtualFileSystem";
import { v4 as uuidv4 } from "uuid";

// Session storage for practice scenarios (maps sessionId to { simulator, currentScenarioId, currentTaskIndex, taskSetupExecuted })
const practiceSessions = new Map<
  string,
  {
    simulator: CommandSimulator;
    currentScenarioId: number;
    currentTaskIndex: number;
    taskSetupExecuted: boolean;
  }
>();

// ============ Category & Command Endpoints ============

/**
 * Get all command categories
 * GET /api/linux/categories
 */
export function getCategories(req: Request, res: Response): void {
  try {
    const categories = Object.entries(CATEGORIES).map(([key, data]) => ({
      key,
      name: data.name,
      description: data.description,
      icon: data.icon,
    }));

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({ success: false, error: "获取分类失败" });
  }
}

/**
 * Get commands by category
 * GET /api/linux/commands/:category
 */
export function getCommandsByCategory(req: Request, res: Response): void {
  try {
    const { category } = req.params;
    const commands = getCommandsByCategoryModel(category);

    res.json({
      success: true,
      data: commands.map((cmd) => ({
        name: cmd.name,
        description: cmd.desc,
        category: cmd.category,
        syntax: cmd.syntax,
      })),
    });
  } catch (error) {
    console.error("Error getting commands by category:", error);
    res.status(500).json({ success: false, error: "获取命令列表失败" });
  }
}

/**
 * Get command detail
 * GET /api/linux/command/:name
 */
export function getCommandDetail(req: Request, res: Response): void {
  try {
    const { name } = req.params;
    const command = getCommandByName(name);

    if (!command) {
      res.status(404).json({ success: false, error: "命令不存在" });
      return;
    }

    res.json({
      success: true,
      data: {
        name: command.name,
        description: command.desc,
        longDesc: command.longDesc,
        category: command.category,
        syntax: command.syntax,
        options: command.options.map(opt => ({
          option: opt.flag,
          description: opt.desc
        })),
        examples: command.examples,
        usageScenarios: command.usageScenarios,
        related: command.related,
        tips: command.tips,
        note: command.note,
      },
    });
  } catch (error) {
    console.error("Error getting command detail:", error);
    res.status(500).json({ success: false, error: "获取命令详情失败" });
  }
}

/**
 * Search commands
 * GET /api/linux/search?q=keyword
 */
export function searchCommands(req: Request, res: Response): void {
  try {
    const query = (req.query.q as string)?.toLowerCase() || "";

    if (!query) {
      res.status(400).json({ success: false, error: "请输入搜索关键词" });
      return;
    }

    const results = searchCommandsModel(query);

    res.json({
      success: true,
      data: results.map((cmd) => ({
        name: cmd.name,
        description: cmd.desc,
        category: cmd.category,
        syntax: cmd.syntax,
      })),
      total: results.length,
    });
  } catch (error) {
    console.error("Error searching commands:", error);
    res.status(500).json({ success: false, error: "搜索失败" });
  }
}

// ============ Practice Scenario Endpoints ============

/**
 * Get all practice scenarios
 * GET /api/linux/scenarios
 */
export function getScenarios(req: Request, res: Response): void {
  try {
    const { category } = req.query;

    let scenarios = PRACTICE_SCENARIOS;
    if (category) {
      scenarios = getScenariosByCategory(category as string);
    }

    res.json({
      success: true,
      data: scenarios.map((s) => s.toJSON()),
      total: scenarios.length,
    });
  } catch (error) {
    console.error("Error getting scenarios:", error);
    res.status(500).json({ success: false, error: "获取场景列表失败" });
  }
}

/**
 * Get scenario detail
 * GET /api/linux/scenario/:id
 */
export function getScenarioDetail(req: Request, res: Response): void {
  try {
    const id = parseInt(req.params.id, 10);
    const scenario = getScenarioById(id);

    if (!scenario) {
      res.status(404).json({ success: false, error: "场景不存在" });
      return;
    }

    // Return scenario with tasks for frontend
    res.json({
      success: true,
      data: {
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        difficulty: scenario.difficulty,
        category: scenario.category,
        taskCount: scenario.tasks.length,
        setup: scenario.setup,
        tasks: scenario.tasks.map((task) => ({
          prompt: task.prompt,
          hint: task.hint,
          category: task.category,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting scenario detail:", error);
    res.status(500).json({ success: false, error: "获取场景详情失败" });
  }
}

/**
 * Get practice task detail
 * GET /api/linux/scenario/:id/task/:taskIndex
 */
export function getTaskDetail(req: Request, res: Response): void {
  try {
    const id = parseInt(req.params.id, 10);
    const taskIndex = parseInt(req.params.taskIndex, 10);
    const scenario = getScenarioById(id);

    if (!scenario) {
      res.status(404).json({ success: false, error: "场景不存在" });
      return;
    }

    if (taskIndex < 0 || taskIndex >= scenario.tasks.length) {
      res.status(404).json({ success: false, error: "任务不存在" });
      return;
    }

    const task = scenario.tasks[taskIndex];
    res.json({
      success: true,
      data: {
        prompt: task.prompt,
        hint: task.hint,
        category: task.category,
        taskIndex,
        totalTasks: scenario.tasks.length,
      },
    });
  } catch (error) {
    console.error("Error getting task detail:", error);
    res.status(500).json({ success: false, error: "获取任务详情失败" });
  }
}

/**
 * Initialize practice session
 * POST /api/linux/practice/init
 */
export function initPractice(req: AuthRequest, res: Response): void {
  try {
    const { scenarioId } = req.body;
    const userId = req.user?.id || "anonymous";

    if (!scenarioId) {
      res.status(400).json({ success: false, error: "请提供场景ID" });
      return;
    }

    const scenario = getScenarioById(parseInt(scenarioId, 10));
    if (!scenario) {
      res.status(404).json({ success: false, error: "场景不存在" });
      return;
    }

    // Create new simulator for this session
    const sessionId = `${userId}_${scenarioId}_${Date.now()}`;
    const simulator = new CommandSimulator();

    // Execute scenario-level setup commands
    if (scenario.setup && scenario.setup.length > 0) {
      for (const cmd of scenario.setup) {
        simulator.execute(cmd);
      }
    }

    practiceSessions.set(sessionId, {
      simulator,
      currentScenarioId: scenario.id,
      currentTaskIndex: 0,
      taskSetupExecuted: false,
    });

    res.json({
      success: true,
      data: {
        sessionId,
        scenarioId: scenario.id,
        title: scenario.title,
        cwd: simulator.fs.cwd,
      },
    });
  } catch (error) {
    console.error("Error initializing practice:", error);
    res.status(500).json({ success: false, error: "初始化练习失败" });
  }
}

/**
 * Execute command in practice session
 * POST /api/linux/practice/exec
 */
export function executePracticeCommand(req: AuthRequest, res: Response): void {
  try {
    const { sessionId, command } = req.body;

    if (!sessionId || !command) {
      res.status(400).json({ success: false, error: "请提供会话ID和命令" });
      return;
    }

    const session = practiceSessions.get(sessionId);
    if (!session) {
      res.status(404).json({ success: false, error: "会话不存在或已过期" });
      return;
    }

    // Execute command
    const result = session.simulator.execute(command);

    res.json({
      success: true,
      data: {
        command,
        output: result.output,
        error: result.error,
        cwd: session.simulator.fs.cwd,
        isClear: result.output === "__CLEAR__",
      },
    });
  } catch (error) {
    console.error("Error executing practice command:", error);
    res.status(500).json({ success: false, error: "执行命令失败" });
  }
}

/**
 * Validate practice task answer
 * POST /api/linux/scenario/:id/task/:taskIndex/validate
 */
export function validateTaskAnswer(req: Request, res: Response): void {
  try {
    const id = parseInt(req.params.id, 10);
    const taskIndex = parseInt(req.params.taskIndex, 10);
    const { sessionId, command } = req.body;

    if (!sessionId) {
      res.status(400).json({ success: false, error: "请提供会话ID" });
      return;
    }

    if (!command) {
      res.status(400).json({ success: false, error: "请输入命令" });
      return;
    }

    const session = practiceSessions.get(sessionId);
    if (!session) {
      res.status(404).json({ success: false, error: "会话不存在或已过期" });
      return;
    }

    const scenario = getScenarioById(id);
    if (!scenario) {
      res.status(404).json({ success: false, error: "场景不存在" });
      return;
    }

    if (taskIndex < 0 || taskIndex >= scenario.tasks.length) {
      res.status(404).json({ success: false, error: "任务不存在" });
      return;
    }

    const task = scenario.tasks[taskIndex];

    // Execute task setup commands if not already done
    if (!session.taskSetupExecuted && task.setup && task.setup.length > 0) {
      for (const cmd of task.setup) {
        session.simulator.execute(cmd);
      }
      session.taskSetupExecuted = true;
    }

    // Execute user's command
    const execResult = session.simulator.execute(command);

    // Validate the task using the validation rules
    const validationResult = task.validate(
      session.simulator,
      command,
      execResult.output
    );

    res.json({
      success: true,
      data: {
        isCorrect: validationResult.success,
        message: validationResult.success ? task.successMsg : (validationResult.message || "命令不正确"),
        explanation: validationResult.success
          ? task.explanationOnCorrect
          : task.explanationOnWrong,
        hint: task.hint,
        output: execResult.output,
        error: execResult.error,
        cwd: session.simulator.fs.cwd,
      },
    });
  } catch (error) {
    console.error("Error validating task answer:", error);
    res.status(500).json({ success: false, error: "验证失败" });
  }
}

/**
 * Move to next task
 * POST /api/linux/practice/next-task
 */
export function nextTask(req: Request, res: Response): void {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      res.status(400).json({ success: false, error: "请提供会话ID" });
      return;
    }

    const session = practiceSessions.get(sessionId);
    if (!session) {
      res.status(404).json({ success: false, error: "会话不存在" });
      return;
    }

    session.currentTaskIndex++;
    session.taskSetupExecuted = false;

    const scenario = getScenarioById(session.currentScenarioId);
    if (!scenario) {
      res.status(404).json({ success: false, error: "场景不存在" });
      return;
    }

    if (session.currentTaskIndex >= scenario.tasks.length) {
      res.json({
        success: true,
        data: {
          completed: true,
          message: "恭喜！已完成所有任务",
        },
      });
      // Clean up session
      practiceSessions.delete(sessionId);
      return;
    }

    const task = scenario.tasks[session.currentTaskIndex];

    res.json({
      success: true,
      data: {
        completed: false,
        taskIndex: session.currentTaskIndex,
        task: {
          prompt: task.prompt,
          hint: task.hint,
          category: task.category,
        },
        cwd: session.simulator.fs.cwd,
      },
    });
  } catch (error) {
    console.error("Error moving to next task:", error);
    res.status(500).json({ success: false, error: "切换任务失败" });
  }
}

/**
 * Get category statistics
 * GET /api/linux/practice/stats
 */
export function getPracticeStats(req: Request, res: Response): void {
  try {
    const stats = getCategoryStats();
    res.json({
      success: true,
      data: stats,
      totalScenarios: PRACTICE_SCENARIOS.length,
      totalTasks: ALL_PRACTICE_SCENARIOS.reduce((sum, s) => sum + s.tasks.length, 0),
    });
  } catch (error) {
    console.error("Error getting practice stats:", error);
    res.status(500).json({ success: false, error: "获取统计失败" });
  }
}

// ============ Quiz Endpoints ============

/**
 * Get quiz questions
 * GET /api/linux/quiz/questions?count=10&category=&type=
 */
export function getQuizQuestions(req: Request, res: Response): void {
  try {
    const count = parseInt(req.query.count as string, 10) || 10;
    const category = req.query.category as string;
    const type = req.query.type as string;
    const includeAll = req.query.all === "true";

    let questions: QuizQuestion[] = getAllQuestions();
    if (category) {
      questions = questions.filter((q) => q.category === category);
    }
    if (type) {
      questions = questions.filter((q) => q.type === type);
    }

    // Shuffle and limit questions by count
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const limited = includeAll ? shuffled : shuffled.slice(0, Math.min(count, questions.length, 50));

    // Remove answers from response
    const questionsWithoutAnswers = limited.map((q) => ({
      id: q.id,
      type: q.type,
      question: q.question,
      category: q.category,
      options: q.type === "choice" ? q.options : undefined,
    }));

    res.json({
      success: true,
      data: questionsWithoutAnswers,
      total: questionsWithoutAnswers.length,
    });
  } catch (error) {
    console.error("Error getting quiz questions:", error);
    res.status(500).json({ success: false, error: "获取题目失败" });
  }
}

/**
 * Submit quiz answer
 * POST /api/linux/quiz/answer
 */
export function submitQuizAnswer(req: Request, res: Response): void {
  try {
    const { questionId, answer } = req.body;
    console.log('Received submit answer request:', { questionId, answer, body: req.body });

    if (questionId === undefined || questionId === null || answer === undefined) {
      res.status(400).json({ success: false, error: "请提供题目ID和答案" });
      return;
    }

    const questions = getAllQuestions();
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      res.status(404).json({ success: false, error: "题目不存在" });
      return;
    }

    let isCorrect = false;
    if (question.type === "choice") {
      isCorrect = answer === question.answer;
    } else if (question.type === "truefalse") {
      isCorrect = answer === question.answer;
    } else if (question.type === "fill") {
      if (Array.isArray(question.answer)) {
        isCorrect = question.answer.includes(answer as string);
      } else {
        isCorrect = answer === question.answer;
      }
    }

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.answer,
        explanation: question.explain,
      },
    });
  } catch (error) {
    console.error("Error submitting quiz answer:", error);
    res.status(500).json({ success: false, error: "提交答案失败" });
  }
}

/**
 * Get quiz statistics
 * GET /api/linux/quiz/stats
 */
export function getQuizStats(req: Request, res: Response): void {
  try {
    const questions = getAllQuestions();
    const total = questions.length;
    const choiceCount = questions.filter((q: QuizQuestion) => q.type === "choice").length;
    const trueFalseCount = questions.filter((q: QuizQuestion) => q.type === "truefalse").length;
    const fillCount = questions.filter((q: QuizQuestion) => q.type === "fill").length;

    const categories = new Set<string>();
    questions.forEach((q: QuizQuestion) => categories.add(q.category));

    res.json({
      success: true,
      data: {
        total,
        choiceCount,
        trueFalseCount,
        fillCount,
        categories: Array.from(categories),
      },
    });
  } catch (error) {
    console.error("Error getting quiz stats:", error);
    res.status(500).json({ success: false, error: "获取统计失败" });
  }
}

// ============ Virtual Terminal Endpoints ============

/**
 * Initialize terminal session
 * POST /api/linux/terminal/init
 */
export function initTerminal(req: Request, res: Response): void {
  try {
    const sessionId = uuidv4();
    const simulator = getOrCreateSimulator(sessionId);

    res.json({
      success: true,
      data: {
        sessionId,
        cwd: simulator.fs.cwd,
        message: "终端会话已创建",
      },
    });
  } catch (error) {
    console.error("Error initializing terminal:", error);
    res.status(500).json({ success: false, error: "初始化终端失败" });
  }
}

/**
 * Execute command in terminal
 * POST /api/linux/terminal/exec
 */
export function executeTerminalCommand(req: Request, res: Response): void {
  try {
    const { sessionId, command } = req.body;

    if (!sessionId) {
      res.status(400).json({ success: false, error: "请提供会话ID" });
      return;
    }

    if (!command) {
      res.status(400).json({ success: false, error: "请输入命令" });
      return;
    }

    const simulator = getOrCreateSimulator(sessionId);
    const result = simulator.execute(command);

    res.json({
      success: true,
      data: {
        command,
        output: result.output,
        error: result.error,
        cwd: simulator.fs.cwd,
        isClear: result.output === "__CLEAR__",
      },
    });
  } catch (error) {
    console.error("Error executing terminal command:", error);
    res.status(500).json({ success: false, error: "执行命令失败" });
  }
}

/**
 * Get terminal session info
 * GET /api/linux/terminal/:sessionId
 */
export function getTerminalInfo(req: Request, res: Response): void {
  try {
    const { sessionId } = req.params;
    const simulator = getOrCreateSimulator(sessionId);

    res.json({
      success: true,
      data: {
        sessionId,
        cwd: simulator.fs.cwd,
        exists: true,
      },
    });
  } catch (error) {
    console.error("Error getting terminal info:", error);
    res.status(500).json({ success: false, error: "获取终端信息失败" });
  }
}

/**
 * Reset terminal session
 * POST /api/linux/terminal/:sessionId/reset
 */
export function resetTerminal(req: Request, res: Response): void {
  try {
    const { sessionId } = req.params;
    removeSimulator(sessionId);
    const simulator = getOrCreateSimulator(sessionId);

    res.json({
      success: true,
      data: {
        sessionId,
        cwd: simulator.fs.cwd,
        message: "终端会话已重置",
      },
    });
  } catch (error) {
    console.error("Error resetting terminal:", error);
    res.status(500).json({ success: false, error: "重置终端失败" });
  }
}

// ============ Combined Stats Endpoint ============

/**
 * Get all Linux learning stats
 * GET /api/linux/stats
 */
export function getAllStats(req: Request, res: Response): void {
  try {
    const categories = Object.keys(CATEGORIES).length;
    const commands = Object.keys(COMMAND_DB).length;
    const scenarios = PRACTICE_SCENARIOS.length;
    const tasks = ALL_PRACTICE_SCENARIOS.reduce((sum: number, s) => sum + s.tasks.length, 0);
    const questions = getAllQuestions().length;

    res.json({
      success: true,
      data: {
        categories,
        commands,
        scenarios,
        tasks,
        questions,
      },
    });
  } catch (error) {
    console.error("Error getting all stats:", error);
    res.status(500).json({ success: false, error: "获取统计失败" });
  }
}
