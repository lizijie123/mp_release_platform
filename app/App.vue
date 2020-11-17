<template>
  <div>
    <transition :name="transitionName">
      <keep-alive v-if="$route.meta.keepAlive">
        <router-view :class="'view-router' + (showHeader ? ' view-router-header' : '')"></router-view>
      </keep-alive>
      <router-view :class="'view-router' + (showHeader ? ' view-router-header' : '')" v-else></router-view>
    </transition>
  </div>
</template>

<script>
import * as storeConstants from '@store/store_constants'
import channel from '@utils/channel'

export default {

  data () {
    return {
      // 转场动画类型用于制作移动端翻页效果，未完成
      // 转场动画类型 slide-left slide-right none
      transitionName: '',
      // tabbar对应的组件的路由名
      tabbar: [
        'home',
        'catagory',
        'cart',
        'user',
      ],
      // 在这里配置不需要动画的路由跳转，ex: [to路由的path属性，from路由的path属性]
      noTransition: [
        ['/search', '/catagory'],
        ['/catagory', '/search'],
      ],
    }
  },

  mounted () {
    document.body.addEventListener('touchmove', () => {
      if (!this.$store.state.isTouchMove) {
        this.$store.commit(storeConstants.ISTOUCHMOVE, {
          isTouchMove: true,
        })
      }
    }, false)
  },

  computed: {
    showHeader () {
      return !!this.$store.state?.headerComponent?.showHeader && !channel.isApplet()
    },
  },
}
</script>

<style lang="scss">
@import '@assets/scss/global.scss';

// 当前转场动画效果待定
.view-router, .skeleton-screen {
  width: 100%;
  position: absolute;
  left: 0;
  will-change: left, opacity;
  transition-duration: .3s;
  transition-property: left, opacity;
  transition-timing-function: cubic-bezier(.55, 0, .1, 1);
}

.slide-left-enter, .slide-right-leave-active {
  opacity: 0;
  left: 100vw;
}

.slide-left-leave-active, .slide-right-enter {
  opacity: 0;
  left: -100vw;
}
</style>
