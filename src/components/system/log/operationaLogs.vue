<template>
<div>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>操作日志</el-breadcrumb-item>
  </el-breadcrumb>
  <br>
  <el-card>
  <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
    <el-form-item label="系统模块" prop="title">
      <el-input
          v-model="queryParams.title"
          placeholder="请输入系统模块"
          clearable
          style="width: 240px;"

      />
    </el-form-item>
    <el-form-item label="操作人员" prop="operName">
      <el-input
          v-model="queryParams.operName"
          placeholder="请输入操作人员"
          clearable
          style="width: 240px;"

      />
    </el-form-item>
    <el-form-item label="类型" prop="businessType">
      <el-select v-model="queryParams.businessType" placeholder="操作类型" clearable>
        <el-option
            v-for="dict in operType"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-select v-model="queryParams.status" placeholder="操作状态" clearable>
        <el-option
            v-for="dict in statusPotion"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="操作时间">
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
      <el-button icon="el-icon-refresh" size="mini"  @click="resetQuery">重置</el-button>
    </el-form-item>
  </el-form>
    <el-button
        type="danger"
        plain
        icon="el-icon-delete"
        size="mini"
        :disabled="multiple"
        @click="batchDelete(ids)"
    >删除
    </el-button>
    <el-button
        type="danger"
        plain
        icon="el-icon-delete"
        size="mini"
        @click="sel"
    >清空
    </el-button>
    <el-button
        type="warning"
        plain
        size="mini"
        icon="el-icon-download"
        @click="derive()"
    >导出
    </el-button>
  </el-card>
  <el-card>
    <el-table
        ref="multipleTable"
        :data="operLogList"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="selectionChangeHandle"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column label="日志编号" align="center" prop="operId" />
      <el-table-column label="系统模块" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="操作类型" align="center" prop="businessType">
        <template slot-scope="scope">
          <span v-if="scope.row.businessType === 1" class="badge success">新增</span>
          <span v-else-if="scope.row.businessType === 2" class="badge primary">修改</span>
          <span v-else-if="scope.row.businessType === 3" class="badge danger">删除</span>
          <span v-else-if="scope.row.businessType === 4" class="badge warning">授权</span>
          <span v-else-if="scope.row.businessType === 5" class="badge info">导出</span>
          <span v-else-if="scope.row.businessType === 6" class="badge info">导入</span>
          <span v-else-if="scope.row.businessType === 7" class="badge danger">强退</span>
          <span v-else class="badge danger">生成代码</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人员" align="center" prop="operName" width="110" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" />
      <el-table-column label="操作地址" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="操作地点" align="center" prop="operLocation" :show-overflow-tooltip="true" />
      <el-table-column label="操作状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '0' ? '' : 'danger'">
            {{ scope.row.status === '0' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作日期" align="center" prop="operTime" width="160" sortable="custom" :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
          {{ scope.row.operTime | dateFormat }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="handleView(scope.row)"
          >详细</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.current"
        :page-sizes="[1, 5, 10]"
        :page-size="queryParams.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
    <el-dialog title="操作日志详细" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
        <el-col :span="12">
          <el-form-item label="操作模块：">{{ form.title }}</el-form-item>
          <el-form-item
              label="登录信息："
          >{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}</el-form-item>
        </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">{{ form.operParam }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数：">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="操作状态：">
              <div v-if="form.status == 0">成功</div>
              <div v-else-if="form.status == 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="操作时间：">
             {{form.operTime  | dateFormat}}
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>

    </el-dialog>
  </el-card>


</div>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.badge.success {
  background-color: #b8e994;
  color: #fff;
}

.badge.primary {
  background-color: #63a69f;
  color: #fff;
}

.badge.danger {
  background-color: #ff7675;
  color: #fff;
}

.badge.warning {
  background-color: #f7b731;
  color: #fff;
}

.badge.info {
  background-color: #a4b0be;
  color: #fff;
}
</style>
<script>

export default {

    data(){
        return{
          // 非单个禁用
          multiple: true,
          open:false,
          operType:[],
          statusPotion:[],
          // 日期范围
          dateRange: [],
          total:'',
          operLogList:{},
          derivesA:[],
          // 表单参数
          form: {},
          // 查询参数
          queryParams: {
            pageNum: 1,
            pageSize: 10,
            title: undefined,
            operName: undefined,
            businessType: undefined,
            status: undefined,
            createTime:undefined,
            operTime: undefined,
          }
      }
    },
  async created() {
    await this.getOperLogList();
    await this.getStatus();
    await this.getOperType();
  },
  methods:{
    //把选中的那条记录的postId属性放到deriveList中
    selectionChangeHandle(val) {
      this.multiple = !val.length;
      this.derivesA = []
      for (let i = 0; i < val.length; i++) {
        //concat方法在数组后追加内容。
        this.derivesA = this.derivesA.concat(val[i].operId)
        this.ids=this.derivesA;
      }
    },

    async batchDelete() {
      const confirmResult = await this.$confirm('确认要删除' + this.ids.length + '条数据吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      await this.$http.post('sysOperLog/deletes/',this.ids).then(res => {
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.getOperLogList();
          // 清空选中的数据
          this.ids = [];
        } else {
          this.$message.error(res.data.msg);
          // 清空选中的数据
          this.getOperLogList();
          this.ids = [];
        }
      })
    },
    async getOperLogList() {
      const {data: res1} = await this.$http.get("sysOperLog/operLoglist", {
        params: this.queryParams
      });
      this.total = res1.data.total
      this.operLogList = res1.data.records
      console.log(this.operLogList)
    },
    handleSizeChange(val) {
      this.queryParams.size = val
      this.getOperLogList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getOperLogList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.$refs["queryForm"].resetFields();
      this.queryParams.dictType = this.defaultDictType;
      this.handleQuery();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.createTime = this.dateRange[0]
      this.queryParams.operTime = this.dateRange[1]
      this.queryParams.current = 1;
      this.getOperLogList();
    },
    async getStatus() {
      const {data: res} = await this.$http.get('sysOperLog/statusOption')
      this.statusPotion=res.data;
    },
    async getOperType() {
      const {data: res} = await this.$http.get('sysOperLog/operOption')
      this.operType=res.data;
    },
    async handleView(row) {
      const {data: res} = await this.$http.get('sysOperLog/getOper?id='+row.operId)
      this.form=res.data;
      console.log(this.form)
      this.open = true;
    },
    async sel() {
      const confirmResult = await this.$confirm('确认要清空数据吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const {data: res} = await this.$http.post('sysOperLog/dels')
      if (res.status == 200) {
        //清空成功
        this.$message.success(res.msg)
        this.getOperLogList();
      } else if (res.status == 201) {
        //清空失败
        this.$message.error(res.msg)
      }
    },
    //导出数据
    async derive() {
      const {data: res} = await this.$http.post(`excel/operlist`, this.derivesA)
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
        this.getBuildingList();
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }
    },
  }
}
</script>