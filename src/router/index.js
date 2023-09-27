import Vue from 'vue'
import VueRouter from 'vue-router'
import UserLogin from "@/views/UserLogin";
import Home from "@/views/Home";
import SysWelcome1 from "@/views/SysWelcome1.vue";
import userInfo from "@/components/userInfo/index.vue";
import system from "@/components/system/menu.vue";
import user from "@/components/system/user/UserIndex.vue"
// import role from "@/components/system/role/indexList.vue";
import role from "@/components/system/role/index.vue";
import dict from "@/components/system/dict/index.vue";
import data from "@/components/system/dict/data.vue";
import community from "../components/community/zy_cumm.vue";
import dept from "@/components/system/dept/deptView.vue"
import post from "@/components/system/post/postView.vue"
import building from "@/components/community/zy_building.vue"
import unit from "@/components/community/UnitView.vue";
import zy_room from "@/components/community/zy_room";

Vue.use(VueRouter)

const routes = [
    {path: '/', redirect: '/login'},
    {path: '/login', component: UserLogin},
    {
        path: '/home', component: Home, redirect: '/welcome',
        children: [
            {path: '/welcome', component: SysWelcome1},
            {path: '/userInfo', component: userInfo},
            {path: '/menu', component: system},
            {path: '/role', component: role},
            {path: '/dict', component: dict},
            {path: '/dept', component: dept},
            {path: '/data', component: data},
            {path: '/post', component: post},
            {path: '/user', component: user},
            {path: '/building', component: building},
            {path: '/community', component: community},
            {path: '/unit',component: unit},
            {path: '/room',component: zy_room},
            // 路由配置
            {
                path: '/data/:dictId',
                name: 'data',
                component: data
            },
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
