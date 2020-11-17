import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Task } from '../../db/model/index'
import { PreviewTask } from '../../definitionfile/index'

@WebSocketGateway()
export class CiGateway {
  @WebSocketServer()
  server: Server;

  constructor() {}

  // socket连接钩子
  async handleConnection(client: Socket): Promise<any> {
    const { userId } = client.handshake.query
    client.join(userId)
    if (process.env.NODE_DEV === 'development') {
      console.log('socket连接钩子')
    }
  }

  // socket断开钩子
  async handleDisconnect(): Promise<any> {
    if (process.env.NODE_DEV === 'development') {
      console.log('socket断开钩子')
    }
  }

  // 推送创建任务
  createTask (task: Task): void {
    this.server.emit('createTask', {
      error_code: 0,
      error_msg: '',
      result: task
    })
  }

  // 推送更新任务
  updataTask (task: Task): void {
    this.server.emit('updataTask', {
      error_code: 0,
      error_msg: '',
      result: task
    })
  }

  // 推送完成任务
  confirmTask (userId: string, miniprogramType: string): void {
    this.server.to(userId).emit('confirmTask', {
      error_code: 0,
      error_msg: '',
      result: miniprogramType,
    })
  }

  // 推送预览更新任务
  previewUpdataTask (userId: string, previewTask: PreviewTask): void {
    this.server.to(userId).emit('previewUpdataTask', {
      error_code: 0,
      error_msg: '',
      result: previewTask
    })
  }
}
