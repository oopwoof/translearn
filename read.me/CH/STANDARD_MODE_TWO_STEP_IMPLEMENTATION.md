# 标准模式分步化翻译实现 - v0.5

## 🎯 功能概述

将标准模式翻译拆分成两个prompt实现：
1. **第一个prompt**：翻译分析和策略专家，输出翻译分析和策略报告
2. **第二个prompt**：高级译者，基于分析报告进行实际翻译

## 🔧 实现原理

### 1. 分步化处理流程

```javascript
// 标准模式翻译流程
if (prompt.isTwoStep) {
  // 第一步：分析和策略
  const analysisResponse = await callClaudeAPI(prompt.analysisPrompt)
  const analysisResult = parseAnalysisResponse(analysisResponse)
  
  // 第二步：实际翻译
  const translationPromptWithReport = prompt.translationPrompt.replace(
    '{analysis_report}', 
    JSON.stringify(analysisResult, null, 2)
  )
  const translationResponse = await callClaudeAPI(translationPromptWithReport)
  const translationResult = parseTranslationResponse(translationResponse, text, mode)
  
  // 合并结果
  result = {
    translatedText: translationResult.translatedText,
    analysis: {
      ...analysisResult,
      ...translationResult.analysis,
      analyzedAt: new Date().toISOString()
    }
  }
}
```

### 2. 第一个Prompt：翻译分析和策略专家

**角色定位**：专业的${sourceLanguage}-${targetLanguage}翻译分析和策略专家

**工作流程**：
1. 分析原文文本特征（文本类型、语体风格、文本领域、情感色彩、文本主题、语用功能和语言结构特点）
2. 根据文本特征思考初步翻译策略
3. 提取专业术语、本地化成语/习语
4. 结合翻译指导分析翻译策略
5. 思考改进现阶段的翻译策略（under_guidance_strategy）
6. 思考术语/习语的翻译策略
7. 总结并向专业译者提供具体而全面的翻译策略建议

**动态输出格式**：
```json
{
  "text_characteristics": "分析文本类型...",
  "initial_translation_strategy": "根据文本特征思考的初步翻译策略",
  "existing_terminology/idioms": ["term/idiom1", "term/idiom2"...],
  "intent/audience_analysis": "分析翻译意图/受众对翻译策略的影响",  // 仅在有输入时
  "reference_translation_analysis": "分析参考译文风格对翻译策略的影响",  // 仅在有输入时
  "direct_instruction_analysis": "分析直接要求对翻译策略的影响",  // 仅在有输入时
  "under_guidance_strategy": "结合翻译指导分析后的改进翻译策略",  // 仅在有2个以上要求时
  "terminology/idioms_translation_strategy": "以上术语/习语的翻译策略",
  "final_translate_advice": "总结并向专业译者提供具体而全面的翻译策略建议"
}
```

### 3. 第二个Prompt：高级译者

**角色定位**：资深、专业的${sourceLanguage}-${targetLanguage}高级译者

**工作流程**：
1. 浏览并理解客户原始的翻译需求文件
2. 仔细阅读和理解翻译分析和策略专家的报告，对每一条分析的合理性进行独立思考评判
3. 按照改进后的策略和原始翻译需求第一次直译，不要遗漏任何信息
4. 检查第一次直译，重新润色，遵守原意的前提下让内容更加符合翻译策略和规则的要求

**输出格式**：
```json
{
  "translate_advice_rationality": "是否合理，不合理之处改进",
  "initial_translation": "第一次直译结果",
  "initial_translation_revising_strategy": "检查翻译，包括是否遗漏客户原始需求",
  "revised_translation": "润色后的最终翻译"
}
```

## 📊 动态字段控制

### 翻译指导板块
- 只有在有输入内容（不为空）的情况下才包含在prompt中
- 第一个prompt的翻译指导板块和第二个prompt原始翻译需求板块内只包含不为空的要求

### 分析字段
- `intent/audience_analysis`：只有在有意图/受众输入时才使用
- `reference_translation_analysis`：只有在有参考译文输入时才使用
- `direct_instruction_analysis`：只有在有直接要求输入时才使用
- `under_guidance_strategy`：只有在出现两个以上要求时才使用

## 🔍 解析函数

### 1. 分析响应解析
```javascript
function parseAnalysisResponse(response) {
  // 支持JSON和文本格式解析
  // 提取文本特征、术语、建议、动态分析字段等
}
```

### 2. 翻译响应解析
```javascript
function parseTranslationResponse(response, originalText, mode) {
  // 支持JSON和文本格式解析
  // 提取翻译结果、建议、翻译过程等
}
```

## 🎨 前端界面更新

### 新增分析卡片
- **翻译策略分析**：显示初步翻译策略
- **意图/受众分析**：显示意图/受众分析结果
- **参考译文分析**：显示参考译文分析结果
- **直接要求分析**：显示直接要求分析结果
- **指导策略**：显示结合翻译指导的改进策略
- **术语翻译策略**：显示术语翻译策略
- **翻译过程**：显示第一次直译和润色后翻译

### 样式设计
- 每个分析卡片使用不同的颜色主题
- 保持与现有分析面板的一致性
- 响应式设计，适配不同屏幕尺寸

## 🧪 测试用例

### 测试1：无任何翻译要求
```javascript
{
  quality: 'standard',
  intent: '',
  reference: '',
  directRequest: ''
}
```
**预期结果**：只包含基础分析字段，不包含动态分析字段

### 测试2：只有意图要求
```javascript
{
  quality: 'standard',
  intent: '商务交流',
  reference: '',
  directRequest: ''
}
```
**预期结果**：包含意图分析字段，不包含指导策略字段

### 测试3：有两个以上要求
```javascript
{
  quality: 'standard',
  intent: '商务合作',
  reference: '正式商务信函',
  directRequest: '保持专业和礼貌'
}
```
**预期结果**：包含所有分析字段，包括指导策略字段

## 📈 性能优化

### Token节省策略
1. **条件性包含**：只在有输入时包含对应字段
2. **动态格式**：输出格式根据输入动态调整
3. **智能分析**：根据要求数量决定是否包含指导策略

### 处理时间
- **第一步**：分析阶段，约占总时间的40%
- **第二步**：翻译阶段，约占总时间的60%
- **总体时间**：比单步处理稍长，但质量更高

## 🚀 使用方法

### 前端调用
```javascript
const requirements = {
  quality: 'standard',  // 关键：使用标准模式触发分步化处理
  intent: '商务交流',    // 可选
  reference: '正式文档',  // 可选
  directRequest: '保持礼貌' // 可选
}

const result = await translationStore.translateText(text, mode, requirements)
```

### 后端处理
```javascript
// 自动检测并构建分步化prompt
const prompt = buildPrompt(text, mode, requirements)
if (prompt.isTwoStep) {
  // 执行分步化处理
} else {
  // 执行单步处理
}
```

## 📝 注意事项

1. **向后兼容**：保持与现有API的兼容性
2. **错误处理**：完善的错误处理和回退机制
3. **质量保证**：确保分步化处理不影响翻译质量
4. **监控日志**：记录分步化处理过程以便调试

## 🎯 未来优化

1. **缓存机制**：缓存分析结果以提高效率
2. **并行处理**：探索并行处理的可能性
3. **智能优化**：基于历史数据优化prompt结构
4. **A/B测试**：对比不同prompt结构的效果

## 🔗 相关文件

- `backend/routes/translate.js`：核心实现
- `frontend/src/components/AnalysisPanel.vue`：前端界面
- `frontend/src/stores/translation.js`：状态管理
- `read.me/TRANSLATION_DIFFERENCES.md`：翻译模式对比 