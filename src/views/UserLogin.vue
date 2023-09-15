<template>
  <div class="login_container">
    <!-- 登录盒子 -->

    <div class="login_box">
      <el-card>
      <h2 style="text-align: center;margin-bottom: 0px">智慧社区管理系统</h2>
<!---->
      <!-- 登录表单 -->
      <el-form :model="loginForm" ref="LoginFormRef" :rules="loginFormRules" label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="phonenumber">
          <el-input v-model="loginForm.phonenumber" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-s-cooperation"></el-input>
        </el-form-item>
<!--        滑动-->
        <Vcode :show="isShow" @success="success" @close="close"/>
        <!--                </div>-->

        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login()">登录</el-button>
          <el-button type="info" @click="resetLoginForm()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
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
        phonenumber: '',
        password: ''
      },
      userInfo: {
        phoneNumber: '',
        passWord: ''
      },


      isShow: false, // 验证码模态框是否出现

      loginFormRules: {
        phonenumber: [
          { required: true, message: '请输入登录名', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              const phoneRegex = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
              const isPhoneValid = phoneRegex.test(value);
              const isLengthValid = value.length === 11;

              if (!isPhoneValid || !isLengthValid) {
                callback(new Error('手机号不符合规范且长度必须为11位'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            pattern: /^.{6,15}$/,
            message: '密码长度在 6 到 15 个字符',
            trigger: 'blur'
          }
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
    resetLoginForm(){
      this.$refs.LoginFormRef.resetFields()
    },
    async login() {
      // 发送请求进行登录
      this.isShow = true;
    },
    async success() {
        this.isShow = false; // 通过验证后，需要手动隐藏模态框console.log(res)

      this.userInfo.phoneNumber = this.loginForm.phonenumber;
      this.userInfo.passWord = this.loginForm.password;
      console.log(this.userInfo)

      const {data: res} = await this.$http.post('sysUser/login', this.userInfo);
        if (res.status != 200) {
          return this.$message.error('登录失败:' + res.msg) //console.log("登录失败:"+res.meta.msg)
        }

      this.$message.success('登录成功');
      //保存当前登录的用户
      window.sessionStorage.setItem('user', JSON.stringify(res.user));
      //保存token
      window.sessionStorage.setItem('token', res.token);
      //导航至/home
      return this.$router.push({ path: '/home', query: { res: res.user }});
      // console.log(res)
      // return this.$router.push('/home');
      // console.log(res.data);
      // return this.$router.push({name:'/home',params:{user:res.user}});
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
  margin: 0 auto;
  width: 100vw;
  height: 100vh;
}

.login_box {
  position: relative;
  width: 500px;
  height: 300px;
  margin: 0 auto;
  padding: 100px;

  .avatar_box {
    position: absolute;
    width: 350px;
    height: 300px;
    margin: 0 auto;
  }
}

.login_form {
  bottom: 0;
  width: 380px;
  padding-top:50px;
  box-sizing: border-box;
  margin: 0 auto;
}

.btns {
  margin-top: 10px;
  text-align: center;
}
</style>