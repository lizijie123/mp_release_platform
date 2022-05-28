import { ciWechat, CiWechat } from './wechat/index'
import { ciAlipay, CiAlipay } from './alipay/index'
import { ciToutiao, CiToutiao } from './toutiao/index'
import ciConfigure from './utils/ci-configure'
import * as utils from './utils/index'
import taskService from './utils/task.service'
import * as dayjs from 'dayjs'
import { Task } from '../../db/model/index'
import { CiGateway } from '../../modules/ci/ci.gateway'
import { PreviewTask } from '../../definitionfile/index'
import * as fs from 'fs'

export class CI {
  wechat: CiWechat
  alipay: CiAlipay
  toutiao: CiToutiao

  constructor () {
    this.wechat = ciWechat
    this.alipay = ciAlipay
    this.toutiao = ciToutiao
  }

  // 上传体验版
  async upload ({ miniprogramType, version, branch, projectDesc, userId, identification, experience, isPro }, ciGateway: CiGateway): Promise<void> {
    const taskId = await this.createTask(ciGateway, {
      miniprogramType,
      userId,
      version,
      branch,
      projectDesc,
      isPro,
      uploadType: 'upload',
      pagePath: '',
      searchQuery: '',
      scene: '',
    })
    try {
      const { storePath, projectPath } = this.getStorePathAndProjectPath(miniprogramType, branch, version)
      const realMiniprogramType = (miniprogramType.includes('wechat') && 'wechat') || (miniprogramType.includes('alipay') && 'alipay') || (miniprogramType.includes('toutiao') && 'toutiao')
      if (!realMiniprogramType) throw new Error('找不到小程序类型')
      await this.recordTask('first', ciGateway, {
        taskId,
        errorMessage: null,
      })
      await this.download(storePath, projectPath)
      await this.recordTask('second', ciGateway, {
        taskId,
        errorMessage: null,
      })
      await this.build(miniprogramType, projectPath, isPro)
      await this.recordTask('third', ciGateway, {
        taskId,
        errorMessage: null,
      })
      await this[realMiniprogramType].upload({
        miniprogramType,
        projectPath,
        version,
        projectDesc,
        identification,
        experience,
      })
      await this.recordTask('fourth', ciGateway, {
        taskId,
        errorMessage: null,
      })
      ciGateway.confirmTask(userId, miniprogramType)
    } catch (err) {
      await this.recordTask('error', ciGateway, {
        taskId,
        errorMessage: err.message,
      })
    }
  }

  // 预览
  async preview ({ userId, miniprogramType, branch, pagePath, searchQuery, scene, previewId, isPro }, ciGateway: CiGateway): Promise<void> {
    const version = dayjs().format('MM.DD.HH.mm.ss')
    const taskId = await this.createTask(ciGateway, {
      miniprogramType,
      userId,
      version,
      branch,
      projectDesc: '',
      isPro,
      uploadType: 'preview',
      pagePath,
      searchQuery,
      scene,
    })

    try {
      const { storePath, projectPath } = this.getStorePathAndProjectPath(miniprogramType, branch, version)
      const realMiniprogramType = (miniprogramType.includes('wechat') && 'wechat') || (miniprogramType.includes('alipay') && 'alipay') || (miniprogramType.includes('toutiao') && 'toutiao')

      await this.recordTask('first', ciGateway, {
        taskId,
        errorMessage: null,
      })
      await this.download(storePath, projectPath)
      await this.recordTask('second', ciGateway, {
        taskId,
        errorMessage: null,
      })
      await this.build(miniprogramType, projectPath, isPro)
      await this.recordTask('third', ciGateway, {
        taskId,
        errorMessage: null,
      })

      await this[realMiniprogramType].preview({
        miniprogramType,
        projectPath,
        version,
        pagePath,
        searchQuery,
        scene,
      })

      const image = fs.readFileSync(`${projectPath}/previewQr.jpg`)

      await this.recordTask('fourth', ciGateway, {
        taskId,
        errorMessage: null,
      }, image)
      ciGateway.confirmTask(userId, miniprogramType)
    } catch (err) {
      await this.recordTask('error', ciGateway, {
        taskId,
        errorMessage: err.message,
      })
    }
  }

  // 刷新预览
  async refreshPreview ({ userId, taskId }, ciGateway: CiGateway): Promise<void> {
    const task = await taskService.get(taskId)
    const {
      type: miniprogramType,
      branch,
      version,
      isPro,
      pagePath,
      searchQuery,
      scene,
    } = task

    try {
      const { storePath, projectPath } = this.getStorePathAndProjectPath(miniprogramType, branch, version)
      const realMiniprogramType = (miniprogramType.includes('wechat') && 'wechat') || (miniprogramType.includes('alipay') && 'alipay') || (miniprogramType.includes('toutiao') && 'toutiao')

      await this.recordTask('first', ciGateway, {
        taskId,
        errorMessage: null,
      })
      await this.download(storePath, projectPath)
      await this.recordTask('second', ciGateway, {
        taskId,
        errorMessage: null,
      })
      await this.build(miniprogramType, projectPath, isPro)
      await this.recordTask('third', ciGateway, {
        taskId,
        errorMessage: null,
      })

      await this[realMiniprogramType].preview({
        miniprogramType,
        projectPath,
        version,
        pagePath,
        searchQuery,
        scene,
      })

      await this.recordTask('fourth', ciGateway, {
        taskId,
        errorMessage: null,
      })
      ciGateway.confirmTask(userId, miniprogramType)
    } catch (err) {
      await this.recordTask('error', ciGateway, {
        taskId,
        errorMessage: err.message,
      })
    }
  }

  // 获取项目地址与本地存储地址
  getStorePathAndProjectPath (miniprogramType: string, branch: string, version: string): { projectPath: string, storePath: string } {
    let storePath = ''
    if (ciConfigure[miniprogramType].storeDownloadPath.includes('github')) {
      storePath = `${ciConfigure[miniprogramType].storeDownloadPath}#${branch}`
    } else {
      storePath = `direct:${ciConfigure[miniprogramType].storeDownloadPath}?private_token=${ciConfigure[miniprogramType].privateToken}`
      if (storePath.includes('v4')) {
        storePath += `&ref=${branch}`
      } else {
        storePath += `&sha=${branch}`
      }
    }
    const projectPath = utils.fixedToRelativePath(`/miniprogram/${miniprogramType}/${version}`)

    return {
      storePath,
      projectPath,
    }
  }

  // 获取代码
  download (storePath: string, projectPath: string): Promise<unknown> {
    utils.initProjectPath(projectPath)
    return Promise.race([
      utils.download(storePath, projectPath),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('拉取项目超时，时限为60分钟，请检查服务器网络'))
        }, ciConfigure.maxTimeout)
      })
    ])
  }

  // 构建
  async build (miniprogramType: string, projectPath: string, isPro: number): Promise<void> {
    await utils.execPromise(`npm install`, projectPath)
    await utils.execPromise(`npm install --dev`, projectPath)
    let buildCommand = ''
    if (isPro !== 1) {
      buildCommand = ciConfigure[miniprogramType].devBuildCommand
    }
    if (isPro === 1 || !buildCommand) {
      buildCommand = ciConfigure[miniprogramType].buildCommand
    }
    await utils.execPromise(buildCommand, projectPath)
  }

  // 创建任务
  async createTask (ciGateway: CiGateway, { miniprogramType, userId, version, branch, projectDesc, isPro, uploadType, pagePath, searchQuery, scene }): Promise<string> {
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss')
    const journal = [
      {
        message: '初始化进程与资源',
        time,
        interval: '',
      },
    ]
    const id: string = await taskService.create({
      type: miniprogramType,
      userId,
      version,
      branch,
      desc: projectDesc,
      status: '发布中',
      errorMessage: null,
      journal: JSON.stringify(journal),
      qrCodeUrl: null,
      isPro,
      uploadType,
      pagePath,
      searchQuery,
      scene
    })
    const task = await taskService.get(id)
    ciGateway.createTask(task)
    return id
  }

  // 更新任务记录
  async recordTask (opportunity: string, ciGateway: CiGateway, { taskId, errorMessage }, qrCodeUrl?: Buffer | void): Promise<void> {
    const task: Task = await taskService.get(taskId)
    try {
      Object.assign(task, {
        journal: JSON.parse(task.journal),
      })
    } catch (err) {
      Object.assign(task, {
        journal: [],
      })
    }
    switch (opportunity) {
      case 'first': {
        const firstTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const lastTime = (task.journal[task.journal.length - 1]).time
        task.journal.push({
          message: '初始化完毕，开始从git中获取项目',
          time: firstTime,
          interval: dayjs(firstTime).get('millisecond') - dayjs(lastTime).get('millisecond')
        })
        Object.assign(task, {
          journal: JSON.stringify(task.journal),
        })
        break
      }
      case 'second': {
        const secondTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const firstTime = (task.journal[task.journal.length - 1]).time
        task.journal.push({
          message: '项目获取完毕，开始进行编译',
          time: secondTime,
          interval: dayjs(secondTime).get('millisecond') - dayjs(firstTime).get('millisecond')
        })
        Object.assign(task, {
          journal: JSON.stringify(task.journal),
        })
        break
      }
      case 'third': {
        const thirdTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const secondTime = (task.journal[task.journal.length - 1]).time
        task.journal.push({
          message: '项目编译完毕，开始上传',
          time: thirdTime,
          interval: dayjs(thirdTime).get('millisecond') - dayjs(secondTime).get('millisecond'),
        })
        Object.assign(task, {
          journal: JSON.stringify(task.journal),
        })
        break
      }
      case 'fourth': {
        const fourthTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const thirdTime = (task.journal[task.journal.length - 1]).time
        task.journal.push({
          message: '项目上传完毕',
          time: fourthTime,
          interval: dayjs(fourthTime).get('millisecond') - dayjs(thirdTime).get('millisecond'),
        })
        Object.assign(task, {
          journal: JSON.stringify(task.journal),
          status: '发布成功',
        })
        if (qrCodeUrl) {
          Object.assign(task, {
            qrCodeUrl,
          })
        }
        break
      }
      case 'error': {
        Object.assign(task, {
          status: '发布失败',
          errorMessage,
          journal: JSON.stringify(task.journal),
        })
        break
      }
    }
    await taskService.updata(task)
    const newTask = await taskService.get(taskId)
    ciGateway.updataTask(newTask)
  }

  // 更新预览任务记录
  recordPreviewTask (opportunity: string, userId: string, ciGateway: CiGateway, previewTask: PreviewTask, errorMessage?: string, qrPath?: string): PreviewTask {
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss')
    let journal = {}
    switch (opportunity) {
      case 'first': {
        journal = {
          message: '初始化进程与资源',
          time,
          interval: '',
        }
        previewTask.journal.push(journal)
        journal = {
          message: '初始化完毕，开始从git中获取项目',
          time,
          interval: '',
        }
        previewTask.journal.push(journal)
        break
      }
      case 'second': {
        journal = {
          message: '项目获取完毕，开始进行编译',
          time,
          interval: '',
        }
        previewTask.journal.push(journal)
        break
      }
      case 'third': {
        journal = {
          message: '项目编译完毕，开始生成预览二维码',
          time,
          interval: '',
        }
        previewTask.journal.push(journal)
        break
      }
      case 'fourth': {
        journal = {
          message: '预览二维码生成完毕',
          time,
          interval: '',
        }
        previewTask.journal.push(journal)
        try {
          const image = fs.readFileSync(qrPath)
          const base64 = `data:image/jpeg;base64,${Buffer.from(image).toString('base64')}`
          Object.assign(previewTask, {
            base64,
            status: '发布成功',
          })
        } catch (err) {
          Object.assign(previewTask, {
            errorMessage: err.message,
            status: '发布失败',
          })
        }
        break
      }
      case 'error': {
        Object.assign(previewTask, {
          errorMessage,
          status: '发布失败',
        })
        break
      }
    }
    ciGateway.previewUpdataTask(userId, previewTask)
    return previewTask
  }
}

export default new CI()
