<template>
  <div>
    <!-- 面包屑导航 -->
    <br>
    <el-breadcrumb separator-class="el-icon-arrow-right" style="margin-left: 20px">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>社区资产</el-breadcrumb-item>
      <el-breadcrumb-item>楼栋管理</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-card>
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="楼栋名称" prop="buildingName">
          <el-input
              v-model.trim="queryParams.buildingName"
              placeholder="请输入楼栋名称"
              clearable
              @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="楼栋编码" prop="buildingCode">
          <el-input
              v-model.trim="queryParams.buildingCode"
              placeholder="请输入楼栋编码"
              clearable
              @keyup.enter.native="handleQuery"
          />
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
      </el-form>
      <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="add()"
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
            type="info"
            plain
            icon="el-icon-upload2"
            size="mini"
            @click="handleImport"
        >导入
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
          :data="buildingList"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="selectionChangeHandle"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="index" label="序号" width="150">
        </el-table-column>
        <el-table-column
            prop="buildingName"
            label="楼栋名字"
            width="180"
        ></el-table-column>
        <el-table-column
            prop="buildingCode"
            label="楼栋编码"
            width="180"
        ></el-table-column>
        <el-table-column
            prop="buildingAcreage"
            label="楼栋面积"
            width="180"
        ></el-table-column>
        <el-table-column label="创建时间" width="160">
          <template slot-scope="scope">{{ scope.row.createTime | dateFormat }}</template>
        </el-table-column>
        <el-table-column
            prop="remark"
            label="备注"
            width="180"
        ></el-table-column>
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
          :page-sizes="[1, 5, 10]"
          :page-size="queryParams.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
      <!-- 添加或修改楼栋对话框 -->
      <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body @close="cancel()">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="楼栋名称" prop="buildingName">
            <el-input v-model.trim="form.buildingName" placeholder="请输入楼栋名称"/>
          </el-form-item>
          <el-form-item label="楼栋面积" prop="buildingAcreage">
            <el-input v-model.trim="form.buildingAcreage" placeholder="请输入楼栋面积"/>
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model.trim="form.remark"  type="textarea" placeholder="请输入内容"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
      <!-- 用户导入对话框 -->
      <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
        <el-upload
            ref="upload"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            class="upload-demo"
            action="#"
            :before-upload="beforeAvatarUpload"
            :http-request="uploadHttpRequest"
            :auto-upload="true"
            name="file"
            drag
            multiple
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip text-center" slot="tip">
            <!--          <div class="el-upload__tip" slot="tip">-->
            <!--            <el-checkbox v-model="upload.updateSupport"/>-->
            <!--            是否更新已经存在的用户数据-->
            <!--          </div>-->
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
                     @click="importTemplate">下载模板
            </el-link>
          </div>
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="uploadHttpRequest">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </el-dialog>
    </el-card>
    <br>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: {Authorization: window.sessionStorage.getItem("token")},
        // 上传的地址
        url: "http://localhost:8080/#/excel/into"
      },
      // 弹出层标题
      title: "",
      rules: {
        buildingName: [
          { required: true, message: "楼栋名称不能为空", trigger: "blur" }
        ],
        buildingAcreage: [
          {
            pattern: /^[^A-Za-z\u4e00-\u9fa5]+$/,
            message: '不允许输入中文和英文',
            trigger: 'change'
          },
        ],
      },
      // 表单参数
      form: {},
      selectedOption: '',
      // 总条数
      total: 0,
      // 非单个禁用
      multiple: true,
      single: true,
      ids:[],
      derivesA:[],
      open: false,
      //小区集合
      zyCommunityList: {},
      id:"",
      //楼栋集合
      buildingList: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        buildingName: "",
        buildingCode: "",
        communityId: "",
        communityName: ""
      },
      // 显示搜索条件
      showSearch: true,

    }
  },
  async created() {
    await this.communityList();
    await this.getBuildingList();
  },
  methods: {
    //上传导入
    async uploadHttpRequest() {
      const {data: res} = await this.$http({
        url: 'excel/intoS',
        method: "post",
        headers: {
          "Content-Type": "multipart/form-data;boundary=" + new Date().getTime()
        },
        data: this.format,
      })
      if (res.status == 201) {
        this.$message.error(res.msg);
      } else if (res.status == 200) {
        this.$message.success(res.msg);
      }else {
        this.$message.warning("权限不足!");
      }
    },
    //上传前
    beforeAvatarUpload(file) {
      const fileSuffix = file.name.substring(file.name.lastIndexOf(".") + 1);
      const whiteList = ["xls", "xlsx"];

      if (whiteList.indexOf(fileSuffix) === -1) {
        this.$message.error("上传文件只能是xls、xlsx格式", "error");
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
        return false;
      }
      this.uploadFile = file
      let formData = new FormData();
      formData.append('file', file)
      this.format = formData
    },
    /** 下载模板操作 */
    async importTemplate() {
      const {data: res} = await this.$http.post(`excel/templateS`)
      if (res.status == 200) {
        //成功导出
        this.$message.success(res.msg + ",路径为：" + res.path)
        this.$refs.list.clearSelection(); // el-table上绑定ref="list"
      } else if (res.status == 201) {
        //导出失败
        this.$message.error(res.msg)
      }
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      // this.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", {dangerouslyUseHTMLString: true});
      this.getBuildingList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$http.put("excel/intoS", this).then(response => {
        if (response.data.data == 1) {
          this.$message.success("修改成功");
          this.open = false;
          this.getBuildingList();
        }
      });
      this.$refs.upload.submit();
    },
    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },
    //获取小区列表
    async communityList() {
      const {data: res} = await this.$http.get("zyBuilding/getCommunityList");
      this.zyCommunityList = res.data;
      this.queryParams.communityId = this.zyCommunityList[0].communityId;
    },
    //根据小区id获取楼栋列表
    async getBuildingList() {
      const {data: res1} = await this.$http.get("zyBuilding/buildingList", {
        params: this.queryParams
      });
      if(res1==''){
        return
      }
      this.total = res1.data.total
      this.buildingList = res1.data.records
    },
    handleSizeChange(val) {
      this.queryParams.size = val
      this.getBuildingList();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getBuildingList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs["queryForm"].resetFields();
      this.queryParams.dictType = this.defaultDictType;
      this.handleQuery();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1;
      this.getBuildingList();
    },
    updateQueryParams() {
      this.getBuildingList();
    },
    update(row) {
      this.id=row.communityId
      this.title = "修改楼栋"
      this.open = true;
      this.form = structuredClone(row)
    },
    add() {
      this.title = "新增楼栋"
      this.open = true;
      this.reset();
      this.form.communityId=this.queryParams.communityId
      this.form.buildingCode="Code"+Date.now();
    },
    submitForm(){
      this.$refs.form.validate(async valid => {
        if (valid){
          let res;
          if (this.form.buildingId==null){
            this.form.buildingId=Date.now();
            res = await this.$http.get("zyBuilding/insertBuilding",{
              params:this.form
            })
          }
          else {
            res=await  this.$http.put("zyBuilding/updateBuilding/"+this.id,this.form)
          }
          if (res.data.status === 200) {
            this.open = false;
            this.$message.success(res.data.msg);
            this.getBuildingList();

          } else {
            this.form.buildingId=undefined
            this.$message.error(res.data.msg);
          }
        }
      })
    },
    // 表单取消按钮
    cancel() {
      this.open = false;
      this.reset();
      this.resetForm("form")
    },
    //重置信息
    resetForm(refName) {
      if (this.$refs[refName]) {
        this.$refs[refName].resetFields();
      }
    },
    // 表单重置
    reset() {
      this.form = {
        communityId:undefined,
        buildingCode: undefined,
        buildingName: undefined,
        buildingAcreage:undefined,
        remark: undefined
      };
    },
    //单个删除
    async delPost(row) {
      const confirmResult = await this.$confirm('确认要删除' + row.buildingName + '吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      await this.$http.delete('zyBuilding/delBuilding/'+row.buildingId).then(res => {
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.getBuildingList();
        } else {
          this.$message.error(res.data.msg);
        }
      })
    },
    //把选中的那条记录的postId属性放到deriveList中
    selectionChangeHandle(val) {
      this.multiple = !val.length;
      this.derivesA = []
      for (let i = 0; i < val.length; i++) {
        //concat方法在数组后追加内容。
        this.derivesA = this.derivesA.concat(val[i].buildingId)
        this.ids=this.derivesA;
      }
      this.single = val.length != 1;
      this.multiple = !val.length;
    },
    async batchDelete() {
      const confirmResult = await this.$confirm('确认要删除' + this.ids.length + '条数据吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      await this.$http.post('zyBuilding/deletes/',this.ids).then(res => {
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.getBuildingList();
          // 清空选中的数据
          this.ids = [];
        } else {
          this.$message.error(res.data.msg);
          // 清空选中的数据
          this.getBuildingList();
          this.ids = [];
        }
      })
    },
    //导出数据
    async derive() {
      const {data: res} = await this.$http.post(`excel/buildingList`, this.derivesA)
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
<style scoped>

</style>