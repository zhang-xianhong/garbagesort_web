<template>
  <div :class="{'has-logo' :showLogo}" class="sidebar-container">
    <div class="sidebar-title">垃圾分类管理系统</div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item v-for="route in menu_routes" :key="route.path" :item="route" :base-path="route.path" />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import SidebarItem from './SidebarItem';
import variables from '@/styles/variables.scss';

export default {
  components: {
    SidebarItem
  },
  computed: {
    ...mapGetters([
      'menu_routes',
      'sidebar'
    ]),
    activeMenu() {
      const route = this.$route;
      const { meta, path } = route;
      if (meta.activeMenu) {
        return meta.activeMenu;
      }
      return path;
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar-title {
  padding: 10px 14px;
  color: #fff;
  font-size: 22px;
  font-family: 'Times New Roman', Times, serif;
  font-weight: bold;
  // font-family: '楷体';
}
</style>
