<template>
  <div>
    <el-form :model="sysMenu" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="sysMenu.menuName" placeholder="请输入菜单名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="sysMenu.status" placeholder="菜单状态" clearable>
          <el-option
              v-for="dict in dictList"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-button type="primary" icon="el-icon-plus" size="small" >添加角色</el-button>

    <el-table
        ref="multipleTable"
        :data="sysMenuList"
        tooltip-effect="dark"
        style="width: 100%"
        row-key="menuId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column label="菜单名称" width="150">
        <template slot-scope="scope">{{ scope.row.menuName }}</template>
      </el-table-column>
      <el-table-column prop="icon" label="图标" align="center" width="100">
        <template slot-scope="">
          <v-icon>{{icons}}</v-icon>
        </template>
      </el-table-column>
      <el-table-column label="排序" width="120">
        <template slot-scope="scope">{{ scope.row.orderNum }}</template>
      </el-table-column>
      <el-table-column label="权限标识" width="200">
        <template slot-scope="scope">{{ scope.row.perms }}</template>
      </el-table-column>
      <el-table-column label="组件路径" width="200">
        <template slot-scope="scope">{{ scope.row.component }}</template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template slot-scope="scope"> {{ scope.row.status === '0' ? '正常' : '禁用' }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="200">
        <template slot-scope="scope">{{ scope.row.createTime | dateFormat }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="">
          <el-button size="mini" type="text" icon="el-icon-edit" >修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-plus" >新增</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <el-tree
          v-if="rightsList && rightsList.length"
          :data="rightsList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKeys"
          ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button >取消</el-button>
        <el-button type="primary" >确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="新增用户" :visible.sync="show" width="30%">
      <!-- 新增用户表单 -->
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'e-icon',

  data() {
    return {
      setRightDialogVisible: false,
      rightsList: [], // 权限列表数据
      treeProps: {}, // 树组件属性配置
      defKeys: [], // 默认选中项
      show: false, // 是否显示新增用户对话框

      icons:"",

      sysMenu: {
        menuName: '',
        status: ''
      },

      showSearch: true,
      dictList: [
        { label: '正常', value: '0' },
        { label: '禁用', value: '1' }
      ],
      sysMenuList: [], // 列表数据
    };
  },
created() {
  this.getSysMenu();

},
  methods: {
    async getSysMenu() {
      try {

        const {data:res} = await this.$http.post("sysMenu/menuList", this.sysMenu);

        // let _this=this;
        // _this.icon=res.data.icon
        //
        // console.log(res.data.icon);

        this.sysMenuList =res.data;
      } catch (error) {
        console.error(error);
        this.$message.error("获取数据失败");
      }
    },
    handleQuery(){
      this.getSysMenu();
    },
    resetQuery() {
      // 重置查询条件
      this.sysMenu.menuName = '';
      this.sysMenu.status = '';
    },
    // addRole() {
    //   // 添加角色逻辑
    // },
    // editRole() {
    //   // 修改角色逻辑
    // },
    // addChildRole() {
    //   // 新增子角色逻辑
    // },
    // deleteRole() {
    //   // 删除角色逻辑
    // },
    // formatDateTime() {
    //   // 格式化日期时间
    // }
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