<template>
  <div id="app" class="desert-app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

let timeUpdateInterval = null

// 🌅 时间响应色彩系统
const updateTimeTheme = () => {
  const hour = new Date().getHours()
  let timeTheme = 'morning'
  
  if (hour >= 6 && hour < 12) {
    timeTheme = 'morning'    // 晨曦：绿洲绿主导
  } else if (hour >= 12 && hour < 18) {
    timeTheme = 'afternoon'  // 午后：天穹蓝主导  
  } else {
    timeTheme = 'evening'    // 暮色：紫色主导
  }
  
  document.documentElement.setAttribute('data-time', timeTheme)
  console.log(`🌅 切换到${timeTheme}主题 (${hour}:00)`)
}

onMounted(() => {
  // 立即设置主题
  updateTimeTheme()
  
  // 每30分钟检查一次时间变化
  timeUpdateInterval = setInterval(updateTimeTheme, 30 * 60 * 1000)
})

onUnmounted(() => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
  }
})
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
  transition: var(--transition-smooth);
}

/* 🏜️ 沙漠应用容器装饰 */
.desert-app {
  position: relative;
}

.desert-app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 10% 10%, var(--geometric-pattern) 0%, transparent 40%),
    radial-gradient(circle at 90% 90%, var(--sand-texture) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, var(--geometric-pattern) 0%, transparent 60%);
  pointer-events: none;
  z-index: -1;
  opacity: 0.3;
  animation: dune-flow 30s ease-in-out infinite;
}

/* 移除Vue默认样式 */
.logo {
  display: none;
}
</style>
