<template>
  <el-form ref="form" :model="userInfo" :rules="rules" label-width="80px">
    <el-form-item label="用户昵称" prop="nickName">
      <el-input v-model.trim="userInfo.nickName" maxlength="30" onkeyup="this.value=this.value.replace(/[, ]/g,'')"/>
    </el-form-item>
    <el-form-item label="手机号码" prop="phonenumber">
      <el-input v-model.trim="userInfo.phonenumber" maxlength="11" onkeyup="this.value=this.value.replace(/[, ]/g,'')"/>
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model.trim="userInfo.email" maxlength="50" onkeyup="this.value=this.value.replace(/[, ]/g,'')"/>
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="userInfo.sex">
        <el-radio    v-for="dict in userInfoSex"
                     :key="dict.dictValue"
                     :label="dict.dictValue"
        >
          {{ dict.dictLabel }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit(userInfo)">保存</el-button>
      <el-button type="danger" size="mini" @click="close" >关闭</el-button>
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
    return {
      userInfoSex:[],
      userInfo:{},
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
      }
    };
  },
  created() {
    this.getSexs();
    this.userInfo = structuredClone(this.user)
  },
  methods: {
    async getSexs() {
      const {data: res} = await this.$http.get('sysUser/userInfoSex')
      this.userInfoSex=res.data;
      console.log(this.userInfoSex)
    },
    submit: function () {
      this.$refs["form"].validate(async valid => {
        if (valid) {
          const {data: res} = await this.$http.put('sysUser/updataUser', this.userInfo)
          this.$message.success("修改成功");
          // location.reload();
          // console.log(111)
          // console.log(res)
        } else {
          this.$message.error("修改失败")
          return ;
        }
      })
    },
    close() {
      this.$router.push('/home')
    },
  }
};
</script>
