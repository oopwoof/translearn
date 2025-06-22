<template>
    <!-- 固定背景图层 -->
    <div class="background-layer"></div>
    
    <div class="translation-workspace">
      <!-- Logo区域 - 功能区左侧 -->
      <div class="logo-section">
        <svg width="280" height="70" viewBox="0 0 280 70">
          <!-- SVG 渐变定义 -->
          <defs>
            <linearGradient id="sandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#F4E4BC"/>
              <stop offset="100%" style="stop-color:#D2B48C"/>
            </linearGradient>
          </defs>
          
          <!-- 绿洲图形 -->
          <ellipse cx="35" cy="52" rx="30" ry="5" fill="url(#sandGradient)" opacity="0.8"/>
          
          <path d="M 23 44 Q 21 37 19 30 Q 17 26 15 24" stroke="#228B22" stroke-width="1.3" fill="none"/>
          <path d="M 47 44 Q 49 37 51 30 Q 53 26 55 24" stroke="#228B22" stroke-width="1.3" fill="none"/>
          <path d="M 35 44 Q 34 35 32 26 Q 31 22 30 20" stroke="#8B4513" stroke-width="1.6" fill="none"/>
          
          <ellipse cx="15" cy="24" rx="5" ry="2.5" fill="#228B22" transform="rotate(-30 15 24)"/>
          <ellipse cx="55" cy="24" rx="5" ry="2.5" fill="#228B22" transform="rotate(30 55 24)"/>
          <ellipse cx="30" cy="20" rx="6" ry="3.5" fill="#32CD32"/>
          
          <ellipse cx="35" cy="48" rx="22" ry="2.5" fill="#4682B4" opacity="0.6"/>
          
          <!-- 中文文字 -->
          <text x="80" y="26" font-family="Microsoft YaHei" font-size="18" font-weight="bold" fill="#228B22">绿洲学翻</text>
          <!-- 英文文字 - 更深的颜色 -->
          <text x="80" y="42" font-family="Arial" font-size="12" font-weight="600" fill="#B8860B">TransLearn</text>
          <!-- 副标题 -->
          <text x="80" y="55" font-family="Microsoft YaHei" font-size="8" fill="#7f8c8d">AI阿拉伯语学习翻译平台</text>
        </svg>
      </div>
      
      <div class="top-controls">
        <FunctionArea 
          :mode="mode" 
          :intent="intent"
          :reference="reference"
          :directRequest="directRequest"
          :excludedBallIds="excludedBallIds"
          :current-text="currentInputText"
          @ball-removed="handleBallRemoved"
          @multi-drag-start="handleMultiDragStart"
        />
        <ModeSelector 
          :mode="mode"
          @update:mode="handleModeChange"
        />
      </div>
      <div class="workspace-container">
        <div class="panel-container">
          <AnalysisPanel 
            :analysis-data="analysisData"
            :analyzing="analyzing"
            :current-text="leftText"
            :show-analysis-hint="shouldShowAnalysisHint"
            @analyze="handleAnalyzeWithBalls"
            @analyze-grouped="handleGroupedAnalyzeWithBalls"
            @balls-changed="handleBallsChanged"
            ref="analysisPanelRef"
          />
          <ArabicPanel
            v-model="targetText"
            :readonly="mode === 'zh-ar'"
            :loading="isTranslating"
            :show-input-hint="mode === 'ar-zh' && !targetText"
          />
          <TranslationControls
            v-model:intent="intent"
            v-model:reference="reference"
            v-model:directRequest="directRequest"
            :quality="quality"
            :loading="isTranslating"
            @update:quality="handleQualityChange"
            @translate="handleTranslate"
          />
          <ChinesePanel
            v-model="textToAnalyze"
            :readonly="mode === 'ar-zh'"
            :loading="isTranslating"
            :show-input-hint="mode === 'zh-ar' && !textToAnalyze"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import ChinesePanel from './ChinesePanel.vue'
  import ArabicPanel from './ArabicPanel.vue'
  import TranslationControls from './TranslationControls.vue'
  import FunctionArea from './FunctionArea.vue'
  import AnalysisPanel from './AnalysisPanel.vue'
  import ModeSelector from './ModeSelector.vue'
  import { useTranslationStore } from '@/stores/translation'
  
  const translationStore = useTranslationStore()
  
  const mode = ref('zh-ar')
  const quality = ref('')
  const textToAnalyze = ref('')
  const targetText = ref('')
  const analysisData = ref(null)
  const isTranslating = ref(false)
  const intent = ref('')
  const reference = ref('')
  const directRequest = ref('')
  const analyzing = ref(false)
  const excludedBallIds = ref([])
  const analysisPanelRef = ref(null)
  const selectedBallsCount = ref(0)
  
  // 计算属性：根据模式获取当前应该分析的文本
  const leftText = computed(() => {
    return mode.value === 'ar-zh' ? targetText.value : textToAnalyze.value
  })

  // 计算属性：根据模式获取当前的输入文本
  const currentInputText = computed(() => {
    return mode.value === 'ar-zh' ? targetText.value : textToAnalyze.value
  })

  // 计算属性：控制分析提示显示
  const shouldShowAnalysisHint = computed(() => {
    const hasValidText = currentInputText.value && currentInputText.value.trim().length > 0
    const noBallsSelected = selectedBallsCount.value === 0
    return hasValidText && noBallsSelected
  })
  
  // 监听模式变化
  watch(mode, (newMode) => {
    // 清空文本和分析结果
    textToAnalyze.value = ''
    targetText.value = ''
    analysisData.value = null
    quality.value = ''
    
    // 清除分析面板状态
    if (analysisPanelRef.value) {
      analysisPanelRef.value.clearAllAnalysisState()
    }
    
    // 清除store中的分析结果
    translationStore.clearAllState()
  })
  
  const handleModeChange = (newMode) => {
    mode.value = newMode
  }

  const handleBallsChanged = (ballIds) => {
    excludedBallIds.value = ballIds
    selectedBallsCount.value = ballIds.length
  }

  const handleBallRemoved = (ballId) => {
    // 从分析面板中移除对应的球
    if (analysisPanelRef.value) {
      analysisPanelRef.value.removeBallById(ballId)
    }
  }
  
  const handleMultiDragStart = (multiDragData) => {
    console.log('🎯 工作区接收到多选拖拽事件:', multiDragData)
    ElMessage.info(`开始拖拽 ${multiDragData.count} 个功能球`)
  }
  
  const handleAnalyzeWithBalls = async (selectedBalls, onAnalysisComplete) => {
    if (!currentInputText.value) {
      ElMessage.warning('请先输入要分析的文本')
      return
    }
    
    if (!selectedBalls || selectedBalls.length === 0) {
      ElMessage.warning('没有需要分析的功能球')
      return
    }
    
    analyzing.value = true
    try {
      // 构建分析请求，包含翻译要求信息
      const analysisRequest = {
        text: currentInputText.value,
        selectedBalls: selectedBalls,
        intent: intent.value || '',
        reference: reference.value || '',
        directRequest: directRequest.value || '',
        mode: mode.value
      }
      
      console.log('🚀 发送分析请求:', analysisRequest)
      const result = await translationStore.analyzeTextWithBalls(analysisRequest)
      console.log('📥 收到分析结果:', result)
      
      if (!result || !result.success) {
        throw new Error(result?.message || '分析失败')
      }
      
      // 直接传递完整的后端结果（包含originalData）给AnalysisPanel
      const newAnalysisData = result
      newAnalysisData.analyzedAt = new Date().toISOString()
      
      // 直接使用完整的结果数据，不要解构，保持originalData结构
      analysisData.value = newAnalysisData
      console.log('📋 更新analysisData.value (完整结构):', analysisData.value)
      
      // Store已经在内部处理了存储逻辑，这里不需要重复调用
      console.log('💾 分析结果已在store中处理')
      
      // 通知AnalysisPanel分析完成
      const analyzedBallIds = selectedBalls.map(ball => ball.id).filter(id => id)
      if (onAnalysisComplete && typeof onAnalysisComplete === 'function') {
        onAnalysisComplete(analyzedBallIds)
      }
      
      ElMessage.success(`完成 ${selectedBalls.length} 个功能球的分析`)
    } catch (error) {
      console.error('❌ 分析失败:', error)
      ElMessage.error(error.message || '分析失败')
    } finally {
      analyzing.value = false
    }
  }
  
  // 处理分组分析
  const handleGroupedAnalyzeWithBalls = async (groupedRequest) => {
    if (!currentInputText.value) {
      ElMessage.warning('请先输入要分析的文本')
      return
    }
    
    const { balls, groupSize, onProgress, onComplete } = groupedRequest
    
    if (!balls || balls.length === 0) {
      ElMessage.warning('没有需要分析的功能球')
      return
    }
    
    if (!groupSize || groupSize < 1) {
      ElMessage.warning('分组大小设置错误')
      return
    }
    
    analyzing.value = true
    try {
      // 构建分析请求
      const analysisRequest = {
        text: currentInputText.value,
        selectedBalls: balls,
        intent: intent.value || '',
        reference: reference.value || '',
        directRequest: directRequest.value || '',
        mode: mode.value
      }
      
      console.log('🚀 发送分组分析请求:', analysisRequest, { groupSize })
      
      // 使用流式分组分析API
      const result = await translationStore.analyzeTextWithBallsStreaming(
        analysisRequest,
        groupSize,
        onProgress
      )
      
      if (result && result.success && result.data) {
        // 直接传递完整的后端结果给AnalysisPanel
        const newAnalysisData = result
        newAnalysisData.analyzedAt = new Date().toISOString()
        
        // 直接使用完整的结果数据，保持originalData结构
        analysisData.value = newAnalysisData
        
        // Store已经在内部处理了存储逻辑，这里不需要重复调用
        console.log('💾 分组分析结果已在store中处理')
        
        // 通知AnalysisPanel分析完成
        const analyzedBallIds = balls.map(ball => ball.id).filter(id => id)
        if (onComplete && typeof onComplete === 'function') {
          onComplete(analyzedBallIds)
        }
        
        ElMessage.success(`完成 ${balls.length} 个功能球的分组分析`)
      } else {
        throw new Error(result?.message || '分组分析未返回有效结果')
      }
    } catch (error) {
      console.error('❌ 分组分析失败:', error)
      ElMessage.error(error.message || '分组分析失败')
    } finally {
      analyzing.value = false
    }
  }
  
  const handleTranslate = async () => {
    if (!currentInputText.value) {
      ElMessage.warning('请输入要翻译的文本')
      return
    }
    
    if (!quality.value) {
      ElMessage.warning('请选择翻译质量')
      return
    }
    
    try {
      isTranslating.value = true
      
      // 构建翻译要求
      const requirements = {
        quality: quality.value,
        intent: intent.value,
        reference: reference.value,
        directRequest: directRequest.value
      }
      
      // 检查是否有可用的分析结果
      const availableAnalysis = translationStore.getAnalysisForTranslation(currentInputText.value)
      if (availableAnalysis) {
        console.log('检测到可用分析结果，将传递给翻译:', availableAnalysis)
      } else {
        console.log('无可用分析结果，执行完整翻译流程')
      }
      
      const result = await translationStore.translateText(
        currentInputText.value, 
        mode.value, 
        requirements
      )
      
      // 根据模式将翻译结果放到正确的面板
      if (mode.value === 'ar-zh') {
        textToAnalyze.value = result.translatedText
      } else {
        targetText.value = result.translatedText
      }
      ElMessage.success('翻译完成')
    } catch (error) {
      ElMessage.error(error.message || '翻译失败')
    } finally {
      isTranslating.value = false
    }
  }
  
  const handleQualityChange = (newQuality) => {
    quality.value = newQuality
  }
  </script>
  
  <style scoped>
/* 固定背景图层 - 增强浓度版本 */
.background-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-light) 50%, var(--primary-green-dark) 100%);
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: cover;
  z-index: -1;
  pointer-events: none;
}

.translation-workspace {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  /* 保持透明让背景图层显示 */
  background: transparent;
  overflow: hidden;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  color: var(--text-dark);
  position: relative;
  z-index: 1;
}
  
  /* Logo区域样式 */
  .logo-section {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 10;
    pointer-events: none;
  }
  
  .logo-section svg {
    display: block;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
  }
  
  /* 顶部控制区域 - 现在是第二个子元素 */
  .translation-workspace > :nth-child(2) {
    height: 10vh;
    flex-shrink: 0;
  }
  
  .top-controls {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 0 15px;
  }
  
  .top-controls > :first-child {
    flex: 1;
  }
  
  .top-controls > :last-child {
    flex-shrink: 0;
  }
  
  .workspace-container {
  height: 90vh;
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 15px;
  overflow: hidden;
  min-height: 0;
  /* 保持透明让背景图层显示 */
  background: transparent;
}

.panel-container {
  flex: 1;
  display: grid;
  grid-template-columns: 3fr 3fr 1fr 3fr;
  gap: 15px;
  min-height: 0;
  overflow: hidden;
  /* 保持透明让背景图层显示 */
  background: transparent;
}
  
  /* 调整各个面板的字体大小 */
  .panel-container > * {
    font-size: 13px;
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    box-shadow: 0 8px 32px var(--shadow-light);
  }
  
  /* 针对控制面板的特殊处理 */
  .panel-container > :nth-child(3) {
    font-size: 12px;
    margin-top: 40px;
  }
  
  @media (max-width: 1600px) {
    .panel-container {
      grid-template-columns: 3fr 3fr 1fr 3fr;
      gap: 12px;
    }
    
    .workspace-container {
      padding: 12px;
      gap: 12px;
    }
    
    .translation-workspace {
      font-size: 13px;
    }
    
    .top-controls {
      gap: 12px;
      padding: 0 12px;
    }
    
    /* 针对控制面板的特殊处理 - 中等屏幕 */
    .panel-container > :nth-child(3) {
      margin-top: 38px;
    }
    
    /* 中等屏幕logo调整 */
    .logo-section {
      top: 12px;
      left: 12px;
    }
    
    .logo-section svg {
      width: 250px;
      height: 62px;
    }
  }
  
  @media (max-width: 1200px) {
    .panel-container {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
      gap: 10px;
    }
    
    .workspace-container {
      padding: 10px;
      gap: 10px;
    }
    
    .translation-workspace {
      font-size: 12px;
    }
    
    .translation-workspace > :nth-child(2) {
      height: 12vh;
    }
    
    .workspace-container {
      height: 88vh;
    }
    
    .top-controls {
      flex-direction: column;
      gap: 8px;
      padding: 0 10px;
      align-items: stretch;
    }
    
    .top-controls > :first-child,
    .top-controls > :last-child {
      flex: none;
    }
    
    /* 针对控制面板的特殊处理 - 移动端取消margin-top */
    .panel-container > :nth-child(3) {
      margin-top: 0;
    }
    
    /* 移动端logo调整 */
    .logo-section {
      top: 8px;
      left: 8px;
    }
    
    .logo-section svg {
      width: 220px;
      height: 55px;
    }
  }
  </style>
  