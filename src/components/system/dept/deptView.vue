<template>
  <div>
    <el-card>
      <el-form :model="deptInfo" ref="queryForm" size="small" :inline="true">
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="deptInfo.deptName" placeholder="请输入部门名称" clearable
                    @keyup.enter.native="handleQuery"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="deptInfo.status" placeholder="部门状态" clearable>
            <el-option
                v-for="dict in dictList"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
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
            <el-button size="mini" type="text" icon="el-icon-edit" @click="updateDept(scope.row)">修改</el-button>
            <el-button size="mini" type="text" icon="el-icon-plus" @click="addDept(scope.row)">新增</el-button>
            <el-button size="mini" type="text" icon="el-icon-delete"
                       @click="deleteDept(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>

      </el-table>
    </el-card>
  </div>
</template>


<script>

export default {
  data() {
    return {
      // 要展开的行，数值的元素是row的key值
      expands: [],
      //部门树形数组
      deptList: [],
      //部门树形数据
      treeList: [
        {
          id: 0,
          deptId: 0,
          deptName: '主目录',
          parentId: 0,
          children: []
        },
      ],
      //查询条件
      deptInfo: {
        deptName: '',
        status: ''
      },
      //部门状态
      dictList: [
        {label: '正常', value: '0'},
        {label: '停用', value: '1'}
      ],
    }
  },
  created() {
    this.search();
    //树形结构的table默认展开第一级
    // 放入默认展开行
    this.expands.push(this.deptList[0].deptId)
  },
  methods: {
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
        console.log(res.menuList)
        this.deptList = res.menuList;
        this.treeList[0].children = res.menuList;
      } catch (error) {
        console.error(error);
        this.$message.error("获取数据失败");
      }
    },
    //重置方法
    reset() {
      this.deptInfo = {
        deptName: '',
        status: ''
      };
      this.search();
    },
    //删除方法
    async deleteDept(dept) {
      console.log(dept);
      const confirmResult = await this.$confirm('确认要删除'+dept.deptName+'吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)

      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
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