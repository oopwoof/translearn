<template>
    <div class="arabic-panel" :class="{ 'show-input-hint': showInputHint }">
      <!-- 输入提示效果 -->
      <div v-if="showInputHint" class="input-hint-overlay">
      </div>
      
      <div class="panel-header">
        <h4>阿拉伯语</h4>
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
          :placeholder="readonly ? '翻译结果将显示在这里...' : '请输入阿拉伯语文本...'"
          :readonly="readonly"
          class="arabic-input"
          dir="rtl"
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
    },
    showInputHint: {
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
  .arabic-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  box-shadow: 
    0 8px 32px var(--shadow-light),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(34, 139, 34, 0.3);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  color: var(--text-dark);
  position: relative;
}
  
  .arabic-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 15px;
    right: 15px;
    height: 3px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      var(--forest-green) 25%, 
      var(--deep-green) 50%, 
      var(--forest-green) 75%, 
      transparent 100%);
    opacity: 0.8;
    border-radius: 0 0 3px 3px;
  }
  
  .arabic-panel::after {
    content: '';
    position: absolute;
    right: 0;
    top: 20px;
    bottom: 20px;
    width: 3px;
    background: linear-gradient(180deg, 
      transparent 0%, 
      rgba(34, 139, 34, 0.6) 30%,
      rgba(0, 100, 0, 0.8) 50%,
      rgba(34, 139, 34, 0.6) 70%,
      transparent 100%);
    border-radius: 3px 0 0 3px;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(34, 139, 34, 0.3);
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    flex-shrink: 0;
    position: relative;
  }
  
  .panel-header::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 20px;
    right: 20px;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(34, 139, 34, 0.6) 50%,
      transparent 100%);
  }
  
  .panel-header h4 {
    margin: 0;
    color: var(--text-dark);
    font-size: 14px;
    font-weight: 700;
    position: relative;
    padding-right: 8px;
    text-align: right;
    direction: rtl;
  }

  /* 确保统一背景标题的显示效果 */
  .panel-header h4.unified-title-bg {
    margin: -12px -16px -12px -16px;
    padding: 12px 16px;
    border-radius: 20px 20px 0 0;
  }
  
  .panel-header h4::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 18px;
    background: var(--forest-green);
    border-radius: 2px;
    opacity: 0.7;
  }
  
  .panel-header h4::before {
    content: '';
    position: absolute;
    right: -15px;
    top: 2px;
    width: 3px;
    height: 3px;
    background: var(--desert-gold);
    border-radius: 50%;
    opacity: 0.8;
  }
  
  .panel-actions {
    display: flex;
    gap: 6px;
  }
  
  .text-area {
    flex: 1;
    padding: 15px;
    position: relative;
    min-height: 0;
    overflow: hidden;
  }
  
  .text-area::before,
  .text-area::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(34, 139, 34, 0.5);
    opacity: 0.7;
  }
  
  .text-area::before {
    top: 10px;
    right: 10px;
    border-left: none;
    border-bottom: none;
  }
  
  .text-area::after {
    bottom: 10px;
    left: 10px;
    border-right: none;
    border-top: none;
  }
  
  .arabic-input {
    height: 100%;
  }
  
  .arabic-input :deep(.el-textarea__inner) {
  height: 100% !important;
  resize: none;
  font-size: 13px;
  line-height: 1.6;
  font-family: 'Noto Sans Arabic', 'Amiri', 'Arabic Typesetting', 'Arial Unicode MS', sans-serif;
  direction: rtl;
  text-align: right;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(34, 139, 34, 0.3);
  border-radius: 15px;
  color: var(--text-dark);
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
  
  .arabic-input :deep(.el-textarea__inner):focus {
    border-color: var(--forest-green);
    box-shadow: 
      0 0 0 2px rgba(34, 139, 34, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.2);
  }
  
  .arabic-input :deep(.el-textarea__inner)::placeholder {
    color: var(--text-light);
    opacity: 0.7;
    direction: rtl;
    text-align: right;
  }
  
  .loading-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    color: var(--text-dark);
    font-size: 12px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(15px);
    padding: 20px;
    border-radius: var(--radius-md);
    border: 1px solid rgba(34, 139, 34, 0.4);
    box-shadow: 
      0 8px 25px var(--shadow-medium),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .loading-icon {
    font-size: 20px;
    color: var(--forest-green);
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .panel-footer {
    padding: 10px 16px;
    border-top: 1px solid rgba(34, 139, 34, 0.3);
    background: rgba(240, 248, 240, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 0 0 var(--radius-md) var(--radius-md);
    flex-shrink: 0;
    position: relative;
  }
  
  .panel-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 20px;
    right: 20px;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(34, 139, 34, 0.5) 50%,
      transparent 100%);
  }
  
  .char-count {
    color: var(--text-light);
    font-size: 12px;
    font-weight: 500;
    position: relative;
    display: inline-block;
  }
  
  .char-count::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    background: var(--forest-green);
    border-radius: 50%;
    opacity: 0.6;
  }
  
  .panel-actions :deep(.el-button) {
  font-size: 11px;
  padding: 6px 12px;
  border-radius: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
  
  .panel-actions :deep(.el-button--primary) {
    background: linear-gradient(135deg, var(--forest-green) 0%, var(--accent-emerald) 100%);
    border: none;
    color: black;
    box-shadow: 
      0 4px 12px rgba(34, 139, 34, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .panel-actions :deep(.el-button--primary:hover) {
    transform: translateY(-1px);
    box-shadow: 
      0 6px 20px rgba(34, 139, 34, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .panel-actions :deep(.el-button:not(.el-button--primary)) {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(34, 139, 34, 0.2);
    color: var(--text-dark);
    box-shadow: 
      0 2px 8px var(--shadow-light),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .panel-actions :deep(.el-button:not(.el-button--primary):hover) {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 
      0 4px 16px var(--shadow-light),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border-color: var(--forest-green);
  }

  /* 输入提示效果 */
  .input-hint-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(34, 139, 34, 0.8) 0%, 
      rgba(34, 139, 34, 0.6) 30%, 
      rgba(34, 139, 34, 0.4) 60%, 
      rgba(34, 139, 34, 0.2) 80%, 
      rgba(34, 139, 34, 0.1) 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    pointer-events: none;
    animation: pulseHint 2s ease-in-out infinite;
  }



  .arabic-panel.show-input-hint {
    position: relative;
  }

  @keyframes pulseHint {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }
  </style>