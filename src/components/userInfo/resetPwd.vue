<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model.trim="user.oldPassword" placeholder="请输入旧密码" type="password" show-password onkeyup="this.value=this.value.replace(/[, ]/g,'')"/>
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model.trim="user.newPassword" placeholder="请输入新密码" type="password" show-password onkeyup="this.value=this.value.replace(/[, ]/g,'')"/>
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model.trim="user.confirmPassword" placeholder="请确认新密码" type="password" show-password onkeyup="this.value=this.value.replace(/[, ]/g,'')"/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>

export default {
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    return {
      user: {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined
      },
      // 表单校验
      rules: {
        oldPassword: [
          {required: true, message: "旧密码不能为空", trigger: "blur"}
        ],
        newPassword: [
          {required: true, message: "新密码不能为空", trigger: "blur"},
          {min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur"},
          // { required: true, validator: equalToOldPassword, trigger: "blur" }
        ],
        confirmPassword: [
          {required: true, message: "确认密码不能为空", trigger: "blur"},
          {required: true, validator: equalToPassword, trigger: "blur"}
        ]
      }
    };
  },
  methods: {
    submit() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          let user1 = JSON.parse(window.sessionStorage.getItem("user"))
          if (user1.password == this.user.oldPassword) {
            this.$http.put('sysUser/updataUser', {
              userId: user1.userId,
              password: this.user.newPassword
            }).then(res=>{
              if (res.status == 200) {
                this.$message.success("修改成功,请重新登录!")
                // console.log(user)
                this.user.newPassword = ""
                this.user.oldPassword = ""
                this.user.confirmPassword = ""
                //修改成功后重新登录
                window.sessionStorage.clear()
                this.$router.push('/login')
              }
            })
          } else {
            this.$message.error("修改失败!旧密码错误")
          }

        }
      });
    },
    close() {
      // this.$tab.closePage();
      this.$router.push('/home')
    }
  }
};
</script>
