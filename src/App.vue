<template>
  <div id="app">
    <header>
      <div class="logo">返回</div>
      <div class="title">豫光金铅视频监测平台</div>
      <!-- <div class="setting" @click="showSetting = true">设置</div> -->
      <div class="time">{{ time }}</div>
      <div class="user">
        <el-popconfirm title="确定要保存吗" @confirm="onConfirm">
          <el-button slot="reference">保存修改</el-button>
        </el-popconfirm>
      </div>
    </header>
    <section>
      <div :class="calssLeft == true ? 'left' : 'left1'">
        <div>
          <el-tree
            ref="tree"
            :data="treeData"
            show-checkbox
            node-key="indexCode"
            :check-strictly="false"
            :expand-on-click-node="true"
            @check="onTreeCheckChange"
          >
          </el-tree>
        </div>
        <div class="left-biaoqian" @click="leftBiaoqian">
          设<br />备<br />树
        </div>
      </div>
      <div class="right">
        <div
          ref="cameraSection"
          :class="alarmShow == true ? 'camera1' : 'camera'"
        >
          <div
            v-for="(child, index) in playList"
            :key="index"
            class="single-camera"
            :style="style"
          >
            <video-player
              class="vjs-custom-skin"
              :options="playUrl[index]"
              controls
              munted
              style="object-fit: fill"
            ></video-player>
          </div>
        </div>
        <div :class="alarmShow == true ? 'alarm1' : 'alarm'">
          <ul class="header">
            <li>
              <span class="index">序号</span>
              <span class="text">区域</span>
              <span class="text">设备名称</span>
              <span class="text">报警类型</span>
              <span class="text">报警时间</span>
              <span class="detail">操作</span>
              <i class="btnShow" @click="alarmShowBtn"
                ><span v-if="alarmShow == false">显示▴</span
                ><span v-if="alarmShow == true">隐藏▾</span></i
              >
            </li>
          </ul>
          <vue-seamless-scroll
            :data="tableData"
            :class-option="{ step: 0.5, limitMoveNum: 4 }"
            class="seamless-warp"
          >
            <ul class="item">
              <li v-for="(item, index) in tableData" :key="item.alarmId">
                <span class="index" v-text="index + 1"></span>
                <span class="text" v-text="item.regionName"></span>
                <span class="text" v-text="item.deviceName"></span>
                <span class="text" v-if="item.alarmType == '01'">入侵</span>
                <span class="text" v-else-if="item.alarmType == '02'"
                  >烟雾</span
                >
                <span class="text" v-else-if="item.alarmType == '03'"
                  >烟火</span
                >
                <span class="text" v-else-if="item.alarmType == '04'"
                  >安全帽</span
                >
                <span class="text" v-else>其他</span>
                <span class="text">{{
                  $common.getTime("YYYY-mm-dd HH:MM:SS", item.alarmTime)
                }}</span>
                <span class="detail" @click="handle(index, item)">详情</span>
              </li>
            </ul>
          </vue-seamless-scroll>
        </div>
      </div>
    </section>
    <el-drawer
      title="报警详情"
      :visible.sync="dialogVisible"
      direction="rtl"
      :close-on-press-escape="true"
      :show-close="true"
      :before-close="handleClose"
      size="20%"
    >
      <div class="drawer-content">
        <div class="image">
          <el-image
            style="width: 100%"
            :src="imageUrl"
            :preview-src-list="imageUrlList"
          >
          </el-image>
        </div>
        <div class="content">
          <el-table :data="singleAlarmTable" style="width: 100%" border>
            <el-table-column prop="param"></el-table-column>
            <el-table-column prop="param1"></el-table-column>
          </el-table>
        </div>
      </div>
    </el-drawer>
    <Setting v-if="showSetting" @back="showSetting = false"></Setting>
  </div>
</template>

<script>
import { videoPlayer } from "vue-video-player";
import "videojs-contrib-hls";
import "video.js/dist/video-js.css";
import vueSeamlessScroll from "vue-seamless-scroll";
import Setting from "./pages/Setting";
export default {
  name: "app",
  data() {
    return {
      time: "",
      timer: null,
      playid:[],
      timer1: null,
      playList: [],
      calssLeft: true,
      alarmShow: false,
      resourceCheckedKey: [],
      num: 15,
      playUrl: [],
      videoRatio: 15 / 8,
      scale: 1,
      treeData: [
        {
          id: 1,
          label: "柿槟厂区",
          url: "",
          disabled: true,
          children: [
            {
              indexCode: 4801,
              id:27.2,
              code:'565415caac',
              label: "二门岗2",
              url: "",
            },
            {
              indexCode: 4802,
              id:27.2,
              code:'565415caac',
              label: "虚拟",
              url: "",
            },
          ],
        },
        {
          id: 1,
          label: "玉川铜厂",
          url: "",
          disabled: true,
          children: [
            {
              indexCode: 4803,
              label: "二门岗2",
              url: "",
            },
            {
              indexCode: 4804,
              label: "虚拟",
              url: "",
            },
          ],
        },
        {
          id: 1,
          label: "冶炼一厂",
          url: "",
          disabled: true,
          children: [
            {
              id: 4805,
              label: "二门岗2",
              url: "",
            },
            {
              id: 48026,
              label: "虚拟",
              url: "",
            },
          ],
        },
      ],
      tableData: [],
      dialogVisible: false,
      imageUrl: "", /// https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg'
      imageUrlList: [], // ['https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg']
      singleAlarmTable: [
        {
          param: "区域",
          param1: "区域一",
        },
        {
          param: "设备名称",
          param1: "设备一",
        },
        {
          param: "报警类型",
          param1: "严重告警",
        },
        {
          param: "报警时间",
          param1: "2020-09-03 17:08",
        },
        {
          param: "事件描述",
          param1: "未佩戴安全帽",
        },
      ],
      socket: null,
      playerOptions: {
        language: "zh-CN",
        autoplay: true,
        loop: false, // 导致视频一结束就重新开始。
        muted: true, // 默认情况下将会消除任何音频。
        preload: "auto", // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        aspectRatio: "15:8", // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [
          {
            type: "application/x-mpegURL",
            src: "", // http://192.168.137.1:10000/4801.m3u8
            // src: 'http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8'
          },
        ],
        hls: true,
        notSupportedMessage: "此视频暂无法播放，请稍后再试", //允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controls: true,
        controlBar: {
          currentTimeDisplay: true,
          timeDivider: true,
          durationDisplay: true,
          remainingTimeDisplay: false,
          fullscreenToggle: true, //全屏按钮
        },
      },
      showSetting: false,
    };
  },
  components: {
    videoPlayer,
    vueSeamlessScroll,
    Setting,
  },

  //监听num变化
  watch: {
    num: {
      handler(val, oldval) {
        if (oldval != 15) {
          if (oldval > val) {
            console.log(this.playList,localStorage.getItem("id"),index)
            let index = this.playList.indexOf(localStorage.getItem("id"));
            this.playList.splice(index, 1);
            this.playUrl.splice(index, 1);
          } else {
            this.getUrl(
              localStorage.getItem("id"),
              localStorage.getItem("code"),
              localStorage.getItem("indexCode")
            );
          }
        }
      },
    },
  },
  methods: {
    leftBiaoqian() {
      this.calssLeft = !this.calssLeft;
      // console.log(this.calssLeft,'1111111111111')
    },
    alarmShowBtn() {
      this.alarmShow = !this.alarmShow;
    },
    getTreeData() {
      this.$http.get("ssjk/getSBDetail?jqId=27.2").then((res) => {
        if (res.data.code == 200) {
          this.treeData[0].children = [];
          res.data.data.map((item, index) => {
            this.treeData[0].children.push({
              code: 27.2,
              id: item.indexCode,
              indexCode: index + 28.2,
              label: item.name,
            });
          });
        }
      }),
        this.$http.get("ssjk/getSBDetail?jqId=27.3").then((res) => {
          // console.log(res,'树状图数据')
          if (res.data.code == 200) {
            this.treeData[1].children = [];
            res.data.data.map((item, index) => {
              this.treeData[1].children.push({
                code: 27.3,
                indexCode: index + 28.3,
                id: item.indexCode,
                label: item.name,
              });
            });
          }
        });
      this.$http.get("ssjk/getSBDetail?jqId=27.4").then((res) => {
        // console.log(res,'树状图数据')
        if (res.data.code == 200) {
          this.treeData[2].children = [];
          res.data.data.map((item, index) => {
            this.treeData[2].children.push({
              code: 27.4,
              indexCode: index + 28.4,
              id: item.indexCode,
              label: item.name,
            });
          });
        }
      });
      // console.log(this.treeData);
      // this.resourceCheckedKey=[28.4,29.4]
    },
    setRootFontSize() {
      document.getElementsByTagName("html")[0].style.fontSize =
        (document.body.clientWidth / 1920) * 100 + "px";
    },
    getNowTime() {
      this.time = this.$common.getTime("YYYY.mm.dd HH:MM");
    },
    handleClose() {
      this.dialogVisible = false;
    },
    indexOf(arr, item) {
      return arr.indexOf(item); // 直接返回index下标
    },
    onTreeCheckChange(a, b) {
      let node = b.checkedNodes;
      if (node.length > 9) {
        this.$refs.tree.setChecked(a, false);
        this.$message({
          message: "当前最多支9个视频",
          duration: 2000,
        });
        return;
      } else {
        console.log(a.id,111111111111111);
        this.num = node.length;
        localStorage.removeItem("id");
        localStorage.removeItem("code");
        localStorage.removeItem("indexCode");
        localStorage.setItem("id", a.id);
        localStorage.setItem("code", a.code);
        localStorage.setItem("indexCode", a.indexCode);
      }
    },
    getUrl(id, code, indexCode) {
      this.$http
        .get("ssjk/getPreviewURLs", {
          params: {
            indexCode: id,
            protocol: "hls",
            jqId: code,
          },
        })
        .then((res) => {
          this.playList.push(id);
          this.playUrl.push(this.$common.deepCopy(this.playerOptions));
          let arr = this.$common.deepCopy(this.playUrl);
          arr[this.playUrl.length - 1].sources[0].src = res.data.data.url;
          this.playUrl = arr;
          this.getAlarm();
        });
    },
    getAlarm() {
      // this.$http.get('/alarmrecode/getCurrent').then(res => {
      //   this.tableData = res.data;
      // });
    },
    onConfirm() {
      // console.log(1);
      this.$http
        .get(`SPClickSave/SPClickSave?pl=1&name=${this.playList}`)
        .then((res1) => {
          if (res1.data.code == 200) {
            this.$message({
              message: "配置保存成功",
              type: "success",
              duration: 1500,
              offset: 80,
            });
          }
        });
    },
  },
  created() {
    this.getTreeData();
    this.setRootFontSize();
    this.getNowTime();
    this.getAlarm();
    window.addEventListener("resize", this.setRootFontSize);
    this.timer = setInterval(() => {
      this.getNowTime();
    }, 1000);
    this.timer1 = setInterval(() => {
      this.getAlarm();
    }, window.getAlarmTime);
  },
  computed: {
    style() {
      if (!this.$refs.cameraSection) return {};
      let width = this.$refs.cameraSection.clientWidth;
      let height = this.$refs.cameraSection.clientHeight;
      let i = 0;
      let j = 1;
      while (i < this.playList.length) {
        i = Math.floor((width / (height * this.videoRatio)) * j) * j;
        if (
          this.playList.length >
            Math.floor(width / (height * this.videoRatio)) &&
          this.playList.length <=
            Math.floor((width / (height * this.videoRatio)) * 2) + 1
        ) {
          this.scale = Math.floor((width - 1) / this.playList.length) / 1280;
          return {
            height:
              Math.floor((width - 1) / this.playList.length / this.videoRatio) +
              "px",
            width: Math.floor((width - 1) / this.playList.length) + "px",
          };
        }
        if (i < this.playList.length) {
          j++;
        }
      }
      this.scale = Math.floor((height / j) * this.videoRatio) / 1280;
      return {
        height: Math.floor(height / j) + "px",
        width: Math.floor((height / j) * this.videoRatio) + "px",
        // margin:'0 auto',
        // 'margin-bottom':'4px',
      };
    },
  },
  mounted() {
    this.$http
      .get(
        "SPClickSave/SPClickSave?pl=2"
      )
      .then((res2) => {
        if (res2.data.code == 200) {
             this.treeData.map(item=>{
               item.children.map(item1=>{
                 for(let index in res2.data.data){
                   if(item1.id == res2.data.data.split(",")[index]){
                     this.playid.push(item1.indexCode )
                   }
                 }
               })
             })
             console.log(this.playid);
          // this.resourceCheckedKey = res2.data.data.split(",").map(Number).reverse();
          this.resourceCheckedKey =  this.playid
          setTimeout(() => {
            this.$refs.tree.setCheckedKeys(this.resourceCheckedKey);
            this.num = this.$refs.tree.getCheckedNodes().length ;
            for (let index in this.$refs.tree.getCheckedNodes()) {
              this.getUrl(this.$refs.tree.getCheckedNodes()[index].id,this.$refs.tree.getCheckedNodes()[index].code,this.$refs.tree.getCheckedNodes()[index].indexCode)
            }
          }, 1000);
        }
      });
  },
};
</script>

<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
html {
  font-size: 100px;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

body {
  font-size: 14px;
}

* {
  outline: none;
}

span {
  border: none;
}

.el-checkbox__input.is-disabled {
  display: none;
}

.single-camera {
  padding: 2px;
  // border: #179a16 1px solid;
  // margin-left: 4px;
  // width: 100%;
  // height: 100%;
  // position: relative;
}

.vjs-custom-skin {
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.mask-box {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.mask {
  width: 50px;
  height: 30px;
  border: 2px solid red;
  z-index: 100;
  top: 50px;
  left: 100px;
  position: absolute;
}

#app {
  width: 100%;
  height: 100%;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  font-size: 0.14rem;
  background-color: #fff;
  overflow: hidden;
  position: relative;

  header {
    width: 100%;
    height: 0.55rem;
    display: flex;
    align-items: center;
    padding: 0 0.1rem;
    box-sizing: border-box;
    border-bottom: solid 2px #ebeff7;
    position: relative;

    .logo {
      width: 0.8rem;
      text-align: center;
      cursor: pointer;
      img {
        width: 1.75rem;
      }
    }

    .title {
      margin-left: 0.2rem;
      font-size: 0.18rem;
      font-family: "Microsoft YaHei";
      font-weight: 600;
      color: #2f94d5;
      font-size: 22px;
    }

    .setting {
      width: 1.5rem;
      height: 100%;
      border: solid 2px #ebeff7;
      line-height: 0.55rem;
      margin-left: 0.5rem;
      cursor: pointer;
    }

    .time {
      width: 2rem;
      height: 100%;
      position: absolute;
      right: 1.5rem;
      font-weight: bold;
      line-height: 0.55rem;
      color: #465c85;
      font-size: 0.16rem;
    }

    .user {
      width: 1.5rem;
      height: 100%;
      position: absolute;
      right: 0;
      border-left: solid 2px #ebeff7;
      line-height: 0.55rem;
      cursor: pointer;
    }
  }

  section {
    width: 100%;
    height: calc(100% - 0.55rem);
    display: flex;
    justify-content: space-between;
    // align-items: center;
    text-align: center;
    .left1 {
      transition: left 0.8s;
      -webkit-transition: left 0.8s;
      width: 2.45rem;
      height: 100%;
      position: absolute;
      left: -2.45rem;
      .left-biaoqian {
        position: absolute;
        top: 46%;
        right: -0.25rem;
        border: 1px solid red;
        width: 0.25rem;
        background: #fff;
        border-radius: 4px;
        cursor: pointer;
      }
    }
    .left {
      width: 2.45rem;
      height: 100%;
      position: relative;
      transition: left 0.8s;
      -webkit-transition: left 0.8s;
      left: 0rem;
      > div:first-child {
        width: 2.45rem;
        height: 100%;
        overflow: auto;
      }
      div::-webkit-scrollbar {
        width: 5px;
        height: 5px;
        /**/
      }
      div::-webkit-scrollbar-track {
        background: rgb(239, 239, 239);
        border-radius: 2px;
      }
      div::-webkit-scrollbar-thumb {
        background: #bfbfbf;
        border-radius: 10px;
      }
      div::-webkit-scrollbar-thumb:hover {
        background: #333;
      }
      div::-webkit-scrollbar-corner {
        background: #179a16;
      }
      .left-biaoqian {
        position: absolute;
        top: 46%;
        right: -0.25rem;
        border: 1px solid red;
        width: 0.25rem;
        background: #fff;
        border-radius: 4px;
        cursor: pointer;
      }
    }

    .right {
      // width: calc(100% - 2.45rem);
      // width: 100%;
      // text-align: center;
      flex: 1;
      height: 100%;
      background-color: #e7e9f1;
      padding: 0.3rem;
      // position: relative;

      .camera {
        width: 100%;
        // height: calc(100% - 0.6rem - 40px);
        height: calc(100% - 40px);
        background-color: #fff;
        border-radius: 0;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        overflow: hidden;
        align-content: center;
      }
      .camera1 {
        width: 100%;
        // height: calc(100% - 0.6rem - 160px);
        height: 100%;
        background-color: #fff;
        border-radius: 0;
        display: flex;
        flex-wrap: wrap;
        // align-content: flex-start;
        overflow: hidden;
        align-content: center;
      }

      .alarm {
        width: 100%;
        height: 40px;
        background-color: #fff;
        margin-top: 0.2rem;
        border-radius: 0;
        overflow: hidden;
      }
      .alarm1 {
        width: 100%;
        height: 160px;
        background-color: #fff;
        margin-top: 0.2rem;
        border-radius: 0;
        overflow: hidden;
      }
    }
  }

  .drawer-content {
    width: 100%;
    padding: 0 0.2rem 0.4rem 0.2rem;
    box-sizing: border-box;

    .image {
      width: 100%;
      margin-bottom: 0.2rem;
    }

    .content {
      .el-table thead {
        display: none;
      }
    }
  }

  .seamless-warp {
    width: 100%;
    height: 120px;
    overflow: hidden;
    border-bottom: 1px solid #ebeef5;
    line-height: 40px;
    position: relative;
  }

  ul {
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0;
    margin-inline-end: 0;
    padding-inline-start: 0;
    height: auto;
    &.header {
      border-top: 1px solid #ebeef5;
      font-weight: 700;
      color: #909399;

      li {
        border-bottom: 1px solid #ebeef5;
      }
    }
  }

  li {
    height: 40px;
    list-style-type: none;
    display: flex;
    border-bottom: 1px solid #ebeef5;
    /*&:last-child {*/
    /*  border-bottom-width: 0;*/
    /*}*/
    span {
      display: inline-block;
      line-height: 40px;
      text-align: left;
      padding-left: 8px;

      &:first-child {
        border-left: 1px solid #ebeef5;
      }

      border-right: 1px solid #ebeef5;
    }

    .index {
      width: 60px;
    }

    .text {
      flex: 1;
    }

    .detail {
      flex: 1;
      cursor: pointer;
    }
    .btnShow {
      width: 0.6rem;
      color: red;
      text-align: center;
    }
  }
}
</style>
