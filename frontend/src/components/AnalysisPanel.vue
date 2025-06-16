<template>
    <div class="analysis-panel">
      <h3>翻译辅助</h3>
      
      <!-- 文本特征分析 -->
      <div v-if="analysisData?.textFeatures" class="analysis-section">
        <div class="feature-card">
          <p><strong>当前文本特征：</strong>{{ analysisData.textFeatures.type }}，{{ analysisData.textFeatures.style }}</p>
          <p class="timestamp">分析时间: {{ formatTime(analysisData.analyzedAt) }}</p>
        </div>
      </div>
  
      <!-- 专业术语 -->
      <div v-if="analysisData?.terminology?.length" class="analysis-section">
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
      <div v-if="analysisData?.suggestions?.length" class="analysis-section">
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
      <div v-if="!analysisData" class="empty-state">
        <p>输入文本后将显示分析结果</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    analysisData: {
      type: Object,
      default: null
    }
  })
  
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
  </style>

