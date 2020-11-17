import { Sequelize, ModelCtor } from 'sequelize-typescript'
import { QueryTypes } from 'sequelize'
import configure from '../../lib/configure'
import User from './model/user'
import Task from './model/task'
import * as dayjs from 'dayjs'
import * as uuid from 'uuid'

class DataBaseManger {
  sequelize: Sequelize
  model: {
    User?: User,
    Task?: Task
  }

  constructor () {
    this.model = {}
    this.init()
  }

  // 初始化
  init (): void {
    this.initSequelize()
    this.initModel()
    this.authenticate()
  }

  // 初始化数据库连接对象
  initSequelize (): void {
    this.sequelize = new Sequelize(configure.mysql.database, configure.mysql.user, configure.mysql.password || null, {
      host: configure.mysql.host,
      port: configure.mysql.port,
      dialect: 'mysql',
      pool: {
        max: configure.mysql.connectionLimit,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      timezone: '+08:00',
      logging: process.env.NODE_ENV === 'development',
    })
  }

  // 初始化模型
  initModel (): void {
    const models = [
      User,
      Task,
    ]

    const model: Array<ModelCtor> = models.reduce((previous, model) => {
      setTimeout(() => {
        model.sync({ alter: true }).then(() => {
          if (model.name === 'User') this.initAdmin()
        })
      }, 4)
      this.model[model.name] = model
      previous.push(<ModelCtor>model)
      return previous
    }, [])

    this.sequelize.addModels(model)
  }

  // 初始化超级管理员账号
  async initAdmin (): Promise<void> {
    const hasAdmin = await this.hasAdmin()
    !hasAdmin && this.createAdmin()
  }

  // 判断超级管理员账号是否存在
  async hasAdmin (): Promise<boolean> {
    const sql = `
      SELECT 1 FROM user
      WHERE account = :account
    `
    const has: number = (await this.sequelize.query(sql, {
      replacements: {
        account: 'admin',
      },
      type: QueryTypes.SELECT,
    })).length
    return !!has
  }

  // 创建超级管理员账号
  async createAdmin (): Promise<void> {
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
    const nowTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
    await this.sequelize.query(sql, {
      replacements: {
        id: uuid.v4(),
        account: 'admin',
        password: '123456',
        name: '超级管理员',
        avatar: null,
        createTime: nowTime,
        updateTime: nowTime,
        introduce: '超级管理员账号',
        role: 0,
        identification: 1
      },
      type: QueryTypes.INSERT
    })
  }

  // 连接数据库
  async authenticate () {
    try {
      await this.sequelize.authenticate()
      console.log('数据库已连接')
    } catch (err) {
      console.log('数据库连接失败')
      console.error(err)
      throw err
    }
  }
}

export default new DataBaseManger()
