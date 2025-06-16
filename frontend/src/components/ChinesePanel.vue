<template>
    <div class="chinese-panel">
      <div class="panel-header">
        <h4>中文</h4>
        <div class="panel-actions">
          <el-button 
            v-if="modelValue && !readonly" 
            :icon="CopyDocument" 
            size="small" 
            @click="copyText"
            type="primary"
            plain
          >
            复制
          </el-button>
          <el-button 
            v-if="modelValue && !readonly" 
            :icon="Delete" 
            size="small" 
            @click="clearText"
            plain
          >
            清空
          </el-button>
        </div>
      </div>
      
      <div class="text-area">
        <el-input
          :model-value="(hideResultOnTranslate && !showResult && readonly) ? '' : modelValue"
          @update:model-value="$emit('update:modelValue', $event)"
          type="textarea"
          :rows="20"
          :placeholder="''"
          :readonly="readonly"
          class="chinese-input"
        />
        <div v-if="hideResultOnTranslate && !showResult && readonly && modelValue" class="show-result-placeholder">
          <button class="show-result-btn" @click="onShowResult && onShowResult()">显示翻译</button>
        </div>
        
        <!-- 加载遮罩 -->
        <div v-if="loading && readonly" class="loading-overlay">
          <el-icon class="loading-icon">
            <Refresh />
          </el-icon>
          <span>正在翻译...</span>
        </div>
      </div>
      
      <div class="panel-footer">
        <span class="char-count">{{ modelValue?.length || 0 }} 字符</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ElMessage } from 'element-plus'
  import { CopyDocument, Delete, Refresh } from '@element-plus/icons-vue'
  
  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    showResult: {
      type: Boolean,
      default: true
    },
    hideResultOnTranslate: {
      type: Boolean,
      default: false
    },
    onShowResult: {
      type: Function,
      default: null
    }
  })
  
  const emit = defineEmits(['update:modelValue'])
  
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(props.modelValue)
      ElMessage.success('已复制到剪贴板')
    } catch (error) {
      ElMessage.error('复制失败')
    }
  }
  
  const clearText = () => {
    emit('update:modelValue', '')
  }
  </script>
  
  <style scoped>
  .chinese-panel {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    height: calc(100vh - 140px);
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;
  }
  
  .panel-header h4 {
    margin: 0;
    color: #1E3050;
    font-size: 16px;
  }
  
  .panel-actions {
    display: flex;
    gap: 8px;
  }
  
  .text-area {
    flex: 1;
    padding: 20px;
    position: relative;
  }
  
  .chinese-input {
    height: 100%;
  }
  
  .chinese-input :deep(.el-textarea__inner) {
    height: 100% !important;
    resize: none;
    font-size: 16px;
    line-height: 1.6;
    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  }
  
  .loading-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #1E3050;
  }
  
  .loading-icon {
    font-size: 24px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .panel-footer {
    padding: 12px 20px;
    border-top: 1px solid #e4e7ed;
    background: #f5f7fa;
    border-radius: 0 0 12px 12px;
  }
  
  .char-count {
    color: #666;
    font-size: 14px;
  }
  
  .show-result-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
  }
  .show-result-btn {
    padding: 10px 32px;
    font-size: 18px;
    background: #1E3050;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(30,48,80,0.08);
    transition: background 0.2s;
  }
  .show-result-btn:hover {
    background: #274472;
  }
  </style>

