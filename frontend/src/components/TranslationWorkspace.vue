<template>
    <div class="translation-workspace">
      <FunctionArea :mode="mode" />
      <div class="workspace-container">
        <div class="panel-container">
          <AnalysisPanel 
            :analysis-data="analysisData"
            :analyzing="analyzing"
            @analyze="handleAnalyze"
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
  import { ref, watch } from 'vue'
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
  
  // 监听模式变化
  watch(mode, (newMode) => {
    // 清空文本和分析结果
    textToAnalyze.value = ''
    targetText.value = ''
    analysisData.value = null
    quality.value = ''
  })
  
  const handleModeChange = (newMode) => {
    mode.value = newMode
  }
  
  const handleAnalyze = async (selectedBalls) => {
    if (!textToAnalyze.value) {
      ElMessage.warning('请先输入要分析的文本')
      return
    }
    
    if (!selectedBalls || selectedBalls.length === 0) {
      ElMessage.warning('请先拖入功能球')
      return
    }
    
    analyzing.value = true
    try {
      // 只使用被拖入的功能球的prompt
      const prompts = selectedBalls.map(ball => ball.prompt)
      console.log('Using prompts from selected balls:', prompts)
      const result = await translationStore.analyzeText(textToAnalyze.value, prompts)
      analysisData.value = result
      ElMessage.success('分析完成')
    } catch (error) {
      ElMessage.error(error.message || '分析失败')
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
      const result = await translationStore.translateText(textToAnalyze.value, quality.value)
      targetText.value = result
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
  .translation-workspace {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f5f7fa;
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
  }
  
  .panel-container {
    flex: 1;
    display: grid;
    grid-template-columns: 300px 1fr 300px 1fr;
    gap: 20px;
    min-height: 0;
    overflow: hidden;
  }
  
  @media (max-width: 1600px) {
    .panel-container {
      grid-template-columns: 250px 1fr 250px 1fr;
    }
  }
  
  @media (max-width: 1200px) {
    .panel-container {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
  }
  </style>
  