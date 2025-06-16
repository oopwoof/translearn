<template>
    <div class="translation-workspace">
      <!-- 顶部模式选择器 -->
      <div class="mode-selector">
        <div 
          class="mode-tab" 
          :class="{ active: translationMode === 'zh-ar' }"
          @click="setTranslationMode('zh-ar')"
        >
          中文 → 阿拉伯语
        </div>
        <div 
          class="mode-tab" 
          :class="{ active: translationMode === 'ar-zh' }"
          @click="setTranslationMode('ar-zh')"
        >
          阿拉伯语 → 中文
        </div>
      </div>
  
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
              :placeholder="hideResultOnTranslate && !showArabicResult ? '' : '翻译结果将显示在这里...'"
              :show-result="showArabicResult"
              :hide-result-on-translate="hideResultOnTranslate"
              :on-show-result="() => { showArabicResult = true }"
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
          @translate="handleTranslate"
          :loading="isTranslating"
          :hide-result-on-translate="hideResultOnTranslate"
          @toggle-hide-result="hideResultOnTranslate = $event"
        />
        
        <!-- 中文区 -->
        <div>
          <template v-if="translationMode === 'ar-zh'">
            <ChinesePanel
              v-model="chineseText"
              :readonly="true"
              :loading="isTranslating"
              :model-value="chineseText"
              :placeholder="hideResultOnTranslate && !showChineseResult ? '' : '翻译结果将显示在这里...'"
              :show-result="showChineseResult"
              :hide-result-on-translate="hideResultOnTranslate"
              :on-show-result="() => { showChineseResult = true }"
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
  import { ref, reactive, watch } from 'vue'
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
  
  // 显示状态
  const showArabicResult = ref(false)
  const showChineseResult = ref(false)
  
  // 新增：隐藏模式开关
  const hideResultOnTranslate = ref(true)
  
  // 设置翻译模式
  const setTranslationMode = (mode) => {
    translationMode.value = mode
    // 清空文本
    chineseText.value = ''
    arabicText.value = ''
    analysisData.value = null
  }
  
  // 处理翻译
  const handleTranslate = async () => {
    const sourceText = translationMode.value === 'zh-ar' ? chineseText.value : arabicText.value
    
    if (!sourceText.trim()) {
      ElMessage.warning('请输入要翻译的文本')
      return
    }
  
    isTranslating.value = true
  
    try {
      const result = await translationStore.translateWithAnalysis(
        sourceText,
        translationMode.value,
        translationRequirements
      )
  
      if (translationMode.value === 'zh-ar') {
        arabicText.value = result.translatedText
        showArabicResult.value = !hideResultOnTranslate.value // 根据开关决定是否直接显示
      } else {
        chineseText.value = result.translatedText
        showChineseResult.value = !hideResultOnTranslate.value
      }
  
      analysisData.value = result.analysis
      ElMessage.success('翻译完成！')
    } catch (error) {
      ElMessage.error(error.message || '翻译失败')
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
  
  .mode-selector {
    display: flex;
    background: white;
    border-bottom: 1px solid #e4e7ed;
    padding: 0 20px;
  }
  
  .mode-tab {
    padding: 15px 30px;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.3s;
    font-weight: 500;
  }
  
  .mode-tab:hover {
    background: #f5f7fa;
  }
  
  .mode-tab.active {
    border-bottom-color: #1E3050;
    color: #1E3050;
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
  
  .show-result-btn {
    margin: 20px auto;
    display: block;
    padding: 8px 24px;
    font-size: 16px;
    background: #1E3050;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .show-result-btn:hover {
    background: #274472;
  }
  </style>
  