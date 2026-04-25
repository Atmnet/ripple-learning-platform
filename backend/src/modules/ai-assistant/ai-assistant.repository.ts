type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatSession {
  messages: ChatMessage[]
  updatedAt: number
}

export interface DeepSeekResponse {
  error?: {
    message?: string
  }
  message?: string
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const sessionStore = new Map<string, ChatSession>()

export class AiAssistantRepository {
  getSession(sessionId: string): ChatSession | undefined {
    return sessionStore.get(sessionId)
  }

  setSession(sessionId: string, session: ChatSession): void {
    sessionStore.set(sessionId, session)
  }

  deleteSession(sessionId: string): void {
    sessionStore.delete(sessionId)
  }

  getAllSessions(): IterableIterator<[string, ChatSession]> {
    return sessionStore.entries()
  }

  async createChatCompletion(baseUrl: string, apiKey: string, payload: object): Promise<{ response: globalThis.Response; data: DeepSeekResponse }> {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json() as DeepSeekResponse
    return { response, data }
  }
}
