<template>
  <div id="login">
    <md-snackbar md-position="center" :md-active="error !== null" md-persistent>
      <span>{{ error }}</span>
    </md-snackbar>
    <h2 v-if="title">{{ title }}</h2>
    <form novalidate class="md-layout md-alignment-center">
      <md-card class="md-layout-item md-size-30 md-small-size-45 md-xsmall-size-65 form-card">
        <md-progress-bar md-mode="indeterminate" v-visible="loading" />
        <md-card-content>
          <md-field>
            <md-input name="username" id="username" v-model="username" placeholder="username" v-focus @keyup.enter="login()" />
          </md-field>
          <md-field>
            <md-input name="password" id="password" v-model="password" type="password" placeholder="password" @keyup.enter="login()" />
          </md-field>
          <md-card-actions>
            <md-button class="md-primary md-raised" :disabled="loading" @click.native="login('guest')" v-if="guestEnabled">Continue as Guest</md-button>
            <md-button class="md-primary md-raised" :disabled="loading" @click="login()">Login</md-button>
          </md-card-actions>
        </md-card-content>
      </md-card>
    </form>
  </div>
</template>

<script>
import api from '@/services/Api'

export default {
  name: 'Login',
  props: {
    title: String
  },
  computed: {
    loading () {
      return this.$store.getters.loading
    },
    error () {
      return this.$store.getters.error
    }
  },
  methods: {
    login (type = 'authenticate') {
      if (type === 'guest') {
        this.$store.dispatch('setUser', api.user).then((user) => {
          if (user) this.$router.push('/')
        })
      } else {
        this.$store.dispatch('login', {
          username: this.$data.username,
          password: this.$data.password
        }).then((user) => {
          if (user) this.$router.push('/')
        })
      }
    }
  },
  data: () => {
    return {
      username: null,
      password: null,
      guestEnabled: process.env.VUE_APP_SECURITY_TYPE !== 'private'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "~vue-material/dist/theme/engine";
#login {
  text-align: center;
  padding-top: 5rem;
  .form-card {
    border: 2px solid lighten(#000, 40);
  }
}
.md-snackbar {
  background-color: md-get-palette-color(red, 800) !important;
  color: #fff !important;
  font-weight: bold;
}
</style>
