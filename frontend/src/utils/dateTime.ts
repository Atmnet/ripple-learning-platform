const DATE_TIME_RE = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/

export const formatDateTimeText = (value: unknown): string => {
  if (!value) return '-'

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '-'
    return value.toLocaleString('zh-CN')
  }

  const raw = String(value)
  const matched = raw.match(DATE_TIME_RE)
  if (matched) {
    const [, year, month, day, hour, minute, second = '00'] = matched
    return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`
  }

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return raw

  return parsed.toLocaleString('zh-CN')
}

export const parseDateTimeForCompare = (value: unknown): Date | null => {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const raw = String(value)
  const matched = raw.match(DATE_TIME_RE)
  if (matched) {
    const [, year, month, day, hour, minute, second = '00'] = matched
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )
  }

  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
