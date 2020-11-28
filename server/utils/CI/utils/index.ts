import * as downloadGit from 'download-git-repo'
import * as path from 'path'
import * as fs from 'fs'
import * as shell from 'shelljs'

// 根据传入的相对跟目录路径计算绝对路径
// @params pathname: 相对路径
// @return 绝对路径
export function fixedToRelativePath (pathname: string): string {
  return path.join(process.cwd(), pathname)
}

// 下载项目
export function download (storePath: string, projectPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    downloadGit(storePath, projectPath, null, err => {
      if (err) reject(err)
      resolve()
    })
  })
}

// 初始化项目路径
export function initProjectPath (projectPath: string): void {
  if (typeof projectPath !== 'string') throw new TypeError('projectPath is not string')

  // 检测路径是否存在，若不存在则创建出路径
  projectPath.split('/').reduce((previous, current) => {
    previous += `/${current}`
    if (!fs.existsSync(previous)) {
      fs.mkdirSync(previous)
    }
    return previous
  }, '')

  // 清空当前路径下的所有文件及文件夹
  const removeMkdir = (projectPath) => {
    if (fs.existsSync(projectPath)) {
      fs.readdirSync(projectPath).map(fileName => {
        const currentPath = `${projectPath}/${fileName}`
        if (fs.statSync(currentPath).isDirectory()) {
          removeMkdir(currentPath)
        } else {
          fs.unlinkSync(currentPath)
        }
      })
      fs.rmdirSync(projectPath)
    }
  }

  
  const checkRemoveMkdir = () => {
    try {
      removeMkdir(projectPath)
    } catch (err) {
      //
    }
    
    if (fs.existsSync(projectPath)) {
      checkRemoveMkdir()
    }
  }

  checkRemoveMkdir()
}

// 启用子进程执行shell命令
export function execPromise (command: string, cwd: string): Promise<any> {
  return new Promise(resolve => {
    shell.exec(command, {
      async: true,
      silent: process.env.NODE_ENV !== 'development',
      stdio: 'ignore',
      cwd,
    }, (...rest) => {
      resolve(...rest)
    })
  })
}
