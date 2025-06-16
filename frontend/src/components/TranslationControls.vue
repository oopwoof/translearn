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
  
      <div class="control-group">
        <label class="control-label">质量等级</label>
        <div class="quality-selector">
          <div 
            class="quality-option"
            :class="{ active: quality === 'fast' }"
            @click="$emit('update:quality', 'fast')"
          >
            速翻
          </div>
          <div 
            class="quality-option"
            :class="{ active: quality === 'standard' }"
            @click="$emit('update:quality', 'standard')"
          >
            标准
          </div>
          <div 
            class="quality-option"
            :class="{ active: quality === 'premium' }"
            @click="$emit('update:quality', 'premium')"
          >
            精修
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
  import { computed } from 'vue'
  
  const props = defineProps({
    intent: String,
    audience: String,
    reference: String,
    directRequest: String,
    quality: {
      type: String,
      default: 'standard'
    },
    loading: Boolean
  })
  
  const emit = defineEmits([
    'update:intent',
    'update:audience', 
    'update:reference',
    'update:directRequest',
    'update:quality',
    'translate'
  ])
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
  