import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import VueMaterial from 'vue-material'
import VueVisible from 'vue-visible'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default-dark.css'
import api from '@/services/Api'

Vue.config.productionTip = false
Vue.use(VueMaterial)
Vue.use(VueVisible)
Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})

if (api.user !== null) {
  store.dispatch('setUser', api.user)
}

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.protected)) {
    if (!api.isAuthenticated()) {
      next({ path: '/login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
