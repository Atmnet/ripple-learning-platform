import { DocumentModel } from '../../models/Document'

export class DocumentRepository {
  private documentModel = new DocumentModel()

  findAll(category?: string) {
    return this.documentModel.findAll(category)
  }

  findById(id: number) {
    return this.documentModel.findById(id)
  }

  create(data: Parameters<DocumentModel['create']>[0]) {
    return this.documentModel.create(data)
  }

  update(id: number, data: Parameters<DocumentModel['update']>[1]) {
    return this.documentModel.update(id, data)
  }

  delete(id: number) {
    return this.documentModel.delete(id)
  }
}
