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
  background: rgba(255, 255, 255, 0.05); /* 进一步降低不透明度 */
  backdrop-filter: blur(15px);
  padding: 8px 15px;
  transition: all 0.3s ease;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(218, 165, 32, 0.3);
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

/* 添加顶部装饰线条 */
.function-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--forest-green) 20%, 
    var(--deep-green) 50%, 
    var(--forest-green) 80%, 
    transparent 100%);
  opacity: 0.8;
}

.function-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-md);
  padding: 8px 15px;
  box-shadow: 
    0 8px 32px var(--shadow-light),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(34, 139, 34, 0.4); /* 使用森林绿 */
  position: relative;
  transition: all 0.3s ease;
}

/* 添加内部装饰线条 */
.function-container::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(34, 139, 34, 0.5) 50%, /* 使用森林绿 */
    transparent 100%);
}

.function-grid {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 2px;
  transition: all 0.3s ease;
  flex-wrap: wrap;
  position: relative;
  user-select: none;
}

.function-grid.selecting {
  cursor: crosshair;
}

.expand-button {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(34, 139, 34, 0.6); /* 使用森林绿 */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 
    0 4px 16px var(--shadow-light),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  z-index: 1;
}

.expand-button:hover {
  transform: translateX(-50%) scale(1.1);
  background: var(--forest-green);
  color: white;
  box-shadow: 
    0 6px 20px var(--shadow-medium),
    0 0 20px rgba(34, 139, 34, 0.6); /* 使用森林绿光晕 */
}

.expand-button .el-icon {
  font-size: 12px;
  color: var(--text-dark);
  transition: all 0.3s ease;
}

.expand-button:hover .el-icon {
  color: white;
}

.expand-button .is-expanded {
  transform: rotate(180deg);
}

.function-area.expanded .function-container {
  padding-bottom: 24px;
}

.function-area:not(.expanded) .function-grid {
  max-height: 60px;
  overflow: hidden;
}

.selection-box {
  position: absolute;
  border: 2px dashed var(--forest-green);
  background: rgba(34, 139, 34, 0.15); /* 使用森林绿 */
  box-sizing: border-box;
  pointer-events: none;
  border-radius: var(--radius-sm);
  animation: selection-pulse 1.5s ease-in-out infinite alternate;
}

@keyframes selection-pulse {
  from {
    border-color: var(--forest-green);
    background: rgba(34, 139, 34, 0.1); /* 使用森林绿 */
  }
  to {
    border-color: var(--deep-green);
    background: rgba(0, 100, 0, 0.2); /* 使用深绿色 */
  }
}

/* 为选中的功能球添加特殊样式 */
.function-grid :deep(.function-ball.is-selected) {
  animation: selected-glow 2s ease-in-out infinite alternate;
}

@keyframes selected-glow {
  from {
    box-shadow: 0 8px 25px rgba(34, 139, 34, 0.4); /* 使用森林绿 */
    transform: translateY(-2px);
  }
  to {
    box-shadow: 0 12px 35px rgba(0, 100, 0, 0.6); /* 使用深绿色 */
    transform: translateY(-4px);
  }
}
</style> 