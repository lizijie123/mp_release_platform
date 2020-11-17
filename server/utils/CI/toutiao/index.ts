import ciConfigure from '../utils/ci-configure'
import * as utils from '../utils/index'

export class CiToutiao {
  // 上传体验版
  async upload ({ miniprogramType, projectPath, version, projectDesc }): Promise<string | void> {
    const currentPath = process.cwd()
    const login = `npx tma login-e '${ciConfigure[miniprogramType].account}' '${ciConfigure[miniprogramType].password}'`
    const up = `npx tma upload -v '${version}' -c '${projectDesc ? projectDesc : '暂无描述'}' ${projectPath}${ciConfigure[miniprogramType].buildProjectChildrenPath}`
    await utils.execPromise(login, currentPath)
    await utils.execPromise(up, currentPath)
  }
}

export const ciToutiao =  new CiToutiao()
