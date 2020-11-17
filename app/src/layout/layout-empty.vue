<template>
  <keep-alive v-if="$route.meta.keepAlive">
    <router-view></router-view>
  </keep-alive>
</template>

<script>
export default {
  name: 'layout-empty',
}
</script>

<style scoped>

</style>
