<template>
  <div class="app-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>房屋管理</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="`showSearch`">
      <!--      <el-form-item label="单元/楼栋" prop="value">-->
      <!--        <el-cascader-->
      <!--            v-model="value"-->
      <!--            :options="options"-->
      <!--            :props="{ expandTrigger: 'hover' }"-->
      <!--            @change="handleChange"></el-cascader>-->
      <!--      </el-form-item>-->
      <el-form-item label="小区" prop="value">
        <el-select
            v-model="queryParams.communityId"
            placeholder="小区"
            clearable
            @change="changeCommunity"
            style="width: 240px">
          <el-option
              v-for="dict in communityPotion"
              :key="dict.communityId"
              :label="dict.communityName"
              :value="dict.communityId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="楼栋" prop="value">
        <el-select
            v-model="queryParams.buildingId"
            placeholder="楼栋"
            clearable
            @change="changeBuilding"
            style="width: 240px">
          <el-option
              v-for="dict in buildingPotion"
              :key="dict.buildingId"
              :label="dict.buildingName"
              :value="dict.buildingId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="单元" prop="value">
        <el-select
            v-model="queryParams.unitId"
            placeholder="单元"
            clearable
            style="width: 240px">
          <el-option
              v-for="dict in unitPotion"
              :key="dict.unitId"
              :label="dict.unitName"
              :value="dict.unitId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="房屋状态" prop="status">
        <el-select
            v-model="queryParams.roomStatus"
            placeholder="房屋状态"
            clearable
            style="width: 240px">
          <el-option
              v-for="dict in roomStatusList"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="Add"
        >新增
        </el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            size="mini"
            :disabled="multiple"
            @click="delRooms"
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
        >导出
        </el-button>
      </el-col>
    </el-row>
    <!--渲染表格-->
    <el-table :data="roomList" @selection-change="handleSelectionChange" ref="list">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" width="120" type="index">
        <template slot-scope=""></template>
      </el-table-column>
      <el-table-column label="小区名称" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">{{ scope.row.communityName }}</template>
      </el-table-column>
      <el-table-column label="楼栋名称" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">{{ scope.row.buildingName }}</template>
      </el-table-column>
      <el-table-column label="单元名称" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">{{ scope.row.unitName }}</template>
      </el-table-column>
      <el-table-column label="楼层" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">{{ scope.row.roomLevel }}</template>
      </el-table-column>
      <el-table-column label="房间名称" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">{{ scope.row.roomName }}</template>
      </el-table-column>
      <el-table-column label="房屋编号" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">{{ scope.row.roomCode }}</template>
      </el-table-column>
      <el-table-column label="房间建筑面积" width="100">
        <template slot-scope="scope">{{ scope.row.roomAcreage }}</template>
      </el-table-column>
      <el-table-column label="算费系数" width="100">
        <template slot-scope="scope">{{ scope.row.roomCost }}</template>
      </el-table-column>
      <el-table-column label="房屋状态" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.roomStatus === 'has_stay'">已入住</span>
          <span v-else-if="scope.row.roomStatus === 'none'">未出售</span>
          <span v-else-if="scope.row.roomStatus === 'has_give'">已交房</span>
          <span v-else-if="scope.row.roomStatus === 'none_stay'">未入住</span>
        </template>
      </el-table-column>
      <el-table-column label="是否商铺" width="100">
        <template slot-scope="scope">{{ scope.row.roomIsShop == 'Y' ? "是" : "否" }}</template>
      </el-table-column>
      <el-table-column label="是否商品房" width="100">
        <template slot-scope="scope">{{ scope.row.roomSCommercialHouse == 'Y' ? "是" : "否" }}</template>
      </el-table-column>
      <el-table-column label="房屋户型" width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.roomHouseType === 'other'">其他</span>
          <span v-else-if="scope.row.roomHouseType === 'open_house'">开间</span>
          <span v-else-if="scope.row.roomHouseType === 'one_house'">一室一厅一卫</span>
          <span v-else-if="scope.row.roomHouseType === 'two_house'">两室一厅一卫</span>
          <span v-else-if="scope.row.roomHouseType === 'three_house'">三室一厅一卫</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateFormat }}
        </template>
      </el-table-column>
      <el-table-column label="备注" width="100">
        <template slot-scope="scope">{{ scope.row.remark }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
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
              @click="deleteRoom(scope.row)"
          >删除
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

    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body :before-close="handleClose">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-form-item label="小区" prop="communityId" v-if="!form.roomId">
            <el-select
                v-model="form.communityId"
                placeholder="小区"
                clearable
                @change="changeCommunity2"
                style="width: 240px">
              <el-option
                  v-for="dict in communityPotion"
                  :key="dict.communityId"
                  :label="dict.communityName"
                  :value="dict.communityId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="楼栋" prop="buildingId" v-if="!form.roomId">
            <el-select
                v-model="form.buildingId"
                placeholder="楼栋"
                clearable
                @change="changeBuilding2"
                style="width: 240px">
              <el-option
                  v-for="dict in buildingPotion2"
                  :key="dict.buildingId"
                  :label="dict.buildingName"
                  :value="dict.buildingId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="单元" prop="unitId" v-if="!form.roomId">
            <el-select
                v-model="form.unitId"
                placeholder="单元"
                clearable
                style="width: 240px">
              <el-option
                  v-for="dict in unitPotion2"
                  :key="dict.unitId"
                  :label="dict.unitName"
                  :value="dict.unitId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="楼层" prop="roomLevel">
            <el-input v-model.trim="form.roomLevel" placeholder="请输入楼层"/>
          </el-form-item>
          <el-form-item label="房间名称" prop="roomName">
            <el-input v-model.trim="form.roomName" placeholder="请输入房间名称"/>
          </el-form-item>
          <el-form-item label="建筑面积" prop="roomAcreage">
            <el-input v-model.trim="form.roomAcreage" placeholder="请输入建筑面积"/>
          </el-form-item>
          <el-form-item label="房屋状态" prop="roomStatus">
            <el-select
                v-model="form.roomStatus"
                placeholder="房屋状态"
                clearable
                style="width: 240px">
              <el-option
                  v-for="dict in roomStatusList"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="是否商铺" prop="roomIsShop">
            <el-radio-group v-model="form.roomIsShop">
              <el-radio label="Y" value="0">是</el-radio>
              <el-radio label="N" value="1">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否商品房" prop="roomSCommercialHouse">
            <el-radio-group v-model="form.roomSCommercialHouse">
              <el-radio label="Y" value="0">是</el-radio>
              <el-radio label="N" value="1">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="房屋类型" prop="roomHouseType">
            <el-select
                v-model="form.roomHouseType"
                placeholder="房屋类型"
                clearable
                style="width: 240px">
              <el-option
                  v-for="dict in houseTypeList"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveRole()">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
export default {
  name: "zy_room",
  data() {
    return {
      value: [],
      options: [],
      communityPotion: [],
      buildingPotion: [],
      buildingPotion2: [],
      buildingPotionEdit: [],
      unitPotion: [],
      unitPotion2: [],
      unitPotionEdit: [],
      roomStatusList: [],
      houseTypeList: [],

      multiple: true,


      //导出集合
      deriveList: [],

      statusPotion: [],

      rules: {
        communityId: [
          {required: true, message: "小区名不能为空", trigger: "blur"}
        ],
        buildingId: [
          {required: true, message: "楼栋名不能为空", trigger: "blur"}
        ],
        unitId: [
          {required: true, message: "单元名不能为空", trigger: "blur"}
        ],
        roomName: [
          {required: true, message: "商品房名字不能为空", trigger: "blur"}
        ],
        roomStatus: [
          {required: true, message: "房屋状态不能为空", trigger: "blur"}
        ],
        roomHouseType: [
          {required: true, message: "房屋类型不能为空", trigger: "blur"}
        ],
      },
      // 表单参数
      form: {
        //房间id
        roomId: "",
        //小区name
        communityId: "",
        //楼栋name
        buildingId: "",
        //单元name
        unitId: "",
        //楼层
        roomLevel: "",
        //房间编号
        roomCode: "",
        //房间名称
        roomName: "",
        //房屋建筑面积
        roomAcreage: "",
        //算费系数
        roomCost: "",
        //房屋状态
        roomStatus: "",
        //是否商铺
        roomIsShop: "",
        //是否商品房
        roomSCommercialHouse: "",
        //房屋户型
        roomHouseType: "",
        //创建者
        createBy: "",
        //创建时间
        createTime: "",
        //更新者
        updateBy: "",
        //更新时间
        updateTime: "",
        //备注
        remark: "",
        //小区name
        communityName: "",
        //楼栋name
        buildingName: "",
        //单元name
        unitName: "",
      },
      //room数据
      roomList: [],
      // 总条数
      total: 0,

      queryParams: {
        current: 1,
        size: 5,
        unitId: "",
        communityId: "",
        buildingId: "",
        roomStatus: "",
      },

    }
  },
  created() {
    this.getRoomList();
    this.getStatus();
  },
  methods: {
    /**
     * 导出方法
     */
    async derive() {
      const {data: res} = await this.$http.post(`excel/roomList`, this.deriveList)
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }
    }
    ,
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.deriveList = selection.map(item => item.roomId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },

    changeCommunity() {
      this.$http.get('zyRoom/getBuilding', {
        params: this.queryParams
      }).then(res => {
        this.buildingPotion = res.data.building
      })
    },
    changeBuilding() {
      this.$http.get('zyRoom/getUnit', {
        params: this.queryParams
      }).then(res => {
        this.unitPotion = res.data.unit11
      })
    },
    changeCommunity2() {
      let communityId = this.form.communityId
      this.$http.get('zyRoom/getBuilding', {
        params: {communityId}
      }).then(res => {
        this.buildingPotion2 = res.data.building
      })
    },
    changeBuilding2() {
      let buildingId = this.form.buildingId
      this.$http.get('zyRoom/getUnit',{
        params: {buildingId}
      }).then(res => {
        this.unitPotion2 = res.data.unit11
      })
    },
    async getStatus() {
      const {data: res} = await this.$http.get('zyRoom/getStatus',)
      this.communityPotion = res.community
      this.roomStatusList = res.roomStatus
      this.houseTypeList = res.houseType
      this.$http.get('zyRoom/getUnit').then(res2 => {
        this.unitPotionEdit = res2.data.unit11
      })
      this.$http.get('zyRoom/getBuilding').then(res3 => {
        this.buildingPotionEdit = res3.data.building
      })
    }
    ,
    //批量删除
    async delRooms() {
      console.log(this.deriveList, "cccccccc")
      if (this.deriveList.length==0){
        this.$message.error("请选择删除的数据")
      }
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
      await this.$http.post('zyRoom/deleteRooms', this.deriveList).then(res => {
        if (this.queryParams.current > Math.ceil((this.total - this.deriveList.length) / this.queryParams.size)) {
          this.queryParams.current = Math.ceil((this.total - this.deriveList.length) / this.queryParams.size);
        }
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.getRoomList();
        } else if (res.data.status == 201) {
          this.$message.error(res.data.msg)
        }
      })
    },
    //删除房屋
    async deleteRoom(room) {
      const confirmResult = await this.$confirm('确认要删除' + '"' + room.roomName + '"房屋吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      this.$http.delete('zyRoom/deleteRoom/' + room.roomId).then(res => {
        if (this.queryParams.current > Math.ceil((this.total - 1) / this.queryParams.size)) {
          this.queryParams.current = Math.ceil((this.total - 1) / this.queryParams.size);
        }
        // if (this.queryParams.current==0 || this.queryParams.current <0 ){
        //   this.queryParams.current=1
        // }
        if (res.data.data == 1) {
          this.$message.success("删除成功")
          this.getRoomList();
        } else if (res.data.data == 0) {
          this.$message.error("删除失败,请检测该房屋是否已出售!")
        }
      })
    }
    ,
    async getRoomList() {

      const {data: res} = await this.$http.get('zyRoom/getRoomList', {
        params: this.queryParams
      })
      this.roomList = res.data;

      this.total = res.total
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset()
    }
    ,
    //查询
    handleQuery() {
      this.queryParams.current = 1
      this.getRoomList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        current: 1,
        size: 5
      }
      this.getRoomList()
    },
    /** 添加角色列表 */
    Add() {
      this.title = "新增房屋";
      this.open = true;
      this.reset();
      this.buildingPotion2 = ''
      this.unitPotion2 = ''
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.buildingPotion2 = ''
      this.unitPotion2 = ''
      this.form = structuredClone(row)

      this.open = true;

      this.title = "修改房屋";
    },
    //新增或修改角色
    async saveRole() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.roomId != '') {
            this.$http.put("zyRoom/editRoom", this.form).then(res => {
              if (res.data.status === 200) {
                this.open = false;
                this.$message.success("修改成功")
                this.getRoomList();
                this.menuOptions = {}
              } else {
                this.$message.error(res.data.msg);
              }
            })
          } else {
            this.form.roomId = Date.now();
            this.$http.put("zyRoom/addRoom", this.form).then(res => {
              console.log(res, "ccccccc")
              if (res.data.status === 200) {
                this.open = false;
                this.$message.success("新增成功")
                this.getRoomList();
              } else {
                this.$message.error(res.data.msg);
                this.form.roomId = '';
              }
            })
          }
        }
      })
    },
    // 表单重置
    reset() {
      this.form = {
        //房间id
        roomId: "",
        //小区name
        communityId: "",
        //楼栋name
        buildingId: "",
        //单元name
        unitId: "",
        //楼层
        roomLevel: "",
        //房间编号
        roomCode: "",
        //房间名称
        roomName: "",
        //房屋建筑面积
        roomAcreage: "",
        //算费系数
        roomCost: "",
        //房屋状态
        roomStatus: "",
        //是否商铺
        roomIsShop: "",
        //是否商品房
        roomSCommercialHouse: "",
        //房屋户型
        roomHouseType: "",
        //创建者
        createBy: "",
        //创建时间
        createTime: "",
        //更新者
        updateBy: "",
        //更新时间
        updateTime: "",
        //备注
        remark: "",
        //小区name
        communityName: "",
        //楼栋name
        buildingName: "",
        //单元name
        unitName: "",
      };
    },
    //x关闭
    handleClose() {
      this.open = false;
      this.reset()
    },
    // @size-change页码展示数量点击事件
    handleSizeChange(val) {
      console.log('asda' + val)
      // 更新每页展示数据size
      this.queryParams.size = val
      this.getRoomList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      console.log('asda' + val)
      // 更新当前页数是第几页
      this.queryParams.current = val
      this.getRoomList();
    },
  }
}
</script>

<style scoped>

</style>