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
      model: 'claude-sonnet-4-20250514',
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
    // 首先尝试解析JSON格式
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[0])
        return parseJsonResponse(jsonData, originalText)
      } catch (jsonError) {
        console.log('JSON解析失败，尝试文本解析:', jsonError)
      }
    }

    // 如果JSON解析失败，回退到原来的文本解析方式
    return parseTextResponse(response, originalText)
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

// 解析JSON格式响应
function parseJsonResponse(jsonData, originalText) {
  let translatedText = ''
  let textFeatures = { type: '一般文本', style: '中性语体' }
  let terminology = []
  let suggestions = []

  // 提取翻译结果
  if (jsonData.translate_result) {
    translatedText = jsonData.translate_result
  } else if (jsonData.translate_final_result) {
    translatedText = jsonData.translate_final_result
  }

  // 提取文本特征
  if (jsonData.text_characteristics) {
    const characteristics = jsonData.text_characteristics
    if (characteristics.includes('商务') || characteristics.includes('商业')) {
      textFeatures.type = '商务文本'
    } else if (characteristics.includes('学术') || characteristics.includes('研究')) {
      textFeatures.type = '学术文本'
    } else if (characteristics.includes('法律') || characteristics.includes('合同')) {
      textFeatures.type = '法律文本'
    }

    if (characteristics.includes('正式') || characteristics.includes('官方')) {
      textFeatures.style = '正式语体'
    } else if (characteristics.includes('礼貌') || characteristics.includes('客气')) {
      textFeatures.style = '礼貌语体'
    }
  }

  // 提取专业术语
  if (jsonData.existing_terminology && Array.isArray(jsonData.existing_terminology)) {
    terminology = jsonData.existing_terminology.map(term => ({
      original: term,
      translation: term // 这里可以根据需要扩展
    }))
  }

  // 提取建议
  if (jsonData.translate_advice) {
    suggestions = [jsonData.translate_advice]
  }

  return {
    translatedText: translatedText || originalText,
    analysis: {
      textFeatures,
      terminology,
      suggestions,
      analyzedAt: new Date().toISOString()
    }
  }
}

// 解析文本格式响应（原有的解析逻辑）
function parseTextResponse(response, originalText) {
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

  // 根据质量等级选择不同的工作流
  const quality = requirements.quality || 'standard'
  
  if (quality === 'fast') {
    return buildFastPrompt(text, sourceLanguage, targetLanguage, requirements)
  } else if (quality === 'standard') {
    return buildStandardPrompt(text, sourceLanguage, targetLanguage, requirements)
  } else if (quality === 'premium') {
    return buildPremiumPrompt(text, sourceLanguage, targetLanguage, requirements)
  } else {
    // 默认使用标准工作流
    return buildStandardPrompt(text, sourceLanguage, targetLanguage, requirements)
  }
}

// 速翻工作流
function buildFastPrompt(text, sourceLanguage, targetLanguage, requirements) {
  let prompt = `###角色
你是专业的${sourceLanguage}-${targetLanguage}翻译专家，极力追求忠实和通顺。

###场景
这是速翻场景，多见于日常交流、紧急处理等情形中，请你再保证忠实度和通顺度的基础上优化生成的速度。

###任务
完成以下翻译任务。如果存在翻译意图/受众、参考译文风格和特殊要求，请严格参考，按照格式给出思考过程和翻译结果。

###翻译指导
- 翻译意图/受众：${requirements.intent || '无'}
- 参考译文风格，请总结并学习以下参考译文的风格：${requirements.reference || '无'}
- 直接要求：${requirements.directRequest || '无'}

###原文
${text}

###输出格式
请严格按照以下格式提供json回复：
{"translate_advice": "提供具体的翻译策略建议",
"translate_result": "在这里提供准确、流畅的翻译"
}`

  return prompt
}

// 标准工作流
function buildStandardPrompt(text, sourceLanguage, targetLanguage, requirements) {
  let prompt = `###角色
你是专业的${sourceLanguage}-${targetLanguage}翻译专家，极力追求忠实和通顺。

###场景
这是标准翻译场景，一般见于商务、学研和内容创作等情况，请兼顾效率与质量，注重忠实度和通顺度，包括基本的校对和润色，保证适合正式用途。

###任务
完成以下翻译任务。如果存在翻译意图/受众、参考译文风格和特殊要求，请严格参考，按照格式给出思考过程和翻译结果。

###工作流
1. 分析原文文本特征，提取专业术语、本地化成语/习语。
2. 结合翻译指导分析翻译策略。
3. 第一次翻译根据新闻内容直译，不要遗漏任何信息。
2. 根据第一次直译的结果重新意译，遵守原意的前提下让内容符合翻译指导的要求，符合${targetLanguage}表达习惯。

###翻译指导
- 翻译意图/受众：${requirements.intent || '无'}
- 参考译文风格，请总结并学习以下参考译文的风格：${requirements.reference || '无'}
- 直接要求：${requirements.directRequest || '无'}

###原文
${text}

###输出格式
请严格按照以下格式提供json回复：
{"text_characteristics": "分析文本类型（如：商务文本、学术文本等）、语体风格（如：正式语体、礼貌语体等）、文本领域、情感色彩、文本主题、语用功能和语言结构特点",
"existing_terminology/idioms": ["term/idiom1", "term/idiom2"...],
"intent/audience_analysis": "",
"reference_translation_analysis": "",
"direct_instruction_analysis": "",
"terminology/idioms_translation_strategy": "以上术语/习语的翻译策略"
"translate_advice": "总结并向翻译者提供人工翻译使用的、具体的翻译策略建议",
"translate_1st_result": "第一次直译",
"translate_final_result": "润色后的翻译"
}`

  return prompt
}

// 精翻工作流（占位符）
function buildPremiumPrompt(text, sourceLanguage, targetLanguage, requirements) {
  let prompt = `###角色
你是专业的${sourceLanguage}-${targetLanguage}翻译专家，极力追求忠实和通顺。

###场景
这是精翻场景，一般见于重要文档、正式场合等，请追求最高质量，注重忠实度、通顺度和文化适应性。

###任务
完成以下翻译任务。如果存在翻译意图/受众、参考译文风格和特殊要求，请严格参考，按照格式给出思考过程和翻译结果。

###翻译指导
- 翻译意图/受众：${requirements.intent || '无'}
- 参考译文风格，请总结并学习以下参考译文的风格：${requirements.reference || '无'}
- 直接要求：${requirements.directRequest || '无'}

###原文
${text}

###输出格式
请严格按照以下格式提供json回复：
{"translate_advice": "提供具体的翻译策略建议",
"translate_result": "在这里提供准确、流畅的翻译"
}`

  return prompt
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
      model: 'claude-sonnet-4-20250514',
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
