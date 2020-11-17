import { Controller, All, Res } from '@nestjs/common'
import { Response } from 'express'

@Controller('/*')
export class Page404Controller {
  constructor () {}

  @All()
  Page404 (@Res() res: Response): void {
    res.redirect('/404')
  }
}
