<template>
  <div class="app-container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>个人信息</el-breadcrumb-item>
    </el-breadcrumb>
    <br>

    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <div class="text-center">

              <el-upload
                  class="avatar-uploader"
                  action="http://localhost:8080/upload"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess">
                <img v-if="imageUrl" :src="imageUrl" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>

            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <i class="el-icon-user"></i>用户名称
                <div class="pull-right">{{ user.userName }}</div>
              </li>
              <li class="list-group-item">
                <i class="el-icon-mobile-phone"></i>手机号码
                <div class="pull-right">{{ user.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <i class="el-icon-message"></i>用户邮箱
                <div class="pull-right">{{ user.email }}</div>
              </li>
              <li class="list-group-item">
                <i class="el-icon-office-building"></i>所属部门
                <div class="pull-right" v-for="dept in user.sysDept">
                  {{ dept.deptName }} /
                </div>
              </li>
              <li class="list-group-item">
                <i class="el-icon-s-custom"></i>所属角色
                <div class="pull-right">{{ user.sysRole.roleName }}</div>
              </li>
              <li class="list-group-item">
                <i class="el-icon-s-grid"></i>创建日期
                <div class="pull-right">{{ user.createTime |dateFormat }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <div slot="header">
            <span>基本资料</span>
          </div>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="user"/>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd/>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import userInfo from "./userInfo";
import resetPwd from "@/components/userInfo/resetPwd";
// import { getUserProfile } from "@/api/system/user";

export default {
  name: "ProFile",
  components: {userInfo, resetPwd},
  data() {
    return {
      userId1: "",
      user: "",
      activeTab: "userinfo",
      imageUrl: ''
    };
  },
  created() {
    let user = JSON.parse(window.sessionStorage.getItem("user"))
    this.userId1 = user.userId
    this.imageUrl = user.avatar
    this.getUser();
  },
  methods: {
    getUser: async function () {
      const {data: res} = await this.$http.get('sysUser/' + this.userId1)
      // // 如果返回状态为异常状态则报错并返回
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取角色列表失败')
      // }
      this.user = res;
    },
    handleAvatarSuccess(res, file) {
      //调用接口修改数据库
      // console.log(res)
      this.$http.put('sysUser/updataUser', {
        userId: this.userId1,
        avatar: res
      })
      //当数据库修改完成后，重置页面数据
      this.imageUrl = URL.createObjectURL(file.raw);
      //给当前session的img换值
      let item = JSON.parse(window.sessionStorage.getItem("user"));
      item.avatar = this.imageUrl;
      window.sessionStorage.setItem("user", JSON.stringify(item))
    },


  }
};
</script>

<style>
.pull-right {
  float: right !important;
}

.list-group-item {
  border-bottom: 1px solid #e7eaec;
  border-top: 1px solid #e7eaec;
  margin-bottom: -1px;
  padding: 11px 0px;
  font-size: 13px;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 140px;
  height: 140px;
  display: block;
}

.list-group {
  padding-left: 0px;
  list-style: none;
}

.list-group-item {
  border-bottom: 1px solid #e7eaec;
  border-top: 1px solid #e7eaec;
  margin-bottom: -1px;
  padding: 11px 0px;
  font-size: 13px;
}
</style>
