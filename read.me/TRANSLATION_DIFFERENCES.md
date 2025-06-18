# 速翻 vs 标准翻译 - 详细对比

## 📍 代码位置

所有差异都在 `backend/routes/translate.js` 文件中定义：

### 1. 工作流选择逻辑
```javascript
// 第245-260行
function buildPrompt(text, mode, requirements) {
  const quality = requirements.quality || 'standard'
  
  if (quality === 'fast') {
    return buildFastPrompt(text, sourceLanguage, targetLanguage, requirements)
  } else if (quality === 'standard') {
    return buildStandardPrompt(text, sourceLanguage, targetLanguage, requirements)
  }
  // ...
}
```

### 2. 速翻工作流 (第266-290行)
```javascript
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
}
```

### 3. 标准工作流 (第292-330行)
```javascript
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
}
```

## 🔍 主要区别对比

| 方面 | 速翻 (Fast) | 标准 (Standard) |
|------|-------------|-----------------|
| **场景描述** | 日常交流、紧急处理 | 商务、学研、内容创作 |
| **优化目标** | 生成速度 | 效率与质量平衡 |
| **工作流程** | 直接翻译 | 4步详细流程 |
| **输出字段** | 2个字段 | 8个详细字段 |
| **分析深度** | 基础分析 | 深度分析 |

## 📊 输出格式差异

### 速翻输出 (2个字段)
```json
{
  "translate_advice": "翻译建议",
  "translate_result": "翻译结果"
}
```

### 标准输出 (8个字段)
```json
{
  "text_characteristics": "文本特征分析",
  "existing_terminology/idioms": ["术语1", "术语2"],
  "intent/audience_analysis": "意图分析",
  "reference_translation_analysis": "参考译文分析",
  "direct_instruction_analysis": "直接要求分析",
  "terminology/idioms_translation_strategy": "术语翻译策略",
  "translate_advice": "翻译建议",
  "translate_1st_result": "第一次直译",
  "translate_final_result": "润色后的翻译"
}
```

## 🎯 实际效果差异

### 速翻特点
- **速度优先**: 优化生成速度
- **简洁输出**: 只返回翻译结果和建议
- **适用场景**: 日常对话、紧急情况
- **处理时间**: 相对较短

### 标准特点
- **质量优先**: 兼顾效率与质量
- **详细分析**: 包含文本特征、术语分析等
- **适用场景**: 商务文档、学术论文
- **处理时间**: 相对较长

## 🔧 如何验证差异

### 1. 查看控制台日志
在浏览器开发者工具中查看网络请求，可以看到不同的请求参数：

**速翻请求**:
```javascript
{
  "text": "你好，世界！",
  "mode": "zh-ar",
  "requirements": {
    "quality": "fast",  // 关键区别
    "intent": "日常交流",
    "reference": "",
    "directRequest": ""
  }
}
```

**标准请求**:
```javascript
{
  "text": "你好，世界！",
  "mode": "zh-ar",
  "requirements": {
    "quality": "standard",  // 关键区别
    "intent": "商务交流",
    "reference": "正式文档",
    "directRequest": "使用正式语体"
  }
}
```

### 2. 查看后端日志
在后端控制台中可以看到不同的提示词模板：

**速翻日志**:
```
开始翻译: { text: '你好，世界！...', mode: 'zh-ar' }
Claude响应: ###角色 你是专业的中文-阿拉伯语翻译专家...
```

**标准日志**:
```
开始翻译: { text: '你好，世界！...', mode: 'zh-ar' }
Claude响应: ###角色 你是专业的中文-阿拉伯语翻译专家...
###工作流 1. 分析原文文本特征...
```

### 3. 前端界面差异
在 `frontend/src/components/TranslationControls.vue` 中，质量选择按钮会触发不同的翻译流程：

```javascript
// 第150-160行
const handleTranslate = () => {
  const requirements = {
    quality: quality.value,  // 'fast' 或 'standard'
    intent: intent.value,
    reference: reference.value,
    directRequest: directRequest.value
  }
  emit('translate', requirements)
}
```

## 🧪 测试方法

1. **启动项目**:
   ```bash
   npm run dev
   ```

2. **测试速翻**:
   - 选择"中-阿"模式
   - 点击"速翻"按钮
   - 输入文本："你好，世界！"
   - 点击"开始翻译"

3. **测试标准翻译**:
   - 选择"中-阿"模式
   - 点击"标准"按钮
   - 输入相同文本："你好，世界！"
   - 点击"开始翻译"

4. **对比结果**:
   - 查看翻译结果
   - 检查分析面板中的详细信息
   - 观察处理时间差异

## 📝 总结

速翻和标准翻译的主要区别在于：

1. **提示词模板不同** - 在 `backend/routes/translate.js` 第266-330行
2. **输出格式不同** - 速翻2个字段，标准8个字段
3. **处理深度不同** - 速翻直接翻译，标准包含详细分析
4. **适用场景不同** - 速翻适合日常，标准适合正式场合

这些差异确保了用户可以根据具体需求选择最合适的翻译模式。 