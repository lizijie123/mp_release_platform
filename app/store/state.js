import * as storeConstants from './store_constants'

const state = () => ({
  // 当前用户设备信息
  browser: {},
  // 是否显示移动端调试工具
  [storeConstants.SHOWCONSOLE]: false,
  // 存放取消当前页面发出但未接受到响应的所有请求的函数与token
  [storeConstants.UPDATESOURCE]: {
    token: null,
    cancel: null,
  },
  // 用户信息
  infoMember: {
    online: false,
  },
  // 是否处于滑动状态中，用于兼容ios转场动画问题
  isTouchMove: false,
  // 渠道
  apiRefer: '',
  // 版本
  appVersion: '',
  // 用户token(仅在服务端渲染阶段可用，输出至客户端后会被删除)
  authToken: '',
  // 记录前一路由对象
  [storeConstants.PRE_ROUTE]: {},
  // 菜单栏是否展开
  isOpenNav: false,
  // cookie
  cookie: '',
})

export default state
