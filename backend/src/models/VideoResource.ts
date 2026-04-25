import pool from '../config/database'

export interface VideoResource {
  id: number
  title: string
  category: string
  description?: string | null
  embed_url: string
  source_name?: string | null
  duration_text?: string | null
  tags?: string | null
  created_by: number
  created_at: string
  updated_at: string
}

export class VideoResourceModel {
  async findAll(category?: string): Promise<VideoResource[]> {
    let query = `
      SELECT vr.*, u.real_name AS created_by_name
      FROM video_resources vr
      LEFT JOIN users u ON vr.created_by = u.id
    `
    const params: string[] = []

    if (category) {
      query += ' WHERE vr.category = ?'
      params.push(category)
    }

    query += ' ORDER BY vr.created_at DESC'

    const [rows] = await pool.execute(query, params as any) as any[]
    return rows
  }

  async findById(id: number): Promise<VideoResource | null> {
    const [rows] = await pool.execute(
      `
        SELECT vr.*, u.real_name AS created_by_name
        FROM video_resources vr
        LEFT JOIN users u ON vr.created_by = u.id
        WHERE vr.id = ?
      `,
      [id]
    ) as any[]

    return rows[0] || null
  }

  async create(data: Omit<VideoResource, 'id' | 'created_at' | 'updated_at'>): Promise<VideoResource> {
    const [result] = await pool.execute(
      `
        INSERT INTO video_resources (
          title, category, description, embed_url, source_name, duration_text, tags, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.title,
        data.category,
        data.description ?? null,
        data.embed_url,
        data.source_name ?? null,
        data.duration_text ?? null,
        data.tags ?? null,
        data.created_by
      ] as any
    ) as any

    return this.findById(result.insertId) as Promise<VideoResource>
  }

  async update(id: number, data: Partial<VideoResource>): Promise<VideoResource | null> {
    const fields: string[] = []
    const values: Array<string | number | null> = []

    if (data.title !== undefined) {
      fields.push('title = ?')
      values.push(data.title)
    }
    if (data.category !== undefined) {
      fields.push('category = ?')
      values.push(data.category)
    }
    if (data.description !== undefined) {
      fields.push('description = ?')
      values.push(data.description ?? null)
    }
    if (data.embed_url !== undefined) {
      fields.push('embed_url = ?')
      values.push(data.embed_url)
    }
    if (data.source_name !== undefined) {
      fields.push('source_name = ?')
      values.push(data.source_name ?? null)
    }
    if (data.duration_text !== undefined) {
      fields.push('duration_text = ?')
      values.push(data.duration_text ?? null)
    }
    if (data.tags !== undefined) {
      fields.push('tags = ?')
      values.push(data.tags ?? null)
    }

    if (fields.length > 0) {
      values.push(id)
      await pool.execute(
        `UPDATE video_resources SET ${fields.join(', ')} WHERE id = ?`,
        values as any
      )
    }

    return this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM video_resources WHERE id = ?',
      [id]
    ) as any

    return result.affectedRows > 0
  }

  async getCategories(): Promise<string[]> {
    const [rows] = await pool.execute(
      'SELECT DISTINCT category FROM video_resources ORDER BY category ASC'
    ) as any[]

    return rows.map((row: any) => row.category)
  }
}
