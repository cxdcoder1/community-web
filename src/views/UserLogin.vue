<template>
  <div class="login_container">
    <!-- 登录盒子 -->
    <div class="login_box">
      <h2 style="text-align: center;margin-bottom: 0px">智慧社区管理系统</h2>
<!---->
      <!-- 登录表单 -->
      <el-form :model="loginForm" ref="LoginFormRef" :rules="loginFormRules" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item  prop="username">
          <el-input v-model="loginForm.phonenumber" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-s-cooperation"></el-input>
        </el-form-item>

        <!--                <div>-->
        <Vcode :show="isShow" @success="success" @close="close"/>
        <!--                </div>-->

        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login()">登录</el-button>
          <el-button type="info" @click="resetLoginForm()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import Vcode from "vue-puzzle-vcode";

export default {
  name: 'LoginComponent',
  data() {
    return {
      loginForm: {
        phonenumber: '15888888888',
        password: '123456'
      },

      userInfo:{
        phoneNumber:'',
        passWord:''
      },


      isShow: false, // 验证码模态框是否出现

      loginFormRules: {
        phonenumber: [
          {required: true, message: '请输入登录名', trigger: 'blur'},
          {min: 3, max: 11, message: '登录名长度在 3 到 10 个字符', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 15, message: '密码长度在 6 到 15 个字符', trigger: 'blur'}
        ]
      }
    };
  },
  components: {
    Vcode
  },
  mounted() {

  },
  methods: {
    resetLoginForm() {
      this.$refs.LoginFormRef.resetFields()
    },
    async login() {
      // 发送请求进行登录
      this.isShow = true;
    },
    async success() {
        this.isShow = false; // 通过验证后，需要手动隐藏模态框console.log(res)

      this.userInfo.phonenumber = this.loginForm.phonenumber;
      this.userInfo.password = this.loginForm.password;

      const {data: res} = await this.$http.post('sysUser/login', this.userInfo);
        if (res.status != 200) {
          return this.$message.error('登录失败:' + res.msg) //console.log("登录失败:"+res.meta.msg)
        }

        this.$message.success('登录成功');
        //保存当前登录的用户
        window.sessionStorage.setItem('user', JSON.stringify(res.data));
        //保存token
        window.sessionStorage.setItem('token', res.token);
        //导航至/home
        return this.$router.push({name:'/home',params:{user:res.data}})
      },
    // 用户点击遮罩层，应该关闭模态框
    close() {
      this.isShow = false;
    },
  }
};
</script>

<style lang="less" scoped>

.login_container {
  background-color: #2b5b6b;
  height: 100%;
}

.login_box {
  width: 450px;
  height: 300px;
  background: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

  }
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  margin-top: 10px;
  text-align: center;
}
</style>