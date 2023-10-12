<template>
  <div class="app-container">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>岗位管理</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-card>
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="岗位编码" prop="postCode">
        <el-input
            v-model="queryParams.postCode"
            placeholder="请输入岗位编码"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="岗位名称" prop="postName">
        <el-input
            v-model="queryParams.postName"
            placeholder="请输入岗位名称"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="岗位状态" clearable>
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

    <el-button
        type="primary"
        icon="el-icon-plus"
        size="small"
        @click="Add"
    >新增
    </el-button>
    <el-button
        type="danger"
        plain
        icon="el-icon-delete"
        size="mini"
        @click="batchDelete(ids)"
        :disabled="multiple"
    >删除
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
          :data="postList"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="selectionChangeHandle"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column
            prop="postId"
            label="岗位编号"
            width="150"
        ></el-table-column>
        <el-table-column
            prop="postCode"
            label="岗位编码"
            width="150"
        ></el-table-column>
        <el-table-column
            prop="postName"
            label="岗位名称"
            width="150"
        ></el-table-column>
        <el-table-column
            prop="postSort"
            label="岗位排序"
            width="150"
        ></el-table-column>
        <el-table-column
            prop="status"
            label="状态"
            width="150"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.status === '0'">正常</span>
            <span v-else-if="scope.row.status === '1'">停用</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="150">
          <template slot-scope="scope">{{ scope.row.createTime | dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="{ row }">
            <el-button size="mini" icon="el-icon-edit" type="text" @click="update(row)">修改</el-button>
            <el-button size="mini" icon="el-icon-delete" type="text" @click="delPost(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryParams.current"
          :page-sizes="[3, 5, 10]"
          :page-size="queryParams.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
      <!-- 添加或修改岗位对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="岗位名称" prop="postName">
            <el-input v-model.trim="form.postName" placeholder="请输入岗位名称" />
          </el-form-item>
          <el-form-item label="岗位编码" prop="postCode">
            <el-input v-model.trim="form.postCode" placeholder="请输入编码名称" />
          </el-form-item>
          <el-form-item label="岗位顺序" prop="postSort">
            <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
          </el-form-item>
          <el-form-item label="岗位状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in this.statusPotion"
                        :key="dict.dictValue"
                        :label="dict.dictValue">
                {{ dict.dictLabel}}
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model.trim="form.remark" type="textarea" placeholder="请输入内容" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>

export default {
  data() {
    return {
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 表单参数
      form: {},
      rules: {
        postName: [
          {required: true, message: "岗位名称不能为空", trigger: "blur"}
        ],
        postCode: [
          {required: true, message: "岗位编码不能为空", trigger: "blur"}
        ],
        postSort: [
          {required: true, message: "岗位顺序不能为空", trigger: "blur"}
        ]
      },
      // // 遮罩层
      // loading: true,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      dictList: [],

      // 显示搜索条件
      showSearch: true,

      statusPotion: [],
      // 总条数
      total: 0,
      // 岗位表格数据
      postList: [],
      //导出的对象
      derives: {},
      //导出集合
      derivesA: [],

      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        postCode: undefined,
        postName: undefined,
        status: ''
      },


          }
      },
      created() {
        this.getPostList();
        this.getStatus();
      },
      methods:{
        // 多选框选中数据
        handleSelectionChange(selection) {
          this.ids = selection.map(item => item.postId)
          this.single = selection.length != 1;
          this.multiple = !selection.length;
        },
        //导出数据
        async derive() {
          const {data: res} = await this.$http.post(`excel/postListS`, this.derivesA)
          if (res.status == 200) {
            //成功导出
            this.$message.success(res.msg + ",路径为：" + res.path)
            this.$refs.list.clearSelection(); // el-table上绑定ref="list"
          } else if (res.status == 201) {
            //导出失败
            this.$message.error(res.msg)
          }
        },
        //新增修改提交
        async submitForm() {
          console.log(this.form);
          if (this.form.postName == null || this.form.postName.length > 10) {
            // name 字段为空或长度超过 10，提示用户输入正确的值
            this.$message.error('请输入正确长度的姓名');
            return;
          }
          if (this.form.postCode == null) {
            // name 字段为空或长度超过 10，提示用户输入正确的值
            this.$message.error('请输入岗位编码');
            return;
          }
          this.$refs.form.validate(async valid => {
            if (valid){
              let res;

              if (this.form.postId == null) {
                res = await this.$http.get("sysPost/insertPost", { params: this.form });
              } else {
                res = await this.$http.put("sysPost/updatePosts", this.form);
              }
              if (res.data.status === 200) {
                this.open = false;
                this.$message.success(res.data.msg);
                this.getPostList();
              } else {
                this.$message.error(res.data.msg);
              }
            }else {
              this.$message.error("请输入正确的信息")
            }
          })
        },
        async getStatus() {
          const {data: res} = await this.$http.get('sysPost/postStatusOption')
          this.statusPotion = res.data;
          console.log('ads', res.data)
          // console.log(this.deptOptions)
          // console.log(res.data.records)
          // console.log(this.deptOptions);
          // console.log(res.data.records.sysDept.deptName);
        },
        //单个删除
          async delPost(row) {
            const confirmResult = await this.$confirm('确认要删除' + row.postName + '吗?', "警告", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }).catch(err => err)
            if (confirmResult !== 'confirm') {
              return this.$message.info('已经取消删除')
            }
            await this.$http.delete('sysPost/delPost/'+row.postId).then(res => {
              if (res.data.status == 200) {
                this.$message.success(res.data.msg)
                this.getPostList();
                this.search();
              } else {
                this.$message.error(res.data.msg);
              }
            })
          },
        /**
         * 获取岗位列表
         * @returns {Promise<void>}
         */
          async getPostList() {
          const {data: res} = await this.$http.get('sysPost/postList', {
            params: this.queryParams
          })
          this.postList = res.data.records;
          this.total = res.data.total
          const {data:res1}=await this.$http.get("sysDictData/getStatus")
            this.dictList=res1.data
        },
        // @size-change页码展示数量点击事件
        handleSizeChange(val) {
          // console.log('asda' + val)
          // 更新每页展示数据size
          this.queryParams.size = val
          this.getPostList();
        },
        // @current-change页码点击事件
        handleCurrentChange(val) {
          // console.log('asda' + val)/
          // 更新当前页数是第几页
          this.queryParams.current = val
          this.getPostList();
        },
        /** 搜索按钮操作 */
        handleQuery() {
          this.queryParams.current = 1;
          // console.log("cxd", this.queryParams.dictType)
          this.getPostList();
        },
        /** 重置按钮操作 */
        resetQuery() {
          this.$refs["queryForm"].resetFields();
          this.queryParams.dictType = this.defaultDictType;
          this.handleQuery();
        },
        //把选中的那条记录的postId属性放到deriveList中
        selectionChangeHandle(val) {
          this.derivesA = []
          for (let i = 0; i < val.length; i++) {
            //concat方法在数组后追加内容。
            this.derivesA = this.derivesA.concat(val[i].postId)
            this.ids=this.derivesA;
          }
          this.multiple=!this.$refs.multipleTable.selection.length
        },
        /**
         * 批量删除
         */
        async batchDelete() {
          if (this.ids.length==0){
            this.$message.error("请选择要删除的数据")
            return ;
          }
          const confirmResult = await this.$confirm('确认要删除' + this.ids.length + '条数据吗?', "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).catch(err => err)
          if (confirmResult !== 'confirm') {
            return this.$message.info('已经取消删除')
          }
          await this.$http.post('sysPost/deletes/',this.ids).then(res => {
            if (res.data.status == 200) {
              this.$message.success(res.data.msg)
              this.getPostList();
              this.search();
              // 清空选中的数据
              this.ids = [];
            } else {
              this.$message.error(res.data.msg);
              // 清空选中的数据
              this.getPostList()
              this.ids = [];
            }
          })
        },
        //添加岗位方法
        Add(){
          this.open=true
          this.title = "添加岗位";
          this.form={
            status:1,
          }
          this.reset();
        },
        //修改岗位方法
        update(row){
          this.open=true;
          this.title = "修改岗位";
          this.form = structuredClone(row)
        },
        // 表单取消按钮
        cancel() {
          this.open = false;
          this.reset();
        },
        // 表单重置
        reset() {
          this.form = {
            postId: undefined,
            postCode: undefined,
            postName: undefined,
            postSort: 0,
            status: "0",
            remark: undefined
          };
        },
      }
}
</script>
<style scoped lang="less">

</style>