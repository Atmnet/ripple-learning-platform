import { RowDataPacket, ResultSetHeader } from 'mysql2/promise'

// 数据库查询结果类型
export type DbResult = RowDataPacket[]
export type DbInsertResult = ResultSetHeader

// 通用数据库响应类型
export interface QueryResult<T> {
  data: T[]
  total: number
}
