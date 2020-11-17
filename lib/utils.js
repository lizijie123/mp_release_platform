const path = require('path')

// 根据传入的相对跟目录路径计算绝对路径
// @params pathname: 相对路径
// @return 绝对路径
const fixedToRelativePath = pathname => path.join(process.cwd(), pathname)

// 根据传入的相对路径计算绝对路径
// @params pathname: 相对路径
// @return 绝对路径
const absoluteToRelativePath = pathname => path.join(__dirname, pathname)

module.exports = {
  fixedToRelativePath,
  absoluteToRelativePath,
}
