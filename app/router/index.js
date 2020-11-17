import Vue from 'vue'
import Router from 'vue-router'
import * as storeConstants from '@store/store_constants'

import layout from './layout'
import login from './login'
import page404 from './404'

// 重写Router原型上的push、replace、go函数
const routerFnArr = ['push', 'replace', 'go']

routerFnArr.map(item => {
  Router.prototype[item] = (fnName => {
    if (__SERVER__) return fnName
    const newFnName = function newFnName (...rest) {
      const { store } = require('../entry.client')
      store.commit(storeConstants.ISTOUCHMOVE, {
        isTouchMove: false,
      })
      // 无上一路由时不执行go，直接重定向至首页
      if (item === 'go') {
        const preRoute = store.state[storeConstants.PRE_ROUTE]
        if (!preRoute?.path) {
          return this.replace('/')
        }
      }
      const res = fnName.apply(this, rest)
      if (res?.catch) {
        res.catch(err => err)
      }
      return res
    }
    return newFnName
  })(Router.prototype[item])
})

Vue.use(Router)

function createRouter () {
  const routes = [
    ...layout,
    ...login,
    ...page404,
  ]
  if (__CLIENT__) {
    routes.push({
      path: '*',
      redirect: '/404',
    })
  }
  const RouterModel = new Router({
    mode: 'history',
    routes,
  })

  return RouterModel
}

export default createRouter
