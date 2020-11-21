const fs = require('fs')
const path = require('path')

const fixedToRelativePath = pathname => path.join(process.cwd(), pathname)

const configure = {
  domain: 'http://localhost:8088',
  session: {
    name: 'mp_release_platform_connect',
    secret: 'Mp_Release_Platform',
    cookie: {
      maxAge: 1000 * 60 * 60 * 8,
    },
  },
  redisCFG: {
    prefix: 'mp_release_platform_sess:',
    host: 'mp_replease_platform_redis',
    port: 6379,
    db: 8,
  },
  mysql: {
    port: 3306,
    host: 'mp_replease_platform_mysql',
    user: 'mp',
    password: 'mp2020',
    database: 'mp_release_platform',
    connectionLimit: 10,
  },
  encryptConfig: {
    key: 'sdxduerhpcfxuslj',
    iv: 'vfbwacgikomeusip',
    encrypt: true,
  },
}

export const updatePatchConfig = () => {
  try {
    const { NODE_ENV_CONF = '', NODE_ENV = '' } = process.env
    const currentEnvConf = (NODE_ENV !== 'devlopment' && !NODE_ENV_CONF) ? 'production' : NODE_ENV_CONF
    const confPath = currentEnvConf && fixedToRelativePath(`/lib/config/${currentEnvConf}.json`)
    const patchPath = fixedToRelativePath('/lib/config/patch.json')
    if (confPath && fs.existsSync(confPath)) {
      Object.assign(
        configure,
        JSON.parse(fs.readFileSync(confPath, 'utf-8')),
      )
    }
    if (fs.existsSync(patchPath)) {
      Object.assign(
        configure,
        JSON.parse(fs.readFileSync(patchPath, 'utf-8')),
      )
    }
  } catch (error) {
    console.error('项目启动配置加载错误: ', error)
  }
}

updatePatchConfig()

export default configure
