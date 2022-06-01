<template>
  <div class="notice-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="88px">
      <el-row>
        <el-col :span="12" style="text-align: left;">
          <el-input
            v-model="queryParams.noticeTitle"
            placeholder="请输入通知公告标题"
            clearable
            size="small"
            style="width: 240px"
            suffix-icon="el-icon-search"
            @keyup.native.enter="handleQuery"
          />
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" style="width: 90px">新增</el-button>
        </el-col>
      </el-row>

    <el-table style="margin-top: 20px" v-loading="loading" stripe :data="noticeTableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" style="font-weight: bold" />
      <!-- <el-table-column label="选项" type="index" :index="myIndex" /> -->
      <el-table-column label="公告标题" align="center" prop="noticeTitle"  width="150"/>
      <el-table-column label="公告类型" prop="noticeType" align="center" :formatter="noticeTypeFormatter" width="130" />
      <el-table-column label="描述" prop="noticeContent" align="center" width="200" />
      <el-table-column label="状态" prop="status" align="center" :formatter="statusFormatter" width="100" />
      <el-table-column label="发布者" align="center" prop="createBy" width="150"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180"/>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="success" icon="el-icon-view" size="mini" @click="handleView(scope.row)">详情</el-button>
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-form>

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

    <!-- 新建/编辑对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="720px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="标题" prop="noticeTitle">
              <el-input v-model="form.noticeTitle" placeholder="请输入通知公告标题" clearable size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="item in statusOptions"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  :value="item.dictValue"
                >{{ item.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="noticeType">
              <el-radio-group v-model="form.noticeType">
                <el-radio
                  v-for="item in noticeTypeOptions"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  :value="item.dictValue"
                >{{ item.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="公告内容">
              <markdown-editor
                ref="noticeContent"
                v-model="form.noticeContent"
                height="300px"
                :options="{hideModeSwitch: true, previewStyle: 'tab'}"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" clearable size="small" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 查看详情 -->
    <el-dialog
      :title="title"
      :visible.sync="noticeContentOpen"
      width="720px"
      center
      append-to-body
    >
      <MarkdownEditor ref="noticeContent" v-model="noticeContent" :aria-disabled="true" :options="{hideModeSwitch:true,previewStyle:'tab'}" />
    </el-dialog>

  </div>
</template>
<script>
import MarkdownEditor from '@/components/MarkdownEditor'
import { listNoticeForPage, addNotice, updateNotice, getNoticeById, deleteNoticeByIds } from '@/api/notice';

export default {
  components: { MarkdownEditor },

  data() {
    return {
      // 是否启用遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 分页数据总条数
      total: 0,
      // 字典表格数据
      noticeTableList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,

      // 状态数据字典
      statusOptions: [],
      // 公告类型
      noticeTypeOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        noticeTitle: undefined,
        createBy: undefined,
        noticeType: undefined,
        status: undefined,
        bodychoose: [
          // 1, 2, 10
        ]
      },
      // 表单数据
      form: {
      },
      // 表单校验
      rules: {
        noticeTitle: [
          { required: true, message: '通知公告标题不能为空', trigger: 'blur' }
        ]
      },
      // 查看内容的弹出层
      noticeContentOpen: false,
      // 查看内容
      noticeContent: undefined,
      classOptions: [
        {
        label: "没有",
        value: 1
      },
      {
        label: "很少",
        value: 2
      },
      {
        label: "有时",
        value: 3
      },
      {
        label: "经常",
        value: 4
      },
      {
        label: "总是",
        value: 5
      }],
    }
  },
  // 勾子
  created() {
    // 使用全局的根据字典类型查询字典数据的方法查询字典数据
    this.getDataByType('sys_normal_disable').then(res => {
      this.statusOptions = res.data
    })
    this.getDataByType('sys_notice_type').then(res => {
      this.noticeTypeOptions = res.data
    })
    // 查询表格数据
    this.getNoticeList()
  },
  // 方法
  methods: {
    onSave() {
      console.log(11111111, this.queryParams);
    },
    myIndex(index) {
      return index * 1;
    },
    onChange(value) {
      console.log('onChange', value);
    },
    // 查询表格数据
    getNoticeList() {
      this.loading = true // 打开遮罩
      listNoticeForPage(this.addDateRange(this.queryParams, this.dateRange)).then(res => {
        this.noticeTableList = res.data
        this.total = res.total
        this.loading = false// 关闭遮罩
      })
    },
    // 条件查询
    handleQuery() {
      this.getNoticeList()
    },
    // 重置查询条件
    resetQuery() {
      this.resetForm('queryForm')
      this.dateRange = []
      this.getNoticeList()
    },
    // 数据表格的多选择框选择时触发
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.noticeId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    // 分页pageSize变化时触发
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      // 重新查询
      this.getNoticeList()
    },
    // 点击上一页  下一页，跳转到哪一页面时触发
    handleCurrentChange(val) {
      this.queryParams.pageNum = val
      // 重新查询
      this.getNoticeList()
    },
    // 翻译状态
    statusFormatter(row) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 翻译类型
    noticeTypeFormatter(row) {
      return this.selectDictLabel(this.noticeTypeOptions, row.noticeType)
    },
    // 打开添加的弹出层
    handleAdd() {
      this.open = true
      this.reset()
      this.title = '添加通知公告信息'
    },
    // 打开修改的弹出层
    handleUpdate(row) {
      this.title = '修改通知公告信息'
      const noticeId = row.noticeId || this.ids
      this.open = true
      this.reset()
      // 根据noticeId查询一个公告信息
      this.loading = true
      getNoticeById(noticeId).then(res => {
        this.form = res.data
        this.loading = false
      })
    },
    // 执行删除
    handleDelete(row) {
      const noticeIds = row.noticeId || this.ids
      this.$confirm('此操作将永久删除该通知公告数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteNoticeByIds(noticeIds).then(res => {
          this.loading = false
          this.msgSuccess('删除成功')
          this.getNoticeList()// 全查询
        }).catch(() => {
          this.msgError('删除失败')
          this.loading = false
        })
      }).catch(() => {
        this.msgError('删除已取消')
        this.loading = false
      })
    },
    // 保存
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          // 做添加
          this.loading = true
          if (this.form.noticeId === undefined) {
            addNotice(this.form).then(res => {
              this.msgSuccess('保存成功')
              this.loading = false
              this.getNoticeList()// 列表重新查询
              this.open = false// 关闭弹出层
            }).catch(() => {
              this.loading = false
            })
          } else { // 做修改
            updateNotice(this.form).then(res => {
              this.msgSuccess('修改成功')
              this.loading = false
              this.getNoticeList()// 列表重新查询
              this.open = false// 关闭弹出层
            }).catch(() => {
              this.loading = false
            })
          }
        }
      })
    },
    // 取消
    cancel() {
      this.open = false
      this.title = ''
    },
    // 重置表单
    reset() {
      this.resetForm('form')
      this.form = {
        noticeId: undefined,
        noticeTitle: undefined,
        noticeContent: undefined,
        noticeType: '0',
        status: '0',
        remark: undefined,
      }
    },
    // 打开修改的弹出层
    handleView(row) {
      this.title = row.noticeTitle
      this.noticeContentOpen = true
      this.noticeContent = row.noticeContent
    }
  },
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
.notice-container {
  padding: 32px;
  background-color: #f2f2f2;
  color: #000;
}
.packaged-pagination {
  &::after {
    content: '';
    clear: both;
  }
  color: black;
  &__total {
    font-size: 13px;
    display: inline-block;
    line-height: 34px;
    height: 34px;
  }
}
</style>
