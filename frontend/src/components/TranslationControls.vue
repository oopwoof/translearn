<template>
    <div class="translation-controls">
      <!-- 输入字段区域 -->
      <div class="control-group">
        <label class="control-label">意图/受众</label>
        <el-input
          v-model="localIntent"
          @update:model-value="updateIntent"
          type="textarea"
          :rows="3"
          placeholder="如：商务伙伴、学术交流..."
          class="control-input"
        />
      </div>
  
      <div class="control-group">
        <label class="control-label">参考译文风格</label>
        <el-input
          v-model="localReference"
          @update:model-value="updateReference"
          type="textarea"
          :rows="3"
          placeholder="粘贴或输入参考译文..."
          class="control-input"
        />
      </div>
  
      <div class="control-group">
        <label class="control-label">直接要求</label>
        <el-input
          v-model="localDirectRequest"
          @update:model-value="updateDirectRequest"
          type="textarea"
          :rows="3"
          placeholder="如：保留礼貌用语、使用正式语体..."
          class="control-input"
        />
      </div>

      <!-- 质量选择和翻译按钮区域 - 底部 -->
      <div class="translation-section">
        <div class="quality-selector">
          <label class="quality-label">翻译质量</label>
          <div class="quality-options">
            <button 
              class="quality-option"
              :class="{ active: quality === 'fast' }"
              @click="updateQuality('fast')"
            >
              速翻
            </button>
            <button 
              class="quality-option"
              :class="{ active: quality === 'standard' }"
              @click="updateQuality('standard')"
            >
              标准
            </button>
            <button 
              class="quality-option"
              :class="{ active: quality === 'premium' }"
              @click="updateQuality('premium')"
            >
              精修
            </button>
          </div>
        </div>
        
        <el-button 
          type="primary" 
          size="default"
          @click="handleTranslate"
          :disabled="!quality"
          :loading="loading"
          class="translate-button gold-button"
          style="--el-button-bg-color: #8B6914; --el-button-border-color: #8B6914; --el-button-hover-bg-color: #B8860B; --el-button-hover-border-color: #B8860B;"
        >
          {{ loading ? '翻译中...' : '开始翻译' }}
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    intent: String,
    reference: String,
    directRequest: String,
    quality: {
      type: String,
      default: ''
    },
    loading: Boolean
  })
  
  const emit = defineEmits([
    'update:intent',
    'update:reference',
    'update:directRequest',
    'update:quality',
    'translate'
  ])

  const localIntent = ref(props.intent || '')
  const localReference = ref(props.reference || '')
  const localDirectRequest = ref(props.directRequest || '')

  // 监听props变化
  watch(() => props.intent, (newVal) => {
    localIntent.value = newVal || ''
  })

  watch(() => props.reference, (newVal) => {
    localReference.value = newVal || ''
  })

  watch(() => props.directRequest, (newVal) => {
    localDirectRequest.value = newVal || ''
  })

  const updateIntent = (value) => {
    localIntent.value = value
    emit('update:intent', value)
  }

  const updateReference = (value) => {
    localReference.value = value
    emit('update:reference', value)
  }

  const updateDirectRequest = (value) => {
    localDirectRequest.value = value
    emit('update:directRequest', value)
  }

  const updateQuality = (value) => {
    emit('update:quality', value)
  }

  const handleTranslate = () => {
    emit('translate')
  }
  </script>
  
  <style scoped>
  .translation-controls {
  background: linear-gradient(135deg, 
    #0d5015 0%, 
    #166534 50%, 
    #22c55e 100%);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(13, 80, 21, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.2);
  height: fit-content;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  font-size: 12px;
  color: white;
  position: relative;
}
  
  .translation-controls::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 20px;
    bottom: 20px;
    width: 3px;
    background: linear-gradient(180deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.3) 20%, 
      rgba(255, 255, 255, 0.6) 50%, 
      rgba(255, 255, 255, 0.3) 80%, 
      transparent 100%);
    border-radius: 2px;
  }
  

  
  .control-group {
    margin-bottom: 16px;
  }
  

  
  .control-label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
    color: white;
    font-size: 12px;
  }
  
  .control-input {
    width: 100%;
  }
  
  .control-input :deep(.el-input__inner) {
    font-size: 11px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    color: #0d5015;
    transition: all 0.3s ease;
    font-weight: 500;
  }
  
  .control-input :deep(.el-input__inner):focus {
    border-color: white;
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
  }
  
  .control-input :deep(.el-textarea__inner) {
    font-size: 11px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    color: #0d5015;
    transition: all 0.3s ease;
    font-weight: 500;
  }
  
  .control-input :deep(.el-textarea__inner):focus {
    border-color: white;
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
  }
  
  .control-input :deep(.el-input__inner)::placeholder,
  .control-input :deep(.el-textarea__inner)::placeholder {
    color: white !important;
    font-style: italic;
    font-weight: 400;
    opacity: 0.7;
  }
  

  
  /* 翻译区域 - 底部 */
  .translation-section {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 2px solid rgba(255, 255, 255, 0.2);
    position: relative;
  }
  
  .translation-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.4) 50%,
      transparent 100%);
  }
  
  .quality-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: white;
    font-size: 11px;
  }
  
  .quality-selector {
    margin-bottom: 12px;
  }
  
  .quality-options {
    display: flex;
    gap: 4px;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(34, 139, 34, 0.25);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
  }
  
  .quality-option {
    flex: 1;
    padding: 8px 6px;
    text-align: center;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-right: 1px solid rgba(34, 139, 34, 0.15);
    transition: all 0.3s ease;
    font-size: 11px;
    font-weight: 500;
    color: white;
    position: relative;
  }
  
  .quality-option:last-child {
    border-right: none;
  }
  
  .quality-option:hover {
    background: rgba(34, 139, 34, 0.15);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(34, 139, 34, 0.2);
  }
  
  .quality-option.active {
    background: linear-gradient(135deg, var(--forest-green) 0%, var(--accent-emerald) 100%);
    color: white;
    font-weight: 600;
    transform: translateY(-1px);
    box-shadow: 
      0 4px 12px rgba(34, 139, 34, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .quality-option.active::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 2px;
    background: white;
    border-radius: 1px;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
  
  .translate-button {
    width: 100%;
    height: 38px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 19px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .translate-button :deep(.el-button),
  .translate-button :deep(.el-button.el-button--primary) {
    background: linear-gradient(135deg, #8B6914 0%, #B8860B 100%) !important;
    background-color: #8B6914 !important;
    border-color: #8B6914 !important;
    color: white !important;
    font-weight: 600;
  }
  
  .translate-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.2) 50%, 
      transparent 100%);
    transition: left 0.6s ease;
    pointer-events: none;
    z-index: 1;
  }
  
  .translate-button:hover {
    transform: translateY(-2px);
  }
  
  .translate-button:hover :deep(.el-button),
  .translate-button:hover :deep(.el-button.el-button--primary) {
    background: linear-gradient(135deg, #B8860B 0%, #CD853F 100%) !important;
    background-color: #B8860B !important;
    border-color: #B8860B !important;
    box-shadow: 
      0 6px 20px rgba(139, 105, 20, 0.4),
      0 0 15px rgba(184, 134, 11, 0.3) !important;
  }
  
  .translate-button:hover::before {
    left: 100%;
  }
  
  .translate-button:active {
    transform: translateY(0);
  }
  
  .translate-button :deep(.el-button:disabled),
  .translate-button :deep(.el-button.el-button--primary:disabled) {
    background: rgba(255, 255, 255, 0.1) !important;
    background-color: rgba(255, 255, 255, 0.1) !important;
    border-color: rgba(128, 128, 128, 0.3) !important;
    color: rgba(255, 255, 255, 0.5) !important;
    cursor: not-allowed;
  }
  
  /* 添加更强的样式覆盖 */
  .translate-button :deep(.el-button--primary),
  .translate-button :deep(.el-button--primary:not(.is-disabled)),
  .translate-button :deep(.el-button--primary:focus),
  .translate-button :deep(.el-button--primary:active) {
    background: linear-gradient(135deg, #8B6914 0%, #B8860B 100%) !important;
    background-color: #8B6914 !important;
    border-color: #8B6914 !important;
    color: white !important;
  }
  
  .translate-button:hover :deep(.el-button--primary),
  .translate-button:hover :deep(.el-button--primary:not(.is-disabled)),
  .translate-button:hover :deep(.el-button--primary:focus),
  .translate-button:hover :deep(.el-button--primary:active) {
    background: linear-gradient(135deg, #B8860B 0%, #CD853F 100%) !important;
    background-color: #B8860B !important;
    border-color: #B8860B !important;
    color: white !important;
  }
  
  .translate-button:has(:disabled) {
    transform: none !important;
  }
  
  .translate-button:has(:disabled)::before {
    display: none;
  }
  
  /* 金色按钮的额外样式覆盖 */
  .gold-button.el-button--primary {
    --el-color-primary: #8B6914 !important;
    --el-color-primary-light-3: #B8860B !important;
    --el-color-primary-light-5: #CD853F !important;
    --el-color-primary-light-7: #DAA520 !important;
    --el-color-primary-light-8: #F0E68C !important;
    --el-color-primary-light-9: #FFFFE0 !important;
    --el-color-primary-dark-2: #704D0A !important;
    background: linear-gradient(135deg, #8B6914 0%, #B8860B 100%) !important;
    border-color: #8B6914 !important;
  }
  
  .gold-button.el-button--primary:hover {
    background: linear-gradient(135deg, #B8860B 0%, #CD853F 100%) !important;
    border-color: #B8860B !important;
  }
  </style>
  