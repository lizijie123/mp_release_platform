import rest from '@utils/rest'
import * as storeConstants from './store_constants'

const actions = {
  // 更新用户信息
  async reloadInfoMember ({ commit, state }) {
    if (!state?.infoMember?.online) {
      __DEVELOPMENT__ && console.error('未登录无法更新用户信息')
      return
    }
    const infoMember = await rest.get('/user/update_user_info')
    if (infoMember.error_code) return
    commit(storeConstants.INFOMEMBER, {
      infoMember,
    })
    return infoMember
  },
  // 退出登录
  async logout ({ commit, state }) {
    if (!state.infoMember.online) {
      __DEVELOPMENT__ && console.log('用户未登录')
      return
    }
    const [infoMember] = await Promise.all([
      rest.post('/user/logout'),
      rest.post('/auto_info/destroy_session'),
    ])

    commit(storeConstants.INFOMEMBER, {
      infoMember,
    })
    rest.deleteToken()
    return infoMember
  },
}

export default actions
