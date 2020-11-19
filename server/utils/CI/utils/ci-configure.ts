const ciConfigure = {
  maxTimeout: 1000 * 60 * 60,
  lzj_wechat: {
    // 小程序appID
    appId: 'wxe10f1d56da44430f',
    // 应用类型 miniProgram/miniProgramPlugin/miniGame/miniGamePlugin
    type: 'miniProgram',
    // 项目下载地址
    // github地址: `https://github.com:${用户名，我的用户名是 lizijie123}/${代码仓库名，文档代码仓是 uni-mp-study}`
    // v3版本 gitlab地址: `${gitlab地址}/${用户名}/${代码仓库名}/repository/archive.zip`
    // v4版本 gitlab地址: `${gitlab地址}/api/v4/projects/${代码仓库id}/repository/archive`
    // tips: `${gitlab地址}/api/v3/projects`有返回值即为v3版本gitlab，`${gitlab地址}/api/v4/projects`有返回值即为v4版本gitlab，返回的数据中id字段就是代码仓库的id
    storeDownloadPath: 'https://github.com:lizijie123/uni-mp-study',
    // gitlab项目，则需要设置gitlab的privateToken，在gitlab个人中心可以拿到
    privateToken: '',
    // 小程序打包构建命令
    buildCommand: 'npm run build:wx',
    // 小程序打包构建完，输出目录与根目录的相对位置
    buildProjectChildrenPath: '/dist/build/mp-weixin',
    // 微信小程序与支付宝小程序需要非对称加密的私钥，privateKeyPath是私钥文件相对根目录的地址，在微信公众平台中拿到
    privateKeyPath: '/server/utils/CI/private/lzj-wechat.key',
    setting: {
      es7: false,
      minify: false,
      autoPrefixWXSS: false,
    },
  },
  lzj_alipay: {
    // 同上
    appId: '2021002107681948',
    // 工具id，支付宝小程序设置了非对称加密的公钥后会生成
    toolId: 'b6465befb0a24cbe9b9cf49b4e3b8893',
    // 同上
    storeDownloadPath: 'https://github.com:lizijie123/uni-mp-study',
    // gitlab项目，则需要设置gitlab的privateToken
    privateToken: '',
    // 同上
    buildCommand: 'npm run build:ap',
    // 同上
    buildProjectChildrenPath: '/dist/build/mp-alipay',
    // 同上
    privateKeyPath: '/server/utils/CI/private/lzj-alipay.key',
  },
  lzj_toutiao: {
    // 字节跳动小程序账号
    account: '',
    // 字节跳动小程序密码
    password: '',
    // 同上
    storeDownloadPath: 'https://github.com:lizijie123/uni-mp-study',
    // 同上
    privateToken: '',
    // 同上
    buildCommand: 'npm run build:tt',
    // 同上
    buildProjectChildrenPath: '/dist/build/mp-toutiao',
  },
}

export default ciConfigure
