export default {
  routes: [
    {
      path: '/',
      redirect: '/monitor'
    },
    {
      path: '/monitor',
      name: '监控',
      component: resolve => require(['@/pages/monitor'], resolve),
    }
  ]
};
