<template>
  <div class="app-container">
    <!-- 面包屑导航 -->

    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
    </el-breadcrumb>

    <br>
    <el-card>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="`showSearch`">
      <el-form-item label="角色名称" prop="roleName">
        <el-input
            v-model.trim="queryParams.roleName"
            placeholder="请输入角色名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
            v-model.trim="queryParams.roleKey"
            placeholder="请输入权限字符"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
            v-model="queryParams.status"
            placeholder="用户状态"
            clearable
            style="width: 240px"
        >
          <el-option
              v-for="dict in statusPotion"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
          />
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
            @click="Add"
        >新增
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
            @click="derive()"
        >导出
        </el-button>
      </el-col>
    </el-row>

    <el-table :data="roleList" @selection-change="selectionChangeHandle" ref="list">
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
          >
            <el-tag :type="scope.row.status === '0' ? '' : 'danger'">
              {{ scope.row.status === '0' ? '正常' : '禁用' }}
            </el-tag>
          </el-switch>
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
              @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="deleteRole(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--     添加或修改角色对话框-->
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body :before-close="handleClose">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model.trim="form.roleName" placeholder="请输入角色名称"/>
          </el-form-item>
          <el-form-item prop="roleKey">
          <span slot="label">
            <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            权限字符
          </span>
            <el-input v-model.trim="form.roleKey" placeholder="请输入权限字符"/>
          </el-form-item>
          <el-form-item label="角色顺序" prop="roleSort">
            <el-input-number v-model="form.roleSort" controls-position="right" :min="0"/>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio label="0" value="0">正常</el-radio>
              <el-radio label="1" value="1">停用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜单权限">
            <!--            <el-checkbox v-model="menuExpand" @change="expandOrFoldChange()">展开/折叠</el-checkbox>-->
            <!--            <el-checkbox v-model="menuNodeAll" @change="selectAllChange($event, 'menu')">全选/全不选-->
            <!--            </el-checkbox>-->
            <el-checkbox v-model="checked" @change="selectAllChange">全选/取消</el-checkbox>
            <el-checkbox v-model="expandOrFold" @change="expandOrFoldChange()">展开/折叠</el-checkbox>
            <el-checkbox v-model="menuCheckStrictly1" @change="checkStrictlyChange()">父子联动</el-checkbox>
            <el-tree
                :default-checked-keys="form.menuIds"
                class="tree-border"
                :data="menuOptions"
                show-checkbox
                ref="menu"
                node-key="menuId"
                :check-strictly="menuCheckStrictly"
                empty-text="加载中，请稍后"
                :props="defaultProps"
                :default-expand-all="expandOrFold"
                @check-change="handleCheckChange"
            ></el-tree>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRole()">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.current"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryParams.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
    </el-card>
  </div>
</template>

<script>
import 'element-ui/lib/theme-chalk/index.css';
// import ElTree from 'element-ui/lib/tree';

export default {
  name: 'UserRole',
  data() {
    return {
      //导出集合
      deriveList: [],

      statusPotion:[],
      //导出的对象
      derives: {},
      rules: {
        roleName: [
          {required: true, message: "角色名称不能为空", trigger: "blur"}
        ],
        roleKey: [
          {required: true, message: "角色权限字符不能为空", trigger: "blur"}
        ],
        roleSort: [
          {required: true, message: "顺序不能为空", trigger: "blur"}
        ],
        status: [
          {required: true, message: "状态不能为空", trigger: "blur"}
        ],
      },
      defaultProps: {
        children: "children",
        label: "menuName"

      },
      //树形控件区域
      checked: false, //checkbox的值
      menuCheckStrictly1: true, //父子联动(默认开启)

      //tree是否展开
      expandOrFold: false,

      // 菜单列表
      menuOptions: [],
      menuExpand: false,
      menuNodeAll: false,

      //选取的菜单下拉框
      selectMenuOptions: [],
      menuCheckStrictly: false,
      defaultMenu: [],

      // 表单参数
      form: {
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
      },
      //角色列表区域
      delId: "",
      selection: [],
      // currentPage: 1,
      // pageSize: 1,
      roleList: [],
      // 总条数
      total: 0,
      //总页数
      pages: '',
      // 日期范围
      dateRange: [],

      queryParams: {
        current: 1,
        size: 5,
        roleName: '',
        roleKey: '',
        status: '',
        createTime: '',
        updateTime: '',
      },

      queryParams2: {
        current: 1,
        size: 1,
        roleName: '',
        roleKey: '',
        status: '',
        createTime: '',
        updateTime: '',
      },
      // 新增/修改区域
      dialogEditRole: false,
      titleEditRole: "",
      // 表单校验
    }
  },
  created() {
    this.getRoleList();
    this.getStatus();
  },
  methods: {
    /**
     * 导出方法
     */
    async derive() {
      const {data: res} = await this.$http.post(`excel/list`, this.deriveList)
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }

    },
    async getStatus() {
      const {data: res} = await this.$http.get('sysRole/roleStatusOption')
      this.statusPotion=res.data;
    },
    //把选中的那条记录的roleId属性放到deriveList中
    selectionChangeHandle(val) {
      this.deriveList = []
      for (let i = 0; i < val.length; i++) {
        //concat方法在数组后追加内容。
        this.deriveList = this.deriveList.concat(val[i].roleId)
      }
    },
    //删除角色
    async deleteRole(role) {
      const confirmResult = await this.$confirm('确认要删除' + '"' + role.roleName + '"角色吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)

      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      await this.$http.delete('sysRole/delete/' + role.roleId).then(res => {
        if (this.queryParams.current > Math.ceil((this.total - 1) / this.queryParams.size)) {
          this.queryParams.current = Math.ceil((this.total - 1) / this.queryParams.size);
        }
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.getRoleList();
        } else if (res.data.status == 201) {
          this.$message.error(res.data.msg)
        }
      })

      //     .then(() => {
      //   this.msgSuccess("导出成功");
      // });
      // await this.$http.delete('sysRole/delete/'+role.roleId)
      // const {data: res} =
      // if (res.status!=200){
      //   console.log(res)
      // }
    },
    //获取添加角色的菜单接口
    async getMenuList() {
      try {
        const response = await this.$http.get(`sysRole/getRoleMenuTreeselect`);
        // console.log("111111111111", response)
        this.menuOptions = response.data.data;
        // 处理响应数据
      } catch (error) {
        console.error(error);
        // 处理错误
      }
    },
    /** 查询角色列表 */
    Add() {
      this.title = "新增角色";
      this.open = true;
      this.getMenuList();
      this.form = {};
    },
// 取消按钮
    cancel() {
      this.open = false;
      this.reset()
      // this.reset();
    },
    async getRoleList() {

      const {data: res} = await this.$http.get('sysRole/list', {
        params: this.queryParams
      })
      this.roleList = res.data.records;
      this.total = res.data.total
      // console.log(this.roleList)
    },
    handleQuery() {
      this.queryParams.createTime = this.dateRange[0]
      this.queryParams.updateTime = this.dateRange[1]
      this.queryParams.current = 1
      this.queryParams.roleName=this.queryParams.roleName.trim()
      this.queryParams.roleKey=this.queryParams.roleKey.trim()
      this.getRoleList();
    },
    // 角色状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '" "' + row.roleName + '"角色吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        return this.$http.put('sysRole/upDataStatus?status=' + row.status + '&roleId=' + row.roleId);
      }).catch(() => {
        row.status = row.status === "0" ? "1" : "0";
      });
      // const {data:res} =  this.$http.put('sysRole/upDataStatus?status='+row.status+'&roleId='+row.roleId);
      // console.log(res)

    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        current: 1,
        size: 2,
        roleName: '',
        roleKey: '',
        status: '',
        createTime: '',
        updateTime: '',
      }
      this.queryParams2 = {
        current: 1,
        size: 1,
        roleName: '',
        roleKey: '',
        status: '',
        createTime: '',
        updateTime: '',
      }
      this.dateRange = [];
      this.getRoleList()
    },
    //新增或修改角色
    async saveRole() {
      //传入所选中的Id
      this.form.menuIds = [];
      if (this.selectMenuOptions.length > 0) {
        for (let i = 0; i < this.selectMenuOptions.length; i++) {
          this.form.menuIds.push(this.selectMenuOptions[i].menuId)
        }
      }
      if (this.form.roleId != undefined) {
        let res = await this.$http.put("sysRole/edit", this.form);
        if (res.data.status === 200) {
          this.open = false;
          this.$message.success("修改成功")
          this.getRoleList();
          this.menuOptions = {}
        } else {
          this.$message.error(res.data.msg);
          // this.open = false;
          // this.form = {};
        }
      } else {
        let res = await this.$http.post("sysRole/insertRole", this.form);
        if (res.data.status === 200) {
          this.open = false;
          this.$message.success("新增成功")
          this.getRoleList();
        } else {
          this.$message.error(res.data.msg);
          // this.open = false;
          // this.form = {};
        }
      }
    },
    /** 根据角色ID查询菜单树结构 */
    getRoleMenuTreeselect(roleId) {
      // let res = this.$http.get("sysRole/getRoleMenuTreeselect", roleId);
      const res = this.$http.get(`sysRole/getRoleMenuTreeselect` + roleId);
      console.log("cxd", res)
      this.menuOptions = res.data.data;
      console.log(this.menuOptions)
      return this.menuOptions
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.form = structuredClone(row)
      this.$http.get(`sysRole/getMenuIds/` + row.roleId).then(res => {
        // console.log(res.data.status)
        // console.log("111111111",res.data)
        this.form.menuIds = res.data
      });
      // console.log("aaaaaaa", res)
      this.getMenuList();

      this.open = true;

      this.title = "修改角色";
    },
    handleUpdate1(row) {
      this.reset();
      const roleId = row.roleId || this.ids
      const roleMenu = this.getRoleMenuTreeselect(roleId);
      // getRole(roleId).then(response => {
      this.form = structuredClone(row)
      this.open = true;
      this.$nextTick(() => {
        roleMenu.then(res => {
          let checkedKeys = res.checkedKeys
          checkedKeys.forEach((v) => {
            this.$nextTick(() => {
              this.$refs.menu.setChecked(v, true, false);
            })
          })
        });
      });
      this.title = "修改角色";
      // });
    },
    // 表单重置
    reset() {
      this.menuExpand = false,
          this.menuNodeAll = false,
          this.menuOptions = {},
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
    },
    //x关闭
    handleClose() {
      this.open = false;
      this.reset()
    },
    //新增/修改区域
    //下拉框附加功能1：全选/取消
    selectAllChange() {
      if (this.checked) {
        //全选
        this.$refs.menu.setCheckedNodes(this.menuOptions);
      } else {
        //取消选中
        this.$refs.menu.setCheckedKeys([]);
      }
    },
    //下拉框附加功能2：是否开启父子联动
    checkStrictlyChange() {
      this.menuCheckStrictly = !this.menuCheckStrictly;
    },
    //下拉框附加功能3：展开/折叠
    expandOrFoldChange() {
      for (var i = 0; i < this.$refs.menu.store._getAllNodes().length; i++) {
        // 根据isExpand， tree展开或折叠
        this.$refs.menu.store._getAllNodes()[i].expanded = this.expandOrFold
      }
    },
    //关于下拉框的数据选取时候获取数据
    handleCheckChange() {
      // 当勾选状态变化时，将选中的节点保存在 selectedItems 数组中
      this.selectMenuOptions = this.$refs.menu.getCheckedNodes();
    },
    // @size-change页码展示数量点击事件
    handleSizeChange(val) {
      console.log('asda' + val)
      // 更新每页展示数据size
      this.queryParams.size = val
      this.getRoleList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      console.log('asda' + val)
      // 更新当前页数是第几页
      this.queryParams.current = val
      this.getRoleList();
    }
  }


}
</script>

<style scoped>

</style>