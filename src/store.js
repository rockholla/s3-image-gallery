import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/services/Api'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loading: false,
    error: null,
    user: null,
    securityType: process.env.VUE_APP_SECURITY_TYPE,
    debug: process.env.VUE_APP_DEBUG === 'true' || process.env.VUE_APP_DEBUG === '1' || process.env.VUE_APP_DEBUG === 'yes'
  },
  getters: {
    loading: state => state.loading,
    error: state => state.error,
    user: state => state.user,
    securityType: state => state.securityType,
    debug: state => state.debug
  },
  mutations: {
    LOADING: (state, payload) => {
      state.loading = payload
    },
    ERROR: (state, payload) => {
      if (state.debug) console.error(payload)
      state.error = payload instanceof Error ? payload.message : payload
      setTimeout(() => {
        state.error = null
      }, 5000)
    },
    USER: (state, payload) => {
      state.user = payload
    }
  },
  actions: {
    upload: (context, payload) => {
      context.commit('LOADING', true)
      return api.upload(payload).then((result) => {
        context.commit('LOADING', false)
        return result
      }).catch((error) => {
        context.commit('LOADING', false)
        context.commit('ERROR', error)
      })
    },
    login: (context, payload) => {
      context.commit('LOADING', true)
      return api.login(payload.username, payload.password).then((result) => {
        context.commit('LOADING', false)
        context.commit('USER', result)
        return result
      }).catch((error) => {
        context.commit('LOADING', false)
        context.commit('ERROR', error)
      })
    },
    logout: (context, payload) => {
      return api.logout().then(() => {
        context.commit('USER', null)
        return true
      }).catch((error) => {
        context.commit('ERROR', error)
      })
    },
    setUser: (context, payload) => {
      return new Promise((resolve, reject) => {
        context.commit('USER', payload)
        return resolve(payload)
      })
    }
  }
})
