import { Controller, Get, Req, UseGuards, Delete } from '@nestjs/common'
import { IRequest, Result } from '../../definitionfile/index'
import * as utils from '../../utils/index'
import taskService from '../../utils/CI/utils/task.service'
import { Task } from '../../db/model/index'
import { AuthGuard } from '@nestjs/passport'

@Controller('task')
export class TaskController {
  constructor () {}

  // 获取type下所有记录
  @UseGuards(AuthGuard('jwt'))
  @Get('getByType')
  async getByType (@Req() req: IRequest): Promise<string | Result> {
    const { miniprogramType, page, limit } = req.query
    if (!miniprogramType) {
      return utils.encrypt({
        error_code: 1,
        error_msg: '参数不正确',
        result: {}
      })
    }

    const tasks: Array<Task> = await taskService.getByType(String(miniprogramType), page ? ((Number.parseInt(String(page), 10) - 1) * 10) : 0, limit ? Number.parseInt(String(limit), 10) : 10)
    const total: number = await taskService.getNumByType(String(miniprogramType))

    return utils.encrypt({
      error_code: 0,
      error_msg: '',
      result: {
        tasks,
        total,
      }
    })
  }

  // 删除任务
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete')
  async delete (@Req() req: IRequest): Promise<string | Result> {
    const { id } = req.body
    if (!id) {
      return utils.encrypt({
        error_code: 1,
        error_msg: '参数不正确',
        result: {}
      })
    }

    await taskService.delete(String(id))

    return utils.encrypt({
      error_code: 0,
      error_msg: '',
      result: {},
    })
  }
}
