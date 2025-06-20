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
  translateWithClaude: async (text, mode, requirements) => {
    return api.post('/translate/claude', {
      text,
      mode,
      requirements
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

  // 测试API连接
  testConnection: async () => {
    return api.get('/translate/test')
  }
}

export default api
