<template>
  <div class="config-summary">
    <div class="summary-header">
      <h3>
        <el-icon><Setting /></el-icon>
        配置摘要
      </h3>
      <div class="completion-indicator">
        {{ completedSteps }} / 4 完成
      </div>
    </div>
    
    <div class="summary-content">
      <!-- 模式配置 -->
      <div class="config-item" :class="{ completed: mode }">
        <div class="item-header">
          <div class="item-icon">
            <el-icon v-if="mode"><CircleCheck /></el-icon>
            <el-icon v-else><Clock /></el-icon>
          </div>
          <span class="item-title">翻译模式</span>
        </div>
        <div class="item-content">
          <span v-if="mode" class="item-value">{{ getModeText() }}</span>
          <span v-else class="item-placeholder">待选择</span>
        </div>
      </div>
      
      <!-- 翻译需求 -->
      <div class="config-item" :class="{ completed: hasRequirements }">
        <div class="item-header">
          <div class="item-icon">
            <el-icon v-if="hasRequirements"><CircleCheck /></el-icon>
            <el-icon v-else><Clock /></el-icon>
          </div>
          <span class="item-title">翻译需求</span>
        </div>
        <div class="item-content">
          <div v-if="sourceText" class="requirement-item">
            <span class="requirement-label">文本：</span>
            <span class="requirement-value">{{ sourceText.length }} 字符</span>
          </div>
          <div v-if="requirements.intent" class="requirement-item">
            <span class="requirement-label">意图：</span>
            <span class="requirement-value">{{ getShortText(requirements.intent) }}</span>
          </div>
          <div v-if="requirements.reference" class="requirement-item">
            <span class="requirement-label">参考：</span>
            <span class="requirement-value">已提供</span>
          </div>
          <div v-if="requirements.directRequest" class="requirement-item">
            <span class="requirement-label">要求：</span>
            <span class="requirement-value">{{ getShortText(requirements.directRequest) }}</span>
          </div>
          <span v-if="!hasRequirements" class="item-placeholder">待填写</span>
        </div>
      </div>
      
      <!-- 功能分析 -->
      <div class="config-item" :class="{ completed: hasAnalysis }">
        <div class="item-header">
          <div class="item-icon">
            <el-icon v-if="hasAnalysis"><CircleCheck /></el-icon>
            <el-icon v-else><Clock /></el-icon>
          </div>
          <span class="item-title">功能分析</span>
        </div>
        <div class="item-content">
          <div v-if="analysisResults && Object.keys(analysisResults).length > 0" class="analysis-items">
            <div class="analysis-count">
              {{ Object.keys(analysisResults).length }} 项分析完成
            </div>
            <div class="analysis-list">
              <el-tag 
                v-for="(result, key) in analysisResults" 
                :key="key"
                size="small"
                type="success"
                class="analysis-tag"
              >
                {{ getAnalysisName(key) }}
              </el-tag>
            </div>
          </div>
          <span v-else class="item-placeholder">待分析</span>
        </div>
      </div>
      
      <!-- 翻译质量 -->
      <div class="config-item" :class="{ completed: quality }">
        <div class="item-header">
          <div class="item-icon">
            <el-icon v-if="quality"><CircleCheck /></el-icon>
            <el-icon v-else><Clock /></el-icon>
          </div>
          <span class="item-title">翻译质量</span>
        </div>
        <div class="item-content">
          <div v-if="quality" class="quality-info">
            <span class="quality-badge" :class="quality">{{ getQualityText() }}</span>
            <span class="quality-time">预计 {{ getEstimatedTime() }}</span>
          </div>
          <span v-else class="item-placeholder">待选择</span>
        </div>
      </div>
    </div>
    
    <!-- 进度条 -->
    <div class="progress-section">
      <div class="progress-label">配置进度</div>
      <el-progress 
        :percentage="progressPercentage"
        :stroke-width="6"
        :show-text="false"
        class="progress-bar"
      />
      <div class="progress-text">{{ progressPercentage }}%</div>
    </div>
    
    <!-- 操作提示 -->
    <div class="action-hint">
      <div v-if="nextAction" class="hint-content">
        <el-icon><InfoFilled /></el-icon>
        <span>{{ nextAction }}</span>
      </div>
      <div v-else class="completion-message">
        <el-icon><CircleCheck /></el-icon>
        <span>配置完成，可以开始翻译</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Setting, CircleCheck, Clock, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  mode: {
    type: String,
    default: ''
  },
  sourceText: {
    type: String,
    default: ''
  },
  requirements: {
    type: Object,
    default: () => ({})
  },
  analysisResults: {
    type: Object,
    default: () => ({})
  },
  quality: {
    type: String,
    default: ''
  }
})

const hasRequirements = computed(() => {
  return props.sourceText && props.sourceText.trim().length > 0
})

const hasAnalysis = computed(() => {
  return props.analysisResults && Object.keys(props.analysisResults).length > 0
})

const completedSteps = computed(() => {
  let count = 0
  if (props.mode) count++
  if (hasRequirements.value) count++
  if (hasAnalysis.value) count++
  if (props.quality) count++
  return count
})

const progressPercentage = computed(() => {
  return Math.round((completedSteps.value / 4) * 100)
})

const nextAction = computed(() => {
  if (!props.mode) return '请选择翻译模式'
  if (!hasRequirements.value) return '请填写翻译需求'
  if (!hasAnalysis.value) return '请完成功能分析'
  if (!props.quality) return '请选择翻译质量'
  return null
})

const analysisNameMapping = {
  'text-features': '文本特征',
  'terminology': '专业术语',
  'suggestions': '翻译建议',
  'intent-analysis': '意图分析',
  'reference-analysis': '参考风格',
  'direct-request-analysis': '特殊要求'
}

const getModeText = () => {
  return props.mode === 'zh-ar' ? '中文 → 阿拉伯语' : '阿拉伯语 → 中文'
}

const getShortText = (text) => {
  if (!text) return ''
  return text.length > 20 ? text.substring(0, 20) + '...' : text
}

const getAnalysisName = (key) => {
  return analysisNameMapping[key] || key
}

const getQualityText = () => {
  const qualityMap = {
    'fast': '速翻',
    'standard': '标准',
    'premium': '精修'
  }
  return qualityMap[props.quality] || props.quality
}

const getEstimatedTime = () => {
  const timeMap = {
    'fast': '2分钟',
    'standard': '5分钟',
    'premium': '10分钟'
  }
  return timeMap[props.quality] || '未知'
}
</script>

<style scoped>
.config-summary {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(156, 175, 136, 0.3);
  padding: 20px;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(156, 175, 136, 0.2);
}

.summary-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: var(--text-dark);
  margin: 0;
  font-weight: 600;
}

.completion-indicator {
  font-size: 12px;
  color: var(--text-light);
  background: rgba(34, 139, 34, 0.1);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(34, 139, 34, 0.2);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.config-item {
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(156, 175, 136, 0.2);
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.config-item.completed {
  border-color: rgba(34, 139, 34, 0.4);
  background: rgba(34, 139, 34, 0.05);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.item-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-icon .el-icon {
  font-size: 14px;
}

.config-item.completed .item-icon .el-icon {
  color: var(--forest-green);
}

.config-item:not(.completed) .item-icon .el-icon {
  color: var(--text-light);
}

.item-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dark);
}

.item-content {
  margin-left: 24px;
}

.item-value {
  font-size: 12px;
  color: var(--text-medium);
  font-weight: 500;
}

.item-placeholder {
  font-size: 12px;
  color: var(--text-light);
  font-style: italic;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.requirement-item:last-child {
  margin-bottom: 0;
}

.requirement-label {
  font-size: 11px;
  color: var(--text-light);
  min-width: 30px;
}

.requirement-value {
  font-size: 11px;
  color: var(--text-medium);
}

.analysis-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.analysis-count {
  font-size: 12px;
  color: var(--text-medium);
  font-weight: 500;
}

.analysis-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.analysis-tag {
  font-size: 10px;
}

.quality-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quality-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  color: white;
  font-weight: 600;
}

.quality-badge.fast {
  background: linear-gradient(45deg, #4caf50, #81c784);
}

.quality-badge.standard {
  background: linear-gradient(45deg, var(--forest-green), var(--emerald-green));
}

.quality-badge.premium {
  background: linear-gradient(45deg, var(--desert-gold), #f4c430);
}

.quality-time {
  font-size: 11px;
  color: var(--text-light);
}

.progress-section {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid rgba(156, 175, 136, 0.1);
}

.progress-label {
  font-size: 12px;
  color: var(--text-medium);
  margin-bottom: 8px;
  font-weight: 500;
}

.progress-bar {
  margin-bottom: 4px;
}

.progress-text {
  text-align: right;
  font-size: 11px;
  color: var(--text-light);
}

.action-hint {
  padding: 10px 12px;
  background: rgba(156, 175, 136, 0.1);
  border-radius: var(--radius-md);
  border: 1px solid rgba(156, 175, 136, 0.2);
}

.hint-content,
.completion-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  line-height: 1.4;
}

.hint-content {
  color: var(--text-light);
}

.completion-message {
  color: var(--forest-green);
}

.hint-content .el-icon,
.completion-message .el-icon {
  font-size: 12px;
  flex-shrink: 0;
}

/* 滚动条样式 */
.config-summary::-webkit-scrollbar {
  width: 4px;
}

.config-summary::-webkit-scrollbar-track {
  background: rgba(156, 175, 136, 0.1);
  border-radius: 2px;
}

.config-summary::-webkit-scrollbar-thumb {
  background: rgba(156, 175, 136, 0.3);
  border-radius: 2px;
}

.config-summary::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 175, 136, 0.5);
}
</style> 