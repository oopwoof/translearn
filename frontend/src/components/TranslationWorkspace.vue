<template>
    <div class="translation-workspace">
      <FunctionArea 
        :mode="mode" 
        :intent="intent"
        :reference="reference"
        :directRequest="directRequest"
        :excludedBallIds="excludedBallIds"
        @ball-removed="handleBallRemoved"
        @multi-drag-start="handleMultiDragStart"
      />
      <div class="workspace-container">
        <div class="panel-container">
          <AnalysisPanel 
            :analysis-data="analysisData"
            :analyzing="analyzing"
            :current-text="leftText"
            @analyze="handleAnalyzeWithBalls"
            @analyze-grouped="handleGroupedAnalyzeWithBalls"
            @balls-changed="handleBallsChanged"
            ref="analysisPanelRef"
          />
          <ArabicPanel
            v-model="targetText"
            :readonly="mode === 'zh-ar'"
            :loading="isTranslating"
          />
          <TranslationControls
            v-model:intent="intent"
            v-model:reference="reference"
            v-model:directRequest="directRequest"
            :mode="mode"
            :quality="quality"
            :loading="isTranslating"
            @update:mode="handleModeChange"
            @update:quality="handleQualityChange"
            @translate="handleTranslate"
          />
          <ChinesePanel
            v-model="textToAnalyze"
            :readonly="mode === 'ar-zh'"
            :loading="isTranslating"
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
  
  // 计算属性：分析面板始终分析textToAnalyze的内容
  const leftText = computed(() => {
    return textToAnalyze.value
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
  }

  const handleBallRemoved = (ballId) => {
    // 从分析面板中移除对应的球
    if (analysisPanelRef.value) {
      analysisPanelRef.value.removeBallById(ballId)
    }
  }
  
  const handleAnalyzeWithBalls = async (selectedBalls, onAnalysisComplete) => {
    if (!textToAnalyze.value) {
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
        text: textToAnalyze.value,
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
    if (!textToAnalyze.value) {
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
        text: textToAnalyze.value,
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
    if (!textToAnalyze.value) {
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
      const availableAnalysis = translationStore.getAnalysisForTranslation(textToAnalyze.value)
      if (availableAnalysis) {
        console.log('检测到可用分析结果，将传递给翻译:', availableAnalysis)
      } else {
        console.log('无可用分析结果，执行完整翻译流程')
      }
      
      const result = await translationStore.translateText(
        textToAnalyze.value, 
        mode.value, 
        requirements
      )
      
      targetText.value = result.translatedText
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

  const handleMultiDragStart = (multiDragData) => {
    console.log('🎯 工作区接收到多选拖拽事件:', multiDragData)
    ElMessage.info(`开始拖拽 ${multiDragData.count} 个功能球`)
  }
  </script>
  
  <style scoped>
  .translation-workspace {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: var(--bg-gradient-main);
    overflow: hidden;
    position: relative;
  }
  
  /* 🌅 浮动几何装饰元素 */
  .translation-workspace::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(255, 181, 167, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(254, 215, 170, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(52, 152, 219, 0.1) 0%, transparent 50%);
    animation: float 20s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
  
  .translation-workspace::after {
    content: '';
    position: absolute;
    top: 10%;
    right: 10%;
    width: 100px;
    height: 100px;
    background: linear-gradient(45deg, var(--sunset-coral), var(--sunset-gold));
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    opacity: 0.1;
    animation: float 15s ease-in-out infinite reverse;
    pointer-events: none;
    z-index: 0;
  }

  /* 🎯 FunctionArea 固定为页面的1/10 */
  .translation-workspace > :deep(.function-area) {
    height: 10vh; /* 页面的1/10 */
    min-height: 100px; /* 最小高度确保内容可见 */
    max-height: 140px; /* 最大高度限制 */
    flex-shrink: 0;
    overflow: hidden;
  }
  
  .workspace-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    overflow: hidden;
    min-height: 0;
    position: relative;
    z-index: 1;
    height: 90vh; /* 剩余的9/10页面高度 */
  }
  
  .panel-container {
    flex: 1;
    display: grid;
    grid-template-columns: 3fr 3fr 1fr 3fr; /* AnalysisPanel:3, ArabicPanel:3, ControlPanel:1, ChinesePanel:3 */
    gap: 20px;
    min-height: 0;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  /* 🎨 确保所有文本颜色清晰可见 */
  .translation-workspace :deep(*) {
    color: var(--vt-c-text-light-1, #2c3e50) !important;
  }

  .translation-workspace :deep(.el-input__inner) {
    color: var(--vt-c-text-light-1, #2c3e50) !important;
    background-color: rgba(255, 255, 255, 0.9) !important;
  }

  .translation-workspace :deep(.el-textarea__inner) {
    color: var(--vt-c-text-light-1, #2c3e50) !important;
    background-color: rgba(255, 255, 255, 0.9) !important;
  }

  .translation-workspace :deep(.el-button) {
    color: white !important;
  }

  .translation-workspace :deep(.el-button--primary) {
    background-color: var(--soft-blue, #3498db) !important;
    border-color: var(--soft-blue, #3498db) !important;
  }

  .translation-workspace :deep(h1, h2, h3, h4, h5, h6) {
    color: var(--deep-blue, #2c3e50) !important;
    font-weight: 600;
  }

  .translation-workspace :deep(p, span, div) {
    color: var(--vt-c-text-light-1, #2c3e50) !important;
  }

  .translation-workspace :deep(.feature-content),
  .translation-workspace :deep(.suggestion-content), 
  .translation-workspace :deep(.intent-content),
  .translation-workspace :deep(.reference-content),
  .translation-workspace :deep(.instruction-content) {
    color: var(--deep-blue, #2c3e50) !important;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 8px 12px;
    border-radius: var(--radius-md);
    margin-top: 8px;
  }
  
  @media (max-width: 1600px) {
    .panel-container {
      grid-template-columns: 3fr 3fr 1fr 3fr; /* 在较小屏幕上保持比例 */
    }
  }
  
  @media (max-width: 1200px) {
    .panel-container {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
    
    .workspace-container {
      height: auto;
      min-height: 90vh;
    }
  }
  </style>
  