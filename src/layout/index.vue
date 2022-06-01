<template>
  <div :class="classObj" class="app-wrapper">
    <side-bar class="sidebar-container" />
    <div class="main-container">
      <div :class="{'fixed-header': fixedHeader}">
        <nav-bar />
      </div>
      <main-container />
    </div>
  </div>
</template>

<script>
import { NavBar, SideBar, MainContainer } from './components';
import ResizeMixin from './mixin/ResizeHandler';
import { mapState } from 'vuex';

export default {
  name: 'Layout',
  components: {
    NavBar,
    SideBar,
    MainContainer,
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      fixedHeader: state => state.settings.fixedHeader
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/variables.scss";

  .app-wrapper {
    // @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    background-color: #f2f2f2;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }
</style>
