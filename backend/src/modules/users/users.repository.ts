import { UserModel } from '../../models/User'

export class UsersRepository {
  private userModel = new UserModel()

  findAll(page?: number, limit?: number, search?: string) {
    return this.userModel.findAllPaginated(page, limit, search)
  }

  findByUsername(username: string) {
    return this.userModel.findByUsername(username)
  }

  findById(id: number) {
    return this.userModel.findById(id)
  }

  create(data: Parameters<UserModel['create']>[0]) {
    return this.userModel.create(data)
  }

  update(id: number, data: Parameters<UserModel['update']>[1]) {
    return this.userModel.update(id, data)
  }

  updatePassword(id: number, password: string) {
    return this.userModel.updatePassword(id, password)
  }

  delete(id: number) {
    return this.userModel.delete(id)
  }
}
