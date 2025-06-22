<template>
  <div class="mode-selector">
    <div class="mode-title">翻译模式</div>
    <div class="mode-buttons">
      <button 
        class="mode-button"
        :class="{ active: mode === 'zh-ar' }"
        @click="updateMode('zh-ar')"
      >
        中-阿
      </button>
      <button 
        class="mode-button"
        :class="{ active: mode === 'ar-zh' }"
        @click="updateMode('ar-zh')"
      >
        阿-中
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  mode: {
    type: String,
    default: 'zh-ar'
  }
})

const emit = defineEmits(['update:mode'])

const updateMode = (mode) => {
  emit('update:mode', mode)
}
</script>

<style scoped>
.mode-selector {
  background: linear-gradient(135deg, 
    #0d5015 0%, 
    #166534 50%, 
    #22c55e 100%);
  border-radius: 10px;
  padding: 6px 10px;
  box-shadow: 
    0 8px 32px rgba(13, 80, 21, 0.4),
    0 0 20px rgba(34, 139, 34, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  position: relative;
  min-width: 112px;
}

.mode-selector::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15px;
  right: 15px;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.6) 50%,
    transparent 100%);
}

.mode-title {
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 6px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
}

.mode-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 25%;
  right: 25%;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%);
}

.mode-buttons {
  display: flex;
  gap: 6px;
}

.mode-button {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 6px 5px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 29px;
  font-size: 11px;
  font-weight: 700;
}

.mode-button:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.2),
    0 0 15px rgba(255, 255, 255, 0.2);
}

.mode-button.active {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
  transform: translateY(-1px);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.25),
    0 0 20px rgba(255, 255, 255, 0.4),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
  font-weight: 800;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.mode-button.active::before {
  content: '';
  position: absolute;
  top: 3px;
  right: 3px;
  width: 5px;
  height: 5px;
  background: #FFD700;
  border-radius: 50%;
  opacity: 0.9;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
</style> 