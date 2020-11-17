import * as storeConstants from '@store/store_constants'
import rest from '@utils/rest'
import createApp from './main'
import application from './application'

export default context => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp()

    router.push(context.url)

    router.onReady(() => {
      // 所有匹配的组件
      const matchedComponents = router.getMatchedComponents(context.url) || []
      if (context.url === '/404?type=redirect') {
        return reject(new Error(JSON.stringify({
          code: 302,
          originPage: '/404',
        })))
      } else if (matchedComponents.length == null || matchedComponents.length === 0) {
        return reject(new Error(JSON.stringify({ code: 404 })))
      }

      rest.setStore(store)

      store.commit(storeConstants.BROWSER, { browser: context.browser })
      store.commit(storeConstants.SHOWCONSOLE, { showConsole: context.showConsole })
      if (context.infoMember) {
        store.commit(storeConstants.INFOMEMBER, { infoMember: context.infoMember })
      }
      if (context.apiRefer) {
        store.commit(storeConstants.API_REFER, { apiRefer: context.apiRefer })
      }
      if (context.appVersion) {
        store.commit(storeConstants.APP_VERSION, { appVersion: context.appVersion })
      }
      if (context.authToken) {
        store.commit(storeConstants.AUTH_TOKEN, { authToken: context.authToken })
      }
      if (context.cookie) {
        store.commit(storeConstants.COOKIE, { [storeConstants.COOKIE]: context.cookie })
      }

      const keepAlive = router.currentRoute?.meta?.keepAlive

      const needLogin = router.currentRoute?.meta?.login && !store?.state?.infoMember?.online

      if (needLogin) {
        store.commit(storeConstants.AUTH_TOKEN, { authToken: '' })
        context.state = store.state
        resolve(app)
      } else {
        Promise.all([
          application.onLaunchServer(store, router, app),
          ...matchedComponents.map(Component => {
            if (Component.onLoad && keepAlive) {
              return Component.onLoad({
                store,
                router,
                route: router.currentRoute,
              })
            }
          }),
          ...matchedComponents.map(Component => {
            // 存在onShow时，主动调用
            if (Component.onShow) {
              return Component.onShow({
                store,
                router,
                route: router.currentRoute,
              })
            }
          }),
        ]).then(() => {
          store.commit(storeConstants.AUTH_TOKEN, { authToken: '' })
          context.state = store.state
          resolve(app)
        }).catch(err => {
          if (err.status === 401) {
            return reject(new Error(JSON.stringify({
              code: 401,
              originPage: '/login',
            })))
          }
          console.log('服务端初始化渲染出错')
          console.log(err)
          reject(err)
        })
      }
    }, reject)
  })
}
