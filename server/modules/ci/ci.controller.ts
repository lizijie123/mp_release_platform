import { Controller, Post, Req, HttpException, UseGuards } from '@nestjs/common'
import { IRequest, Result } from '../../definitionfile/index'
import { CiService } from './ci.service'
import * as utils from '../../utils/index'
import ci from '../../utils/CI/index'
import { CiGateway } from './ci.gateway'
import { AuthGuard } from '@nestjs/passport'
import * as uuid from 'uuid'

@Controller('ci')
export class CiController {
  constructor (private readonly ciService: CiService, private readonly ciGateway: CiGateway) {}

  // 上传体验版
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  async upload (@Req() req: IRequest): Promise<string | Result> {
    const { miniprogramType, version, branch, projectDesc = '', experience = false } = req.body
    if (!miniprogramType || !version || !branch) {
      return utils.encrypt({
        error_code: 1,
        error_msg: '参数不正确',
        result: {}
      })
    }
    const { id, identification } = req.session?.infoMember || {}
    if (!id) {
      throw new HttpException('', 401)
    }
    setTimeout(() => {
      ci.upload({
        miniprogramType,
        version,
        branch,
        projectDesc,
        userId: id,
        identification: identification || 1,
        experience: experience,
      }, this.ciGateway)
    }, 100)
    return utils.encrypt({
      error_code: 0,
      error_msg: '',
      result: {}
    })
  }

  // 预览
  @UseGuards(AuthGuard('jwt'))
  @Post('preview')
  async preview (@Req() req: IRequest): Promise<string | Result> {
    const { miniprogramType, branch, pagePath = 'src/home/main', searchQuery = '', scene = '' } = req.body
    if (!miniprogramType || !branch || !pagePath) {
      return utils.encrypt({
        error_code: 1,
        error_msg: '参数不正确',
        result: {}
      })
    }
    const previewId = uuid.v4()
    const { id } = req.session?.infoMember || {}
    if (!id) {
      throw new HttpException('', 401)
    }
    setTimeout(() => {
      ci.preview({
        miniprogramType,
        branch,
        pagePath,
        searchQuery,
        scene,
        previewId,
        userId: id,
      }, this.ciGateway)
    }, 100)
    return utils.encrypt({
      error_code: 0,
      error_msg: '',
      result: {
        id: previewId,
      }
    })
  }
}
