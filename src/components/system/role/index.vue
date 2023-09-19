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
        >新增</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
        >导出</el-button>
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
          >修改</el-button>
          <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
          >删除</el-button>
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
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'UserRole',
  data () {
    return {
      dictList: [
        {label: '正常', value: '0'},
        {label: '禁用', value: '1'}
      ],
      // currentPage: 1,
      // pageSize: 1,
      roleList: [],
      // 总条数
      total: 0,
      // 日期范围
      dateRange: [],

      queryParams: {
        Current:1,
        Size:1,
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
    handleCurrentChange (val) {
      console.log('asda'+val)
      // 更新当前页数是第几页
      this.queryParams.Current = val
      this.getRoleList();
    },

  }

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
    handleCurrentChange (val) {
      console.log('asda'+val)
      // 更新当前页数是第几页
      this.queryParams.Current = val
      this.getRoleList();
    }
  }

}
</script>