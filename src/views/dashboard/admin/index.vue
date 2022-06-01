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
