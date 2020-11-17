// 存放常量
import channel from './channel'

// header组件高度，在小程序、app中为0，m站中为46
export const headerHeight = () => (!channel.isApplet() ? 46 : 0)

// 小程序key value字典
export const releaseMap = new Map([
  ['lzj_wechat', 'lizj微信小程序'],
  ['lzj_alipay', 'lizj支付宝小程序'],
])

export default headerHeight
