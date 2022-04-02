<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import { hotKeyword } from '@/api/system/firstpage'
const animationDuration = 6000

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null,
      xData: ['', '', '', '', ''],
      yData: [0, 0, 0, 0, 0]
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      hotKeyword().then(res => {
        console.log('hotKeyword', res);
        this.chart = echarts.init(this.$el, 'macarons')
        this.xData = res.data[0]
        this.yData = res.data[1]
        this.chart.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: { // 坐标轴指示器，坐标轴触发有效
              type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          title: {
            text: '热门搜索',
            textStyle: {
              color: 'black',
              // fontWeight: 'bold'
            }
          },
          grid: {
            top: 40,
            left: '2%',
            right: '2%',
            bottom: '3%',
            containLabel: true
          },
          itemStyle: {
            // 树状的颜色
            color: 'skyblue'
          },
          xAxis: [{
            type: 'category',
            data: this.xData,
            axisTick: {
              alignWithLabel: true
            }
          }],
          yAxis: [{
            type: 'value',
            axisTick: {
              show: false
            }
          }],
          series: [{
            type: 'bar',
            stack: 'vistors',
            barWidth: '45%',
            data: this.yData,
            animationDuration
          }]
        })
      })
    }
  }
}
</script>
