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
    ]
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
        
        const response = await translationAPI.translateWithClaude(text, mode, requirements)
        
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
        const response = await translationAPI.analyzeTextWithBalls(analysisRequest)
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

    // 清除当前翻译
    clearCurrentTranslation() {
      this.currentTranslation = null
      this.error = null
    },

    // 清除错误
    clearError() {
      this.error = null
    }
  }
})
