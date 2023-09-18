<template>

  <div class="app-container">
    <el-button
        type="primary"
        icon="el-icon-plus"
        size="small"
        @click="Add"
    >添加角色</el-button>
      <el-table
          ref="multipleTable"
          :data="roleList"
          tooltip-effect="dark"
      >
        <el-table-column prop="roleId" label="角色编号" width="120" />
        <el-table-column prop="roleName" label="角色名称" align="center" width="100" />
        <el-table-column prop="roleKey"  label="权限字符" width="120" />
        <el-table-column prop="roleSort" label="显示顺序" width="200" />

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
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime| dateFormat }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope" v-if="scope.row.roleId !== 1">
            <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['system:role:edit']"
            >修改</el-button>
            <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['system:role:remove']"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd"
            v-hasPermi="['system:role:add']"
        >新增
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            v-hasPermi="['system:role:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="角色编号" prop="roleId" width="120"/>
      <el-table-column label="角色名称" prop="roleName" :show-overflow-tooltip="true" width="150"/>
      <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="150"/>
      <el-table-column label="显示顺序" prop="roleSort" width="100"/>
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
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="scope.row.roleId !== 1">
          <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:role:edit']"
          >修改
          </el-button>
          <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:role:remove']"
          >删除
          </el-button>
          <!--          <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['system:role:edit']">-->
          <!--&lt;!&ndash;            <el-button size="mini" type="text" icon="el-icon-d-arrow-right">更多</el-button>&ndash;&gt;-->
          <!--&lt;!&ndash;            <el-dropdown-menu slot="dropdown">&ndash;&gt;-->
          <!--&lt;!&ndash;              <el-dropdown-item command="handleDataScope" icon="el-icon-circle-check"&ndash;&gt;-->
          <!--&lt;!&ndash;                                v-hasPermi="['system:role:edit']">数据权限</el-dropdown-item>&ndash;&gt;-->
          <!--&lt;!&ndash;              <el-dropdown-item command="handleAuthUser" icon="el-icon-user"&ndash;&gt;-->
          <!--&lt;!&ndash;                                v-hasPermi="['system:role:edit']">分配用户</el-dropdown-item>&ndash;&gt;-->
          <!--&lt;!&ndash;            </el-dropdown-menu>&ndash;&gt;-->
          <!--          </el-dropdown>-->
        </template>
      </el-table-column>
    </el-table>

    <!--    分页-->
    <!--    <pagination-->
    <!--        v-show="total>0"-->
    <!--        :total="total"-->
    <!--        :page.sync="queryParams.pageNum"-->
    <!--        :limit.sync="queryParams.pageSize"-->
    <!--        @pagination="getList"-->
    <!--    />-->

    <!-- 添加或修改角色配置对话框 -->
<!--    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>-->
<!--      <el-form ref="form" :model="form" :rules="rules" label-width="100px">-->
<!--        <el-form-item label="角色名称" prop="roleName">-->
<!--          <el-input v-model="form.roleName" placeholder="请输入角色名称"/>-->
<!--        </el-form-item>-->
<!--        <el-form-item prop="roleKey">-->
<!--          <span slot="label">-->
<!--            <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">-->
<!--              <i class="el-icon-question"></i>-->
<!--            </el-tooltip>-->
<!--            权限字符-->
<!--          </span>-->
<!--          <el-input v-model="form.roleKey" placeholder="请输入权限字符"/>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="角色顺序" prop="roleSort">-->
<!--          <el-input-number v-model="form.roleSort" controls-position="right" :min="0"/>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="状态">-->
<!--          <el-radio-group v-model="form.status">-->
<!--            <el-radio-->
<!--                v-for="dict in dict.type.sys_normal_disable"-->
<!--                :key="dict.value"-->
<!--                :label="dict.value"-->
<!--            >{{ dict.label }}-->
<!--            </el-radio>-->
<!--          </el-radio-group>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="菜单权限">-->
<!--          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>-->
<!--          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选-->
<!--          </el-checkbox>-->
<!--          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动-->
<!--          </el-checkbox>-->
<!--          <el-tree-->
<!--              class="tree-border"-->
<!--              :data="menuOptions"-->
<!--              show-checkbox-->
<!--              ref="menu"-->
<!--              node-key="id"-->
<!--              :check-strictly="!form.menuCheckStrictly"-->
<!--              empty-text="加载中，请稍候"-->
<!--              :props="defaultProps"-->
<!--          ></el-tree>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="备注">-->
<!--          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--      <div slot="footer" class="dialog-footer">-->
<!--        <el-button type="primary" @click="submitForm">确 定</el-button>-->
<!--        <el-button @click="cancel">取 消</el-button>-->
<!--      </div>-->
<!--    </el-dialog>-->


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
            <el-checkbox v-model="menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
<!--                        <el-tree-->
<!--                            class="tree-border"-->
<!--                            :data="menuOptions"-->
<!--                            show-checkbox-->
<!--                            ref="menu"-->
<!--                            node-key="id"-->
<!--                            :check-strictly="!form.menuCheckStrictly"-->
<!--                            empty-text="加载中，请稍候"-->
<!--                            :props="defaultProps"-->
<!--                        ></el-tree>-->
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRole()">确 定</el-button>
        <el-button @click="updateSysMenuShow=f">取 消</el-button>
      </div>
    </el-dialog>
</div>
<!--  </div>-->
</template>

<script>
export default {
  data() {
    return {
      sysMenu: {
        menuName: '',
        status: ''
      },
      treeData: [], // 初始化为一个空数组
      //菜单列表
      sysMenuList: [],
      //新增修改弹出框
      updateSysMenuShow: false,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 角色表格数据
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
      // deptOptions: [],
      // 查询参数
      queryParams: {
        // pageNum: 1,
        // pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      },
      // 表单参数
      form: {

      },
      defaultProps: {
        children: "children",
        label: "label"
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
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询角色列表 */
    async getList() {
      this.loading = true;
      try {
        const {data: res} = await this.$http.get("sysRole/list", {
          params: this.queryParams
        });
        // console.log(res)
        this.roleList = res;
        console.log(this.roleList)
        // 处理响应数据逻辑
      } catch (error) {
        // 处理错误逻辑
        // console.log(error);
      }
      this.loading = false; // 设置 loading 状态为 false
    }, handleStatusChange() {

    },
  }
}
</script>

<style scoped>

</style>