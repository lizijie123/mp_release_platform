import { IRequest, AnyObj, Rest } from '../definitionfile/index'
import { Response } from 'express'
import rest from '../../app/utils/rest'

export function restMiddleware (req: IRequest, res: Response, next: () => void): void {
  if (!req.rest) {
    const reqRest: Rest = {
      get (href: string, params: AnyObj = {}, config: AnyObj = {}) {
        return rest.get(href, params, config)
      },
      post (href: string, params: AnyObj = {}, config: AnyObj = {}) {
        return rest.post(href, params, config)
      },
      put (href: string, params: AnyObj = {}, config: AnyObj = {}) {
        return rest.put(href, params, config)
      },
      del (href: string, params: AnyObj = {}, config: AnyObj = {}) {
        return rest.del(href, params, config)
      },
      patch (href: string, params: AnyObj = {}, config: AnyObj = {}) {
        return rest.patch(href, params, config)
      }
    }

    Object.assign(req, {
      rest: reqRest,
    })
  }

  next()
}
