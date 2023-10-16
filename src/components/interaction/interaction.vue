<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>社区互动</el-breadcrumb-item>
    </el-breadcrumb>
    <br>
    <el-card>
      <el-form :model="queryParams" ref="queryForm" size="small" :inline="true">
        <el-form-item label="业主昵称" prop="ownerNickname">
          <el-input
              v-model.trim="queryParams.ownerNickname"
              placeholder="请输入业主昵称"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="业主姓名" prop="ownerRealName">
          <el-input
              v-model.trim="queryParams.ownerRealName"
              placeholder="请输入业主姓名"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="手机号码" prop="ownerPhoneNumber">
          <el-input
              v-model.trim="queryParams.ownerPhoneNumber"
              placeholder="请输入手机号码"
              clearable
              style="width: 240px"
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

      <el-table :data="InteractionList" ref="list">
        <el-table-column type="selection" width="55" align="center"/>
        <el-table-column label="序号" align="center">
          <template slot-scope="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="业主昵称" align="center" key="ownerNickname" prop="ownerNickname"/>
        <el-table-column label="业主名称" align="center" key="ownerRealName" prop="ownerRealName"/>
        <el-table-column label="业主电话" align="center" key="ownerPhoneNumber" prop="ownerPhoneNumber"/>
        <el-table-column label="创建时间" align="center" key="createTime" prop="createTime">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime|dateFormat }}</span>
          </template>
        </el-table-column>
        <el-table-column label="内容" align="center" key="content" prop="content"/>
        <el-table-column label="图片" align="center" key="ownerPortrait" prop="ownerPortrait">
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="text"
                icon="el-icon-picture"
                @click="ShowImage(scope.row)">
             显示图片
            </el-button>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="text"
                icon="el-icon-s-tools"
                @click="handlereview(scope.row)">
              更多操作
            </el-button>
            <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="remove(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryParams.current"
          :page-sizes="[1, 5, 10,20]"
          :page-size="queryParams.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>

      <el-dialog
          title="社区互动详情"
          :visible.sync="dialogVisible"
          append-to-body :before-close="handleClose">
        <div v-for="i in InteractionList" key="i.interactionId">
          <div v-if="i.interactionId === ctid">
            <h3>
              <el-image class="eimage" :src="i.ownerPortrait"/>
              <span>{{ i.ownerNickname }}</span>&nbsp;
              <span>{{ i.createTime |dateFormat }}
              </span></h3>
            <p>{{ i.content }}</p>
          </div>
        </div>
        <span class="block" v-for="fit in timages" :key="fit">
          <el-image
              style="width: 100px; height: 100px;margin:1px 3px;"
              :src="fit"
              :fit="fit"></el-image>
        </span>

        <div class="el-div">
        <el-table v-if="InteraList.length > 0" :data="InteraList">
          <el-table-column style="background-color: #f5f5f5;" >
            <template slot-scope="scope">
              <div v-if="scope.row.commentOwnerNickname" class="el_div">
                <!--<el-image v-for="url in urls" :key="url" :src="url" lazy></el-image>-->
                <el-image style="
                          width:50px;
                          height: 50px;
                          border-radius: 50%;
                          color: rgba(0, 0, 0, 0.5);" :src="scope.row.ownerPortrait"/>
                <span style="padding-top: -10px">{{ scope.row.commentOwnerNickname }}</span>
                <br>
                <span style="font-size: 12px;">{{ scope.row.commentCreateTime }}</span>
                <br>
                回复&nbsp;<span style="color:blue ">{{ scope.row.parentId == -1 ? "帖子" : scope.row.ownerNickname }}</span>&nbsp;<b>:</b>{{
                  scope.row.commentContent
                }}
                <br>
                <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-delete"
                    @click="delInter(scope.row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无评论"></el-empty>
        </div>
      </el-dialog>
      <el-dialog
          title="帖子图片详情"
          :visible.sync="open"
          append-to-body :before-close="handleClose">

        <template>
          <el-carousel v-if="images.length > 0" :interval="4000" type="card" height="200px">
            <el-carousel-item   v-for="item in images" :key="item">
              <h3  class="medium"><el-image :src="item" /></h3>
            </el-carousel-item>
          </el-carousel>
          <el-empty v-else description="暂无图片"></el-empty>
        </template>

<!--        <el-image style="max-width: 15%; max-height: 20% ; object-fit: contain;margin-left:10px" v-for="url in images" :key="url" :src="url" />-->
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import index from "vuex";
import Vue from "vue";


export default {
  computed: {
    index() {
      return index
    }
  },
  data() {
    return {

      zyCommunityList: {},
      // 总条数
      total: 0,

      dialogVisible: false,

      queryParams: {
        current: 1,
        size: 20,
        communityId: "",
        ownerNickname: "",
        ownerRealName: "",
        ownerPhoneNumber: ""
      },
      InteractionList: [],

      open:false,

      parentIds: [],

      ownerNickNames: [],

      UserName: undefined,

      InteraList: [],

      IntText: [{
        ownerPortrait: "",
        ownerNickname: "",
        createTime: "",
        content: ""
      }],

      image:{
        images:[],
        pid:[]
      },

      timages:[],

      images:[],
      pid:[],

      ctid: undefined
    }
  }, created() {
    this.getInteractionService();
    this.communityList();
  },
  methods: {
    async communityList() {
      const {data: res} = await this.$http.get("zyBuilding/getCommunityList");
      this.zyCommunityList = res.data;
      this.queryParams.communityId = this.zyCommunityList.communityId;
    },
    async getInteractionService() {

      const {data: res} = await this.$http.get('zyCommunityInteraction/getInteractionService', {
        params: this.queryParams
      })
      this.total = res.data.total
      this.InteractionList = res.data.records
      console.log("total", this.total);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.current = 1;
      this.getInteractionService();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams.ownerNickname = '';
      this.queryParams.ownerRealName = '';
      this.queryParams.ownerPhoneNumber = '';
      this.getInteractionService();
    },
    handleSizeChange(val) {
      this.queryParams.size = val
      this.getInteractionService();
    },
    // @current-change页码点击事件
    handleCurrentChange(val) {
      this.queryParams.current = val
      this.getInteractionService();
    },
    updateQueryParams() {

      this.getInteractionService();
    },
    async delInter(r) {
      console.log("commentId", r.commentId)
      const confirmResult = await this.$confirm('确认要删除' + '"吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      let res = await this.$http.put("zyCommunityInteraction/getCommentParentIds?id=" + r.commentId);
      this.$message.success("删除成功")
      this.handlereview(r);
    },
    async remove(r) {
      const confirmResult = await this.$confirm('确认要删除' + '吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).catch(err => err)
      // 如果用户点击确认，则confirmResult 为'confirm'
      // 如果用户点击取消, 则confirmResult获取的就是catch的错误消息'cancel'
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      let res = await this.$http.put("zyCommunityInteraction/delInteraction?id=" + r.interactionId + "&type=" + 1);
      this.$message.success("删除成功")
      this.getInteractionService();
    },
    handleClose(done) {
      done();
    },
    async handlereview(r) {

      const {data: rs} = await this.$http.get("zyCommunityInteraction/getFeilsUrl?id=" + r.interactionId);
      console.log("rs",rs)
      this.image.images=rs.FilesUrl
      this.image.pid=rs.ParentId

      this.timages= rs.FilesUrl;

      console.log("FilesUrl", this.image.images)
      console.log("ParentId",this.image.pid)

      this.dialogVisible = true

      this.ctid = r.interactionId;

      const {data: res} = await this.$http.get("zyCommunityInteraction/getInteractionList?interactionId=" + r.interactionId);

      this.InteraList = res.data;

      const {data: res2} = await this.$http.get("zyCommunityInteraction/getParentIds?id=" + r.interactionId);


      for (let i = 0; i < res2.objectsName.length; i++) {
        this.InteraList.forEach((InteraList, i) => {
          Vue.set(InteraList, 'replyownerNickName', res2.objectsName[i]);
        });
      }

    },
    async ShowImage(r){
      this.open=true;
      const {data: res} = await this.$http.get("zyCommunityInteraction/getFeilsUrl?id=" + r.interactionId);

      this.images=res.FilesUrl
      this.pid=res.ParentId
      console.log("FilesUrl",this.images)
      console.log("ParentId",this.pid)


    }

  }

}

</script>


<style scoped>
.multiline-cell {
  white-space: normal;
  word-wrap: break-word;
}

.el-dialog .eimage {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: rgba(0, 0, 0, 0.5);
}

.el-table .el-image {
  width: 50px;
  height: 50px;
}

.h3 {
  padding: 10px 20px;
}

.custom-column {
  background-color: #f5f5f5; /* 设置背景色，可以替换为任意颜色值 */
}

.el_div {

  margin-left: 30px;
}

.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}

el-div{
  background-color: red;
}

</style>