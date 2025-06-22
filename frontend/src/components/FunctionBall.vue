<template>
  <div 
    class="function-ball"
    :class="{ 
      'is-dragging': isDragging,
      'is-disabled': disabled,
      'is-selected': selected,
      'is-confirmed': confirmed
    }"
    :draggable="!disabled"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="handleClick"
    :title="disabled ? disabledReason : ''"
  >
    <div class="ball-content">
      <el-icon class="ball-icon"><component :is="icon" /></el-icon>
      <span class="ball-label">{{ label }}</span>
    </div>
    
    <!-- 选中状态指示器 -->
    <div v-if="selected && !confirmed" class="selected-indicator">
      <el-icon class="check-icon"><Check /></el-icon>
    </div>
    
    <!-- 确认状态指示器 -->
    <div v-if="confirmed" class="confirmed-indicator">
      <el-icon class="star-icon"><Star /></el-icon>
    </div>
    
    <div v-if="disabled" class="disabled-overlay">
      <el-icon class="lock-icon"><Lock /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock, Check, Star } from '@element-plus/icons-vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
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
  },
  confirmed: {
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
        icon: props.icon,
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
  
  // 阻止事件冒泡
  e.stopPropagation()
  
  // 发送点击事件给父组件
  emit('click', props)
}
</script>

<style scoped>
.function-ball {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: move;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: none;
  position: relative;
  z-index: 1;
  border: 2px solid transparent;
  flex-shrink: 0;
}

/* 🏜️ 功能球沙漠装饰 */
.function-ball::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: 
    radial-gradient(circle at 30% 30%, var(--sand-texture) 0%, transparent 70%),
    radial-gradient(circle at 70% 70%, var(--geometric-pattern) 0%, transparent 70%);
  opacity: 0.2;
  pointer-events: none;
  z-index: 0;
}

.function-ball:hover:not(.is-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--sky-horizon-blue);
}

.function-ball:hover:not(.is-disabled)::before {
  opacity: 0.4;
  animation: oasis-ripple 2s ease-out;
}

.function-ball.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
  z-index: 2;
}

.function-ball.is-disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.function-ball.is-disabled:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.function-ball.is-selected {
  border-color: var(--desert-oasis-green);
  box-shadow: 
    0 2px 8px rgba(34, 139, 34, 0.3),
    0 0 0 4px rgba(34, 139, 34, 0.1);
  background: radial-gradient(circle at center, rgba(34, 139, 34, 0.05) 0%, white 70%);
}

.function-ball.is-selected:hover {
  box-shadow: 
    0 4px 12px rgba(34, 139, 34, 0.4),
    0 0 0 6px rgba(34, 139, 34, 0.15);
  animation: oasis-pulse 2s infinite;
}

.function-ball.is-confirmed {
  border-color: var(--desert-sand-gold);
  box-shadow: 0 2px 8px rgba(232, 216, 176, 0.4);
  background: linear-gradient(135deg, 
    rgba(232, 216, 176, 0.1) 0%, 
    white 50%, 
    rgba(199, 177, 225, 0.1) 100%);
}

.function-ball.is-confirmed:hover {
  box-shadow: 0 4px 12px rgba(232, 216, 176, 0.6);
  transform: translateY(-2px);
}

.function-ball.is-confirmed .ball-icon {
  color: var(--desert-sand-gold);
}

.function-ball.is-confirmed .ball-label {
  color: var(--desert-sand-gold);
  font-weight: 600;
}

.ball-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
  z-index: 1;
}

.ball-icon {
  font-size: 20px;
  color: var(--sky-horizon-blue);
  transition: color 0.3s;
  z-index: 2;
  position: relative;
}

.function-ball.is-disabled .ball-icon {
  color: #c0c4cc;
}

.function-ball.is-selected .ball-icon {
  color: var(--desert-oasis-green);
}

.ball-label {
  font-size: 9px;
  color: var(--deep-blue);
  text-align: center;
  font-weight: 500;
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s;
  line-height: 1.1;
  z-index: 2;
  position: relative;
}

.function-ball.is-disabled .ball-label {
  color: #c0c4cc;
}

.function-ball.is-selected .ball-label {
  color: var(--desert-oasis-green);
  font-weight: 600;
}

.selected-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: var(--desert-oasis-green);
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  animation: twinkle 2s ease-in-out infinite alternate;
}

.check-icon {
  font-size: 8px;
  color: white;
}

.confirmed-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: #FFD700;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.star-icon {
  font-size: 8px;
  color: white;
}

.disabled-overlay {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
}

.lock-icon {
  font-size: 8px;
  color: #909399;
}
</style> 