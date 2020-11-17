<template>
  <div class="app-container">
    <div class="btn-box">
      <el-button class="create-btn" type="primary" icon="el-icon-edit" @click="openCreate">添加用户</el-button>
    </div>
    <div :class="'table-box' + (!isOpenNav ? ' table-box-hide-aside' : '')">
      <el-table :data="list" border height="100%" style="width: 100%">
        <el-table-column align="center" label="序号" width="50">
          <template slot-scope="scope">
            {{scope.$index + 1}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="用户ID" prop="id" width="150"></el-table-column>
        <el-table-column align="center" label="用户名" prop="account" width="150"></el-table-column>
        <el-table-column v-if="infoMember.role === 0" align="center" label="密码" prop="password" width="150"></el-table-column>
        <el-table-column align="center" label="用户昵称" prop="name" width="150"></el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" sortable width="150">
          <template slot-scope="scope">
            {{formatTime(scope.row.createTime)}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="用户角色" width="150">
          <template slot-scope="scope">
            {{formatRole(scope.row.role)}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="开发者标识" width="150">
          <template slot-scope="scope">
            {{`ci机器人${scope.row.identification}`}}
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="updateUser(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini" @click="deleteUser(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog :title="userPanelType === 'create' ? '添加用户' : '修改用户信息'" :visible.sync="userVisible" center :append-to-body="true" label-width="100px">
      <el-form ref="form" :rules="rules" :model="form" status-icon>
        <el-form-item label="用户名: " prop="account">
          <el-input v-model="form.account" clearable :disabled="userPanelType === 'updata'"></el-input>
        </el-form-item>
        <el-form-item label="密码: " prop="password">
          <el-input v-model="form.password" :type="userPanelType === 'updata' ? 'text': 'password'" auto-complete="off" clearable :show-password="userPanelType !== 'updata'" :disabled="userPanelType === 'updata'"></el-input>
        </el-form-item>
        <el-form-item label="昵称: " prop="name">
          <el-input v-model="form.name" clearable :disabled="userPanelType === 'updata'"></el-input>
        </el-form-item>
        <el-form-item label="角色: " prop="role">
          <el-select v-model="form.role" placeholder="请选择用户角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开发者标识: " prop="identification">
          <el-select v-model="form.identification" placeholder="请选择用户开发者标识" :disabled="userPanelType === 'updata'">
            <el-option
              v-for="item in identificationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userVisible = false">取 消</el-button>
        <el-button type="primary" @click="createOrUpdataUser">确 定</el-button>
      </div>
    </el-dialog>
    <div class='pagination-box'>
      <el-pagination
        layout="total, prev, pager, next"
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
  Dialog,
  Form,
  FormItem,
  Select,
  Option,
  Input,
  Pagination,
} from 'element-ui'
import rest from '@utils/rest'
import * as utils from '@utils/index'
import * as dayjs from 'dayjs'
import { mapState } from 'vuex'

export default {
  // 用户管理
  name: 'user',

  components: {
    [Button.name]: Button,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Dialog.name]: Dialog,
    [Form.name]: Form,
    [FormItem.name]: FormItem,
    [Select.name]: Select,
    [Option.name]: Option,
    [Input.name]: Input,
    [Pagination.name]: Pagination,
  },

  data () {
    return {
      // 用户列表
      list: [],
      // 总记录数
      total: 0,
      // 页数
      page: 1,
      // 每页记录数
      limit: 10,
      // 控制用户弹窗显隐
      userVisible: false,
      // 用户弹窗类型 create or updata
      userPanelType: '',
      // 上传表单
      form: {
        // 用户名
        account: '',
        // 密码
        password: '123456',
        // 昵称
        name: '',
        // 角色
        role: '',
        // 开发者标识
        identification: '',
      },
      // 检验规则
      rules: {
        account: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
          },
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
          },
        ],
        role: [
          {
            required: true,
            message: '请选择角色',
            trigger: 'blur',
          },
        ],
        identification: [
          {
            required: true,
            message: '请选择开发者标识',
            trigger: 'blur',
          },
        ],
      },
      // 角色配置
      roleOptions: [
        {
          value: 1,
          label: '管理员',
        },
        {
          value: 2,
          label: '开发/测试/运营',
        },
        {
          value: 3,
          label: '普通用户',
        },
      ],
      // 开发者标识
      identificationOptions: [],
    }
  },

  activated () {
    this.init()
  },

  computed: {
    ...mapState({
      // 左侧菜单是否展开
      isOpenNav: state => state.isOpenNav,
      // 用户信息
      infoMember: state => state.infoMember,
    }),
  },

  methods: {
    // 初始化
    async init () {
      await this.getList()
      this.initIdentificationOptions()
      this.initForm()
    },
    // 初始化表单
    initForm () {
      this.form.account = ''
      this.form.password = '123456'
      this.form.name = ''
      this.form.role = ''
      this.form.identification = ''
    },
    // 获取用户列表
    async getList () {
      const { page, limit } = this
      const res = await rest.get('/user/all', {
        page,
        limit,
      })
      if (res.error_code && res.error_code !== 0) {
        return utils.message(res.error_msg, 'error')
      }
      this.list = res.users
      this.total = res.total
    },
    // 初始化开发者标识
    initIdentificationOptions () {
      const { list } = this
      let identificationOptions = []
      for (let i = 1; i <= 30; i++) {
        identificationOptions.push(i)
      }
      const notIdentificationOptions = list.reduce((previous, current) => {
        if (current.identification && !previous.includes(current.identification)) {
          previous.push(Number.parseInt(current.identification, 10))
        }
        return previous
      }, [])
      identificationOptions = identificationOptions.reduce((previous, current) => {
        if (!notIdentificationOptions.includes(current)) {
          previous.push(current)
        }
        return previous
      }, [])
      this.identificationOptions = identificationOptions.reduce((previous, current) => {
        previous.push({
          value: current,
          label: `ci机器人${current}`,
        })
        return previous
      }, [])
    },
    // 格式化时间
    formatTime (time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    // 格式化角色
    formatRole (role) {
      const map = new Map([
        [0, '超级管理员'],
        [1, '管理员'],
        [2, '开发/测试/运营'],
        [3, '普通用户'],
      ])
      return map.get(role)
    },
    // 打开添加用户弹窗
    openCreate () {
      this.initForm()
      this.userPanelType = 'create'
      this.userVisible = true
    },
    // 创建用户或修改用户信息
    async createOrUpdataUser () {
      const {
        form: {
          account, password, name, role, identification, id,
        },
        userPanelType,
      } = this
      if (userPanelType === 'create') {
        let flag = true
        this.$refs.form.validate(valid => {
          if (!valid) {
            flag = valid
            return false
          }
        })
        if (!flag) return
        const res = await rest.post('/user/register', {
          account,
          password,
          name,
          role,
          identification,
        })
        if (res.error_code && res.error_code !== 0) {
          return utils.message(res.error_msg, 'error')
        }
      } else {
        const res = await rest.patch('/user/change_role', {
          id,
          role,
        })
        if (res.error_code && res.error_code !== 0) {
          return utils.message(res.error_msg, 'error')
        }
      }
      this.userVisible = false
      utils.message('修改成功', 'success')
      this.init()
    },
    // 删除用户
    async deleteUser (user) {
      const flag = await utils.confirm('您确定要删除此用户吗？')
      if (flag) {
        const res = await rest.del('/user/delete', {
          id: user.id,
        })
        if (res.error_code && res.error_code !== 0) {
          return utils.message(res.error_msg, 'error')
        }
        utils.message('删除成功', 'success')
        this.init()
      }
    },
    // 修改用户信息
    async updateUser (user) {
      this.userPanelType = 'updata'
      this.userVisible = true

      this.form.account = user.account
      this.form.password = user.password
      this.form.name = user.name
      this.form.role = user.role
      this.form.identification = user.identification
      this.form.id = user.id
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

::v-deep .el-form-item__content {
  text-align: right;
}

::v-deep .el-input {
  width: calc(100% - 100px);
}

::v-deep .el-select > .el-input {
  width: 100%;
}

::v-deep .el-select {
  width: calc(100% - 100px);
}

::v-deep .el-form-item__label {
  width: 100px;
}

.pagination-box {
  width: 100%;
  text-align: right;
  margin-top: 10px;
}
</style>
