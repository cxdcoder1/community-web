<template>
  <div id="building">
  <div class="login_container">
    <!-- 登录盒子 -->
    <div class="login_box">
      <h2 style="text-align: center;color: #ffffff;margin-bottom: 0px" >智慧社区管理系统</h2>
<!---->
      <!-- 登录表单 -->
      <el-form :model="loginForm" ref="LoginFormRef" :rules="loginFormRules" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item  prop="phonenumber">
          <el-input v-model="loginForm.phonenumber" prefix-icon="el-icon-user-solid"  ></el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-s-cooperation" ></el-input>
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
        phonenumber:'',
        password:''
      },


      isShow: false, // 验证码模态框是否出现

      loginFormRules: {
        phonenumber: [
          { required: true, message: '请输入登录名', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误或手机号没有11位', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { pattern: /^.{6,15}$/, message: '密码长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  components: {
    Vcode
  },
  mounted() {

  },
  methods: {


    // 用户点击遮罩层，应该关闭模态框
    close() {
      this.isShow = false;
    },
    resetLoginForm() {
      this.$refs.LoginFormRef.resetFields()
    },
    async login() {
      // 表单验证
      this.$refs.LoginFormRef.validate((valid) => {
        if (valid) {
          // 验证通过，发送请求进行登录
          this.isShow = true;
        } else {
          // 验证不通过，不执行登录操作
          return;
        }
      });
      // 发送请求进行登录
      // this.isShow = true;
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
//       window.sessionStorage.setItem('user', JSON.stringify(res.user));
      window.sessionStorage.setItem('user', JSON.stringify(res.user));
//保存token

      window.sessionStorage.setItem('token', res.JWT);

//导航至/home
      return this.$router.push({ path: '/home', query: { res: res.user}});
// console.log(res)
// return this.$router.push('/home');
// console.log(res.data);
// return this.$router.push({name:'/home',params:{user:res.user}});
    },
      },



};
</script>

<style lang="less" scoped>
#building{
  //background:url("1.png");
  width:100%;
  height:100%;
  position:fixed;
  background-size:100% 100%;
}
.login_container {
  background-color: #2b5b6b;
  width: 100%;
  height: 100%;
  background-image: url("../assets/1.png");
  opacity: 0.8;
  background-repeat: no-repeat;
  background-size: cover;

}
html, body {
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background: #030e21;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  opacity: 0.7;
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