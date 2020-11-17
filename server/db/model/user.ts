import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({
  tableName: 'user',
  timestamps: false,
  freezeTableName: true,
})
class User extends Model<User> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    comment: '用户ID',
  })
  id: string

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '用户名'
  })
  account: string

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: '密码，保存md5字符串',
  })
  password: string

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    defaultValue: '0.0',
    comment:'昵称',
  })
  name: string

  @Column({
    type:DataType.STRING(100),
    allowNull: true,
    comment: '用户头像',
  })
  avatar

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
    comment: '个人介绍',
  })
  introduce

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 3,
    comment: '用户角色: 0-超级管理员 | 1-管理员 | 2-开发测试&运营 | 3-普通用户(只能查看)'
  })
  role

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    defaultValue: '1',
    comment: '开发者标识'
  })
  identification
}

export default User
