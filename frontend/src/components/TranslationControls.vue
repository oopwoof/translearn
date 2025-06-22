<template>
    <div class="translation-controls">
      <div class="control-group">
        <label class="control-label">意图/受众</label>
        <el-input
          v-model="localIntent"
          @update:model-value="updateIntent"
          type="textarea"
          :rows="2"
          :autosize="{ minRows: 2, maxRows: 6 }"
          placeholder="如：商务伙伴、学术交流..."
          class="control-input resizable-input"
          resize="vertical"
        />
      </div>
  
      <div class="control-group">
        <label class="control-label">参考译文风格</label>
        <el-input
          v-model="localReference"
          @update:model-value="updateReference"
          type="textarea"
          :rows="3"
          :autosize="{ minRows: 3, maxRows: 8 }"
          placeholder="粘贴或输入参考译文..."
          class="control-input resizable-input"
          resize="vertical"
        />
      </div>
  
      <div class="control-group">
        <label class="control-label">直接要求</label>
        <el-input
          v-model="localDirectRequest"
          @update:model-value="updateDirectRequest"
          type="textarea"
          :rows="2"
          :autosize="{ minRows: 2, maxRows: 6 }"
          placeholder="如：保留礼貌用语、使用正式语体..."
          class="control-input resizable-input"
          resize="vertical"
        />
      </div>
  
      <!-- 模式选择按钮组 - 垂直排列 -->
      <div class="mode-buttons">
        <div 
          class="mode-button"
          :class="{ 
            active: mode === 'zh-ar',
            expanded: expandedMode === 'zh-ar'
          }"
          @click="handleModeClick('zh-ar')"
        >
          <span class="mode-label">中文 → 阿拉伯语</span>
          <div v-if="expandedMode === 'zh-ar'" class="expanded-controls">
            <div class="quality-selector">
              <div 
                class="quality-option"
                :class="{ active: quality === 'fast' }"
                @click.stop="updateQuality('fast')"
              >
                <span class="quality-title">速翻</span>
                <span class="quality-desc">快速翻译</span>
              </div>
              <div 
                class="quality-option"
                :class="{ active: quality === 'standard' }"
                @click.stop="updateQuality('standard')"
              >
                <span class="quality-title">标准</span>
                <span class="quality-desc">标准质量</span>
              </div>
              <div 
                class="quality-option"
                :class="{ active: quality === 'premium' }"
                @click.stop="updateQuality('premium')"
              >
                <span class="quality-title">精修</span>
                <span class="quality-desc">高质量精修</span>
              </div>
            </div>
            <el-button 
              type="primary" 
              size="default"
              @click.stop="handleTranslate"
              :disabled="!quality"
              :loading="loading"
              class="translate-button"
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
          <span class="mode-label">阿拉伯语 → 中文</span>
          <div v-if="expandedMode === 'ar-zh'" class="expanded-controls">
            <div class="quality-selector">
              <div 
                class="quality-option"
                :class="{ active: quality === 'fast' }"
                @click.stop="updateQuality('fast')"
              >
                <span class="quality-title">速翻</span>
                <span class="quality-desc">快速翻译</span>
              </div>
              <div 
                class="quality-option"
                :class="{ active: quality === 'standard' }"
                @click.stop="updateQuality('standard')"
              >
                <span class="quality-title">标准</span>
                <span class="quality-desc">标准质量</span>
              </div>
              <div 
                class="quality-option"
                :class="{ active: quality === 'premium' }"
                @click.stop="updateQuality('premium')"
              >
                <span class="quality-title">精修</span>
                <span class="quality-desc">高质量精修</span>
              </div>
            </div>
            <el-button 
              type="primary" 
              size="default"
              @click.stop="handleTranslate"
              :disabled="!quality"
              :loading="loading"
              class="translate-button"
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
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border-radius: var(--radius-lg);
    border: 1px solid var(--glass-border);
    padding: 24px;
    box-shadow: var(--glass-shadow);
    height: fit-content;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    position: relative;
    transition: var(--transition-smooth);
  }
  
  .translation-controls:hover {
    transform: translateY(-1px);
    box-shadow: var(--glass-shadow), var(--shadow-soft);
  }
  
  .translation-controls::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--bg-gradient-warm);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    z-index: 1;
  }
  
  .control-group {
    margin-bottom: 24px;
    animation: slideUpFade 0.6s ease-out;
  }
  
  .control-group:nth-child(1) { animation-delay: 0.1s; }
  .control-group:nth-child(2) { animation-delay: 0.2s; }
  .control-group:nth-child(3) { animation-delay: 0.3s; }
  
  .control-label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
    color: var(--deep-blue, #2c3e50) !important;
    font-size: 14px;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
    position: relative;
  }
  
  .control-label::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 14px;
    background: var(--bg-gradient-warm);
    border-radius: 2px;
    opacity: 0.6;
  }
  
  .control-input {
    width: 100%;
  }
  
  .control-input :deep(.el-input__wrapper) {
    background: var(--bg-gradient-card);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-soft);
    transition: var(--transition-smooth);
  }
  
  .control-input :deep(.el-input__wrapper:hover) {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: var(--shadow-medium);
  }
  
  .control-input :deep(.el-input__wrapper.is-focus) {
    border-color: var(--soft-blue);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
  
  .control-input :deep(.el-input__inner) {
    color: var(--deep-blue, #2c3e50) !important;
    background-color: rgba(255, 255, 255, 0.9) !important;
  }
  
  /* 🎨 可调整大小的输入框样式 */
  .resizable-input :deep(.el-textarea__inner) {
    resize: vertical !important;
    min-height: 60px;
    max-height: 200px;
  }
  
  .control-input :deep(.el-textarea__inner) {
    background: var(--bg-gradient-card);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-soft);
    transition: var(--transition-smooth);
    color: var(--deep-blue, #2c3e50) !important;
    resize: vertical;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .control-input :deep(.el-textarea__inner:hover) {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: var(--shadow-medium);
  }
  
  .control-input :deep(.el-textarea__inner:focus) {
    border-color: var(--soft-blue);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    outline: none;
  }
  
  .mode-buttons {
    display: flex;
    flex-direction: column; /* 改为垂直排列 */
    gap: 16px; /* 增加间距 */
    margin-top: 32px;
    animation: slideUpFade 0.6s ease-out;
    animation-delay: 0.4s;
  }
  
  .mode-button {
    width: 100%; /* 全宽 */
    min-height: 56px; /* 设置最小高度 */
    height: auto; /* 自动高度 */
    border-radius: var(--radius-lg);
    background: var(--bg-gradient-card);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border: 2px solid var(--glass-border);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--transition-smooth);
    position: relative;
    box-shadow: var(--shadow-soft);
    overflow: hidden;
    padding: 16px 20px;
  }
  
  .mode-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 30%, rgba(52, 152, 219, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(255, 181, 167, 0.05) 0%, transparent 50%);
    opacity: 0;
    transition: var(--transition-smooth);
    border-radius: inherit;
  }
  
  .mode-button:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: var(--shadow-medium);
  }
  
  .mode-button:hover::before {
    opacity: 1;
  }
  
  .mode-button.active {
    background: var(--bg-gradient-warm);
    border-color: var(--sunset-coral);
    color: white;
    box-shadow: var(--shadow-medium), 0 0 20px rgba(255, 181, 167, 0.4);
    animation: pulse-glow 2s infinite;
  }
  
  .mode-button.active::before {
    opacity: 0;
  }
  
  .mode-button.expanded {
    width: 100%;
    height: auto;
    border-radius: var(--radius-lg);
    padding: 20px;
    flex-direction: column;
    gap: 16px;
  }
  
  .mode-button.expanded:hover {
    transform: translateY(-1px);
  }
  
  .mode-label {
    font-size: 15px; /* 调整字体大小 */
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    z-index: 2;
    position: relative;
    color: var(--deep-blue, #2c3e50) !important;
    text-align: center;
    line-height: 1.3;
  }

  .mode-button.active .mode-label {
    color: white !important;
  }
  
  .expanded-controls {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px; /* 增加间距 */
    width: 100%;
    z-index: 2;
    position: relative;
  }
  
  .quality-selector {
    display: flex;
    flex-direction: column; /* 改为垂直排列 */
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    gap: 1px; /* 添加间距 */
  }
  
  .quality-option {
    width: 100%; /* 全宽 */
    padding: 16px 20px; /* 增加内边距 */
    text-align: left; /* 左对齐 */
    cursor: pointer;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: none; /* 移除边框 */
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .quality-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--deep-blue, #2c3e50) !important;
  }
  
  .quality-desc {
    font-size: 12px;
    opacity: 0.7;
    color: var(--deep-blue, #2c3e50) !important;
  }
  
  .quality-option::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }
  
  .quality-option:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .quality-option:hover::before {
    left: 100%;
  }
  
  .quality-option.active {
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.8), rgba(52, 152, 219, 0.9));
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }
  
  .quality-option.active .quality-title,
  .quality-option.active .quality-desc {
    color: white !important;
  }
  
  .quality-option.active::after {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 60%;
    background: white;
    border-radius: 0 2px 2px 0;
  }
  
  .translate-button {
    width: 100%;
    height: 48px; /* 增加高度 */
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 16px; /* 增加字体大小 */
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
  }
  
  .translate-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }
  
  .translate-button:hover::before {
    left: 100%;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .translation-controls {
      padding: 20px;
    }
  
    .mode-buttons {
      gap: 16px;
    }
  
    .mode-button {
      width: 70px;
      height: 70px;
    }
  
    .mode-button.expanded {
      width: 200px;
      padding: 16px;
    }
  
    .mode-label {
      font-size: 14px;
    }
  
    .quality-option {
      padding: 10px 12px;
      font-size: 13px;
    }
  }
  
  /* 加载状态动画 */
  .translation-controls.loading {
    animation: container-pulse 2s infinite ease-in-out;
  }
  
  @keyframes container-pulse {
    0%, 100% {
      box-shadow: var(--glass-shadow);
    }
    50% {
      box-shadow: var(--glass-shadow), var(--shadow-medium);
      transform: translateY(-1px);
    }
  }
  
  /* 自定义滚动条 */
  .translation-controls::-webkit-scrollbar {
    width: 6px;
  }
  
  .translation-controls::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  .translation-controls::-webkit-scrollbar-thumb {
    background: var(--sunset-coral);
    border-radius: 3px;
    transition: var(--transition-smooth);
  }
  
  .translation-controls::-webkit-scrollbar-thumb:hover {
    background: var(--sunset-gold);
  }
  </style>
  