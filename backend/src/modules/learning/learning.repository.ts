import {
  CATEGORIES,
  COMMAND_DB,
  getCommandsByCategory,
  getCommandByName,
  searchCommands,
} from '../../models/linux/LinuxCommand'
import {
  PRACTICE_SCENARIOS,
  getScenarioById,
  getScenariosByCategory,
  getCategoryStats,
  ALL_PRACTICE_SCENARIOS,
} from '../../models/linux/LinuxPractice'
import {
  getAllQuestions,
  type QuizQuestion,
} from '../../models/linux/LinuxQuiz'
import {
  CommandSimulator,
  getOrCreateSimulator,
  removeSimulator,
} from '../../models/linux/VirtualFileSystem'

export class LearningRepository {
  getCategoriesMap() {
    return CATEGORIES
  }

  getCommandDatabase() {
    return COMMAND_DB
  }

  getCommandsByCategory(category: string) {
    return getCommandsByCategory(category)
  }

  getCommandByName(name: string) {
    return getCommandByName(name)
  }

  searchCommands(query: string) {
    return searchCommands(query)
  }

  getPracticeScenarios() {
    return PRACTICE_SCENARIOS
  }

  getAllPracticeScenarios() {
    return ALL_PRACTICE_SCENARIOS
  }

  getScenarioById(id: number) {
    return getScenarioById(id)
  }

  getScenariosByCategory(category: string) {
    return getScenariosByCategory(category)
  }

  getCategoryStats() {
    return getCategoryStats()
  }

  getAllQuestions(): QuizQuestion[] {
    return getAllQuestions()
  }

  createCommandSimulator() {
    return new CommandSimulator()
  }

  getOrCreateSimulator(sessionId: string) {
    return getOrCreateSimulator(sessionId)
  }

  removeSimulator(sessionId: string) {
    removeSimulator(sessionId)
  }
}
