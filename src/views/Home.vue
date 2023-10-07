<template>
  <el-container class="container">
    <!-- 头部区域 -->
    <el-header height="80px">
      <!-- logo -->
      <img src="../assets/logo.png" width="100px" style="padding-left: -130px" alt=""/>
      <!-- 顶部标题 -->
      <span style="position: sticky; top: 25px; margin-left: -83%;"> 智慧社区管理后台</span>
      <!-- 顶部标题 -->

      <el-dropdown>
        <!--        <img :src=res.avatar width="50px" height="50px">-->
        <div class="block">
          <el-avatar :size="60" :src=res.avatar></el-avatar>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item><span @click="userInfo1()">个人中心</span></el-dropdown-item>
            <el-dropdown-item><span @click="logout()">退出登录</span></el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

    </el-header>

    <el-container>
      <!-- 侧边栏 -->
      <el-aside class="el-aside" width="175px" style="margin: 0px;padding: 0px">
        <el-menu
            :default-active="activePath"
            :data="menuList"
            text-color="black"
            unique-opened
            router
            background-color="#D3dce6"
            @open="handleOpen"
            @close="handleClose"
            active-text-color="#ffd04b"
            style="margin-left: -45px;">
          <!-- 一级菜单 -->
          <el-submenu  :index="item.menuId+''" v-for="item in menuList" :key="item.id"
                      :disabled="item.status==1"  >
            <template slot="title">
              <i :class="'icon iconfont icon-'+item.icon">&nbsp;&nbsp;</i>
              <span>{{ item.menuName }}</span>
            </template>
            <!-- 二级菜单 -->
            <template v-for="item2 in item.children" >
              <el-submenu @click="saveNavStates"
                          v-if="item2.menuId == 108"
                          :key="item2.menuId" :disabled="item2.status==1" style="padding-left: 5px"
                          >
                <template slot="title">
                  <e-icon :icon-name="item2.icon"></e-icon>
                  <span>{{ item2.menuName }}</span>
                </template>
                <!-- 三级菜单 -->
                <el-menu-item class="el-menu-item"
                              :index="'/' + item3.path" v-for="item3 in item2.children"
                              :key="item3.menuId" :disabled="item3.status==1" style="padding-left: 90px">
                  <e-icon :icon-name="item3.icon"></e-icon>
                  <template slot="title">{{ item3.menuName }}</template>
                </el-menu-item>
              </el-submenu>
              <el-menu-item v-else class="el-menu-item"
                            @click="saveNavState('/'+item2.path)"
                            :index="'/' + item2.path" :key="item2.menuId" :disabled="item2.status==1"
                            style="padding-left: 70px">
                <!-- 图标 -->
                <i :class="'icon iconfont icon-'+item2.icon" >&nbsp;&nbsp;</i>
                <template slot="title">{{ item2.menuName }}</template>
              </el-menu-item>
            </template>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体结构 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import {Dropdown, DropdownMenu, DropdownItem} from 'element-ui';

export default {

  components: {
    'el-dropdown': Dropdown,
    'el-dropdown-menu': DropdownMenu,
    'el-dropdown-item': DropdownItem
  },
  name: "welcomeList",
  $route(fo) {
    this.tabs = JSON.parse(window.localStorage.getItem("tabs")) || [];
    this.path = fo.path;
  },
  watch: {
    $route(fo) {
      this.tabs = JSON.parse(window.localStorage.getItem("tabs")) || [];
      this.path = fo.path;
    },
  },
  data() {
    return {
      // 被激活的链接地址
      activePath: '',
      status: "",
      res: 0, // 初始化一个res变量，用于接收查询
      menuList: [],
      userInfo: [],
      sysUser: {},
      activeIndex: '',
      isShow: true,
      activeColor: '#409EFF'
    }
  },
  created() {
    this.activePath = window.sessionStorage.getItem('activePath')
    this.res = this.$route.query.res; // 将查询参数的值赋给res变量
    this.res = JSON.parse(window.sessionStorage.getItem("user"));
    this.getMenuList();
  },
  methods: {
    userInfo1: function () {
      this.$router.push(
          {path: '/userInfo'},
      )
    },
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    handleSelect(index) {
      this.activeIndex = index
    },
    getUserInfo: async function () {
      //取出当前登录的用户
      let user = JSON.parse(window.sessionStorage.getItem("user"));
      this.sysUser = user;
    },
    // handleOpen(key, keyPath) {
    //   console.log(key, keyPath);
    // },
    // handleClose(key, keyPath) {
    //   console.log(key, keyPath);
    // },
    async getMenuList() {
      let res = await this.$http.get('sysMenu/getTreeMenu/' + this.res.userId);
      this.menuList = res.data.data;
    },
    index() {
      this.$router.push("/index")
    },
    saveNavState(path){
      //点击二级菜单的时候保存被点击的二级菜单信息
      window.sessionStorage.setItem("activePath",path);
    },

  },


}
</script>


<style lang="less" scoped>


html, body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

.container {
  overflow: auto;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;

}

.container {
  height: 100vh;
  width: 100vw;
}

.el-main {
  height: auto;

}


.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}

.el-icon-arrow-down {
  font-size: 12px;
}

.el-container {
  margin-top: 0px;

}

.avatar {
  height: 50px;
  width: 100px;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  height: 100%;
}

.el-header div {
  display: flex;
  align-items: center;

}

.el-header div span {
  margin-top: 10px;
  margin-right: 10px;
}

.el-footer {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #D3DCE6;
  color: #333;
  text-align: center;
  line-height: 200px;

}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  //text-align: center;
  line-height: 20px;
}

body > .el-container {
  margin-bottom: 40px;

}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}

.el-dropdown-menu {
  transition: opacity 0.3s ease;
}


</style>