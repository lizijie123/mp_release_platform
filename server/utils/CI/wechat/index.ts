import * as ci from 'miniprogram-ci'
import ciConfigure from '../utils/ci-configure'
import * as utils from '../utils/index'

export class CiWechat {
  // 上传体验版
  async upload ({ miniprogramType, projectPath, version, projectDesc = '', identification }): Promise<void> {
    const project: any = this.initProject(projectPath, miniprogramType)

    const robot: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 = <0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30>Number.parseInt(identification, 10)

    await ci.upload({
      project,
      version,
      desc: projectDesc,
      setting: ciConfigure[miniprogramType].setting,
      onProgressUpdate: process.env.NODE_ENV === 'development' ? console.log : () => {},
      robot: identification ? robot : null
    })
  }

  // 创建预览
  async preview ({ miniprogramType, projectPath, version, pagePath, searchQuery, scene }): Promise<void> {
    const project: any = this.initProject(projectPath, miniprogramType)
    
    await ci.preview({
      project,
      version,
      setting: ciConfigure[miniprogramType].setting,
      onProgressUpdate: process.env.NODE_ENV === 'development' ? console.log : () => {},
      qrcodeFormat: 'image',
      qrcodeOutputDest: `${projectPath}/previewQr.jpg`,
      pagePath,
      searchQuery: searchQuery ? searchQuery : null,
      scene: scene ? scene : null,
    })
  }

  // 创建ci projecr对象
  initProject (projectPath: string, miniprogramType: string): any {
    return new ci.Project({
      appid: ciConfigure[miniprogramType].appId,
      type: ciConfigure[miniprogramType].type,
      projectPath: `${projectPath}${ciConfigure[miniprogramType].buildProjectChildrenPath}`,
      privateKeyPath: utils.fixedToRelativePath(ciConfigure[miniprogramType].privateKeyPath),
      ignores: ['node_modules/**/*'],
    })
  }
}

export const ciWechat =  new CiWechat()
