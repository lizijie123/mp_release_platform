import { Message, MessageBox } from 'element-ui'

// 防抖工厂函数 触发函数后等待wait时间(单位ms)才能再次触发，等待期间再次触发函数须要重新等待wait时间才能再次触发
export function debounce (fun, wait = 500) {
  let timeout = null
  return (...rest) => {
    let result
    if (timeout == null) {
      result = fun.apply(this, rest)
    } else {
      __DEVELOPMENT__ && console.log(`${fun.name}处于防抖时间中，${wait}ms后可再次触发该函数`)
    }
    timeout = setTimeout(() => {
      timeout = null
    }, wait)
    return result
  }
}

// 节流工厂函数 触发函数后等待wait时间(单位ms)才能再次触发，等待期间再次触发函数不会重置wait时间
export function throttle (fun, wait = 2000) {
  let previous = 0
  return (...rest) => {
    const now = Date.now()
    if (now - previous > wait) {
      fun.apply(this, rest)
      previous = now
    } else {
      __DEVELOPMENT__ && console.log(`函数${fun.name}处于节流时间中，${wait - (now - previous)}ms后可再次触发`)
    }
  }
}

// 睡眠函数
export function sleep (timer = 500) {
  return new Promise(resolve => {
    setTimeout(resolve, timer)
  })
}

// 获取uuid
export function getUUID () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.floor(Math.random() * 16)
    const v = c === 'x' ? r : (r && 0x3) || 0x8
    return v.toString(16)
  })
}

// 模态确认框
export function alert (msg, title, options) {
  return MessageBox.alert(msg, title, options)
}

// 模态选择框
export function confirm (msg, title, options) {
  return new Promise(resolve => {
    MessageBox.confirm(msg, title, options)
      .then(() => {
        resolve(true)
      }).catch(() => {
        resolve(false)
      })
  })
}

// 提示框
export function message (msg, type, option = {}) {
  Message({
    showClose: true,
    center: true,
    ...option,
    message: msg,
    type,
  })
}

// 获取变量类型
export function getType (element) {
  const initData = Object.prototype.toString.call(element)
  const configure = [
    ['[object String]', 'string'],
    ['[object Number]', 'number'],
    ['[object Boolean]', 'boolean'],
    ['[object Null]', 'null'],
    ['[object Undefined]', 'undefined'],
    ['[object Date]', 'object'],
    ['[object Regexp]', 'object'],
    ['[object Arguments]', 'object'],
    ['[object Error]', 'object'],
    ['[object Math]', 'object'],
    ['[object JSON]', 'object'],
    ['[object Function]', 'function'],
    ['[object Array]', 'array'],
    ['[object Object]', 'object'],
    ['[object Symbol]', 'symbol'],
    ['[object Bigint', 'bigint'],
  ]
  const map = new Map(configure)
  return map.get(initData)
}

// 获取变量实际类型
export function getActualType (element) {
  const initData = Object.prototype.toString.call(element)
  const configure = [
    ['[object String]', 'string'],
    ['[object Number]', 'number'],
    ['[object Boolean]', 'boolean'],
    ['[object Null]', 'null'],
    ['[object Undefined]', 'undefined'],
    ['[object Date]', 'date'],
    ['[object Regexp]', 'regexp'],
    ['[object Arguments]', 'arguments'],
    ['[object Error]', 'error'],
    ['[object Math]', 'math'],
    ['[object JSON]', 'json'],
    ['[object Function]', 'function'],
    ['[object Array]', 'array'],
    ['[object Object]', 'object'],
    ['[object Symbol]', 'symbol'],
    ['[object Bigint', 'bigint'],
  ]
  const map = new Map(configure)
  return map.get(initData)
}

// 对称加密数据进行解密
export function decrypt (data) {
  const aes = require('crypto-js/aes')
  const utf8 = require('crypto-js/enc-utf8')
  const encryptConfig = {
    key: 'sdxduerhpcfxuslj',
    iv: 'vfbwacgikomeusip',
    encrypt: true,
  }
  if (encryptConfig.encrypt) {
    const bytes = aes.decrypt(data, encryptConfig.key, {
      iv: encryptConfig.iv,
    })
    return JSON.parse(bytes.toString(utf8))
  }
  return data
}

// @param src 图片路径
// @param maxSize 图片最大像素，单位百万，如果传入图片大于最大像素，则压缩至最大像素以下并返回，默认1百万
export function compressImage (src, maxSize = 1) {
  return new Promise((resolve, reject) => {
    if (!__CLIENT__) return reject(new Error('非客户端'))
    try {
      // eslint-disable-next-line no-param-reassign
      maxSize = maxSize * 1000 * 1000
      const { Image } = window
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      img.onload = () => {
        // 压缩率
        const ratio = Math.sqrt((img.width * img.height) / maxSize)
        if (ratio <= 1) {
          resolve(src)
          return
        }
        const width = Math.floor(img.width / ratio)
        const height = Math.floor(img.height / ratio)

        // 压缩后大小
        canvas.width = width
        canvas.height = height

        // 为png图设置底色
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 兼容ios，图片大于1M时，分批绘制
        if (width * height > 1 * 1000 * 1000) {
          const count = Math.floor(Math.sqrt(width * height / 1 * 1000 * 1000) + 1)
          const cellCanvas = document.createElement('canvas')
          const cellCtx = cellCanvas.getContext('2d')
          const cellWidth = Math.floor(width / count)
          const cellHeight = Math.floor(height / count)
          cellCanvas.width = cellWidth
          cellCanvas.height = cellHeight
          for (let i = 0; i < count; i++) {
            for (let j = 0; j < count; j++) {
              cellCtx.drawImage(img, i * cellWidth * ratio, j * cellHeight * ratio, cellWidth * ratio, cellHeight * ratio, 0, 0, cellWidth, cellHeight)
              ctx.drawImage(cellCanvas, i * cellWidth, j * cellHeight, cellWidth, cellHeight)
            }
          }
          cellCtx.remove()
        } else {
          ctx.drawImage(img, 0, 0, width, height)
        }
        const newSrc = canvas.toDataURL('image/jpeg', 0.5)
        canvas.remove()
        img.remove()
        resolve(newSrc)
      }
    } catch (err) {
      resolve(src)
    }
  })
}
