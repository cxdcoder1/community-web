<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>社区资产/单元信息</el-breadcrumb-item>
    </el-breadcrumb>
    <br/>
    <el-card>
      <el-form :model="searchUnit" ref="queryForm" size="small" :inline="true">

        <div>
          <el-form-item label="小区" prop="communityId">
            <el-select v-model="searchUnit.communityId" placeholder="小区名称">
              <el-option
                  v-for="dict in communityList"
                  :key="dict.communityId"
                  :label="dict.communityName"
                  :value="dict.communityId"
                  @click.native="communityOn(dict)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="楼栋" prop="buildingId">
            <el-select v-model="searchUnit.buildingId" placeholder="楼栋" clearable>
              <el-option
                  v-for="dict in buildingList"
                  :key="dict.buildingId"
                  :label="dict.buildingName"
                  :value="dict.buildingId"
              />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="单元名称" prop="unitName">
          <el-input v-model="searchUnit.unitName" placeholder="请输入单元名称" clearable style="width: 150px"/>
        </el-form-item>

        <el-form-item label="单元编号" prop="unitCode">
          <el-input v-model="searchUnit.unitCode" placeholder="请输入单元编号" clearable style="width: 150px"/>
        </el-form-item>

        <el-form-item label="是否有电梯" prop="unitHaveElevator">
          <el-select v-model="searchUnit.unitHaveElevator" placeholder="是否有电梯" clearable style="width: 150px">
            <el-option label="是" value="0"></el-option>
            <el-option label="否" value="1"></el-option>
            <!--            <el-option-->
            <!--                v-for="dict in statusPotion"-->
            <!--                :key="dict.dictValue"-->
            <!--                :label="dict.dictLabel"-->
            <!--                :value="dict.dictValue"-->
            <!--            />-->
          </el-select>
        </el-form-item>


        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="getUnitList">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="addUnit()"
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
              @click="delUnits"
          >删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
              type="warning"
              plain
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
          >导出
          </el-button>
        </el-col>
      </el-row>


      <el-table :data="unitList" @selection-change="handleSelectionChange" ref="list">
        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column label="序号" align="center" type="index"/>
        <el-table-column label="小区名称" align="center" key="communityName">
          <template slot-scope="scope">{{ scope.row.zyCommunity.communityName }}</template>
        </el-table-column>
        <el-table-column label="楼栋" align="center" key="buildingName">
          <template slot-scope="scope">{{ scope.row.zyBuilding.buildingName }}</template>
        </el-table-column>
        <el-table-column label="单元名称" align="center" key="unitName" prop="unitName"/>
        <el-table-column label="层数" align="center" key="unitLevel" prop="unitLevel"/>
        <el-table-column label="建筑面积" align="center" key="unitAcreage" prop="unitAcreage"/>
        <el-table-column label="是否有电梯" align="center" key="unitHaveElevator">
          <template slot-scope="scope">{{ scope.row.unitHaveElevator == '0' ? '是' : '否' }}</template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" key="createTime">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime|dateFormat }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" key="remark" prop="remark"/>

        <el-table-column
            label="操作"
            align="center"
            width="200"
            class-name="small-padding fixed-width"
        >
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="updateUnit(scope.row)"
            >修改
            </el-button>
            <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="delUnit(scope.row)"
            >删除
            </el-button>

          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="searchUnit.current"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="searchUnit.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>

    <!--    修改、新增表单-->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body @close="formClose()">
      <el-form ref="form" :model="unitForm" :rules="rules" label-width="80px">

        <el-form-item label="楼栋" prop="buildingId">
          <el-select v-model="unitForm.buildingId" placeholder="楼栋" clearable>
            <el-option
                v-for="dict in buildingList"
                :key="dict.buildingId"
                :label="dict.buildingName"
                :value="dict.buildingId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="单元名称" prop="unitName">
          <el-input v-model.trim="unitForm.unitName" placeholder="请输入单元名称"/>
        </el-form-item>

        <el-form-item label="单元编号" prop="unitCode">
          <el-input v-model.trim="unitForm.unitCode" placeholder="请输入单元编号"/>
        </el-form-item>

        <el-form-item label="层数" prop="unitLevel">
          <el-input-number v-model="unitForm.unitLevel" controls-position="right" :min="0"/>
        </el-form-item>

        <el-form-item label="建筑面积" prop="unitAcreage">
          <el-input v-model.trim="unitForm.unitAcreage" placeholder="请输入建筑面积"/>
        </el-form-item>

        <el-form-item label="是否有电梯">
          <el-radio-group v-model="unitForm.unitHaveElevator">
            <el-radio label="0" >是</el-radio>
            <el-radio label="1" >否</el-radio>

            <!--            <el-radio-->
            <!--                v-for="dict in statusPotion"-->
            <!--                :key="dict.dictValue"-->
            <!--                :label="dict.dictLabel"-->
            <!--                :value="dict.dictValue"-->
            <!--            >-->
            <!--            </el-radio>-->
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="unitForm.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submit()">确 定</el-button>
        <el-button @click="formClose()">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>


<script>



export default {

  data() {
    return {
      //总条数
      total: 0,
      //搜索条件
      searchUnit: {
        current: 1,
        size: 5,
        unitName: '',
        unitCode: '',
        unitHaveElevator: '',
        buildingId: '',
        communityId: "",
      },
      //小区集合
      communityList: [],
      //楼栋集合
      buildingList: [],
      //单元集合
      unitList: [],
      //小区id
      communityId: '',
      //表单名
      title: '',
      //表单显示默认为关闭
      open: false,
      //表单信息对象
      unitForm: {
        communityId: '',
        buildingId: '',
        unitId:'',
        unitName: '',
        unitCode: '',
        unitLevel: '',
        unitAcreage: '',
        unitHaveElevator: '',
        remark: ''
      },
      //多选框id集合
      ids:[],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      //表单验证
      rules: {
        buildingId: [
          { required: true, message: "楼栋不能为空", trigger: "blur" }
        ],
        unitName: [
          { required: true, message: "单元名称不能为空", trigger: "blur" }
        ],
        unitCode: [
          { required: true, message: "单元编号不能为空", trigger: "blur" }
        ],
        unitLevel: [
          { required: true, message: "层数不能为空", trigger: "blur" }
        ],
      },
    }
  },
  methods: {
    //获取单元集合
    async getUnitList() {
      const {data: res} = await this.$http.get('zyUnit/getUnits', {
        params: this.searchUnit
      })
      this.unitList = res.data.records;
      this.total = res.data.total;
    },
    //重置搜索
    async reset() {
      this.searchUnit = {
        current: 1,
        size: 5,
        unitName: '',
        unitCode: '',
        unitHaveElevator: '',
        buildingId: '',
        communityId: '',
      };
      await this.getCommunityList();
      await this.getUnitList();
      await this.getBuildList();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.unitId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // @size-change页码展示数量点击事件
    handleSizeChange(val) {
      // 更新每页展示数据size
      this.searchUnit.size = val
      this.getUnitList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      // 更新当前页数是第几页
      this.searchUnit.current = val
      this.getUnitList();
    },
    //获取小区集合
    async getCommunityList() {
      const {data: res} = await this.$http.get("zyCommunity/getUCommunity")
      this.communityList = res.communityList;
      this.searchUnit.communityId = this.communityList[0].communityId;
    },
    //获取楼栋集合
    async getBuildList() {
      const {data: res} = await this.$http.get("zyBuilding/getUBuild/" + this.searchUnit.communityId)
      this.buildingList = res.buildList;
    },
    //小区点击事件
    communityOn(val) {
      this.searchUnit.buildingId='';
      this.searchUnit.communityId = val.communityId
      this.getBuildList();
      this.getUnitList();
    },
    submit(){
      //验证通过执行提交
      this.$refs.form.validate(async valid => {
        if (valid) {
          // 在表单验证通过时执行的代码
          let res;
          if (this.unitForm.unitId  == 0) {
            //新增
            this.unitForm.unitId = Date.now();
            res = await this.$http.post("zyUnit/addUnit", this.unitForm);
          } else {
            //修改
            res = await this.$http.post("zyUnit/updateUnit", this.unitForm);
          }
          if (res.data.status == 200) {
            this.open = false;
            this.$message.success("操作成功");
            this.getUnitList();
          } else {
            this.$message.error(res.data.msg);
            this.unitForm.unitId = 0;
          }
        }else {
          this.$message.error('请输入正确信息');
        }
      });
    },
    //新增按钮
    addUnit(){
      this.title = "新增单元"
      this.open = true;
      this.unitForm.communityId = this.searchUnit.communityId
      this.unitForm.unitId = 0;
    },
    //修改按钮
    updateUnit(row){
      this.title = "修改单元"
      this.open=true;
      this.unitForm.communityId = this.searchUnit.communityId
      this.unitForm.unitId = row.unitId
      //回显
      this.unitForm.buildingId = row.buildingId
      this.unitForm.unitName = row.unitName
      this.unitForm.unitCode = row.unitCode
      this.unitForm.unitLevel = row.unitLevel
      this.unitForm.unitAcreage = row.unitAcreage
      this.unitForm.unitHaveElevator = row.unitHaveElevator
      this.unitForm.remark = row.remark
    },
    //关闭对话框事件
    formClose(){
      //清空表单
      this.unitForm= {
        communityId: '',
            buildingId: '',
            unitId:'',
            unitName: '',
            unitCode: '',
            unitLevel: '',
            unitAcreage: '',
            unitHaveElevator: '',
            remark: ''
      }
      this.open=false;
    },
    //批量删除
    async delUnits() {
      console.log(this.ids)
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
      await this.$http.post('zyUnit/delUnits', this.ids).then(res => {
        if (this.searchUnit.current > Math.ceil((this.total - 1) / this.searchUnit.size)) {
          this.searchUnit.current = Math.ceil((this.total - 1) / this.searchUnit.size);
        }
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.getUnitList();
        } else if (res.data.status == 201) {
          this.$message.error(res.data.msg)
        }
      })
    },
    //单个删除
    async delUnit(row) {
      const confirmResult = await this.$confirm('确认要删除' + '"' + row.unitName + '"吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)

      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      await this.$http.get('zyUnit/delUnit/' + row.unitId).then(res => {
        if (this.searchUnit.current > Math.ceil((this.total - 1) / this.searchUnit.size)) {
          this.searchUnit.current = Math.ceil((this.total - 1) / this.searchUnit.size);
        }
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.getUnitList();
        } else if (res.data.status == 201) {
          this.$message.error(res.data.msg)
        }
      })
    },
    //导出按钮
    async handleExport() {
      const {data: res} = await this.$http.post(`excel/unitList`, this.ids)
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }
    },

  },
  async created() {
    await this.getCommunityList();
    await this.getUnitList();
    await this.getBuildList();
  }
}
</script>


<style>

</style>