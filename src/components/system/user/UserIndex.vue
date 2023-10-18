<template>
  <div class="app-container">
    <br>
    <el-breadcrumb separator-class="el-icon-arrow-right" style="margin-left: 20px">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-row :gutter="20">
      <!--部门数据-->
      <el-col :span="4">
        <el-card>
          <div class="grid-content bg-purple">
            <el-tree
                ref="tree"
                :data="leftDeptTree"
                :props="{label: 'deptName'}"
                :expand-on-click-node="false"
                :filter-node-method="filterNode"
                highlight-current
                default-expand-all
                node-key="id"
                @node-click="handleNodeClick">
            </el-tree>
          </div>
        </el-card>
      </el-col>
      <!--      用户数据-->
      <el-col :span="20" :xs="24">
        <el-card>
          <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
                   label-width="68px">
            <el-form-item label="用户名称" prop="userName">
              <el-input
                  v-model.trim="queryParams.userName"
                  placeholder="请输入用户名称"
                  clearable
                  style="width: 240px"
                  @keyup.enter.native="handleQuery"
              />
            </el-form-item>
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input
                  v-model.trim="queryParams.phonenumber"
                  placeholder="请输入手机号码"
                  clearable
                  style="width: 240px"
                  @keyup.enter.native="handleQuery"
              />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select
                  v-model.trim="queryParams.status"
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
                  @click="handleAdd"

              >新增
              </el-button>
            </el-col>

            <el-col :span="1.5">
              <el-button
                  type="danger"
                  plain
                  icon="el-icon-delete"
                  size="mini"
                  :disabled="multiple"
                  @click="delUsers"

              >删除
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                  type="info"
                  plain
                  icon="el-icon-upload2"
                  size="mini"
                  @click="handleImport"
              >导入
              </el-button>
            </el-col>
            <el-col :span="1.5">
              <el-button
                  type="warning"
                  plain
                  icon="el-icon-download"
                  size="mini"
                  @click="handleExport"
              >导出
              </el-button>
            </el-col>
            <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
          </el-row>

          <el-table :data="userList" @selection-change="handleSelectionChange" ref="list">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="用户编号" align="center" key="userId" prop="userId"/>
            <el-table-column label="用户名称" align="center" key="userName" prop="userName"/>
            <el-table-column label="用户昵称" align="center" key="nickName" prop="nickName"/>
            <el-table-column label="部门" align="center" key="deptId">
              <template slot-scope="scope">{{ scope.row.deptName }}</template>
            </el-table-column>

            <!--          <el-table-column label="部门" align="center" key="deptName" prop="sysDept.deptName"/>-->
            <el-table-column label="手机号码" align="center" key="phonenumber" prop="phonenumber"/>

            <el-table-column label="状态" align="center" key="status" v-if="columns[5].visible">
              <template slot-scope="scope">
                <el-switch
                    v-model="scope.row.status"
                    active-value="0"
                    inactive-value="1"
                    @change="handleStatusChange(scope.row)"
                ></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[6].visible" width="160">
              <template slot-scope="scope">
                <span>{{ scope.row.createTime|dateFormat }}</span>
              </template>
            </el-table-column>
            <el-table-column
                label="操作"
                align="center"
                width="200"
                class-name="small-padding fixed-width"
            >
              <template slot-scope="scope">
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
                    @click="delUser(scope.row)"
                >删除
                </el-button>
                <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-loading"
                    @click="handleResetPwd(scope.row)"
                >重置密码
                </el-button>
              </template>
            </el-table-column>
          </el-table>

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
      </el-col>

    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" placeholder="请输入用户昵称" maxlength="30"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归属部门" prop="deptId">
              <treeselect v-model="form.deptId"
                          :options="deptOptions"
                          :normalizer="normalizer"
                          :show-count="true"
                          @select="selectCheckDept"
                          placeholder="请选择归属部门"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phonenumber">
              <el-input v-model="form.phonenumber" placeholder="请输入手机号码" maxlength="11"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名称" maxlength="30"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="form.userId == undefined" label="用户密码" prop="password">
              <el-input v-model="form.password" placeholder="请输入用户密码" type="password" maxlength="20"
                        show-password/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户性别" prop="sex">
              <el-select v-model="form.sex" placeholder="请选择性别">
                <el-option
                    v-for="dict in sexList"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in statusPotion"
                          :key="dict.dictValue"
                          :label="dict.dictValue">
                  {{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="岗位" prop="postIds">
              <el-select v-model="form.postIds" placeholder="请选择岗位">
                <el-option
                    v-for="item in postOptions"
                    :key="item.postId"
                    :label="item.postName"
                    :value="item.postId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="roleIds">
              <el-select v-model="form.roleIds" placeholder="请选择角色">
                <el-option
                    v-for="item in roleOptions"
                    :key="item.roleId"
                    :label="item.roleName"
                    :value="item.roleId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :disabled="showEdit" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload
          ref="upload"
          :limit="1"
          accept=".xlsx, .xls"
          :headers="upload.headers"
          :disabled="upload.isUploading"
          :on-progress="handleFileUploadProgress"
          :on-success="handleFileSuccess"
          class="upload-demo"
          action="#"
          :before-upload="beforeAvatarUpload"
          :http-request="uploadHttpRequest"
          :auto-upload="true"
          name="file"
          drag
          multiple
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <!--          <div class="el-upload__tip" slot="tip">-->
          <!--            <el-checkbox v-model="upload.updateSupport"/>-->
          <!--            是否更新已经存在的用户数据-->
          <!--          </div>-->
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                   @click="importTemplate">下载模板
          </el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="uploadHttpRequest">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "User",
  components: {Treeselect},
  dicts: 'sys_normal_disable',

  data() {
    return {
      //左侧部门树
      leftDeptTree: [],
      sexList: [
        {label: '男', value: '0'},
        {label: '女', value: '1'},
        // {label: '', value: '1'}
      ],
      // dictList:[
      //   {label: '启用', value: '0'},
      //   {label: '禁用', value: '1'},
      // ],
      PostList: [
        {label: '男', value: '0'},
        {label: '女', value: '1'},
        // {label: '', value: '1'}
      ],
      // // 遮罩层
      // loading: true,
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
      // 用户表格数据
      userList: null,
      // 弹出层标题
      title: "",
      // 部门树选项
      deptOptions: undefined,
      //状态下拉
      statusPotion: [],
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 默认密码
      initPassword: 123456,
      // 日期范围
      dateRange: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label"
      },
      // 查询参数
      queryParams: {
        current: 1,
        size: 2,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined,
        createTime: undefined,
        updateTime: undefined
      },
      showEdit: false,
      // 列信息
      columns: [
        {key: 0, label: `用户编号`, visible: true},
        {key: 1, label: `用户名称`, visible: true},
        {key: 2, label: `用户昵称`, visible: true},
        {key: 3, label: `部门`, visible: true},
        {key: 4, label: `手机号码`, visible: true},
        {key: 5, label: `状态`, visible: true},
        {key: 6, label: `创建时间`, visible: true}
      ],

      // 表单校验
      rules: {
        userName: [
          {required: true, message: "用户名称不能为空", trigger: "blur"},
          {min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur'}
        ],
        nickName: [
          {required: true, message: "用户昵称不能为空", trigger: "blur"}
        ],
        sex: [
          {required: true, message: "用户性别不能为空", trigger: "blur"}
        ],
        password: [
          {required: true, message: "用户密码不能为空", trigger: "blur"},
          {min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur'}
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phonenumber: [
          {required: true, message: "用户手机号不能为空", trigger: "blur"},
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ],
        deptId: [
          {required: true, message: "部门不能为空", trigger: "blur"},
        ],
        postIds: [
          {required: true, message: "岗位不能为空", trigger: "blur"},
        ],
        roleIds: [
          {required: true, message: "角色不能为空", trigger: "blur"},
        ],
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: {Authorization: window.sessionStorage.getItem("token")},
        // 上传的地址
        url: "http://localhost:8080/#/excel/into"
      },
      uploadFile: {},
      format: [],

    };
  },
  created() {
    this.getList();
    this.getDeptTree();
    this.getStatus();
  },
  methods: {
    selectCheckDept(node, instanceId) {
      // alert(node.ancestors.length)
      if (node.ancestors.length < 6) {
        this.showEdit = true;
        return this.$message.error("无法选择部门以上的单位！请重新选择")
      } else {
        this.showEdit = false;
      }
    },
    /** 查询用户列表 */
    async getList() {
      this.queryParams.createTime = this.dateRange[0]
      this.queryParams.updateTime = this.dateRange[1]
      // console.log(this.queryParams.current)
      // console.log(this.queryParams.size)
      const {data: res} = await this.$http.get('sysUser/sysUserList', {
        params: this.queryParams
      })

      if (res == '') {
        return
      }
      this.userList = res.data.records;
      this.total = res.data.total
      console.log(res.data.records, "xxxxxxxxxxxxxx")

      // this.deptOptions=res.data.records.sysDept;
      // console.log('asdsa',res)
      // console.log(this.deptOptions)
      // console.log(res.data.records)
      // console.log(this.deptOptions);
    },
    //批量删除
    async delUsers() {
      const confirmResult = await this.$confirm('确认要删除' + this.ids + '用户吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)

      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      await this.$http.post('sysUser/deleteUsers', this.ids).then(res => {
        if (this.queryParams.current > Math.ceil((this.total - 1) / this.queryParams.size)) {
          this.queryParams.current = Math.ceil((this.total - 1) / this.queryParams.size);
        }
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.getList();
        } else if (res.data.status == 201) {
          this.$message.error(res.data.msg)
        }else {
          this.$message.warning("权限不足！")
        }
      })
    },
    //单个删除
    async delUser(row) {
      const confirmResult = await this.$confirm('确认要删除' + row.userName + '"吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      await this.$http.delete('sysUser/delUser/' + row.userId).then(res => {
        if (this.queryParams.current > Math.ceil((this.total - 1) / this.queryParams.size)) {
          this.queryParams.current = Math.ceil((this.total - 1) / this.queryParams.size);
        }
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.getList();
        } else if (res.data.status == 201) {
          this.$message.error(res.data.msg)
        }else {
          this.$message.warning("权限不足！")
        }
      })
    },
    //上传导入
    async uploadHttpRequest() {
      const {data: res} = await this.$http({
        url: 'excel/into',
        method: "post",
        headers: {
          "Content-Type": "multipart/form-data;boundary=" + new Date().getTime()
        },
        data: this.format,
      })
      console.log(res)
      if (res.status == 201) {
        this.$message.error(res.msg);
      } else if (res.status == 200) {
        this.$message.success(res.msg);
      }else {
        this.$message.warning("权限不足!");
      }

    },
    //上传前
    beforeAvatarUpload(file) {
      console.log("文件", file)
      const fileSuffix = file.name.substring(file.name.lastIndexOf(".") + 1);
      const whiteList = ["xls", "xlsx"];

      if (whiteList.indexOf(fileSuffix) === -1) {
        this.$message.error("上传文件只能是xls、xlsx格式", "error");
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
        return false;
      }
      this.uploadFile = file
      let formData = new FormData();
      formData.append('file', file)
      this.format = formData
      console.log("from", formData)
    },
    async getStatus() {
      const {data: res} = await this.$http.get('sysUser/userStatusOption')
      this.statusPotion = res.data;
      console.log('zzzzzzzzzzzzzz', res.data)
      // console.log(this.deptOptions)
      // console.log(res.data.records)
      // console.log(this.deptOptions);
      // console.log(res.data.records.sysDept.deptName);
    },
    /** 查询部门下拉树结构 */
    getDeptTree() {
      this.$http.post("sysUser/getDeptList", {}).then(response => {
        console.log("cccccccccc", response.data.menuList)
        this.deptOptions = response.data.menuList;
        // addDisabledProperty(this.deptOptions);
        // console.log(this.deptOptions,"ccccccccccccc")
      });
//       // 在数据中为每个选项对象添加一个 disabled 属性
//       function addDisabledProperty(options) {
//         for (const option of options) {
//           option.disabled = shouldDisableOption(option); // 根据条件判断是否禁用选项
//
//           if (option.children) {
//             addDisabledProperty(option.children); // 递归处理子选项
//           }
//         }
//       }
// // 判断是否禁用选项的示例条件函数
//       function shouldDisableOption(option) {
//         // 根据你的条件逻辑返回 true 或 false
//         // 例如，禁用 ID 为 1 的选项：
//         return option.deptId ==100 || option.deptId ==101 || option.deptId ==102;
//       }
      this.$http.post("sysDept/getDeptList", {}).then(response => {
        this.leftDeptTree = response.data.menuList;
      });
    },

    // @size-change页码展示数量点击事件
    handleSizeChange(val) {
      console.log('asda' + val)
      // 更新每页展示数据size
      this.queryParams.size = val
      this.getList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      console.log('asda' + val)
      // 更新当前页数是第几页
      this.queryParams.current = val
      this.getList();
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.deptId;
      this.handleQuery();
    },
    // 用户状态修改
    handleStatusChange: function (row) {
      this.$confirm('确认要停用' + row.userName + '吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$http.put('sysUser/updateUserStatus?status=' + row.status + '&id=' + row.userId).then(res=>{
          console.log(res,"ccccc")
          if (res.data.errorCode==10){
            this.$message.warning("权限不足！")
            this.getList();
            return;
          }else {
            this.getList()
            return;
          }
        })
      }).catch(() => {
        row.status = row.status === "0" ? "1" : "0";
      });
      // const {data:res} =  this.$http.put('sysRole/upDataStatus?status='+row.status+'&roleId='+row.roleId);
      // console.log(res)

    },
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        remark: undefined,
        postIds: [],
        roleIds: [],
      };
      this.showEdit = false;
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1;
      this.queryParams.createTime = this.dateRange[0]
      this.queryParams.updateTime = this.dateRange[1]
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];

      this.$refs["queryForm"].resetFields();
      this.queryParams.deptId = undefined;
      this.$refs.tree.setCurrentKey(null);
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.$http.get("sysUser/getUser").then(response => {
        this.postOptions = response.data.posts;
        this.roleOptions = response.data.roles;
        this.open = true;
        this.title = "添加用户";
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.form = structuredClone(row)
      console.log("qqqqqqqq", row)
      // this.form.deptId = row.sysDeptList.deptId;
      // this.form.postIds = row.userAndPostDto.sysPost.postId;
      // this.form.roleIds = row.userAndRoleDto.sysRole.roleId;
      console.log("cccccccccccccccccccccccc", this.form)
      // this.form.roleIds = row.userAndRoleDto.sysRole.roleId
      // this.form.postIds = row.userAndPostDto.sysPost.postIds
      this.$http.get("sysUser/getUser").then(response => {
        this.postOptions = response.data.posts;
        this.roleOptions = response.data.roles;
      })
      this.open = true;
      this.title = "修改用户";
      this.form.password = "";
    },
    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: "用户密码长度必须介于 5 和 20 之间"
      }).then(({value}) => {
        console.log(value)
        this.$http.put("sysUser/resetPwd?id=" + row.userId + "&pwd=" + value).then(res=>{
          console.log("ffffffffff",res)
          if (res.data.data==1){
            this.$message.success('重置密码成功')
            // 修改成功后重新登录
            // window.sessionStorage.clear();
            // this.$router.push('/login');
            return;
          }else {
            this.$message.warning('权限不足！')
          }
        })
      }).catch(() => {
      });
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    async importTemplate() {
      const {data: res} = await this.$http.post(`excel/template`)
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      // this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", {dangerouslyUseHTMLString: true});
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$http.put("excel/into", this).then(response => {
        // console.log("cccc",response)
        if (response.data.data == 1) {
          this.$message.success("修改成功");
          this.open = false;
          this.getList();
        } else if (response.data.data==0) {
          this.$message.error("修改失败，手机号重复!");
        }else {
          this.$message.warning("权限不足!");
        }
      });
      this.$refs.upload.submit();
    },
    /** 提交按钮 */
    submitForm: function () {
      // this.form.status = this.form.status == "正常" ? '0' : '1';

      this.$refs["form"].validate(valid => {
        console.log(this.form, "ccccccccccc")
        if (valid) {
          if (this.form.userId != undefined) {
            this.$http.put("sysUser/updateUser", this.form).then(response => {
              // console.log("cccc",response)
              if (response.data.data == 1) {
                this.$message.success("修改成功");
                this.open = false;
                this.getList();
              } else if (response.data.data == 0) {
                this.$message.error("修改失败，手机号重复!");
              } else {
                this.$message.warning("权限不足!");
                this.open=false;
              }
            });
          } else {
            this.$http.put("sysUser/addUser", this.form).then(response => {
              // console.log("cccc",response)
              if (response.data.data == 1) {
                this.$message.success("新增成功");
                this.open = false;
                this.getList();
              } else if (response.data.data == 0) {
                this.$message.error("新增失败，手机号重复!");
              } else {
                this.$message.warning("权限不足!");
                this.open=false;
              }
            });
          }
        }
        // });
      })
    },
    /** 导出按钮操作 */
    async handleExport() {
      const {data: res} = await this.$http.post(`excel/userList`, this.ids)
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }else {
        this.$message.warning("权限不足!")
      }
    }
    ,
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      };
    }
    ,
  }
}
</script>


