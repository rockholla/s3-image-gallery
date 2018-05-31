import Vue from 'vue'
import Router from 'vue-router'
import Gallery from './views/Gallery.vue'
import Login from './views/Login.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      props: {
        title: process.env.VUE_APP_TITLE
      },
      meta: {
        protected: false
      }
    },
    {
      path: '/',
      name: 'gallery',
      component: Gallery,
      meta: {
        protected: true
      }
    }
  ]
})
