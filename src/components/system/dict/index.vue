<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="字典名称" prop="dictName">
        <el-input
            v-model="queryParams.dictName"
            placeholder="请输入字典名称"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input
            v-model="queryParams.dictType"
            placeholder="请输入字典类型"
            clearable
            style="width: 240px"
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="菜单状态" clearable>
          <el-option
              v-for="dict in dictList"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
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
            @click="handleAdd"
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
            v-hasPermi="['system:dict:export']"
        >导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="el-icon-refresh"
            size="mini"
            @click="handleRefreshCache"
            v-hasPermi="['system:dict:remove']"
        >刷新缓存</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :data="typeList" @selection-change="handleSelectionChange" ref="list" >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="角色编号" align="center"  >
        <template slot-scope="scope">{{ scope.row.dictId }}</template>
      </el-table-column>
      <el-table-column label="角色名称" :show-overflow-tooltip="true" width="150">
        <template slot-scope="scope">{{ scope.row.dictName }}</template>
      </el-table-column>
            <el-table-column label="字典类型" align="center"  >
              <template slot-scope="scope">
<!--                <router-link :to="{ path: '/data', query:{dictId: scope.row.dictId}}" class="link-type">-->
                  <router-link :to="{ name: 'data', params: { id: scope.row.dictId } }" class="link-type">
                  <span>{{ scope.row.dictType }}</span>
                </router-link>
              </template>
            </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
            <el-tag :type="scope.row.status === '0' ? '' : 'danger'">
              {{ scope.row.status === '0' ? '正常' : '禁用' }}
            </el-tag>

        </template>
      </el-table-column>
            <el-table-column label="备注" align="center" prop="remark"  />
      <el-table-column label="创建时间" align="center" width="180">
        <template slot-scope="scope">
          {{ scope.row.createTime | dateFormat }}
        </template>
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
              @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

<!--    <el-table  :data="typeList" @selection-change="handleSelectionChange">-->
<!--      <el-table-column type="selection" width="55" align="center"  />-->
<!--      <el-table-column label="字典编号" align="center" prop="dictId" />-->
<!--      <el-table-column label="字典名称" align="center" prop="dictName" :show-overflow-tooltip="true" />-->
<!--      <el-table-column label="字典类型" align="center" :show-overflow-tooltip="true">-->
<!--        <template slot-scope="scope">-->
<!--          <router-link :to="'/system/dict-data/index/' + scope.row.dictId" class="link-type">-->
<!--            <span>{{ scope.row.dictType }}</span>-->
<!--          </router-link>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column label="状态" align="center" prop="status">-->
<!--        <template slot-scope="scope">-->
<!--          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column label="备注" align="center" prop="remark"  />-->
<!--      <el-table-column label="创建时间" align="center" prop="createTime" width="180">-->
<!--        <template slot-scope="scope">-->
<!--          <span>{{ parseTime(scope.row.createTime) }}</span>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">-->
<!--        <template slot-scope="scope">-->
<!--          <el-button-->
<!--              size="mini"-->
<!--              type="text"-->
<!--              icon="el-icon-edit"-->
<!--              @click="handleUpdate(scope.row)"-->
<!--              v-hasPermi="['system:dict:edit']"-->
<!--          >修改</el-button>-->
<!--          <el-button-->
<!--              size="mini"-->
<!--              type="text"-->
<!--              icon="el-icon-delete"-->
<!--              @click="handleDelete(scope.row)"-->
<!--              v-hasPermi="['system:dict:remove']"-->
<!--          >删除</el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--    </el-table>-->


    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body :before-close="handleClose">
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-form-item label="id" prop="dictName">
            <el-input v-model="form.dictId" placeholder="请输入id"/>
          </el-form-item>
          <el-form-item label="角色名称" prop="dictName">
            <el-input v-model="form.dictName" placeholder="请输入名称"/>
          </el-form-item>
          <el-form-item prop="dictType">
          <span slot="label">
            <el-tooltip placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
            字典类型
          </span>
            <el-input v-model="form.dictType" placeholder="请输入字典类型"/>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio label="0" value="0">正常</el-radio>
              <el-radio label="1" value="1">停用</el-radio>
            </el-radio-group>
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
  name: "DictCom",
  dicts: ['sys_normal_disable'],
  data() {
    return {
      deriveList: [],
      dictList: [
        {label: '正常', value: '0'},
        {label: '禁用', value: '1'}
      ],
      // 遮罩层
      loading: true,
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
      typeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        current: 1,
        size: 10,
        dictName: undefined,
        dictType: undefined,
        status: undefined,
        createTime:undefined,
        updateTime:undefined
      },
      // 表单参数
      form: {
        dictId: undefined,
        dictName: undefined,
        dictType: "",
        status: "0",
        remark: undefined
      },
      // 表单校验
      rules: {
        dictName: [
          { required: true, message: "字典名称不能为空", trigger: "blur" }
        ],
        dictType: [
          { required: true, message: "字典类型不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /**
     * 导出方法
     */
    async derive() {
      const {data: res} = await this.$http.post(`excel/DictList`, this.ids)
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.dictId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 查询字典类型列表 */
    async getList() {
      // this.loading = true;
      const {data: res} = await this.$http.get('sysDictType/selectDictType', {
        params: this.queryParams
      })

      this.typeList=res.data.records;
      this.total = res.data.total
      console.log("总条数"+this.total)
      console.log("列表数据"+this.typeList)

    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        dictId: 0,
        dictName: undefined,
        dictType: undefined,
        status: "0",
        remark: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      // this.queryParams.dictName=this.queryParams.dictName.trim()
      // this.queryParams.dictType=this.queryParams.dictType.trim()

      this.queryParams.createTime = this.dateRange[0]
      this.queryParams.updateTime = this.dateRange[1]

      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.open = true;
      this.reset();
      this.title = "添加字典类型";
    },
    /** 修改按钮操作 */
    handleUpdate(r) {
      this.form.dictId=r.dictId;
      this.form.dictName=r.dictName;
      this.form.dictType=r.dictType
      this.form.status=r.status;
      this.form.remark=r.remark;
      this.open = true;
      this.title = "添加字典类型";
    },
    /** 删除按钮操作 */
    async handleDelete(row) {
      console.log(row.dictId,row.dictType)


      const confirmResult = await  this.$confirm(
          '此操作将永久删除该数据, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const {data: res} = await this.$http.delete('sysDictType/delType?id=' + row.dictId+'&name='+row.dictType);
      if (res.status !== 200) {
        this.$message.error(res.msg);
      }else{
        this.$message.success('删除用户成功')
      }

      this.getList();
    },
    /** 导出按钮操作 */
    handleExport() {
       this.download('system/dict/type/export', {
         ...this.queryParams
       }, `type_${new Date().getTime()}.xlsx`)
    },
    /** 刷新缓存按钮操作 */
    handleRefreshCache() {
      // refreshCache().then(() => {
      //   this.$modal.msgSuccess("刷新成功");
      //   this.$store.dispatch('dict/cleanDict');
      // });
    },  async saveRole() {

      if (this.form.dictId != 0) {
        alert(1)
        let res = await this.$http.put("sysDictType/updType", this.form);
        if (res.data.status === 200) {
          this.open = false;
          this.$message.success("修改成功")
          this.getList();
        } else {
          this.$message.error(res.data.msg);
        }
      }
      if(this.form.dictId == 0){
        alert(0)
      let res = await this.$http.post("sysDictType/insDictType", this.form);
      console.log(res)
      if (res.data.status === 200) {
        this.open = false;
        this.$message.success("新增成功")
        this.open = false;
        this.getList();
      } else {
        this.$message.error(res.data.msg);
      }

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
  }
  }
};
</script>