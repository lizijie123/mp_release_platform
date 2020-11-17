import { Controller, All, Req } from '@nestjs/common'
import { IRequest, Result } from '../../definitionfile/index'
import { AutoInfoService } from './autoInfo.service'
import * as utils from '../../utils/index'

@Controller('auto_info')
export class AutoInfoController {
  constructor (private readonly autoInfoService: AutoInfoService) {}

  // 清除session缓存
  @All('destroy_session')
  destroySession (@Req() req: IRequest): string | Result {
    req.session.destroy()
    return utils.encrypt({
      error_code: 0,
      error_msg: '',
      result: {
        destroy_session: true,
      }
    })
  }
}
