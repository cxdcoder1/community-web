<template>
  <div>
    <el-button
        type="primary"
        icon="el-icon-plus"
        size="small"
        @click="Add"
    >添加</el-button>



    <!-- 添加或修改角色对话框 -->
    <el-dialog :title="title" :visible.sync="updateSysMenuShow" width="680px" @close="closeLog()" append-to-body>
      <el-form ref="menusInfoRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="form.roleName" placeholder="请输入角色名称" />
            </el-form-item>
            <el-form-item prop="roleKey">
          <span slot="label">
            <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            权限字符
          </span>
              <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
            </el-form-item>
          <el-form-item label="角色顺序" prop="roleSort">
            <el-input-number v-model="form.roleSort" controls-position="right" :min="0" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio label="1">正常</el-radio>
              <el-radio label="2">停用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单权限">
            <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
            <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
            <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
<!--            <el-tree-->
<!--                class="tree-border"-->
<!--                :data="menuOptions"-->
<!--                show-checkbox-->
<!--                ref="menu"-->
<!--                node-key="id"-->
<!--                :check-strictly="!form.menuCheckStrictly"-->
<!--                empty-text="加载中，请稍候"-->
<!--                :props="defaultProps"-->
<!--            ></el-tree>-->
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveMenu()">确 定</el-button>
        <el-button @click="updateSysMenuShow=f">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>



export default {


  data() {
    return {

      updateSysMenuShow: false,
      menuExpand: false,
      menuNodeAll: false,
      form: {

      },
      // 表单校验
      rules: {
        orderName: [
          {required: true, message: "角色名称不能为空", trigger: "blur"}
        ],
        orderKey: [
          {required: true, message: "角色权限字符不能为空", trigger: "blur"}
        ],
        orderSort: [
          {required: true, message: "顺序不能为空", trigger: "blur"}
        ],
        status: [
          {required: true, message: "状态不能为空", trigger: "blur"}
        ],
      },
      setRightDialogVisible: false,
      dialogVisible: false, // 是否显示新增用户对话框








    };
  },
  created() {


  },

  methods: {


    Add() {
      this.title = "新增菜单";
      this.form = {
        menuType: 'M',
        parentId: '0',
      };
      this.updateSysMenuShow = true;
      this.reset()
      this.menusInfo.parentId = 0
      this.menusInfo.isCache = 1
      this.menusInfo.isFrame = 1

    },






  }
};
</script>

<style scoped lang="less">
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>