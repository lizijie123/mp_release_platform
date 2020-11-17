import configure from '../../lib/configure'
import * as path from 'path'
import { Result } from '../definitionfile/result'
import * as aes from 'crypto-js/aes'

// 根据传入的相对跟目录路径计算绝对路径
// @params pathname: 相对路径
// @return 绝对路径
export function fixedToRelativePath (pathname: string): string {
  return path.join(process.cwd(), pathname)
}

// 根据传入的相对路径计算绝对路径
// @params pathname: 相对路径
// @return 绝对路径
export function absoluteToRelativePath (pathname: string): string {
  return path.join(__dirname, pathname)
}

// 对返回数据进行加密
// @params result: 待加密数据
// @return 加密后的数据
export function encrypt (result: Result): string | Result {
  const { key, iv, encrypt } = configure.encryptConfig
  if (encrypt && process.env.NODE_ENV !== 'development') {
    const newData = aes.encrypt(JSON.stringify(result), key, {
      iv
    }).toString()
    return newData
  }
  return result
}
