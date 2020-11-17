import { Module } from '@nestjs/common'
import { CiController } from './ci.controller'
import { CiService } from './ci.service'
import { CiGateway } from './ci.gateway'

@Module({
  controllers: [CiController],
  providers: [CiService, CiGateway],
})

export class CiModule {}
