<template>
  <div class="dashboard-container">
    <panel-group />
    <el-row :gutter="32">
      <!-- 不同类型垃圾的搜索次数总和，keyword_hot.keyword = garbage_store.garbage_name -->
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
      <!-- hotKeyword 热门搜索的最多6条数据 -->
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <bar-chart />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup';
import PieChart from './components/PieChart';
import BarChart from './components/BarChart';
// import { getWeekDayData } from '@/api/system/firstpage';

// const lineChartData = {
//   newVisitis: {
//     expectedData: [1, 10, 11, 8, 7, 9, 6],
//     actualData: [0, 0, 0, 0, 0, 0, 0]
//   },
//   messages: {
//     expectedData: [1, 4, 5, 3, 4, 3, 4],
//     actualData: [0, 0, 0, 0, 0, 0, 0]
//   },
//   purchases: {
//     expectedData: [80, 100, 121, 104, 105, 90, 100],
//     actualData: [0, 0, 0, 0, 0, 0, 0]
//   },
//   shoppings: {
//     expectedData: [13, 14, 14, 14, 14, 15, 16],
//     actualData: [0, 0, 0, 0, 0, 0, 0]
//   }
// }

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    PieChart,
    BarChart
  },
  data() {
    return {
      lineChartData: {}
    }
  },
  created() {
    // this.getWeekDayData();
  },
  methods: {
    // getWeekDayData() {
    //   getWeekDayData().then(res => {
    //     console.log('getWeekDayData', res);
    //     lineChartData.newVisitis.actualData = res.data[0];
    //     lineChartData.messages.actualData = res.data[1];
    //     lineChartData.shoppings.actualData = res.data[2];
    //   })
    // },
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 32px;
  background-color: #f2f2f2;
  position: relative;
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
  }
}
</style>
