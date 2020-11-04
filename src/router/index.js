import Vue from 'vue'
import Router from 'vue-router'
import layout from '@/views/layout/layout.vue'
import otherLayout from '@/views/layout/otherLayout.vue'
Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      redirect: '/home',
      component: layout,
      hidden: true,
      children: [{
        path: 'home',
        component: () => import('@/views/home/index.vue'),
        name: 'home',
        meta: {
          title: '主页'
        }
      },
      {
        path: 'form',
        component: () => import('@/views/form/index.vue'),
        name: 'form',
        meta: {
          title: '表单页'
        }
      },
      ]
    },
    {
      path: '/others',
      redirect: {name: 'othersForm'},
      component: otherLayout,
      name: 'others',
      hidden: true,
      children: [{
        path: 'othersForm',
        component: () => import('@/views/others/form.vue'),
        name: 'othersForm',
        meta: {
          title: '其他表单页'
        }
      }]
    }
  ]
})
