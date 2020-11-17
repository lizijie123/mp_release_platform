import { Injectable } from '@nestjs/common'
import dataBaseManger from '../../db/sequelize'
import { Sequelize } from 'sequelize-typescript'
import { QueryTypes } from 'sequelize'
import * as dayjs from 'dayjs'
import * as uuid from 'uuid'
import { User } from '../../db/model/index'
import { Result } from '../../definitionfile/index'

@Injectable()
export class UserService {
  sequelize: Sequelize

  constructor () {
    this.sequelize = dataBaseManger.sequelize
  }

  // 格式化用户信息返回值
  sendInfoMember (result: Result): Result {
    if (!result.result) return result
    const _result = {
      ...result,
      result: {
        ...result.result,
        online: Reflect.has(result.result, 'auth_token'),
      }
    }
    return _result
  }

  // 创建记录
  async create ({ account, password, name, avatar, introduce, role, identification }): Promise<string> {
    const sql = `
      INSERT INTO user VALUES(
        :id,
        :account,
        :password,
        :name,
        :avatar,
        :createTime,
        :updateTime,
        :introduce,
        :role,
        :identification
      )
    `
    const id = uuid.v4()
    const nowTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    await this.sequelize.query(sql, {
      replacements: {
        id,
        account,
        password,
        name: name || account,
        avatar: avatar || '',
        createTime: nowTime,
        updateTime: nowTime,
        introduce: introduce || '',
        role: role || 3,
        identification,
      },
      type: QueryTypes.INSERT
    })
    return id
  }

  // 获取所有记录
  async getAll (initNum = 0, limit = 10): Promise<Array<User>> {
    const sql = `
      SELECT * FROM user
      ORDER BY createTime DESC
      LIMIT :initNum,:limit
    `
    const users: Array<User> = await this.sequelize.query(sql, {
      replacements: {
        initNum,
        limit,
      },
      type: QueryTypes.SELECT,
    })
    return users
  }

  // 获取所有记录数
  async getAllNum (): Promise<number> {
    const sql = `
      SELECT count(*) as total FROM user
    `
    const taskNum: Array<{ total }> = await this.sequelize.query(sql, {
      type: QueryTypes.SELECT,
    })
    return taskNum[0].total
  }

  // 根据id获取记录
  async get (id: string): Promise<User> {
    const sql = `
      SELECT * FROM user
      WHERE id = :id
    `
    const users: Array<User> = await this.sequelize.query(sql, {
      replacements: {
        id,
      },
      type: QueryTypes.SELECT,
    })
    return users[0]
  }

  // 根据用户名与密码获取记录
  async getByAccount (account: string): Promise<User> {
    const sql = `
      SELECT * FROM user
      WHERE account = :account
    `
    const users: Array<User> = await this.sequelize.query(sql, {
      replacements: {
        account,
      },
      type: QueryTypes.SELECT,
    })
    return users[0]
  }

  // 删除记录
  async delete (id: string): Promise<void> {
    const sql = `
      DELETE FROM user
      WHERE id = :id
    `
    await this.sequelize.query(sql, {
      replacements: {
        id,
      },
      type: QueryTypes.DELETE,
    })
  }

  // 修改记录
  async updata (user: User): Promise<void> {
    const sql = `
      UPDATE user
      SET account = :account,
        password = :password,
        name = :name,
        avatar = :avatar,
        createTime = :createTime,
        updateTime = :updateTime,
        introduce = :introduce,
        role = :role,
        identification = :identification
      WHERE id = :id
    `
    const nowTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    await this.sequelize.query(sql, {
      replacements: {
        ...user,
        updateTime: nowTime,
      }
    })
  }
}
