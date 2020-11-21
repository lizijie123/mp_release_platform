import * as os from 'os'
import * as path from 'path'
import * as redis from 'redis'
import * as express from 'express'
import { AppModule } from './app.module'
import * as session from 'express-session'
import * as cookieParser from 'cookie-parser'
import * as connectRedis from 'connect-redis'
import { NestFactory } from '@nestjs/core'
import configure from '../lib/configure'
import { NestExpressApplication, ExpressAdapter } from '@nestjs/platform-express'
import { ssrMiddleware } from './middleware/ssr.middleware'
import { browserMiddleware } from './middleware/browser.middleware'
import { envMiddleware } from './middleware/env.middleware'
import { restMiddleware } from './middleware/rest.middleware'

const getIp = () => {
  const networkInterfaces = os.networkInterfaces()
  let ip = '127.0.0.1'
  for (const [key, value] of Object.entries(networkInterfaces)) {
    value.map(detail => {
      if (detail.family == 'IPv4' && key == 'en0') {
        ip = detail.address
        return false
      }
    })
  }
  return ip
}

async function bootstrap(): Promise<void> {
  const server: express.Express = express()
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule, new ExpressAdapter(server))

  app.useStaticAssets(path.join(process.cwd(), '/public/'), {
    prefix: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  app.use(cookieParser())

  const redisStore = connectRedis(session)
  app.use(session({
    name: configure.session.secret,
    store: new redisStore({ client: redis.createClient(Object.assign({}, configure.redisCFG, {
      prefix: configure.redisCFG.prefix + 'sess:',
    })) }),
    secret: configure.session.secret,
    cookie: configure.session.cookie,
    saveUninitialized: true,
    resave: false
  }))

  app.use(restMiddleware)
  app.use(browserMiddleware)
  app.use(envMiddleware)
  app.use(ssrMiddleware(app))

  await app.init()

  await app.listen(process.env.HTTPPORT)
}
bootstrap().then(() => {
  const ip = getIp()
  if (process.env.NODE_ENV === 'development') {
    console.log(`

    小程序发布平台 running at:
    - Local:   http://localhost:${process.env.HTTPPORT}
    - Network: http://${ip}:${process.env.HTTPPORT}

  `)
  } else {
    console.log(`

    小程序发布平台 running

    `)
  }
})
