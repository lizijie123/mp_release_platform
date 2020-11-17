<template>
  <aside class="sidebar" :class="!isOpenNav ? 'sidebar-hide' : ''">
    <el-menu :default-active="selectMenu" class="sidebar-menu" :collapse="!isOpenNav"
      :collapse-transition="false" :router="true">
      <template v-for="menu in premissions">
        <el-menu-item v-if="!menu.children" :key="menu.name" :index="menu.path">
          <i :class="menu.meta.icon" v-if="menu.meta && menu.meta.icon"></i>
          <span>{{menu.meta.title}}</span>
        </el-menu-item>
        <layout-sub-slidebar v-else :key="menu.name" :menu="menu"></layout-sub-slidebar>
      </template>
    </el-menu>
  </aside>
</template>

<script>
import { mapState } from 'vuex'
import {
  Menu,
  MenuItem,
  Submenu,
} from 'element-ui'
import LayoutSubSlidebar from './layout-sub-slidebar'

export default {
  name: 'layout-slidebar',

  components: {
    'layout-sub-slidebar': LayoutSubSlidebar,
    [Menu.name]: Menu,
    [MenuItem.name]: MenuItem,
    [Submenu.name]: Submenu,
  },

  data () {
    return {
      // 用户可访问的页面列表
      premissions: [],
    }
  },

  activated () {
    this.premissions = this.getPermissions(this.$router.options.routes.filter(route => route.name === 'layout')[0].children)
    if (this.$route.fullPath === '/') {
      this.$router.push(this.getFirstMenuPath(this.premissions))
    }
  },

  computed: {
    selectMenu () {
      return this.$route.path
    },
    ...mapState({
      infoMember: state => state.infoMember,
      isOpenNav: state => state.isOpenNav,
    }),
  },

  watch: {
    $route () {
      if (this.$route.fullPath === '/') {
        this.$router.push(this.getFirstMenuPath(this.premissions))
      }
    },
  },

  methods: {
    // 获取访问权限
    getPermissions (routers) {
      return routers.reduce((previous, current) => {
        if ((current?.meta?.role == null || current?.meta?.role >= this.infoMember.role) && current.path) {
          if (current.children) {
            Object.assign(current, {
              children: this.getPermissions(current.children),
            })
          }
          if (current.children && current.children.length === 0) {
            Reflect.deleteProperty(current, 'children')
          }
          previous.push(current)
        }
        return previous
      }, [])
    },
    // 自动选择第一个菜单
    getFirstMenuPath (menu) {
      if (menu.length > 0 && menu[0].children && menu[0].children.length > 0) {
        return this.getFirstMenuPath(menu[0].children)
      } else if (menu.length > 0) {
        return menu[0].path
      } else {
        return '/'
      }
    },
  },
}
</script>

<style scoped lang="scss">
.sidebar {
  float: left;
  width: 240px;
  height: 100%;
  border-right: 1px solid #e6e6e6;
  overflow: auto;

  .sidebar-menu {
    border: none;
    height: 100%;
  }
}

.sidebar-hide {
  width: 65px;
}
</style>
