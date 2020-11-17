import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({
  tableName: 'task',
  timestamps: false,
  freezeTableName: true,
})
class Task extends Model<Task> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    comment: '任务ID',
  })
  id: string

  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: '发起用户的id',
  })
  userId: string

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '小程序类型'
  })
  type

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '版本号',
  })
  version: string

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'master',
    comment: '分支',
  })
  branch: string

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    comment:'描述',
  })
  desc: string

  @Column({
    type:DataType.STRING(50),
    allowNull: false,
    comment: '状态',
  })
  status

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: '创建时间',
  })
  createTime

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: '最后一次修改时间',
  })
  updateTime

  @Column({
    type: DataType.STRING(1000),
    allowNull: true,
    comment: '错误信息',
  })
  errorMessage

  @Column({
    type: DataType.STRING(10000),
    allowNull: true,
    comment: '日志信息',
  })
  journal

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    comment: '体验版二维码',
  })
  qrCodeUrl
}

export default Task
