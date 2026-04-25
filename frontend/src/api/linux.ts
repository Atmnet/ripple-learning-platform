/**
 * Linux Learning API
 * API functions for Linux command learning, practice, and quiz
 */

import api from './index'

// ============ Types ============

export interface Category {
  key: string
  name: string
  description: string
  icon: string
}

export interface Command {
  name: string
  description: string
  longDesc?: string
  category: string
  syntax: string
  options?: Array<{
    option: string
    description: string
  }>
  examples?: Array<{
    cmd: string
    desc: string
  }>
  usageScenarios?: string[]
  related?: string[]
  tips?: string
  note?: string
}

export interface Scenario {
  id: number
  title: string
  description: string
  difficulty: string
  category: string
  taskCount: number
}

export interface Task {
  prompt: string
  hint: string
  category: string
}

export interface TaskValidationResult {
  isCorrect: boolean
  message: string
  explanation: string
  hint: string
}

export interface QuizQuestion {
  id: number
  type: 'choice' | 'truefalse' | 'fill'
  question: string
  category: string
  options?: string[]
}

export interface QuizAnswerResult {
  isCorrect: boolean
  correctAnswer: string | number | boolean | string[]
  explanation: string
}

// ============ Category & Command APIs ============

export function getCategories() {
  return api.get('/linux/categories')
}

export function getCommandsByCategory(category: string) {
  return api.get(`/linux/commands/${category}`)
}

export function getCommandDetail(name: string) {
  return api.get(`/linux/command/${name}`)
}

export function searchCommands(query: string) {
  return api.get('/linux/search', { params: { q: query } })
}

// ============ Practice APIs ============

export function getScenarios(category?: string) {
  return api.get('/linux/scenarios', { params: category ? { category } : {} })
}

export function getScenarioDetail(id: number) {
  return api.get(`/linux/scenario/${id}`)
}

export function getTaskDetail(id: number, taskIndex: number) {
  return api.get(`/linux/scenario/${id}/task/${taskIndex}`)
}

export function initPractice(scenarioId: number) {
  return api.post('/linux/practice/init', { scenarioId })
}

export function executePracticeCommand(sessionId: string, command: string) {
  return api.post('/linux/practice/exec', { sessionId, command })
}

export function validateTaskAnswer(
  id: number,
  taskIndex: number,
  sessionId: string,
  command: string
) {
  return api.post(`/linux/scenario/${id}/task/${taskIndex}/validate`, {
    sessionId,
    command,
  })
}

export function nextTask(sessionId: string) {
  return api.post('/linux/practice/next-task', { sessionId })
}

export function getPracticeStats() {
  return api.get('/linux/practice/stats')
}

// ============ Quiz APIs ============

export function getQuizQuestions(params?: { count?: number | 'all'; category?: string; type?: string }) {
  return api.get('/linux/quiz/questions', { params })
}

export function submitQuizAnswer(questionId: number, answer: string | number | boolean) {
  return api.post('/linux/quiz/answer', { questionId, answer })
}

export function getQuizStats() {
  return api.get('/linux/quiz/stats')
}

// ============ Stats API ============

export function getLinuxStats() {
  return api.get('/linux/stats')
}
