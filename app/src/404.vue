<template>
  <div class='page-404'>
    <img class='page-404-bg' :src='page404bg' />
    <div class='btn-box'>
      <div class='to-home-btn' @click="$router.replace('/')">返回首页</div>
      <div class='to-last-btn' @click="$router.go(-1)" v-if="showReturn">返回上一页</div>
    </div>
  </div>
</template>

<script>
import page404bg from '@images/404/404.jpg'
import * as storeConstants from '@store/store_constants'

export default {
  data () {
    return {
      // 404背景图
      page404bg,
      // 是否显示返回上一页
      showReturn: false,
    }
  },

  mounted () {
    if (__SERVER__) return
    const preRoute = this.$store.state[storeConstants.PRE_ROUTE]
    if (preRoute?.path) {
      this.showReturn = true
    }
  },
}
</script>

<style lang='scss' scoped>
.page-404 {
  background-color: $white;

  .page-404-bg {
    width: 100vw;
  }

  @media screen and (max-width: 400px) {
    .btn-box {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;

      .to-home-btn, .to-last-btn {
        $height: 30px;
        height: $height;
        line-height: $height;
        padding: 0 10px;
        border-radius: 5px;
        color: $black;
        background-color: #ffd83b;
      }
    }
  }

  @media screen and (min-width: 401px) {
    .page-404-bg {
      height: 100vh;
    }

    .btn-box {
      position: fixed;
      width: 100vw;
      bottom: 20px;
      display: flex;
      justify-content: space-around;
      margin-top: 20px;

      .to-home-btn, .to-last-btn {
        $height: 30px;
        height: $height;
        line-height: $height;
        padding: 0 10px;
        border-radius: 5px;
        color: $black;
        background-color: $white;
        border: 1px solid $grey;
      }
    }
  }
}
</style>
