<template>
  <div class="home">
    <el-col :span="24" class='layout-header'>
      <layout-header></layout-header>
    </el-col>
    <el-col :span="24" class='layout-body'>
      <layout-slidebar></layout-slidebar>
      <div :class="'layout-main' + (!isOpenNav ? ' layout-main-hide-aside' : '')">
        <layout-main ></layout-main>
      </div>
    </el-col>
  </div>
</template>

<script>
import { Col, Container } from 'element-ui'
import { mapState } from 'vuex'
import layoutHeader from './layout-header'
import layoutSlidebar from './layout-slidebar'
import layoutMain from './layout-main'

export default {
  // 首页
  name: 'home',

  components: {
    [Col.name]: Col,
    [Container.name]: Container,
    [layoutHeader.name]: layoutHeader,
    [layoutSlidebar.name]: layoutSlidebar,
    [layoutMain.name]: layoutMain,
  },

  computed: {
    ...mapState({
      infoMember: state => state.infoMember,
      isOpenNav: state => state.isOpenNav,
    }),
  },

  async activated () {
    const { infoMember = {} } = this
    if (!infoMember.online) {
      this.$router.push('/login')
    }
  },
}
</script>

<style lang="scss" scoped>
.home {
  .layout-header {
    position: absolute;
  }

  .layout-body {
    padding-top: 60px;
    height: 100vh;

    .layout-main {
      overflow: auto;
      margin-left: 240px;
      height: calc(100vh - 60px);
      background-color: #EBEEF5;
      overflow: hidden;
      width: calc(100vw - 240px);

      &.layout-main-hide-aside {
        margin-left: 65px;
        width: calc(100vw - 65px);
      }
    }
  }
}
</style>
