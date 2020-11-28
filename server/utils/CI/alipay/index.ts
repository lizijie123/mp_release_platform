import * as ci from 'alipay-dev'
import ciConfigure from '../utils/ci-configure'
import * as fs from 'fs'
import * as utils from '../utils/index'

export class CiAlipay {
  // 上传体验版
  async upload ({ miniprogramType, projectPath, version, experience }): Promise<string | void> {
    this.initProject(miniprogramType)

    const res = await ci.miniUpload({
      project: `${projectPath}${ciConfigure[miniprogramType].buildProjectChildrenPath}`,
      appId: ciConfigure[miniprogramType].appId,
      packageVersion: version,
      onProgressUpdate: process.env.NODE_ENV === 'development' ? console.log : () => {},
      experience: experience ? experience : false,
    })
    if (res.qrCodeUrl) {
      return res.qrCodeUrl
    }
  }

  // 创建预览
  async preview ({ miniprogramType, projectPath, pagePath, searchQuery }): Promise<void> {
    this.initProject(miniprogramType)

    await ci.miniPreview({
      project: `${projectPath}${ciConfigure[miniprogramType].buildProjectChildrenPath}`,
      appId: ciConfigure[miniprogramType].appId,
      onProgressUpdate: process.env.NODE_ENV === 'development' ? console.log : () => {},
      qrcodeFormat: 'image',
      qrcodeOutput: `${projectPath}/previewQr.jpg`,
      page: pagePath,
      launch: searchQuery ? searchQuery : null,
    })
  }

  // 创建ci projecr对象
  initProject (miniprogramType: string): void {
    const privateKey = fs.readFileSync(utils.fixedToRelativePath(ciConfigure[miniprogramType].privateKeyPath), 'utf-8')
    ci.setConfig({
      toolId: ciConfigure[miniprogramType].toolId,
      privateKey,
    })
  }
}

export const ciAlipay = new CiAlipay()
