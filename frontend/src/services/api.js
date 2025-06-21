import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 60000, // 增加超时时间到60秒
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log('发送API请求:', config.url, config.data)
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log('API响应:', response.data)
    return response.data
  },
  error => {
    console.error('API错误:', error)
    
    let message = '网络错误'
    if (error.response) {
      message = error.response.data?.message || `服务器错误 (${error.response.status})`
    } else if (error.request) {
      message = '网络连接失败'
    }
    
    ElMessage.error(message)
    return Promise.reject(new Error(message))
  }
)

// 翻译API
export const translationAPI = {
  // Claude翻译
  translateWithClaude: async (text, mode, requirements, analysisForTranslation = null) => {
    return api.post('/translate/claude', {
      text,
      mode,
      requirements,
      analysisForTranslation
    })
  },

  // 分析文本（旧方法）
  analyzeText: async (text, prompts) => {
    return api.post('/translate/analyze', {
      text,
      prompts
    })
  },

  // 使用功能球分析文本（新方法）
  analyzeTextWithBalls: async (analysisRequest) => {
    return api.post('/translate/analyze-with-balls', {
      text: analysisRequest.text,
      selectedBalls: analysisRequest.selectedBalls,
      intent: analysisRequest.intent,
      reference: analysisRequest.reference,
      directRequest: analysisRequest.directRequest,
      mode: analysisRequest.mode
    })
  },

  // 使用功能球分组分析文本（并行处理）
  analyzeTextWithBallsGrouped: async (analysisRequest, groupSize = 2) => {
    return api.post('/translate/analyze-with-balls-grouped', {
      text: analysisRequest.text,
      selectedBalls: analysisRequest.selectedBalls,
      intent: analysisRequest.intent,
      reference: analysisRequest.reference,
      directRequest: analysisRequest.directRequest,
      mode: analysisRequest.mode,
      groupSize
    })
  },

  // 使用功能球流式分组分析文本（分步返回）
  analyzeTextWithBallsStreaming: async (analysisRequest, groupSize = 2, onProgress = null) => {
    const response = await fetch('/api/translate/analyze-with-balls-streaming', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: analysisRequest.text,
        selectedBalls: analysisRequest.selectedBalls,
        intent: analysisRequest.intent,
        reference: analysisRequest.reference,
        directRequest: analysisRequest.directRequest,
        mode: analysisRequest.mode,
        groupSize
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 如果不是流式响应，直接返回JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('text/event-stream')) {
      return await response.json()
    }

    // 处理流式响应
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let finalResult = null

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        
        // 保留最后一行（可能不完整）
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (onProgress) {
                onProgress(data)
              }

              // 保存最终结果
              if (data.type === 'complete') {
                finalResult = {
                  success: true,
                  data: data.mergedResult,
                  originalData: data.originalMergedResult, // 保留原始格式
                  isGrouped: true,
                  totalGroups: data.totalGroups,
                  completedGroups: data.completedGroups,
                  failedGroups: data.failedGroups,
                  allResults: data.allResults
                }
              }
            } catch (e) {
              console.error('解析SSE数据失败:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return finalResult
  },

  // 测试API连接
  testConnection: async () => {
    return api.get('/translate/test')
  }
}

export default api
