# 小程序发布平台

> 有问题欢迎在issues中提出

## 1 背景

  😈 如果你同时维护着多个小程序项目，那你每天是否花费了大量的时间在做这样一件时间，切换git分支 -> 执行编译 -> 打开小程序开发者工具 -> 发布。 <br>
  🧐 同时维护着5个小程序(两个微信小程序、两个支付宝小程序、一个字节跳动小程序)，我发现我每天要花大量的时间做发布小程序的工作。为此我想到了打造一个类似Jenkins的小程序自动化构建平台，将发布小程序的任务移交给测试同事(是的，我就是这么懒)。 <br>

## 2 项目界面介绍

### 2.1 登录页

![登录界面](./read-image/login.jpg)

### 2.2 主页

![主页](./read-image/main.jpg)

### 2.3 主页带备注

![主页带备注](./read-image/main-remark.jpg)

### 2.4 发布预览

![发布预览](./read-image/preview.jpg)

### 2.5 发布体验版

![发布体验版](./read-image/upload.jpg)

### 3 功能介绍

- 目前支持发布微信小程序、支付宝小程序、字节跳动小程序
- 角色划分为超级管理员、管理员、开发/运营/测试、普通用户
  - 超级管理员与管理员具备所有功能，其中超级管理员账号不可被删除
    - 具备用户管理功能，包括用户的增、删、查、改
    - 具备发布任务管理功能，包括任务的删、查功能
    - 具备发布预览、发布体验版功能
    - 具备修改用户个人信息功能
  - 开发/运营/测试
    - 具备发布预览、发布体验版功能
    - 具备修改用户个人信息功能
  - 普通用户
    - 只具备查看发布记录与小程序二维码功能

## 4 技术概览

该项目后端采用nestjs + typescript技术，ORM使用sequelize，数据库采用mysql。前端采用vue2全家桶，搭配SSR技术，通过socket广播发布日志到所有前端用户中。 <br>

技术详解请看(二次开发必看): [开发须知](./开发须知.md)

## 5 启动项目

### 5.1 修改配置文件

在/lib/configure文件中将redisCFG与mysql字段中的配置改为自己的配置

```js
{
  // redis用户记录session数据，不使用的话可以在/server/server.ts文件中找到session中间件，并注释掉store字段，即可删除所有与redisCFG配置相关的内容
  // 配置含义见connect-redis库
  redisCFG: {
    prefix: 'mp_release_platform_sess:',
    host: 'localhost',
    port: 6379,
    db: 8,
  },
  // 配置含义见sequelize库
  mysql: {
    port: 3306,
    host: '0.0.0.0',
    user: 'root',
    password: 'reocar888',
    database: 'mp_release_platform',
    connectionLimit: 10,
  },
}
```

### 5.2 安装依赖并运行

```shell
# cd至项目根路径
# 安装所需包
npm i

# 新建终端(command + t)，并运行redis
redis-server

# 运行项目
npm run start:dev

# 浏览器中访问 http://localhost:8088 or https://localhost:8089
```

## 6 项目部署说明

项目推荐使用docker + k8s部署 <br>

前端页面通过SSR的方式返回，不需要单独部署前端。后端(可以看做node中间层与后端的结合)使用docker制作镜像，通过k8s部署。部署脚本在dockerfiles文件夹中，在项目根目录中执行make即可制作docker镜像。<br>

也就是说使用docker + k8s部署的话，只需要编写mysql和redis的配置文件即可。

## 7 常见问题

### 7.1 拉取gitlab项目超时

公司gitlab一般只允许内网访问，部署在云服务器上的项目会出现无法访问gitlab项目的问题，需要运维同事帮忙在gitlab项目中设置访问白名单。

### 7.2 package.json中的devDependencies的包没有安装

当环境变量NODE_ENV为production时(也就是我们的小程序自动化构建平台这个项目运行时，设置的NODE_ENV)，npm install或yarn install只会安装dependencies，而不会安装devDependencies列表中的包，需要将安装命令改为npm install --dev或yarn install --production=false

### 7.2 编译项目过程中出现内存溢出问题

* 报错日志: FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - process out of memory

首先排查k8s分配给docker容器的内存大小是否足够，若k8s分配给docker容器的内存足够大，依然报内存溢出，则可能是系统分配给node的内存不足(tips: 分配给node程序的内存64位系统下约为1.4GB，32位系统下约为0.7GB)，这时候可以通过[increase-memory-limit](https://www.npmjs.com/package/increase-memory-limit)这个包解决。

## 8 作者

github： [lizijie123](https://github.com/lizijie123)
