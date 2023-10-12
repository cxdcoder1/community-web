<template>


  <div class="app-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>登录日志</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input
            v-model="queryParams.ipaddr"
            placeholder="请输入登录地址"
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input
            v-model="queryParams.userName"
            placeholder="请输入用户名称"
            clearable
            style="width: 240px;"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
            v-model="queryParams.status"
            placeholder="登录状态"
            clearable
            style="width: 240px"
        >
          <el-option
              v-for="dict in dictList"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="登录时间">
        <el-date-picker
            v-model="dateRange"
            style="width: 240px"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
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
            type="danger"
            plain
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['monitor:logininfor:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            size="mini"
            @click="handleClean"
            v-hasPermi="['monitor:logininfor:remove']"
        >清空
        </el-button>
      </el-col>
      <!--      <el-col :span="1.5">-->
      <!--        <el-button-->
      <!--            type="primary"-->
      <!--            plain-->
      <!--            icon="el-icon-unlock"-->
      <!--            size="mini"-->
      <!--            :disabled="single"-->
      <!--            @click="handleUnlock"-->
      <!--            v-hasPermi="['monitor:logininfor:unlock']"-->
      <!--        >解锁-->
      <!--        </el-button>-->
      <!--      </el-col>-->
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="el-icon-download"
            size="mini"
            @click="handleExport"
            v-hasPermi="['monitor:logininfor:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table ref="tables" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="访问编号" align="center" prop="infoId"/>
      <el-table-column label="用户名称" align="center" prop="userName" :show-overflow-tooltip="true" sortable="custom"
                       :sort-orders="['descending', 'ascending']"/>
      <el-table-column label="登录地址" align="center" prop="ipaddr" width="130" :show-overflow-tooltip="true"/>
      <el-table-column label="登录地点" align="center" prop="loginLocation" :show-overflow-tooltip="true"/>
      <el-table-column label="浏览器" align="center" prop="browser" :show-overflow-tooltip="true"/>
      <el-table-column label="操作系统" align="center" prop="os"/>
      <el-table-column label="登录状态" align="center" prop="status">
        <template slot-scope="scope">
          <!--          <dict-tag :options="dictList" :value="scope.row.status"/>-->
          <span v-if="scope.row.status === '0'">成功</span>
          <span v-else-if="scope.row.status === '1'">失败</span>
          <span v-else>Pending</span>
        </template>

      </el-table-column>
      <el-table-column label="操作信息" align="center" prop="msg" :show-overflow-tooltip="true"/>
      <el-table-column label="登录日期" align="center" prop="loginTime" sortable="custom"
                       :sort-orders="['descending', 'ascending']" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.loginTime | dateFormat }}</span>
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
  </div>
</template>

<script>

export default {
  data() {
    return {
      dictList: [],
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 选择用户名
      selectName: "",
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 日期范围
      dateRange: [],
      // 默认排序
      defaultSort: {prop: 'loginTime', order: 'descending'},
      // 查询参数
      queryParams: {
        current: 1,
        size: 10,
        ipaddr: undefined,
        userName: undefined,
        status: undefined,
        createTime: undefined,
        updateTime: undefined
      }
    };
  },

  created() {
    this.getList();
    this.getDictStatus();
  },
  methods: {
    /** 查询登录日志列表 */
    async getList() {
      this.queryParams.createTime = this.dateRange[0]
      this.queryParams.updateTime = this.dateRange[1]

      const {data: res} = await this.$http.get('sysLogininfor/list', {
        params: this.queryParams
      })
      console.log(res)
      this.list = res.data;
      this.total = res.total

    },

    getDictStatus: function () {
      this.$http.get("sysLogininfor/getStatus").then(res => {
        console.log(res, "ccccccc")
        this.dictList = res.data.data
      })

    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams = {
        current: 1,
        size: 10,
        ipaddr: undefined,
        userName: undefined,
        status: undefined,
        createTime: undefined,
        updateTime: undefined
      }
      this.queryParams.current = 1;
      this.getList();
    },
    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.infoId)
      this.single = selection.length != 1
      this.multiple = !selection.length
      this.selectName = selection.map(item => item.userName);
    },
    // /** 排序触发事件 */
    // handleSortChange(column, prop, order) {
    //   this.queryParams.orderByColumn = column.prop;
    //   this.queryParams.isAsc = column.order;
    //   this.getList();
    // },
    /** 删除按钮操作 */
    async handleDelete() {
      const infoIds = this.ids;
      const confirmResult = await this.$confirm('确认要批量删除吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      this.$http.delete("sysLogininfor/" + infoIds).then(() => {
        this.getList();
        this.$message.success("删除成功");
      }).catch(() => {
      });
    },
    /** 清空按钮操作 */
    async handleClean() {
      const confirmResult = await this.$confirm('确认要清空吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消清空')
      }
      this.$http.delete("sysLogininfor/clean").then(() => {
        this.getList();
        this.$message.success("清空成功");
      }).catch(() => {
      });
    },
    // /** 解锁按钮操作 */
    // handleUnlock() {
    //   const username = this.selectName;
    //   this.$modal.confirm('是否确认解锁用户"' + username + '"数据项?').then(function () {
    //     return unlockLogininfor(username);
    //   }).then(() => {
    //     this.$modal.msgSuccess("用户" + username + "解锁成功");
    //   }).catch(() => {
    //   });
    // },
    /** 导出按钮操作 */
    async handleExport() {
      const {data: res} = await this.$http.post(`excel/loginList`, this.ids)
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }
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
  }
};
</script>

