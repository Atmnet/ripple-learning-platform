import { v4 as uuidv4 } from 'uuid'
import { AppError } from '../../app/errors/AppError'
import { ERROR_CODES } from '../../app/errors/error-codes'
import { CommandSimulator } from '../../models/linux/VirtualFileSystem'
import { LearningRepository } from './learning.repository'

const learningRepository = new LearningRepository()

type PracticeSession = {
  simulator: CommandSimulator
  currentScenarioId: number
  currentTaskIndex: number
  taskSetupExecuted: boolean
}

const practiceSessions = new Map<string, PracticeSession>()

export class LearningService {
  getCategories() {
    const categories = learningRepository.getCategoriesMap()
    return Object.entries(categories).map(([key, data]) => ({
      key,
      name: data.name,
      description: data.description,
      icon: data.icon,
    }))
  }

  getCommandsByCategory(category: string) {
    return learningRepository.getCommandsByCategory(category).map((command) => ({
      name: command.name,
      description: command.desc,
      category: command.category,
      syntax: command.syntax,
    }))
  }

  getCommandDetail(name: string) {
    const command = learningRepository.getCommandByName(name)
    if (!command) {
      throw new AppError('命令不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    return {
      name: command.name,
      description: command.desc,
      longDesc: command.longDesc,
      category: command.category,
      syntax: command.syntax,
      options: command.options.map((option) => ({
        option: option.flag,
        description: option.desc,
      })),
      examples: command.examples,
      usageScenarios: command.usageScenarios,
      related: command.related,
      tips: command.tips,
      note: command.note,
    }
  }

  searchCommands(query: string) {
    if (!query) {
      throw new AppError('请输入搜索关键词', 400, ERROR_CODES.BAD_REQUEST)
    }

    const results = learningRepository.searchCommands(query.toLowerCase())
    return {
      data: results.map((command) => ({
        name: command.name,
        description: command.desc,
        category: command.category,
        syntax: command.syntax,
      })),
      total: results.length,
    }
  }

  getScenarios(category?: string) {
    const scenarios = category
      ? learningRepository.getScenariosByCategory(category)
      : learningRepository.getPracticeScenarios()

    return {
      data: scenarios.map((scenario) => scenario.toJSON()),
      total: scenarios.length,
    }
  }

  getScenarioDetail(id: number) {
    const scenario = learningRepository.getScenarioById(id)
    if (!scenario) {
      throw new AppError('场景不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    return {
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
    }
  }

  getTaskDetail(id: number, taskIndex: number) {
    const scenario = learningRepository.getScenarioById(id)
    if (!scenario) {
      throw new AppError('场景不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    if (taskIndex < 0 || taskIndex >= scenario.tasks.length) {
      throw new AppError('任务不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    const task = scenario.tasks[taskIndex]
    return {
      prompt: task.prompt,
      hint: task.hint,
      category: task.category,
      taskIndex,
      totalTasks: scenario.tasks.length,
    }
  }

  initPractice(scenarioId: number, userId: string | number) {
    if (!scenarioId) {
      throw new AppError('请提供场景 ID', 400, ERROR_CODES.BAD_REQUEST)
    }

    const scenario = learningRepository.getScenarioById(Number(scenarioId))
    if (!scenario) {
      throw new AppError('场景不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    const sessionId = `${userId}_${scenarioId}_${Date.now()}`
    const simulator = learningRepository.createCommandSimulator()

    if (scenario.setup?.length) {
      for (const command of scenario.setup) {
        simulator.execute(command)
      }
    }

    practiceSessions.set(sessionId, {
      simulator,
      currentScenarioId: scenario.id,
      currentTaskIndex: 0,
      taskSetupExecuted: false,
    })

    return {
      sessionId,
      scenarioId: scenario.id,
      title: scenario.title,
      cwd: simulator.fs.cwd,
    }
  }

  executePracticeCommand(sessionId: string, command: string) {
    if (!sessionId || !command) {
      throw new AppError('请提供会话 ID 和命令', 400, ERROR_CODES.BAD_REQUEST)
    }

    const session = practiceSessions.get(sessionId)
    if (!session) {
      throw new AppError('会话不存在或已过期', 404, ERROR_CODES.NOT_FOUND)
    }

    const result = session.simulator.execute(command)
    return {
      command,
      output: result.output,
      error: result.error,
      cwd: session.simulator.fs.cwd,
      isClear: result.output === '__CLEAR__',
    }
  }

  validateTaskAnswer(id: number, taskIndex: number, sessionId: string, command: string) {
    if (!sessionId) {
      throw new AppError('请提供会话 ID', 400, ERROR_CODES.BAD_REQUEST)
    }
    if (!command) {
      throw new AppError('请输入命令', 400, ERROR_CODES.BAD_REQUEST)
    }

    const session = practiceSessions.get(sessionId)
    if (!session) {
      throw new AppError('会话不存在或已过期', 404, ERROR_CODES.NOT_FOUND)
    }

    const scenario = learningRepository.getScenarioById(id)
    if (!scenario) {
      throw new AppError('场景不存在', 404, ERROR_CODES.NOT_FOUND)
    }
    if (taskIndex < 0 || taskIndex >= scenario.tasks.length) {
      throw new AppError('任务不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    const task = scenario.tasks[taskIndex]

    if (!session.taskSetupExecuted && task.setup?.length) {
      for (const setupCommand of task.setup) {
        session.simulator.execute(setupCommand)
      }
      session.taskSetupExecuted = true
    }

    const execResult = session.simulator.execute(command)
    const validationResult = task.validate(session.simulator, command, execResult.output)

    return {
      isCorrect: validationResult.success,
      message: validationResult.success ? task.successMsg : (validationResult.message || '命令不正确'),
      explanation: validationResult.success ? task.explanationOnCorrect : task.explanationOnWrong,
      hint: task.hint,
      output: execResult.output,
      error: execResult.error,
      cwd: session.simulator.fs.cwd,
    }
  }

  nextTask(sessionId: string) {
    if (!sessionId) {
      throw new AppError('请提供会话 ID', 400, ERROR_CODES.BAD_REQUEST)
    }

    const session = practiceSessions.get(sessionId)
    if (!session) {
      throw new AppError('会话不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    session.currentTaskIndex += 1
    session.taskSetupExecuted = false

    const scenario = learningRepository.getScenarioById(session.currentScenarioId)
    if (!scenario) {
      throw new AppError('场景不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    if (session.currentTaskIndex >= scenario.tasks.length) {
      practiceSessions.delete(sessionId)
      return {
        completed: true,
        message: '恭喜！已完成所有任务',
      }
    }

    const task = scenario.tasks[session.currentTaskIndex]
    return {
      completed: false,
      taskIndex: session.currentTaskIndex,
      task: {
        prompt: task.prompt,
        hint: task.hint,
        category: task.category,
      },
      cwd: session.simulator.fs.cwd,
    }
  }

  getPracticeStats() {
    return {
      data: learningRepository.getCategoryStats(),
      totalScenarios: learningRepository.getPracticeScenarios().length,
      totalTasks: learningRepository.getAllPracticeScenarios().reduce((sum, scenario) => sum + scenario.tasks.length, 0),
    }
  }

  getQuizQuestions(countValue: string | undefined, category?: string, type?: string, includeAll = false) {
    const count = parseInt(countValue || '10', 10) || 10
    let questions = learningRepository.getAllQuestions()

    if (category) {
      questions = questions.filter((question) => question.category === category)
    }
    if (type) {
      questions = questions.filter((question) => question.type === type)
    }

    const shuffled = [...questions].sort(() => Math.random() - 0.5)
    const limited = includeAll ? shuffled : shuffled.slice(0, Math.min(count, questions.length, 50))

    const data = limited.map((question) => ({
      id: question.id,
      type: question.type,
      question: question.question,
      category: question.category,
      options: question.type === 'choice' ? question.options : undefined,
    }))

    return {
      data,
      total: data.length,
    }
  }

  submitQuizAnswer(questionId: number, answer: unknown) {
    if ((questionId as any) === undefined || answer === undefined) {
      throw new AppError('请提供题目 ID 和答案', 400, ERROR_CODES.BAD_REQUEST)
    }

    const question = learningRepository.getAllQuestions().find((item) => item.id === questionId)
    if (!question) {
      throw new AppError('题目不存在', 404, ERROR_CODES.NOT_FOUND)
    }

    let isCorrect = false
    if (question.type === 'choice' || question.type === 'truefalse') {
      isCorrect = answer === question.answer
    } else if (question.type === 'fill') {
      isCorrect = Array.isArray(question.answer)
        ? question.answer.includes(answer as string)
        : answer === question.answer
    }

    return {
      isCorrect,
      correctAnswer: question.answer,
      explanation: question.explain,
    }
  }

  getQuizStats() {
    const questions = learningRepository.getAllQuestions()
    const categories = Array.from(new Set(questions.map((question) => question.category)))
    return {
      total: questions.length,
      choiceCount: questions.filter((question) => question.type === 'choice').length,
      trueFalseCount: questions.filter((question) => question.type === 'truefalse').length,
      fillCount: questions.filter((question) => question.type === 'fill').length,
      categories,
    }
  }

  initTerminal() {
    const sessionId = uuidv4()
    const simulator = learningRepository.getOrCreateSimulator(sessionId)
    return {
      sessionId,
      cwd: simulator.fs.cwd,
      message: '终端会话已创建',
    }
  }

  executeTerminalCommand(sessionId: string, command: string) {
    if (!sessionId) {
      throw new AppError('请提供会话 ID', 400, ERROR_CODES.BAD_REQUEST)
    }
    if (!command) {
      throw new AppError('请输入命令', 400, ERROR_CODES.BAD_REQUEST)
    }

    const simulator = learningRepository.getOrCreateSimulator(sessionId)
    const result = simulator.execute(command)
    return {
      command,
      output: result.output,
      error: result.error,
      cwd: simulator.fs.cwd,
      isClear: result.output === '__CLEAR__',
    }
  }

  getTerminalInfo(sessionId: string) {
    const simulator = learningRepository.getOrCreateSimulator(sessionId)
    return {
      sessionId,
      cwd: simulator.fs.cwd,
      exists: true,
    }
  }

  resetTerminal(sessionId: string) {
    learningRepository.removeSimulator(sessionId)
    const simulator = learningRepository.getOrCreateSimulator(sessionId)
    return {
      sessionId,
      cwd: simulator.fs.cwd,
      message: '终端会话已重置',
    }
  }

  getAllStats() {
    return {
      categories: Object.keys(learningRepository.getCategoriesMap()).length,
      commands: Object.keys(learningRepository.getCommandDatabase()).length,
      scenarios: learningRepository.getPracticeScenarios().length,
      tasks: learningRepository.getAllPracticeScenarios().reduce((sum, scenario) => sum + scenario.tasks.length, 0),
      questions: learningRepository.getAllQuestions().length,
    }
  }
}

export const learningService = new LearningService()
