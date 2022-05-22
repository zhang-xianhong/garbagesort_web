<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-row>
        <el-col :span="12" style="text-align: left;">
          <el-input
            v-model="queryParams.userName"
            placeholder="请输入用户名称"
            clearable
            size="small"
            style="width: 240px"
            suffix-icon="el-icon-search"
            @keyup.native.enter="filterLoginInfo"
          />
        </el-col>
        <el-col :span="12" style="text-align: right;">
          <el-select
            v-model="queryParams.loginStatus"
            placeholder="请选择登录状态"
            clearable
            size="small"
            style="width: 240px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="filterLoginInfo">搜索</el-button>
        </el-col>
      </el-row>
    </el-form>
    <!-- <el-button type="warning" icon="el-icon-thumb" size="mini" @click="handleClearInfo">清空</el-button> -->

    <el-table style="margin-top: 20px" stripe v-loading="loading" border :data="loginInfoTableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="日志ID" align="center" prop="infoId" /> -->
      <el-table-column label="用户名称" align="center" prop="userName"/>
      <el-table-column label="登录帐号" align="center" prop="loginAccount" />
      <el-table-column label="登录IP" align="center" prop="ipAddr" />
      <!-- <el-table-column label="登陆地址" align="center" prop="loginLocation" /> -->
      <!-- <el-table-column label="浏览器" width="140" align="center" prop="browser" /> -->
      <!-- <el-table-column label="操作系统" width="140" align="center" prop="os" /> -->
      <el-table-column label="登录状态" prop="loginStatus" align="center" :formatter="statusFormatter" />
      <!-- <el-table-column label="用户类型" prop="loginType" align="center" :formatter="loginTypeFormatter" /> -->
      <el-table-column label="登录时间" align="center" prop="loginTime" />
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="scope">
          <el-button v-if="scope.row.userId !== 1" type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
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
import { listForPage, deleteLoginInfoByIds, clearLoginInfo } from '@/api/system/loginInfo'
export default {
  // 声明数据
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中多条
      multiple: true,
      // 选中数组
      ids: [],
      // 总条数
      total: 0,
      // 用户数据数据
      loginInfoTableList: [],
      // 登陆状态数据字典
      statusOptions: [],
      // 登陆类型数据字典
      loginTypeOptions: [],
      // 时间
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: undefined,
        operName: undefined,
        status: undefined,
        businessType: undefined
      }
    }
  },
  // 初始化
  created() {
    // 查询条件的状态
    this.getDataByType('sys_common_status').then(res => {
      this.statusOptions = res.data
    })
    // 查询条件的操作类型
    this.getDataByType('sys_user_type').then(res => {
      this.loginTypeOptions = res.data
    })
    // 做查询
    this.getloginInfoList()
  },
  // 自定义方法
  methods: {
    // 查询操作日志
    getloginInfoList() {
      this.loading = true
      listForPage(this.addDateRange(this.queryParams, this.dateRange)).then(res => {
        this.loginInfoTableList = res.data
        this.total = res.total
        this.loading = false
      })
    },
    // 条件查询
    filterLoginInfo() {
      this.getloginInfoList()
    },
    // 重置查询条件
    resetQuery() {
      this.resetForm('queryForm')
      this.dateRange = []
      this.getloginInfoList()
    },
    // 数据表格的多选择框选择时触发
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.infoId)
      this.multiple = !selection.length
    },
    // 分页pageSize变化时触发
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      // 重新查询
      this.getloginInfoList()
    },
    // 点击上一页  下一页，跳转到哪一页面时触发
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      // 重新查询
      this.getloginInfoList()
    },
    // 翻译登陆状态
    statusFormatter(row) {
      return this.selectDictLabel(this.statusOptions, row.loginStatus)
    },
    // 翻译登陆类型
    loginTypeFormatter(row) {
      return this.selectDictLabel(this.loginTypeOptions, row.loginType)
    },
    // 删除
    handleDelete(row) {
      const infoIds = row.infoId || this.ids
      this.$confirm('此操作将永久删除操作日志数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteLoginInfoByIds(infoIds).then(res => {
          this.loading = false
          this.msgSuccess('删除成功')
          this.getloginInfoList()// 全查询
        })
      }).catch(() => {
        this.msgError('删除已取消')
        this.loading = false
      })
    },
    // 清空
    handleClearInfo() {
      this.$confirm('此操作将永久清空操作日志数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        clearLoginInfo().then(res => {
          this.loading = false
          this.msgSuccess('清空成功')
          this.getloginInfoList()// 全查询
        })
      }).catch(() => {
        this.msgError('清空已取消')
        this.loading = false
      })
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
