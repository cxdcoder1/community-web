<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header height="80px">
      <!-- logo -->
      <img src="../assets/logo.png" width="100px" style="padding-left: -130px" alt=""/>
      <!-- 顶部标题 -->
      <span style="margin-top: 10px; margin-left: -1300px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;智慧社区管理后台</span>
      <el-dropdown>
    <span class="el-dropdown-link">
      个人信息
      <el-icon class="el-icon--right">
        <arrow-down/>
      </el-icon>
    </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item><span @click="userInfo1()">个人中心</span></el-dropdown-item>
            <el-dropdown-item><span @click="logout()">退出登录</span></el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-header>

    <el-container>
      <el-aside width="230px">
        <el-menu
            background-color="#545c64"
            text-color="#FFFFFF"
            :data="menuList"
            default-active="2"
            class="el-menu-vertical-demo"
            active-text-color="#409EFF"
            unique-opened
            router
            @select="handleSelect"
            @open="handleOpen"
            @close="handleClose"
            type="selection"
            :reserve-selection="false">
          <el-submenu :index="item.menuId+''" v-for="item in menuList" :key="item.id" :disabled="item.status == '1'">
            <template slot="title">
              <e-icon :icon-name="`${item.icon}`"/>
              <span>{{ item.menuName }}</span>
            </template>
            <el-menu-item :index="'/' + item2.path" v-for="item2 in item.children" :key="item2.menuId"
                          :disabled="item2.status == '1'"
                          :style="{ color: activeIndex === '/' + item2.path ? activeColor : '' }">
              <e-icon :icon-name="`${item2.icon}`"/>
              <template slot="title">{{ item2.menuName }}</template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 内容-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>


  <!--  <el-button type="info" @click="userInfo()"> 个人中心</el-button>-->
  <!--  <el-button type="info" @click="logout()"> 退出</el-button>-->

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
  data() {
    return {
      res: 0, // 初始化一个res变量，用于接收查询
      menuList: [],
      userInfo: [],
      sysUser: {},
      activeIndex: '',
      isShow: true,
      activeColor: '#409EFF'
    }
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
    // handleCommand(command) {
    //   this.$message('click on item ' + command);
    // },
    getUserInfo: async function () {
      //取出当前登录的用户
      let user = JSON.parse(window.sessionStorage.getItem("user"));
      this.sysUser = user;
    },
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    async getMenuList() {
      // let user = JSON.parse(window.sessionStorage.getItem('user'));
      console.log(this.res.userId)
      let res = await this.$http.get('sysMenu/getTreeMenu/' + this.res.userId);
      this.menuList = res.data.data;
    },
    index() {
      this.$router.push("/index")
    },
    // out() {
    //   window.sessionStorage.clear();
    //   this.$router.push("/login")
    // },


  },

  created() {
    this.res = this.$route.query.res; // 将查询参数的值赋给res变量
    // console.log(this.$route.query.res)
    // if(this.res==null){
    //   this.res=2
    // }
    this.res = JSON.parse(window.sessionStorage.getItem("user"));
    this.getMenuList();
    // this.getUserInfo();
  }
}
</script>

<style lang="less" scoped>
.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}

.el-icon-arrow-down {
  font-size: 12px;
}

.el-container {
  margin-top: -10px;

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