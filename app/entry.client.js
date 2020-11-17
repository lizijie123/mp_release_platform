import VConsole from 'vconsole'
import vConsoleDecryptNetworkTab from '@lib/vconsole-decrypt-network-tab/index'
import routerBeforeEach, { checkLogin } from '@router/guard/beforeEach'
import createApp from './main'
import application from './application'

const { app, router, store } = createApp()

if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

if (store.state.SHOWCONSOLE === true) {
  const vConsole = new VConsole({
    defaultPlugins: ['system', 'element', 'storage'],
    maxLogNumber: 5000,
  })
  vConsole.addPlugin(vConsoleDecryptNetworkTab)
}

application.onLaunchClient(store, router, app)

router.onReady(() => {
  {
    const rid = new Date() / 1
    window.history.replaceState({ rid }, null)
    Object.assign(router.currentRoute.meta, {
      historyStateRid: rid,
    })
  }

  router.afterEach((to, from) => {
    if (!window.history?.state?.rid) {
      const rid = new Date() / 1
      window.history.replaceState({ rid }, null)
    }

    Object.assign(to.meta, {
      historyStateRid: window.history.state.rid,
    })

    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)

    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })

    const keepAlive = to?.meta?.keepAlive
    const onLoadIsImplement = to?.meta?.onLoadIsImplement

    const onLoadHooks = activated.map(c => {
      if (keepAlive && c.onLoad && !onLoadIsImplement) {
        Object.assign(to.meta, {
          onLoadIsImplement: true,
        })
        return c.onLoad
      }
    }).filter(_ => _)
    const onShowHooks = activated.map(c => c.onShow).filter(_ => _)

    if (!onLoadHooks && !onShowHooks.length) {
      console.log('there no client onLoad or onShow')
      return
    }

    Promise.all([...onLoadHooks, ...onShowHooks].map(hook => hook({
      store,
      router,
      route: to,
      lastRoute: from,
    }))).then(() => {
    }).catch(err => {
      __DEVELOPMENT__ && console.log(err)
    })
  })

  routerBeforeEach(router, store)

  app.$mount('#app')

  const needLogin = router.currentRoute?.meta?.login && !store?.state?.infoMember?.online
  if (needLogin) {
    return checkLogin(router.currentRoute, null, url => {
      if (url) {
        return router.replace(url)
      }
    }, store)
  }

  if (!router.currentRoute.meta) {
    Object.assign(router.currentRoute, {
      meta: {},
    })
  }
  Object.assign(router.currentRoute.meta, {
    onLoadIsImplement: true,
  })
})

export {
  store,
  router,
}
