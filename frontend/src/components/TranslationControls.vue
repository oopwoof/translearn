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
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    height: fit-content;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
  }
  
  .control-group {
    margin-bottom: 20px;
  }
  
  .control-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #1E3050;
    font-size: 14px;
  }
  
  .control-input {
    width: 100%;
  }
  
  .mode-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
  }
  
  .mode-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
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
    width: 200px;
    height: auto;
    border-radius: 12px;
    padding: 12px;
  }
  
  .mode-label {
    font-size: 14px;
    font-weight: 500;
  }
  
  .expanded-controls {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  
  .quality-selector {
    display: flex;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #dcdfe6;
    background: #f5f7fa;
  }
  
  .quality-option {
    flex: 1;
    padding: 8px 12px;
    text-align: center;
    cursor: pointer;
    background: white;
    border-right: 1px solid #dcdfe6;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;
    position: relative;
  }
  
  .quality-option:last-child {
    border-right: none;
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
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background: white;
    border-radius: 1px;
  }
  </style>
  