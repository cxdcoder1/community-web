<template>
<div>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>访客管理 / 访客邀请</el-breadcrumb-item>
  </el-breadcrumb>
  <br>
  <el-card>
  <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
    <el-form-item label="访客姓名" prop="visitorName">
      <el-input
          v-model="queryParams.visitorName"
          placeholder="请输入访客姓名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
      />
    </el-form-item>
    <el-form-item label="访客手机号" prop="visitorPhoneNumber" label-width="85px">
      <el-input
          v-model="queryParams.visitorPhoneNumber"
          placeholder="请输入访客手机号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
      />
    </el-form-item>
    <el-form-item label="到访时间" prop="visitorDate">
      <el-date-picker clearable size="small" style="width: 200px"
                      v-model="queryParams.visitorDate"
                      type="date"
                      value-format="yyyy-MM-dd"
                      placeholder="选择到访时间">
      </el-date-picker>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
      <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
    </el-form-item>
    <div style="margin-left:65px " >
      <el-form-item>
        <el-select v-model="queryParams.communityId" @change="updateQueryParams">
          <el-option
              v-for="item in this.zyCommunityList"
              :key="item.communityId"
              :label="item.communityName"
              :value="item.communityId"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-button
          style="margin-top: 2px"
          type="warning"
          plain
          size="mini"
          icon="el-icon-download"
          @click="derive()"
      >导出
      </el-button>
    </div>

  </el-form>
  </el-card>
  <el-card>
    <el-table
        ref="multipleTable"
        :data="zyVisitorList"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="selectionChangeHandle"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
          label="序号"
          type="index"
          width="50"
          align="center">
      </el-table-column>
      <el-table-column label="访客姓名" align="center" prop="visitorName" />
      <el-table-column label="访客手机号" align="center" prop="visitorPhoneNumber" />
      <el-table-column label="小区名称" align="center" prop="communityName" />
      <el-table-column label="到访时间" align="center" prop="visitorDate" width="180">
        <template slot-scope="scope">
          {{ new Date(scope.row.visitorDate).toLocaleDateString() }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateFormat }}
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark">
        <template slot-scope="scope">
          <el-tag :type="scope.row.remark === '1' ? 'danger' : ''">
<!--            {{ scope.row.remark === '0' ? '同意' : (scope.row.remark === '1' ? '<span style="color: red;">拒绝</span>' : '待处理') }}-->
            {{ scope.row.remark === '0' ? '同意' : (scope.row.remark === '1' ? ' 拒绝' : '待处理') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.remark === '2'" type="primary" size="small" @click="update(scope.row)">同意</el-button>
          <el-button v-if="scope.row.remark === '2'" type="danger" size="small" @click="updates(scope.row)">拒绝</el-button>
          <span v-else>已处理</span>
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
  </el-card>
</div>
</template>

<script>
export  default {
    data(){
      return{
        total:"",
        //导出集合
        derivesA:[],
        //搜索条件
        showSearch:true,
        //条件参数
        queryParams: {
          pageNum: 1,
          pageSize: 5,
          visitorName: null,
          visitorPhoneNumber: null,
          visitorDate: null,
          communityId:""
        },
        //小区集合
        zyCommunityList: {},
        //访客集合
        zyVisitorList:{}
      }
    },
  async created() {
    await this.communityList();
    await this.getZyVisitorList();
  },
  methods:{
      //获取小区
    async communityList() {
      const {data: res} = await this.$http.get("zyBuilding/getCommunityList");
      this.zyCommunityList = res.data;
      this.queryParams.communityId = this.zyCommunityList[0].communityId;
    },
    //获取小区下面的访客
    async getZyVisitorList() {
      const {data: res1} = await this.$http.get("zyVisitor/zyVisitorList", {
        params: this.queryParams
      });
      this.total = res1.data.total
      this.zyVisitorList = res1.data.records
    },
    //小区下拉框事件变化
    updateQueryParams() {
      this.getZyVisitorList();
    },
    //分页
    handleSizeChange(val) {
      this.queryParams.size = val
      this.getZyVisitorList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getZyVisitorList();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1;
      this.getZyVisitorList();
    },
    //重置按钮
    resetQuery() {
      this.$refs["queryForm"].resetFields();
      this.handleQuery();
    },
    //多选框选中
    selectionChangeHandle(val) {
      this.derivesA = []
      for (let i = 0; i < val.length; i++) {
        //concat方法在数组后追加内容。
        this.derivesA = this.derivesA.concat(val[i].visitorId)
        this.ids=this.derivesA;
      }
    },
    //导出方法
    async derive() {
      const {data: res} = await this.$http.post(`excel/zyVisitorList`, this.derivesA)
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }
    },
    //同意或拒绝访客邀请
    async update(row) {
      const {data: res} = await this.$http.put(`zyVisitor/updateRemark/`+row.visitorId)
      if (res.status == 200) {
        this.$message.success(res.msg)
        this.getZyVisitorList();
        // 修改对应的数据
      } else if (res.status == 201) {
        this.$message.error(res.msg)
      }
    },
    async updates(row) {
      const {data: res} = await this.$http.put(`zyVisitor/updateRemarks/`+row.visitorId)
      if (res.status == 200) {
        this.$message.success(res.msg)
        this.getZyVisitorList();
        // 修改对应的数据
      } else if (res.status == 201) {
        this.$message.error(res.msg)
      }

    },

  }
}
</script>
<style scoped>

</style>