import * as socket from 'socket.io-client'
import { browserNotify } from './browserNotify'
import { releaseMap } from './constants'

export default class Socket {
  constructor (userId, callback = {}) {
    this.socket = socket(`/?userId=${userId}`)
    this.callback = callback
    this._init()
  }

  // 初始化监听事件
  _init () {
    this.createTask()
    this.updataTask()
    this.confirmTask()
    this.previewUpdataTask()
  }

  // 监听创建任务
  createTask () {
    this.socket.on('createTask', msg => {
      const { callback = {} } = this
      const { result = {} } = msg
      callback.createTask && callback.createTask(result)
    })
  }

  // 监听更新任务
  updataTask () {
    this.socket.on('updataTask', msg => {
      const { callback = {} } = this
      const { result = {} } = msg
      callback.updataTask && callback.updataTask(result)
    })
  }

  // 监听完成任务
  confirmTask () {
    this.socket.on('confirmTask', msg => {
      const { result = '' } = msg
      browserNotify({ content: `${releaseMap.get(result)}发布成功` })
    })
  }

  // 监听预览任务
  previewUpdataTask () {
    this.socket.on('previewUpdataTask', msg => {
      const { callback = {} } = this
      const { result = '' } = msg
      callback.updataPreviewTask && callback.updataPreviewTask(result)
    })
  }

  // 断开连接
  disconnect () {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}
