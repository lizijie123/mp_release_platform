import * as utils from './index'
import configure from '../../lib/configure'

// 环境常量
const ENV = {
  PATHS: {
    CLIENT_OUTPUT: utils.fixedToRelativePath('/public/bundle'),
  },
  VUE_SSR_FILE: {
    TEMPLATE: utils.fixedToRelativePath('/view/index.html'),
    SERVER_BUNDLE: utils.fixedToRelativePath('/public/bundle/vue-ssr-server-bundle.json'),
    CLIENT_MAINFEST: utils.fixedToRelativePath('/public/bundle/vue-ssr-client-manifest.json'),
    SETUP_DEV_SERVER: utils.fixedToRelativePath('/build/setup-dev-server.js'),
  },
  jwt: {
    secret: configure.mysql.database,
    maxAge: '8h',
  },
}

export default ENV
