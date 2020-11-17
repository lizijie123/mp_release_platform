import { Controller, Get, Post, Delete, Patch, Req, UseGuards } from '@nestjs/common'
import { IRequest, Result } from '../../definitionfile/index'
import { UserService } from './user.service'
import * as utils from '../../utils/index'
import { User } from '../../db/model/index'
import { AuthService } from '../auth/auth.service'
import { AuthGuard } from '@nestjs/passport'

@Controller('user')
export class UserController {
  constructor (private readonly userService: UserService, private readonly authService: AuthService) {}

  // 注册
  @Post('register')
  async register (@Req() req: IRequest): Promise<string | Result> {
    const { account, password, name, avatar, introduce, role, identification } = req.body
    // 晚点改为装饰器统一处理
    if (!account || !password) {
      return {
        error_code: 1,
        error_msg: '参数不正确',
        result: {}
      }
    }
    const user: User = await this.userService.getByAccount(String(account))
    if (user) {
      return utils.encrypt({
        error_code: 1,
        error_msg: '用户已存在',
        result: {}
      })
    }
    await this.userService.create({
      account,
      password,
      name,
      avatar, 
      introduce,
      role,
      identification
    })
    return utils.encrypt({
      error_code: 0,
      error_msg: '',
      result: {
        success: true,
      }
    })
  }

  // 删除用户
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete')
  async delete (@Req() req: IRequest): Promise<string | Result> {
    const { id } = req.body
    if (!id) {
      return utils.encrypt({
        error_code: 1,
        error_msg: '参数不正确',
        result: {}
      })
    }
    const user = await this.userService.get(String(id))
    if (String(id) === req.session?.infoMember?.id) {
      return utils.encrypt({
        error_code: 2,
        error_msg: '不可删除自己',
        result: {}
      })
    }
    if (user.account === 'admin') {
      return utils.encrypt({
        error_code: 3,
        error_msg: '超级管理员不可被删除',
        result: {}
      })
    }
    await this.userService.delete(String(id))
    return utils.encrypt({
      error_code: 0,
      error_msg: '',
      result: {
        success: true,
      }
    })
  }

  // 登录
  @Get('login')
  async login (@Req() req: IRequest): Promise<string | Result> {
    const { account, password } = req.query

    if (!account || !password) {
      return utils.encrypt({
        error_code: 1,
        error_msg: '参数不正确',
        result: {}
      })
    }

    const validateRes: Result = await this.authService.validateUser(String(account), String(password))
    if (validateRes.error_code && validateRes.error_code !== 0) {
      return utils.encrypt(validateRes)
    } else {
      const certificateRes = await this.authService.certificate(<User>validateRes.result)
      if (certificateRes.error_code && certificateRes.error_code !== 0) {
        return utils.encrypt(certificateRes)
      } else {
        req.session.infoMember = this.userService.sendInfoMember(certificateRes).result
        return utils.encrypt(this.userService.sendInfoMember(certificateRes))
      }
    }
  }

  // 退出登录
  @Post('logout')
  async logout (@Req() req: IRequest): Promise<string | Result> {
    req.session.infoMember = { online: false }
    return utils.encrypt({
      error_code: 0,
      error_msg: '',
      result: {
        online: false,
      }
    })
  }

  // 获取用户信息
  @UseGuards(AuthGuard('jwt'))
  @Get('account')
  async account (@Req() req: IRequest): Promise<string | Result> {
    const user = req.user
    if (req.session?.infoMember?.auth_token) {
      Object.assign(user, {
        auth_token: req.session.infoMember.auth_token,
      })
    }
    return utils.encrypt(this.userService.sendInfoMember({
      error_code: 0,
      error_msg: '',
      result: user,
    }))
  }

  // 获取所有用户
  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async all (@Req() req: IRequest): Promise<string | Result> {
    const { page, limit } = req.query
    const users: Array<User> = await this.userService.getAll(page ? ((Number.parseInt(String(page), 10) - 1) * 10) : 0, limit ? Number.parseInt(String(limit), 10) : 10)
    const total: number = await this.userService.getAllNum()
    return utils.encrypt({
      error_code: 0,
      error_msg: '',
      result: {
        users,
        total,
      }
    })
  }

  // 修改密码或昵称
  @UseGuards(AuthGuard('jwt'))
  @Patch('change_password_name')
  async changePassword (@Req() req: IRequest): Promise<string | Result> {
    const { name, password } = req.body
    const { id } = req.session?.infoMember
    if (!name && !password) {
      return utils.encrypt({
        error_code: 1,
        error_msg: '参数不正确',
        result: {}
      })
    }
    let user: User = await this.userService.get(String(id))
    if (name) {
      Object.assign(user, {
        name,
      })
    }
    if (password) {
      Object.assign(user, {
        password,
      })
    }
    await this.userService.updata(user)
    user = await this.userService.get(String(id))
    return utils.encrypt(this.userService.sendInfoMember({
      error_code: 0,
      error_msg: '',
      result: user
    }))
  }

  // 修改用户角色
  @UseGuards(AuthGuard('jwt'))
  @Patch('change_role')
  async changeRole (@Req() req: IRequest): Promise<string | Result> {
    const { role, id } = req.body
    if (!role) {
      return utils.encrypt({
        error_code: 1,
        error_msg: '参数不正确',
        result: {}
      })
    }
    let user: User = await this.userService.get(String(id))
    await this.userService.updata(Object.assign(user, {
      role,
    }))
    user = await this.userService.get(String(id))
    return utils.encrypt(this.userService.sendInfoMember({
      error_code: 0,
      error_msg: '',
      result: user
    }))
  }
}
