# 动态Prompt实现 - v0.45

## 🎯 功能概述

根据翻译要求的填写情况动态调整prompt，节省token使用量。只有当用户填写了相应的翻译要求时，才会在prompt中包含对应的指导内容。

## 🔧 实现原理

### 1. 监控翻译要求
```javascript
// 检查翻译要求是否为空
function hasTranslationRequirements(requirements) {
  return {
    hasIntent: requirements.intent && requirements.intent.trim() !== '',
    hasReference: requirements.reference && requirements.reference.trim() !== '',
    hasDirectRequest: requirements.directRequest && requirements.directRequest.trim() !== ''
  }
}
```

### 2. 动态构建翻译指导
```javascript
// 构建翻译指导部分
function buildTranslationGuidance(requirements, hasRequirements) {
  let guidance = '###翻译指导\n'
  
  if (hasRequirements.hasIntent) {
    guidance += `- 翻译意图/受众：${requirements.intent}\n`
  }
  
  if (hasRequirements.hasReference) {
    guidance += `- 参考译文风格，请总结并学习以下参考译文的风格：${requirements.reference}\n`
  }
  
  if (hasRequirements.hasDirectRequest) {
    guidance += `- 直接要求：${requirements.directRequest}\n`
  }
  
  // 如果没有任何要求，添加默认说明
  if (!hasRequirements.hasIntent && !hasRequirements.hasReference && !hasRequirements.hasDirectRequest) {
    guidance += '- 无特殊要求，请按照标准翻译规范进行翻译。\n'
  }
  
  return guidance
}
```

### 3. 动态构建输出格式
```javascript
// 构建标准翻译的输出格式
function buildStandardOutputFormat(hasRequirements) {
  let outputFormat = `{"text_characteristics": "分析文本类型...",
"existing_terminology/idioms": ["term/idiom1", "term/idiom2"...]`
  
  // 只有在有相应输入的情况下才添加分析字段
  if (hasRequirements.hasIntent) {
    outputFormat += `,
"intent/audience_analysis": ""`
  }
  
  if (hasRequirements.hasReference) {
    outputFormat += `,
"reference_translation_analysis": ""`
  }
  
  if (hasRequirements.hasDirectRequest) {
    outputFormat += `,
"direct_instruction_analysis": ""`
  }
  
  outputFormat += `,
"terminology/idioms_translation_strategy": "以上术语/习语的翻译策略",
"translate_advice": "总结并向翻译者提供人工翻译使用的、具体的翻译策略建议",
"translate_1st_result": "第一次直译",
"translate_final_result": "润色后的翻译"
}`
  
  return outputFormat
}
```

## 📊 对比效果

### 无翻译要求时
**速翻Prompt长度**: ~200 tokens
**标准Prompt长度**: ~350 tokens

### 有所有翻译要求时
**速翻Prompt长度**: ~280 tokens (+40%)
**标准Prompt长度**: ~450 tokens (+29%)

### Token节省效果
- **无要求时**: 节省约40-80 tokens
- **部分要求时**: 节省约20-40 tokens
- **所有要求时**: 无节省，但提供完整功能

## 🧪 测试用例

### 测试1: 无任何翻译要求
```javascript
{
  quality: 'fast',
  intent: '',
  reference: '',
  directRequest: ''
}
```
**预期结果**: 翻译指导只包含默认说明

### 测试2: 只有意图要求
```javascript
{
  quality: 'standard',
  intent: '商务交流',
  reference: '',
  directRequest: ''
}
```
**预期结果**: 翻译指导包含意图，输出格式包含意图分析字段

### 测试3: 有参考译文风格
```javascript
{
  quality: 'standard',
  intent: '',
  reference: '正式商务文档风格',
  directRequest: ''
}
```
**预期结果**: 翻译指导包含参考译文，输出格式包含参考译文分析字段

### 测试4: 有直接要求
```javascript
{
  quality: 'standard',
  intent: '',
  reference: '',
  directRequest: '使用正式语体'
}
```
**预期结果**: 翻译指导包含直接要求，输出格式包含直接要求分析字段

### 测试5: 所有要求都有
```javascript
{
  quality: 'standard',
  intent: '商务合作',
  reference: '正式商务信函',
  directRequest: '保持专业和礼貌'
}
```
**预期结果**: 翻译指导包含所有要求，输出格式包含所有分析字段

## 🔍 代码位置

### 核心函数
- `hasTranslationRequirements()` - 检查翻译要求
- `buildTranslationGuidance()` - 构建翻译指导
- `buildStandardOutputFormat()` - 构建输出格式

### 应用位置
- `buildFastPrompt()` - 速翻工作流
- `buildStandardPrompt()` - 标准工作流
- `parseJsonResponse()` - 解析响应

## 📈 性能优化

### Token节省策略
1. **条件性包含**: 只在有输入时包含对应字段
2. **默认值处理**: 无要求时使用简洁的默认说明
3. **动态格式**: 输出格式根据输入动态调整

### 监控指标
- Prompt长度变化
- Token使用量
- 翻译质量保持

## 🚀 使用方法

### 前端调用
```javascript
const requirements = {
  quality: 'standard',
  intent: '商务交流',        // 可选
  reference: '正式文档',      // 可选
  directRequest: '保持礼貌'   // 可选
}

const result = await translationStore.translateText(text, mode, requirements)
```

### 后端处理
```javascript
// 自动检测并构建动态prompt
const prompt = buildPrompt(text, mode, requirements)
const response = await callClaudeAPI(prompt)
```

## 📝 注意事项

1. **向后兼容**: 保持与现有API的兼容性
2. **错误处理**: 完善的错误处理和回退机制
3. **质量保证**: 确保动态prompt不影响翻译质量
4. **监控日志**: 记录prompt长度变化以便优化

## 🎯 未来优化

1. **更细粒度控制**: 支持更多翻译要求的组合
2. **智能优化**: 基于历史数据优化prompt结构
3. **A/B测试**: 对比不同prompt结构的效果
4. **缓存机制**: 缓存常用prompt模板 