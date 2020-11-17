import dataBaseManger from '../../../db/sequelize'
import { Sequelize } from 'sequelize-typescript'
import { QueryTypes } from 'sequelize'
import * as dayjs from 'dayjs'
import * as uuid from 'uuid'
import { Task } from '../../../db/model/index'

export class TaskService {
  sequelize: Sequelize

  constructor () {
    this.sequelize = dataBaseManger.sequelize
  }

  // 创建记录
  async create ({ userId, type, version, branch, desc, status, errorMessage, journal, qrCodeUrl }): Promise<string> {
    const sql = `
      INSERT INTO task VALUES(
        :id,
        :userId,
        :type,
        :version,
        :branch,
        :desc,
        :status,
        :createTime,
        :updateTime,
        :errorMessage,
        :journal,
        :qrCodeUrl
      )
    `
    const id = uuid.v4()
    const nowTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    await this.sequelize.query(sql, {
      replacements: {
        id,
        userId,
        type,
        version,
        branch,
        desc: desc || '',
        status,
        createTime: nowTime,
        updateTime: nowTime,
        errorMessage: errorMessage || '',
        journal: journal || '',
        qrCodeUrl: qrCodeUrl || '',
      },
      type: QueryTypes.INSERT
    })
    return id
  }

  // 根据id获取记录
  async get (id: string): Promise<Task> {
    const sql = `
      SELECT * FROM
      task INNER JOIN (
        SELECT id as userId, account, name, avatar, identification FROM user
      ) as temp
      WHERE task.userId = temp.userId AND task.id = :id
    `
    const tasks: Array<Task> = await this.sequelize.query(sql, {
      replacements: {
        id,
      },
      type: QueryTypes.SELECT,
    })
    return tasks[0]
  }

  // 根据type获取记录
  async getByType (type: string, initNum = 0, limit = 10): Promise<Array<Task>> {
    const sql = `
      SELECT * FROM
      task INNER JOIN (
        SELECT id as userId, account, name, avatar, identification FROM user
      ) as temp
      WHERE task.userId = temp.userId AND task.type = :type
      ORDER BY task.createTime DESC
      LIMIT :initNum,:limit
    `
    const tasks: Array<Task> = await this.sequelize.query(sql, {
      replacements: {
        type,
        initNum,
        limit,
      },
      type: QueryTypes.SELECT,
    })
    return tasks
  }

  // 根据type获取记录数
  async getNumByType (type: string): Promise<number> {
    const sql = `
      SELECT count(*) as total FROM
      task INNER JOIN (
        SELECT id as userId, account, name, avatar, identification FROM user
      ) as temp
      WHERE task.userId = temp.userId AND task.type = :type
    `
    const taskNum: Array<{ total }> = await this.sequelize.query(sql, {
      replacements: {
        type,
      },
      type: QueryTypes.SELECT,
    })
    return taskNum[0].total
  }

  // 删除记录
  async delete (id: string): Promise<void> {
    const sql = `
      DELETE FROM task
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
  async updata (task: Task): Promise<void> {
    const sql = `
      UPDATE task
      SET userId = :userId,
        type = :type,
        version = :version,
        branch = :branch,
        \`desc\` = :desc,
        \`status\` = :status,
        createTime = :createTime,
        updateTime = :updateTime,
        errorMessage = :errorMessage,
        journal = :journal,
        qrCodeUrl = :qrCodeUrl
      WHERE id = :id
    `
    const nowTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    await this.sequelize.query(sql, {
      replacements: {
        ...task,
        updateTime: nowTime,
      }
    })
  }
}

export default new TaskService()
