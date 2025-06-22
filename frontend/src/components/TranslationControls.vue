<template>
    <div class="translation-controls">
      <div class="control-group">
        <label class="control-label">意图/受众</label>
        <el-input
          v-model="localIntent"
          @update:model-value="updateIntent"
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
          placeholder="如：保留礼貌用语、使用正式语体..."
          class="control-input"
        />
      </div>
  
      <!-- 模式选择按钮组 -->
      <div class="mode-buttons">
        <div 
          class="mode-button"
          :class="{ 
            active: mode === 'zh-ar',
            expanded: expandedMode === 'zh-ar'
          }"
          @click="handleModeClick('zh-ar')"
        >
          <span class="mode-label">中-阿</span>
          <div v-if="expandedMode === 'zh-ar'" class="expanded-controls">
            <div class="quality-selector">
              <div 
                class="quality-option"
                :class="{ active: quality === 'fast' }"
                @click.stop="updateQuality('fast')"
              >
                速翻
              </div>
              <div 
                class="quality-option"
                :class="{ active: quality === 'standard' }"
                @click.stop="updateQuality('standard')"
              >
                标准
              </div>
              <div 
                class="quality-option"
                :class="{ active: quality === 'premium' }"
                @click.stop="updateQuality('premium')"
              >
                精修
              </div>
            </div>
            <el-button 
              type="primary" 
              size="small"
              @click.stop="handleTranslate"
              :disabled="!quality"
              :loading="loading"
            >
              {{ loading ? '翻译中...' : '开始翻译' }}
            </el-button>
          </div>
        </div>

        <div 
          class="mode-button"
          :class="{ 
            active: mode === 'ar-zh',
            expanded: expandedMode === 'ar-zh'
          }"
          @click="handleModeClick('ar-zh')"
        >
          <span class="mode-label">阿-中</span>
          <div v-if="expandedMode === 'ar-zh'" class="expanded-controls">
            <div class="quality-selector">
              <div 
                class="quality-option"
                :class="{ active: quality === 'fast' }"
                @click.stop="updateQuality('fast')"
              >
                速翻
              </div>
              <div 
                class="quality-option"
                :class="{ active: quality === 'standard' }"
                @click.stop="updateQuality('standard')"
              >
                标准
              </div>
              <div 
                class="quality-option"
                :class="{ active: quality === 'premium' }"
                @click.stop="updateQuality('premium')"
              >
                精修
              </div>
            </div>
            <el-button 
              type="primary" 
              size="small"
              @click.stop="handleTranslate"
              :disabled="!quality"
              :loading="loading"
            >
              {{ loading ? '翻译中...' : '开始翻译' }}
            </el-button>
          </div>
        </div>
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
    mode: {
      type: String,
      default: 'zh-ar'
    },
    loading: Boolean
  })
  
  const emit = defineEmits([
    'update:intent',
    'update:reference',
    'update:directRequest',
    'update:quality',
    'update:mode',
    'translate'
  ])

  const expandedMode = ref(null)
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

  const handleModeClick = (mode) => {
    if (expandedMode.value === mode) {
      expandedMode.value = null
    } else {
      expandedMode.value = mode
      emit('update:mode', mode)
    }
  }

  const handleTranslate = () => {
    emit('translate')
  }
  </script>
  
  <style scoped>
  .translation-controls {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border-radius: var(--radius-md);
    padding: 12px;
    box-shadow: 
      0 8px 32px var(--shadow-light),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(34, 139, 34, 0.4);
    height: fit-content;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    font-size: 12px;
    color: var(--text-dark);
    position: relative;
  }
  
  .translation-controls::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 15px;
    bottom: 15px;
    width: 2px;
    background: linear-gradient(180deg, 
      transparent 0%, 
      var(--forest-green) 20%, 
      var(--deep-green) 50%, 
      var(--forest-green) 80%, 
      transparent 100%);
    opacity: 0.8;
    border-radius: 1px;
  }
  
  .translation-controls::after {
    content: '';
    position: absolute;
    right: 6px;
    top: 25%;
    bottom: 25%;
    width: 1px;
    background: linear-gradient(180deg, 
      transparent 0%, 
      rgba(34, 139, 34, 0.6) 50%,
      transparent 100%);
    opacity: 0.7;
  }
  
  .control-group {
    margin-bottom: 12px;
    position: relative;
    padding-left: 8px;
  }
  
  .control-group::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 3px;
    height: 100%;
    background: linear-gradient(180deg, 
      rgba(34, 139, 34, 0.3) 0%,
      rgba(80, 200, 120, 0.6) 50%,
      rgba(34, 139, 34, 0.3) 100%);
    border-radius: 0 2px 2px 0;
  }
  
  .control-label {
    display: block;
    margin-bottom: 4px;
    font-weight: 600;
    color: var(--text-dark);
    font-size: 11px;
  }
  
  .control-input {
    width: 100%;
  }
  
  .control-input :deep(.el-input__inner) {
    font-size: 11px;
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(34, 139, 34, 0.4);
    border-radius: var(--radius-sm);
    color: var(--text-dark);
    transition: all 0.3s ease;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .control-input :deep(.el-input__inner):focus {
    border-color: var(--forest-green);
    box-shadow: 
      0 0 0 2px rgba(34, 139, 34, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.35);
  }
  
  .control-input :deep(.el-textarea__inner) {
    font-size: 11px;
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(34, 139, 34, 0.4);
    border-radius: var(--radius-sm);
    color: var(--text-dark);
    transition: all 0.3s ease;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .control-input :deep(.el-textarea__inner):focus {
    border-color: var(--forest-green);
    box-shadow: 
      0 0 0 2px rgba(34, 139, 34, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.35);
  }
  
  .mode-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
    position: relative;
  }
  
  .mode-buttons::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(34, 139, 34, 0.6) 50%,
      transparent 100%);
  }
  
  .mode-button {
    width: 100%;
    height: 36px;
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(34, 139, 34, 0.35);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  
  .mode-button::before {
    content: '';
    position: absolute;
    top: 3px;
    right: 3px;
    width: 6px;
    height: 6px;
    border: 1px solid rgba(34, 139, 34, 0.6);
    border-left: none;
    border-bottom: none;
    opacity: 0.8;
  }
  
  .mode-button:hover {
    border-color: var(--forest-green);
    background: rgba(34, 139, 34, 0.15);
    transform: translateY(-1px);
    box-shadow: 
      0 4px 16px var(--shadow-light),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }
  
  .mode-button.active {
    background: linear-gradient(135deg, var(--forest-green) 0%, var(--accent-emerald) 100%);
    border-color: var(--deep-green);
    color: white;
    box-shadow: 
      0 6px 20px rgba(34, 139, 34, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .mode-button.active::after {
    content: '';
    position: absolute;
    bottom: 3px;
    left: 3px;
    width: 3px;
    height: 3px;
    background: var(--desert-gold);
    border-radius: 50%;
    opacity: 0.8;
  }
  
  .mode-button.expanded {
    width: 100%;
    height: auto;
    border-radius: var(--radius-sm);
    padding: 8px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(15px);
  }
  
  .mode-label {
    font-size: 12px;
    font-weight: 600;
    color: inherit;
  }
  
  .expanded-controls {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }
  
  .quality-selector {
    display: flex;
    flex-direction: column;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 1px solid rgba(34, 139, 34, 0.25);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    position: relative;
  }
  
  .quality-selector::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(34, 139, 34, 0.3) 50%,
      transparent 100%);
  }
  
  .quality-option {
    flex: 1;
    padding: 6px 8px;
    text-align: center;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(34, 139, 34, 0.15);
    transition: all 0.3s ease;
    font-size: 11px;
    font-weight: 500;
    position: relative;
    color: var(--text-dark);
  }
  
  .quality-option:last-child {
    border-bottom: none;
  }
  
  .quality-option:hover {
    background: rgba(34, 139, 34, 0.15);
    color: var(--text-dark);
    transform: translateX(2px);
    box-shadow: inset 3px 0 0 var(--forest-green);
  }
  
  .quality-option.active {
    background: linear-gradient(135deg, var(--forest-green) 0%, var(--accent-emerald) 100%);
    color: white;
    font-weight: 600;
    box-shadow: 
      0 2px 8px rgba(34, 139, 34, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .quality-option.active::after {
    content: '';
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }
  
  .expanded-controls :deep(.el-button) {
    font-size: 11px;
    padding: 6px 12px;
    height: auto;
    background: linear-gradient(135deg, var(--forest-green) 0%, var(--accent-emerald) 100%);
    border: none;
    border-radius: var(--radius-sm);
    color: white;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 
      0 4px 12px rgba(34, 139, 34, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .expanded-controls :deep(.el-button:hover) {
    transform: translateY(-1px);
    box-shadow: 
      0 6px 20px rgba(34, 139, 34, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .expanded-controls :deep(.el-button:disabled) {
    background: rgba(255, 255, 255, 0.2);
    color: var(--text-light);
    cursor: not-allowed;
    transform: none;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  </style>
  