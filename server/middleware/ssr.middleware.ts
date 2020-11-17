import * as fs from 'fs'
import ENV from '../utils/constants'
import { Response } from 'express'
import { IRequest } from '../definitionfile/index'
import * as vueServerRenderer from 'vue-server-renderer'
import { NestExpressApplication } from '@nestjs/platform-express'

// 服务端渲染中间件
export function ssrMiddleware (app: NestExpressApplication): (req: IRequest, res: Response, next: () => void) => void {
  let renderer
  let readyPromise

  // 生成renderer函数
  const createRenderer = (bundle, options) => {
    return vueServerRenderer.createBundleRenderer(bundle, Object.assign(options, {
      // cache: new LRU({
      //   max: 1000,
      //   maxAge: 1000 * 60 * 15
      // }),
      basedir: ENV.PATHS.CLIENT_OUTPUT,
      runInNewContext: false
    }))
  }

  // 首屏渲染
  const render = (req: IRequest, res: Response, next: () => void): void => {
    const s = Date.now()

    const context = {
      url: req.url,
      browser: req.session.browser,
      apiRefer: req.session.api_refer,
      appVersion: req.session.app_version,
      authToken: req.session?.infoMember?.auth_token,
    }

    if (req.query.showConsole) {
      Object.assign(context, {
        showConsole: true,
      })
    }

    if (req.session.infoMember) {
      const infoMember = {...req.session.infoMember}
      Reflect.deleteProperty(infoMember, 'auth_token')
      Object.assign(context, {
        infoMember,
      })
    }

    if (req.headers.cookie) {
      Object.assign(context, {
        cookie: req.headers.cookie,
      })
    }

    renderer.renderToString(context, (err, html) => {
      if (err) {
        try {
          let { message } = err
          message = JSON.parse(message)
          if (message.code === 302 && message.originPage === '/404') {
            return res.send({
              error_code: 1,
              error_msg: '404',
              result: {},
            })
          } else if (message.code === 401 && message.originPage === '/login') {
            return res.redirect(message.originPage)
          }
          return next()
        } catch (e) {
          return next()
        }
      }
      res.setHeader('Content-type', 'text/html')
      res.send(html)
      if (process.env.NODE_ENV === 'development') {
        console.log(`服务端渲染首页耗时: ${Date.now() - s}ms`)
      }
    })
  }

  if (process.env.NOT_HOT === 'true' || process.env.NODE_ENV === 'production') {
    const template = fs.readFileSync(ENV.VUE_SSR_FILE.TEMPLATE, 'utf-8')
    const serverBundle = JSON.parse(fs.readFileSync(ENV.VUE_SSR_FILE.SERVER_BUNDLE, 'utf-8'))
    const clientManifest = JSON.parse(fs.readFileSync(ENV.VUE_SSR_FILE.CLIENT_MAINFEST, 'utf-8'))

    renderer = createRenderer(serverBundle, {
      template,
      clientManifest
    })
  } else {
    readyPromise = require(ENV.VUE_SSR_FILE.SETUP_DEV_SERVER)(
      app,
      ENV.VUE_SSR_FILE.TEMPLATE,
      (bundle, options) => {
        renderer = createRenderer(bundle, options)
      }
    )
  }

  const realSsrMiddleware = (req: IRequest, res: Response, next: () => void): void => {
    if (process.env.NOT_HOT === 'true' || process.env.NODE_ENV === 'production') {
      render(req, res, next)
    } else {
      readyPromise.then(() => {
        render(req, res, next)
      })
    }
  }
  return realSsrMiddleware
}
