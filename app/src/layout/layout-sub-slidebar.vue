<template functional>
  <el-submenu :index="props.menu.path">
    <template slot="title">
      <i :class="props.menu.meta.icon" v-if="props.menu.meta && props.menu.meta.icon"></i>
      <span>{{props.menu.meta.title}}</span>
    </template>
    <template v-for="item in props.menu.children">
      <el-menu-item v-if="!item.children" :key="item.name" :index="item.path">
        <i :class="item.meta.icon" v-if="item.meta && item.meta.icon"></i>
        <span>{{item.meta.title}}</span>
      </el-menu-item>
      <layout-sub-slidebar v-else :menu="item" :key="item.name"></layout-sub-slidebar>
    </template>
  </el-submenu>
</template>
