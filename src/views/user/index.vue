<template>
  <div class="user-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-row>
        <el-col :span="12" style="text-align: left;">
          <el-input
            v-model="queryParams.userName"
            placeholder="请输入用户名称"
            size="small"
            style="width: 240px;"
            suffix-icon="el-icon-search"
            @keyup.native.enter="filterUser"
          />
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" style="width: 90px">新增</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table style="margin-top: 20px" v-loading="loading" stripe :data="userTableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="45" align="center" />
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="table-expand">
            <el-form-item label="邮箱:">
              <span>{{ props.row.email }}</span>
            </el-form-item>
            <el-form-item label="擅长:">
              <span>{{ props.row.strong }}</span>
            </el-form-item>
            <el-form-item label="荣耀:">
              <span>{{ props.row.honor }}</span>
            </el-form-item>
            <el-form-item label="简介:">
              <span>{{ props.row.introduction }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="用户名称" width="120px" align="center" prop="userName" />
      <el-table-column label="手机号码【登陆身份】" width="180" align="center" prop="phone" />
      <el-table-column label="性别" align="center" prop="sex" :formatter="sexFormatter" />
      <el-table-column label="年龄" align="center" prop="age" />
      <el-table-column label="学历" prop="background" align="center" :formatter="backgroundFormatter" />
      <el-table-column label="状态" prop="status" align="center" :formatter="statusFormatter" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="200" />
      <el-table-column label="操作" align="center" width="250">
        <template slot-scope="scope">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" :disabled="scope.row.userId === 1" icon="el-icon-delete" size="mini" @click="handleDelete(scope.row)">删除</el-button>
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
    <!-- 新建/修改对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="isVisable"
      width="600px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="姓名" prop="userName">
              <el-input v-model="form.userName"  placeholder="请输入用户名称" clearable size="small" />
            </el-form-item></el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号，作为登陆凭证" clearable size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="级别" prop="userRank">
              <el-select
                v-model="form.userRank"
                placeholder="用户级别"
                clearable
                size="small"
              >
                <el-option
                  v-for="item in userRankOptions"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入用户邮箱" clearable size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="form.age" clearable size="small" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="背景" prop="background">
              <el-select
                v-model="form.background"
                placeholder="学历"
                clearable
                size="small"
              >
                <el-option
                  v-for="item in backgroundOptions"
                  :key="item.dictValue"
                  :label="item.dictLabel"
                  :value="item.dictValue"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="form.sex">
                <el-radio
                  v-for="item in sexOptions"
                  :key="item.dictValue"
                  :label="item.dictValue"
                  :value="item.dictValue"
                >{{ item.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
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
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="擅长" prop="strong">
              <el-input v-model="form.strong" type="textarea" placeholder="请输入用户擅长" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="荣誉" prop="honor">
              <el-input v-model="form.honor" type="textarea" placeholder="请输入用户荣誉" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="简介" prop="introduction">
              <el-input v-model="form.introduction" type="textarea" placeholder="请输入用户简介" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
import { listUserForPage, addUser, updateUser, getUserById, deleteUserByIds, resetPwd } from '@/api/user';
export default {
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
      userTableList: [],
      // 弹出层标题
      title: '',
      // 是否显示新建编辑弹出层
      isVisable: false,
      // 状态数据字典
      statusOptions: [],
      // 级别数据字典
      userRankOptions: [],
      // 背景数据字典
      backgroundOptions: [],
      // 性别数据字典
      sexOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deptId: undefined,
        userName: undefined,
        phone: undefined,
        status: undefined
      },
      // 表单数据
      form: {},
      // 表单校验
      rules: {
        userName: [
          { required: true, message: '用户名称不能为空', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          {
            pattern: /^1[345678]\d{9}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ]
      },
    }
  },
  created() {
    // 使用全局的根据字典类型查询字典数据的方法查询字典数据
    // 状态
    this.getDataByType('sys_normal_disable').then(res => {
      this.statusOptions = res.data;
    })
    // 用户级别
    this.getDataByType('sys_user_level').then(res => {
      this.userRankOptions = res.data;
    })
    // 用户背景
    this.getDataByType('sys_user_background').then(res => {
      this.backgroundOptions = res.data;
    })
    // 用户性别
    this.getDataByType('sys_user_sex').then(res => {
      let temp = res.data;
      temp = temp.map(item => {
        if (item.dictLabel === '未知') {
          item.dictLabel = '男'
        }
        return item;
      })
      this.sexOptions = temp;
    })
    this.getUserList();
  },
  methods: {
    // 获取用户表格数据
    getUserList() {
      this.loading = true;
      listUserForPage(this.addDateRange(this.queryParams, this.dateRange)).then(res => {
        this.userTableList = res.data;
        this.total = res.total;
        this.loading = false;
      })
    },
    filterUser() {
      this.getUserList();
    },
    // 数据表格的多选择框选择时触发
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.userId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleSizeChange(value) {
      this.queryParams.pageSize = value;
      this.getUserList();
    },
    handleCurrentChange(value) {
      this.queryParams.pageNum = value;
      this.getUserList();
    },
    statusFormatter(row) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    sexFormatter(row) {
      if (row.sex === '0') {
        return '男';
      } else if (row.sex === '1') {
        return '女';
      }
    },
    backgroundFormatter(row) {
      return this.selectDictLabel(this.backgroundOptions, row.background);
    },
    handleAdd() {
      this.title = '添加用户信息';
      this.isVisable = true;
      this.reset();
    },
    handleUpdate(row) {
      this.title = '修改用户信息';
      const userId = row.userId || this.ids;
      this.isVisable = true;
      this.reset();
      this.loading = true;
      getUserById(userId).then(res => {
        this.form = res.data;
        this.loading = false;
      }).catch(e => {
        console.log(e);
      })
    },
    handleDelete(row) {
      console.log('delete', row);
      const userIds = row.userId || this.ids;
      this.$confirm('是否确定删除该用户数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        deleteUserByIds(userIds).then(res => {
          this.loading = false;
          this.msgSuccess('删除成功');
          this.getUserList();
        }).catch(() => {
          this.msgError('删除失败');
          this.loading = false;
        })
      }).catch(() => {
        this.msgError('已取消删除');
        this.loading = false;
      })
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.form.userId === undefined) {
            addUser(this.form).then(res => {
              this.msgSuccess('保存成功');
              this.getUserList();
              this.isVisable = false;
            }).catch(() => {
              this.loading = false;
              this.msgError('保存失败');
            })
          } else {
            updateUser(this.form).then(res => {
              this.msgSuccess('修改成功');
              this.getUserList();
              this.isVisable = false;
            }).catch(() => {
              this.loading = false;
              this.msgSuccess('修改失败');
            })
          }
        }
      })
    },
    cancel() {
      this.isVisable = false;
      this.title = '';
    },
    reset() {
      this.resetForm('form');
      this.form = {
        userId: undefined,
        userName: undefined,
        phone: undefined,
        sex: '0',
        age: 0,
        status: '0',
        email: undefined,
        strong: undefined,
        honor: undefined,
        introduction: undefined,
        remark: undefined,
      }
    },
    handleResetPwd() {
      const userIds = this.ids;
      this.$confirm('是否确认重置用户ID为:' + userIds + '的密码?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(function() {
        resetPwd(userIds).then(res => {
          this.msgSuccess('重置成功');
        }).catch(function() {
          this.msgSuccess('重置失败');
        })
      }).catch(function() {
        this.msgError('重置已取消');
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
.user-container {
  padding: 32px;
  background-color: #f2f2f2;
}
.table-expand label {
  width: 90px;
  color: #99a9bf;
}
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
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
