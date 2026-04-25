import { Request, Response } from 'express'
import { AuthRequest } from '../../middleware/auth'
import { sendError, sendSuccess } from '../../shared/utils/response'
import { learningService } from './learning.service'

export function getCategories(_req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.getCategories())
  } catch (error) {
    sendError(res, error)
  }
}

export function getCommandsByCategory(req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.getCommandsByCategory(req.params.category))
  } catch (error) {
    sendError(res, error)
  }
}

export function getCommandDetail(req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.getCommandDetail(req.params.name))
  } catch (error) {
    sendError(res, error)
  }
}

export function searchCommands(req: Request, res: Response): void {
  try {
    const result = learningService.searchCommands(String(req.query.q || ''))
    sendSuccess(res, result.data, { total: result.total })
  } catch (error) {
    sendError(res, error)
  }
}

export function getScenarios(req: Request, res: Response): void {
  try {
    const result = learningService.getScenarios(req.query.category as string | undefined)
    sendSuccess(res, result.data, { total: result.total })
  } catch (error) {
    sendError(res, error)
  }
}

export function getScenarioDetail(req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.getScenarioDetail(parseInt(req.params.id, 10)))
  } catch (error) {
    sendError(res, error)
  }
}

export function getTaskDetail(req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.getTaskDetail(parseInt(req.params.id, 10), parseInt(req.params.taskIndex, 10)))
  } catch (error) {
    sendError(res, error)
  }
}

export function initPractice(req: AuthRequest, res: Response): void {
  try {
    sendSuccess(res, learningService.initPractice(Number(req.body.scenarioId), req.user?.id || 'anonymous'))
  } catch (error) {
    sendError(res, error)
  }
}

export function executePracticeCommand(req: AuthRequest, res: Response): void {
  try {
    sendSuccess(res, learningService.executePracticeCommand(req.body.sessionId, req.body.command))
  } catch (error) {
    sendError(res, error)
  }
}

export function validateTaskAnswer(req: Request, res: Response): void {
  try {
    sendSuccess(
      res,
      learningService.validateTaskAnswer(
        parseInt(req.params.id, 10),
        parseInt(req.params.taskIndex, 10),
        req.body.sessionId,
        req.body.command
      )
    )
  } catch (error) {
    sendError(res, error)
  }
}

export function nextTask(req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.nextTask(req.body.sessionId))
  } catch (error) {
    sendError(res, error)
  }
}

export function getPracticeStats(_req: Request, res: Response): void {
  try {
    const result = learningService.getPracticeStats()
    sendSuccess(res, result.data, {
      totalScenarios: result.totalScenarios,
      totalTasks: result.totalTasks,
    })
  } catch (error) {
    sendError(res, error)
  }
}

export function getQuizQuestions(req: Request, res: Response): void {
  try {
    const result = learningService.getQuizQuestions(
      req.query.count as string | undefined,
      req.query.category as string | undefined,
      req.query.type as string | undefined,
      req.query.all === 'true'
    )
    sendSuccess(res, result.data, { total: result.total })
  } catch (error) {
    sendError(res, error)
  }
}

export function submitQuizAnswer(req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.submitQuizAnswer(Number(req.body.questionId), req.body.answer))
  } catch (error) {
    sendError(res, error)
  }
}

export function getQuizStats(_req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.getQuizStats())
  } catch (error) {
    sendError(res, error)
  }
}

export function initTerminal(_req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.initTerminal())
  } catch (error) {
    sendError(res, error)
  }
}

export function executeTerminalCommand(req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.executeTerminalCommand(req.body.sessionId, req.body.command))
  } catch (error) {
    sendError(res, error)
  }
}

export function getTerminalInfo(req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.getTerminalInfo(req.params.sessionId))
  } catch (error) {
    sendError(res, error)
  }
}

export function resetTerminal(req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.resetTerminal(req.params.sessionId))
  } catch (error) {
    sendError(res, error)
  }
}

export function getAllStats(_req: Request, res: Response): void {
  try {
    sendSuccess(res, learningService.getAllStats())
  } catch (error) {
    sendError(res, error)
  }
}
