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
      <el-icon class="ball-icon"><component :is="icon" /></el-icon>
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
  
  // 阻止事件冒泡，避免触发父组件的圈选
  e.stopPropagation()
  emit('click', props)
}
</script>

<style scoped>
.function-ball {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
}

.function-ball:hover:not(.is-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.function-ball.is-selected {
  border-color: #409EFF;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.function-ball.is-selected:hover {
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.ball-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  pointer-events: none;
  z-index: 1;
}

.ball-icon {
  font-size: 22px;
  color: #1E3050;
  transition: color 0.3s;
}

.function-ball.is-disabled .ball-icon {
  color: #c0c4cc;
}

.function-ball.is-selected .ball-icon {
  color: #409EFF;
}

.ball-label {
  font-size: 11px;
  color: #1E3050;
  text-align: center;
  font-weight: 500;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s;
  line-height: 1.2;
}

.function-ball.is-disabled .ball-label {
  color: #c0c4cc;
}

.function-ball.is-selected .ball-label {
  color: #409EFF;
  font-weight: 600;
}

.selected-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: #409EFF;
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.check-icon {
  font-size: 10px;
  color: white;
}

.disabled-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
}

.lock-icon {
  font-size: 10px;
  color: #909399;
}
</style> 