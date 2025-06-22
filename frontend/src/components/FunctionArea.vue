<template>
  <div class="function-area" :class="{ expanded: isExpanded }">
    <div class="function-container">
      <div 
        class="function-grid"
        :class="{ selecting: isSelecting }"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        ref="functionGridRef"
      >
        <FunctionBall
          v-for="ball in availableFunctionBalls"
          :key="ball.id"
          v-bind="ball"
          :disabled="ball.disabled"
          :disabledReason="ball.disabledReason"
          :selected="selectedBallIds.includes(ball.id)"
          :ref="el => setBallRef(ball.id, el)"
          @dragstart="handleDragStart"
          @dragend="handleDragEnd"
          @click="handleBallClick"
        />
        
        <!-- 选择框 -->
        <div 
          v-if="isSelecting"
          class="selection-box"
          :style="selectionBoxStyle"
        ></div>
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
import { ref, computed, watch, nextTick, provide } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import FunctionBall from './FunctionBall.vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'zh-ar'
  },
  intent: {
    type: String,
    default: ''
  },
  reference: {
    type: String,
    default: ''
  },
  directRequest: {
    type: String,
    default: ''
  },
  excludedBallIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['ball-removed'])

const isExpanded = ref(false)

// 圈选相关状态
const isSelecting = ref(false)
const selectionStart = ref({ x: 0, y: 0 })
const selectionEnd = ref({ x: 0, y: 0 })
const selectedBallIds = ref([])
const functionGridRef = ref()
const ballRefs = ref(new Map())

// 多选拖拽相关状态
const isMultiDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// 选择框样式计算
const selectionBoxStyle = computed(() => {
  const start = selectionStart.value
  const end = selectionEnd.value
  
  const left = Math.min(start.x, end.x)
  const top = Math.min(start.y, end.y)
  const width = Math.abs(end.x - start.x)
  const height = Math.abs(end.y - start.y)
  
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    background: 'rgba(64, 158, 255, 0.1)',
    pointerEvents: 'none'
  }
})

const allFunctionBalls = computed(() => {
  // 所有功能球都显示，但根据输入框状态设置是否可拖拽
  return [
    {
      id: 'text-features',
      label: '文本特征分析',
      icon: 'Document',
      prompt: '输出文本特征',
      disabled: false,
      disabledReason: ''
    },
    {
      id: 'terminology',
      label: '专业术语、成语/习语',
      icon: 'Collection',
      prompt: '输出文本专业术语、成语/习语',
      disabled: false,
      disabledReason: ''
    },
    {
      id: 'suggestions',
      label: '翻译建议',
      icon: 'Light',
      prompt: '给出可直接供人工翻译使用的翻译建议',
      disabled: false,
      disabledReason: ''
    },
    {
      id: 'intent-analysis',
      label: '翻译意图/受众分析',
      icon: 'User',
      prompt: '分析翻译意图和受众',
      disabled: !props.intent || !props.intent.trim(),
      disabledReason: !props.intent || !props.intent.trim() ? '请先在控制面板输入"意图/受众"' : ''
    },
    {
      id: 'reference-analysis',
      label: '参考译文风格分析',
      icon: 'Files',
      prompt: '分析参考译文风格',
      disabled: !props.reference || !props.reference.trim(),
      disabledReason: !props.reference || !props.reference.trim() ? '请先在控制面板输入"参考译文风格"' : ''
    },
    {
      id: 'direct-request-analysis',
      label: '直接要求分析',
      icon: 'Flag',
      prompt: '分析直接要求',
      disabled: !props.directRequest || !props.directRequest.trim(),
      disabledReason: !props.directRequest || !props.directRequest.trim() ? '请先在控制面板输入"直接要求"' : ''
    }
  ]
})

// 过滤出可用的功能球（排除已经被拖入分析面板的）
const availableFunctionBalls = computed(() => {
  return allFunctionBalls.value.filter(ball => !props.excludedBallIds.includes(ball.id))
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const handleDragStart = (ball) => {
  // 如果拖拽的球在选中列表中，则进行多选拖拽
  if (selectedBallIds.value.includes(ball.id) && selectedBallIds.value.length > 1) {
    isMultiDragging.value = true
    console.log('🚀 开始多选拖拽:', selectedBallIds.value)
    
    // 设置多选拖拽数据
    const selectedBalls = selectedBallIds.value.map(id => {
      const ballData = availableFunctionBalls.value.find(b => b.id === id)
      return ballData
    }).filter(Boolean)
    
    // 创建一个包含所有选中球信息的数据传输对象
    const multiDragData = {
      isMultiDrag: true,
      balls: selectedBalls,
      count: selectedBalls.length
    }
    
    // 存储多选拖拽数据
    currentMultiDragData.value = multiDragData
    
    // 发出多选拖拽开始事件
    emit('multi-drag-start', multiDragData)
  } else {
    // 单个球拖拽，清空选择
    selectedBallIds.value = []
    isMultiDragging.value = false
    currentMultiDragData.value = null
  }
}

// 存储当前的多选拖拽数据，供子组件访问
const currentMultiDragData = ref(null)

// 监听多选拖拽开始事件，存储数据
const handleMultiDragStart = (multiDragData) => {
  currentMultiDragData.value = multiDragData
}

// 提供方法给子组件获取多选拖拽数据
const getMultiDragData = () => {
  return currentMultiDragData.value
}

// 清理多选拖拽数据
const clearMultiDragData = () => {
  currentMultiDragData.value = null
  isMultiDragging.value = false
}

// 暴露给子组件使用
provide('getMultiDragData', getMultiDragData)
provide('clearMultiDragData', clearMultiDragData)

const handleDragEnd = () => {
  // 拖拽结束后清理状态
  isMultiDragging.value = false
  currentMultiDragData.value = null
  console.log('🏁 拖拽结束，清理状态')
}

// 监听条件功能球的变化，当输入框清空时通知父组件移除对应的球
watch(() => [props.intent, props.reference, props.directRequest], (newValues, oldValues) => {
  const [newIntent, newReference, newDirectRequest] = newValues
  const [oldIntent, oldReference, oldDirectRequest] = oldValues

  try {
    // 检查意图/受众输入框是否被清空
    if (oldIntent && oldIntent.trim() && (!newIntent || !newIntent.trim())) {
      emit('ball-removed', 'intent-analysis')
      console.log('🗑️ 移除意图/受众分析功能球')
    }

    // 检查参考译文输入框是否被清空
    if (oldReference && oldReference.trim() && (!newReference || !newReference.trim())) {
      emit('ball-removed', 'reference-analysis')
      console.log('🗑️ 移除参考译文风格分析功能球')
    }

    // 检查直接要求输入框是否被清空
    if (oldDirectRequest && oldDirectRequest.trim() && (!newDirectRequest || !newDirectRequest.trim())) {
      emit('ball-removed', 'direct-request-analysis')
      console.log('🗑️ 移除直接要求分析功能球')
    }
  } catch (error) {
    console.error('❌ 处理功能球移除失败:', error)
  }
}, { deep: true })

const handleMouseDown = (event) => {
  // 如果点击的是功能球，不启动圈选
  if (event.target.closest('.function-ball')) {
    return
  }
  
  // 阻止默认行为和事件冒泡
  event.preventDefault()
  event.stopPropagation()
  
  const rect = functionGridRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  isSelecting.value = true
  selectionStart.value = { x, y }
  selectionEnd.value = { x, y }
  
  // 清空之前的选择
  selectedBallIds.value = []
}

const handleMouseMove = (event) => {
  if (!isSelecting.value) return
  
  event.preventDefault()
  
  const rect = functionGridRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  selectionEnd.value = { x, y }
  
  // 实时检测选中的功能球
  updateSelectedBalls()
}

const handleMouseUp = (event) => {
  if (!isSelecting.value) return
  
  isSelecting.value = false
  console.log('🎯 选中的功能球:', selectedBallIds.value)
}

const handleMouseLeave = (event) => {
  if (isSelecting.value) {
    isSelecting.value = false
  }
}

// 检测功能球是否与选择框重叠
const updateSelectedBalls = () => {
  const selectionRect = {
    left: Math.min(selectionStart.value.x, selectionEnd.value.x),
    top: Math.min(selectionStart.value.y, selectionEnd.value.y),
    right: Math.max(selectionStart.value.x, selectionEnd.value.x),
    bottom: Math.max(selectionStart.value.y, selectionEnd.value.y)
  }
  
  const selected = []
  
  ballRefs.value.forEach((ballElement, ballId) => {
    if (!ballElement || !ballElement.$el) return
    
    const ballEl = ballElement.$el
    const ballRect = ballEl.getBoundingClientRect()
    const gridRect = functionGridRef.value.getBoundingClientRect()
    
    // 将功能球的位置转换为相对于grid的坐标
    const ballRelativeRect = {
      left: ballRect.left - gridRect.left,
      top: ballRect.top - gridRect.top,
      right: ballRect.right - gridRect.left,
      bottom: ballRect.bottom - gridRect.top
    }
    
    // 检测重叠
    const isOverlapping = !(
      ballRelativeRect.right < selectionRect.left ||
      ballRelativeRect.left > selectionRect.right ||
      ballRelativeRect.bottom < selectionRect.top ||
      ballRelativeRect.top > selectionRect.bottom
    )
    
    if (isOverlapping) {
      // 检查功能球是否可用（未禁用）
      const ball = availableFunctionBalls.value.find(b => b.id === ballId)
      if (ball && !ball.disabled) {
        selected.push(ballId)
      }
    }
  })
  
  selectedBallIds.value = selected
}

const setBallRef = (id, el) => {
  if (el) {
    ballRefs.value.set(id, el)
  } else {
    ballRefs.value.delete(id)
  }
}

const handleBallClick = (ball) => {
  // 单击切换选中状态（用于精确选择）
  const index = selectedBallIds.value.indexOf(ball.id)
  if (index > -1) {
    selectedBallIds.value.splice(index, 1)
  } else if (!ball.disabled) {
    selectedBallIds.value.push(ball.id)
  }
}
</script>

<style scoped>
.function-area {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  padding: 8px 16px; /* 进一步减少内边距 */
  transition: var(--transition-smooth);
  flex-shrink: 0;
  border-bottom: 2px solid var(--desert-oasis-green);
  position: relative;
  z-index: 2;
  height: 100%; /* 使用父级设置的高度 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 🌟 功能区星空装饰 */
.function-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--bg-gradient-warm);
  z-index: 1;
}

.function-area::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(1px 1px at 20% 30%, var(--sky-horizon-blue), transparent),
    radial-gradient(1px 1px at 40% 70%, var(--twilight-purple), transparent),
    radial-gradient(1px 1px at 60% 20%, var(--desert-oasis-green), transparent),
    radial-gradient(2px 2px at 80% 80%, var(--desert-sand-gold), transparent),
    radial-gradient(1px 1px at 90% 40%, var(--sky-horizon-blue), transparent);
  background-repeat: repeat;
  background-size: 200px 150px;
  animation: star-field 40s linear infinite;
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}

@keyframes star-field {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}

.function-container {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  border-radius: var(--radius-xl);
  border: 1px solid var(--glass-border);
  padding: 8px 16px; /* 进一步减少内边距 */
  box-shadow: var(--glass-shadow);
  position: relative;
  transition: var(--transition-smooth);
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  z-index: 1;
}

/* 🏜️ 功能容器沙漠纹理 */
.function-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 0%, var(--sand-texture) 25%, transparent 50%),
    radial-gradient(circle at 70% 30%, var(--geometric-pattern) 0%, transparent 60%);
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}

.function-container:hover {
  transform: translateY(-1px); /* 减少悬浮效果以适应小空间 */
  box-shadow: var(--glass-shadow), var(--shadow-medium);
  border-color: var(--desert-oasis-green);
}

.function-grid {
  display: flex;
  justify-content: center;
  gap: 12px; /* 进一步减少间距 */
  padding: 2px;
  transition: var(--transition-smooth);
  flex-wrap: nowrap; /* 改为不换行，优先显示在一行 */
  position: relative;
  user-select: none;
  z-index: 2;
  min-height: 50px; /* 进一步减少最小高度 */
  flex: 1;
  align-items: center;
  overflow-x: auto; /* 允许水平滚动 */
  overflow-y: hidden;
}

/* 当空间不够时允许换行 */
@media (max-width: 1400px) {
  .function-grid {
    flex-wrap: wrap;
    overflow-x: visible;
  }
}

.expand-button {
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px; /* 进一步减小按钮尺寸 */
  height: 28px;
  background: var(--bg-gradient-warm);
  border-radius: var(--radius-round);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--glass-shadow);
  transition: var(--transition-smooth);
  z-index: 3;
  border: 2px solid var(--desert-oasis-green);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
}

.expand-button:hover {
  transform: translateX(-50%) translateY(-2px) scale(1.1);
  box-shadow: var(--glass-shadow), var(--shadow-glow);
  filter: brightness(1.1);
  animation: oasis-pulse 1s ease-out;
}

.expand-button .el-icon {
  font-size: 14px; /* 进一步减小图标尺寸 */
  color: white;
  transition: var(--transition-smooth);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.expand-button .is-expanded {
  transform: rotate(180deg);
}

.function-area.expanded .function-container {
  padding-bottom: 32px; /* 调整展开时的底部间距 */
}

.function-area.expanded .function-grid {
  min-height: 70px; /* 展开时的最小高度 */
  flex-wrap: wrap; /* 展开时允许换行 */
}

.function-area:not(.expanded) .function-grid {
  max-height: 60px; /* 折叠时进一步限制最大高度 */
  overflow: hidden;
}

.selection-box {
  position: absolute;
  border: 2px dashed var(--soft-blue);
  background: rgba(52, 152, 219, 0.1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-sizing: border-box;
  pointer-events: none;
  z-index: 10;
}

/* 🎨 确保功能球文本清晰可见 */
.function-area :deep(.function-ball) {
  min-width: 90px; /* 进一步减小最小宽度 */
  height: 48px; /* 进一步减小高度以适应空间 */
  transform: scale(0.9); /* 整体缩放以适应更小空间 */
}

.function-area :deep(.function-ball .ball-label) {
  color: var(--deep-blue, #2c3e50) !important;
  font-size: 11px; /* 进一步减小字体 */
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.function-area :deep(.el-icon) {
  color: var(--soft-blue, #3498db) !important;
}

/* 滚动条样式优化 */
.function-grid::-webkit-scrollbar {
  height: 4px;
}

.function-grid::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.function-grid::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 2px;
}

.function-grid::-webkit-scrollbar-thumb:hover {
  background: var(--soft-blue);
}

.function-grid.selecting {
  cursor: crosshair;
}

/* 为选中的功能球添加特殊样式 */
.function-grid :deep(.function-ball.is-selected) {
  animation: selected-glow 2s infinite alternate;
  z-index: 5;
}

@keyframes selected-glow {
  from {
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
  to {
    box-shadow: 0 8px 24px rgba(52, 152, 219, 0.5), 0 0 0 4px rgba(52, 152, 219, 0.1);
  }
}

/* 功能球悬停时的组合效果 */
.function-grid :deep(.function-ball:hover:not(.is-disabled)) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-strong);
  z-index: 4;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .function-area {
    padding: 14px 20px;
  }
  
  .function-container {
    padding: 18px 20px;
    border-radius: var(--radius-lg);
  }
  
  .function-grid {
    gap: 20px;
    min-height: 100px;
  }
}

@media (max-width: 768px) {
  .function-area {
    padding: 12px 16px;
  }
  
  .function-container {
    padding: 16px;
    border-radius: var(--radius-md);
  }
  
  .function-grid {
    gap: 16px;
    min-height: 80px;
  }
  
  .expand-button {
    width: 32px;
    height: 32px;
    bottom: -16px;
  }
  
  .expand-button .el-icon {
    font-size: 16px;
  }
}
</style> 