import axios from 'axios';
import store from '@/store';
import { getToken } from '@/utils/auth';
import { MessageBox, Message } from 'element-ui';

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  withCredentials: true,
  timeout: 5000
});

// 请求拦截，可以在此对发送的请求做一些统一性处理
service.interceptors.request.use((config) => {
    if (store.getters.token) {
      // 在发送请求之前把token放到请求头中，token和后端的保持一样
      config.headers['token'] = getToken();
    }
    return config;
  }, error => {
    console.log(error);
    return Promise.reject(error);
  }
);

// 响应拦截
service.interceptors.response.use(response => { // 在这里可以根据状态码处理一些响应的信息
    // 主要判断状态码200，400，401，404，500
    const res = response.data;
    if (res.code === 401) {
      // 身份过期，或者未授权
      MessageBox.confirm('用户登录身份已过期，请重新登录', '系统提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        store.dispatch('user/logout').then(() => {
          // 跳转到登录页面 重新登录
          location.reload();
        })
      })
    } else if (res.code === 500) { // 服务器错误
      Notification.error({
        title: '服务器内部出现异常，请联系管理员'
      })
      return Promise.reject('error');
    } else if (res.code === 400) { // 错误请求
      Notification.error({
        title: res.msg
      })
      return Promise.reject('error');
    } else if (res.code !== 200) { // 请求未成功
      Notification.error({
        title: res.msg
      })
      return Promise.reject('error');
    } else {
      // 以上验证通过之后再放行，返回请求获取的数据结果
      return res;
    }
  }, error => {
    console.log('error', error);
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error);
  }
);

export default service
