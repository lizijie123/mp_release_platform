import axios from 'axios'
import * as qs from 'qs'
import * as url from 'url'
import * as _ from 'lodash'
import * as storeConstants from '../store/store_constants'
import * as utils from './index'

// 代理对象key
const behaviorProxy = Symbol('behaviorProxy')

class Axios {
  constructor () {
    // 代理对象
    this[behaviorProxy] = null

    this._date = ''
    this._time = new Date().getTime()
    this._axiosCustom = null
    this._store = null
    this._isInitToken = false

    this.request = this.request.bind(this)
    this.sessionRequest = this.sessionRequest.bind(this)
    this.localRequest = this.localRequest.bind(this)
    this.get = this.get.bind(this)
    this.sessionGet = this.sessionGet.bind(this)
    this.localGet = this.localGet.bind(this)
    this.post = this.post.bind(this)
    this.sessionPost = this.sessionPost.bind(this)
    this.localPost = this.localPost.bind(this)
    this.put = this.put.bind(this)
    this.sessionPut = this.sessionPut.bind(this)
    this.localPut = this.localPut.bind(this)
    this.patch = this.patch.bind(this)
    this.sessionPatch = this.sessionPatch.bind(this)
    this.localPatch = this.localPatch.bind(this)
    this.del = this.del.bind(this)
    this.sessionDel = this.sessionDel.bind(this)
    this.localDel = this.localDel.bind(this)
    this.setStore = this.setStore.bind(this)
    this._initToken = this._initToken.bind(this)
    this.saveToken = this.saveToken.bind(this)
    this.deleteToken = this.deleteToken.bind(this)

    this._init()
  }

  // 初始化模块
  _init () {
    this._initProxy()
    this._initAxios()
  }

  // 初始化代理对象
  _initProxy () {
    const handler = {
      get (target, key) {
        if (key === behaviorProxy) throw new Error('禁止读取request模块代理对象')
        if (key.startsWith('_')) throw new Error('禁止读取request模块私有变量')
        if ((utils.getType(target[key]) === 'object') || (utils.getType(target[key]) === 'array')) {
          return new Proxy(target[key], handler)
        }
        return Reflect.get(target, key)
      },
      set (target, key, value) {
        if (key === behaviorProxy) throw new Error('禁止写入request模块代理对象')
        if (key.startsWith('_')) throw new Error('禁止写入request模块私有变量')
        return Reflect.set(target, key, value)
      },
    }
    handler.set = handler.set.bind(this)
    this[behaviorProxy] = new Proxy(this, handler)
  }

  // 初始化axios
  _initAxios () {
    this._axiosCustom = axios.create({
      timeout: (2 * 60 * 1000),
      withCredentials: true,
    })

    this._axiosCustom.interceptors.request.use(config => {
      if (this._store.state.authToken) {
        if (!config.headers) {
          Object.assign(config, {
            headers: {},
          })
        }
        Object.assign(config.headers, {
          Authorization: `Bearer ${this._store.state.authToken}`,
        })
      }
      return config
    }, error => {
      console.log(error)
      Promise.reject(error)
    })
  }

  // 获取客户端header
  _getClientHeaders (a, b, c, e, f, g, z) {
    return {
      [e]: `${Number.parseInt(a[b], 10).toString(z)}+${Number.parseInt(this._date || a[c], 10)}`,
      [f]: new Date().getTime().toString(z),
      [g]: Number.parseInt(this._time, 10).toString(z),
    }
  }

  // 获取请求url与请求头部
  _getUrlTargetObj (urlTarget = '', option = {}, params = {}) {
    const { headers = {} } = option
    if (/^http/ig.test(urlTarget)) {
      return { urlTarget, headers, newParams: params }
    }
    let newUrlTarget = ''
    let newHeaders = headers
    let newParams = {}
    if (__SERVER__) {
      const { default: configure, updatePatchConfig } = require('../../lib/configure')
      if (__DEVELOPMENT__) updatePatchConfig()
      let { hostStore, domain } = configure
      const { mallStoreDetail } = configure
      if (!/http/.test(hostStore)) {
        hostStore = `http://${hostStore}`
      }
      if (!/http/.test(domain)) {
        domain = `http://${domain}`
      }
      let storeUrlObj = {}
      const urlTargetObj = url.parse(urlTarget)

      if (urlTargetObj.pathname.includes('/from-store')) {
        // 清除值为空的属性
        newParams = _.pickBy({
          api_refer: this._store.state.apiRefer,
          app_version: this._store.state.appVersion,
          auth_token: this._store.state.authToken,
          ...params,
        }, _.identity)
        storeUrlObj = url.parse(hostStore)
      } else {
        newParams = params
        storeUrlObj = url.parse(domain)
      }

      // 公共header参数
      newHeaders = {
        accept: '*/*',
        origin: storeUrlObj.href,
        host: storeUrlObj.host,
        ...newHeaders,
      }

      if (this._store?.state?.cookie) {
        Object.assign(newHeaders, {
          cookie: this._store.state.cookie,
        })
      }

      const { pathname } = urlTargetObj

      if (urlTarget.includes('/from-store')) {
        newUrlTarget = url.format(Object.assign(urlTargetObj, {
          protocol: storeUrlObj.protocol,
          host: storeUrlObj.host,
          pathname,
        }))
      } else {
        newUrlTarget = `http://localhost:${process.env.HTTPPORT}${urlTarget}`
      }
      Reflect.deleteProperty(newHeaders, 'content-length')
    }

    if (__CLIENT__) {
      newUrlTarget = urlTarget
      newParams = params
      if (window && window.t) newHeaders = Object.assign(headers, this._getClientHeaders(window, 't', 'd', 't', 'm', 'd', 8))
    }

    return { urlTarget: newUrlTarget, headers: newHeaders, newParams }
  }

  // 获取store实例
  _getStore () {
    if (__CLIENT__) {
      const { store } = require('../entry.client')
      this._store = store
    }
  }

  // 设置store实例
  setStore (store) {
    if (__SERVER__) {
      this._store = store
    }
  }

  /**
   * 核心请求函数，下面所有函数都基于此函数
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param + autoErrorRes: boolean 是否自动处理响应错误，默认: true
   * @param + autoErrorData: boolean 是否自动处理后台错误，默认: true
   * @param + autoCancel: boolean 离开路由时是否自动取消当前页面发起的所有请求，默认: true
   * @returns Promise<any>
   */
  request (href, params = {}, config = {}) {
    const { autoErrorRes = false, autoErrorData = true, autoCancel = true } = config
    if (!href) return Promise.reject(new Error('缺少入口'))
    if (autoCancel && __CLIENT__) {
      if (!this._store) {
        this._getStore()
      }
      Object(config, {
        cancelToken: this._store.state[storeConstants.UPDATESOURCE].token,
      })
    }
    if (!this._isInitToken) {
      this._initToken()
      this._isInitToken = true
    }

    const { urlTarget, headers, newParams } = this._getUrlTargetObj(href, config, params)
    const args = {
      method: 'post',
      url: urlTarget,
      ...{
        ...config,
        headers,
      },
    }

    // 处理url传参
    if (!['post', 'put', 'patch', 'delete'].includes(args.method.toLowerCase())) {
      const urlObj = url.parse(args.url)
      const queryObj = Object.assign(qs.parse(urlObj.query), newParams)
      const query = qs.stringify(_.pickBy(queryObj))
      const newUrl = url.format(Object.assign(urlObj, {
        query,
        search: `?${query}`,
      }))
      Object.assign(args, {
        url: newUrl,
      })
    } else {
      newParams && Object.assign(args, {
        data: newParams,
      })
    }

    if (__DEVELOPMENT__ && __SERVER__) {
      console.log('\n - method:', args.method)
      console.log(' - url:  ', args.url)
      let curl = `curl -X ${args.method.toUpperCase()} '${args.url}'`
      const printHeaders = _.pickBy({
        source: args.headers.source,
        auth_token: args.headers.auth_token,
      }, _.identity)
      if (utils.getType(printHeaders) === 'object' && Object.keys(printHeaders).length !== 0) {
        console.log(' - header: ', printHeaders)
        Object.assign(printHeaders, {
          'Content-Type': 'application/json',
        })
        Object.entries(printHeaders).map(([key, value]) => {
          curl += ` -H '${key}: ${value}'`
        })
      }
      if (args.data) {
        console.log(' - body: ', JSON.stringify(args.data))
        curl += ` -d '${JSON.stringify(args.data)}'`
      }
      console.log(' - cURL: ', `${curl}\n`)
    }

    return this._axiosCustom(args).then(async res => {
      if (__CLIENT__) {
        this._date = new Date(res.headers.date || res.headers.Date || '').getTime().toString(8)
        this._time = new Date().getTime()
      }
      let { data } = res
      if (utils.getType(data) === 'string') {
        try {
          data = utils.decrypt(data)
        } catch (err) {
          __CLIENT__ && console.warn('数据解密失败')
        }
      }
      // 统一返回数据格式
      if (data.code != null && data.error_code == null) {
        Object.assign(data, {
          error_code: data.code,
        })
        Reflect.deleteProperty(data, 'code')
      }
      if (data.message != null && data.error_msg == null) {
        Object.assign(data, {
          error_msg: data.message,
        })
        Reflect.deleteProperty(data, 'message')
      }
      if (data.data != null && data.result == null) {
        Object.assign(data, {
          result: data.data,
        })
        Reflect.deleteProperty(data, 'data')
      }
      if ((__CLIENT__ || __DEVELOPMENT__) && data.error_code != null && data.error_code !== 0) {
        const errMsg = data.error_msg || '未知的服务器错误'
        const errCod = data.error_code
        console.warn(`请求接口: ${args.url}, 状态码: ${errCod}, 错误消息: ${errMsg}`)
        if (autoErrorRes && __CLIENT__) {
          await utils.alert(errMsg)
        }
      }
      if (data.error_code != null && data.error_code !== 0) {
        return data
      }
      return config.notAutomaticFormat ? data : data.result
    }, async error => {
      // 处理请求报错，如状态码为500、404、422等
      if (error?.response?.status) {
        switch (error.response.status) {
          // 未登录
          case 401: {
            if (__CLIENT__) {
              const { router, store } = require('../entry.client')
              await store.dispatch('logout')
              router.replace(`/login?backUrl=${encodeURIComponent(router.currentRoute.fullPath)}`)
              return Promise.reject()
            } else {
              const newError = {
                status: 401,
                data: '请先登录',
              }
              return Promise.reject(newError)
            }
          }
          default: {
            // default
          }
        }
      }

      const newError = {
        status: error?.response?.status || -100,
        data: error?.response?.data || {},
      }

      if (__CLIENT__ || __DEVELOPMENT__) {
        console.error(`网络请求异常，请求接口: ${args.url}, 异常状态码: ${newError.status}`)
        if (__CLIENT__ && autoErrorData) {
          utils.message(`网络请求异常, 异常状态码: ${newError.status}`, 'error', {
            duration: 7000,
          })
        }
      }
      return Promise.reject(newError)
    })
  }

  /**
   * 使用sessionStorage缓存的请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param + autoErrorRes: boolean 是否自动处理响应错误，默认: true
   * @param + autoErrorData: boolean 是否自动处理后台错误，默认: true
   * @param + autoCancel: boolean 离开路由时是否自动取消当前页面发起的所有请求，默认: true
   * @param outTime: number 接口数据缓存有效时间(单位s)，选填，默认: -1，值-1表示永久有效
   * @returns Promise<any>
   */
  sessionRequest (href, params = {}, config = {}, outTime = -1) {
    if (!__CLIENT__) {
      return this.request(href, params, config)
    }
    const itemKey = `${href}#${JSON.stringify(params)}${JSON.stringify(config)}`
    let itemVal = sessionStorage.getItem(itemKey)
    const nowTime = new Date().getTime()
    if (itemVal) {
      itemVal = JSON.parse(itemVal)
      const overTime = nowTime - itemVal.lastTime
      if (outTime < 0 || overTime < outTime * 1000) {
        return Promise.resolve(itemVal.data)
      }
    }
    return this.request(href, params, config).then(data => {
      sessionStorage.setItem(itemKey, JSON.stringify({
        lastTime: nowTime,
        data,
      }))
      return data
    })
  }

  /**
   * 使用localStorage缓存的请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param + autoErrorRes: boolean 是否自动处理响应错误，默认: true
   * @param + autoErrorData: boolean 是否自动处理后台错误，默认: true
   * @param + autoCancel: boolean 离开路由时是否自动取消当前页面发起的所有请求，默认: true
   * @param outTime: number 接口数据缓存有效时间(单位s)，选填，默认: -1，值-1表示永久有效
   * @returns Promise<any>
   */
  localRequest (href, params = {}, config = {}, outTime = 604800) {
    if (!__CLIENT__) {
      this.request(href, params, config)
    }
    const itemKey = `${href}#${JSON.stringify(params)}${JSON.stringify(config)}`
    let itemVal = localStorage.getItem(itemKey)
    const nowTime = new Date().getTime()
    if (itemVal) {
      itemVal = JSON.parse(itemVal)
      const overTime = nowTime - itemVal.lastTime
      if (outTime < 0 || overTime < outTime * 1000) {
        return Promise.resolve(itemVal.data)
      }
    }
    return this.request(href, params, config).then(data => {
      localStorage.setItem(itemKey, JSON.stringify({
        lastTime: nowTime,
        data,
      }))
      return data
    })
  }

  _get (href, params = {}, config = {}, outTime = -1, requestMethod = 'request') {
    if (!href) return Promise.reject(new Error('缺少入口'))
    const newConfig = {
      headers: config.headers || {},
      credentials: 'include',
      method: 'get',
      ...config,
    }
    if (requestMethod === 'request') {
      return this[requestMethod](href, params, newConfig)
    }
    return this[requestMethod](href, params, newConfig, outTime)
  }

  _post (href, params = {}, config = {}, outTime = -1, requestMethod = 'request') {
    if (!href) return Promise.reject(new Error('缺少入口'))
    const newConfig = {
      headers: config.headers || {},
      method: 'post',
      credentials: 'include',
      ...config,
    }
    if (!newConfig.headers['content-type']) {
      Object.assign(newConfig.headers, {
        'content-type': 'application/json',
      })
    }

    const urlObj = url.parse(href)
    const queryObj = qs.parse(urlObj.query)
    const query = qs.stringify(queryObj)
    const newUrl = url.format(Object.assign(urlObj, {
      query,
      search: `?${query}`,
    }))

    if (requestMethod === 'request') {
      return this[requestMethod](newUrl, params, newConfig)
    }
    return this[requestMethod](newUrl, params, newConfig, outTime)
  }

  /**
   * get请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @returns Promise<any>
   */
  async get (...args) {
    return this._get(...args)
  }

  /**
   * 使用sessionStorage缓存的get请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param outTime: number 接口数据缓存有效时间(单位s)，选填，默认: -1，值-1表示永久有效
   * @returns Promise<any>
   */
  async sessionGet (href, params = {}, config = {}, outTime = -1) {
    return this._get(href, params, config, outTime, 'sessionRequest')
  }

  /**
   * 使用localStorage缓存的get请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param outTime: number 接口数据缓存有效时间(单位s)，选填，默认: -1，值-1表示永久有效
   * @returns Promise<any>
   */
  async localGet (href, params = {}, config = {}, outTime = -1) {
    return this._get(href, params, config, outTime, 'localRequest')
  }

  /**
   * post请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @returns Promise<any>
   */
  async post (...args) {
    return this._post(...args)
  }

  /**
   * 使用sessionStorage缓存的post请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param outTime: number 接口数据缓存有效时间(单位s)，选填，默认: -1，值-1表示永久有效
   * @returns Promise<any>
   */
  async sessionPost (href, params = {}, config = {}, outTime = -1) {
    return this._post(href, params, config, outTime, 'sessionRequest')
  }

  /**
   * 使用localStorage缓存的post请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param outTime: number 接口数据缓存有效时间(单位s)，选填，默认: -1，值-1表示永久有效
   * @returns Promise<any>
   */
  async localPost (href, params = {}, config = {}, outTime = -1) {
    return this._post(href, params, config, outTime, 'localRequest')
  }

  /**
   * put请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @returns Promise<any>
   */
  put (href, params = {}, config = {}) {
    Object.assign(config, {
      method: config.method || 'put',
    })
    return this.post(href, params, config)
  }

  /**
   * 使用sessionStorage缓存的put请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param outTime: number 接口数据缓存有效时间(单位s)，选填，默认: -1，值-1表示永久有效
   * @returns Promise<any>
   */
  sessionPut (href, params = {}, config = {}, outTime = -1) {
    Object.assign(config, {
      method: config.method || 'put',
    })
    return this.sessionPost(href, params, config, outTime)
  }

  /**
   * 使用localStorage缓存的put请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param outTime: number 接口数据缓存有效时间(单位s)，选填，默认: -1，值-1表示永久有效
   * @returns Promise<any>
   */
  localPut (href, params = {}, config = {}, outTime = -1) {
    Object.assign(config, {
      method: config.method || 'put',
    })
    return this.localPost(href, params, config, outTime)
  }

  /**
   * patch请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @returns Promise<any>
   */
  patch (href, params = {}, config = {}) {
    Object.assign(config, {
      method: config.method || 'patch',
    })
    return this.post(href, params, config)
  }

  /**
   * 使用sessionStorage缓存的patch请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param outTime: number 接口数据缓存有效时间(单位s)，选填，默认: -1，值-1表示永久有效
   * @returns Promise<any>
   */
  sessionPatch (href, params = {}, config = {}, outTime = -1) {
    Object.assign(config, {
      method: config.method || 'put',
    })
    return this.sessionPost(href, params, config, outTime)
  }

  /**
   * 使用localStorage缓存的patch请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param outTime: number 接口数据缓存有效时间(单位s)，选填，默认: -1，值-1表示永久有效
   * @returns Promise<any>
   */
  localPatch (href, params = {}, config = {}, outTime = -1) {
    Object.assign(config, {
      method: config.method || 'put',
    })
    return this.localPost(href, params, config, outTime)
  }

  /**
   * delete请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @returns Promise<any>
   */
  del (href, params = {}, config = {}) {
    Object.assign(config, {
      method: config.method || 'delete',
    })
    return this.post(href, params, config)
  }

  /**
   * 使用sessionStorage缓存的delete请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param outTime: number 接口数据缓存有效时间(单位s)，选填，默认: -1，值-1表示永久有效
   * @returns Promise<any>
   */
  sessionDel (href, params = {}, config = {}, outTime = -1) {
    Object.assign(config, {
      method: config.method || 'put',
    })
    return this.sessionPost(href, params, config, outTime)
  }

  /**
   * 使用localStorage缓存的delete请求
   * @param href: string 请求的地址
   * @param params: object 请求参数，选填，默认: {}
   * @param config: object axios参数，选填，默认: {}
   * @param outTime: number 接口数据缓存有效时间(单位s)，选填，默认: -1，值-1表示永久有效
   * @returns Promise<any>
   */
  localDel (href, params = {}, config = {}, outTime = -1) {
    Object.assign(config, {
      method: config.method || 'put',
    })
    return this.localPost(href, params, config, outTime)
  }

  // 初始化token
  _initToken () {
    if (__CLIENT__) {
      const token = window.sessionStorage.getItem('authorizationToken')
      if (token) {
        if (!this._store) {
          this._getStore()
        }
        this._store.commit(storeConstants.AUTH_TOKEN, { authToken: token })
      }
    }
  }

  // 保存token
  saveToken (token) {
    if (__CLIENT__ && !this._store) {
      this._getStore()
    }
    this._store.commit(storeConstants.AUTH_TOKEN, { authToken: token })
    if (__CLIENT__) {
      window.sessionStorage.setItem('authorizationToken', token)
    }
  }

  // 删除token
  deleteToken () {
    if (__CLIENT__) {
      window.sessionStorage.removeItem('authorizationToken')
      this._store.commit(storeConstants.AUTH_TOKEN, { authToken: '' })
    }
  }
}

export default new Axios()[behaviorProxy]
