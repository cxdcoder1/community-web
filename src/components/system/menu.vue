<template>
  <div>

    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item >菜单管理</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-card>
    <el-form :model="sysMenu" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="sysMenu.menuName" placeholder="请输入菜单名称" clearable @keyup.enter.native="handleQuery"/>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="sysMenu.status" placeholder="菜单状态" clearable>
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
    >添加
    </el-button>


    <el-table
        ref="multipleTable"
        :data="menuList"
        tooltip-effect="dark"
        style="width: 100%"
        row-key="menuId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column label="排序" width="130">
        <template slot-scope="scope">{{ scope.row.menuName }}</template>
      </el-table-column>
      <el-table-column prop="icon" label="图标" align="center" width="100">
        <template slot-scope="scope">
          <i :class="'icon iconfont icon-'+scope.row.icon">&nbsp;&nbsp;</i>
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
          <el-button size="mini" type="text" icon="el-icon-edit" @click="update(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-plus" @click="Add(scope.row)">新增</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete"
                     @click="deleteMenu(scope.row.menuId,scope.row.parentId)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>


    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="updateSysMenuShow" width="680px" @close="closeLog()" append-to-body>
      <el-form ref="menusInfoRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="上级菜单" prop="parentId">
              <treeselect
                  placeholder='选择上级菜单'
                  v-model="form.parentId"
                  :options="treeList"
                  :normalizer="normalizer"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">目录</el-radio>
                <el-radio label="C">菜单</el-radio>
                <el-radio label="F">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.menuType != 'F'">
            <el-form-item label="菜单图标" prop="icon">
              <e-icon-picker v-model="form.icon" style="width:300px"/>
              <!-- <e-icon-picker v-model="menusInfo.icon" :options="options"/>-->
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model.trim="form.menuName" placeholder="请输入菜单名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0"/>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="isFrame">
                          <span slot="label">
                            <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                            <i class="el-icon-question"></i>
                            </el-tooltip>
                            是否外链
                          </span>
              <el-radio-group v-model="form.isFrame">
                <el-radio :label="0">是</el-radio>
                <el-radio :label="1">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="path">
                          <span slot="label">
                            <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头"
                                        placement="top">
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
          <el-col :span="12" v-if="form.menuType !== 'M'">
            <el-form-item prop="perms">
              <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100"/>
              <span slot="label">
                <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)"
                            placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                权限字符
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'"></el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="isCache">
              <span slot="label">
                <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                是否缓存
              </span>
              <el-radio-group v-model="form.isCache">
                <el-radio :label="0">缓存</el-radio>
                <el-radio :label="1">不缓存</el-radio>
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
                <el-radio    v-for="dict in showPotion"
                             :key="dict.dictValue"
                             :label="dict.dictValue"
                >
                  {{ dict.dictLabel }}
                </el-radio>
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
                <el-radio    v-for="dict in statusPotion"
                             :key="dict.dictValue"
                             :label="dict.dictValue"
                             >
                  {{ dict.dictLabel }}
                  </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveMenu()">确 定</el-button>
        <el-button @click="updateSysMenuShow=false">取 消</el-button>
      </div>
    </el-dialog>
    </el-card>
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";


export default {

  name: 'e-icon',
  components: {Treeselect},

  data() {
    return {

      updateSysMenuShow: false,
      treeData: [], // 初始化为一个空数组
      statusPotion:[],
      showPotion:[],
      form: {
        menuType: 'M',
        status: '0',
        menuName: '',
        orderNum: '',
        isFrame: '',
        path: '',
        component: '',
        perms: '',
        isCache: '',
        visible: "",
        title: "修改菜单",
        menusInfo: "",
      },
      menuList: [],
      treeList: [
        {
          id: 0,
          menuId: 0,
          menuName: '主目录',
          parentId: 0,
          children: []
        },
      ],
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

      from1: {},
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
    this.getStatus();
    this.getShow();
  },

  methods: {
    async getShow() {
      const {data: res} = await this.$http.get('sysMenu/menuShowsOption')
      this.showPotion=res.data;
      console.log("123",this.showPotion)
    },
    async getStatus() {
      const {data: res} = await this.$http.get('sysMenu/menuStatusOption')
      this.statusPotion=res.data;
    },
    async saveMenu() {

      if (!this.form.menuName) {
        // 部门名称为空，提示用户输入值
        this.$message.error('菜单名称不能为空');
        return;
      }
      if (!this.form.orderNum) {
        // 部门名称为空，提示用户输入值
        this.$message.error('菜单顺序不能为空');
        return;
      }
      if (!this.form.path.trim()) {
        // 部门名称为空，提示用户输入值
        this.$message.error('路由不能为空');
        return;
      }
      let res;
      if (this.form.menuId == null || this.form.menuId == 0) {
        res = await this.$http.post('sysMenu/addMenu', this.form);
        console.log(res)
      } else {
        res = await this.$http.put('sysMenu/updateMenu', this.form);
      }
      if (res.data.status == 200) {
        this.updateSysMenuShow = false
        this.$message.success("保存成功")
        location.reload()

      } else {
        this.updateSysMenuShow = true
        this.$message.error(res.data.msg)
      }
    },
    update(r) {

      this.form.menuType = 'M';
      this.form.menuId = r.menuId
      this.form.parentId = r.parentId
      this.updateSysMenuShow = true
      this.title = "修改菜单";
      // this.form.
      if (r.parentId === 0) {
        this.form.parentId = 0
      } else {
        this.form.parentId = r.parentId
        // this.form.parentId === 0 ? '' : 'parentId';
      }
      this.form.status = r.status
      this.form.menuName = r.menuName
      // this.form.menuType=r.menuType
      this.form.orderNum = r.orderNum
      this.form.isFrame = r.isFrame
      this.form.path = r.path
      this.form.component = r.component
      this.form.visible = r.visible
      this.form.icon = r.icon
      // console.log(this.form.status)

    },
    Add(r) {
      this.title = "新增菜单";
      this.form = {
        menuType: 'M',
        parentId: '0',
        visible:'0',
        status:'0',
        isFrame:0,
        orderNum: 1
      };
        if(r.menuId!=null){
          this.form.parentId=r.menuId;
        }
      this.updateSysMenuShow = true;
      this.reset()
      this.menusInfo.parentId = 0
      this.menusInfo.isCache = 1
      this.menusInfo.isFrame = 1
    },
    closeLog() {
      this.$refs.form.resetFields()
      this.updateSysMenuShow = false
      this.form = {
        menuType: 'M',
      }

    },
    reset() {
      this.menusInfo = {
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: "M",
        orderNum: undefined,
        isFrame: "1",
        isCache: "1",
        visible: "0",
        status: "0"
      };
      this.resetForm("menusInfoRef");
    },
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
        const { data: res } = await this.$http.post("sysMenu/menuList", this.sysMenu);
        console.log(res);
        this.menuList = res.data;
        this.icons = res.icon;
        this.treeData = res.data;
        this.treeList[0].children = res.data;
        // const res1 = this.$http.get(`sysRole/getRoleMenuTreeselect` + roleId);
        // this.treeList[0].children = res1.data.data;

      } catch (error) {
        console.error(error);
        this.$message.error("获取数据失败");
      }
      // location.reload()
    },
    handleQuery() {
      this.sysMenu.menuName=this.sysMenu.menuName.trim()
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
        this.$message.success(res.data.data)
        setTimeout(()=>{
          location.reload()
        },500)

      })
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