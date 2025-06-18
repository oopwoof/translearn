# 智能翻译系统 - 质量分级功能

## 功能概述

本系统实现了基于不同质量等级的翻译工作流，用户可以根据需求选择不同的翻译质量：

### 质量等级

1. **速翻 (Fast)**
   - 适用于：日常交流、紧急处理
   - 特点：优化生成速度，保证基本忠实度和通顺度
   - 输出：简洁的翻译结果

2. **标准 (Standard)**
   - 适用于：商务、学术、内容创作
   - 特点：兼顾效率与质量，包含基本校对和润色
   - 输出：详细的翻译分析，包括文本特征、术语分析、翻译建议等

3. **精翻 (Premium)**
   - 适用于：重要文档、正式场合
   - 特点：追求最高质量，注重文化适应性
   - 输出：高质量翻译结果（待完善）

## 使用方法

### 前端界面

1. 在翻译工作区选择翻译方向（中-阿 或 阿-中）
2. 选择质量等级：
   - 点击"速翻"按钮进行快速翻译
   - 点击"标准"按钮进行标准翻译
   - 点击"精翻"按钮进行精修翻译
3. 填写翻译要求（可选）：
   - 翻译意图/受众
   - 参考译文风格
   - 直接要求
4. 点击"开始翻译"按钮

### API 调用

```javascript
// 速翻示例
const response = await fetch('/api/translate/claude', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: '你好，世界！',
    mode: 'zh-ar',
    requirements: {
      quality: 'fast',
      intent: '日常交流',
      reference: '',
      directRequest: ''
    }
  })
});

// 标准翻译示例
const response = await fetch('/api/translate/claude', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: '欢迎来到我们的公司',
    mode: 'zh-ar',
    requirements: {
      quality: 'standard',
      intent: '商务交流',
      reference: '正式商务文档',
      directRequest: '使用正式语体'
    }
  })
});
```

## 技术实现

### 后端架构

- **工作流选择**: 根据 `quality` 参数选择不同的提示词模板
- **JSON 解析**: 支持结构化 JSON 响应和传统文本响应
- **错误处理**: 完善的错误处理和回退机制

### 前端优化

- **视觉反馈**: 优化了质量选择按钮的颜色和交互效果
- **状态管理**: 使用 Pinia 进行状态管理
- **响应式设计**: 适配不同屏幕尺寸

## 启动项目

### 后端
```bash
cd backend
npm install
npm start
```

### 前端
```bash
cd frontend
npm install
npm run dev
```

## 环境配置

确保在 `backend/.env` 文件中配置了必要的环境变量：

```env
CLAUDE_API_KEY=your_claude_api_key
CLAUDE_BASE_URL=your_claude_base_url
```

## 测试

运行测试脚本验证功能：

```bash
node test-translation.js
```

## 注意事项

1. 确保 Claude API 密钥配置正确
2. 网络连接稳定，API 调用可能需要较长时间
3. 长文本翻译建议使用标准或精翻模式
4. 速翻模式适合短文本和紧急情况 