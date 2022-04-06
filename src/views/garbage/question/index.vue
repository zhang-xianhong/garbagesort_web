<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-row>
        <el-col :span="8" style="text-align: left;">
          <el-input
            v-model="queryParams.garbageName"
            placeholder="请输入垃圾名称"
            clearable
            size="small"
            style="width: 240px"
            suffix-icon="el-icon-search"
            @keyup.native.enter="filterGarbage"
          />
        </el-col>
        <el-col :span="8" style="text-align: left;">
          <el-select
            v-model="queryParams.garbageType"
            placeholder="请选择垃圾类型"
            clearable
            size="small"
            style="width: 240px"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="filterGarbage">搜索</el-button>
        </el-col>
        <el-col :span="8" style="text-align: right">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" style="width: 90px">新增</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table style="margin-top: 20px" v-loading="loading" border stripe :data="questionTableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="垃圾ID" align="center" prop="garbageId" /> -->
      <el-table-column label="垃圾名称" align="center" prop="garbageName" />
      <el-table-column label="垃圾类型" align="center" prop="garbageType" :formatter="questionFormatter" />
      <el-table-column label="解析" align="center" prop="analysis" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button :disabled="scope.row.userId === 1" type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 新建修改 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="500px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-row>
          <el-col>
            <el-form-item label="垃圾类型" prop="garbageType">
              <el-select
                v-model="form.garbageType"
                placeholder="请选择垃圾类型"
                clearable
                size="small"
                style="width: 300px"
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                >{{ item.dictLabel }}</el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="垃圾名称" prop="garbageName">
              <el-input v-model="form.garbageName" style="width: 300px" placeholder="请输入垃圾名称" clearable size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="解析" prop="analysis">
              <el-input v-model="form.analysis" style="width: 300px" placeholder="请输入解析" clearable size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" style="width: 300px" placeholder="请输入备注" clearable size="small" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { listQuest, addQuestion, updateQuestion, deleteQuestion, selectQuestionBankById } from '@/api/garbage/question';
export default {
  data() {
    return {
      loading: false,
      ids: [],
      single: true,
      multiple: true,
      total: 0,
      questionTableList: [],
      typeOptions: [],
      title: '',
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        garbageName: undefined
      },
      form: {},
      rules: {
        garbageName: [
          { required: true, message: '垃圾名称不能为空', trigger: 'blur' }
        ],
        garbageType: [
          { required: true, message: '垃圾类型不能为空', trigger: 'blur' }
        ]
      },
      selectRoleOpen: false,
      roleIds: [],
      roleTableList: [],
      currentUserId: undefined
    }
  },
  created() {
    // 使用全局的根据字典类型查询字典数据的方法查询字典数据
    this.getDataByType('garbage_type').then(res => {
      this.typeOptions = res.data;
    }).catch((e) => {
      console.log(e);
    })
    this.getQuestionList();
  },
  methods: {
    getQuestionList() {
      this.loading = true;
      listQuest(this.queryParams).then(res => {
        this.questionTableList = res.data;
        this.total = res.total;
        this.loading = false;
      }).catch(e => {
        console.log(e);
      })
    },
    filterGarbage() {
      this.getQuestionList();
    },
    resetQuery() {
      this.resetForm('queryForm');
      this.dateRange = [];
      this.getQuestionList();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleSizeChange(value) {
      this.queryParams.pageSize = value;
      this.getQuestionList();
    },
    questionFormatter(row) {
      return this.selectDictLabel(this.typeOptions, row.garbageType);
    },
    handleCurrentChange(value) {
      this.queryParams.pageNum = value;
      this.getQuestionList();
    },
    handleAdd() {
      this.open = true;
      this.reset();
      this.title = '添加题目';
    },
    handleUpdate(row) {
      this.title = '修改题目信息';
      const garbageId = row.garbageId || this.ids;
      console.log('garbageId', garbageId);
      this.open = true;
      this.reset();
      // 根据Id查询该垃圾
      this.loading = true;
      selectQuestionBankById(garbageId).then(res => {
        console.log('handleUpdate', res);
        this.form = res.data;
        this.loading = false;
      }).catch((e) => {
        console.log('error', e);
      })
    },
    handleDelete(row) {
      const questionIds = row.garbageId || this.ids;
      this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        deleteQuestion(questionIds).then(res => {
          this.loading = false;
          this.msgSuccess('删除成功');
          this.getQuestionList();
        }).catch(() => {
          this.msgError('删除失败');
          this.loading = false;
        })
      }).catch(() => {
        this.msgError('删除已取消');
        this.loading = false;
      })
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.form.garbageId === undefined) {
            addQuestion(this.form).then(res => {
              this.msgSuccess('保存成功');
              this.getQuestionList();
              this.open = false;
            }).catch(() => {
              this.loading = false;
              this.msgSuccess('保存失败');
            })
          } else {
            updateQuestion(this.form).then(res => {
              this.msgSuccess('修改成功');
              this.getQuestionList();
              this.open = false;
            }).catch(() => {
              this.loading = false;
              this.msgSuccess('修改失败');
            })
          }
        }
      })
    },
    cancel() {
      this.open = false;
      this.title = '';
    },
    reset() {
      this.resetForm('form');
      this.form = {
        garbageId: undefined,
        garbageType: undefined,
        garbageName: undefined,
        analysis: undefined,
        remark: undefined
      }
    },
    // 数据表格的多选择框选择时触发
    handleRoleTableSelectionChange(selection) {
      this.roleIds = selection.map(item => item.roleId)
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
.garbage-container {
  padding: 24px;
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
