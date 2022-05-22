<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-row>
        <el-col :span="8">
          <el-form-item prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入用户姓名"
              clearable
              size="small"
              style="width: 240px"
              suffix-icon="el-icon-search"
              @keyup.native.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item prop="phone">
            <el-input
              v-model="queryParams.oneKeyword"
              placeholder="请输入关键字"
              clearable
              size="small"
              style="width: 240px"
              suffix-icon="el-icon-search"
              @keyup.native.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" style="text-align: right">
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery" style="width: 90px">搜索</el-button>
            <!-- <el-button type="primary" icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button> -->
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-table v-loading="loading" border :data="imageTableList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="总关键字">
              <span>{{ props.row.allKeyword }}</span>
            </el-form-item>
          </el-form>
          <el-form label-position="left">
            <el-form-item label="总结果">
              <span>{{ allResult(props.row) }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="图片" align="center" prop="filepath">
        <template slot-scope="scope">
          <img class="logoImg" :src="scope.row.filepath">
        </template>
      </el-table-column>
      <el-table-column label="关键字" align="center" prop="oneKeyword" />
      <el-table-column label="结果" align="center" prop="oneResult" :formatter="resultFormatter" />
      <el-table-column label="创建时间" align="center" prop="times" :formatter="timeFormatter" />
    </el-table>

    <div class="packaged-pagination">
      <span class="packaged-pagination__total" :total="total">共 {{ total }} 条</span>
      <el-pagination
        :current-page="queryParams.pageNum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script>
import { listImageForPage } from '@/api/recognition/image';
import moment from 'moment';
const types = [
  {
    index: 1,
    name: '干垃圾'
  },
  {
    index: 2,
    name: '湿垃圾',
  },
  {
    index: 3,
    name: '可回收物',
  },
  {
    index: 4,
    name: '有害垃圾',
  }
]
export default {
  data() {
    return {
      loading: false,
      ids: [],
      single: true,
      multiple: true,
      total: 0,
      imageTableList: [],
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        oneKeyword: undefined,
        userName: undefined
      }
    }
  },
  created() {
    this.getImageList();
  },
  computed: {
    allResult() {
      return function(row) {
        const allResult = JSON.parse(row.allResult).map(item => {
          let type = '';
          types.forEach(myType => {
            if (myType.index === item.garbageType) {
              type = myType.name;
            }
          });
          return {
            name: item.garbageName,
            type
          }
        })
        return allResult;
      }
    }
  },
  methods: {
    getImageList() {
      this.loading = true;
      listImageForPage(this.addDateRange(this.queryParams, this.dateRange)).then(res => {
        console.log('imageClassify', res);
        this.imageTableList = res.data;
        this.total = res.total;
        this.loading = false;
      })
    },
    handleQuery() {
      this.getImageList();
    },
    resetQuery() {
      this.resetForm('queryForm');
      this.dateRange = [];
      this.getImageList();
    },
    handleSizeChange(value) {
      this.queryParams.pageSize = value;
      this.getImageList();
    },
    handleCurrentChange(value) {
      this.queryParams.pageNum = value;
      this.getImageList();
    },
    resultFormatter(row) {
      // console.log('111', row);
      let oneResult = 'null';
      if (row.allResult !== 'null' && row.allResult !== '[]') {
        // console.log(222, JSON.parse(row.allResult))
        const type = JSON.parse(row.allResult)[0].garbageType;
        types.forEach(item => {
          if (item.index === type) {
            oneResult = item.name;
          }
        })
      }
      return oneResult;
    },
    timeFormatter(row) {
      // console.log('time', row.times);
      const times = moment(row.times).subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss');
      return times;
    }
  }
}
</script>

<style lang="scss">
.packaged-pagination {
  height: 50px;
  padding: 8px;
  width: 100%;
  color: black;
  .el-pagination {
    float: right;
    .el-pagination__total {
      display: none;
    }
  }
}
</style>

<style lang="scss" scoped>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
.logoImg {
  width: 50px;
  height: auto;
  max-height: 100px;
}
.packaged-pagination {
  &::after {
    content: '';
    clear: both;
  }
  &__total {
    font-size: 13px;
    display: inline-block;
    line-height: 34px;
    height: 34px;
  }
}
</style>
