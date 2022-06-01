<template>
  <div class="role-container">
    <!-- 查询条件开始 -->
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px">
      <el-row>
        <el-col :span="12" style="text-align: left;">
          <el-input
            v-model="queryParams.roleName"
            placeholder="请输入角色名称"
            clearable
            size="small"
            style="width: 240px"
            suffix-icon="el-icon-search"
            @keyup.native.enter="filterRoles"
          />
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" style="width: 90px">新增</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table style="margin-top: 20px" v-loading="loading" :row-class-name="tableRowClassName" :data="roleTableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="角色名称" align="center" prop="roleName" width="150" />
      <el-table-column label="身份标识" align="center" prop="roleCode" width="150" />
      <!-- <el-table-column label="显示顺序" width="130" align="center" prop="roleSort" /> -->
      <el-table-column label="状态" width="150" prop="status" align="center" :formatter="statusFormatter" />
      <el-table-column label="描述" align="center" prop="remark" width="200" />
      <el-table-column label="创建时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" width="290">
        <template slot-scope="scope">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(scope.row)">删除</el-button>
          <el-button type="success" icon="el-icon-thumb" size="mini" @click="handleSelectMenu(scope.row)">分配权限</el-button>
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

    <!-- 新建/编辑对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="528px"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" clearable size="small" />
        </el-form-item>
        <el-form-item label="身份标识" prop="roleCode">
          <el-input v-model="form.roleCode" placeholder="请输入身份标识" clearable size="small" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="roleSort">
          <el-input-number v-model="form.roleSort" clearable size="small" />
        </el-form-item>
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
        <el-form-item label="描述" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入描述" clearable size="small" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限和菜单弹出层开始 -->
    <el-dialog
      :title="title"
      :visible.sync="selectMenuOpen"
      width="520px"
      append-to-body
    >
      <el-tree
        ref="menu"
        :data="menuOptions"
        show-checkbox
        node-key="menuId"
        highlight-current
        empty-text="加载中，请稍后"
        :props="{id:'menuId',children:'children',label:'menuName'}"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelSelectMenu">取 消</el-button>
        <el-button type="primary" @click="handleSelectMenuSubmit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限和菜单弹出层结束 -->
  </div>
</template>
<script>
import { listRoleForPage, addRole, updateRole, getRoleById, deleteRoleByIds, saveRoleMenu } from '@/api/role';
import { selectMenuTree, getMenuIdsByRoleId } from '@/api/system/menu'

export default {
  data() {
    return {
      loading: false,
      ids: [],
      single: true,
      multiple: true,
      total: 0,
      roleTableList: [],
      title: '',
      open: false,
      statusOptions: [],
      dateRange: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        roleCode: undefined,
        status: undefined
      },
      form: {},
      rules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        roleCode: [
          { required: true, message: '身份标识不能为空', trigger: 'blur' }
        ]
      },
      selectMenuOpen: false,
      menuOptions: [],
      currentRoleId: undefined
    }
  },
  created() {
    // 使用全局的根据字典类型查询字典数据的方法查询字典数据
    this.getDataByType('sys_normal_disable').then(res => {
      this.statusOptions = res.data;
    })
    this.getRoleList();
  },
  methods: {
    // 查询表格数据
    getRoleList() {
      this.loading = true;
      listRoleForPage(this.addDateRange(this.queryParams, this.dateRange)).then(res => {
        this.roleTableList = res.data;
        this.total = res.total;
        this.loading = false;
      })
    },
    tableRowClassName({row, rowIndex}) {
      if (rowIndex % 2) {
        return 'design-color';
      }
    },
    filterRoles() {
      this.getRoleList();
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.roleId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleSizeChange(value) {
      this.queryParams.pageSize = value;
      this.getRoleList();
    },
    handleCurrentChange(value) {
      this.queryParams.pageNum = value;
      this.getRoleList();
    },
    statusFormatter(row) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    handleAdd() {
      this.open = true;
      this.reset();
      this.title = '添加角色';
    },
    handleUpdate(row) {
      this.title = '修改角色';
      const roleId = row.roleId || this.ids;
      this.open = true;
      this.reset();
      this.loading = true;
      getRoleById(roleId).then(res => {
        this.form = res.data;
        this.loading = false;
      })
    },
    handleDelete(row) {
      const roleIds = row.roleId || this.ids;
      this.$confirm('此操作将永久删除该角色数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteRoleByIds(roleIds).then(res => {
          this.loading = false;
          this.msgSuccess('删除成功');
          this.getRoleList();
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
          if (this.form.roleId === undefined) {
            addRole(this.form).then(res => {
              this.msgSuccess('保存成功');
              this.loading = false;
              this.getRoleList();
              this.open = false;
            }).catch(() => {
              this.loading = false;
            })
          } else {
            updateRole(this.form).then(res => {
              this.msgSuccess('修改成功');
              this.loading = false;
              this.getRoleList();
              this.open = false;
            }).catch(() => {
              this.loading = false;
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
        roleId: undefined,
        roleName: undefined,
        roleCode: undefined,
        roleSort: 0,
        remark: undefined,
        status: '0'
      }
    },
    handleSelectMenu(row) {
      this.currentRoleId = row.roleId || this.ids[0]
      this.title = '分配权限和菜单'
      this.selectMenuOpen = true
      // 查询所有可用的菜单
      selectMenuTree().then(res => {
        this.menuOptions = this.handleTree(res.data, 'menuId')
      })
      // 根据角色ID查询当前角色拥有的哪些菜单权限
      getMenuIdsByRoleId(this.currentRoleId).then(res => {
        this.$refs.menu.setCheckedKeys(res.data)
      })
    },
    // 保存角色和菜单权限的关系
    handleSelectMenuSubmit() {
      // 获取选中的keys
      const checkedKeys = this.$refs.menu.getCheckedKeys()
      // 获取半选的keys
      const halfCheckKeys = this.$refs.menu.getHalfCheckedKeys()
      // 组合成最后的keys
      const finalKey = halfCheckKeys.concat(checkedKeys)
      saveRoleMenu(this.currentRoleId, finalKey).then(res => {
        this.msgSuccess('分配成功')
        this.selectMenuOpen = false
      }).catch(() => {
        this.msgSuccess('分配失败')
      })
    },
    // 关闭分配权限和菜单的弹出层
    cancelSelectMenu() {
      this.selectMenuOpen = false
      this.menuOptions = []
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

.el-table {
  // width: 90%;
}
.el-table .design-color {
  background: #f0f9eb;
}
</style>

<style lang="scss" scoped>
.role-container {
  // width: 90%;
  padding: 32px;
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
