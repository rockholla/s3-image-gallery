<template>
  <div id="gallery">
    <Header/>
    <Viewer/>
  </div>
</template>

<script>
// @ is an alias to /src
import Header from '@/components/Header.vue'
import Viewer from '@/components/Viewer.vue'

export default {
  name: 'Gallery',
  components: {
    Header,
    Viewer
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#gallery {
  width: 100%;
  height: 100%;
}
</style>
