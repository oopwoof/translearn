import { defineStore } from 'pinia'
import { translationAPI } from '@/services/api'

export const useTranslationStore = defineStore('translation', {
  state: () => ({
    isTranslating: false,
    currentTranslation: null,
    history: [],
    error: null
  }),

  actions: {
    // 带分析的翻译
    async translateWithAnalysis(text, mode, requirements) {
      this.isTranslating = true
      this.error = null

      try {
        console.log('发送翻译请求:', { text: text.substring(0, 50), mode })
        
        // 调用真实API
        const response = await translationAPI.translateWithClaude(text, mode, requirements)
        
        if (!response.success) {
          throw new Error(response.message || '翻译失败')
        }
        
        const result = response.data
        this.currentTranslation = result
        
        // 添加到历史记录
        this.history.unshift({
          id: Date.now().toString(),
          originalText: text,
          translatedText: result.translatedText,
          mode,
          requirements,
          analysis: result.analysis,
          createdAt: new Date().toISOString()
        })
        
        // 限制历史记录数量
        if (this.history.length > 50) {
          this.history = this.history.slice(0, 50)
        }
        
        return result
      } catch (error) {
        console.error('翻译错误:', error)
        this.error = error.message
        throw error
      } finally {
        this.isTranslating = false
      }
    },

    // 清除错误
    clearError() {
      this.error = null
    },

    // 清除历史记录
    clearHistory() {
      this.history = []
    }
  }
})
