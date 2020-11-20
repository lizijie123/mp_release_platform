import axios from 'axios'
import * as storeConstants from '@store/store_constants'

// 判断目标页面是否需要登录，需要则跳转登录页面
export const checkLogin = async (to, from, next, store) => {
  const needLogin = to?.meta?.login
  if (needLogin) {
    if (store?.state?.infoMember?.online) {
      next()
    } else {
      return next(`/login?backUrl=${encodeURIComponent(to.fullPath)}`)
    }
  } else {
    next()
  }
}

// 进入下一个页面时，取消当前页面发出但未接受到响应的所有请求
export const cancelCurrentRest = (to, from, next, store) => {
  const { CancelToken } = axios
  store.state[storeConstants.UPDATESOURCE].cancel && store.state[storeConstants.UPDATESOURCE].cancel()
  store.commit(storeConstants.UPDATESOURCE, { source: CancelToken.source() })

  if (next) next()
}

// 记录上一页面路由对象
export const recordPreRoute = (to, from, next, store) => {
  store.commit(storeConstants.PRE_ROUTE, {
    [storeConstants.PRE_ROUTE]: from,
  })
  if (next) next()
}

// 路由前置守卫
const routerBeforeEach = (router, store) => {
  // 所有需要执行的前置守卫数组
  const routerBeforeEachs = [
    checkLogin,
    cancelCurrentRest,
    recordPreRoute,
  ]

  routerBeforeEachs.map(fun => {
    router.beforeEach((to, from, next) => {
      fun(to, from, next, store)
    })
  })
}

export default routerBeforeEach
