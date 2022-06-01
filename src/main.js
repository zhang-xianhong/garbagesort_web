import Vue from 'vue';

import Cookies from 'js-cookie';

import 'normalize.css/normalize.css';

import moment from 'moment'; // 日期格式化类

import Element from 'element-ui'; // ElementUI
import './styles/element-variables.scss';
// import enLang from 'element-ui/lib/locale/lang/en'// 如果使用中文语言包请默认支持，无需额外引入

import '@/styles/index.scss'; // global css

import App from './App';
import store from './store';
import router from './router';

import './icons'; // icon
import './permission'; // permission control
import './utils/error-log'; // error log

import * as filters from './filters'; // global filters

import { resetForm, addDateRange, selectDictLabel, handleTree } from '@/utils/hos-utils';
import { getDataByType } from '@/api/system/dict/data';

// 全局方法挂载
Vue.prototype.resetForm = resetForm;
Vue.prototype.addDateRange = addDateRange;
Vue.prototype.selectDictLabel = selectDictLabel;
Vue.prototype.getDataByType = getDataByType; // 加载全局的根据字典类型查询字典的方法
Vue.prototype.handleTree = handleTree;
Vue.prototype.moment = moment;

// 挂载全局消息框
Vue.prototype.msgSuccess = function(msg) {
  this.$message({ showClose: true, message: msg, type: 'success' });
};
Vue.prototype.msgError = function(msg) {
  this.$message({ showClose: true, message: msg, type: 'error' });
};
Vue.prototype.msgInfo = function(msg) {
  this.$message.info(msg);
};

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  // locale: enLang // 使用英文
});

// 注册全局过滤器
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});

Vue.config.productionTip = false;

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
