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
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    height: fit-content;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    font-size: 12px;
  }
  
  .control-group {
    margin-bottom: 12px;
  }
  
  .control-label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: #1E3050;
    font-size: 11px;
  }
  
  .control-input {
    width: 100%;
  }
  
  .control-input :deep(.el-input__inner) {
    font-size: 11px;
    padding: 6px 8px;
  }
  
  .control-input :deep(.el-textarea__inner) {
    font-size: 11px;
    padding: 6px 8px;
  }
  
  .mode-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
  }
  
  .mode-button {
    width: 100%;
    height: 36px;
    border-radius: 8px;
    background: #f5f7fa;
    border: 2px solid #dcdfe6;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
  }
  
  .mode-button:hover {
    border-color: #1E3050;
  }
  
  .mode-button.active {
    background: #1E3050;
    border-color: #1E3050;
    color: white;
  }
  
  .mode-button.expanded {
    width: 100%;
    height: auto;
    border-radius: 8px;
    padding: 8px;
  }
  
  .mode-label {
    font-size: 12px;
    font-weight: 500;
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
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #dcdfe6;
    background: #f5f7fa;
  }
  
  .quality-option {
    flex: 1;
    padding: 6px 8px;
    text-align: center;
    cursor: pointer;
    background: white;
    border-bottom: 1px solid #dcdfe6;
    transition: all 0.3s ease;
    font-size: 11px;
    font-weight: 500;
    position: relative;
  }
  
  .quality-option:last-child {
    border-bottom: none;
  }
  
  .quality-option:hover {
    background: #e6f7ff;
    color: #1890ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  }
  
  .quality-option.active {
    background: linear-gradient(135deg, #1890ff, #096dd9);
    color: white;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
    transform: translateY(-1px);
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
  }
  
  .expanded-controls :deep(.el-button) {
    font-size: 11px;
    padding: 6px 12px;
    height: auto;
  }
  </style>
  