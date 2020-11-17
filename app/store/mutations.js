import * as storeConstants from './store_constants'

const mutations = {
  // 用户设备信息
  [storeConstants.BROWSER] (state, payload) {
    const newState = {
      browser: payload.browser,
    }
    Object.assign(state, newState)
  },
  // 移动端调试工具
  [storeConstants.SHOWCONSOLE] (state, payload) {
    const newState = {
      [storeConstants.SHOWCONSOLE]: payload.showConsole,
    }
    Object.assign(state, newState)
  },
  // 进入下一个页面时，取消当前页面发出但未接受到响应的所有请求
  [storeConstants.UPDATESOURCE] (state, payload) {
    const newState = {
      [storeConstants.UPDATESOURCE]: payload.source,
    }
    Object.assign(state, newState)
  },
  // 修改用户信息
  [storeConstants.INFOMEMBER] (state, payload) {
    const newState = {
      infoMember: payload.infoMember,
    }
    Object.assign(state, newState)
  },
  // 切换是否处于滑动状态
  [storeConstants.ISTOUCHMOVE] (state, payload) {
    const newState = {
      isTouchMove: payload.isTouchMove,
    }
    Object.assign(state, newState)
  },
  // 保存渠道
  [storeConstants.API_REFER] (state, payload) {
    const newState = {
      apiRefer: payload.apiRefer,
    }
    Object.assign(state, newState)
  },
  // 保存版本
  [storeConstants.APP_VERSION] (state, payload) {
    const newState = {
      appVersion: payload.appVersion,
    }
    Object.assign(state, newState)
  },
  // 保存用户token
  [storeConstants.AUTH_TOKEN] (state, payload) {
    const newState = {
      authToken: payload.authToken,
    }
    Object.assign(state, newState)
  },
  // 记录前一路由对象
  [storeConstants.PRE_ROUTE] (state, payload) {
    const newState = {
      [storeConstants.PRE_ROUTE]: payload[storeConstants.PRE_ROUTE],
    }
    Object.assign(state, newState)
  },
  // 修改菜单栏是否展开
  [storeConstants.IS_OPEN_NAV] (state, payload) {
    const newState = {
      isOpenNav: payload[storeConstants.IS_OPEN_NAV],
    }
    Object.assign(state, newState)
  },
  // 存储cookie
  [storeConstants.COOKIE] (state, payload) {
    const newState = {
      cookie: payload[storeConstants.COOKIE],
    }
    Object.assign(state, newState)
  },
}

export default mutations
