import { Module } from '@nestjs/common'
import { AuthModule } from './modules/auth/auth.module'
import { AutoInfoModule } from './modules/auto-info/autoInfo.module'
import { CiModule } from './modules/ci/ci.module'
import { TaskModule } from './modules/task/task.module'
import { UserModule } from './modules/user/user.module'
import { UserController } from './modules/user/user.controller'
import { Page404Module } from './modules/404/404.module'

@Module({
  imports: [
    AuthModule,
    AutoInfoModule,
    CiModule,
    TaskModule,
    UserModule,
    Page404Module,
  ],
  controllers: [UserController],
  providers: [],
})
export class AppModule {}
