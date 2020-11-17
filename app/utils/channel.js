export class Channel {
  constructor (store) {
    this.store = store || null
    this.versions = null
    this.dictionary = [
      // 微信小程序
      'WechatApplet',
      // m站
      'MobileSite',
      // 支付宝
      'Alipay',
    ]

    this._init()
  }

  _init () {
    const { dictionary } = this

    dictionary.forEach(key => {
      this[`is${key}`] = () => this._getVersions()[key]
    })
  }

  _getVersions () {
    if (this.store) {
      return this.store?.state?.browser?.versions || {}
    } else if (!__CLIENT__) {
      return {}
    } else {
      this.store = require('../entry.client').store
      return this.store?.state?.browser?.versions || {}
    }
  }

  isApplet () {
    return this.isWechatApplet()
  }

  isAlibaba () {
    return false
  }

  isWechatApplet () {}
}

export default new Channel()
