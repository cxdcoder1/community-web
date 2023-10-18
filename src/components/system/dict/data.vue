<template>
  <div class="app-container">
    <br>
    <el-breadcrumb separator-class="el-icon-arrow-right" style="margin-left: 20px">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{path: '/dict'}">字典管理</el-breadcrumb-item>
      <el-breadcrumb-item>字典数据</el-breadcrumb-item>
    </el-breadcrumb>
    <br>`
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="字典名称" prop="dictType">
        <el-select v-model="queryParams.dictType">
          <el-option
              v-for="item in typeOptions"
              :key="item.dictId"
              :label="item.dictName"
              :value="item.dictType"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input
            v-model.trim="queryParams.dictLabel"
            placeholder="请输入字典标签"
            clearable
            @keyup.enter.native="handleQuery"
            onkeyup="this.value=this.value.replace(/[, ]/g,'')"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="数据状态" clearable>
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="el-icon-plus"
            size="mini"
            @click="handleAdd()"
        >新增
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

      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="el-icon-close"
            size="mini"
            @click="handleClose"
        >关闭
        </el-button>
      </el-col>

      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :data="dataList" @selection-change="handleSelectionChange" ref="list">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="字典编码" align="center" prop="dictCode"/>
      <el-table-column label="字典标签" align="center" prop="dictLabel">
        <template slot-scope="scope">
          <span v-if="scope.row.listClass == '' || scope.row.listClass == 'default'">{{ scope.row.dictLabel }}</span>
          <el-tag v-else :type="scope.row.listClass == 'primary' ? '' : scope.row.listClass">{{ scope.row.dictLabel }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="字典键值" align="center" prop="dictValue"/>
      <el-table-column label="字典排序" align="center" prop="dictSort"/>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '0' ? '' : 'danger'">
            {{ scope.row.status === '0' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
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
              @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--    <pagination-->
    <!--        v-show="total>0"-->
    <!--        :total="total"-->
    <!--        :page.sync="queryParams.pageNum"-->
    <!--        :limit.sync="queryParams.pageSize"-->
    <!--        @pagination="getList"-->
    <!--    />-->
    <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryParams.current"
        :page-sizes="[3, 5, 10]"
        :page-size="queryParams.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" :disabled="true"/>
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签"/>
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值"/>
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="form.cssClass" placeholder="请输入样式属性"/>
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0"/>
        </el-form-item>
        <el-form-item label="回显样式" prop="listClass">
          <el-select v-model="form.listClass">
            <el-option
                v-for="item in listClassOptions"
                :key="item.value"
                :label="item.label + '(' + item.value + ')'"
                :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in this.statusPotion"
                      :key="dict.dictValue"
                      :label="dict.dictValue">
              {{ dict.dictLabel }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>

</template>

<script>
// import { listData, getData, delData, addData, updateData } from "@/api/system/dict/data";
// import { optionselect as getDictOptionselect, getType } from "@/api/system/dict/type";

export default {
  data() {
    return {

      statusPotion:[],
      // 遮罩层
      // loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 字典表格数据
      dataList: [],
      // 默认字典类型
      defaultDictType: "",
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 数据标签回显样式
      listClassOptions: [
        {
          value: "default",
          label: "默认"
        },
        {
          value: "primary",
          label: "主要"
        },
        {
          value: "success",
          label: "成功"
        },
        {
          value: "info",
          label: "信息"
        },
        {
          value: "warning",
          label: "警告"
        },
        {
          value: "danger",
          label: "危险"
        }
      ],
      // 类型数据字典
      typeOptions: [],
      // 查询参数
      queryParams: {
        current: 1,
        size: 5,
        dictLabel: undefined,
        dictType: undefined,
        status: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        dictLabel: [
          {required: true, message: "数据标签不能为空", trigger: "blur"}
        ],
        dictValue: [
          {required: true, message: "数据键值不能为空", trigger: "blur"}
        ],
        dictSort: [
          {required: true, message: "数据顺序不能为空", trigger: "blur"}
        ]
      }
    };
  },
  created() {
    // console.log("222222222", this.$route.params.dictId)
    const dictId = this.$route.params.dictId;
    this.getType(dictId);
    this.getTypeList();
    this.getStatus();
    this.getList()
  },
  methods: {
    async getStatus() {
      const {data: res} = await this.$http.get('sysDictType/dictStatusOption')
      console.log("123",res.data)
      this.statusPotion=res.data;
    },
    /** 查询字典类型详细 */
    getType(dictId) {
      this.$http.get("sysDictType/getDictType/" + dictId).then(response => {
        // console.log("ccccccc",response.data.data)
        this.queryParams.dictType = response.data.data.dictType;
        this.defaultDictType = response.data.data.dictType;
        this.getList();
      });
    },
    /** 查询字典类型列表 */
    getTypeList() {
      this.$http.get("sysDictType/getDictOptionselect").then(response => {
        // console.log("测试", response.data.data)
        this.typeOptions = response.data.data;
      });
    },
    /** 查询字典数据列表 */
    getList() {
      // console.log(111)
      this.$http.get("sysDictData/listdata", {
        params: this.queryParams
      }).then(response => {
        this.dataList = response.data.data;
        // console.log("testdataList", response)
        this.total = response.data.count;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        dictCode: undefined,
        dictLabel: undefined,
        dictValue: undefined,
        cssClass: undefined,
        listClass: 'default',
        dictSort: 0,
        status: "0",
        remark: undefined
      };
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1;
      // console.log("cxd", this.queryParams.dictType)
      this.getList();
    },
    /** 返回按钮操作 */
    handleClose() {
      this.$router.push('/dict')
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs["queryForm"].resetFields();
      this.queryParams.dictType = this.defaultDictType;
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加字典数据";
      this.form.dictType = this.queryParams.dictType;
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.dictCode)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    async derive() {
      const {data: res} = await this.$http.post(`excel/list2`, this.ids)
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }
    },
    // //把选中的那条记录的roleId属性放到deriveList中
    // selectionChangeHandle(val) {
    //   this.deriveList = []
    //   for (let i = 0; i < val.length; i++) {
    //     //concat方法在数组后追加内容。
    //     this.deriveList = this.deriveList.concat(val[i].roleId)
    //   }
    // },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.form = structuredClone(row)
      this.open = true;
      this.title = "修改字典数据";
    },
    /** 提交按钮 */
    submitForm: function () {

      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.dictCode != undefined) {
            this.$http.post("sysDictData/updateData", this.form).then(response => {
              console.log("修改", response.data)
              if (response.data.data == 1) {
                this.$message.success("修改成功");
                this.open = false;
                this.getList();
              } else if (response.data.data ==0) {
                this.$message.error("字典标签重名,请继续操作!");
              }else {
                this.$message.warning("权限不足!")
                this.open = false;
              }
            });
          } else {
            this.$http.post("sysDictData/addData", this.form).then(response => {
              // this.$store.dispatch('dict/removeDict', this.queryParams.dictType);
              if (response.data.data == 1) {
                // console.log("添加", response.data)
                this.$message.success("新增成功");
                this.open = false;
                this.getList();
              } else if (response.data.data==0) {
                this.$message.error("字典标签重名,请继续操作!");
              }else {
                this.$message.warning("权限不足!")
                this.open = false;
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */ async handleDelete(row) {
      // console.log("cxdcc", row)
      const dictCodes = row.dictCode
      const confirmResult = await this.$messagebox.confirm(
          '请问是否要删除该权限',
          '删除提示',
          {
            confirmButtonText: '确认删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      // eslint-disable-next-line no-unused-vars
      await this.$http.delete("sysDictData/delete/" + dictCodes).then(res => {
        console.log(res,"cccccccccc")
        if (this.queryParams.current > Math.ceil((this.total - 1) / this.queryParams.size)) {
          this.queryParams.current = this.queryParams.current - 1;
        }
        if (res.data.errorCode==10){
          this.$message.warning("权限不足!")
          return;
        }
        this.$message.success("删除成功!")
        this.getList();
      })
    },
    // /** 导出按钮操作 */
    // handleExport() {
    //   this.download('system/dict/data/export', {
    //     ...this.queryParams
    //   }, `data_${new Date().getTime()}.xlsx`)
    // },
    // @size-change页码展示数量点击事件
    handleSizeChange(val) {
      // console.log('asda' + val)
      // 更新每页展示数据size
      this.queryParams.size = val
      this.getList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      // console.log('asda' + val)/
      // 更新当前页数是第几页
      this.queryParams.current = val
      this.getList();
    },
  }
};
</script>