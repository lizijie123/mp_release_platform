import { Request } from 'express'
import { AnyObj } from './anyObj'
import { Rest } from './rest'

// 扩展Request对象
export interface IRequest extends Request {
  session: AnyObj,
  rest: Rest,
}