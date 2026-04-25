import pool from '../config/database'

export interface Document {
  id: number
  title: string
  category: string
  file_url: string
  description?: string
  uploaded_by: number
  created_at: Date
  updated_at: Date
}

export class DocumentModel {
  async create(documentData: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const [result] = await pool.execute(
      'INSERT INTO documents (title, category, file_url, description, uploaded_by) VALUES (?, ?, ?, ?, ?)',
      [documentData.title, documentData.category, documentData.file_url, documentData.description ?? null, documentData.uploaded_by] as any
    ) as any

    const [rows] = await pool.execute(
      'SELECT d.*, u.real_name as uploaded_by_name FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id WHERE d.id = ?',
      [result.insertId]
    ) as any[]

    return rows[0]
  }

  async findAll(category?: string): Promise<Document[]> {
    let query = `SELECT d.*, u.real_name as uploaded_by_name FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id`
    const params: (string | number)[] = []

    if (category) {
      query += ' WHERE d.category = ?'
      params.push(category)
    }

    query += ' ORDER BY d.created_at DESC'

    const [rows] = await pool.execute(query, params as any) as any[]
    return rows
  }

  async findById(id: number): Promise<Document | null> {
    const [rows] = await pool.execute(
      'SELECT d.*, u.real_name as uploaded_by_name FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id WHERE d.id = ?',
      [id]
    ) as any[]

    return rows[0] || null
  }

  async update(id: number, documentData: Partial<Document>): Promise<Document | null> {
    const fields: string[] = []
    const values: (string | number | null)[] = []

    if (documentData.title) {
      fields.push('title = ?')
      values.push(documentData.title)
    }
    if (documentData.category) {
      fields.push('category = ?')
      values.push(documentData.category)
    }
    if (documentData.file_url !== undefined) {
      fields.push('file_url = ?')
      values.push(documentData.file_url ?? null)
    }
    if (documentData.description !== undefined) {
      fields.push('description = ?')
      values.push(documentData.description ?? null)
    }

    if (fields.length > 0) {
      values.push(id)
      await pool.execute(
        `UPDATE documents SET ${fields.join(', ')} WHERE id = ?`,
        values as any
      )
    }

    return this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM documents WHERE id = ?',
      [id]
    ) as any

    return result.affectedRows > 0
  }

  async getCategories(): Promise<string[]> {
    const [rows] = await pool.execute(
      'SELECT DISTINCT category FROM documents ORDER BY category'
    ) as any[]

    return rows.map((row: any) => row.category)
  }
}
