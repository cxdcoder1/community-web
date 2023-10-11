<template>
<div>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>投诉建议 / 投诉建议</el-breadcrumb-item>
  </el-breadcrumb>
  <br>
  <el-card>
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="类型" prop="complaintSuggestType">
        <el-select v-model="queryParams.complaintSuggestType" placeholder="请选择类型(投诉、建议)" clearable size="small">
          <el-option
              v-for="item in suggestOption"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
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
    </el-form>
  </el-card>
  <el-card>
    <el-table
        ref="multipleTable"
        :data="zyComplaintSuggestList"
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
      <el-table-column label="类型" align="center" prop="complaintSuggestType">
        <template slot-scope="scope">
          <el-tag :type="scope.row.complaintSuggestType === 'Suggest' ? '' : 'danger'">
            {{ scope.row.complaintSuggestType === 'Suggest' ? '建议' : '投诉' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="内容" align="center" prop="complaintSuggestContent" />
      <el-table-column label="创建者名称" align="center" prop="createBy" />
      <el-table-column label="创建者电话" align="center" prop="ownerPhoneNumber" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateFormat }}
        </template>
      </el-table-column>
      <el-table-column label="图片" align="center" prop="filesUrl">
        <template slot-scope="scope">
          <el-image style="width: 30px; height: 30px" :src="scope.row.filesUrl[1]" :preview-src-list="scope.row.filesUrl">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark">
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{ row }">
          <el-button size="mini" icon="el-icon-edit" type="text" @click="update(row)">回复</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.current"
        :page-sizes="[1, 5, 20]"
        :page-size="queryParams.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
    <el-dialog :title="title" :visible.sync="opens" width="500px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="备注" prop="remark">
          <el-input v-model.trim="form.remark"  type="textarea" placeholder="请输入回复内容"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </el-card>
  <br>
</div>
</template>
<script>
export  default{
  data(){
    return{
      form: {
        remark:""
      },
      title:"",
      opens:false,
      derivesA:[],
      //绑定状态
      suggestOption: [{
        value: 'Complaint',
        label: '投诉'
      },{
        value: 'Suggest',
        label: '建议'
      }],
      complaintSuggestId:"",
      //搜索条件
      showSearch:true,
      //小区集合
      zyCommunityList: {},
      zyComplaintSuggestList:{},
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        complaintSuggestType:"",
        communityId:""
      },
    }
  },
   async created() {
     await this.getCommunityList();
     await this.getZyComplaintSuggestList();
   },
  methods:{
    // 获取小区
    async getCommunityList() {
      const {data: res} = await this.$http.get("zyBuilding/getCommunityList");
      this.zyCommunityList = res.data;
      this.queryParams.communityId = this.zyCommunityList[0].communityId;
    },
    async getZyComplaintSuggestList() {
      const {data: res1} = await this.$http.get("zyComplaintSuggest/zyComplaintSuggestDtoList", {
        params: this.queryParams
      });
      this.total = res1.data.total
      this.zyComplaintSuggestList = res1.data.records
    },
    //小区下拉框事件变化
    updateQueryParams() {
      this.getZyComplaintSuggestList();
    },
    //分页
    handleSizeChange(val) {
      this.queryParams.size = val
      this.getZyComplaintSuggestList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getZyComplaintSuggestList();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1;
      this.getZyComplaintSuggestList();
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
        this.derivesA = this.derivesA.concat(val[i].complaintSuggestId)
        this.ids=this.derivesA;
      }
    },
    async derive() {
      const {data: res} = await this.$http.post(`excel/suggestList`, this.derivesA)
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
    update(row){
      this.opens=true;
      this.complaintSuggestId=row.complaintSuggestId;
    },
    // 表单取消按钮
    cancel() {
      this.opens = false;
      this.reset();
    },
    reset() {
      this.form = {
      remark: undefined
      };
    },
    async submitForm() {
      //  alert(this.form.remark)
      // alert(this.complaintSuggestId)
      let res = await this.$http.put("zyComplaintSuggest/remark/" + this.complaintSuggestId, this.form)
      if (res.data.status === 200) {
        this.opens = false;
        this.$message.success(res.data.msg);
        this.getZyComplaintSuggestList();
      } else {
        this.$message.error(res.data.msg);
      }
    }
  }
}
</script>