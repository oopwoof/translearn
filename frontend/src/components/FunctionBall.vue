<template>
  <div 
    class="function-ball"
    :class="{ 
      'is-dragging': isDragging,
      'is-disabled': disabled,
      'is-selected': selected
    }"
    :draggable="!disabled"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="handleClick"
    :title="disabled ? disabledReason : ''"
  >
    <div class="ball-content">
      <span class="ball-label">{{ label }}</span>
    </div>
    
    <!-- 选中状态指示器 -->
    <div v-if="selected" class="selected-indicator">
      <el-icon class="check-icon"><Check /></el-icon>
    </div>
    
    <div v-if="disabled" class="disabled-overlay">
      <el-icon class="lock-icon"><Lock /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock, Check } from '@element-plus/icons-vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },

  prompt: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  disabledReason: {
    type: String,
    default: ''
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['dragstart', 'dragend', 'click'])
const isDragging = ref(false)

// 注入父组件提供的方法
const getMultiDragData = inject('getMultiDragData', () => null)
const clearMultiDragData = inject('clearMultiDragData', () => {})

const handleDragStart = (e) => {
  if (props.disabled) {
    e.preventDefault()
    ElMessage.warning(props.disabledReason)
    return
  }
  
  isDragging.value = true
  
  // 先触发父组件的 dragstart 事件，这样会设置多选拖拽数据
  emit('dragstart', props)
  
  // 等待一个微任务，确保父组件已经处理完 dragstart 事件
  nextTick(() => {
    // 检查是否有多选拖拽数据
    const multiDragData = getMultiDragData()
    
    if (multiDragData && multiDragData.isMultiDrag) {
      // 多选拖拽：设置多选数据
      console.log('🎯 设置多选拖拽数据:', multiDragData)
      e.dataTransfer.setData('text/plain', JSON.stringify(multiDragData))
    } else {
      // 单个拖拽：设置单个功能球数据
      const dragData = {
        id: props.id,
        label: props.label,
        prompt: props.prompt,
        selected: props.selected,
        isMultiDrag: false
      }
      
      e.dataTransfer.setData('text/plain', JSON.stringify(dragData))
    }
  })
}

const handleDragEnd = () => {
  isDragging.value = false
  clearMultiDragData() // 清理多选拖拽数据
  emit('dragend')
}

const handleClick = (e) => {
  if (props.disabled) {
    ElMessage.warning(props.disabledReason)
    return
  }
  
  // 阻止事件冒泡，避免触发父组件的圈选
  e.stopPropagation()
  emit('click', props)
}
</script>

<style scoped>
.function-ball {
  width: 80px;
  height: 48px;
  border-radius: 40px 40px 40px 40px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(34, 139, 34, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* 添加绿色边框装饰 */
.function-ball::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 40px;
  padding: 1px;
  background: linear-gradient(135deg, 
    var(--forest-green) 0%, 
    var(--accent-emerald) 50%, 
    var(--forest-green) 100%);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.function-ball:hover::before {
  opacity: 0.6;
}

.function-ball:hover {
  transform: translateY(-3px) scale(1.05);
  border-color: var(--forest-green);
  background: rgba(255, 255, 255, 0.35);
  box-shadow: 
    0 8px 30px rgba(34, 139, 34, 0.3),
    0 0 20px rgba(80, 200, 120, 0.2),
    inset 0 2px 0 rgba(255, 255, 255, 0.4);
}

.function-ball:active {
  transform: translateY(-1px) scale(1.02);
  cursor: grabbing;
}

.function-ball.is-selected {
  background: linear-gradient(135deg, 
    rgba(34, 139, 34, 0.15) 0%,
    rgba(80, 200, 120, 0.2) 50%,
    rgba(34, 139, 34, 0.1) 100%);
  border: 2px solid var(--forest-green);
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(34, 139, 34, 0.4),
    0 0 15px rgba(80, 200, 120, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.4);
}

.function-ball.is-selected::before {
  opacity: 0.8;
}

.function-ball.is-dragging {
  opacity: 0.7;
  transform: scale(0.95) translateY(-5px);
  z-index: 2;
  box-shadow: 0 15px 40px var(--shadow-medium);
}

.function-ball.is-disabled {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(5px);
  cursor: not-allowed;
  opacity: 0.5;
}

.function-ball.is-disabled:hover {
  transform: none;
  box-shadow: 0 8px 25px var(--shadow-light);
}

.ball-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
  height: 100%;
}



.ball-label {
  font-size: 12px;
  color: var(--text-dark);
  text-align: center;
  font-weight: 500;
  max-width: 72px;
  padding: 0 4px;
  transition: all 0.3s ease;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.function-ball.is-disabled .ball-label {
  color: var(--text-light);
}

.function-ball.is-selected .ball-label {
  color: var(--forest-green);
  font-weight: 600;
  transform: scale(1.05);
}

.selected-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, var(--forest-green) 0%, var(--accent-emerald) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 2px 8px rgba(34, 139, 34, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  animation: selected-pulse 2s ease-in-out infinite;
}

/* 金色小点缀 - 只在选中状态添加 */
.selected-indicator::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: -2px;
  width: 4px;
  height: 4px;
  background: var(--desert-gold);
  border-radius: 50%;
  opacity: 0.9;
}

@keyframes selected-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 
      0 2px 8px rgba(34, 139, 34, 0.4),
      0 0 0 0 rgba(80, 200, 120, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 
      0 4px 12px rgba(34, 139, 34, 0.6),
      0 0 0 4px rgba(80, 200, 120, 0.2);
  }
}

.selected-indicator .el-icon {
  font-size: 10px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.check-icon {
  font-size: 10px;
  color: white;
  font-weight: bold;
}

.disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(128, 128, 128, 0.6);
  backdrop-filter: blur(2px);
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  border: 1px solid rgba(128, 128, 128, 0.4);
}

.disabled-icon {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.lock-icon {
  font-size: 10px;
  color: var(--text-light);
}
</style> 