<template>
  <div class="slide-container">
    <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="88px">
      <el-row>
        <el-col :span="12" style="text-align: left;">
          <el-select
            v-model="queryParams.status"
            placeholder="可用状态"
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
          <el-button type="primary" icon="el-icon-search" size="mini" @click="filterSlidePicture">搜索</el-button>
        </el-col>
        <el-col :span="12" style="text-align: right">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" style="width: 90px">新增</el-button>
        </el-col>
      </el-row>
    </el-form>

    <el-table style="margin-top: 20px" stripe v-loading="loading" border :data="slideTableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="链接地址:">
              <a target="_blank" :href="props.row.skipUrl">{{ props.row.skipUrl }}</a>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="图片" align="center" prop="imageUrl">
        <template slot-scope="scope">
          <img class="logoImg" :src="scope.row.imageUrl">
        </template>
      </el-table-column>
      <el-table-column label="图片地址" prop="imageUrl" align="center" />
      <el-table-column label="状态" prop="status" align="center" :formatter="statusFormatter" />
      <!-- <el-table-column label="排序" align="center" prop="sortId" /> -->
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog
      :title="title"
      :visible.sync="open"
      width="600px"
      append-to-body
    >
      <el-form ref="form" :model="form" label-width="100px">
        <el-row>
          <el-col>
            <el-form-item label="状态" prop="status" required="true">
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
          <el-col>
            <el-form-item label="排序" prop="sortId">
              <el-input v-model="form.sortId" placeholder="请输入序号" clearable size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="图片" prop="imageUrl">
              <el-upload
                :action="uploadPath"
                :headers="headers"
                :on-remove="handleRemove"
                :file-list="fileList"
                accept="image/*"
                name="file"
                :on-success="handleUploadSuccess"
                :on-error="handleUploadError"
                list-type="picture"
              >
                <el-button size="small" type="primary">点击上传</el-button>
                <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <el-form-item label="链接地址" prop="skipUrl">
              <el-input v-model="form.skipUrl" placeholder="请输入跳转的链接地址" clearable size="small" />
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
import { listSlideForPage, addSlide, updateSlide, getSlideById, deleteSlideByIds } from '@/api/garbage/slide';
import { getToken } from '@/utils/auth';
export default {
  data() {
    return {
      loading: false,
      ids: [],
      single: true,
      multiple: true,
      total: 0,
      slideTableList: [],
      title: '',
      url: '',
      open: false,
      statusOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        status: undefined
      },
      form: {
        imageUrl: undefined,
        sortId: '0',
        status: '0',
        skipUrl: undefined
      },
      uploadPath: undefined,
      fileList: [],
      headers: undefined,
      fileListJsonObj: []
    }
  },
  created() {
    // 使用全局的根据字典类型查询字典数据的方法查询字典数据
    this.getDataByType('sys_normal_disable').then(res => {
      this.statusOptions = res.data;
    }).catch(err => {
      console.error(err);
    })
    this.getSlideList();
    this.uploadPath = process.env.VUE_APP_BASE_API + '/upload/image';
    // 设置请求头加入token 避免求认证的问题
    this.headers = { 'token': getToken() };
  },
  methods: {
    getSlideList() {
      this.loading = true;
      listSlideForPage(this.queryParams).then(res => {
        this.slideTableList = res.data;
        this.total = res.total;
        this.loading = false;
      })
    },
    filterSlidePicture() {
      this.getSlideList();
    },
    resetQuery() {
      this.resetForm('queryForm');
      this.getSlideList();
    },
    handleSelectionChange(selection) {
      console.log('selection', selection);
      this.ids = selection.map(item => item.swiperId);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    handleSizeChange(value) {
      this.queryParams.pageSize = value;
      this.getSlideList();
    },
    handleCurrentChange(value) {
      this.queryParams.pageNum = value;
      this.getSlideList();
    },
    statusFormatter(row) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    handleAdd() {
      this.open = true;
      this.reset();
      this.title = '添加轮播图';
    },
    handleUpdate(row) {
      this.title = '修改轮播图';
      const swiperId = row.swiperId || this.ids;
      this.open = true;
      this.reset();
      // 根据swiperId查询一个
      this.loading = true
      getSlideById(swiperId).then(res => {
        this.form = res.data;
        this.form.status = '' + res.data.status;
        this.fileList = [{ 'url': res.data.imageUrl }];
        this.loading = false;
      })
    },
    handleDelete(row) {
      const swiperIds = row.swiperId || this.ids;
      this.$confirm('此操作将永久删除该轮播图, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        deleteSlideByIds(swiperIds).then(res => {
          this.loading = false;
          this.msgSuccess('删除成功');
          this.getSlideList();
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
          this.loading = true
          if (this.form.swiperId === undefined) {
            addSlide(this.form).then(res => {
              this.msgSuccess('保存成功');
              this.loading = false;
              this.getSlideList();
              this.open = false;
            }).catch(() => {
              this.loading = false;
            })
          } else {
            updateSlide(this.form).then(res => {
              this.msgSuccess('修改成功');
              this.loading = false;
              this.getSlideList();
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
        imageUrl: undefined,
        sortId: '0',
        status: '0',
        skipUrl: undefined
      };
    },
    // 文件上传的相关方法
    // 移除回调
    handleRemove(file, fileList) {
      this.fileListJsonObj.filter(i1 => {
        if (file.response.data.url === i1.url) {
          this.fileListJsonObj.splice(this.fileListJsonObj.indexOf(i1), 1);
        }
      })
    },
    // 上传成功之后的回调
    handleUploadSuccess(response, file, fileList) {
      console.log('success', response, file, fileList);
      this.fileListJsonObj.push(response.data);
      this.form.imageUrl = response.msg;
      console.log(this.fileListJsonObj);
    },
    // 上传失败之后的回调
    handleUploadError() {
      this.msgError('上传失败');
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
.logoImg {
  width: 200px;
  height: auto;
  max-height: 100px;
}
</style>

<style lang="scss" scoped>
.slide-container {
  padding: 24px 24px 0;
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
