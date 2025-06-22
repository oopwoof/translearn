<template>
  <div class="function-analysis-step">
    <div class="step-header">
      <h2>功能分析配置</h2>
      <p class="step-description">选择合适的分析功能来深入理解您的文本，为高质量翻译做准备</p>
    </div>
    
    <div class="analysis-layout">
      <!-- 智能推荐区域 -->
      <div class="smart-recommendations">
        <div class="recommendation-header">
          <h3>
            <el-icon><Tools /></el-icon>
            智能推荐
          </h3>
          <span class="recommendation-subtitle">基于您的翻译需求自动推荐</span>
        </div>
        
        <div class="recommended-functions">
          <div 
            v-for="ball in recommendedBalls" 
            :key="ball.id"
            class="recommended-ball"
            :class="{ selected: selectedBallIds.includes(ball.id) }"
          >
            <div class="ball-content">
              <div class="ball-icon">
                <el-icon><component :is="ball.icon" /></el-icon>
              </div>
              <div class="ball-info">
                <h4>{{ ball.label }}</h4>
                <p class="ball-description">{{ ball.description }}</p>
                <div class="recommendation-reason">
                  <el-icon><InfoFilled /></el-icon>
                  <span>{{ ball.reason }}</span>
                </div>
              </div>
            </div>
            <div class="ball-actions">
              <el-button 
                v-if="!selectedBallIds.includes(ball.id)"
                size="small" 
                type="primary"
                @click="addBall(ball)"
                :disabled="ball.disabled"
              >
                添加
              </el-button>
              <el-button 
                v-else
                size="small" 
                @click="removeBall(ball.id)"
              >
                移除
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="quick-actions">
          <el-button 
            type="primary" 
            @click="addAllRecommended"
            :disabled="allRecommendedSelected"
          >
            <el-icon><Plus /></el-icon>
            添加全部推荐
          </el-button>
          <el-button 
            @click="addBasicSet"
            :disabled="basicSetSelected"
          >
            <el-icon><Collection /></el-icon>
            基础分析套装
          </el-button>
        </div>
      </div>
      
      <!-- 所有功能区域 -->
      <div class="all-functions">
        <div class="function-header">
          <h3>
            <el-icon><Grid /></el-icon>
            所有分析功能
          </h3>
          <span class="function-subtitle">{{ selectedBallIds.length }} / {{ availableBalls.length }} 已选择</span>
        </div>
        
        <div class="function-grid">
          <div 
            v-for="ball in availableBalls" 
            :key="ball.id"
            class="function-ball"
            :class="{ 
              selected: selectedBallIds.includes(ball.id),
              disabled: ball.disabled 
            }"
            @click="toggleBall(ball)"
          >
            <div class="ball-icon">
              <el-icon><component :is="ball.icon" /></el-icon>
            </div>
            <span class="ball-label">{{ ball.label }}</span>
            <div v-if="ball.disabled" class="disabled-reason">
              {{ ball.disabledReason }}
            </div>
            <el-icon v-if="selectedBallIds.includes(ball.id)" class="selected-indicator">
              <CircleCheck />
            </el-icon>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 已选择的功能球展示 -->
    <div v-if="selectedBallIds.length > 0" class="selected-functions">
      <div class="selected-header">
        <h3>
          <el-icon><Star /></el-icon>
          已选择的分析功能 ({{ selectedBallIds.length }})
        </h3>
        <div class="selected-actions">
          <el-button 
            size="small" 
            @click="clearAll"
          >
            <el-icon><Delete /></el-icon>
            清空全部
          </el-button>
        </div>
      </div>
      
      <div class="selected-list">
        <div 
          v-for="ballId in selectedBallIds" 
          :key="ballId"
          class="selected-item"
          :class="{ 
            analyzed: analyzedBalls.has(ballId),
            analyzing: analyzingBalls.has(ballId)
          }"
        >
          <div class="item-info">
            <el-icon><component :is="getBallIcon(ballId)" /></el-icon>
            <span>{{ getBallLabel(ballId) }}</span>
          </div>
          <div class="item-status">
            <el-icon v-if="analyzedBalls.has(ballId)" class="status-icon success">
              <CircleCheck />
            </el-icon>
            <el-icon v-else-if="analyzingBalls.has(ballId)" class="status-icon loading">
              <Loading />
            </el-icon>
            <span v-if="analyzedBalls.has(ballId)" class="status-text">已完成</span>
            <span v-else-if="analyzingBalls.has(ballId)" class="status-text">分析中...</span>
            <el-button 
              v-else
              size="small" 
              @click="removeBall(ballId)"
              :icon="Close"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分析配置 -->
    <div v-if="selectedBallIds.length > 0" class="analysis-config">
      <div class="config-header">
        <h3>
          <el-icon><Setting /></el-icon>
          分析配置
        </h3>
      </div>
      
      <div class="config-options">
        <!-- 分组设置 -->
        <div v-if="selectedBallIds.length > 1" class="config-group">
          <el-switch 
            v-model="useGroupedAnalysis"
            :active-text="`启用分组分析 (${groupSize}个/组)`"
            inactive-text="一次性分析全部"
            class="group-switch"
          />
          <div v-if="useGroupedAnalysis" class="group-size-options">
            <span class="option-label">分组大小:</span>
            <el-radio-group v-model="groupSize" size="small">
              <el-radio-button :label="2">2个/组</el-radio-button>
              <el-radio-button :label="3">3个/组</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <!-- 分析预估 -->
        <div class="analysis-estimate">
          <div class="estimate-item">
            <span class="estimate-label">预估时间:</span>
            <span class="estimate-value">{{ getEstimatedTime() }}</span>
          </div>
          <div class="estimate-item">
            <span class="estimate-label">分析深度:</span>
            <span class="estimate-value">{{ getAnalysisDepth() }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分析按钮区域 -->
    <div v-if="selectedBallIds.length > 0" class="analysis-actions">
      <el-button 
        type="primary" 
        size="large"
        :disabled="!canAnalyze"
        @click="startAnalysis"
        :loading="isAnalyzing"
      >
        {{ isAnalyzing ? '分析中...' : getAnalyzeButtonText() }}
        <el-icon v-if="!isAnalyzing"><ArrowRight /></el-icon>
      </el-button>
      
      <div class="action-hint">
        <el-icon><InfoFilled /></el-icon>
        <span>分析完成后，您可以继续选择翻译质量等级</span>
      </div>
    </div>
    
    <!-- 分析进度 -->
    <div v-if="analysisProgress.isActive" class="analysis-progress">
      <div class="progress-header">
        <h4>分析进度</h4>
        <span>{{ analysisProgress.completedItems }} / {{ analysisProgress.totalItems }}</span>
      </div>
      <el-progress 
        :percentage="Math.round((analysisProgress.completedItems / analysisProgress.totalItems) * 100)"
        :stroke-width="8"
        class="progress-bar"
      />
      <div v-if="analysisProgress.currentItem" class="current-item">
        <span>正在分析: {{ analysisProgress.currentItem }}</span>
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
      
      <el-button 
        type="primary" 
        size="large"
        :disabled="!canProceed"
        @click="handleNext"
      >
        下一步：选择翻译质量
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Tools, InfoFilled, Plus, Collection, Grid, Star, Delete,
  Setting, ArrowLeft, ArrowRight, CircleCheck, Loading, Close
} from '@element-plus/icons-vue'

const props = defineProps({
  sourceText: {
    type: String,
    default: ''
  },
  requirements: {
    type: Object,
    default: () => ({})
  },
  mode: {
    type: String,
    default: 'zh-ar'
  }
})

const emit = defineEmits(['analysis-complete', 'back'])

// 状态管理
const selectedBallIds = ref([])
const analyzedBalls = ref(new Set())
const analyzingBalls = ref(new Set())
const useGroupedAnalysis = ref(false)
const groupSize = ref(2)
const isAnalyzing = ref(false)
const analysisProgress = ref({
  isActive: false,
  totalItems: 0,
  completedItems: 0,
  currentItem: ''
})

// 功能球定义
const allBalls = computed(() => [
  {
    id: 'text-features',
    label: '文本特征分析',
    icon: Grid,
    description: '分析文本的语言特征、文体风格和结构特点',
    prompt: '输出文本特征',
    disabled: false,
    disabledReason: '',
    category: 'basic',
    estimatedTime: 30
  },
  {
    id: 'terminology',
    label: '专业术语、成语/习语',
    icon: Collection,
    description: '识别和分析文本中的专业术语、成语和习惯用语',
    prompt: '输出文本专业术语、成语/习语',
    disabled: false,
    disabledReason: '',
    category: 'basic',
    estimatedTime: 45
  },
  {
    id: 'suggestions',
    label: '翻译建议',
    icon: Star,
    description: '基于文本特点提供具体的翻译策略和建议',
    prompt: '给出可直接供人工翻译使用的翻译建议',
    disabled: false,
    disabledReason: '',
    category: 'advanced',
    estimatedTime: 60
  },
  {
    id: 'intent-analysis',
    label: '翻译意图/受众分析',
    icon: InfoFilled,
    description: '分析翻译意图和目标受众，优化翻译策略',
    prompt: '分析翻译意图和受众',
    disabled: !props.requirements.intent || !props.requirements.intent.trim(),
    disabledReason: !props.requirements.intent || !props.requirements.intent.trim() ? '需要先填写"翻译意图/受众"' : '',
    category: 'context',
    estimatedTime: 40
  },
  {
    id: 'reference-analysis',
    label: '参考译文风格分析',
    icon: Setting,
    description: '分析参考译文的风格特点，用于指导翻译',
    prompt: '分析参考译文风格',
    disabled: !props.requirements.reference || !props.requirements.reference.trim(),
    disabledReason: !props.requirements.reference || !props.requirements.reference.trim() ? '需要先提供"参考译文"' : '',
    category: 'context',
    estimatedTime: 50
  },
  {
    id: 'direct-request-analysis',
    label: '特殊要求分析',
    icon: Plus,
    description: '分析特殊翻译要求，确保翻译符合具体需求',
    prompt: '分析特殊要求',
    disabled: !props.requirements.directRequest || !props.requirements.directRequest.trim(),
    disabledReason: !props.requirements.directRequest || !props.requirements.directRequest.trim() ? '需要先填写"特殊要求"' : '',
    category: 'context',
    estimatedTime: 35
  }
])

const availableBalls = computed(() => {
  return allBalls.value.map(ball => ({
    ...ball,
    disabled: ball.id === 'intent-analysis' ? (!props.requirements.intent || !props.requirements.intent.trim()) :
              ball.id === 'reference-analysis' ? (!props.requirements.reference || !props.requirements.reference.trim()) :
              ball.id === 'direct-request-analysis' ? (!props.requirements.directRequest || !props.requirements.directRequest.trim()) :
              ball.disabled,
    disabledReason: ball.id === 'intent-analysis' ? (!props.requirements.intent || !props.requirements.intent.trim() ? '需要先填写"翻译意图/受众"' : '') :
                    ball.id === 'reference-analysis' ? (!props.requirements.reference || !props.requirements.reference.trim() ? '需要先提供"参考译文"' : '') :
                    ball.id === 'direct-request-analysis' ? (!props.requirements.directRequest || !props.requirements.directRequest.trim() ? '需要先填写"特殊要求"' : '') :
                    ball.disabledReason
  }))
})

const recommendedBalls = computed(() => {
  const recommendations = []
  
  // 基础推荐
  recommendations.push({
    ...availableBalls.value.find(b => b.id === 'text-features'),
    reason: '分析文本基本特征，为翻译提供基础信息'
  })
  
  recommendations.push({
    ...availableBalls.value.find(b => b.id === 'terminology'),
    reason: '识别专业术语，确保翻译准确性'
  })
  
  // 根据需求推荐
  if (props.requirements.intent && props.requirements.intent.trim()) {
    recommendations.push({
      ...availableBalls.value.find(b => b.id === 'intent-analysis'),
      reason: '根据您填写的翻译意图进行定向分析'
    })
  }
  
  if (props.requirements.reference && props.requirements.reference.trim()) {
    recommendations.push({
      ...availableBalls.value.find(b => b.id === 'reference-analysis'),
      reason: '分析您提供的参考译文风格'
    })
  }
  
  // 根据文本长度推荐
  if (props.sourceText.length > 200) {
    recommendations.push({
      ...availableBalls.value.find(b => b.id === 'suggestions'),
      reason: '文本较长，建议使用翻译策略分析'
    })
  }
  
  return recommendations.filter(r => r && !r.disabled)
})

const allRecommendedSelected = computed(() => {
  return recommendedBalls.value.every(ball => selectedBallIds.value.includes(ball.id))
})

const basicSetSelected = computed(() => {
  const basicSet = ['text-features', 'terminology']
  return basicSet.every(id => selectedBallIds.value.includes(id))
})

const canAnalyze = computed(() => {
  return selectedBallIds.value.length > 0 && !isAnalyzing.value && props.sourceText.trim()
})

const canProceed = computed(() => {
  return selectedBallIds.value.length > 0 && selectedBallIds.value.every(id => analyzedBalls.value.has(id))
})

const getAnalyzeButtonText = () => {
  if (selectedBallIds.value.length === 0) return '请选择分析功能'
  const unanalyzed = selectedBallIds.value.filter(id => !analyzedBalls.value.has(id))
  if (unanalyzed.length === 0) return '分析已完成'
  if (useGroupedAnalysis.value && unanalyzed.length > groupSize.value) {
    return `开始分组分析 (${Math.ceil(unanalyzed.length / groupSize.value)} 组)`
  }
  return `开始分析 (${unanalyzed.length} 个功能)`
}

const getEstimatedTime = () => {
  const totalTime = selectedBallIds.value.reduce((total, id) => {
    const ball = availableBalls.value.find(b => b.id === id)
    return total + (ball?.estimatedTime || 30)
  }, 0)
  
  if (totalTime < 60) return `约 ${totalTime} 秒`
  return `约 ${Math.ceil(totalTime / 60)} 分钟`
}

const getAnalysisDepth = () => {
  const categories = [...new Set(selectedBallIds.value.map(id => {
    const ball = availableBalls.value.find(b => b.id === id)
    return ball?.category
  }))]
  
  if (categories.length <= 1) return '基础分析'
  if (categories.length === 2) return '标准分析'
  return '深度分析'
}

const getBallIcon = (ballId) => {
  const ball = availableBalls.value.find(b => b.id === ballId)
  return ball?.icon || Document
}

const getBallLabel = (ballId) => {
  const ball = availableBalls.value.find(b => b.id === ballId)
  return ball?.label || ballId
}

const addBall = (ball) => {
  if (ball.disabled || selectedBallIds.value.includes(ball.id)) return
  selectedBallIds.value.push(ball.id)
}

const removeBall = (ballId) => {
  const index = selectedBallIds.value.indexOf(ballId)
  if (index > -1) {
    selectedBallIds.value.splice(index, 1)
    analyzedBalls.value.delete(ballId)
    analyzingBalls.value.delete(ballId)
  }
}

const toggleBall = (ball) => {
  if (ball.disabled) return
  
  if (selectedBallIds.value.includes(ball.id)) {
    removeBall(ball.id)
  } else {
    addBall(ball)
  }
}

const addAllRecommended = () => {
  recommendedBalls.value.forEach(ball => {
    if (!ball.disabled && !selectedBallIds.value.includes(ball.id)) {
      selectedBallIds.value.push(ball.id)
    }
  })
}

const addBasicSet = () => {
  const basicSet = ['text-features', 'terminology']
  basicSet.forEach(id => {
    if (!selectedBallIds.value.includes(id)) {
      selectedBallIds.value.push(id)
    }
  })
}

const clearAll = () => {
  selectedBallIds.value = []
  analyzedBalls.value.clear()
  analyzingBalls.value.clear()
}

const startAnalysis = async () => {
  if (!canAnalyze.value) return
  
  isAnalyzing.value = true
  const unanalyzedBalls = selectedBallIds.value.filter(id => !analyzedBalls.value.has(id))
  
  // 设置进度
  analysisProgress.value = {
    isActive: true,
    totalItems: unanalyzedBalls.length,
    completedItems: 0,
    currentItem: ''
  }
  
  try {
    // 模拟分析过程
    for (const ballId of unanalyzedBalls) {
      const ball = availableBalls.value.find(b => b.id === ballId)
      analysisProgress.value.currentItem = ball.label
      analyzingBalls.value.add(ballId)
      
      // 模拟分析时间
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      analyzingBalls.value.delete(ballId)
      analyzedBalls.value.add(ballId)
      analysisProgress.value.completedItems++
    }
    
    ElMessage.success(`完成 ${unanalyzedBalls.length} 个功能的分析`)
  } catch (error) {
    ElMessage.error('分析失败，请重试')
  } finally {
    isAnalyzing.value = false
    analysisProgress.value.isActive = false
  }
}

const handleBack = () => {
  emit('back')
}

const handleNext = () => {
  if (canProceed.value) {
    emit('analysis-complete', {
      selectedBalls: selectedBallIds.value.map(id => availableBalls.value.find(b => b.id === id)),
      analysisResults: Object.fromEntries(
        Array.from(analyzedBalls.value).map(id => [id, `分析结果_${id}`])
      )
    })
  }
}

// 初始化推荐
onMounted(() => {
  // 自动添加基础推荐
  setTimeout(() => {
    if (recommendedBalls.value.length > 0) {
      addBall(recommendedBalls.value[0])
      if (recommendedBalls.value.length > 1) {
        addBall(recommendedBalls.value[1])
      }
    }
  }, 500)
})
</script>

<style scoped>
.function-analysis-step {
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

.analysis-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.smart-recommendations,
.all-functions {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(156, 175, 136, 0.3);
  padding: 24px;
}

.recommendation-header,
.function-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.recommendation-header h3,
.function-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: var(--text-dark);
  margin: 0;
  font-weight: 600;
}

.recommendation-subtitle,
.function-subtitle {
  font-size: 12px;
  color: var(--text-light);
}

.recommended-functions {
  margin-bottom: 20px;
}

.recommended-ball {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(156, 175, 136, 0.2);
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.recommended-ball.selected {
  border-color: var(--forest-green);
  background: rgba(34, 139, 34, 0.05);
}

.ball-content {
  flex: 1;
  display: flex;
  gap: 12px;
}

.ball-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(156, 175, 136, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--forest-green);
}

.ball-info h4 {
  font-size: 14px;
  margin: 0 0 4px 0;
  color: var(--text-dark);
}

.ball-description {
  font-size: 12px;
  color: var(--text-medium);
  margin: 0 0 6px 0;
}

.recommendation-reason {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-light);
}

.quick-actions {
  display: flex;
  gap: 8px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.function-ball {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(156, 175, 136, 0.2);
  border-radius: var(--radius-md);
  padding: 16px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.function-ball:hover:not(.disabled) {
  transform: translateY(-2px);
  border-color: var(--forest-green);
}

.function-ball.selected {
  border-color: var(--forest-green);
  background: rgba(34, 139, 34, 0.1);
}

.function-ball.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.function-ball .ball-icon {
  width: 36px;
  height: 36px;
  margin: 0 auto 8px;
  font-size: 18px;
}

.ball-label {
  display: block;
  font-size: 12px;
  color: var(--text-dark);
  line-height: 1.3;
}

.disabled-reason {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.function-ball.disabled:hover .disabled-reason {
  opacity: 1;
}

.selected-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--forest-green);
  font-size: 16px;
}

.selected-functions,
.analysis-config,
.analysis-actions {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(156, 175, 136, 0.2);
  padding: 20px;
  margin-bottom: 20px;
}

.selected-header,
.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.selected-header h3,
.config-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: var(--text-dark);
  margin: 0;
  font-weight: 600;
}

.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid rgba(156, 175, 136, 0.2);
}

.selected-item.analyzed {
  border-color: var(--forest-green);
  background: rgba(34, 139, 34, 0.05);
}

.selected-item.analyzing {
  border-color: var(--desert-gold);
  background: rgba(218, 165, 32, 0.05);
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-dark);
}

.item-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon.success {
  color: var(--forest-green);
}

.status-icon.loading {
  color: var(--desert-gold);
  animation: spin 1s linear infinite;
}

.status-text {
  font-size: 12px;
  color: var(--text-light);
}

.config-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-size-options {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-label {
  font-size: 12px;
  color: var(--text-medium);
}

.analysis-estimate {
  display: flex;
  gap: 20px;
}

.estimate-item {
  display: flex;
  gap: 8px;
}

.estimate-label {
  font-size: 12px;
  color: var(--text-light);
}

.estimate-value {
  font-size: 12px;
  color: var(--text-dark);
  font-weight: 600;
}

.analysis-actions {
  text-align: center;
}

.action-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-light);
  margin-top: 12px;
}

.analysis-progress {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(156, 175, 136, 0.2);
  padding: 20px;
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-header h4 {
  font-size: 14px;
  color: var(--text-dark);
  margin: 0;
}

.current-item {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-light);
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 968px) {
  .analysis-layout {
    grid-template-columns: 1fr;
  }
  
  .analysis-estimate {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .step-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .step-actions .el-button {
    width: 100%;
  }
}
</style> 