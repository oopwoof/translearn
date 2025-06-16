const express = require('express')
const Anthropic = require('@anthropic-ai/sdk')
const router = express.Router()

// 初始化Claude客户端
const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
  baseURL: process.env.CLAUDE_BASE_URL
})

// 调用Claude API
async function callClaudeAPI(prompt) {
  try {
    const message = await client.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    return message.content[0].text
  } catch (error) {
    console.error('Claude API Error:', error)
    throw new Error(`翻译服务错误: ${error.message}`)
  }
}

// 解析Claude响应
function parseClaudeResponse(response, originalText, mode) {
  try {
    // 尝试解析结构化响应
    const sections = response.split(/\d+\.\s*/)
    
    let translatedText = ''
    let textFeatures = { type: '一般文本', style: '中性语体' }
    let terminology = []
    let suggestions = []

    // 提取翻译结果
    const translationSection = sections.find(section => 
      section.includes('翻译结果') || section.includes('译文')
    )
    
    if (translationSection) {
      const lines = translationSection.split('\n')
      translatedText = lines.find(line => 
        line.trim() && 
        !line.includes('翻译结果') && 
        !line.includes('译文')
      )?.trim() || ''
    }

    // 提取文本特征
    const featuresSection = sections.find(section => 
      section.includes('文本特征') || section.includes('特征分析')
    )
    
    if (featuresSection) {
      if (featuresSection.includes('商务') || featuresSection.includes('商业')) {
        textFeatures.type = '商务文本'
      } else if (featuresSection.includes('学术') || featuresSection.includes('研究')) {
        textFeatures.type = '学术文本'
      } else if (featuresSection.includes('法律') || featuresSection.includes('合同')) {
        textFeatures.type = '法律文本'
      }

      if (featuresSection.includes('正式') || featuresSection.includes('官方')) {
        textFeatures.style = '正式语体'
      } else if (featuresSection.includes('礼貌') || featuresSection.includes('客气')) {
        textFeatures.style = '礼貌语体'
      }
    }

    // 提取专业术语
    const terminologySection = sections.find(section => 
      section.includes('专业术语') || section.includes('术语')
    )
    
    if (terminologySection) {
      const termLines = terminologySection.split('\n')
      termLines.forEach(line => {
        const match = line.match(/(.+?)[：:]\s*(.+)/)
        if (match) {
          terminology.push({
            original: match[1].trim(),
            translation: match[2].trim()
          })
        }
      })
    }

    // 提取建议
    const suggestionsSection = sections.find(section => 
      section.includes('建议') || section.includes('改进')
    )
    
    if (suggestionsSection) {
      const suggestionLines = suggestionsSection.split('\n')
      suggestions = suggestionLines
        .filter(line => line.trim() && !line.includes('建议'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(line => line.length > 0)
    }

    return {
      translatedText: translatedText || `翻译结果：${originalText}`,
      analysis: {
        textFeatures,
        terminology,
        suggestions,
        analyzedAt: new Date().toISOString()
      }
    }

  } catch (error) {
    console.error('解析响应错误:', error)
    // 如果解析失败，返回基本结果
    return {
      translatedText: response.split('\n').find(line => line.trim()) || originalText,
      analysis: {
        textFeatures: { type: '一般文本', style: '中性语体' },
        terminology: [],
        suggestions: ['翻译已完成，建议人工校对'],
        analyzedAt: new Date().toISOString()
      }
    }
  }
}

// 翻译接口
router.post('/claude', async (req, res) => {
  try {
    const { text, mode, requirements } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: '文本不能为空'
      })
    }

    console.log('开始翻译:', { text: text.substring(0, 50) + '...', mode })

    // 构建提示词
    const prompt = buildPrompt(text, mode, requirements)
    
    // 调用Claude API
    const claudeResponse = await callClaudeAPI(prompt)
    
    console.log('Claude响应:', claudeResponse.substring(0, 200) + '...')
    
    // 解析响应
    const result = parseClaudeResponse(claudeResponse, text, mode)
    
    res.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Translation error:', error)
    res.status(500).json({
      success: false,
      message: error.message || '翻译服务暂时不可用'
    })
  }
})

// 构建提示词
function buildPrompt(text, mode, requirements) {
  const isZhToAr = mode === 'zh-ar'
  const sourceLanguage = isZhToAr ? '中文' : '阿拉伯语'
  const targetLanguage = isZhToAr ? '阿拉伯语' : '中文'

  let prompt = `你是专业的${sourceLanguage}-${targetLanguage}翻译专家。请完成以下翻译任务：\n\n`
  
  // 添加翻译要求
  if (requirements.intent) {
    prompt += `翻译意图/受众：${requirements.intent}\n`
  }
  
  if (requirements.reference) {
    prompt += `参考译文风格：${requirements.reference}\n`
  }
  
  if (requirements.directRequest) {
    prompt += `特殊要求：${requirements.directRequest}\n`
  }
  
  prompt += `质量要求：${getQualityDescription(requirements.quality)}\n\n`
  
  prompt += `原文：\n${text}\n\n`
  
  prompt += `请严格按照以下格式提供回复：\n\n`
  prompt += `1. 翻译结果：\n[在这里提供准确、流畅的翻译]\n\n`
  prompt += `2. 文本特征：\n[分析文本类型（如：商务文本、学术文本等）和语体风格（如：正式语体、礼貌语体等）]\n\n`
  prompt += `3. 专业术语：\n[列出重要术语，格式：原文术语：翻译术语]\n\n`
  prompt += `4. 翻译建议：\n[提供具体的翻译改进建议]\n`
  
  return prompt
}

function getQualityDescription(quality) {
  const descriptions = {
    fast: '快速翻译，保证基本准确性',
    standard: '标准翻译，平衡准确性和流畅性',
    premium: '精修翻译，追求最高质量和文化适应性'
  }
  return descriptions[quality] || descriptions.standard
}

// 构建分析提示词
function buildAnalysisPrompt(text, prompts) {
  let prompt = `请分析以下文本：\n\n${text}\n\n`
  
  prompt += `请按照以下要求进行分析：\n\n`
  
  // 只使用传入的prompts进行分析
  prompts.forEach((p, index) => {
    prompt += `${index + 1}. ${p}\n`
  })
  
  prompt += `\n请严格按照以下格式提供回复：\n\n`
  
  // 根据传入的prompts动态构建响应格式
  let responseFormat = ''
  if (prompts.some(p => p.includes('文本特征'))) {
    responseFormat += `1. 文本特征：\n[分析文本类型和语体风格]\n\n`
  }
  if (prompts.some(p => p.includes('专业术语'))) {
    responseFormat += `2. 专业术语：\n[列出重要术语及其解释]\n\n`
  }
  if (prompts.some(p => p.includes('翻译建议'))) {
    responseFormat += `3. 翻译建议：\n[提供具体的翻译改进建议]\n`
  }
  
  prompt += responseFormat
  return prompt
}

// 解析分析响应
function parseAnalysisResponse(response, prompts) {
  try {
    const sections = response.split(/\d+\.\s*/)
    
    let textFeatures = { type: '一般文本', style: '中性语体' }
    let terminology = []
    let suggestions = []

    // 只解析被请求的部分
    if (prompts.some(p => p.includes('文本特征'))) {
      const featuresSection = sections.find(section => 
        section.includes('文本特征') || section.includes('特征分析')
      )
      
      if (featuresSection) {
        if (featuresSection.includes('商务') || featuresSection.includes('商业')) {
          textFeatures.type = '商务文本'
        } else if (featuresSection.includes('学术') || featuresSection.includes('研究')) {
          textFeatures.type = '学术文本'
        } else if (featuresSection.includes('法律') || featuresSection.includes('合同')) {
          textFeatures.type = '法律文本'
        }

        if (featuresSection.includes('正式') || featuresSection.includes('官方')) {
          textFeatures.style = '正式语体'
        } else if (featuresSection.includes('礼貌') || featuresSection.includes('客气')) {
          textFeatures.style = '礼貌语体'
        }
      }
    }

    if (prompts.some(p => p.includes('专业术语'))) {
      const terminologySection = sections.find(section => 
        section.includes('专业术语') || section.includes('术语')
      )
      
      if (terminologySection) {
        const termLines = terminologySection.split('\n')
        termLines.forEach(line => {
          const match = line.match(/(.+?)[：:]\s*(.+)/)
          if (match) {
            terminology.push({
              original: match[1].trim(),
              translation: match[2].trim()
            })
          }
        })
      }
    }

    if (prompts.some(p => p.includes('翻译建议'))) {
      const suggestionsSection = sections.find(section => 
        section.includes('建议') || section.includes('改进')
      )
      
      if (suggestionsSection) {
        const suggestionLines = suggestionsSection.split('\n')
        suggestions = suggestionLines
          .filter(line => line.trim() && !line.includes('建议'))
          .map(line => line.replace(/^[-•]\s*/, '').trim())
          .filter(line => line.length > 0)
      }
    }

    return {
      textFeatures: prompts.some(p => p.includes('文本特征')) ? textFeatures : null,
      terminology: prompts.some(p => p.includes('专业术语')) ? terminology : [],
      suggestions: prompts.some(p => p.includes('翻译建议')) ? suggestions : [],
      analyzedAt: new Date().toISOString()
    }

  } catch (error) {
    console.error('解析响应错误:', error)
    return {
      textFeatures: prompts.some(p => p.includes('文本特征')) ? { type: '一般文本', style: '中性语体' } : null,
      terminology: prompts.some(p => p.includes('专业术语')) ? [] : [],
      suggestions: prompts.some(p => p.includes('翻译建议')) ? ['分析完成，建议人工校对'] : [],
      analyzedAt: new Date().toISOString()
    }
  }
}

// 分析接口
router.post('/analyze', async (req, res) => {
  try {
    const { text, prompts } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: '文本不能为空'
      })
    }

    if (!prompts || !prompts.length) {
      return res.status(400).json({
        success: false,
        message: '请选择分析功能'
      })
    }

    console.log('开始分析:', { text: text.substring(0, 50) + '...', prompts })

    // 构建分析提示词
    const prompt = buildAnalysisPrompt(text, prompts)
    
    // 调用Claude API
    const claudeResponse = await callClaudeAPI(prompt)
    
    console.log('Claude响应:', claudeResponse.substring(0, 200) + '...')
    
    // 解析响应，传入prompts以确定需要解析哪些部分
    const result = parseAnalysisResponse(claudeResponse, prompts)
    
    res.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Analysis error:', error)
    res.status(500).json({
      success: false,
      message: error.message || '分析服务暂时不可用'
    })
  }
})

// 测试接口
router.get('/test', async (req, res) => {
  try {
    const testMessage = await client.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: '请说"API连接成功"'
      }]
    })

    res.json({
      success: true,
      message: 'Claude API连接成功',
      response: testMessage.content[0].text
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'API连接失败',
      error: error.message
    })
  }
})

module.exports = router
