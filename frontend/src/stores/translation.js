import { defineStore } from 'pinia'
import { translationAPI } from '@/services/api'

export const useTranslationStore = defineStore('translation', {
  state: () => ({
    isTranslating: false,
    currentTranslation: null,
    error: null,
    languages: [
      { code: 'auto', name: '自动检测' },
      { code: 'zh', name: '中文' },
      { code: 'ar', name: '阿拉伯语' }
    ],
    // 存储分析结果供翻译使用
    analysisForTranslation: {
      text_characteristics: '',
      terminology_idioms_analysis: {},
      initial_translation_strategy: '',
      intent_audience_analysis: '',
      reference_translation_analysis: '',
      direct_instruction_analysis: ''
    },
    lastAnalyzedText: '' // 记录上次分析的文本，用于验证分析结果是否有效
  }),

  actions: {
    // 翻译文本
    async translateText(text, mode, requirements) {
      this.isTranslating = true
      this.error = null
      
      try {
        console.log('发送翻译请求:', { 
          text: text.substring(0, 50) + '...', 
          mode, 
          quality: requirements?.quality 
        })
        
        // 检查是否是标准质量翻译，如果是则传递已有分析结果
        let analysisForTranslation = null
        if (requirements?.quality === 'standard') {
          analysisForTranslation = this.getAnalysisForTranslation(text)
        }
        
        const response = await translationAPI.translateWithClaude(text, mode, requirements, analysisForTranslation)
        
        if (!response.success) {
          throw new Error(response.message || '翻译失败')
        }
        
        this.currentTranslation = response.data
        return response.data
      } catch (error) {
        console.error('翻译错误:', error)
        this.error = error.message
        throw error
      } finally {
        this.isTranslating = false
      }
    },

    // 分析文本（旧方法，保持兼容性）
    async analyzeText(text, prompts) {
      this.error = null
      console.log('Analyzing text:', text.substring(0, 50) + '...', 'with prompts:', prompts)
      
      try {
        const response = await translationAPI.analyzeText(text, prompts)
        if (response.success) {
          return response.data
        } else {
          throw new Error(response.message || '分析失败')
        }
      } catch (error) {
        this.error = error.message || '分析失败'
        throw error
      }
    },

    // 使用功能球分析文本（新方法）
    async analyzeTextWithBalls(analysisRequest) {
      this.error = null
      console.log('Analyzing text with balls:', analysisRequest)
      
      try {
        // 验证输入参数
        if (!analysisRequest || !analysisRequest.text || !analysisRequest.selectedBalls) {
          throw new Error('分析请求参数不完整')
        }
        
        if (!Array.isArray(analysisRequest.selectedBalls) || analysisRequest.selectedBalls.length === 0) {
          throw new Error('请选择要分析的功能球')
        }
        
        const response = await translationAPI.analyzeTextWithBalls(analysisRequest)
        
        if (!response) {
          throw new Error('服务器无响应')
        }
        
        if (response.success) {
          // 存储分析结果供翻译使用（使用转换后的格式）
          if (response.data) {
            this.storeAnalysisForTranslation(response.data, analysisRequest.text)
          }
          // 返回完整响应（包含originalData）给前端组件显示
          return response
        } else {
          throw new Error(response.message || '分析失败')
        }
      } catch (error) {
        console.error('❌ 功能球分析失败:', error)
        this.error = error.message || '分析失败'
        throw error
      }
    },

    // 使用功能球分组分析文本（并行处理）
    async analyzeTextWithBallsGrouped(analysisRequest, groupSize = 2) {
      this.error = null
      console.log('Analyzing text with balls (grouped):', analysisRequest, { groupSize })
      
      try {
        // 验证输入参数
        if (!analysisRequest || !analysisRequest.text || !analysisRequest.selectedBalls) {
          throw new Error('分析请求参数不完整')
        }
        
        if (!Array.isArray(analysisRequest.selectedBalls) || analysisRequest.selectedBalls.length === 0) {
          throw new Error('请选择要分析的功能球')
        }
        
        if (groupSize !== 2 && groupSize !== 3) {
          throw new Error('分组分析只支持2个或3个功能球一组')
        }
        
        const response = await translationAPI.analyzeTextWithBallsGrouped(analysisRequest, groupSize)
        
        if (!response) {
          throw new Error('服务器无响应')
        }
        
        if (response.success) {
          // 存储分析结果供翻译使用（使用转换后的格式）
          if (response.data) {
            this.storeAnalysisForTranslation(response.data, analysisRequest.text)
          }
          // 返回完整响应（包含originalData）给前端组件显示
          return response
        } else {
          throw new Error(response.message || '分组分析失败')
        }
      } catch (error) {
        console.error('❌ 分组分析失败:', error)
        this.error = error.message || '分组分析失败'
        throw error
      }
    },

    // 使用功能球流式分组分析文本（分步返回）
    async analyzeTextWithBallsStreaming(analysisRequest, groupSize = 2, onProgress = null) {
      this.error = null
      console.log('Analyzing text with balls (streaming):', analysisRequest, { groupSize })
      
      try {
        // 验证输入参数
        if (!analysisRequest || !analysisRequest.text || !analysisRequest.selectedBalls) {
          throw new Error('分析请求参数不完整')
        }
        
        if (!Array.isArray(analysisRequest.selectedBalls) || analysisRequest.selectedBalls.length === 0) {
          throw new Error('请选择要分析的功能球')
        }
        
        if (groupSize !== 2 && groupSize !== 3) {
          throw new Error('分组分析只支持2个或3个功能球一组')
        }
        
        // 创建增强的进度处理函数，在每组完成时立即存储分析结果
        const enhancedOnProgress = (progressData) => {
          // 调用原始的进度回调
          if (onProgress && typeof onProgress === 'function') {
            onProgress(progressData)
          }
          
          // 当每组完成时，立即存储该组的分析结果
          if (progressData.type === 'group_complete' && progressData.data) {
            console.log(`🔄 第${progressData.groupIndex}组完成，立即存储分析结果到store`)
            this.storeAnalysisForTranslation(progressData.data, analysisRequest.text)
          }
        }
        
        const response = await translationAPI.analyzeTextWithBallsStreaming(
          analysisRequest, 
          groupSize, 
          enhancedOnProgress
        )
        
        if (!response) {
          throw new Error('服务器无响应')
        }
        
        if (response && response.success) {
          // 存储分析结果供翻译使用
          if (response.data) {
            this.storeAnalysisForTranslation(response.data, analysisRequest.text)
          }
          return response
        } else {
          throw new Error(response?.message || '流式分组分析失败')
        }
      } catch (error) {
        console.error('❌ 流式分组分析失败:', error)
        this.error = error.message || '流式分组分析失败'
        throw error
      }
    },

    // 存储分析结果供翻译使用（支持增量累积）
    storeAnalysisForTranslation(analysisData, text) {
      console.log('🔍 storeAnalysisForTranslation收到数据:', analysisData)
      
      try {
        // 验证输入参数
        if (!analysisData || typeof analysisData !== 'object') {
          console.warn('⚠️ 无效的分析数据')
          return
        }
        
        if (!text || typeof text !== 'string' || text.trim() === '') {
          console.warn('⚠️ 无效的文本内容')
          return
        }
        
        // 记录分析的文本
        this.lastAnalyzedText = text.trim()
        
        // 增量累积分析结果，支持分组分析的逐步添加
        if (analysisData.text_characteristics && typeof analysisData.text_characteristics === 'string') {
          this.analysisForTranslation.text_characteristics = analysisData.text_characteristics
          console.log('✅ 存储/更新text_characteristics')
        }
        
        if (analysisData.terminology_idioms_analysis && typeof analysisData.terminology_idioms_analysis === 'object') {
          // 合并术语分析，不覆盖已有的术语
          this.analysisForTranslation.terminology_idioms_analysis = {
            ...this.analysisForTranslation.terminology_idioms_analysis,
            ...analysisData.terminology_idioms_analysis
          }
          console.log('✅ 合并存储terminology_idioms_analysis')
        }
        
        if (analysisData.initial_translation_strategy && typeof analysisData.initial_translation_strategy === 'string') {
          this.analysisForTranslation.initial_translation_strategy = analysisData.initial_translation_strategy
          console.log('✅ 存储/更新initial_translation_strategy')
        }
        
        if (analysisData.intent_audience_analysis && typeof analysisData.intent_audience_analysis === 'string') {
          this.analysisForTranslation.intent_audience_analysis = analysisData.intent_audience_analysis
          console.log('✅ 存储/更新intent_audience_analysis')
        }
        
        if (analysisData.reference_translation_analysis && typeof analysisData.reference_translation_analysis === 'string') {
          this.analysisForTranslation.reference_translation_analysis = analysisData.reference_translation_analysis
          console.log('✅ 存储/更新reference_translation_analysis')
        }
        
        if (analysisData.direct_instruction_analysis && typeof analysisData.direct_instruction_analysis === 'string') {
          this.analysisForTranslation.direct_instruction_analysis = analysisData.direct_instruction_analysis
          console.log('✅ 存储/更新direct_instruction_analysis')
        }
        
        console.log('💾 当前累积的分析结果:', this.analysisForTranslation)
      } catch (error) {
        console.error('❌ 存储分析结果失败:', error)
      }
    },

    // 获取可用的分析结果（验证文本是否匹配）
    getAnalysisForTranslation(currentText) {
      if (this.lastAnalyzedText === currentText && this.lastAnalyzedText.trim() !== '') {
        // 检查是否有可用的分析结果
        const hasAnalysis = Object.values(this.analysisForTranslation).some(value => {
          if (typeof value === 'string') return value.trim() !== ''
          if (typeof value === 'object') return Object.keys(value).length > 0
          return false
        })
        
        if (hasAnalysis) {
          console.log('使用已有分析结果:', this.analysisForTranslation)
          return this.analysisForTranslation
        }
      }
      
      console.log('没有可用的分析结果')
      return null
    },

    // 清除分析结果
    clearAnalysisForTranslation() {
      this.analysisForTranslation = {
        text_characteristics: '',
        terminology_idioms_analysis: {},
        initial_translation_strategy: '',
        intent_audience_analysis: '',
        reference_translation_analysis: '',
        direct_instruction_analysis: ''
      }
      this.lastAnalyzedText = ''
      console.log('已清除分析结果')
    },

    // 清除当前翻译
    clearCurrentTranslation() {
      this.currentTranslation = null
      this.error = null
    },

    // 清除所有状态（用于模式切换等）
    clearAllState() {
      this.currentTranslation = null
      this.error = null
      this.clearAnalysisForTranslation()
    },

    // 清除错误
    clearError() {
      this.error = null
    }
  }
})
