<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item >部门管理</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-card>
      <el-form :model="deptInfo" ref="queryForm" size="small" :inline="true">
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="deptInfo.deptName" placeholder="请输入部门名称" clearable
                    @keyup.enter.native="handleQuery"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="deptInfo.status" placeholder="部门状态" clearable>
            <el-option
                v-for="dict in statusPotion"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="search">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          @click="Add"
      >新增
      </el-button>
      <el-button  class="el-button el-button--info el-button--mini is-plain" @click="toggleRowExpansion">
        <i class="el-icon-sort"></i>
        <span>展开/折叠</span>
      </el-button>

    </el-card>
    <el-card>
      <el-table
          ref="multipleTable"
          :data="deptList"
          tooltip-effect="dark"
          style="width: 100%"
          :row-key="getRowKeys"
          :expand-row-keys="expands"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="deptName" label="部门名称" align="center" width="250">
          <template slot-scope="scope">{{ scope.row.deptName }}</template>
        </el-table-column>
        <el-table-column label="排序" width="200">
          <template slot-scope="scope">{{ scope.row.orderNum }}</template>
        </el-table-column>
        <el-table-column label="状态" width="200">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === '0' ? '' : 'danger'">
              {{ scope.row.status === '0' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="200">
          <template slot-scope="scope">{{ scope.row.createTime | dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-plus"  @click="updateDept(scope.row)">修改</el-button>
            <el-button size="mini" type="text" icon="el-icon-plus"  @click="Add(scope.row)">新增</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete"
                       @click="deleteDept(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

<!--      新增修改表单-->
      <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="24" >
              <el-form-item label="上级菜单" prop="parentId">
                <treeselect
                    placeholder='选择上级菜单'
                    v-model="form.parentId"
                    :options="treeList"
                    :normalizer="normalizer"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="部门名称" prop="deptName">
                <el-input v-model.trim="form.deptName" placeholder="请输入部门名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="显示排序" prop="orderNum">
                <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="负责人" prop="leader">
                <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门状态">
                <el-radio-group v-model="form.status">
                  <el-radio v-for="dict in this.statusPotion"
                            :key="dict.dictValue"
                            :label="dict.dictValue">
                    {{ dict.dictLabel }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
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
//表单树形结构导包
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
export default {
  //表单树形结构导包
  components: {Treeselect},

  data() {
    return {
      statusPotion:[],

      //查询条件
      deptInfoTree: {
        deptName: '',
        status: ''
      },
      // 表单参数
      form: {
        deptId:"",
        parentId: "",
        ancestors: "",
        leader: "",
        phone: "",
        email: "",
        status: "0",
      },
      //表单验证
      rules: {
        parentId: [
          { required: true, message: "上级部门不能为空", trigger: "blur" }
        ],
        deptName: [
          { required: true, message: "部门名称不能为空", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "显示排序不能为空", trigger: "blur" }
        ],
        email: [
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        phone: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur"
          }
        ]
      },
      //表单显示默认为关闭
      open:false,
      // 要展开的行，数值的元素是row的key值
      expands: [],
      //部门树形数组
      deptList: [],
      //部门树形数据
      treeList: {},
      //查询条件
      deptInfo: {
        deptName: '',
        status: ''
      },
      //部门状态

    }
  },
  created() {
    this.search();
    this.getStatus();

    //树形结构的table默认展开第一级
    // 放入默认展开行
    this.expands.push(this.deptList[0].deptId)
  },
  methods: {


    async getStatus() {
      const {data: res} = await this.$http.get('sysDept/deptStatusOption')
      this.statusPotion=res.data;
    },
    //新增修改表单取消
    cancel() {
      this.open = false;
      this.reset();
    },

    getRowKeys(row) {
      return row.deptId
    },
    //展开折叠
    toggleRowExpansion() {
      this.isExpansion = !this.isExpansion;
      this.toggleRowExpansionAll(this.deptList, this.isExpansion);
    },
    toggleRowExpansionAll(data, isExpansion) {
      data.forEach((item) => {
        this.$refs.multipleTable.toggleRowExpansion(item, isExpansion);
        if (item.children !== undefined && item.children !== null) {
          this.toggleRowExpansionAll(item.children, isExpansion);
        }
      });
    },
    //搜索方法
    async search() {
      try {
        this.deptInfo.deptName = this.deptInfo.deptName.trim();
        const {data: res} = await this.$http.post("sysDept/getDeptList", this.deptInfo);
        const {data: res2} = await this.$http.post("sysDept/treeDeptList",this.deptInfoTree);
        // console.log("cxdccccc",res.menuList)
        this.deptList = res.menuList;

        this.treeList=res2.menuList
        //给表单from赋值
        this.form=res2.menuList

      } catch (error) {
        // console.error(error);
        this.$message.error("获取数据失败");
      }
    },

    //新增修改表单提交
    async submitForm() {
      if (this.form.deptId < this.form.parentId) {
        return this.$message.error("大部门不能移到小部门");
      }
      if (this.form.deptName == null || this.form.deptName.length > 10) {
        // name 字段为空或长度超过 10，提示用户输入正确的值
        this.$message.error('请输入正确长度的姓名');
        return;
      }
      this.$refs.form.validate(async valid => {
        if (valid) {
          // 在表单验证通过时执行的代码
          let res;
          if (this.form.deptId == null || this.form.deptId == '') {
            res = await this.$http.post("sysDept/addDept", this.form);
          } else {
            res = await this.$http.put("sysDept/updateDept", this.form);
          }
          if (res.data.status == 200) {
            this.open = false;
            this.$message.success("操作成功");
            this.search();
          } else {
            this.$message.error(res.data.msg);
          }
        }else {
          this.$message.error('请输入正确信息');
        }
      });
    },
    //新增按钮
    Add(row) {
      this.open = true;
      this.title = "添加部门";
      // this.form
      this.form={
        status:'0',
        orderNum:'1',
        parentId:'100'
      }
      // console.log(row.deptId)
      // this.form.parentId=row.parentId
      if (row.deptId!=null){
       this.form.parentId=row.deptId
      }
    },
    //修改按钮
    updateDept(row){
      this.open=true
      this.title = "修改菜单";
      this.form = structuredClone(row)
      if (row.parentId===0){
        this.form.parentId=100
      }
    },
    //表单中的树形结构
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      };
    },
    //重置方法
    reset() {
      this.deptInfo = {
        deptName: '',
        status: ''
      };
      this.search();
    },
    //下拉状态
    //删除方法
    async deleteDept(dept) {
      console.log(dept);
      const confirmResult = await this.$confirm('确认要删除'+dept.deptName+'吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      await this.$http.delete('sysDept/delete/' + dept.deptId).then(res => {
        console.log(res)
        if (res.data.status == 200) {
          this.$message.success(res.data.msg)
          this.search();
        } else if (res.data.status == 201) {
          this.$message.error(res.data.msg)
        }
      })
    }
  }
}
</script>


<style scoped>

</style>