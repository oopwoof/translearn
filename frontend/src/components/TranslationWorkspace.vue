<template>
    <div class="translation-workspace">
      <!-- 主工作区 -->
      <div class="workspace">
        <!-- 左侧解析区 -->
        <AnalysisPanel :analysis-data="analysisData" />
        
        <!-- 阿语区 -->
        <div>
          <template v-if="translationMode === 'zh-ar'">
            <ArabicPanel
              v-model="arabicText"
              :readonly="true"
              :loading="isTranslating"
              :model-value="arabicText"
              :placeholder="'翻译结果将显示在这里...'"
            />
          </template>
          <template v-else>
            <ArabicPanel
              v-model="arabicText"
              :readonly="false"
              :loading="isTranslating"
            />
          </template>
        </div>
        
        <!-- 翻译要求区 -->
        <TranslationControls 
          v-model:intent="translationRequirements.intent"
          v-model:audience="translationRequirements.audience"
          v-model:reference="translationRequirements.reference"
          v-model:directRequest="translationRequirements.directRequest"
          v-model:quality="translationRequirements.quality"
          v-model:mode="translationMode"
          @analyze="handleAnalyze"
        />
        
        <!-- 中文区 -->
        <div>
          <template v-if="translationMode === 'ar-zh'">
            <ChinesePanel
              v-model="chineseText"
              :readonly="true"
              :loading="isTranslating"
              :model-value="chineseText"
              :placeholder="'翻译结果将显示在这里...'"
            />
          </template>
          <template v-else>
            <ChinesePanel
              v-model="chineseText"
              :readonly="false"
              :loading="isTranslating"
            />
          </template>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import AnalysisPanel from './AnalysisPanel.vue'
  import ArabicPanel from './ArabicPanel.vue'
  import ChinesePanel from './ChinesePanel.vue'
  import TranslationControls from './TranslationControls.vue'
  import { useTranslationStore } from '@/stores/translation'
  
  const translationStore = useTranslationStore()
  
  // 翻译模式：zh-ar (中翻阿) 或 ar-zh (阿翻中)
  const translationMode = ref('zh-ar')
  
  // 文本内容
  const chineseText = ref('')
  const arabicText = ref('')
  
  // 翻译要求
  const translationRequirements = reactive({
    intent: '',
    audience: '',
    reference: '',
    directRequest: '',
    quality: 'standard'
  })
  
  // 分析数据
  const analysisData = ref(null)
  const isTranslating = ref(false)
  
  // 处理分析
  const handleAnalyze = async () => {
    const sourceText = translationMode.value === 'zh-ar' ? chineseText.value : arabicText.value
    
    if (!sourceText.trim()) {
      ElMessage.warning('请输入要分析的文本')
      return
    }
  
    isTranslating.value = true
  
    try {
      // 这里暂时使用占位分析数据
      analysisData.value = {
        textFeatures: {
          type: '一般文本',
          style: '中性语体'
        },
        terminology: [],
        suggestions: ['分析功能开发中...'],
        analyzedAt: new Date().toISOString()
      }
      
      ElMessage.success('分析完成！')
    } catch (error) {
      ElMessage.error(error.message || '分析失败')
    } finally {
      isTranslating.value = false
    }
  }
  </script>
  
  <style scoped>
  .translation-workspace {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
  }
  
  .workspace {
    flex: 1;
    display: grid;
    grid-template-columns: 300px 1fr 250px 1fr;
    gap: 20px;
    padding: 20px;
    overflow: hidden;
  }
  
  @media (max-width: 1200px) {
    .workspace {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto;
    }
  }
  </style>
  