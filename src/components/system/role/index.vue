<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="`showSearch`">
      <el-form-item label="角色名称" prop="roleName">
        <el-input
            v-model="queryParams.roleName"
            placeholder="请输入角色名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
            v-model="queryParams.roleKey"
            placeholder="请输入权限字符"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="角色状态" clearable>
          <el-option label="正常" value="0"></el-option>
          <el-option label="停用" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
            v-model="dateRange"
            style="width: 240px"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
        >新增
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
        >导出
        </el-button>
      </el-col>
    </el-row>
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="`showSearch`">
      <el-form-item label="角色名称" prop="roleName">
        <el-input
            v-model="queryParams.roleName"
            placeholder="请输入角色名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
            v-model="queryParams.roleKey"
            placeholder="请输入权限字符"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="角色状态" clearable>
          <el-option label="正常" value="0"></el-option>
          <el-option label="停用" value="1"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
            v-model="dateRange"
            style="width: 240px"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
        >新增
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
        >导出
        </el-button>
      </el-col>
    </el-row>

    <el-table :data="roleList">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="角色编号" width="120">
        <template slot-scope="scope">{{ scope.row.roleId }}</template>
      </el-table-column>
      <el-table-column label="角色名称" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">{{ scope.row.roleName }}</template>
      </el-table-column>
      <el-table-column label="权限字符" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">{{ scope.row.roleKey }}</template>
      </el-table-column>
      <el-table-column label="显示顺序" width="100">
        <template slot-scope="scope">{{ scope.row.roleSort }}</template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-switch
              v-model="scope.row.status"
              active-value="0"
              inactive-value="1"
              @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateFormat }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="scope.row.roleId !== 1">
          <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
          >修改
          </el-button>
          <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.Current"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryParams.Size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="roleList.length">
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: 'UserRole',
  data() {
    return {
      activePath: "", // initial value here
      // 查询参数
      queryParams: {
        Current: 1,
        Size: 1,
        roleName: undefined,
        roleKey: undefined,
        status: undefined,
        createTime: undefined,
        updateTime: undefined,
      },

      // currentPage: 1,
      // pageSize: 1,
      roleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      menuExpand: false,
      menuNodeAll: false,
      deptExpand: true,
      deptNodeAll: false,
      // 日期范围
      dateRange: [],
      // 数据范围选项
      dataScopeOptions: [
        {
          value: "1",
          label: "全部数据权限"
        },
        {
          value: "2",
          label: "自定数据权限"
        },
        {
          value: "3",
          label: "本部门数据权限"
        },
        {
          value: "4",
          label: "本部门及以下数据权限"
        },
        {
          value: "5",
          label: "仅本人数据权限"
        }
      ],
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [],

      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 表单校验
      rules: {
        roleName: [
          {required: true, message: "角色名称不能为空", trigger: "blur"}
        ],
        roleKey: [
          {required: true, message: "权限字符不能为空", trigger: "blur"}
        ],
        roleSort: [
          {required: true, message: "角色顺序不能为空", trigger: "blur"}
        ]
      }
    }
  },
  created() {
    this.getRoleList();
  },
  methods: {
    async getRoleList() {
      const {data: res} = await this.$http.get('sysRole/list', {
        params: this.queryParams
      })
      this.roleList = res.data.records;
      // this.total = res.data.total

      console.log(res)
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getRoleList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {}
      this.getRoleList()
    },
    // @size-change页码展示数量点击事件
    getRoleMenuTreeselect(roleId) {
      // return roleMenuTreeselect(roleId).then(response => {
      //   this.menuOptions = response.menus;
      //   return response;
      // });
      const {data: res} = this.$http.post("getRoleMenuTreeselect/", roleId);
      this.menuOptions = res.data
      return res
    },
    // /** 根据角色ID查询部门树结构 */
    // getDeptTree(roleId) {
    //   return deptTreeSelect(roleId).then(response => {
    //     this.deptOptions = response.depts;
    //     return response;
    //   });
    // },
    // 角色状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$modal.confirm('确认要"' + text + '""' + row.roleName + '"角色吗？').then(function () {
        return changeRoleStatus(row.roleId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // // 取消按钮（数据权限）
    // cancelDataScope() {
    //   this.openDataScope = false;
    //   this.reset();
    // },
    // 表单重置
    reset() {
      if (this.$refs.menu != undefined) {
        this.$refs.menu.setCheckedKeys([]);
      }
      this.menuExpand = false,
          this.menuNodeAll = false,
          this.deptExpand = true,
          this.deptNodeAll = false,
          this.form = {
            roleId: undefined,
            roleName: undefined,
            roleKey: undefined,
            roleSort: 0,
            status: "0",
            menuIds: [],
            deptIds: [],
            menuCheckStrictly: true,
            deptCheckStrictly: true,
            remark: undefined
          };
      // this.resetForm("form");
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.roleId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    // 更多操作触发
    // handleCommand(command, row) {
    //   switch (command) {
    //     case "handleDataScope":
    //       this.handleDataScope(row);
    //       break;
    //     case "handleAuthUser":
    //       this.handleAuthUser(row);
    //       break;
    //     default:
    //       break;
    //   }
    // },
    // 树权限（展开/折叠）
    handleCheckedTreeExpand(value, type) {
      if (type == 'menu') {
        let treeList = this.menuOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].id].expanded = value;
        }
      } else if (type == 'dept') {
        let treeList = this.deptOptions;
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.dept.store.nodesMap[treeList[i].id].expanded = value;
        }
      }
    },
    // 树权限（全选/全不选）
    handleCheckedTreeNodeAll(value, type) {
      if (type == 'menu') {
        this.$refs.menu.setCheckedNodes(value ? this.menuOptions : []);
      } else if (type == 'dept') {
        this.$refs.dept.setCheckedNodes(value ? this.deptOptions : []);
      }
    },
    // 树权限（父子联动）
    handleCheckedTreeConnect(value, type) {
      if (type == 'menu') {
        this.form.menuCheckStrictly = value ? true : false;
      } else if (type == 'dept') {
        this.form.deptCheckStrictly = value ? true : false;
      }
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.getMenuTreeselect();
      this.open = true;
      this.title = "添加角色";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const roleId = row.roleId || this.ids
      const roleMenu = this.getRoleMenuTreeselect(roleId);
      // getRole(roleId).then(response => {
      //   this.form = response.data;
      //   this.open = true;
      //   this.$nextTick(() => {
      //     roleMenu.then(res => {
      //       let checkedKeys = res.checkedKeys
      //       checkedKeys.forEach((v) => {
      //         this.$nextTick(() => {
      //           this.$refs.menu.setChecked(v, true, false);
      //         })
      //       })
      //     });
      //   });
      //   this.title = "修改角色";
      // });
    },
    /** 选择角色权限范围触发 */
    dataScopeSelectChange(value) {
      if (value !== '2') {
        this.$refs.dept.setCheckedKeys([]);
      }
    },
    /** 分配数据权限操作 */
    // handleDataScope(row) {
    //   this.reset();
    //   const deptTreeSelect = this.getDeptTree(row.roleId);
    //   getRole(row.roleId).then(response => {
    //     this.form = response.data;
    //     this.openDataScope = true;
    //     this.$nextTick(() => {
    //       deptTreeSelect.then(res => {
    //         this.$refs.dept.setCheckedKeys(res.checkedKeys);
    //       });
    //     });
    //     this.title = "分配数据权限";
    //   });
    // },
    // /** 分配用户操作 */
    // handleAuthUser: function (row) {
    //   const roleId = row.roleId;
    //   this.$router.push("/system/role-auth/user/" + roleId);
    // },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.roleId != undefined) {
            // this.form.menuIds = this.getMenuAllCheckedKeys();
            // updateRole(this.form).then(response => {
            //   this.$modal.msgSuccess("修改成功");
            //   this.open = false;
            //   this.getList();
            // });
            // const {data: res} = this.$http.post("sysRole/menuList", this.sysMenu);


          } else {
            // this.form.menuIds = this.getMenuAllCheckedKeys();
            // addRole(this.form).then(response => {
            //   this.$modal.msgSuccess("新增成功");
            //   this.open = false;
            //   this.getList();
            // });
          }
        }
      });
    },
    /** 提交按钮（数据权限） */
    // submitDataScope: function () {
    //   if (this.form.roleId != undefined) {
    //     this.form.deptIds = this.getDeptAllCheckedKeys();
    //     dataScope(this.form).then(response => {
    //       this.$modal.msgSuccess("修改成功");
    //       this.openDataScope = false;
    //       this.getList();
    //     });
    //   }
    // },
    // /** 删除按钮操作 */
    // handleDelete(row) {
    //   const roleIds = row.roleId || this.ids;
    //   this.$modal.confirm('是否确认删除角色编号为"' + roleIds + '"的数据项？').then(function () {
    //     return delRole(roleIds);
    //   }).then(() => {
    //     this.getList();
    //     this.$modal.msgSuccess("删除成功");
    //   }).catch(() => {
    //   });
    // },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/role/export', {
        ...this.queryParams
      }, `role_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

<style scoped>

</style>