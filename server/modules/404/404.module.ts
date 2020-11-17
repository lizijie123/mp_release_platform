import { Module } from '@nestjs/common'
import { Page404Controller } from './404.controller'

@Module({
  imports: [],
  controllers: [Page404Controller],
})
export class Page404Module {}
