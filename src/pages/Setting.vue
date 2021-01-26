<template>
  <div class="setting">
    <el-page-header @back="goBack" content="告警设置" style="margin: 0 0 10px 10px"></el-page-header>
    <div class="content">
      <div class="left">
        <el-tree ref="tree" :data="treeData" node-key="id" default-expand-all
                 highlight-current @node-click="onTreeClick">
        </el-tree>
<!--        <div v-show="isDraw" class="mask"></div>-->
      </div>
      <div class="right">
        <div class="right-mask" v-show="id == 'root'">请选择摄像头-</div>
        <div class="top">
          <el-radio-group v-model="alarmTypeName" @change="onTypeChange">
            <el-radio-button label="入侵报警"></el-radio-button>
            <el-radio-button label="烟雾报警"></el-radio-button>
            <el-radio-button label="烟火报警"></el-radio-button>
            <el-radio-button label="安全帽报警"></el-radio-button>
          </el-radio-group>
          <el-button v-show="!isDraw" type="primary" @click="editCanvas" style="margin-left: 10px">编辑</el-button>
          <el-button v-show="isDraw" type="primary" @click="saveCanvas" style="margin-left: 10px">保存</el-button>
          <el-button v-show="isDraw" type="primary" @click="backCanvas">返回</el-button>
        </div>
        <div class="bottom">
          <div ref="camera" class="camera" :style="{width: cameraWidth + 'px'}">
            <video-player class="vjs-custom-skin" :options="playerOptions"></video-player>
            <div class="mask-box">
              <canvas id="myCanvas" :width="canvasWidth" :height="canvasHeight" @click="startDraw($event)" @dblclick="endDraw">
                <!--@mousemove="drawMove($event)" @mouseleave="draw = false"-->
                您的浏览器不支持 HTML5 canvas 标签。
              </canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {videoPlayer} from 'vue-video-player';
  import 'videojs-contrib-hls';
  import 'video.js/dist/video-js.css';
  export default {
    name: 'Setting',
    data () {
      return {
        isDraw: false,
        c: null,
        ctx: null,
        points: [],
        isClose: false,
        canvas: null,
        cameraWidth: 600,
        canvasWidth: 100,
        canvasHeight: 100,
        id: 'root',
        alarmTypeName: '入侵',
        alarmType: '01',
        treeData: [
          {
            id: 'root',
            label: '设备树',
            url: '',
            disabled: true,
            children: []
          }
        ],
        videoRatio: 16 / 9,
        scale: 1,
        playRect: [], // 01
        playRect1: [], // 02
        playRect2: [], // 03
        playRect3: [], // 04
        playerOptions: {
          language: 'zh-CN',
          autoplay: true,
          loop: false, // 导致视频一结束就重新开始。
          muted: true, // 默认情况下将会消除任何音频。
          preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
          aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
          fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
          sources: [{
            type: 'application/x-mpegURL',
            src: '', // http://192.168.137.1:10000/4801.m3u8
          }],
          hls: true,
          notSupportedMessage: '此视频暂无法播放，请稍后再试', //允许覆盖Video.js无法播放媒体源时显示的默认信息。
          controls: false,
          controlBar: {
            currentTimeDisplay: false,
            timeDivider: false,
            durationDisplay: false,
            remainingTimeDisplay: false,
            fullscreenToggle: false //全屏按钮
          }
        },
      }
    },
    components: {
      videoPlayer
    },
    methods: {
      startDraw (e) {
        if (!this.isDraw || this.isClose) return;
        if (!this.c) {
          this.c = document.getElementById("myCanvas");
          this.ctx = this.c.getContext("2d");
          this.ctx.lineWidth = 2;
        }
        if (!this.points.length) {
          this.ctx.beginPath();
          this.ctx.moveTo(e.layerX, e.layerY);
          this.points = [[e.layerX, e.layerY]];
        } else {
          this.ctx.lineTo(e.layerX, e.layerY);
          this.ctx.stroke();
          this.points.push([e.layerX, e.layerY]);
          this.ctx.beginPath();
          this.ctx.moveTo(this.points[this.points.length - 1][0], this.points[this.points.length - 1][1]);
        }
      },
      endDraw (e) {
        if (!this.isDraw) return;
        this.ctx.lineTo(e.layerX, e.layerY);
        this.ctx.stroke();
        this.points.push([e.layerX, e.layerY]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[this.points.length - 1][0], this.points[this.points.length - 1][1]);
        this.ctx.lineTo(this.points[0][0], this.points[0][1]);
        this.ctx.stroke();
        this.isClose = true;
      },
      setColor (type) {
        if (type == '01') {
          return 'red';
        } else if (type == '02') {
          return '#e56112';
        } else if (type == '03') {
          return '#204bcb';
        } else {
          return '#6e1de0';
        }
      },
      // drawMove (e) {
      //   if (!this.draw || this.points.length == 0) return;
      //   window.ctx = this.ctx;
      //   window.canvas = this.canvas;
      //   this.ctx.clearRect(0, 0, 600, 400);
      //   // this.ctx.putImageData(this.canvas, 0, 0);
      //
      // },
      initDraw (points, type = '01') {
        if (!this.c) {
          this.c = document.getElementById("myCanvas");
          this.ctx = this.c.getContext("2d");
          this.ctx.lineWidth = 2;
        }
        this.ctx.clearRect(0, 0, this.c.width, this.c.height);
        this.ctx.strokeStyle = this.setColor(type);
        if (!points.length) return;
        this.ctx.beginPath();
        points.forEach((item, index) => {
          if (!index) {
            this.ctx.moveTo(...points[index]);
          } else {
            this.ctx.lineTo(...points[index]);
          }
        });
        this.ctx.closePath();
        this.ctx.stroke();
      },
      goBack () {
        this.$emit('back')
      },
      getTreeData () {
        // let res = {
        //   data: [
        //     {
        //       "indexCode": "4801",	 //摄像头编码或地区编码
        //       "name": "二门岗2", 	  //摄像头名称或地区名称
        //       "parentIndexCode": "-1", //父Id
        //       "isRegion": false,		//是否是地区
        //       "regionName": "厂区",		//地区名称,为地区时字段为空
        //       "leaf": false,			//是否为地区叶子节点
        //       "url": "http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8",  //摄像头取流url，为地区时字段为空
        //       "warningArea": [       //警戒区域
        //         {
        //           "indexcode": "4801",
        //           "alarmType": "01",   //报警类型
        //           "alarmName": "入侵", //报警名称
        //           "waringArea": [100, 300, 400, 600, 400, 550, 600, 660] //警戒区域坐标，分别为 左上角，右上角，右下角，左下												角 ，顺时针排序
        //         },
        //       ]
        //     },
        //     {
        //       "indexCode": "4802",	 //摄像头编码或地区编码
        //       "name": "二门岗21", 	  //摄像头名称或地区名称
        //       "parentIndexCode": "-1", //父Id
        //       "isRegion": false,		//是否是地区
        //       "regionName": "厂区",		//地区名称,为地区时字段为空
        //       "leaf": false,			//是否为地区叶子节点
        //       "url": "http://ivi.bupt.edu.cn/hls/cctv1hd.m3u8",  //摄像头取流url，为地区时字段为空
        //       "warningArea": [       //警戒区域
        //         {
        //           "indexcode": "4801",
        //           "alarmType": "01",   //报警类型
        //           "alarmName": "入侵", //报警名称
        //           "waringArea": [100, 300, 400, 600] //警戒区域坐标，分别为 左上角，右上角，右下角，左下												角 ，顺时针排序
        //         },
        //       ]
        //     },
        //   ]
        // };
        // res.data.forEach(item => {
        //   item.id = item.indexCode;
        //   item.label = item.name;
        // });
        // let data = [
        //   {
        //     id: 'root',
        //     label: '设备树',
        //     url: '',
        //     disabled: true,
        //     children: res.data
        //   }
        // ];
        // this.treeData = data;
        this.$http.get('/devtree/getDevInfo', {
          // params: {
          //   parentIndexCode: 0
          // }
        }).then(res => {
          res.data.forEach(item => {
            item.id = item.indexCode,
            item.label = item.name
          });
          let data = [
            {
              id: 'root',
              label: '设备树',
              url: '',
              disabled: true,
              children: res.data
            }
          ];
          this.treeData = data;
        });
      },
      convertArr (arr) {
        let arr1 = [];
        arr.forEach((item, index) => {
          if (!(index % 2)) {
            arr1.push([Math.floor(item * this.scale), Math.floor(arr[index + 1] * this.scale)]);
          }
        });
        return arr1;
      },
      onTreeClick (data) {
        this.id = data.id;
        this.alarmTypeName = '入侵报警';
        this.alarmType = '01';
        this.playRect = [];
        this.playRect1 = [];
        this.playRect2 = [];
        this.playRect3 = [];
        if (data.id != 'root') {
          data.warningArea.forEach(item => {
            if (item.alarmType == '01') this.playRect = this.convertArr(item.coordinates);
            if (item.alarmType == '02') this.playRect1 = this.convertArr(item.coordinates);
            if (item.alarmType == '03') this.playRect2 = this.convertArr(item.coordinates);
            if (item.alarmType == '04') this.playRect3 = this.convertArr(item.coordinates);
          });
          this.playerOptions.sources[0].src = data.url;
        } else {
          this.playerOptions.sources[0].src = '';
        }
        this.points = [];
        this.isClose = false;
        this.isDraw = false;
        this.initDraw(this.playRect, '01');
      },
      onTypeChange (name) {
        if (name == '入侵报警') {
          this.alarmType = '01';
        } else if (name == '烟雾报警') {
          this.alarmType = '02';
        } else if (name == '烟火报警') {
          this.alarmType = '03';
        } else {
          this.alarmType = '04';
        }
        this.points = [];
        this.isClose = false;
        this.isDraw = false;
        this.initDraw(this['playRect' + (Number(this.alarmType - 1) == 0 ? '' : Number(this.alarmType - 1))], this.alarmType);
      },
      editCanvas () {
        this.initDraw([], this.alarmType);
        this.isDraw = true;
        this.isClose = false;
        this.points = [];
      },
      backCanvas () {
        this.initDraw(this['playRect' + (Number(this.alarmType - 1) == 0 ? '' : Number(this.alarmType - 1))], this.alarmType);
        this.isDraw = false;
        this.isClose = false;
        this.points = [];
      },
      saveCanvas () {
        let isChange = false;
        if (this.points.length && !this.isClose) {
          this.$message.warning('您的输入有误, 暂无法保存');
          return;
        }
        this['playRect' + (Number(this.alarmType - 1) == 0 ? '' : Number(this.alarmType - 1))] = this.$common.deepCopy(this.points);
        
        let {warningArea} = this.$refs.tree.getNode(this.id).data;
        let index = warningArea.findIndex(item => {
          return item.alarmType == this.alarmType;
        });
        if (index == -1 && this.points.length > 0) {
          warningArea.push({
            indexCode: this.id,
            alarmType: this.alarmType,
            alarmName: this.alarmTypeName,
            coordinates: this.points.flat()
          });
          isChange = true;
        } else if (index > -1 && this.points.length > 0) {
          warningArea[index] = {
            indexCode: this.id,
            alarmType: this.alarmType,
            alarmName: this.alarmTypeName,
            coordinates: this.points.flat().map(item => Math.floor(item / this.scale))
          };
          isChange = true;
        } else if (index > -1 && this.points.length == 0) {
          warningArea.splice(index, 1);
          isChange = true;
        }
        this.isDraw = false;
        this.points = [];
        if (isChange) {
          if (this.$refs.tree.getNode(this.id).data.startUp) {
            this.$http.get('startUp', {
              params: {
                indexCode: this.id,
                status: false
              }
            }).then(res => {
              this.$http.post('/devtree/setWaringInfoList', warningArea).then(res => {
                this.$message.success('设置成功');
                this.$http.get('startUp', {
                  params: {
                    indexCode: this.id,
                    status: true
                  }
                })
              });
            });
          } else {
            this.$http.post('/devtree/setWaringInfoList', warningArea).then(res => {
              this.$message.success('设置成功');
            });
          }
        }
      }
    },
    mounted () {
      this.cameraWidth = this.$refs.camera.clientHeight * this.videoRatio;
      this.canvasWidth = this.cameraWidth;
      this.canvasHeight = this.$refs.camera.clientHeight;
      this.scale = this.$refs.camera.clientHeight / 720;
      this.getTreeData();
    }
  }
</script>

<style lang="scss" scoped>
  .setting {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 1000;
    left: 0;
    top: 0;
    background-color: #FFFFFF;
    padding: 0.1rem 0.1rem 0.1rem 0;
    box-sizing: border-box;
    .content {
      width: 100%;
      height: calc(100% - 34px);
      display: flex;
      .left {
        width: 2.4rem;
        height: 100%;
        position: relative;
        .mask {
          z-index: 100;
          top: -100px;
          left: 0;
          bottom: 0;
          right: 0;
          position: absolute;
        }
      }
      .right {
        position: relative;
        &-mask {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          background: #FFF;
        }
      }
      .top {
        display: flex;
        justify-content: center;
      }
      .bottom {
        height: calc(100% - 60px);
        .camera {
          width: 400px;
          position: relative;
          height: calc(100% - 60px);
          margin-top: 20px;
          margin-left: 10px;
          max-height: 600px;
        }
  
        .vjs-custom-skin {
          width: 100%;
          height: 100%;
        }
        
        .mask-box {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1000;
        }
      }
    }
  }
</style>
