<template>
  <div>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="`showSearch`">
      <el-form-item label="小区名称" prop="roleName">
        <el-input
            v-model="queryParams.communityName"
            placeholder="请输入角色名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="小区编码" prop="roleKey">
        <el-input
            v-model="queryParams.communityCode"
            placeholder="请输入权限字符"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
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
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
            @click="handleDelete()"
            v-hasPermi="['system:dict:export']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
            @click="derive()"
        >开导
        </el-button>
      </el-col>
    </el-row>

    <el-table :data="communityList" @selection-change="selectionChangeHandle" ref="list">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="用户编号" align="center" key="userId" prop="communityId"/>
      <el-table-column label="小区名称" align="center" key="userName" prop="communityName"/>
      <el-table-column label="小区编码" align="center" key="nickName" prop="communityCode"/>
      <el-table-column label="省" align="center" key="nickName" prop="communityProvenceCode"/>
      <el-table-column label="市" align="center" key="nickName" prop="communityCityCode"/>
      <el-table-column label=" 区/县" align="center" key="nickName" prop="communityTownCode"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime|dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center"   prop="remark"/>
      <el-table-column label="操作" align="center" width="200px" class-name="small-padding fixed-width">
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
          <el-button
              size="mini"
              type="text"
              icon="el-icon-loading"
              @click="replacement(scope.row)"
          >更换物业
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

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body :before-close="cancel">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-form-item label="id" prop="dictName" v-if="form.communityId != undefined" :style="{ opacity: '0.5' }"
                        :class="{ 'readonly-input': true }">
            <el-input v-model.trim="form.communityId" placeholder="请输入id" readonly/>
          </el-form-item>
          <el-form-item label="小区名称" prop="dictName">
            <el-input v-model.trim="form.communityName" placeholder="请输入名称"/>
          </el-form-item>
          <el-form-item label="详细地址" prop="dictName">
            <el-input v-model.trim="form.communityDetailedAddress" placeholder="请输入名称"/>
          </el-form-item>
          <el-form-item label="所属区域" prop="dictName">
            <el-cascader
                size="large"
                :options="options"
                v-model="selectedOptions"
                @change="handleChange">
            </el-cascader>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model.trim="form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRole()">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog
        title="提示"
        :visible.sync="dialogVisible"
        append-to-body :before-close="handleClose"
        >
      <el-table
          :data="deptList"
          style="width: 100%;margin-bottom: 20px;"
          row-key="deptId"
          border
          ref="multipleTable"
          tooltip-effect="dark"
          default-expand-all
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
        <el-table-column
            prop="deptName"
            label="部门名称"
            sortable
            width="180">
        </el-table-column>
        <el-table-column
            prop="status"
            label="状态">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status==0">正常</el-tag>
            <el-tag v-if="scope.row.status==1" type="danger">停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column
            label="创建时间">
          <template slot-scope="scope">
            {{ scope.row.createTime | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column
            label="操作">
          <template slot-scope="scope">
            <el-button
                style="border: none;"
                v-if="scope.row.deptId !== form2.deptId && scope.row.deptId !== 100"
                @click="updReal(scope.row)">选择</el-button>
            <el-button
                style="border: none;"
                v-if="scope.row.deptId === form2.deptId"
                :style="{ color: 'red' }">已选择</el-button>
          </template>
<!--          <template slot-scope="scope">-->
<!--            <button @click="updReal(scope.row)">-->
<!--                {{ scope.row.deptId}}-->
<!--            </button>-->
<!--          </template>-->
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updReplaCement()">确 定</el-button>
      </span>
    </el-dialog>

  </div>

</template>
<script>
import { regionData } from 'element-china-area-data'

export default {
  name: "zy_cumm",
  dicts: ['sys_normal_disable'],
  data() {
    return {

      isActive: false,
      dialogVisible:false,
      deptList:[],
      options: regionData ,
      // 总条数
      total: 0,
      // 表格数据
      communityList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      selectedOptions:[],

      queryParams: {
        current: 1,
        size: 10,
        communityName: "",
        communityCode: "",
        communityProvenceCode:"",
        communityCityCode:"",
        communityTownCode:"",

      },
      deptId:"",
      //查询条件
      deptInfoTree: {
        deptName: '',
        status: ''
      },
      // 表单参数
      form: {
        communityId: 0,
        communityName: undefined,
        remark: undefined,
        communityDetailedAddress:undefined,
        communityProvenceCode:"",
        communityCityCode:"",
        communityTownCode:""
      },

      form2: {
        communityId: 0,
        deptId:"",
        dept:""
      },
      //导出的对象
      derives: {},

      deptInfo: {
        deptName: '',
        status: ''
      },
      // 表单校验
      rules: {
        communityName: [
          {required: true, message: "该字段不能为空", trigger: "blur"}
        ],
        communityDetailedAddress: [
          {required: true, message: "该字段不能为空", trigger: "blur"}
        ]
      }
    };
  }, created() {
    this.getCommunityList();
    this.getStatus();
  },
  methods: {

    //也可以这样写
    handleChange (value) {
      console.log(value)
    },
    async getCommunityList() {
      const {data: res} = await this.$http.get('zyCommunity/getCommunityAll', {
        params: this.queryParams
      })

      console.log(this.deptId)
      const {data: res2} = await this.$http.post("sysDept/treeDeptLists",this.deptInfoTree);
      this.deptList = res2.menuList;
      this.communityList = res.data.records
      this.total = res.data.total
      console.log(res)
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1
      this.getCommunityList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        current: 1,
        size: 10,
        communityName: "",
        communityCode: ""
      }
    },
    // handleClose(done) {
    //   this.$confirm('确认关闭？')
    //       .then(_ => {
    //         done();
    //       })
    //       .catch(_ => {});
    // },
    //删除角色
    async deleteRole(r) {
      const confirmResult = await this.$confirm('确认要删除' + '"' + r.communityName + '"角色吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      await this.$http.delete('zyCommunity/delCummunity?id=' + r.communityId).then(res => {
        console.log(r.communityId)
        if (this.queryParams.current > Math.ceil((this.total - 1) / this.queryParams.size)) {
          this.queryParams.current = Math.ceil((this.total - 1) / this.queryParams.size);
        }
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.getCommunityList();
        } else if (res.data.status == 201) {
          this.$message.error(res.data.msg)
        }
      })
    },

    /**
     * 导出方法
     */
    async derive() {
      const {data: res} = await this.$http.post(`excel/Communitylist`, this.deriveList)
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }
    },
    //把选中的那条记录的roleId属性放到deriveList中
    selectionChangeHandle(val) {
      this.deriveList = []
      for (let i = 0; i < val.length; i++) {
        //concat方法在数组后追加内容。
        this.deriveList = this.deriveList.concat(val[i].communityId)
      }
    },

    /** 删除按钮操作 */
    async handleDelete() {
      console.log(this.$refs.list.selection.map(item => item.communityId))
      const confirmResult = await this.$confirm(
          '此操作将永久删除该数据, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete('zyCommunity/delCommunity', {data: this.$refs.list.selection.map(item => item.communityId)});
      if (res.status !== 200) {
        this.$message.error(res.msg);
      } else {
        this.$message.success('删除用户成功')
      }

      this.getCommunityList();
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // @size-change页码展示数量点击事件
    handleSizeChange(val) {
      console.log('asda' + val)
      // 更新每页展示数据size
      this.queryParams.size = val
      this.getCommunityList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      console.log('asda' + val)
      // 更新当前页数是第几页
      this.queryParams.current = val
      this.getCommunityList();
    },
    handleAdd() {
      this.open = true;
      this.title = "添加";
    },
    replacement(r) {
      this.dialogVisible = true;
      this.form2.communityId=r.communityId
      this.form2.deptId=r.deptId
      console.log("123",this.form2.communityId)
    },
    updReal(r){
      this.form2.dept=r.deptId
      console.log("234",this.form2.dept)
      // 高亮显示逻辑
    },
    async updReplaCement(){
      let res = await this.$http.put("zyCommunity/replacement?communityId="+this.form2.communityId+"&deptId="+this.form2.dept);
      console.log(res)
      this.dialogVisible = false;
      this.getCommunityList()

    },

    /** 修改按钮操作 */
    handleUpdate(r) {
      this.reset()
      this.form = structuredClone(r)
      this.open = true;
      // this.type=r.dictType;
      this.title = "修改";
    },
    // 表单重置
    reset() {
      this.form = {
        communityId: 0,
        communityName: undefined,
        remark: undefined,
        communityDetailedAddress:undefined,
        communityProvenceCode:"",
        communityCityCode:"",
        communityTownCode:""
      };

    },
    async saveRole() {
      console.log(this.form.communityId)
      // this.form.status = this.form.status == "正常" ? '0' : '1';
      if (this.form.communityName == 0 || this.form.communityDetailedAddress == 0 ||
          this.form.communityDetailedAddress == null || this.form.communityName == null) {
        this.$message.error("请输入参数")
        return
      }
      if (this.form.communityId != 0) {
        this.form.communityProvenceCode=this.selectedOptions[0];
        this.form.communityCityCode=this.selectedOptions[1];
        this.form.communityTownCode=this.selectedOptions[2];

        let res = await this.$http.put("zyCommunity/updCommunity",this.form);
        console.log(res)
        if (res.data.status === 200) {
          this.open = false;
          this.$message.success("修改成功")
          this.getCommunityList();
        } else {
          this.$message.error(res.data.msg);
        }
      }
      if (this.form.communityId == 0) {
        this.form.communityId=Date.now()
        this.form.communityCode='COMMUNITY_'+Date.now()
        this.form.communityProvenceCode=this.selectedOptions[0];
        this.form.communityCityCode=this.selectedOptions[1];
        this.form.communityTownCode=this.selectedOptions[2];

        console.log(this.form.communityTownCode,this.form.communityCityCode,this.form.communityProvenceCode)
        let res = await this.$http.post("zyCommunity/insCommunity",this.form);
        console.log(res)
        if (res.data.status === 200) {
          this.open = false;
          this.$message.success("新增成功")
          this.open = false;
          this.getCommunityList();
        } else {
          this.reset()
          this.$message.error(res.data.msg);

        }
      }
    },

  }
}
</script>

<style>
.highlight-button {
  background-color: yellow;
  /* 其他样式定义 */
}
</style>