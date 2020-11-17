import { Response } from 'express'
import { IRequest } from '../definitionfile/index'
import rest from '../../app/utils/rest'

// 记录设备信息中间件
export async function envMiddleware (req: IRequest, res: Response, next: () => void): Promise<void> {
  const versions = {
    // 微信小程序
    WechatApplet: false,
    // m站
    MobileSite: false,
    // 小程序
    isMina: false,
  }
  if (req.query.api_env) {
    switch (req.query.api_env) {
      case 'wechat_applet': {
        Object.assign(versions, {
          WechatApplet: true,
          isMina: true,
        })
        break
      }
      case 'mobile_site': {
        Object.assign(versions, {
          MobileSite: true,
        })
        break
      }
      default: {
        Object.assign(versions, {
          MobileSite: true,
        })
      }
    }

    Object.assign(req.session, {
      ...versions,
      api_env: req.query.api_env,
    })
  } else {
    Object.assign(req.session, {
      api_env: 'mobile_site',
    })
    Object.assign(versions, {
      MobileSite: true,
    })
  }

  Object.assign(req.session, {
    api_refer: req.query.api_refer || 'mobile_site'
  })

  if (req.query.app_version) {
    Object.assign(req.session, {
      app_version: req.query.app_version
    })
  }

  Object.assign(req.session.browser.versions, versions)

  rest.setStore({
    state: {
      apiRefer: req.session.api_refer,
      appVersion: req.session.app_version,
      authToken: req.session?.infoMember?.auth_token,
      cookie: req.cookies,
    }
  })

  next()
}
