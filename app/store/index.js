import Vue from 'vue'
import Vuex from 'vuex'
import state from './state'
import getters from './getters'
import mutations from './mutations'
import actions from './actions'
import modules from './modules/modules'

Vue.use(Vuex)

function createStore () {
  return new Vuex.Store({
    strict: !__PRODUCTION__,
    state,
    getters,
    mutations,
    actions,
    modules,
  })
}

export default createStore
