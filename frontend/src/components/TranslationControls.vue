<template>
    <div class="translation-controls">
      <div class="control-group">
        <label class="control-label">意图/受众</label>
        <el-input
          :model-value="intent"
          @update:model-value="$emit('update:intent', $event)"
          placeholder="如：商务伙伴、学术交流..."
          class="control-input"
        />
      </div>
  
      <div class="control-group">
        <label class="control-label">参考译文风格</label>
        <el-input
          :model-value="reference"
          @update:model-value="$emit('update:reference', $event)"
          type="textarea"
          :rows="3"
          placeholder="粘贴或输入参考译文..."
          class="control-input"
        />
      </div>
  
      <div class="control-group">
        <label class="control-label">直接要求</label>
        <el-input
          :model-value="directRequest"
          @update:model-value="$emit('update:directRequest', $event)"
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
            <el-button 
              type="primary" 
              size="small"
              @click.stop="$emit('analyze')"
            >
              翻译策略
            </el-button>
            <div class="quality-selector">
              <div 
                class="quality-option"
                :class="{ active: quality === 'fast' }"
                @click.stop="$emit('update:quality', 'fast')"
              >
                速翻
              </div>
              <div 
                class="quality-option"
                :class="{ active: quality === 'standard' }"
                @click.stop="$emit('update:quality', 'standard')"
              >
                标准
              </div>
              <div 
                class="quality-option"
                :class="{ active: quality === 'premium' }"
                @click.stop="$emit('update:quality', 'premium')"
              >
                精修
              </div>
            </div>
          </div>
        </div>

        <div 
          class="mode-button"
          :class="{ active: mode === 'evaluate' }"
          @click="handleModeClick('evaluate')"
        >
          <span class="mode-label">评估模式</span>
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
            <el-button 
              type="primary" 
              size="small"
              @click.stop="$emit('analyze')"
            >
              翻译策略
            </el-button>
            <div class="quality-selector">
              <div 
                class="quality-option"
                :class="{ active: quality === 'fast' }"
                @click.stop="$emit('update:quality', 'fast')"
              >
                速翻
              </div>
              <div 
                class="quality-option"
                :class="{ active: quality === 'standard' }"
                @click.stop="$emit('update:quality', 'standard')"
              >
                标准
              </div>
              <div 
                class="quality-option"
                :class="{ active: quality === 'premium' }"
                @click.stop="$emit('update:quality', 'premium')"
              >
                精修
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div style="display: flex; gap: 12px; align-items: center; justify-content: space-between;">
        <el-button 
          type="primary" 
          size="large"
          @click="$emit('translate')"
          :loading="loading"
          class="translate-btn"
          block
        >
          <template #loading>
            <el-icon class="is-loading">
              <Refresh />
            </el-icon>
          </template>
          {{ loading ? '翻译中...' : '开始翻译' }}
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { Refresh } from '@element-plus/icons-vue'
  import { ElSwitch } from 'element-plus'
  import { computed, ref } from 'vue'
  
  const props = defineProps({
    intent: String,
    audience: String,
    reference: String,
    directRequest: String,
    quality: {
      type: String,
      default: 'standard'
    },
    mode: {
      type: String,
      default: 'zh-ar'
    },
    loading: Boolean
  })
  
  const emit = defineEmits([
    'update:intent',
    'update:audience', 
    'update:reference',
    'update:directRequest',
    'update:quality',
    'update:mode',
    'analyze',
    'translate'
  ])

  const expandedMode = ref(null)

  const handleModeClick = (mode) => {
    if (mode === 'evaluate') {
      // 评估模式暂不实现
      return
    }
    
    if (expandedMode.value === mode) {
      expandedMode.value = null
    } else {
      expandedMode.value = mode
      emit('update:mode', mode)
    }
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
  }
  
  .quality-option {
    flex: 1;
    padding: 8px 12px;
    text-align: center;
    cursor: pointer;
    background: white;
    border-right: 1px solid #dcdfe6;
    transition: all 0.3s;
    font-size: 14px;
  }
  
  .quality-option:last-child {
    border-right: none;
  }
  
  .quality-option:hover {
    background: #f5f7fa;
  }
  
  .quality-option.active {
    background: #1E3050;
    color: white;
  }
  
  .translate-btn {
    margin-top: 20px;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
  }
  </style>
  