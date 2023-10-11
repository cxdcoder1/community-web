<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>业主审核</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-card>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item label="绑定状态" prop="status">
        <el-select v-model="queryParams.roomStatus" placeholder="绑定状态" clearable>
          <el-option
              v-for="dict in statusPotion"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="OroomList" ref="list">
      <el-table-column label="序号" align="center">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="小区名称" align="center" key="communityName" prop="communityName"/>
      <el-table-column label="楼栋名称" align="center" key="buildingName" prop="buildingName"/>
      <el-table-column label="单元名称" align="center" key="unitName" prop="unitName"/>
      <el-table-column label="房间名称" align="center" key="roomName" prop="roomName"/>
      <el-table-column label="业主名称" align="center" key="ownerRealName" prop="ownerRealName"/>
      <el-table-column label="业主类型" align="center" key="ownerType" prop="ownerType">
        <template slot-scope="scope">
          <span>{{ scope.row.ownerType == "yz" ? "业主" : "租户" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="绑定状态" align="center" prop="roomStatus">
        <template slot-scope="scope">
          {{ scope.row.roomStatus != 1 ? (scope.row.roomStatus == 2 ? "审核失败" : "审核中") : "已绑定" }}
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" width="200px" prop="remark"/>

      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handlereview(scope.row)">
            <template v-if="scope.row.roomStatus == 1">
              <i class="el-icon-tickets"></i>
            </template>
            <template v-else-if="scope.row.roomStatus == 0">
              <i class="el-icon-thumb"></i>
            </template>
            <template v-else>
              <i class="el-icon-edit"></i>
            </template>
            {{ scope.row.roomStatus == 1 ? "查看详情" : (scope.row.roomStatus == 2 ? "再次审核" : "审核") }}
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
      <el-dialog
          title="审核"
          :visible.sync="dialogVisible"
          append-to-body
          :before-close="handleClose"
      >
  <span slot="footer" class="dialog-footer" style="display: flex; align-items: center; justify-content: center;">
    <el-input v-model="inputData" placeholder="请输入内容" style="width: 400px;"></el-input>
    <br>
      <div style="margin-left: 100px">
    <el-button @click="reviewReplaCement(2)" type="danger" size="small">拒绝</el-button>
    <el-button type="primary" @click="reviewReplaCement(1)" size="small">同意</el-button>
      </div>
  </span>
      </el-dialog>
    <el-dialog
        title="流程"
        :visible.sync="open"
        append-to-body :before-close="handleClose"
    >

      <el-table :data="OroomrecordList" ref="list">
        <el-table-column label="序号" align="center">
          <template slot-scope="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="业主名称" align="center" key="ownerRealName" prop="ownerRealName"/>
        <el-table-column label="业主类型" align="center" key="ownerType" prop="ownerType">
          <template slot-scope="scope">
            <span>{{ scope.row.ownerType == "yz" ? "业主" : "租户" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="绑定状态" align="center" key="roomStatus" prop="roomStatus">
          <template slot-scope="scope">
            {{ scope.row.roomStatus === "0" ? "审核中" : scope.row.roomStatus === "2" ? "已拒绝" : scope.row.roomStatus === "3" ? "解绑" : "已绑定" }}
            </template>
          </el-table-column>
        <el-table-column label="审核意见" align="center" key="recordAuditOpinion" prop="recordAuditOpinion"/>
        <el-table-column label="审核人姓名" align="center" key="createBy" prop="createBy"/>
        <el-table-column label="审核人状态" align="center" key="recordAuditType" prop="recordAuditType">
          <template slot-scope="scope">
            {{ scope.row.recordAuditType === "App" ? "业主" : scope.row.recordAuditType === "Web" ? "物业" : "" }}
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" width="200px" prop="remark"/>
      </el-table>
    </el-dialog>
      </el-card>
  </div>
</template>

<script>
export default {
  name: "OwnerRoom",
  data() {
    return {
      OroomrecordList:[],

      inputData:"",

      OroomList: [],
      // 总条数
      total: 0,
      open:false,
      dialogVisible: false,

      statusPotion: [{dictLabel: "已绑定", dictValue: 1}, {dictLabel: "审核中", dictValue: 0}, {dictLabel: "审核失败", dictValue: 2}],
      //搜索
      queryParams: {
        current: 1,
        size: 10,
        roomStatus: undefined
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
  }, created() {
    this.getOwnerRoomList();
  },
  methods: {
    async getOwnerRoomList() {
      const {data: res} = await this.$http.get('zyOwnerRoom/getOwnerRoomAll', {
        params: this.queryParams
      })

      console.log("res", res)
      this.total = res.data.total
      this.OroomList = res.data.records
      console.log("total", this.total);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1
      this.getOwnerRoomList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        roomStatus: undefined
      }
    },
    // @size-change页码展示数量点击事件
    handleSizeChange(val) {
      console.log('asda' + val)
      // 更新每页展示数据size
      this.queryParams.size = val
      this.getOwnerRoomList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      console.log('asda' + val)
      // 更新当前页数是第几页
      this.queryParams.current = val
      this.getOwnerRoomList();
    },
    async handlereview(r) {
      if(r.roomStatus == 0 || r.roomStatus ==2){
        this.dialogVisible = true;
        this.form = structuredClone(r);
      }
      if(r.roomStatus == 1){
        this.open = true;
        let res = await  this.$http.get('zyOwnerRoom/getRoomRecordList?name='+r.ownerRealName)
        console.log("111",res.data.data)
        this.OroomrecordList=res.data.data
      }
    },
    // eslint-disable-next-line no-unused-vars
    reviewReplaCement(i){

// 获取输入框值
        var currentDate = new Date(); // 创建 Date 对象，表示当前日期和时间
        var year = currentDate.getFullYear(); // 获取当前年份
        var month = currentDate.getMonth() + 1; // 获取当前月份（注意：月份是从 0 开始的，所以需要加 1）
        var day = currentDate.getDate(); // 获取当前日期
        var hour = String(currentDate.getHours()).padStart(2, '0');
        var minute = String(currentDate.getMinutes()).padStart(2, '0');
        var second = String(currentDate.getSeconds()).padStart(2, '0');
// 如果您希望在请求后端 API 时使用当前日期，可以将其格式化为适当的字符串格式

      let res = JSON.parse(window.sessionStorage.getItem("user"));
      this.form.recordId=Date.now();
      this.form.recordAuditOpinion=this.inputData;
      this.form.createTime=year + "-" + month + "-" + day+" "+hour+":"+minute+":"+second;
      this.form.updateTime=year + "-" + month + "-" + day+" "+hour+":"+minute+":"+second;
      console.log(res.createBy)
      this.form.createBy=res.createBy;
      this.form.recordAuditType='Web';      // 同意或拒绝决定
      this.form.roomStatus=i;

      console.log(this.form.ownerRoomId)
      // 将数据和决定发送到后端
      // 使用axios发送POST请求的示例
      this.$http.post('zyOwnerRoom/insetRoomRecordList', this.form)
          .then(_=> {
            this.$message.success("执行成功")
            this.dialogVisible=false
            this.inputData=""
           this.getOwnerRoomList()
          })
          .catch(error => {
            // 处理错误
          });
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {
          });
    },

  }
}
</script>


<style scoped>

</style>