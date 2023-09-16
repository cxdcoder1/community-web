<template>
  <div>
    <el-form :model="sysMenu" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="sysMenu.menuName" placeholder="请输入菜单名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="sysMenu.status" placeholder="菜单状态" clearable>
          <el-option
              v-for="dict in dictList"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
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
        @click="updateSysMenuShow = true"
    >添加
    </el-button>

    <el-table
        ref="multipleTable"
        :data="sysMenuList"
        tooltip-effect="dark"
        style="width: 100%"
        row-key="menuId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column label="菜单名称" width="150">
        <template slot-scope="scope">{{ scope.row.menuName }}</template>
      </el-table-column>
      <el-table-column prop="icon" label="图标" align="center" width="100">
        <template slot-scope="">
          <v-icon>{{ icons }}</v-icon>
        </template>
      </el-table-column>
      <el-table-column label="排序" width="120">
        <template slot-scope="scope">{{ scope.row.orderNum }}</template>
      </el-table-column>
      <el-table-column label="权限标识" width="200">
        <template slot-scope="scope">{{ scope.row.perms }}</template>
      </el-table-column>
      <el-table-column label="组件路径" width="200">
        <template slot-scope="scope">{{ scope.row.component }}</template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template slot-scope="scope"> {{ scope.row.status === '0' ? '正常' : '禁用' }}</template>
      </el-table-column>
      <el-table-column label="创建时间" width="200">
        <template slot-scope="scope">{{ scope.row.createTime | dateFormat }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-plus">新增</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete"
                     @click="deleteMenu(scope.row.menuId,scope.row.parentId)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 添加或修改菜单对话框 -->
    <el-dialog aria-label="新增菜单" :visible.sync="updateSysMenuShow" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <!--          <el-col :span="24">-->
          <!--            <el-form-item label="上级菜单" prop="parentId">-->
          <!--              <treeselect-->
          <!--                  v-model="form.parentId"-->
          <!--                  :options="sysMenuList"-->
          <!--                  :normalizer="normalizer"-->
          <!--                  :show-count="true"-->
          <!--                  placeholder="选择上级菜单"-->
          <!--              />-->
          <!--            </el-form-item>-->
          <!--          </el-col>-->
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio aria-checked="true" label="M"
                          :disabled="tempType === 'M' || tempType === 'C' || tempType === 'F'">目录
                </el-radio>
                <el-radio label="C" :disabled="tempType === 'C'">菜单</el-radio>
                <el-radio label="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.menuType != 'F'">
            <el-form-item label="菜单图标" prop="icon">
              <e-icon-picker v-model="form.icon" :options="options"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model.trim="form.menuName" placeholder="请输入菜单名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model.trim="form.orderNum" controls-position="right" :min="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'" aria-checked="true">
            <el-form-item prop="isFrame">
              <span slot="label">
                <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                是否外链
              </span>
              <el-radio-group v-model="form.isFrame">
                <el-radio :label="'0'">是</el-radio>
                <el-radio :label="'1'">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="path">
              <span slot="label">
                <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                路由地址
              </span>
              <el-input v-model.trim="form.path" placeholder="请输入路由地址"/>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="component">
              <span slot="label">
                <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                组件路径
              </span>
              <el-input v-model.trim="form.component" placeholder="请输入组件路径"/>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'M'">
            <el-form-item prop="perms">
              <el-input v-model.trim="form.perms" placeholder="请输入权限标识" maxlength="100"/>
              <span slot="label">
                <el-tooltip placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                权限字符
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="query">
              <el-input v-model.trim="form.query" placeholder="请输入路由参数" maxlength="255"/>
              <span slot="label">
                <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`' placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                路由参数
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="isCache">
              <span slot="label">
                <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                是否缓存
              </span>
              <el-radio-group v-model="form.isCache">
                <el-radio :label="'0'">缓存</el-radio>
                <el-radio :label="'1'">不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="visible">
              <span slot="label">
                <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                显示状态
              </span>
              <el-radio-group v-model="form.visible">
                <el-radio :label="'0'">显示</el-radio>
                <el-radio :label="'1'">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="status">
              <span slot="label">
                <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                菜单状态
              </span>
              <el-radio-group v-model="form.status">
                <el-radio :label="'0'">正常</el-radio>
                <el-radio :label="'1'">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :disabled="isButtonDisabled" type="primary" @click="addSysMenu()">确 定</el-button>
        <el-button @click="updateSysMenuShow = false">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'e-icon',

  data() {

    return {
      updateSysMenuShow: false,
      form: {
        menuType: 'M',
      },
      // 表单校验
      rules: {
        menuName: [
          {required: true, message: "菜单名称不能为空", trigger: "blur"}
        ],
        orderNum: [
          {required: true, message: "菜单顺序不能为空", trigger: "blur"}
        ],
        path: [
          {required: true, message: "路由地址不能为空", trigger: "blur"}
        ]
      },
      setRightDialogVisible: false,

      treeProps: {}, // 树组件属性配置
      defKeys: [], // 默认选中项
      dialogVisible: false, // 是否显示新增用户对话框
      icons: "",

      sysMenu: {
        menuName: '',
        status: ''
      },

      showSearch: true,
      dictList: [
        {label: '正常', value: '0'},
        {label: '禁用', value: '1'}
      ],
      sysMenuList: [], // 列表数据
    };
  },
  created() {
    this.getSysMenu();

  },

  methods: {
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.menuId,
        label: node.menuName,
        children: node.children
      };
    },
    async getSysMenu() {
      try {
        const {data: res} = await this.$http.post("sysMenu/menuList", this.sysMenu);

        // let _this=this;
        // _this.icon=res.data.icon
        //
        // console.log(11111)
        // console.log(res);
        this.sysMenuList = res.data;
      } catch (error) {
        console.error(error);
        this.$message.error("获取数据失败");
      }
    },
    handleQuery() {
      this.getSysMenu();
    },
    resetQuery() {
      // 重置查询条件
      this.sysMenu.menuName = '';
      this.sysMenu.status = '';
    },
    async deleteMenu(menuId, parentId) {
      // 弹窗提示用户是否要删除
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
      this.$http.post("sysMenu/deleteMenu", {
        menuId: menuId,
        parentId: parentId
      }).then(res => {
        alert(res.data.data)
      })
      location.reload()
    },

  }
};
</script>

<style scoped lang="less">
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>