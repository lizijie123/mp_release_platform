const fs = require('fs')
const path = require('path')
const MFS = require('memory-fs')
const webpack = require('webpack')
const chokidar = require('chokidar')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const clientConfig = require('./webpack.client.config')
const serverConfig = require('./webpack.server.config')

const readFile = (newFs, file) => {
  try {
    return newFs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
  } catch (e) {
    console.log('readFile Error:', e)
  }
}

module.exports = function setupDevServer (app, templatePath, cb) {
  let bundle
  let template
  let clientManifest

  let ready
  const readyPromise = new Promise(r => ready = r)

  // 1. 生成新的renderer函数； 2. renderer.renderToString();
  const update = () => {
    if (bundle && clientManifest) {
      // 异步执行server.js中的render函数
      ready()
      cb(bundle, {
        template,
        clientManifest,
      })
    }
  }

  template = fs.readFileSync(templatePath, 'utf-8')
  // 模板改了之后刷新
  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    console.log('index.html template updated')
    update()
  })
  clientConfig.entry.app = ['webpack-hot-middleware/client', clientConfig.entry.app]
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
  )

  const clientComplier = webpack(clientConfig)
  const devMiddleware = webpackDevMiddleware(clientComplier, {
    publicPath: clientConfig.output.publicPath,
    noInfo: true,
    index: '/',
    logLevel: process.env.LOG_LEVEL || 'silent',
  })
  app.use(devMiddleware)
  clientComplier.hooks.done.tap('BuildStatsPlugin', stats => {
    const statsJson = stats.toJson()
    statsJson.errors.forEach(err => console.log(err))
    statsJson.warnings.forEach(err => console.log(err))
    if (statsJson.errors.length) return
    clientManifest = JSON.parse(readFile(
      devMiddleware.fileSystem,
      'vue-ssr-client-manifest.json',
    ))
    update()
  })
  app.use(webpackHotMiddleware(clientComplier, { heartbeat: 5000 }))

  const serverCompiler = webpack(serverConfig)
  const mfs = new MFS()

  serverCompiler.outputFileSystem = mfs
  // 监听server文件修改
  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err
    const statsJson = stats.toJson()
    if (statsJson.errors.length) return

    bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json'))
    update()
  })

  return readyPromise
}
