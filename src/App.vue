<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  background-color: #000;
  color: #fff;
}
#app {
  width: 100%;
  height: 100%;
}
</style>
