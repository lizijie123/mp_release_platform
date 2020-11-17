import { Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { JwtService } from '@nestjs/jwt'
import { User } from '../../db/model/index'
import { Result } from '../../definitionfile/index'

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UserService, private readonly jwtService: JwtService) {}

  // 校验用户信息
  async validateUser (account: string, password: string): Promise<Result> {
    const user: User = await this.usersService.getByAccount(account)
    if (user) {
      if (user.password === password) {
        return {
          error_code: 0,
          error_msg: '',
          result: user,
        }
      } else {
        return {
          error_code: 1,
          error_msg: '用户名或密码错误',
          result: {}
        }
      }
    }
    return {
      error_code: 1,
      error_msg: '账号不存在',
      result: {}
    }
  }

  // 颁发token
  async certificate (user: User): Promise<Result> {
    try {
      const token = this.jwtService.sign(user)
      return {
        error_code: 0,
        error_msg: '',
        result: {
          ...user,
          auth_token: token,
        }
      }
    } catch (error) {
      return {
        error_code: 1,
        error_msg: error,
        result: {},
      };
    }
  }
}