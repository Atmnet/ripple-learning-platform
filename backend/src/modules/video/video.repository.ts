import { VideoResourceModel } from '../../models/VideoResource'

export class VideoRepository {
  private videoResourceModel = new VideoResourceModel()

  findAll(category?: string) {
    return this.videoResourceModel.findAll(category)
  }

  findById(id: number) {
    return this.videoResourceModel.findById(id)
  }

  create(data: Parameters<VideoResourceModel['create']>[0]) {
    return this.videoResourceModel.create(data)
  }

  update(id: number, data: Parameters<VideoResourceModel['update']>[1]) {
    return this.videoResourceModel.update(id, data)
  }

  delete(id: number) {
    return this.videoResourceModel.delete(id)
  }

  getCategories() {
    return this.videoResourceModel.getCategories()
  }
}
