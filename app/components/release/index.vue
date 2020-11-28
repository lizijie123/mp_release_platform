<template>
  <div class='release'>
    <div class='function-btn' v-if="infoMember.role < 3">
      <el-button type="default" @click="openPreviewPanel">预览</el-button>
      <el-button type="primary" @click="openUploadPanel">上传体验版</el-button>
      <el-button type="info" v-if="miniprogramType.includes('wechat')">
        <span class="f-white" @click="openNewTab('https://mp.weixin.qq.com/wxamp/wacodepage/getcodepage')">微信平台</span>
      </el-button>
      <el-button type="info" v-if="miniprogramType.includes('alipay')">
        <span class="f-white" @click="openNewTab('https://open.alipay.com/mini/dev/sub/dev-manage')">支付宝平台</span>
      </el-button>
      <el-button type="info" v-if="miniprogramType.includes('toutiao')">
        <span class="f-white" @click="openNewTab('https://microapp.bytedance.com')">字节跳动平台</span>
      </el-button>
      <el-popover placement="bottom" title="预览任务进度" width="300" trigger="click" v-if="previewTaskDetail.id">
        <div>
          <template v-if="previewTaskDetail.errorMessage">
            <div class='f-red f-s-15'>
              失败原因: {{previewTaskDetail.errorMessage}}
            </div>
          </template>
          <template v-for="(item, j) in previewTaskDetail.journal">
            <div class='line' :key="j">
              <span class='f-grey f-s-12'>{{item.time}}:</span>
              <span class='f-black f-s-15'>{{item.message}}</span>
            </div>
          </template>
          <template v-if="previewTaskDetail.base64">
            <div class='qr-image-box'>
              <img :src="previewTaskDetail.base64" />
            </div>
          </template>
        </div>
        <el-button slot="reference" type="default" class="m-l-10">
          <span :class="(previewTaskDetail.status === '发布失败' ? 'f-red' : '') + (previewTaskDetail.status === '发布成功' ? 'f-blue' : '') + (previewTaskDetail.status === '发布中' ? 'f-yellow' : '')">预览任务{{previewTaskDetail.status ? previewTaskDetail.status : '初始化'}}</span>
          <i class='el-icon-loading' v-if="previewTaskDetail.status === '发布中'" />
        </el-button>
      </el-popover>
    </div>
    <div class='task-list-box' id='task-list-box'>
      <div class='task-list'>
        <template v-for="(task, index) in tasks">
          <el-card class='task-item' :key="index" shadow="hover">
            <div slot="header">
              <span>{{task.version}}</span>
              <span class='pull-right icon-qr' @click='showQr' v-if="miniprogramType.includes('wechat') || miniprogramType.includes('toutiao')"></span>
              <span class='pull-right icon-qr' @click='showQr(task)' v-else-if="miniprogramType.includes('alipay') && task.qrCodeUrl"></span>
            </div>
            <div class='task-body'>
              <template v-if="task.status === '发布失败' && task.errorMessage">
                <el-popover placement="bottom" title="失败原因" width="250" trigger="click" :content="task.errorMessage">
                  <div class='line' slot="reference">
                    <span class='left-label'>状态:</span>
                    <span class='right-content f-red'>{{task.status}}(查看详情)</span>
                  </div>
                </el-popover>
              </template>
              <template v-else>
                <div class='line'>
                  <span class='left-label'>状态:</span>
                  <span :class="'right-content ' + (task.status === '发布成功' ? 'f-blue' : '') + (task.status === '发布中' ? 'f-yellow' : '')">{{task.status}}</span>
                  <i class='el-icon-loading' v-if="task.status === '发布中'" />
                </div>
              </template>
              <div class='line'>
                <span class='left-label'>分支:</span>
                <span class='right-content'>{{task.branch}}</span>
              </div>
              <div class='line'>
                <span class='left-label'>上传者:</span>
                <span class='right-content'>{{(!task.name || task.name === task.account) ? task.account : `${task.name}(${task.account})`}}</span>
              </div>
              <div class='line' v-if="!miniprogramType.includes('alipay')">
                <span class='left-label'>上传者标识:</span>
                <span class='right-content'>ci机器人{{task.identification}}</span>
              </div>
              <div class='line'>
                <span class='left-label'>上传时间:</span>
                <span class='right-content'>{{formatTime(task.updateTime)}}</span>
              </div>
              <template v-if="task.status">
                <el-popover placement="bottom" title="日志" width="300" trigger="click">
                  <template v-for="(item, j) in task.journal">
                    <div class='line' :key="j">
                      <span class='f-grey f-s-12'>{{item.time}}:</span>
                      <span class='f-black f-s-15'>{{item.message}}</span>
                    </div>
                  </template>
                  <div class='line' slot="reference">
                    <span class='left-label'>日志:</span>
                    <span :class="'right-content ' + (task.status === '发布成功' ? 'f-blue' : '') + (task.status === '发布中' ? 'f-yellow' : '') + (task.status === '发布失败' ? 'f-red' : '')">
                      点击查看
                    </span>
                  </div>
                </el-popover>
              </template>
              <div class='line' v-if="!miniprogramType.includes('alipay')">
                <span class='left-label'>项目备注:</span>
                <span class='right-content'>{{task.desc}}</span>
              </div>
            </div>
          </el-card>
        </template>
      </div>
    </div>

    <!-- 上传体验版弹窗 -->
    <el-dialog :visible.sync="uploadVisible" :title="'上传' + miniprogramTypeCN" center :append-to-body="true">
      <el-form :model="form" :rules="rules" ref="form">
        <el-form-item prop="branch">
          <el-input v-model="form.branch" placeholder="请输入分支名" clearable prefix-icon="el-icon-coin"></el-input>
        </el-form-item>
        <el-form-item prop="version">
          <el-input v-model="form.version" placeholder="请输入版本号" clearable prefix-icon="el-icon-s-operation"></el-input>
        </el-form-item>
        <el-form-item prop="description" v-if="!miniprogramType.includes('alipay')">
          <el-input v-model="form.description" placeholder="请输入描述" clearable prefix-icon="el-icon-s-order"></el-input>
        </el-form-item>
        <el-form-item prop="experience" v-if="miniprogramType.includes('alipay')">
          <el-checkbox v-model="form.experience">是否同时将该版本设置为体验版</el-checkbox>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="uploadVisible = false">取 消</el-button>
        <el-button type="primary" @click="upload">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 查看体验版弹窗 -->
    <el-dialog :visible.sync="qrVisible" :title="miniprogramTypeCN + '体验版'" center :append-to-body="true">
      <template v-if="qrCodeUrl">
        <div class='qr-box'>
          <img :src="qrCodeUrl" />
        </div>
      </template>
      <template v-else>
         <div :class="miniprogramType"></div>
         <div class='text-center f-blue m-t-5' v-if="miniprogramType.includes('wechat')">tips: 请自行切换体验版</div>
      </template>
      <span slot="footer">
        <el-button type="primary" @click="qrVisible = false">关 闭</el-button>
      </span>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog :visible.sync="previewVisible" title="预览" center :append-to-body="true" @keydown.enter="preview">
      <el-form :model="previewForm" :rules="previewRules" ref="form">
        <el-form-item prop="branch">
          <el-input v-model="previewForm.branch" placeholder="请输入分支名" clearable prefix-icon="el-icon-coin"></el-input>
        </el-form-item>
        <el-form-item prop="pagePath">
          <el-input v-model="previewForm.pagePath" placeholder="请输入启动页面" clearable prefix-icon="el-icon-document"></el-input>
        </el-form-item>
        <el-form-item prop="searchQuery">
          <el-input v-model="previewForm.searchQuery" placeholder="请输入启动参数" clearable prefix-icon="el-icon-s-operation"></el-input>
        </el-form-item>
        <el-form-item prop="scene" v-if="!miniprogramType.includes('alipay')">
          <el-input v-model="previewForm.scene" placeholder="请输入场景值" clearable prefix-icon="el-icon-s-operation"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="previewVisible = false">取 消</el-button>
        <el-button type="primary" @click="preview">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  Button,
  Dialog,
  Input,
  Form,
  FormItem,
  Card,
  Popover,
  Checkbox,
} from 'element-ui'
import rest from '@utils/rest'
import * as utils from '@utils/index'
import * as dayjs from 'dayjs'
import Socket from '@utils/socket'
import { mapState } from 'vuex'
import { browserNotify } from '@utils/browserNotify'
import { releaseMap } from '@utils/constants'

export default {
  // 小程序发布组件
  name: 'release',

  components: {
    [Button.name]: Button,
    [Dialog.name]: Dialog,
    [Input.name]: Input,
    [Form.name]: Form,
    [FormItem.name]: FormItem,
    [Card.name]: Card,
    [Popover.name]: Popover,
    [Checkbox.name]: Checkbox,
  },

  props: {
    // 小程序类型
    miniprogramType: {
      type: String,
      default: '',
    },
    // 启动页面
    pagePath: {
      type: String,
      default: 'src/home/index',
    },
    // 发布的分支
    mainBranch: {
      type: String,
      default: 'master',
    },
  },

  data () {
    return {
      // 控制上传体验版弹窗是否显示
      uploadVisible: false,
      // 控制二维码弹窗是否显示
      qrVisible: false,
      // 上传表单
      form: {
        // 分支
        branch: 'master',
        // 版本
        version: '',
        // 描述
        description: '',
        // 是否同时将该版本设置为体验版
        experience: true,
      },
      // 检验规则
      rules: {
        branch: [
          {
            required: true,
            message: '请输入分支名',
            trigger: 'blur',
          },
        ],
        version: [
          {
            required: true,
            message: '请输入版本号',
            trigger: 'blur',
          },
        ],
      },
      // 任务记录
      tasks: [],
      // socket实例
      socket: null,
      // 初始化promise对象
      initPromise: Promise.resolve(),
      // 预览弹窗
      previewVisible: false,
      // 预览表单
      previewForm: {
        // 分支
        branch: 'master',
        // 启动页面
        pagePath: '',
        // 启动参数
        searchQuery: '',
        // 场景值
        scene: '',
      },
      // 预览表单过滤规则
      previewRules: {
        branch: [
          {
            required: true,
            message: '请输入分支名',
            trigger: 'blur',
          },
        ],
        pagePath: [
          {
            required: true,
            message: '请输入启动页面',
            trigger: 'blur',
          },
        ],
      },
      // 预览任务详情
      previewTaskDetail: {
        id: '',
      },
      // 小程序二维码地址
      qrCodeUrl: '',
      // 当前页面
      page: 1,
      // 每页的记录数
      limit: 10,
      // 总记录数
      total: 0,
    }
  },

  async activated () {
    this.initPromise = await this.init()
  },

  deactivated () {
    if (this.socket?.disconnect) {
      this.socket.disconnect()
    }
    this.socket = null
    this.removeListenerScroll()
  },

  computed: {
    // 小程序类型(中文)
    miniprogramTypeCN () {
      const { miniprogramType } = this
      return releaseMap.get(miniprogramType)
    },
    ...mapState({
      infoMember: state => state.infoMember,
    }),
  },

  methods: {
    // 初始化
    async init () {
      this.upload = utils.debounce(this.upload, 1000)
      this.getMore = utils.debounce(this.getMore, 500)
      this.createTask = this.createTask.bind(this)
      this.updataTask = this.updataTask.bind(this)
      this.updataPreviewTask = this.updataPreviewTask.bind(this)

      this.initPreviewForm()
      this.initUploadForm()
      this.initSocket()
      this.listenerScroll()
      await this.getTask()
    },
    // 初始化socket
    initSocket () {
      const { infoMember } = this
      this.socket = new Socket(infoMember.id, {
        createTask: this.createTask,
        updataTask: this.updataTask,
        updataPreviewTask: this.updataPreviewTask,
      })
    },
    // 获取任务记录
    async getTask () {
      const { miniprogramType, page, limit } = this
      const res = await rest.get('/task/getByType', {
        miniprogramType,
        page,
        limit,
      })
      if (res.error_code && res.error_code !== 0) {
        return utils.message(res.error_msg, 'error')
      }
      const tasks = res.tasks.reduce((previous, current) => {
        try {
          Object.assign(current, {
            journal: JSON.parse(current.journal),
          })
        } catch (err) {
          // err
        }
        previous.push(current)
        return previous
      }, [])
      this.total = res.total
      if (page === 1) {
        this.tasks = tasks
      } else {
        this.tasks = [...this.tasks, ...tasks]
      }
    },
    // 初始化版本号
    initVersion () {
      const { tasks = [], miniprogramType } = this
      if (tasks.length > 0) {
        const task = tasks[0]
        const time = dayjs(task.updateTime).format('YYYY-MM-DD')
        const nowTime = dayjs().format('YYYY-MM-DD')
        if (time === nowTime) {
          this.form.version = `${task.version.substr(0, task.version.length - 1)}${Number.parseInt(task.version[task.version.length - 1], 10) + 1}`
          return
        }
      }
      if (miniprogramType.includes('wechat')) {
        this.form.version = `${dayjs().format('YY.MM.DD')}.0`
      } else if (miniprogramType.includes('alipay') || miniprogramType.includes('toutiao')) {
        this.form.version = `${dayjs().format('YY.MMDD')}.0`
      }
    },
    // 初始化上传表达内容
    initUploadForm () {
      this.form.branch = this.mainBranch
      this.form.description = ''
    },
    // 初始化预览表单内容
    initPreviewForm () {
      this.previewForm.branch = this.mainBranch
      this.previewForm.pagePath = this.pagePath
      this.previewForm.searchQuery = ''
      this.previewForm.scene = ''
    },
    // 打开上传体验版弹窗
    async openUploadPanel () {
      this.uploadVisible = true
      await this.initPromise
      this.initVersion()
    },
    // 打开预览弹窗
    openPreviewPanel () {
      const { miniprogramType } = this
      if (miniprogramType.includes('toutiao')) {
        return utils.alert('该功能等待完善中...')
      }
      this.previewVisible = true
    },
    // 格式化时间
    formatTime (time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    // 显示微信二维码
    showQr (task = {}) {
      if (task.qrCodeUrl) {
        this.qrCodeUrl = task.qrCodeUrl
      } else {
        this.qrCodeUrl = ''
      }
      this.qrVisible = true
    },
    // 上传体验版
    async upload () {
      const {
        form: {
          branch,
          version,
          description,
          experience,
        },
        miniprogramType,
      } = this
      let flag = true
      this.$refs.form.validate(valid => {
        if (!valid) {
          flag = valid
          return false
        }
      })
      if (!flag) return
      const res = await rest.post('/ci/upload', {
        miniprogramType,
        branch,
        version,
        projectDesc: description,
        experience,
      })

      if (res.error_code && res.error_code !== 0) {
        return utils.message(res.error_msg, 'error')
      }

      utils.message('上传体验版任务提交成功', 'success')
      this.uploadVisible = false
    },
    // 新建发布任务
    createTask (task) {
      if (!task.id) return
      const { tasks, miniprogramType } = this
      if (task.type !== miniprogramType) return
      try {
        Object.assign(task, {
          journal: JSON.parse(task.journal),
        })
      } catch (err) {
        // err
      }
      this.tasks = [task, ...tasks]
    },
    // 更新发布中的任务
    updataTask (task) {
      if (!task.id) return
      const { tasks } = this
      const index = tasks.findIndex(item => item.id === task.id)
      try {
        Object.assign(task, {
          journal: JSON.parse(task.journal),
        })
      } catch (err) {
        // err
      }
      this.tasks.splice(index, 1, task)
    },
    // 发起预览任务
    async preview () {
      const {
        previewForm: {
          branch, pagePath, searchQuery, scene,
        },
        miniprogramType,
      } = this
      let flag = true
      this.$refs.form.validate(valid => {
        if (!valid) {
          flag = valid
          return false
        }
      })
      if (!flag) return
      this.previewTaskDetail = { id: '' }
      const res = await rest.post('/ci/preview', {
        miniprogramType,
        branch,
        pagePath,
        searchQuery,
        scene,
      })

      if (res.error_code && res.error_code !== 0) {
        return utils.message(res.error_msg, 'error')
      }

      utils.message('预览任务提交成功', 'success')
      this.previewVisible = false
      this.previewTaskDetail.id = res.id
    },
    // 更新预览任务状态
    updataPreviewTask (previewTask) {
      const { previewTaskDetail, miniprogramType } = this
      if (!previewTask.id || previewTaskDetail.id !== previewTask.id) return
      this.previewTaskDetail = previewTask
      if (previewTask.base64) {
        browserNotify({ content: `${releaseMap.get(miniprogramType)}预览任务发布成功` })
      }
      this.$forceUpdate()
    },
    // 打开新的tab页
    openNewTab (url) {
      window.open(url, '_blacnk')
    },
    // 监听列表滚动事件
    listenerScroll () {
      const taskList = document.querySelector('#task-list-box')
      const taskListHeight = taskList.getBoundingClientRect().height
      taskList.addEventListener('scroll', () => {
        // 距离底部 30px触发
        if (taskList.scrollHeight - taskListHeight - taskList.scrollTop <= 30) {
          this.getMore()
        }
      })
    },
    // 取消监听列表滚动事件
    removeListenerScroll () {
      const taskList = document.querySelector('#task-list-box')
      taskList && taskList.removeEventListener('scroll')
    },
    // 加载更多
    getMore () {
      const { page, limit, total } = this
      if (page * limit < total) {
        // 这里要判断是否能加载更多
        this.page++
        this.getTask()
      }
    },
  },
}
</script>

<style lang='scss' scoped>
@media screen and (max-width: 400px) {
  ::v-deep .el-dialog {
    width: 90vw;
  }
}

.release {
  height: 100%;
}

.qr-image-box {
  width: 270px;
  height: 270px;

  img {
    width: 100%;
    height: 100%;
  }
}

.task-list-box {
  margin-top: 30px;
  overflow-x: hidden;
  overflow-y: auto;
  height: calc(100% - 40px - 30px);

  .task-list {
    height: 100%;
    text-align: left;
  }
}

.task-item {
  font-size: 15px;
  color: $black;
  display: inline-block;
  margin: 0 15px 15px 0;
  border-radius: 15px;
  width: 280px;
  min-width: 280px;
  vertical-align: top;
}

.line {
  $height: 25px;
  min-height: $height;
  position: relative;
  margin-bottom: 5px;

  .left-label {
    font-size : 12px;
    color: $grey;
    width: 80px;
    position: absolute;
    left: 0;
    top: 0;
  }

  .right-content {
    padding-left: 80px;
    display: inline-block;
  }
}

.f-blue, .f-red, .f-yellow {
  cursor: pointer;
}

.icon-qr {
  width: 20px;
  height: 20px;
  background-image: url('@assets/images/icon/icon-qr.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
}

.qr {
  width: 200px;
  height: 200px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin: 0 auto;
}

.lzj_wechat {
  @extend .qr;

  background-image: url('@assets/images/qr/lzj-wechat.jpg');
}

.qr-box {
  @extend .qr;

  img {
    width: 100%;
    height: 100%;
  }
}

.text-center {
  text-align: center;
}
</style>
