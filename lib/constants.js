const utils = require('./utils')

// 环境常量
const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  PRODUCTION: process.env.NODE_ENV === 'production',
  DEVELOPMENT: process.env.NODE_ENV === 'development',
  PATHS: {
    CLIENT_ENTRY: utils.fixedToRelativePath('/app/entry.client.js'),
    SERVER_ENTRY: utils.fixedToRelativePath('/app/entry.server.js'),
    NEST_SERVER_ENTRY: utils.fixedToRelativePath('/server/build.js'),
    CLIENT_OUTPUT: utils.fixedToRelativePath('/public/bundle'),
    SERVER_OUTPUT: utils.fixedToRelativePath('/private/server'),
    PUBLIC_PATH: '/bundle/',
  },
  PUBLIC_SCSS: [
    utils.fixedToRelativePath('/app/assets/scss/function.scss'),
    utils.fixedToRelativePath('/app/assets/scss/variable.scss'),
  ],
  VUE_SSR_FILE: {
    TEMPLATE: utils.fixedToRelativePath('/view/index.html'),
    SERVER_BUNDLE: utils.fixedToRelativePath('/public/bundle/vue-ssr-server-bundle.json'),
    CLIENT_MAINFEST: utils.fixedToRelativePath('/public/bundle/vue-ssr-client-manifest.json'),
    SETUP_DEV_SERVER: utils.fixedToRelativePath('/build/setup-dev-server.js'),
  },
}

module.exports = {
  ENV,
}
