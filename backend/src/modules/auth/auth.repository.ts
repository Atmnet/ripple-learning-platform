import { UserModel } from '../../models/User'

export class AuthRepository {
  private userModel = new UserModel()

  findByUsername(username: string) {
    return this.userModel.findByUsername(username)
  }

  findById(id: number) {
    return this.userModel.findById(id)
  }

  createUser(data: Parameters<UserModel['create']>[0]) {
    return this.userModel.create(data)
  }
}
