<template>
  <div class="login">
    <div class="bg-top"></div>
    <div class='ellipse-left'></div>
    <div class='ellipse-right'></div>
    <div class='mobile-login-box'>
      <div class="login-box" @keydown.enter="login">
        <el-form :model="form" :rules="rules" ref="loginForm">
          <div class='login-title'>
            小程序发布平台
          </div>
          <el-form-item prop="account">
            <el-input v-model="form.account" placeholder="请输入用户名" clearable prefix-icon="el-icon-s-custom"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="form.password" placeholder="请输入密码" clearable show-password prefix-icon="el-icon-s-opportunity"></el-input>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="isSave">记住用户名密码</el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class='btn' @click="login">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import rest from '@utils/rest'
import {
  Input,
  Button,
  Form,
  FormItem,
  Checkbox,
} from 'element-ui'
import * as utils from '@utils/index'
import * as storeConstants from '@store/store_constants'
import { mapState } from 'vuex'

export default {
  // 登录页
  name: 'login',

  components: {
    [Input.name]: Input,
    [Button.name]: Button,
    [Form.name]: Form,
    [FormItem.name]: FormItem,
    [Checkbox.name]: Checkbox,
  },

  data () {
    return {
      // 是否记住用户名密码
      isSave: false,
      form: {
        // 账号
        account: '',
        // 密码
        password: '',
      },
      // 检验规则
      rules: {
        account: [
          {
            required: true,
            message: '请输入账号名',
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
      },
    }
  },

  activated () {
    if (this?.infoMember?.online) {
      return this.$router.replace('/')
    }
    this.initSetting()
  },

  deactivated () {
    this.form.account = ''
    this.form.password = ''
  },

  computed: {
    ...mapState({
      infoMember: state => state.infoMember,
    }),
  },

  methods: {
    // 登录
    async login () {
      const { form: { account, password } } = this
      let flag = true
      this.$refs.loginForm.validate(valid => {
        if (!valid) {
          flag = valid
          return false
        }
      })
      if (!flag) return
      const res = await rest.get('/user/login', {
        account,
        password,
      })
      if (res.error_code && res.error_code !== 0) {
        return utils.message(res.error_msg, 'error', {
          duration: 5000,
        })
      }
      utils.message('登录成功', 'success')
      rest.saveToken(res.auth_token)
      this.$store.commit(storeConstants.INFOMEMBER, {
        infoMember: res,
      })
      this.savaSetting()
      this.$router.push('/')
    },
    // 初始化账号名密码与设置
    initSetting () {
      if (__CLIENT__) {
        const { account, password, isSave } = JSON.parse(window.localStorage.getItem('loginSetting') || '{}')
        if (account && password && isSave) {
          this.form.account = account
          this.form.password = password
          this.isSave = isSave
        }
      }
    },
    // 将用户名密码与设置记录到storage中
    savaSetting () {
      const { form: { account, password }, isSave } = this
      if (__CLIENT__ && isSave === true) {
        window.localStorage.setItem('loginSetting', JSON.stringify({
          account,
          password,
          isSave,
        }))
      } else if (__CLIENT__) {
        window.localStorage.removeItem('loginSetting')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.login {
  background-color: $white;
  position: relative;

  .bg-top {
    height: 50vh;
    width: 100vw;
    background-color: $blue;
  }

  .ellipse {
    width: 75vw;
    height: 30vw;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    border-radius: 100%;
  }

  .ellipse-left {
    @extend .ellipse;

    left: -25vw;
    background-color: $white;
  }

  .ellipse-right {
    @extend .ellipse;

    left: 50vw;
    background-color: $blue;
  }

  @media screen and (min-width: 401px) {
    .login-box {
      width: 400px;
      padding: 40px 30px 10px;
      position: absolute;
      z-index: 10;
      left: 50%;
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      border: 1px solid $default-background;
      border-radius: 10px;
      box-shadow: 10px 10px 5px #2d3a4b;
      background-color: $white;

      .btn {
        width: 100%;
      }

      .login-title {
        text-align: center;
        font-size: 25px;
        color: $black;
        margin-bottom: 20px;
      }
    }
  }

  @media screen and (max-width: 400px) {
    .mobile-login-box {
      position: absolute;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 3;
      background-color: #2d3a4b;

      .login-box {
        width: 100vw;
        padding: 40px 30px 10px;
        position: absolute;
        z-index: 10;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);

        .btn {
          width: 100%;
        }

        .login-title {
          text-align: center;
          font-size: 18px;
          color: $white;
          margin-bottom: 20px;
        }
      }
    }
  }
}
</style>
