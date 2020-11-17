const layout = [
  {
    path: '/',
    name: 'layout',
    meta: {
      keepAlive: true,
      login: true,
    },
    component: () => import('@src/layout/index'),
    children: [
      {
        path: '/lzj',
        name: 'lzj',
        meta: {
          role: 3,
          title: 'lizj小程序',
          icon: 'icon-lzj-logo',
          keepAlive: true,
        },
        component: () => import('@src/layout/layout-empty'),
        children: [
          {
            path: '/lzj/wechat',
            name: 'lzj-wechat',
            meta: {
              role: 3,
              title: 'lizj微信小程序',
              icon: 'icon-wechat',
              keepAlive: true,
            },
            component: () => import('@src/lzj/wechat'),
          },
          {
            path: '/lzj/alipay',
            name: 'lzj-alipay',
            meta: {
              role: 3,
              title: 'lizj支付宝小程序',
              icon: 'icon-alipay',
              keepAlive: true,
            },
            component: () => import('@src/lzj/alipay'),
          },
        ],
      },
      {
        path: '/system',
        name: 'system',
        meta: {
          role: 1,
          title: '系统管理',
          icon: 'el-icon-s-cooperation',
          keepAlive: true,
        },
        component: () => import('@src/layout/layout-empty'),
        children: [
          {
            path: '/system/user',
            name: 'system-user',
            meta: {
              role: 1,
              title: '用户管理',
              icon: 'el-icon-s-custom',
              keepAlive: true,
            },
            component: () => import('@src/system/user'),
          },
          {
            path: '/system/task',
            name: 'system-task',
            meta: {
              role: 1,
              title: '任务管理',
              icon: 'el-icon-s-order',
              keepAlive: true,
            },
            component: () => import('@src/system/task'),
          },
        ],
      },
    ],
  },
]

export default layout
