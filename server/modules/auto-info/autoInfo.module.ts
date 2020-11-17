import { Module } from '@nestjs/common'
import { AutoInfoController } from './autoInfo.controller'
import { AutoInfoService } from './autoInfo.service'

@Module({
  controllers: [AutoInfoController],
  providers: [AutoInfoService],
})

export class AutoInfoModule {}
