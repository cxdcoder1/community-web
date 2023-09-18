import Vue from 'vue'
import VueRouter from 'vue-router'
import UserLogin from "@/views/UserLogin";
import Home from "@/views/Home";
import SysWelcome1 from "@/views/SysWelcome1.vue";
import userInfo from "@/components/userInfo/index.vue";
import system from "@/components/system/menu.vue";
import role from "@/components/system/role/index.vue";

Vue.use(VueRouter)

const routes = [
  {path: '/', redirect: '/login'},
  {path: '/login', component: UserLogin},
  {
    path: '/home', component: Home,  redirect: '/welcome',
    children: [
      { path: '/welcome', component: SysWelcome1 },
      { path: '/userInfo', component: userInfo },
      { path: '/menu', component: system},
      { path: '/role', component: role},
    ]
  },
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫,to表示将要访问的路径，from表示从哪里来，next是下一个要做的操作
router.beforeEach((to, from, next) => {
  if (to.path === '/login')
    return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if (!tokenStr)
    return next('/login');
  next();

});

export default router
