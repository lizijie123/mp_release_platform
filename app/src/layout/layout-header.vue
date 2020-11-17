<template>
  <el-header class="header">
    <router-link to="/">
      <div class="logo" :class="!isOpenNav ? 'logo-hide' : ''">
        <div class="logo-image"></div>
        <span class="text">小程序发布平台</span>
      </div>
    </router-link>
    <div class="content">
      <i v-if="isOpenNav" class="el-icon-s-fold toggle" @click="navOpenToggle" title="隐藏菜单"></i>
      <i v-else class="el-icon-s-unfold toggle" @click="navOpenToggle" title="显示菜单"></i>
    </div>
    <div>
      <span>{{title}}</span>
    </div>
    <el-dropdown trigger="hover" class="user">
      <span class="user-info">
        {{infoMember.name ? `${infoMember.name}(${infoMember.account})` : infoMember.account}}
        <i class="el-icon-s-custom" style="margin-left: 10px"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <!-- 后面考虑做 主题 & i18 -->
        <!-- <el-dropdown-item divided>主题设置</el-dropdown-item> -->
        <!-- <el-dropdown-item>语言选择</el-dropdown-item> -->
        <el-dropdown-item>
          <div @click="openAccount">个人信息</div>
        </el-dropdown-item>
        <el-dropdown-item>
          <div @click="logout">退出登录</div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-dialog :visible.sync="accountVisible" title="编辑个人信息" center :append-to-body="true">
      <el-form :model="form">
        <el-form-item prop="name">
          <el-input v-model="form.name" placeholder="修改昵称" clearable prefix-icon="el-icon-s-custom"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" placeholder="修改登录密码" clearable prefix-icon="el-icon-s-opportunity"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="accountVisible = false">取 消</el-button>
        <el-button type="primary" @click="changeAccount">确 定</el-button>
      </span>
    </el-dialog>
  </el-header>
</template>

<script>
import { mapState } from 'vuex'
import * as storeConstants from '@store/store_constants'
import {
  Header,
  DropdownMenu,
  Dropdown,
  DropdownItem,
  Dialog,
  Input,
  Form,
  FormItem,
  Button,
} from 'element-ui'
import * as utils from '@utils/index'
import rest from '@utils/rest'

export default {
  name: 'layout-header',

  components: {
    [Header.name]: Header,
    [Dropdown.name]: Dropdown,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [Dialog.name]: Dialog,
    [Input.name]: Input,
    [Form.name]: Form,
    [FormItem.name]: FormItem,
    [Button.name]: Button,
  },

  data () {
    return {
      // 个人信息编辑弹窗
      accountVisible: false,
      // 上传表单
      form: {
        // 昵称
        name: '',
        // 新密码
        password: '',
      },
    }
  },

  deactivated () {
    this.form.name = ''
    this.form.password = ''
  },

  computed: {
    // 标题
    title () {
      if (this.$route?.matched && this.$route?.matched?.length > 0) {
        const route = this.$route.matched[this.$route.matched.length - 1]
        return route?.meta?.title || ''
      }
      return ''
    },
    ...mapState({
      // 菜单栏是否展开
      isOpenNav: state => state.isOpenNav,
      // 会员信息
      infoMember: state => state.infoMember,
    }),
  },

  methods: {
    // 切换菜单栏打开关闭状态
    navOpenToggle () {
      this.$store.commit(storeConstants.IS_OPEN_NAV, {
        [storeConstants.IS_OPEN_NAV]: !this.$store.state.isOpenNav,
      })
    },
    // 退出登录
    async logout () {
      await this.$store.dispatch('logout')
      this.$router.replace('/login')
    },
    // 打开个人信息编辑弹窗
    openAccount () {
      this.accountVisible = true
    },
    // 修改个人信息
    async changeAccount () {
      const { form: { name, password } } = this
      if (!name && !password) {
        return utils.message('请输入需要修改的个人信息', 'error')
      }
      const res = await rest.patch('/user/change_password_name', {
        name,
        password,
      })
      if (res.error_code && res.error_code !== 0) {
        return utils.alert(res.error_msg)
      }
      this.accountVisible = false
      utils.message('修改成功，请重新登录', 'success')
      this.logout()
    },
  },
}
</script>

<style scoped lang="scss">
.header {
  line-height: 60px;
  height: 60px;
  color: #ffffff;
  background-color: #409EFF;
  border-color: #409EFF;
  width: 100vw;

  div {
    display: inline-block;
  }

  .logo {
    width: 240px;
    border-right: 1px solid #c0c4cc;
    margin-left: -20px;
    text-align: center;
    font-size: 20px;
    cursor: pointer;

    .logo-image {
      display: inline-block;
      width: 40px;
      height: 40px;
      vertical-align: middle;
      background-image: url('@assets/images/logo/logo-circular.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }

    .text {
      color: $white;
    }
  }

  .logo-hide {
    width: 65px;

    .text {
      display: none;
    }
  }

  .content {
    padding: 0 20px;

    .toggle {
      font-size: 22px;
      cursor: pointer;
      vertical-align: middle;
      margin-right: 10px;
    }
  }

  .user {
    float: right;
    cursor: pointer;

    .user-info {
      color: #ffffff;

      i {
        vertical-align: middle;
      }
    }
  }
}
</style>
