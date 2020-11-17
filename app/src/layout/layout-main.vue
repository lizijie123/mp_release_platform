<template>
  <el-main class="layout-sub-main">
    <transition name="fade" mode="out-in">
      <keep-alive v-if="$route.meta.keepAlive">
        <router-view class="main-body"></router-view>
      </keep-alive>
    </transition>
  </el-main>
</template>

<script>
import { Main } from 'element-ui'

export default {
  name: 'layout-main',

  components: {
    [Main.name]: Main,
  },

  data () {
    return {}
  },
}
</script>

<style lang='scss' scoped>
.layout-sub-main {
  color: #666666;
  height: calc(100vh - 60px);
  width: 100%;
  overflow: visible;
  min-width: fit-content;
  padding: 0;
  position: relative;

  .main-body {
    background-color: #ffffff;
    padding: 20px;
    height: 100%;
    width: 100%;
  }

  .tips {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    font-size: 20px;
    color: $blue;
  }
}
</style>
