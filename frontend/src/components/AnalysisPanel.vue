<template>
    <div class="analysis-panel">
      <h3>翻译分析</h3>
      
      <!-- 功能球存放区 -->
      <div class="ball-drop-zone" 
           @dragover.prevent
           @drop.prevent="handleDrop"
           :class="{ 'has-balls': selectedBalls.length > 0 }"
      >
        <div v-if="selectedBalls.length === 0" class="drop-hint">
          拖拽功能球到这里
        </div>
        <div v-else class="selected-balls">
          <div v-for="ball in selectedBalls" 
               :key="ball.id" 
               class="selected-ball"
          >
            <el-icon><component :is="ball.icon" /></el-icon>
            <span>{{ ball.label }}</span>
            <el-icon 
              class="remove-ball"
              @click="removeBall(ball)"
            >
              <Close />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 分析按钮 -->
      <el-button 
        type="primary" 
        :disabled="!canAnalyze"
        @click="handleAnalyze"
        class="analyze-btn"
        :loading="analyzing"
      >
        {{ analyzing ? '分析中...' : '开始分析' }}
      </el-button>
      
      <!-- 文本特征分析 -->
      <div v-if="analysisData?.textFeatures && selectedBalls.some(ball => ball.prompt.includes('文本特征'))" class="analysis-section">
        <div class="feature-card">
          <p><strong>当前文本特征：</strong>{{ analysisData.textFeatures.type }}，{{ analysisData.textFeatures.style }}</p>
          <p class="timestamp">分析时间: {{ formatTime(analysisData.analyzedAt) }}</p>
        </div>
      </div>
  
      <!-- 专业术语 -->
      <div v-if="analysisData?.terminology?.length && selectedBalls.some(ball => ball.prompt.includes('专业术语'))" class="analysis-section">
        <div class="terminology-card">
          <p><strong>检测到专业术语：</strong></p>
          <ul class="term-list">
            <li v-for="term in analysisData.terminology" :key="term.original">
              <span class="term-original">{{ term.original }}</span>
              <span class="term-translation">({{ term.translation }})</span>
            </li>
          </ul>
        </div>
      </div>
  
      <!-- 翻译建议 -->
      <div v-if="analysisData?.suggestions?.length && selectedBalls.some(ball => ball.prompt.includes('翻译建议'))" class="analysis-section">
        <div class="suggestions-card">
          <p><strong>翻译建议：</strong></p>
          <ul class="suggestion-list">
            <li v-for="suggestion in analysisData.suggestions" :key="suggestion">
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>
  
      <!-- 加载状态 -->
      <div v-if="!analysisData && !selectedBalls.length" class="empty-state">
        <p>拖拽功能球到上方区域开始分析</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Close } from '@element-plus/icons-vue'
  
  const props = defineProps({
    analysisData: {
      type: Object,
      default: null
    },
    analyzing: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits(['analyze'])
  
  const selectedBalls = ref([])
  
  const canAnalyze = computed(() => {
    return selectedBalls.value.length > 0 && !props.analyzing
  })
  
  const handleDrop = (e) => {
    try {
      const ballData = JSON.parse(e.dataTransfer.getData('text/plain'))
      if (!selectedBalls.value.find(b => b.id === ballData.id)) {
        selectedBalls.value.push({
          id: ballData.id,
          label: ballData.label,
          icon: ballData.icon,
          prompt: ballData.prompt
        })
      }
    } catch (error) {
      console.error('Drop error:', error)
    }
  }
  
  const removeBall = (ball) => {
    selectedBalls.value = selectedBalls.value.filter(b => b.id !== ball.id)
  }
  
  const handleAnalyze = () => {
    if (!canAnalyze.value) return
    emit('analyze', selectedBalls.value)
  }
  
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString('zh-CN')
  }
  </script>
  
  <style scoped>
  .analysis-panel {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    height: fit-content;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
  }
  
  .analysis-panel h3 {
    margin: 0 0 20px 0;
    color: #1E3050;
    font-size: 18px;
  }
  
  .ball-drop-zone {
    background: #f5f7fa;
    border: 2px dashed #dcdfe6;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }
  
  .ball-drop-zone.has-balls {
    border-style: solid;
    border-color: #1E3050;
    background: #f0f8ff;
  }
  
  .drop-hint {
    color: #909399;
    font-size: 14px;
  }
  
  .selected-balls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .selected-ball {
    background: white;
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #1E3050;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .analyze-btn {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .analyze-btn.is-loading {
    opacity: 0.8;
  }
  
  .analysis-section {
    margin-bottom: 16px;
  }
  
  .feature-card {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 12px;
    border-left: 3px solid #2E7D32;
  }
  
  .terminology-card {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 12px;
    border-left: 3px solid #1E3050;
  }
  
  .suggestions-card {
    background: #f0f8ff;
    border-radius: 8px;
    padding: 12px;
    border-left: 3px solid #1976D2;
  }
  
  .timestamp {
    color: #666;
    font-size: 0.9rem;
    margin: 8px 0 0 0;
  }
  
  .term-list {
    margin: 8px 0 0 0;
    padding-left: 16px;
  }
  
  .term-list li {
    margin-bottom: 4px;
  }
  
  .term-original {
    font-weight: 500;
    color: #1E3050;
  }
  
  .term-translation {
    color: #666;
    margin-left: 4px;
  }
  
  .suggestion-list {
    margin: 8px 0 0 0;
    padding-left: 16px;
  }
  
  .suggestion-list li {
    margin-bottom: 6px;
    color: #333;
  }
  
  .empty-state {
    text-align: center;
    color: #999;
    padding: 40px 20px;
  }
  
  .remove-ball {
    font-size: 14px;
    color: #909399;
    cursor: pointer;
    margin-left: 4px;
    transition: all 0.3s;
  }
  
  .remove-ball:hover {
    color: #F56C6C;
    transform: scale(1.1);
  }
  </style>

