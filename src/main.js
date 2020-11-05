// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Element from 'element-ui'
import theme from '@/mixins/theme.js'
import variables from '@/styles/element-variables.scss'
import '@/styles/index.scss'
import emitter from '@/mixins/emitter.js'

Vue.use(Element)
Vue.mixin(theme)
Vue.mixin(emitter)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  name: 'root',
  provide(){
    return {
      themeConfig: this
    }
  },
  data() {
    return {
      themeColor: variables.colorPrimary,
      defaultColor: variables.colorPrimary
    }
  },
  created() {
    this.$on('root.config',(result) => {
      this.themeColor = result;
    })
  },
  watch: {
    themeColor(newval, oldval) {
      this.setThemeColor(newval, oldval);
    }
  },
  router,
  components: { App },
  template: '<App/>'
})
