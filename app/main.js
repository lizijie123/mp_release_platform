import Vue from 'vue'
import App from './App'
import createRouter from './router'
import '@assets/scss/global'
import createStore from './store'

Vue.config.productionTip = false

if (__DEVELOPMENT__) {
  Vue.config.devtools = true
} else {
  Vue.config.devtools = false
}

function createApp () {
  const router = createRouter()
  const store = createStore()

  const app = new Vue({
    router,
    store,
    render: h => h(App),
  })
  return { app, router, store }
}

export default createApp
