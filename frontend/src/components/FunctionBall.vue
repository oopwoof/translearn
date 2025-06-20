<template>
  <div 
    class="function-ball"
    :class="{ 
      'is-dragging': isDragging,
      'is-disabled': disabled
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
    <div v-if="disabled" class="disabled-overlay">
      <el-icon class="lock-icon"><Lock /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock } from '@element-plus/icons-vue'

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
  }
})

const emit = defineEmits(['dragstart', 'dragend'])
const isDragging = ref(false)

const handleDragStart = (e) => {
  if (props.disabled) {
    e.preventDefault()
    ElMessage.warning(props.disabledReason)
    return
  }
  
  isDragging.value = true
  e.dataTransfer.setData('text/plain', JSON.stringify({
    id: props.id,
    label: props.label,
    prompt: props.prompt,
    icon: props.icon
  }))
  emit('dragstart', props)
}

const handleDragEnd = () => {
  isDragging.value = false
  emit('dragend')
}

const handleClick = () => {
  if (props.disabled) {
    ElMessage.warning(props.disabledReason)
  }
}
</script>

<style scoped>
.function-ball {
  width: 100px;
  height: 100px;
  border-radius: 12px;
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

.ball-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
  z-index: 1;
}

.ball-icon {
  font-size: 28px;
  color: #1E3050;
  transition: color 0.3s;
}

.function-ball.is-disabled .ball-icon {
  color: #c0c4cc;
}

.ball-label {
  font-size: 13px;
  color: #1E3050;
  text-align: center;
  font-weight: 500;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s;
}

.function-ball.is-disabled .ball-label {
  color: #c0c4cc;
}

.disabled-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
}

.lock-icon {
  font-size: 12px;
  color: #909399;
}
</style> 