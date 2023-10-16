<template>
<div>
  <br>
  <el-breadcrumb separator-class="el-icon-arrow-right" style="margin-left: 20px">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>小区管理 / 业主信息</el-breadcrumb-item>
  </el-breadcrumb>
  <br>
  <el-card>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="昵称" prop="buildingName">
        <el-input
            class="custom-input"
            v-model.trim="queryParams.ownerNickname"
            placeholder="请输入昵称"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="真实姓名" prop="buildingName" >
        <el-input
            class="custom-input"
            v-model.trim="queryParams.ownerRealName"
            placeholder="请输入真实姓名"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="身份证" prop="buildingName">
        <el-input
            class="custom-input"
            v-model.trim="queryParams.ownerIdCard"
            placeholder="请输入身份证号码"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="电话" prop="buildingName">
        <el-input
            class="custom-input"
            v-model.trim="queryParams.ownerPhoneNumber"
            placeholder="请输入电话号码"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <div style="margin-left:65px ">
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
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
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
        :data="zyOwnerRoomList"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="selectionChangeHandle"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="index" label="序号" width="100">
      </el-table-column>
      <el-table-column
          prop="ownerNickname"
          label="昵称"
          width="100"
      ></el-table-column>
      <el-table-column
          prop="ownerRealName"
          label="真实姓名"
          width="100"
      ></el-table-column>
      <el-table-column prop="ownerGender" label="性别" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.ownerGender==='Male'">男</span>
          <span v-if="scope.row.ownerGender==='female'">女</span>
          <span v-if="scope.row.ownerGender==='unkow'">未知</span>
        </template>
      </el-table-column>
      <el-table-column
          prop="ownerAge"
          label="年龄"
          width="100"
      ></el-table-column>
      <el-table-column
          prop="ownerIdCard"
          label="身份证"
          width="100"
      ></el-table-column>
      <el-table-column
          prop="communityName"
          label="小区名字"
          width="100"
      ></el-table-column>
      <el-table-column
          prop="unitName"
          label="单元名字"
          width="100"
      ></el-table-column>
      <el-table-column
          prop="buildingName"
          label="楼栋名字"
          width="100"
      ></el-table-column>
      <el-table-column
          prop="roomName"
          label="房屋名字"
          width="100"
      ></el-table-column>
      <el-table-column prop="ownerBirthday" label="出生日期" width="100">
        <template slot-scope="scope">
          {{ scope.row.ownerBirthday | dateFormat }}
        </template>
      </el-table-column>
      <el-table-column prop="ownerType" label="业主类型" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.ownerType==='yz'">业主</span>
          <span v-if="scope.row.ownerType==='zh'">租户</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="{ row }">
          <el-button size="mini" icon="el-icon-delete" type="text" @click="untie(row)">解绑</el-button>
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
        derivesA:[],
        // 总条数
        total: 0,
        // 显示搜索条件
        showSearch: true,
        //小区集合
        zyOwnerRoomList:{},
        zyCommunityList: {},
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          ownerNickname: "",
          ownerRealName: "",
          ownerIdCard:"",
          communityId:"",
          ownerPhoneNumber: ""
        },
        form:{
          recordId:"",
          ownerRoomId:"",
          communityId:"",
          buildingId:"",
          unitId:"",
          roomId:"",
          ownerId:"",
          ownerType:"",
          roomStatus:"",
          recordAuditOpinion:"",
          recordAuditType:"",
          createById:"",
          createBy:"",
          createTime:"",
          updateBy:"",
          updateTime:"",
          remark:""
        }
      }
    },
  async created() {
    await this.communityList();
    await this.getZyOwnerRoomList();
  },
  methods:{
    async communityList() {
      const {data: res} = await this.$http.get("zyBuilding/getCommunityList");
      this.zyCommunityList = res.data;
      this.queryParams.communityId = this.zyCommunityList[0].communityId;
    },
     async getZyOwnerRoomList() {
       const {data: res1} = await this.$http.get("zyOwner/zyOwnerList", {
         params: this.queryParams
       });
       console.log(res1)
       this.total = res1.data.total
       this.zyOwnerRoomList = res1.data.records
     },
    updateQueryParams() {
      this.getZyOwnerRoomList();
    },
    handleSizeChange(val) {
      this.queryParams.size = val
      this.getZyOwnerRoomList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getZyOwnerRoomList();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1;
      this.getZyOwnerRoomList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.ownerNickname = '';
      this.queryParams.ownerRealName = '';
      this.queryParams.ownerIdCard = '';
      this.queryParams.ownerPhoneNumber = '';
      this.$refs.queryForm.clearValidate();
      this.handleQuery();
    },
    async untie(row) {
      let res = JSON.parse(window.sessionStorage.getItem("user"));
      this.form.recordId=Date.now();
      this.form.createBy=res.createBy
      this.form.ownerType=row.ownerType
      this.form.recordAuditOpinion="由["+res.userName+"]解绑"
      this.form.communityId=row.communityId
      this.form.buildingId=row.buildingId
      this.form.roomId=row.roomId
      this.form.unitId=row.unitId
      this.form.roomStatus=3
      this.form.ownerRoomId=row.ownerRoomId
      this.form.ownerId=row.ownerId
      const confirmResult = await this.$confirm('确认要解绑' + row.ownerRealName + '吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消解绑')
      }
      await this.$http.put('zyOwner/updateStatus/' + row.ownerRoomId,this.form).then(res => {
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.getZyOwnerRoomList();
        } else {
          this.$message.error(res.data.msg);
        }
      })
    },
    //把选中的那条记录的postId属性放到deriveList中
    selectionChangeHandle(val) {
      this.derivesA = []
      for (let i = 0; i < val.length; i++) {
        //concat方法在数组后追加内容。
        this.derivesA = this.derivesA.concat(val[i].ownerId)
        this.ids=this.derivesA;
      }
    },
    async derive() {
      const {data: res} = await this.$http.post(`excel/ownerList`, this.derivesA)
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
<style>
.custom-input {
  width: 170px;
}
</style>