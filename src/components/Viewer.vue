<template>
  <div class="viewer">
    <md-button class="md-primary logout" href="#" @click="logout()" :disabled="loggingOut" v-if="securityType !== 'public-read-write'">{{ logoutText }}</md-button>
    <md-empty-state
      class="md-primary"
      md-icon="collections"
      md-label="No image selected"
      md-description="Click on a thumbnail above to display the image full size here">
    </md-empty-state>
  </div>
</template>

<script>
import api from '@/services/Api'

export default {
  name: 'Viewer',
  methods: {
    logout () {
      this.$data.loggingOut = true
      this.$store.dispatch('logout').then((success) => {
        if (success) {
          setTimeout(() => {
            // reinit the api
            api.init()
            this.$data.loggingOut = false
            this.$router.push('/login')
          }, 500)
        }
      })
    }
  },
  computed: {
    logoutText () {
      if (this.$store.getters.user) {
        return this.$store.getters.user.username.match(/-anonymous$/g) ? 'Log in' : 'Log out'
      } else {
        return 'Log in'
      }
    },
    securityType () {
      return this.$store.getters.securityType
    }
  },
  data: () => {
    return {
      loggingOut: false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.logout {
  position: absolute;
  right: 0px;
}
.viewer {
  width: 100%;
  height: calc(100% - 100px);
}
</style>
