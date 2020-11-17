<template>
  <div>
    <release :miniprogramType="miniprogramType" :pagePath="pagePath" :mainBranch="mainBranch"></release>
  </div>
</template>

<script>
import release from '@components/release/index'

export default {
  // lizj字节跳动小程序发布页
  name: 'lzj_toutiao',

  components: {
    [release.name]: release,
  },

  data () {
    return {
      // 小程序类型
      miniprogramType: 'lzj_toutiao',
      // 小程序启动页面
      pagePath: 'pages/index/index',
      // 默认发布的分支
      mainBranch: 'master',
    }
  },
}
</script>
