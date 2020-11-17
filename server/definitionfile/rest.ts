import { AnyObj } from './anyObj'
import { Result } from './result'

export interface RestFun {
  (href: string, params?: AnyObj, config?: AnyObj): Promise<AnyObj | Result> 
}

export interface Rest {
  get: RestFun,
  post: RestFun,
  put: RestFun,
  del: RestFun,
  patch: RestFun,
}