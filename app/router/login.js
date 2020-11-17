const member = [
  {
    path: '/login',
    name: 'password_login',
    component: () => import('@src/login/index'),
    meta: {
      keepAlive: true,
    },
  },
]

export default member
