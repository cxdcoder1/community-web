<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="用户昵称" prop="nickName">
      <el-input v-model="user.nickName" maxlength="30"/>
    </el-form-item>
    <el-form-item label="手机号码" prop="phonenumber">
      <el-input v-model="user.phonenumber" maxlength="11"/>
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="user.email" maxlength="50"/>
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="user.sex">
        <el-radio label="0">男</el-radio>
        <el-radio label="1">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="user1.oldPassword" placeholder="请输入旧密码" type="password" show-password/>
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="user1.newPassword" placeholder="请输入新密码" type="password" show-password/>
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="user1.confirmPassword" placeholder="请确认新密码" type="password" show-password/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit(user)">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
// import { updateUserProfile } from "@/api/system/user";

export default {
  props: {
    user: {
      type: Object
    }
  },
  data() {
    const equalToPassword = (rule, value, callback) => {
      if (this.user.newPassword !== value) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    return {
      user1: {
        oldPassword: undefined,
        newPassword: undefined,
        confirmPassword: undefined
      },
      // 表单校验
      rules: {
        nickName: [
          {required: true, message: "用户昵称不能为空", trigger: "blur"}
        ],
        email: [
          {required: true, message: "邮箱地址不能为空", trigger: "blur"},
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phonenumber: [
          {required: true, message: "手机号码不能为空", trigger: "blur"},
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ],
        // oldPassword: [
        //   {required: true, message: "旧密码不能为空", trigger: "blur"}
        // ],
        // newPassword: [
        //   {required: true, message: "新密码不能为空", trigger: "blur"},
        //   {min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur"}
        // ],
        // confirmPassword: [
        //   {required: true, message: "确认密码不能为空", trigger: "blur"},
        //   {required: true, validator: equalToPassword, trigger: "blur"}
        // ]
      }
    };
  },
  methods: {
    submit: function (user) {
      console.log(user)
      this.$refs["form"].validate(async valid => {
        if (valid) {
          if (this.user.password == this.user1.oldPassword) {
            user.password = this.user1.newPassword
            console.log(user.password)
            const {data: res} = await this.$http.put('sysUser/updataUser', user)
            alert("修改成功!")
            location.reload();
            console.log(res)
          } else {
            alert("修改失败")
            return
          }
        }
      });
    },
    close() {
      // this.$tab.closePage();
    }
  }
};
</script>
