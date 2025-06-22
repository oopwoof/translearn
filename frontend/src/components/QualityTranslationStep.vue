<template>
  <div class="quality-translation-step">
    <div class="step-header">
      <h2>选择翻译质量</h2>
      <p class="step-description">基于您的分析结果，选择合适的翻译质量等级。不同质量将应用不同程度的分析成果</p>
    </div>
    
    <!-- 分析结果摘要 -->
    <div class="analysis-summary">
      <div class="summary-header">
        <h3>
          <el-icon><DataAnalysis /></el-icon>
          分析结果摘要
        </h3>
        <span class="summary-count">已完成 {{ analysisCount }} 项分析</span>
      </div>
      
      <div class="summary-grid">
        <div 
          v-for="(result, key) in analysisResults" 
          :key="key"
          class="summary-item"
        >
          <div class="summary-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="summary-content">
            <h4>{{ getAnalysisTitle(key) }}</h4>
            <p>{{ getAnalysisPreview(result) }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 质量选项卡片 -->
    <div class="quality-options">
      <div class="quality-header">
        <h3>
          <el-icon><Star /></el-icon>
          翻译质量等级
        </h3>
        <span class="quality-subtitle">选择最适合您需求的翻译质量</span>
      </div>
      
      <div class="quality-cards">
        <!-- 速翻 -->
        <div 
          class="quality-card" 
          :class="{ selected: localQuality === 'fast' }" 
          @click="selectQuality('fast')"
        >
          <div class="card-header">
            <div class="quality-badge fast">速翻</div>
            <div class="time-estimate">
              <el-icon><Timer /></el-icon>
              <span>~2分钟</span>
            </div>
          </div>
          
          <div class="quality-features">
            <h4>快速翻译</h4>
            <div class="feature-list">
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>基础词汇和语法翻译</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>保持原文基本结构</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>适合快速理解内容</span>
              </div>
            </div>
          </div>
          
          <div class="analysis-impact">
            <h5>将应用以下分析：</h5>
            <div class="impact-list">
              <div v-for="impact in getQualityImpacts('fast')" :key="impact" class="impact-item">
                <el-icon><CircleCheck /></el-icon>
                <span>{{ impact }}</span>
              </div>
            </div>
          </div>
          
          <div class="quality-recommendation">
            <div class="recommendation-text">
              <el-icon><InfoFilled /></el-icon>
              <span>适用场景：日常交流、内容理解、初稿翻译</span>
            </div>
          </div>
        </div>
        
        <!-- 标准 -->
        <div 
          class="quality-card recommended" 
          :class="{ selected: localQuality === 'standard' }" 
          @click="selectQuality('standard')"
        >
          <div class="recommended-badge">推荐</div>
          
          <div class="card-header">
            <div class="quality-badge standard">标准</div>
            <div class="time-estimate">
              <el-icon><Timer /></el-icon>
              <span>~5分钟</span>
            </div>
          </div>
          
          <div class="quality-features">
            <h4>标准翻译</h4>
            <div class="feature-list">
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>全面应用分析结果</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>优化词汇和表达</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>考虑语境和受众</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>平衡质量与效率</span>
              </div>
            </div>
          </div>
          
          <div class="analysis-impact">
            <h5>将应用以下分析：</h5>
            <div class="impact-list">
              <div v-for="impact in getQualityImpacts('standard')" :key="impact" class="impact-item">
                <el-icon><CircleCheck /></el-icon>
                <span>{{ impact }}</span>
              </div>
            </div>
          </div>
          
          <div class="quality-recommendation">
            <div class="recommendation-text">
              <el-icon><InfoFilled /></el-icon>
              <span>适用场景：商务文档、学术论文、正式翻译</span>
            </div>
          </div>
        </div>
        
        <!-- 精修 -->
        <div 
          class="quality-card premium" 
          :class="{ selected: localQuality === 'premium' }" 
          @click="selectQuality('premium')"
        >
          <div class="premium-badge">精品</div>
          
          <div class="card-header">
            <div class="quality-badge premium">精修</div>
            <div class="time-estimate">
              <el-icon><Timer /></el-icon>
              <span>~10分钟</span>
            </div>
          </div>
          
          <div class="quality-features">
            <h4>精修翻译</h4>
            <div class="feature-list">
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>深度分析结果应用</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>多轮优化和润色</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>精准术语和表达</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>完美语言风格</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>专业级翻译质量</span>
              </div>
            </div>
          </div>
          
          <div class="analysis-impact">
            <h5>将应用以下分析：</h5>
            <div class="impact-list">
              <div v-for="impact in getQualityImpacts('premium')" :key="impact" class="impact-item">
                <el-icon><CircleCheck /></el-icon>
                <span>{{ impact }}</span>
              </div>
            </div>
          </div>
          
          <div class="quality-recommendation">
            <div class="recommendation-text">
              <el-icon><InfoFilled /></el-icon>
              <span>适用场景：重要文件、出版翻译、高要求场合</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 翻译配置预览 -->
    <div class="translation-preview">
      <div class="preview-header">
        <h3>
          <el-icon><View /></el-icon>
          翻译配置预览
        </h3>
      </div>
      
      <div class="preview-content">
        <div class="preview-grid">
          <div class="preview-item">
            <span class="preview-label">翻译模式：</span>
            <span class="preview-value">{{ getModeText() }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">选择质量：</span>
            <span class="preview-value">{{ getQualityText() }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">文本长度：</span>
            <span class="preview-value">{{ sourceTextLength }} 字符</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">分析功能：</span>
            <span class="preview-value">{{ analysisCount }} 项</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">预计时间：</span>
            <span class="preview-value">{{ getEstimatedTime() }}</span>
          </div>
          <div class="preview-item">
            <span class="preview-label">应用分析：</span>
            <span class="preview-value">{{ getAppliedAnalysisCount() }} / {{ analysisCount }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 开始翻译区域 -->
    <div class="translation-action">
      <div class="action-content">
        <div class="action-description">
          <h4>准备开始翻译</h4>
          <p v-if="localQuality">
            系统将使用 <strong>{{ getQualityText() }}</strong> 级别进行翻译，
            应用您选择的 <strong>{{ analysisCount }}</strong> 项分析结果，
            预计需要 <strong>{{ getEstimatedTime() }}</strong> 完成。
          </p>
          <p v-else class="warning-text">
            <el-icon><Warning /></el-icon>
            请先选择翻译质量等级
          </p>
        </div>
        
        <div class="action-buttons">
          <el-button 
            type="primary" 
            size="large"
            :disabled="!canStartTranslation"
            @click="startTranslation"
            :loading="isTranslating"
            class="start-button"
          >
            <el-icon v-if="!isTranslating"><Promotion /></el-icon>
            {{ isTranslating ? '翻译中，请稍候...' : '开始翻译' }}
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="step-actions">
      <el-button 
        size="large"
        @click="handleBack"
      >
        <el-icon><ArrowLeft /></el-icon>
        上一步
      </el-button>
      
      <div class="next-hint">
        <el-icon><InfoFilled /></el-icon>
        <span>翻译完成后将显示结果和后续操作选项</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  DataAnalysis, Star, Timer, Check, CircleCheck, InfoFilled,
  View, Warning, Promotion, ArrowLeft
} from '@element-plus/icons-vue'

const props = defineProps({
  analysisResults: {
    type: Object,
    default: () => ({})
  },
  sourceText: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'zh-ar'
  }
})

const emit = defineEmits(['translate', 'back'])

const localQuality = ref('')
const isTranslating = ref(false)

const analysisCount = computed(() => {
  return Object.keys(props.analysisResults).length
})

const sourceTextLength = computed(() => {
  return props.sourceText.length
})

const canStartTranslation = computed(() => {
  return localQuality.value && analysisCount.value > 0 && !isTranslating.value
})

const analysisTypeMapping = {
  'text-features': '文本特征分析',
  'terminology': '专业术语分析',
  'suggestions': '翻译建议',
  'intent-analysis': '意图受众分析',
  'reference-analysis': '参考风格分析',
  'direct-request-analysis': '特殊要求分析'
}

const getAnalysisTitle = (key) => {
  return analysisTypeMapping[key] || key
}

const getAnalysisPreview = (result) => {
  if (typeof result === 'string') {
    return result.length > 50 ? result.substring(0, 50) + '...' : result
  }
  return '分析完成'
}

const getModeText = () => {
  return props.mode === 'zh-ar' ? '中文 → 阿拉伯语' : '阿拉伯语 → 中文'
}

const getQualityText = () => {
  const qualityMap = {
    'fast': '速翻',
    'standard': '标准',
    'premium': '精修'
  }
  return qualityMap[localQuality.value] || '未选择'
}

const getEstimatedTime = () => {
  if (!localQuality.value) return '未知'
  
  const baseTime = {
    'fast': 120, // 2分钟
    'standard': 300, // 5分钟
    'premium': 600 // 10分钟
  }
  
  const time = baseTime[localQuality.value] || 300
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  
  if (minutes > 0) {
    return seconds > 0 ? `${minutes}分${seconds}秒` : `${minutes}分钟`
  }
  return `${seconds}秒`
}

const getQualityImpacts = (quality) => {
  const availableAnalysis = Object.keys(props.analysisResults)
  
  if (quality === 'fast') {
    return availableAnalysis.slice(0, Math.min(2, availableAnalysis.length))
      .map(key => analysisTypeMapping[key] || key)
  } else if (quality === 'standard') {
    return availableAnalysis.slice(0, Math.min(4, availableAnalysis.length))
      .map(key => analysisTypeMapping[key] || key)
  } else if (quality === 'premium') {
    return availableAnalysis.map(key => analysisTypeMapping[key] || key)
  }
  
  return []
}

const getAppliedAnalysisCount = () => {
  const impacts = getQualityImpacts(localQuality.value)
  return impacts.length
}

const selectQuality = (quality) => {
  localQuality.value = quality
}

const startTranslation = async () => {
  if (!canStartTranslation.value) {
    ElMessage.warning('请确保已选择质量等级且有分析结果')
    return
  }
  
  isTranslating.value = true
  
  try {
    // 准备翻译数据
    const translationData = {
      quality: localQuality.value,
      analysisResults: props.analysisResults,
      sourceText: props.sourceText,
      mode: props.mode,
      appliedAnalysis: getQualityImpacts(localQuality.value)
    }
    
    ElMessage.info(`开始${getQualityText()}翻译，预计需要${getEstimatedTime()}`)
    
    // 发送翻译请求
    emit('translate', translationData)
    
  } catch (error) {
    ElMessage.error('翻译启动失败：' + error.message)
    isTranslating.value = false
  }
}

const handleBack = () => {
  emit('back')
}

// 监听外部翻译状态变化
watch(() => props.isTranslating, (newVal) => {
  isTranslating.value = newVal
})
</script>

<style scoped>
.quality-translation-step {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 40px;
}

.step-header h2 {
  font-size: 28px;
  color: var(--text-dark);
  margin-bottom: 12px;
  font-weight: 600;
}

.step-description {
  font-size: 14px;
  color: var(--text-medium);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.analysis-summary {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(156, 175, 136, 0.3);
  padding: 24px;
  margin-bottom: 30px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: var(--text-dark);
  margin: 0;
  font-weight: 600;
}

.summary-count {
  font-size: 12px;
  color: var(--text-light);
  background: rgba(34, 139, 34, 0.1);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(34, 139, 34, 0.2);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid rgba(156, 175, 136, 0.2);
}

.summary-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(34, 139, 34, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--forest-green);
  flex-shrink: 0;
}

.summary-content h4 {
  font-size: 14px;
  margin: 0 0 4px 0;
  color: var(--text-dark);
}

.summary-content p {
  font-size: 12px;
  color: var(--text-medium);
  margin: 0;
  line-height: 1.4;
}

.quality-options {
  margin-bottom: 30px;
}

.quality-header {
  text-align: center;
  margin-bottom: 30px;
}

.quality-header h3 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 20px;
  color: var(--text-dark);
  margin: 0 0 8px 0;
  font-weight: 600;
}

.quality-subtitle {
  font-size: 14px;
  color: var(--text-medium);
}

.quality-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.quality-card {
  position: relative;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  border: 2px solid rgba(156, 175, 136, 0.3);
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 400px;
}

.quality-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(34, 139, 34, 0.15);
  border-color: rgba(34, 139, 34, 0.5);
}

.quality-card.selected {
  border-color: var(--forest-green);
  box-shadow: 0 8px 32px rgba(34, 139, 34, 0.25);
  background: rgba(34, 139, 34, 0.08);
}

.quality-card.recommended {
  border-color: rgba(218, 165, 32, 0.6);
}

.quality-card.premium {
  border-color: rgba(218, 165, 32, 0.8);
}

.recommended-badge,
.premium-badge {
  position: absolute;
  top: -8px;
  right: 20px;
  background: linear-gradient(45deg, var(--desert-gold), #f4c430);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(218, 165, 32, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.quality-badge {
  padding: 6px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  color: white;
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

.time-estimate {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-light);
}

.quality-features {
  margin-bottom: 20px;
}

.quality-features h4 {
  font-size: 16px;
  color: var(--text-dark);
  margin: 0 0 12px 0;
  font-weight: 600;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-medium);
}

.feature-item .el-icon {
  color: var(--forest-green);
  font-size: 14px;
}

.analysis-impact {
  margin-bottom: 16px;
}

.analysis-impact h5 {
  font-size: 14px;
  color: var(--text-dark);
  margin: 0 0 8px 0;
  font-weight: 600;
}

.impact-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.impact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-light);
}

.impact-item .el-icon {
  color: var(--forest-green);
  font-size: 12px;
}

.quality-recommendation {
  background: rgba(156, 175, 136, 0.1);
  border-radius: var(--radius-sm);
  padding: 12px;
  border: 1px solid rgba(156, 175, 136, 0.2);
}

.recommendation-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-light);
}

.recommendation-text .el-icon {
  color: var(--forest-green);
}

.translation-preview {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(156, 175, 136, 0.2);
  padding: 20px;
  margin-bottom: 30px;
}

.preview-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: var(--text-dark);
  margin: 0 0 16px 0;
  font-weight: 600;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(156, 175, 136, 0.1);
}

.preview-label {
  font-size: 12px;
  color: var(--text-light);
}

.preview-value {
  font-size: 12px;
  color: var(--text-dark);
  font-weight: 600;
}

.translation-action {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(156, 175, 136, 0.3);
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
}

.action-content {
  max-width: 600px;
  margin: 0 auto;
}

.action-description h4 {
  font-size: 18px;
  color: var(--text-dark);
  margin: 0 0 12px 0;
  font-weight: 600;
}

.action-description p {
  font-size: 14px;
  color: var(--text-medium);
  line-height: 1.6;
  margin: 0 0 24px 0;
}

.warning-text {
  color: #f56c6c !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-buttons {
  margin-top: 20px;
}

.start-button {
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 600;
  min-width: 200px;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-actions .el-button {
  padding: 12px 30px;
  font-size: 14px;
  font-weight: 600;
}

.next-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-light);
}

/* 响应式设计 */
@media (max-width: 968px) {
  .quality-cards {
    grid-template-columns: 1fr;
  }
  
  .preview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .step-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .next-hint {
    text-align: center;
  }
}
</style> 