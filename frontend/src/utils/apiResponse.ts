export interface ListPayload<T> {
  data: T[]
  total: number
}

export const normalizeListPayload = <T = any>(payload: unknown): ListPayload<T> => {
  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      total: payload.length
    }
  }

  if (payload && typeof payload === 'object') {
    const value = payload as { data?: unknown; total?: unknown }
    const data = Array.isArray(value.data) ? value.data as T[] : []
    const total = typeof value.total === 'number' ? value.total : data.length

    return { data, total }
  }

  return { data: [], total: 0 }
}
