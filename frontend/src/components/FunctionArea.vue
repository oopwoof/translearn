<template>
  <div class="function-area" :class="{ expanded: isExpanded }">
    <div class="function-container">
      <div class="function-grid">
        <FunctionBall
          v-for="ball in functionBalls"
          :key="ball.id"
          v-bind="ball"
          @dragstart="handleDragStart"
          @dragend="handleDragEnd"
        />
      </div>
      <div class="expand-button" @click="toggleExpand">
        <el-icon :class="{ 'is-expanded': isExpanded }">
          <ArrowDown />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import FunctionBall from './FunctionBall.vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'zh-ar'
  }
})

const isExpanded = ref(false)

const functionBalls = computed(() => {
  const balls = [
    {
      id: 'text-features',
      label: '文本特征分析',
      icon: 'Document',
      prompt: '输出文本特征'
    },
    {
      id: 'terminology',
      label: '专业术语和习语翻译策略',
      icon: 'Collection',
      prompt: '输出文本专业术语和习语及其翻译策略'
    },
    {
      id: 'suggestions',
      label: '翻译建议',
      icon: 'Light',
      prompt: '给出可直接供人工翻译使用的翻译建议'
    }
  ]

  return balls
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const handleDragStart = (ball) => {
  // 可以在这里添加拖拽开始的处理逻辑
}

const handleDragEnd = () => {
  // 可以在这里添加拖拽结束的处理逻辑
}
</script>

<style scoped>
.function-area {
  background: #f5f7fa;
  padding: 12px 20px;
  transition: all 0.3s;
  flex-shrink: 0;
  border-bottom: 1px solid #e4e7ed;
}

.function-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s;
}

.function-grid {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 4px;
  transition: all 0.3s;
}

.expand-button {
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  z-index: 1;
}

.expand-button:hover {
  transform: translateX(-50%) scale(1.1);
}

.expand-button .el-icon {
  font-size: 16px;
  color: #1E3050;
  transition: transform 0.3s;
}

.expand-button .is-expanded {
  transform: rotate(180deg);
}

.function-area.expanded .function-container {
  padding-bottom: 32px;
}

.function-area:not(.expanded) .function-grid {
  max-height: 80px;
  overflow: hidden;
}
</style> 