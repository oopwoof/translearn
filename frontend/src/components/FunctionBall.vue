<template>
  <div 
    class="function-ball"
    :class="{ 'is-dragging': isDragging }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="ball-content">
      <el-icon class="ball-icon"><component :is="icon" /></el-icon>
      <span class="ball-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

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
  }
})

const emit = defineEmits(['dragstart', 'dragend'])
const isDragging = ref(false)

const handleDragStart = (e) => {
  isDragging.value = true
  e.dataTransfer.setData('text/plain', JSON.stringify({
    id: props.id,
    label: props.label,
    prompt: props.prompt
  }))
  emit('dragstart', props)
}

const handleDragEnd = () => {
  isDragging.value = false
  emit('dragend')
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

.function-ball:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.function-ball.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
  z-index: 2;
}

.ball-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}

.ball-icon {
  font-size: 28px;
  color: #1E3050;
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
}
</style> 