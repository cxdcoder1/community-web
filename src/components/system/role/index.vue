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
        <el-select v-model="queryParams.status" placeholder="菜单状态" clearable>
          <el-option
              v-for="dict in dictList"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
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
    <el-table :data="roleList">
      <el-table-column type="selection" width="55" align="center" />
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
          ><el-tag :type="scope.row.status === '0' ? '' : 'danger'">
            {{ scope.row.status === '0' ? '正常' : '禁用' }}
          </el-tag></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateFormat}}
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
              @click="deleteRole(scope.row)"
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
        :total="total">
    </el-pagination>


<!--    &lt;!&ndash;    选择路径对话框&ndash;&gt;-->
<!--    <el-dialog title="收货地址" :visible.sync="dialogFormVisible">-->
<!--      <el-form :model="form">-->
<!--        <el-form-item label="活动名称" :label-width="formLabelWidth">-->
<!--          <el-input v-model="form.name" autocomplete="off"></el-input>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="活动区域" :label-width="formLabelWidth">-->
<!--          <el-select v-model="form.region" placeholder="请选择活动区域">-->
<!--            <el-option label="区域一" value="shanghai"></el-option>-->
<!--            <el-option label="区域二" value="beijing"></el-option>-->
<!--          </el-select>-->
<!--        </el-form-item>-->
<!--      </el-form>-->
<!--      <div slot="footer" class="dialog-footer">-->
<!--        <el-button @click="dialogFormVisible = false">取 消</el-button>-->
<!--        <el-button type="primary" @click="dialogFormVisible = false">确 定</el-button>-->
<!--      </div>-->
<!--    </el-dialog>-->


  </div>
</template>

<script>
// import moment from 'moment';
export default {
  name: 'UserRole',
  data() {
    return {
      //导出集合
      deriveList: [],
      //导出的对象
      derives: {},
      dictList: [
        {label: '正常', value: '0'},
        {label: '禁用', value: '1'}
      ],
      // currentPage: 1,
      // pageSize: 1,
      roleList: [],
      // 总条数
      total: 0,
      //总页数
      pages:'',
      // 日期范围
      dateRange: [],

      queryParams: {
        //当前页
        Current: 1,
        //当前页长度
        Size: 1,
        roleName: '',
        roleKey: '',
        status:undefined,
        createTime:undefined,
        updateTime:undefined
      },
    }
  },
  created() {
    this.getRoleList();
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
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }
      console.log(res)
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
        // console.log(res.data.status)
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
    async getRoleList() {

      this.queryParams.createTime=this.dateRange[0];
      this.queryParams.updateTime=this.dateRange[1];

      const {data: res} = await this.$http.get('sysRole/list', {
        params: this.queryParams
      })
      this.roleList = res.data.records;
      this.total = res.data.total

      // console.log(this.roleList)
    },handleQuery() {
      this.queryParams.pageNum = 1;
      // 设置时间范围参数

      this.getRoleList();
    },
    // 角色状态修改
    handleStatusChange(row) {
      let text = row.status === "0" ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.roleName + '"角色吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        // eslint-disable-next-line no-undef
        return changeRoleStatus(row.roleId, row.status);
      }).then(() => {
        this.msgSuccess(text + "成功");
      }).catch(function () {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {}
      this.getRoleList()
    },
    // @size-change页码展示数量点击事件
    handleSizeChange(val) {
      console.log('asda' + val)
      // 更新每页展示数据size
      this.queryParams.Size = val
      this.getRoleList();

    },
    // @current-change页码点击事件
    handleCurrentChange (val) {
      console.log('asda'+val)
      // 更新当前页数是第几页
      this.queryParams.Current = val
      this.getRoleList();
    },

  },

    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams={}
      this.getRoleList()
    },
    // @size-change页码展示数量点击事件
    handleSizeChange (val) {
      console.log('asda'+val)
      // 更新每页展示数据size
      this.queryParams.Size = val
      this.getRoleList();

    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      console.log('asda' + val)
      // 更新当前页数是第几页
      this.queryParams.Current = val
      this.getRoleList();
    }
  }



</script>