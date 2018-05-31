<template>
  <div class="header">
    <div class="thumbnails">
      <md-empty-state md-label="No images yet"></md-empty-state>
    </div>
    <div class="uploader" @click="upload()" v-if="user && user.role === 'editor'">
      <md-icon class="icon md-size-2x">cloud_upload</md-icon>
      <md-tooltip md-direction="bottom">You can drag an image or images here to upload</md-tooltip>
    </div>
    <md-progress-bar class="md-accent progress" md-mode="indeterminate" v-show="loading"></md-progress-bar>
  </div>
</template>

<script>
export default {
  name: 'Header',
  computed: {
    loading () {
      return this.$store.getters.loading
    },
    user () {
      return this.$store.getters.user
    }
  },
  methods: {
    upload () {
      this.$store.dispatch('upload', {})
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.header {
  position: relative;
  width: 100%;
  height: 100px;
  background-color: lighten(#000, 10);
  border-bottom: 1px solid lighten(#000, 30);
}
.uploader {
  position: absolute;
  right: 0;
  top: 0;
  margin: 10px;
  border: 1px dashed lighten(#000, 50);
  border-radius: 5px;
  width: 80px;
  height: 80px;
  text-align: center;
  cursor: pointer;
  .icon {
    margin: 12px 0;
    z-index: 1000;
  }
}
.progress {
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  z-index: 1000;
}
</style>
