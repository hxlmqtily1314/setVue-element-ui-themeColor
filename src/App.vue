<template>
  <div id="app">
    <div class="nav-top">
      <div class="nav-logo">
        <img src="./assets/logo.png">
      </div>
      <div class="nav-con">
        <el-menu :default-active="activeIndex" :router="true" mode="horizontal" background-color="#000000" text-color="#ffffff" active-text-color="#42b983">
          <el-menu-item v-for="item in navArr" :key="item.path" :index="item.path">{{item.name}}</el-menu-item>
        </el-menu>
      </div>
      <div class="right">
        <span class="choice-color">主题颜色选择</span>
        <el-color-picker v-model="themeColor" style="vertical-align: middle;" @change="changeThemeColor"></el-color-picker>
      </div>
    </div>
    <router-view/>
  </div>
</template>

<script>
const navList = [
  {
    name: '首页',
    path: '/home'
  },
  {
    name: '表单',
    path: '/form'
  },
  {
    name: '其他表单',
    path: '/others'
  }
]
import Cookies from 'js-cookie'
export default {
  name: 'App',
  inject: ['themeConfig'],
  data() {
    return {
      navArr: navList,
      activeIndex: '/home',
      themeColor: ''
    }
  },
  watch: {
    $route() {
      const matched = this.$route.matched.filter((item) => item.name);
      const result = this.navArr.find((item) => matched[0].path.indexOf(item.path) !== -1);
      if(result) {
        this.activeIndex = result.path;
      }

    }
  },
  created() {
    // 如果本地存在主题色从本地获取，并提交给root分发到页面进行渲染
    if(Cookies.get('themeColor')) { 
      this.themeColor = Cookies.get('themeColor');
      this.$$dispatch('root','root.config',this.themeColor);
    } else {
      this.themeColor = this.themeConfig.themeColor;
    }
  },
  methods: {
    // 改变主题颜色
    changeThemeColor(value) {
      this.$$dispatch('root','root.config',value);
      Cookies.set('themeColor', value, { path: '/' });
    }
  }
}
</script>

<style scoped="scoped" lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.nav-top {
  background-color: #000000;
  height: 60px;
  line-height: 60px;
  .nav-logo {
    float: left;
    height: 60px;
    margin-left: 100px;
    img {
      display: inline-block;
      max-height: 40px;
      vertical-align: middle;
    }
  }
}
.nav-con{
  float:left;
  margin-left: 20px;
  height: 60px;
}
.right {
  float: right;
  height: 60px;
  margin-top: 0;
  margin-right: 100px;
  color: #42b983;
  .choice-color {
   vertical-align: middle;
  }
}
</style>
