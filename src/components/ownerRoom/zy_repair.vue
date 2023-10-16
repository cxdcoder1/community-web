<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>报修管理 / 报修信息</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-card>
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="报修状态" prop="repairState">
          <el-select v-model="queryParams.repairState" placeholder="请选择报修状态" clearable size="small">
            <el-option
                v-for="item in repairOption"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="业主姓名" prop="ownerRealName">
          <el-input
              v-model="queryParams.ownerRealName"
              placeholder="请输入业主姓名"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="业主电话" prop="ownerPhoneNumber">
          <el-input
              v-model="queryParams.ownerPhoneNumber"
              placeholder="请输入业主电话"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
        <div style="margin-left:55px ">
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
          :data="zyRepairList"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="selectionChangeHandle"
      >
        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column
            label="序号"
            type="index"
            width="50"
            align="center">
        </el-table-column>
        <el-table-column label="报修编号" align="center" prop="repairNum" width="180"/>
        <el-table-column label="报修状态" align="center" prop="repairState" :formatter="repairStatusFormat"/>
        <el-table-column label="业主姓名" align="center" prop="ownerRealName"/>
        <el-table-column label="业主电话" align="center" prop="ownerPhoneNumber"/>
        <el-table-column label="报修内容" align="center" prop="repairContent"/>
        <el-table-column label="详细地址" align="center" prop="address"/>
        <el-table-column label="创建时间" align="center" width="180">
          <template slot-scope="scope">
            {{ scope.row.createTime }}
          </template>

          <!--      <template slot-scope="scope">-->
          <!--        {{ scope.row.doorTime | moment('YYYY-MM-DD') }}-->
          <!--      </template>-->

        </el-table-column>
        <el-table-column label="期待上门时间" align="center" prop="doorTime" width="180">
          <template slot-scope="scope">
            {{ scope.row.doorTime }}
          </template>
        </el-table-column>
        <el-table-column label="处理人姓名" align="center" prop="completeName"/>
        <el-table-column label="备注" align="center" prop="remark"/>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="text"
                icon="el-icon-view"
                v-hasPermi="['system:repair:edit']"
                @click="oper(scope.row)"
            >查看详情
            </el-button>
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

      <!--  查看详情表单-->
      <el-dialog :visible.sync="open" width="700px" append-to-body>
        <el-form ref="form" :model="form">
          <el-row class="mb8">
            <el-col :span="1.5">
              <el-form-item label="报修编号" prop="repairNum" label-width="98px">
                <el-input v-model="form.repairNum" style="width: 200px" readonly/>
              </el-form-item>
            </el-col>
            <el-col :span="1.5">
              <el-form-item label="报修状态" prop="repairState" label-width="98px">
                <el-select v-model="form.repairState" placeholder="请选择报修状态" clearable size="small">
                  <el-option
                      v-for="item in repairOption"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row class="mb8">
            <el-col :span="1.5">
              <el-form-item label="业主姓名" prop="userId" label-width="98px">
                <el-input v-model="form.ownerRealName" style="width: 200px" readonly/>
              </el-form-item>
            </el-col>
            <el-col :span="1.5">
              <el-form-item label="创建时间" prop="createTime" label-width="98px">
                <el-date-picker clearable size="small" style="width: 200px"
                                v-model="form.createTime"
                                type="datetime"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                readonly
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="1.5">
              <el-form-item label="期待上门时间" prop="doorTime" label-width="98px">
                <el-date-picker clearable size="small" style="width: 200px"
                                v-model="form.doorTime "
                                type="datetime"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                readonly
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="1.5">
              <el-form-item label="派单时间" prop="assignmentTime" label-width="98px">
                <el-date-picker clearable size="small" style="width: 200px"
                                v-model="form.assignmentTime"
                                type="datetime"
                                value-format="yyyy-MM-dd HH:mm:ss"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="mb8">
            <el-col :span="1.5">
              <el-form-item label="接单时间" prop="receivingOrdersTime" label-width="98px">
                <el-date-picker clearable size="small" style="width: 200px"
                                v-model="form.receivingOrdersTime"
                                type="datetime"
                                value-format="yyyy-MM-dd HH:mm:ss"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="1.5">
              <el-form-item label="处理完成时间" prop="completeTime" label-width="98px">
                <el-date-picker clearable size="small" style="width: 200px"
                                v-model="form.completeTime"
                                type="datetime"
                                value-format="yyyy-MM-dd HH:mm:ss"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>


          <!--        <el-col :span="1.5">-->
          <!--          <el-form-item label="取消时间" prop="cancelTime" label-width="98px">-->
          <!--            <el-date-picker clearable size="small" style="width: 200px"-->
          <!--                            v-model="form.cancelTime"-->
          <!--                            type="datetime"-->
          <!--                            value-format="yyyy-MM-dd HH:mm:ss"-->
          <!--                            readonly-->
          <!--            >-->
          <!--            </el-date-picker>-->
          <!--          </el-form-item>-->
          <!--        </el-col>-->

          <el-row>
            <el-col :span="1.5">
              <el-form-item label="处理人Id" prop="assignmentId" label-width="98px">
                <el-input v-model="form.assignmentId" style="width: 200px" readonly/>
              </el-form-item>
            </el-col>
            <el-col :span="1.5">
              <el-form-item label="处理人姓名" prop="completeName" label-width="98px">
                <el-select v-model="form.completeName" style="width: 200px" @change="updateNumber">
                  <el-option v-for="user in userList" :key="user.userName" :label="user.userName"
                             :value="user.userName"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>

            <el-col :span="1.5">
              <el-form-item label="处理人电话" prop="completePhone" label-width="98px">
                <el-input v-model="this.number" style="width: 200px"/>
              </el-form-item>
            </el-col>
            <el-col :span="1.5">
              <el-form-item label="报修内容" label-width="98px">
                <el-input v-model="form.repairContent" :min-height="192" style="width: 200px" readonly/>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="1.5">
              <el-form-item label="小区ID" prop="communityId" label-width="98px">
                <el-input v-model="form.communityId" style="width: 200px" readonly/>
              </el-form-item>
            </el-col>
            <el-col :span="1.5">
              <el-form-item label="详细地址" prop="address" label-width="98px">
                <el-input v-model="form.address" style="width: 200px" readonly/>
              </el-form-item>
            </el-col>

          </el-row>
          <el-row>
            <el-col :span="1.5">
              <el-form-item label="备注" prop="remark" label-width="98px">
                <el-input type="textarea" v-model="form.remark" style="width: 500px"/>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer">
          <el-button type="primary" @click="update()">确定</el-button>
          <el-button @click="open=false">取 消</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      updateBy: "",
      numbers: "",
      total: "",
      derivesA: [],
      open: false,
      //绑定状态
      repairOption: [{
        value: '0',
        label: '待处理'
      }, {
        value: '1',
        label: '已分派'
      }, {
        value: '2',
        label: '已完成'
      }, {
        value: '3',
        label: '已取消'
      }],
      number: "",
      // 表单参数
      form: {},
      //搜索条件
      showSearch: true,
      //小区集合
      zyCommunityList: {},
      userList: {},
      zyRepairList: {},
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        repairState: "",
        ownerRealName: "",
        ownerPhoneNumber: "",
        communityId: ""
      },
    }
  },
  async created() {
    await this.getCommunityList();
    await this.getZyRepairList();
    await this.getUserList();
  },
  methods: {
    // 类型翻译
    repairStatusFormat(row) {
      if (row.repairState === '0') {
        return '待处理';
      } else if (row.repairState === '1') {
        return '已分派';
      } else if (row.repairState === '2') {
        return '已完成';
      } else if (row.repairState === '3') {
        return '已取消';
      }
    },
    // 获取小区
    async getCommunityList() {
      const {data: res} = await this.$http.get("zyBuilding/getCommunityList");
      this.zyCommunityList = res.data;
      this.queryParams.communityId = this.zyCommunityList[0].communityId;
      await this.getUserList();

    },
    async getUserList() {
      const {data: res} = await this.$http.post("zyRepair/getUserList/" + this.queryParams.communityId);
      this.userList = res.data;
      console.log(this.userList)
    },
    async getZyRepairList() {
      const {data: res1} = await this.$http.get("zyRepair/zyRepairDtoList", {
        params: this.queryParams
      });
      this.total = res1.data.total
      this.zyRepairList = res1.data.records
    },
    //小区下拉框事件变化
    updateQueryParams() {
      this.getZyRepairList();
      this.getUserList();
    },
    //分页
    handleSizeChange(val) {
      this.queryParams.size = val
      this.getZyRepairList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getZyRepairList();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1;
      this.getZyRepairList();
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
        this.derivesA = this.derivesA.concat(val[i].repairId)
        this.ids = this.derivesA;
      }
    },
    async oper(row) {
      //给查看详情表单赋值
      this.open = true;
      this.numbers = this.number


      this.form = structuredClone(row)

      console.log("", this.form.assignmentTime)


      let res = await this.$http.post("zyRepair/getNumber?name=" + this.form.completeName);
      this.number = res.data.data
    },
    derive() {
      alert(this.derivesA)
    },
    async update() {
      let res1 = JSON.parse(window.sessionStorage.getItem("user"));
      this.form.assignmentId = res1.userId
      this.form.updateBy = res1.userName
      this.form.completePhone = this.number
      let res = await this.$http.put("zyRepair/edit", this.form)
      if (res.data.status === 200) {
        this.open = false;
        this.$message.success(res.data.msg);
        this.getZyRepairList();
      } else {
        this.$message.error(res.data.msg);
      }
    },
    async updateNumber() {
      let res = await this.$http.post("zyRepair/getNumber?name=" + this.form.completeName);
      this.number = res.data.data
    },

  }
}
</script>