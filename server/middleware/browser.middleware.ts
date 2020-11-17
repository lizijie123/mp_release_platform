import { getBrowser } from '../../app/utils/browser'
import { Response } from 'express'
import { IRequest, AnyObj } from '../definitionfile/index'

// 记录设备信息中间件
export function browserMiddleware (req: IRequest, res: Response, next: () => void): void {
  if (!req.session.browser) {
    const browser: AnyObj = getBrowser(req)
    Object.assign(req.session, {
      browser,
    })
  }
  next()
}
