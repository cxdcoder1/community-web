import Vue from 'vue'
import VueRouter from 'vue-router'
import UserLogin from "@/views/UserLogin";
import SysWelcome from "@/views/SysWelcome";
import Homes from "@/views/HomeM.vue";



Vue.use(VueRouter)

const routes = [
  {path: '/', redirect: '/login'},
  {path: '/login', component: UserLogin},
  {
    path: '/home', component: SysWelcome,  redirect: '/welcome',
    children: [
      { path: '/welcome', component: Homes },
    ]
  },
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫,to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作
//挂载路由导航守卫,to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作
//挂载路由导航守卫,to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作
// router.beforeEach((to, from, next) => {
//   if (to.path === '/login')
//     return next();
//
//   //获取token
//   const tokenStr = window.sessionStorage.getItem('token');
//
//   if (!tokenStr)
//     return next('/login');
//
//   next();
//
// });

export default router
