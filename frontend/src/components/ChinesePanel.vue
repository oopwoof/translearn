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
          :model-value="modelValue"
          @update:model-value="$emit('update:modelValue', $event)"
          type="textarea"
          :rows="20"
          :placeholder="readonly ? '翻译结果将显示在这里...' : '请输入中文文本...'"
          :readonly="readonly"
          class="chinese-input"
        />
        
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
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border-radius: var(--radius-lg);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    position: relative;
    transition: var(--transition-smooth);
  }
  
  .chinese-panel:hover {
    transform: translateY(-1px);
    box-shadow: var(--glass-shadow), var(--shadow-soft);
  }
  
  .chinese-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #4CAF50, #66BB6A);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    z-index: 1;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--glass-border);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }
  
  .panel-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
  
  .panel-header h4 {
    margin: 0;
    color: var(--deep-blue, #2c3e50) !important;
    font-size: 18px;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 1;
  }
  
  .panel-header h4::before {
    content: '🇨🇳';
    font-size: 20px;
  }
  
  .panel-actions {
    display: flex;
    gap: 10px;
    position: relative;
    z-index: 1;
  }
  
  .panel-actions .el-button {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--glass-border);
    transition: var(--transition-smooth);
    font-weight: 600;
  }
  
  .panel-actions .el-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-soft);
  }
  
  .text-area {
    flex: 1;
    padding: 24px;
    position: relative;
    min-height: 0;
    overflow: hidden;
    background: 
      radial-gradient(circle at 10% 90%, rgba(76, 175, 80, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 90% 10%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  }
  
  .chinese-input {
    height: 100%;
    position: relative;
  }
  
  .chinese-input :deep(.el-textarea__inner) {
    height: 100% !important;
    resize: none;
    font-size: 16px;
    line-height: 1.8;
    font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    padding: 16px;
    background: var(--bg-gradient-card);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-soft);
    color: var(--deep-blue, #2c3e50) !important;
    transition: var(--transition-smooth);
  }
  
  .chinese-input :deep(.el-textarea__inner:hover) {
    border-color: rgba(76, 175, 80, 0.3);
    box-shadow: var(--shadow-medium);
  }
  
  .chinese-input :deep(.el-textarea__inner:focus) {
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
    outline: none;
  }
  
  .chinese-input :deep(.el-textarea__inner::placeholder) {
    color: rgba(44, 62, 80, 0.5) !important;
  }
  
  .loading-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: var(--deep-blue, #2c3e50) !important;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    padding: 24px 32px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
    z-index: 10;
  }
  
  .loading-icon {
    font-size: 28px;
    animation: spin 1s linear infinite;
    color: #4CAF50;
    filter: drop-shadow(0 2px 4px rgba(76, 175, 80, 0.3));
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .loading-overlay span {
    font-weight: 600;
    font-size: 15px;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
    color: var(--deep-blue, #2c3e50) !important;
  }
  
  .panel-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--glass-border);
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(255, 255, 255, 0.1));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    flex-shrink: 0;
    position: relative;
  }
  
  .panel-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(76, 175, 80, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
  
  .char-count {
    color: var(--deep-blue, #2c3e50) !important;
    font-size: 14px;
    font-weight: 600;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .char-count::before {
    content: '📝';
    font-size: 16px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .panel-header {
      padding: 16px 20px;
    }
  
    .panel-header h4 {
      font-size: 16px;
    }
  
    .text-area {
      padding: 20px;
    }
  
    .chinese-input :deep(.el-textarea__inner) {
      font-size: 15px;
      padding: 14px;
    }
  
    .panel-footer {
      padding: 12px 20px;
    }
  
    .char-count {
      font-size: 13px;
    }
  }
  
  /* 特殊文本效果 */
  .chinese-input :deep(.el-textarea__inner[readonly]) {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(76, 175, 80, 0.05));
    cursor: default;
  }
  
  /* 聚焦动画 */
  .text-area:focus-within {
    animation: focus-glow 0.3s ease-out;
  }
  
  @keyframes focus-glow {
    from {
      background: 
        radial-gradient(circle at 10% 90%, rgba(76, 175, 80, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 90% 10%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
    }
    to {
      background: 
        radial-gradient(circle at 10% 90%, rgba(76, 175, 80, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 90% 10%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    }
  }
  </style>

