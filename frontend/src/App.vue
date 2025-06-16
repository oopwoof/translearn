<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// 移除所有默认的导入和组件
</script>

<style>
/* 重置默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

#app {
  height: 100vh;
  overflow: hidden;
}

/* 移除Vue默认样式 */
.logo {
  display: none;
}
</style>
