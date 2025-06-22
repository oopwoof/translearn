<template>
    <!-- 固定背景图层 -->
    <div class="background-layer"></div>
    
    <div class="translation-workspace-v2">
      <!-- 步骤指示器 -->
      <WorkflowSteps :current-step="currentStep" />
      
      <!-- 主内容区 -->
      <div class="workspace-main">
        <!-- 动态内容区 -->
        <div class="dynamic-content">
          <!-- 第一步：模式选择 -->
          <ModeSelectionStep 
            v-if="currentStep === 1"
            v-model:mode="mode"
            @next="goToStep(2)"
          />
          
          <!-- 第二步：翻译需求 -->
          <TranslationRequirementsStep
            v-if="currentStep === 2"
            v-model:source-text="sourceText"
            v-model:intent="intent"
            v-model:reference="reference"
            v-model:direct-request="directRequest"
            :mode="mode"
            @next="goToStep(3)"
            @back="goToStep(1)"
          />
          
          <!-- 第三步：功能分析 -->
          <FunctionAnalysisStep
            v-if="currentStep === 3"
            :source-text="sourceText"
            :requirements="requirements"
            :mode="mode"
            @analysis-complete="handleAnalysisComplete"
            @back="goToStep(2)"
          />
          
          <!-- 第四步：质量翻译 -->
          <QualityTranslationStep
            v-if="currentStep === 4"
            :analysis-results="analysisResults"
            :source-text="sourceText"
            :mode="mode"
            @translate="handleTranslate"
            @back="goToStep(3)"
          />
          
          <!-- 翻译结果显示 -->
          <div v-if="currentStep === 5" class="translation-results">
            <div class="results-header">
              <h2>翻译完成</h2>
              <p class="results-description">您的翻译已完成，可以查看结果和进行后续操作</p>
            </div>
            
            <div class="results-layout">
              <!-- 源文本 -->
              <div class="source-panel">
                <ChinesePanel
                  v-if="mode === 'zh-ar'"
                  v-model="sourceText"
                  :readonly="true"
                />
                <ArabicPanel
                  v-else
                  v-model="sourceText"
                  :readonly="true"
                />
              </div>
              
              <!-- 翻译结果 -->
              <div class="target-panel">
                <ArabicPanel
                  v-if="mode === 'zh-ar'"
                  v-model="targetText"
                  :readonly="false"
                  :loading="isTranslating"
                />
                <ChinesePanel
                  v-else
                  v-model="targetText"
                  :readonly="false"
                  :loading="isTranslating"
                />
              </div>
            </div>
            
            <!-- 结果操作 -->
            <div class="results-actions">
              <el-button @click="startNewTranslation">
                <el-icon><Plus /></el-icon>
                新建翻译
              </el-button>
              <el-button @click="goToStep(4)">
                <el-icon><ArrowLeft /></el-icon>
                修改质量重译
              </el-button>
              <el-button @click="goToStep(3)">
                <el-icon><Setting /></el-icon>
                调整分析重译
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 侧边栏：配置摘要 -->
        <div class="config-sidebar">
          <ConfigSummary 
            :mode="mode"
            :source-text="sourceText"
            :requirements="requirements"
            :analysis-results="analysisResults"
            :quality="quality"
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, computed, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Plus, ArrowLeft, Setting } from '@element-plus/icons-vue'
  import ChinesePanel from './ChinesePanel.vue'
  import ArabicPanel from './ArabicPanel.vue'
  import WorkflowSteps from './WorkflowSteps.vue'
  import ModeSelectionStep from './ModeSelectionStep.vue'
  import TranslationRequirementsStep from './TranslationRequirementsStep.vue'
  import FunctionAnalysisStep from './FunctionAnalysisStep.vue'
  import QualityTranslationStep from './QualityTranslationStep.vue'
  import ConfigSummary from './ConfigSummary.vue'
  import { useTranslationStore } from '@/stores/translation'
  
  const translationStore = useTranslationStore()
  
  // 工作流状态管理
  const currentStep = ref(1)
  const mode = ref('')
  const sourceText = ref('')
  const targetText = ref('')
  const intent = ref('')
  const reference = ref('')
  const directRequest = ref('')
  const quality = ref('')
  const analysisResults = ref({})
  const isTranslating = ref(false)
  
  // 需求对象
  const requirements = computed(() => ({
    intent: intent.value,
    reference: reference.value,
    directRequest: directRequest.value
  }))
  
  // 步骤导航方法
  const goToStep = (step) => {
    currentStep.value = step
  }
  
  // 分析完成处理
  const handleAnalysisComplete = (analysisData) => {
    if (analysisData && analysisData.analysisResults) {
      analysisResults.value = analysisData.analysisResults
    } else {
      // 模拟分析结果
      analysisResults.value = {
        'text-features': '文本特征分析已完成',
        'terminology': '专业术语分析已完成'
      }
    }
    goToStep(4)
  }
  
  // 翻译处理
  const handleTranslate = async (translationData) => {
    if (!translationData || !translationData.quality) {
      ElMessage.warning('翻译配置不完整')
      return
    }
    
    isTranslating.value = true
    
    try {
      console.log('🚀 开始翻译:', translationData)
      
      // 构建翻译请求
      const translateRequest = {
        text: sourceText.value,
        mode: mode.value,
        quality: translationData.quality,
        intent: intent.value,
        reference: reference.value,
        directRequest: directRequest.value,
        analysisResults: analysisResults.value
      }
      
      // 调用翻译服务
      const result = await translationStore.translateText(translateRequest)
      
      if (result && result.success) {
        targetText.value = result.translatedText || '翻译完成'
        quality.value = translationData.quality
        goToStep(5) // 跳转到结果展示步骤
        ElMessage.success('翻译完成！')
      } else {
        throw new Error(result?.message || '翻译失败')
      }
    } catch (error) {
      console.error('❌ 翻译失败:', error)
      ElMessage.error(error.message || '翻译失败')
    } finally {
      isTranslating.value = false
    }
  }
  
  // 开始新的翻译
  const startNewTranslation = () => {
    // 重置所有状态
    currentStep.value = 1
    mode.value = ''
    sourceText.value = ''
    targetText.value = ''
    intent.value = ''
    reference.value = ''
    directRequest.value = ''
    quality.value = ''
    analysisResults.value = {}
    isTranslating.value = false
    
    ElMessage.success('已重置，可以开始新的翻译')
  }
  </script>
  
  <style scoped>
/* 固定背景图层 */
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

.translation-workspace-v2 {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: transparent;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  color: var(--text-dark);
  position: relative;
  z-index: 1;
}

.workspace-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

.dynamic-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.config-sidebar {
  width: 300px;
  flex-shrink: 0;
}

/* 翻译结果样式 */
.translation-results {
  padding: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.results-header {
  text-align: center;
  margin-bottom: 40px;
}

.results-header h2 {
  font-size: 28px;
  color: var(--text-dark);
  margin-bottom: 12px;
  font-weight: 600;
}

.results-description {
  font-size: 14px;
  color: var(--text-medium);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.results-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.source-panel,
.target-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(156, 175, 136, 0.3);
  overflow: hidden;
}

.results-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.results-actions .el-button {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
}

/* 滚动条样式 */
.dynamic-content::-webkit-scrollbar {
  width: 6px;
}

.dynamic-content::-webkit-scrollbar-track {
  background: rgba(156, 175, 136, 0.1);
  border-radius: 3px;
}

.dynamic-content::-webkit-scrollbar-thumb {
  background: rgba(156, 175, 136, 0.3);
  border-radius: 3px;
}

.dynamic-content::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 175, 136, 0.5);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .workspace-main {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
    gap: 15px;
    padding: 15px;
  }
  
  .config-sidebar {
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .results-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .workspace-main {
    padding: 10px;
    gap: 10px;
  }
  
  .translation-results {
    padding: 20px;
  }
  
  .results-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .results-actions .el-button {
    width: 100%;
    max-width: 300px;
  }
}
  </style>
  