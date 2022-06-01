import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);

import Layout from '@/layout';
/**
 * constantRoutes 常量路由，这些路由由后台的数据控制是否显示
 */
export const constantRoutes = [
  {
    path: '/resetPwd',
    component: () => import('@/views/resetPwd'),
    hidden: true
  },
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard'),
        name: '首页',
        meta: { title: '管理首页', icon: 'el-icon-house', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile'),
        name: 'Profile',
        meta: { title: '个人信息', icon: 'user', noCache: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/index',
    children: [
      {
        path: '/user/index',
        component: () => import('@/views/user'),
        name: '用户管理',
        meta: {
          title: '用户管理',
          icon: 'user',
        },
      }
    ]
  },
  {
    path: '/role',
    component: Layout,
    redirect: '/role/index',
    children: [
      {
        path: '/role/index',
        component: () => import('@/views/role/index'),
        name: '角色管理',
        meta: {
          title: '角色管理',
          icon: 'tab'
        }
      }
    ]
  },
  {
    path: '/notice',
    component: Layout,
    redirect: '/notice/index',
    children: [
      {
        path: '/notice/index',
        component: () => import('@/views/notice/index'),
        name: '通知公告',
        meta: {
          title: '通知公告',
          icon: 'bug'
        }
      }
    ]
  }
]
// 异步路由
export const asyncRoutes = [
  {
    path: '/garbage',
    component: Layout,
    redirect: 'noRedirect',
    name: '/garbage',
    meta: {
      title: '垃圾管理',
      icon: 'service'
    },
    children: [
      {
        path: 'question',
        component: () => import('@/views/garbage/question/index'),
        name: '/garbage/question',
        meta: { title: '题库管理', icon: 'edit' }
      },
      {
        path: 'slide',
        component: () => import('@/views/garbage/slide/index'),
        name: '/garbage/slide',
        meta: { title: '轮播图管理', icon: 'list' }
      },
      // {
      //   path: 'keyword',
      //   component: () => import('@/views/garbage/keyword/index'),
      //   name: '/garbage/keyword',
      //   meta: { title: '热门搜索管理', icon: 'edit' }
      // }
    ]
  },
  {
    path: '/recognition',
    component: Layout,
    redirect: 'noRedirect',
    name: '/recognition',
    children: [
      {
        path: 'photo',
        component: () => import('@/views/recognition/photo/index'),
        name: '/recognition/photo',
        meta: { title: '图像识别管理', icon: 'el-icon-camera' }
      },
    ]
  },
  {
    path: '/log',
    component: Layout,
    redirect: '/log_login',
    alwaysShow: true,
    name: '/log',
    meta: {
      title: '日志管理',
      icon: 'clipboard'
    },
    children: [
      {
        path: 'log_login',
        component: () => import('@/views/loginInfo/index'),
        name: '/log/log_login',
        meta: {
          title: '登陆日志管理',
          icon: 'user'
        }
      },
    ]
  }
]
export const lastRoute = [
  // 404页面必须声明在最后
  { path: '*', redirect: '/404', hidden: true }
]
const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  // 初始化时将所有路由都加载上，否则会出现刷新页面404的情况
  routes: constantRoutes
})
const router = createRouter();
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}
export default router;
