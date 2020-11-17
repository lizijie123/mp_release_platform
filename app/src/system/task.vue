<template>
  <div class="app-container">
    <div class="btn-box">
      小程序类型:
      <el-select v-model="miniprogramType" placeholder="请选择小程序类型" @change="changeMiniprogramType">
        <el-option-group
          v-for="group in miniprogramTypes"
          :key="group.label"
          :label="group.label">
          <el-option
            v-for="item in group.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled">
          </el-option>
        </el-option-group>
      </el-select>
    </div>
    <div :class="'table-box' + (!isOpenNav ? ' table-box-hide-aside' : '')">
      <el-table :data="list" border height="100%" style="width: 100%">
        <el-table-column align="center" label="序号" width="50">
          <template slot-scope="scope">
            {{scope.$index + 1}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="任务ID" prop="id" width="150"></el-table-column>
        <el-table-column align="center" label="状态" width="150">
          <template slot-scope="scope">
            <span :class="(scope.row.status === '发布成功' ? 'f-blue' : '') + (scope.row.status === '发布中' ? 'f-yellow' : '') + (scope.row.status === '发布失败' ? 'f-red' : '')">{{scope.row.status}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="分支" prop="branch" width="150"></el-table-column>
        <el-table-column align="center" label="版本号" prop="version" width="150"></el-table-column>
        <el-table-column align="center" width="150" label="上传者">
          <template slot-scope="scope">
            {{(!scope.row.name || scope.row.name === scope.row.account) ? scope.row.account : `${scope.row.name}(${scope.row.account})`}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="上传者标识" prop="identification" width="150">
          <template slot-scope="scope">
            {{`ci机器人${scope.row.identification}`}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" sortable width="150">
          <template slot-scope="scope">
            {{formatTime(scope.row.createTime)}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="描述" prop="desc" width="150"></el-table-column>
        <el-table-column align="center" label="错误信息" width="150">
          <template slot-scope="scope">
            <span class='f-red'>{{scope.row.errorMessage}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini">
              <el-popover placement="bottom" title="日志" width="300" trigger="click">
                <template v-for="(item, j) in scope.row.journal">
                  <div class='line' :key="j">
                    <span class='f-grey f-s-12'>{{item.time}}:</span>
                    <span class='f-black f-s-15'>{{item.message}}</span>
                  </div>
                </template>
                <div class='line' slot="reference">
                  <span class='left-label'>查看日志</span>
                </div>
              </el-popover>
            </el-button>
            <el-button type="danger" size="mini" @click="deleteTask(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class='pagination-box'>
      <el-pagination
        layout="total, prev, pager, next, jumper"
        :total="total"
        @current-change="changeList">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import {
  Button,
  Table,
  TableColumn,
  Select,
  OptionGroup,
  Popover,
  Option,
  Pagination,
} from 'element-ui'
import rest from '@utils/rest'
import * as utils from '@utils/index'
import dayjs from 'dayjs'
import { mapState } from 'vuex'

export default {
  // 用户管理
  name: 'user',

  components: {
    [Button.name]: Button,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Select.name]: Select,
    [OptionGroup.name]: OptionGroup,
    [Popover.name]: Popover,
    [Option.name]: Option,
    [Pagination.name]: Pagination,
  },

  data () {
    return {
      // 任务列表
      list: [],
      // 总记录数
      total: 0,
      // 页数
      page: 1,
      // 每页记录数
      limit: 10,
      // 小程序类型
      miniprogramTypes: [],
      // 选中的小程序类型
      miniprogramType: 'lzj_wechat',
    }
  },

  activated () {
    this.init()
  },

  computed: {
    ...mapState({
      isOpenNav: state => state.isOpenNav,
      infoMember: state => state.infoMember,
    }),
  },

  methods: {
    // 初始化
    async init () {
      this.initMiniprogramTypes()
      this.page = 1
      this.list = []
      this.total = 0
      await this.getList()
    },
    // 初始化小程序类型
    initMiniprogramTypes () {
      const { infoMember } = this
      const miniprogramTypes = [
        {
          label: 'lizj小程序',
          role: 0,
          options: [
            {
              value: 'lzj_wechat',
              label: 'lizj微信小程序',
              disabled: false,
            },
            {
              value: 'lzj_alipay',
              label: 'lizj支付宝小程序',
              disabled: false,
            },
          ],
        },
      ]
      this.miniprogramTypes = miniprogramTypes.reduce((previous, current) => {
        if (current.role == null || infoMember.role <= current.role) {
          previous.push(current)
        }
        return previous
      }, [])
    },
    // 获取任务列表
    async getList () {
      const { miniprogramType, page, limit } = this
      const res = await rest.get('/task/getByType', {
        miniprogramType,
        page,
        limit,
      })
      if (res.error_code && res.error_code !== 0) {
        return utils.message(res.error_msg, 'error')
      }
      const list = res.tasks.reduce((previous, current) => {
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
      this.list = list
    },
    // 格式化时间
    formatTime (time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    // 删除任务
    async deleteTask (task) {
      const flag = await utils.confirm('您确定要删除此任务吗？')
      if (flag) {
        const res = await rest.del('/task/delete', {
          id: task.id,
        })
        if (res.error_code && res.error_code !== 0) {
          return utils.message(res.error_msg, 'error')
        }
        utils.message('删除成功', 'success')
        this.init()
      }
    },
    // 修改小程序类型
    changeMiniprogramType () {
      this.init()
    },
    // 改变page
    changeList (e) {
      this.page = e
      this.getList()
    },
  },
}
</script>

<style lang='scss' scoped>
.table-box {
  height: calc(100% - 40px - 30px - 40px);
  width: calc(100vw - 240px - 40px);
  overflow: auto;

  &.table-box-hide-aside {
    width: calc(100vw - 65px - 40px);
  }
}

.btn-box {
  margin-bottom: 30px;
}

.pagination-box {
  width: 100%;
  text-align: right;
  margin-top: 10px;
}
</style>
