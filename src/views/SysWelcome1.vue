<template>
  <div id="index">
    <div class="bg">
      <dv-loading v-show="loading">Loading...</dv-loading>
      <div class="host-body">
        <div>
          <!-- 顶部title部分 -->
          <el-row>
            <el-col :span="6"
            ><dv-decoration-8
                class="title_right"
                :color="['#008CFF', '#00ADDD']"
            /></el-col>
            <el-col :span="12"
            ><div class="title_text">智 慧 社 区 数 据 可 视 化 大  屏</div>
              <dv-decoration-5
                  class="title_center"
                  :color="['#008CFF', '#00ADDD']"
              /></el-col>
            <el-col :span="6"
            ><div class="title_time">{{ dateYear + dateWeek + dateDay }}</div>
              <dv-decoration-8
                  :reverse="true"
                  class="title_left"
                  :color="['#008CFF', '#00ADDD']"
              /></el-col>
          </el-row>
          <!-- 主体部分 -->
          <el-row>
            <!-- 第一列 -->
            <el-col :span="6">
              <div class="left_box1">
                <dv-border-box-12 >
                  <div id="Rose_diagram" style="margin-top: 0px" ></div>
                </dv-border-box-12>

              </div>
              <!-- 轮播表格部分 -->
              <div  class="user_skills" >
                <div class="left_box3">
                  <div style="text-align: center">登  录  日  志</div>
                  <dv-border-box-12 style="padding-top: 10px">
                    <dv-scroll-board
                        :config="board_info"
                        class="carousel_list"
                        oddRowBGC="#fff"
                    />
                  </dv-border-box-12>
                </div>
              </div>

            </el-col>
            <!-- 第二列 -->
            <el-col :span="12">
              <!-- 中国地图 -->
              <div id="china-map"></div>
            </el-col>
            <!-- 第三列 -->
            <el-col :span="6">
              <!-- 轮播排行榜部分 -->
              <div class="right_box1">
                <dv-border-box-12>
                  <dv-decoration-7 style="width: 100%; height: 30px"
                  >小 区 排 行 榜</dv-decoration-7
                  >
                  <dv-scroll-ranking-board
                      :config="cone"
                      style="width: 95%; height: 87%; margin-left: 2%"
                  />
                </dv-border-box-12>
              </div>
              <!-- 虚线柱状图部分 -->
<!--              <div class="right_box2">-->
<!--                <dv-border-box-12 :reverse="true">-->
<!--                  <div id="dotter_bar"></div>-->
<!--                </dv-border-box-12>-->
<!--              </div>-->
<!--               部分-->
              <div  class="right_box3">
               <div style="text-align: center">房 屋 使 用 情 况</div>
                <dv-border-box-12 :reverse="true">
                  <dv-conical-column-chart :config="cones" class="cone_box" />
                </dv-border-box-12>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import drawMixin from "@/components/utils/drawMixin"; //自适应缩放
import { formatTime } from "@/components/utils/index.js"; //日期格式转换
// import * as echarts from "echarts";
export default {
  mixins: [drawMixin],
  data() {
    return {
      //定时器
      timing: null,
      //loading图
      loading: true,
      //时分秒
      dateDay: null,
      //年月日
      dateYear: null,
      //周几
      dateWeek: null,
      //周几
      weekday: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
      //左侧轮播表格配置项
      board_info: {
        header: ["用户名", "登录地址", "登录状态"],
        data: [

        ],
        evenRowBGC: "#020308",
        oddRowBGC: "#382B47",
        headerBGC: "#020308",
      },
      // 定义颜色
      colorList: {
        linearYtoG: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 1,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: "#f5b44d",
            },
            {
              offset: 1,
              color: "#28f8de",
            },
          ],
        },
        linearGtoB: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            {
              offset: 0,
              color: "#43dfa2",
            },
            {
              offset: 1,
              color: "#28f8de",
            },
          ],
        },
        linearBtoG: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            {
              offset: 0,
              color: "#1c98e8",
            },
            {
              offset: 1,
              color: "#28f8de",
            },
          ],
        },
        areaBtoG: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: "rgba(35,184,210,.2)",
            },
            {
              offset: 1,
              color: "rgba(35,184,210,0)",
            },
          ],
        },
      },
      //锥形柱状图
      cones : {
        data: [

        ],
        showValue: true,
      },

    };
  },

  mounted() {
    //获取实时时间
    this.timeFn();
    //加载loading图
    this.cancelLoading();
    //中国地图
    this.china_map();
    //左侧玫瑰饼图
    this.Rose_diagram();
    //左侧柱状图
    this.columnar();
    //中间折线图
    this.line_center_diagram();
    //虚线柱状图
    this.dotter_bar();
  },
  beforeDestroy() {
    //离开时删除计时器
    clearInterval(this.timing);
  },
  created() {
    this.getUserLogin()
    this.getRoom();
    this.getRoomStatus();
  },
  methods: {
    //右上角当前日期时间显示：每一秒更新一次最新时间
    timeFn() {
      this.timing = setInterval(() => {
        //获取当前时分秒
        this.dateDay = formatTime(new Date(), "HH: mm: ss");
        //获取当前年月日
        this.dateYear = formatTime(new Date(), "yyyy-MM-dd");
        //获取当前周几
        this.dateWeek = this.weekday[new Date().getDay()];
      }, 1000);
    },
    async getUserLogin(){
      const {data: res} = await this.$http.get('sysLogininfor/getLoginUser');
      this.board_info={
      header:['用户名','登录地址','操作状态'],
       data:res.data
        }
    },
    async getRoom() {
      const { data: res } = await this.$http.get('zyCommunity/getRoom');
      const roomData = res.data;
      // 转换成 key 和 value 的集合
      const keyValuePairs = roomData.map(item => ({
        name: item.communityName,
        value: item.roomNum
      }));
      this.cone = {
        data: keyValuePairs
      };

    this.Rose_diagram(keyValuePairs)
      //   let mapChart={
      //     series
      //   }
    },
    async getRoomStatus() {
      const { data: res } = await this.$http.get('zyRoom/getRoomListStatus');
      const roomDatas = res.data;
      // 转换成 key 和 value 的集合
      const keyValuePair = roomDatas.map(item => ({
        name: item.roomStatus,
        value: item.roomNum
      }));
      this.cones = {
        data: keyValuePair
      };
    },
    //loading图
    cancelLoading() {
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },
    //中国地图
    china_map() {
      let mapChart = this.$echarts.init(document.getElementById("china-map")); //图表初始化，china-map是绑定的元素
      window.onresize = mapChart.resize; //如果容器变大小，自适应从新构图
      let series = []; //存放循环配置项
      let res = []; //存放射线的起始点和结束点位置
      let province = []; //存放有射线的省的名字，以此来拿到对应省份的坐标
      //提前存好的所有省份坐标，用于后面根据名字拿到对应的左边
      let chinaGeoCoordMap = {
        新疆: [86.9023, 41.148],
        西藏: [87.8695, 31.6846],
        内蒙古: [110.5977, 41.3408],
        青海: [95.2402, 35.4199],
        四川: [102.9199, 30.1904],
        黑龙江: [128.1445, 46.7156],
        甘肃: [102.7129, 38.166],
        云南: [101.0652, 24.6807],
        广西: [108.7813, 23.6426],
        湖南: [111.5332, 27.3779],
        陕西: [108.5996, 33.7396],
        广东: [113.8668, 22.8076],
        吉林: [126.1746, 43.5938],
        河北: [115.4004, 38.1688],
        湖北: [112.2363, 30.8572],
        贵州: [106.6113, 26.6385],
        山东: [118.2402, 36.2307],
        江西: [115.7156, 27.99],
        河南: [113.0668, 33.8818],
        辽宁: [123.0438, 41.0889],
        山西: [112.4121, 36.6611],
        安徽: [117.2461, 31.0361],
        福建: [118.3008, 25.9277],
        浙江: [120.498, 29.0918],
        江苏: [119.8586, 32.915],
        重庆: [107.7539, 29.8904],
        宁夏: [105.9961, 37.1096],
        海南: [109.9512, 19.2041],
        台湾: [120.8254, 23.5986],
        北京: [116.4551, 40.2539],
        天津: [117.4219, 39.4189],
        上海: [121.4648, 31.2891],
        香港: [114.6178, 22.3242],
        澳门: [113.5547, 21.6484],
      };
      //后台给的数据模拟
      let lineData = [
        {
          val: 32, //数据
          blat: [86.9023, 41.148], //发射点
          elon: [87.8695, 31.6846], //接收点
          bcitysim: "新疆", //发射省的名字
          ecitysim: "西藏", //接收省的名字
        },
        {
          val: 31,
          blat: [87.8695, 31.6846],
          elon: [95.2402, 35.4199],
          bcitysim: "西藏",
          ecitysim: "青海",
        },
        {
          val: 33,
          blat: [86.9023, 41.148],
          elon: [95.2402, 35.4199],
          bcitysim: "新疆",
          ecitysim: "青海",
        },
        {
          val: 33,
          blat: [116.4551, 40.2539],
          elon: [119.8586, 32.915],
          bcitysim: "北京",
          ecitysim: "江苏",
        },
        {
          val: 33,
          blat: [120.8254, 23.5986],
          elon: [109.9512, 19.2041],
          bcitysim: "台湾",
          ecitysim: "海南",
        },
        {
          val: 33,
          blat: [120.498, 29.0918],
          elon: [115.7156, 27.99],
          bcitysim: "浙江",
          ecitysim: "江西",
        },
        {
          val: 33,
          blat: [117.2461, 31.0361],
          elon: [119.8586, 32.915],
          bcitysim: "安徽",
          ecitysim: "江苏",
        },
        {
          val: 33,
          blat: [117.2461, 31.0361],
          elon: [105.9961, 37.1096],
          bcitysim: "安徽",
          ecitysim: "宁夏",
        },
        {
          val: 33,
          blat: [117.2461, 31.0361],
          elon: [107.7539, 29.8904],
          bcitysim: "安徽",
          ecitysim: "重庆",
        },
        {
          val: 33,
          blat: [117.2461, 31.0361],
          elon: [123.0438, 41.0889],
          bcitysim: "安徽",
          ecitysim: "辽宁",
        },
        {
          val: 33,
          blat: [119.8586, 32.915],
          elon: [102.7129, 38.166],
          bcitysim: "江苏",
          ecitysim: "甘肃",
        },
        {
          val: 33,
          blat: [119.8586, 32.915],
          elon: [128.1445, 46.7156],
          bcitysim: "江苏",
          ecitysim: "黑龙江",
        },
        {
          val: 33,
          blat: [119.8586, 32.915],
          elon: [110.5977, 41.3408],
          bcitysim: "江苏",
          ecitysim: "内蒙古",
        },
        {
          val: 33,
          blat: [119.8586, 32.915],
          elon: [101.0652, 24.6807],
          bcitysim: "江苏",
          ecitysim: "云南",
        },
        {
          val: 33,
          blat: [119.8586, 32.915],
          elon: [86.9023, 41.148],
          bcitysim: "江苏",
          ecitysim: "新疆",
        },
        {
          val: 33,
          blat: [86.9023, 41.148],
          elon: [110.5977, 41.3408],
          bcitysim: "新疆",
          ecitysim: "内蒙古",
        },
        {
          val: 33,
          blat: [86.9023, 41.148],
          elon: [102.9199, 30.1904],
          bcitysim: "新疆",
          ecitysim: "四川",
        },
      ];
      //循环拿到处理好的数据
      for (var i = 0; i < lineData.length; i++) {
        province.push(lineData[i].bcitysim); //存进去每个省的名字
        province.push(lineData[i].ecitysim); //存进去每个省的名字
        res.push({
          fromName: lineData[i].bcitysim, //发射的省名，保存用于弹框显示
          toName: lineData[i].ecitysim, //接收的省名，保存用于弹框显示
          coords: [
            lineData[i].blat, //发射
            lineData[i].elon, //接收
          ],
          count: lineData[i].val, //数据
        });
      }
      let index_data = new Set(province); //把省的名字去重
      let data_res = []; //定义一个新的变量存放省的坐标

      //注意这里一定要用name和value的形式。不是这个格式的散点图显示不出来
      index_data.forEach((item) => {
        data_res.push({
          name: item, //每个省的名字
          value: chinaGeoCoordMap[item], //每个省的坐标
        });
      });
      //循环往series内添加配置项
      series.push(
          {
            //射线效果图层
            type: "lines", //类型：射线
            zlevel: 1, //类似图层效果
            effect: {
              show: true, //是否显示图标
              symbol: "arrow", //箭头图标
              symbolSize: 5, //图标大小
              trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
            },
            label: {
              show: true,
            },
            lineStyle: {
              color: "#fff",
              normal: {
                color: "#00A0FF",
                width: 1, //尾迹线条宽度
                opacity: 0.5, //尾迹线条透明度
                curveness: 0.1, //尾迹线条曲直度
              },
            },
            //提示框信息
            tooltip: {
              formatter: function (param) {
                return (
                    param.data.fromName +
                    ">" +
                    param.data.toName +
                    "<br>数量：" +
                    param.data.count
                );
              },
            },
            data: res, //拿到射线的起始点和结束点
          },
        //点击高亮
          {
            type: "map",
            mapType: "china",
            zlevel: 1,
            roam: true,
            geoIndex: 0,
            tooltip: {
              show: true,
            },
            itemStyle: {
              areaColor: "#00196d",
              borderColor: "#0a53e9",
            },
            emphasis: {
              show: true,
              label: {
                normal: {
                  show: true, // 是否显示对应地名
                  textStyle: {
                    color: "#fff",
                  },
                },
              },
              itemStyle: {
                areaColor: "#00196d",
                borderColor: "#0a53e9",
              },
            },
          }
      );
      //配置
      let option = {
        legend: {
          show: true,
          selected: {},
          x: "left",
          orient: "vertical",
          textStyle: {
            color: "white",
          },
          data: [],
        },
        //鼠标移上去的弹框
        tooltip: {
          trigger: "item",
          show: true,
        },
        //geo：这是重点
        geo: {
          map: "china", //中国地图
          zoom: 1.2, //缩放倍数
          roam: false, //是否允许缩放和拖拽地图
          label: {
            normal: {
              show: true, // 是否显示省份名字，现在是隐藏的状态，因为和散点图的名字重叠了。如果需要就true
              textStyle: {
                //名字的样式
                color: "#fff",
              },
            },
            emphasis: {
              show: true,
            },
          },
          //地图样式
          itemStyle: {
            normal: {
              borderColor: "#293171", //地图边框颜色
              borderWidth: "2", //地图边框粗细
              areaColor: "#0A0F33", //地图背景色
            },
            //省份地图阴影
            emphasis: {
              areaColor: null,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowBlur: 20,
              borderWidth: 0,
              shadowColor: "#fff",
            },
          },
        },
        series: series, //图表配置
      };
      mapChart.setOption(option); //生成图表
    },
    //玫瑰饼图
    Rose_diagram(keyValuePairs) {
      let mapChart = this.$echarts.init(
          document.getElementById("Rose_diagram")
      ); //图表初始化，china-map是绑定的元素
      window.onresize = mapChart.resize; //如果容器变大小，自适应从新构图
      let option = {
        color: [
          "#37a2da",
          "#32c5e9",
          "#9fe6b8",
          "#ffdb5c",
          "#ff9f7f",
          "#fb7293",
          "#e7bcf3",
          "#8378ea",
        ],
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)",
        },
        toolbox: {
          show: true,
        },
        calculable: true,
        legend: {
          orient: "horizontal",
          icon: "circle",
          bottom: 0,
          x: "center",
          data: keyValuePairs,
          textStyle: {
            color: "#fff",
          },
        },
        series: [
          {
            name: "交房率",
            type: "pie",
            radius: [10, 60],
            roseType: "area",
            center: ["50%", "50%"],

            data: keyValuePairs,
          },
        ],
      };
      mapChart.setOption(option); //生成图表
    },
  },
};
</script>

<style lang="scss">
//全局样式部分！！！！
* {
  margin: 0px;
  padding: 0px;
  list-style-type: none;
  outline: none;
  box-sizing: border-box;
}
html {
  margin: 0;
  padding: 0;
}
body {
  overflow: hidden;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.2em;
  background-color: #f1f1f1;
  margin: 0;
  padding: 0;
  position: absolute;
}
a {
  color: #343440;
  text-decoration: none;
}
//.el-main{
//  padding-top: 0;
//  padding-left: 0;
//}
.bg {
  transform: scale(1); /* 初始缩放因子为1 */
  transition: transform 0.3s ease; /* 添加过渡效果，使缩放平滑 */
  //整体页面背景
  width: 100%;
  height: 100%;
  background-image: url("../assets/789.jpg"); //背景图
  background-attachment: fixed;
  background-size: cover; //背景尺寸
  background-position: center center; //背景位置
}
//页面样式部分！！！！
#index {
  transform-origin: top left; /* 设置缩放基准点 */
  transform: scale(0.8); /* 设置缩放因子 */
  transition: transform 0.3s ease; /* 添加过渡效果，使缩放平滑 */
  color: #d3d6dd;
  width: 100%;
  height: 100%;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  //顶部右边装饰效果
  .title_left {
    width: 100%;
    height: 50px;
    margin: 0 auto;
  }

  .user_skills{
    background-color: transparent;
  }
  .user_skills  .el-table--fit{
    padding: 20px;
  }
  .user_skills  .el-table, .el-table__expanded-cell {
    background-color: transparent;
  }

  .user_skills  .el-table tr {
    background-color: transparent!important;
  }
  .user_skills  .el-table--enable-row-transition .el-table__body td, .el-table .cell{
    background-color: transparent;
  }
  .el-table::before {//去除底部白线
    left: 0;
    bottom: 0;
    width: 100%;
    height: 0px;
  }

  //顶部左边装饰效果
  .title_right {
    width: 100%;
    height: 50px;
    margin-top: 18px;
  }
  //顶部中间装饰效果
  .title_center {
    width: 100%;
    height: 50px;
  }
  //顶部中间文字数据可视化系统
  .title_text {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin-top: 14px;
    color: #008cff;
  }
  //时间日期
  .title_time {
    position: relative;
    top: 10px;
    width: 100%;
    text-align: center;
    color: #008cff;
    z-index: 1000;
  }
  //中国地图
  #china-map {
    height: 660px;
    width: 100%;
  }
  //中间折线图
  .line_center {
    width: 100%;
    height: 288px;
  }
  //左1模块
  .left_box1 {
    height: 310px;
    width: 100%;
    margin-bottom: 10px;
    position: relative;
  }
  //左2模块
  .left_box2 {
    height: 310px;
    width: 100%;
    margin-bottom: 10px;
  }
  //左3模块
  .left_box3 {
    height: 310px;
    width: 100%;

  }
  //右1模块
  .right_box1 {
    height: 310px;
    width: 100%;
    margin-bottom: 10px;
  }
  //右2模块
  .right_box2 {
    height: 310px;
    width: 100%;
    margin-bottom: 10px;
  }
  //右3模块
  .right_box3 {
    height: 310px;
    width: 100%;
  }
  //左1模块-玫瑰饼图
  #Rose_diagram {
    height: 100%;
    width: 100%;
    padding-top: 45px;
    display: block;
  }
  //左1模块-圆环图
  //.left_box1_rose_right {
  //  height: 85%;
  //  width: 55%;
  //  position: relative;
  //  right: 0;
  //  top: 0;
  //}
  //左1模块-文字部分
  .rose_text {
    display: inline-block;
    margin-top: 4%;
    margin-left: 4%;
  }
  // 左1模块-￥符号样式
  .coin {
    font-size: 20px;
    color: #ffc107;
  }
  //左1模块-（件）样式
  .colorYellow {
    color: yellowgreen;
  }
  //左1模块-数字样式
  .rose_text_nmb {
    font-size: 20px;
    color: #00b891;
  }
  //左2模块 柱状图
  #columnar {
    height: 97%;
    width: 95%;
    margin-left: 3%;
    margin-top: 5px;
  }
  //折线图
  #line_center_diagram {
    height: 100%;
    width: 100%;
  }
  //轮播表格
  .carousel_list {
    width: 96%;
    height: 98%;
    margin-left: 10px;
  }
  //虚线柱状图
  #dotter_bar {
    width: 100%;
    height: 100%;
  }
  //锥形图
  .cone_box {
    width: 95%;
    height: 97%;
    margin-left: 3%;
  }
}
#index::-webkit-scrollbar {
  width: 0;
}
</style>

