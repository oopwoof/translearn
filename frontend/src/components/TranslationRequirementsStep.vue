<template>
  <div class="translation-requirements-step">
    <div class="step-header">
      <h2>填写翻译需求</h2>
      <p class="step-description">请输入待翻译文本并填写翻译要求，这将帮助系统为您提供更精准的翻译服务</p>
    </div>
    
    <div class="requirements-layout">
      <!-- 文本输入区 -->
      <div class="text-input-section">
        <div class="section-header">
          <h3>
            <el-icon><Document /></el-icon>
            {{ mode === 'zh-ar' ? '输入中文原文' : '输入阿拉伯语原文' }}
          </h3>
          <div class="text-stats">
            <span>{{ localSourceText.length }} 字符</span>
            <span v-if="localSourceText.length > 0">{{ getWordCount() }} 词</span>
          </div>
        </div>
        
        <el-input
          v-model="localSourceText"
          type="textarea"
          :rows="12"
          :placeholder="getTextPlaceholder()"
          class="text-input"
          :dir="mode === 'ar-zh' ? 'rtl' : 'ltr'"
          @input="handleTextInput"
        />
        
        <div class="text-actions">
          <el-button 
            :icon="Delete" 
            size="small" 
            @click="clearText"
            :disabled="!localSourceText"
          >
            清空
          </el-button>
          <el-button 
            :icon="CopyDocument" 
            size="small" 
            @click="pasteFromClipboard"
          >
            粘贴
          </el-button>
        </div>
      </div>
      
      <!-- 需求配置区 -->
      <div class="requirements-config">
        <div class="section-header">
          <h3>
            <el-icon><Setting /></el-icon>
            翻译需求配置
          </h3>
        </div>
        
        <!-- 意图/受众配置 -->
        <div class="requirement-group">
          <label class="requirement-label">
            <el-icon><User /></el-icon>
            翻译意图/目标受众
          </label>
          
          <div class="template-selector">
            <el-select 
              v-model="intentTemplate" 
              placeholder="选择预设模板"
              size="small"
              @change="applyIntentTemplate"
              class="template-select"
            >
              <el-option label="商务交流" value="business" />
              <el-option label="学术论文" value="academic" />
              <el-option label="新闻报道" value="news" />
              <el-option label="文学作品" value="literature" />
              <el-option label="技术文档" value="technical" />
              <el-option label="法律文件" value="legal" />
              <el-option label="自定义" value="custom" />
            </el-select>
          </div>
          
          <el-input
            v-model="localIntent"
            placeholder="详细描述翻译意图和目标受众，如：面向阿拉伯商务伙伴的正式邮件"
            class="requirement-input"
            @input="updateIntent"
          />
          
          <div v-if="intentTemplate && intentTemplate !== 'custom'" class="template-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ getTemplateHint(intentTemplate) }}</span>
          </div>
        </div>
        
        <!-- 参考译文风格 -->
        <div class="requirement-group">
          <label class="requirement-label">
            <el-icon><Files /></el-icon>
            参考译文风格
          </label>
          
          <el-input
            v-model="localReference"
            type="textarea"
            :rows="4"
            placeholder="粘贴或输入参考译文，系统将分析其风格特点并应用到翻译中"
            class="requirement-input"
            @input="updateReference"
          />
          
          <div class="reference-actions">
            <el-button 
              :icon="Upload" 
              size="small" 
              @click="uploadReference"
            >
              上传参考文件
            </el-button>
                         <el-button 
               :icon="Tools" 
               size="small" 
               @click="analyzeReferenceStyle"
               :disabled="!localReference.trim()"
             >
               分析风格
             </el-button>
          </div>
        </div>
        
        <!-- 特殊要求 -->
        <div class="requirement-group">
          <label class="requirement-label">
            <el-icon><Flag /></el-icon>
            特殊要求
          </label>
          
          <el-input
            v-model="localDirectRequest"
            placeholder="如：保留礼貌用语、使用正式语体、避免口语化表达等"
            class="requirement-input"
            @input="updateDirectRequest"
          />
          
          <div class="quick-tags">
            <span class="quick-tag-label">常用要求：</span>
            <el-tag 
              v-for="tag in commonRequirements" 
              :key="tag"
              size="small"
              @click="addQuickTag(tag)"
              class="quick-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 需求预览 -->
    <div class="requirements-preview">
      <h4>
        <el-icon><View /></el-icon>
        需求配置预览
      </h4>
      <div class="preview-content">
        <div class="preview-item">
          <strong>翻译模式：</strong>{{ getModeText() }}
        </div>
        <div class="preview-item" v-if="localIntent.trim()">
          <strong>翻译意图：</strong>{{ localIntent }}
        </div>
        <div class="preview-item" v-if="localReference.trim()">
          <strong>参考风格：</strong>{{ localReference.length > 50 ? localReference.substring(0, 50) + '...' : localReference }}
        </div>
        <div class="preview-item" v-if="localDirectRequest.trim()">
          <strong>特殊要求：</strong>{{ localDirectRequest }}
        </div>
        <div class="preview-item">
          <strong>文本长度：</strong>{{ localSourceText.length }} 字符
        </div>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="step-actions">
      <el-button 
        size="large"
        @click="handleBack"
      >
        <el-icon><ArrowLeft /></el-icon>
        上一步
      </el-button>
      
      <el-button 
        type="primary" 
        size="large"
        :disabled="!canProceed"
        @click="handleNext"
      >
        下一步：功能分析
        <el-icon><ArrowRight /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Document, Setting, User, Files, Flag, View, 
  ArrowLeft, ArrowRight, Delete, CopyDocument, 
  Upload, Tools, InfoFilled 
} from '@element-plus/icons-vue'

const props = defineProps({
  sourceText: {
    type: String,
    default: ''
  },
  intent: {
    type: String,
    default: ''
  },
  reference: {
    type: String,
    default: ''
  },
  directRequest: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'zh-ar'
  }
})

const emit = defineEmits([
  'update:sourceText', 
  'update:intent', 
  'update:reference', 
  'update:directRequest',
  'next', 
  'back'
])

const localSourceText = ref(props.sourceText)
const localIntent = ref(props.intent)
const localReference = ref(props.reference)
const localDirectRequest = ref(props.directRequest)
const intentTemplate = ref('')

// 监听props变化
watch(() => props.sourceText, (newVal) => {
  localSourceText.value = newVal
})

watch(() => props.intent, (newVal) => {
  localIntent.value = newVal
})

watch(() => props.reference, (newVal) => {
  localReference.value = newVal
})

watch(() => props.directRequest, (newVal) => {
  localDirectRequest.value = newVal
})

const commonRequirements = [
  '保持正式语体',
  '避免口语化',
  '保留礼貌用语',
  '使用敬语',
  '简洁明了',
  '详细准确'
]

const canProceed = computed(() => {
  return localSourceText.value.trim().length > 0
})

const getTextPlaceholder = () => {
  if (props.mode === 'zh-ar') {
    return '请输入需要翻译的中文文本...\n\n提示：\n• 可以是商务邮件、学术论文、新闻文章等\n• 建议单次输入不超过1000字符以获得最佳翻译效果\n• 请确保文本格式正确，标点符号完整'
  } else {
    return 'يرجى إدخال النص العربي المراد ترجمته...\n\nنصائح:\n• يمكن أن يكون رسالة عمل أو ورقة أكاديمية أو مقال إخباري\n• يُنصح بإدخال ما لا يزيد عن 1000 حرف للحصول على أفضل نتائج الترجمة\n• تأكد من صحة تنسيق النص وعلامات الترقيم'
  }
}

const getModeText = () => {
  return props.mode === 'zh-ar' ? '中文 → 阿拉伯语' : '阿拉伯语 → 中文'
}

const getWordCount = () => {
  if (props.mode === 'zh-ar') {
    // 中文按字符计算
    return localSourceText.value.replace(/\s/g, '').length
  } else {
    // 阿拉伯语按单词计算
    return localSourceText.value.trim().split(/\s+/).filter(word => word.length > 0).length
  }
}

const getTemplateHint = (template) => {
  const hints = {
    business: '建议使用正式、礼貌的语体，注重商务礼仪和专业术语',
    academic: '要求准确、严谨的学术表达，保持客观中立的语调',
    news: '需要简洁明了的新闻语言，突出重点信息',
    literature: '注重文学色彩和修辞手法的保留与转换',
    technical: '确保技术术语的准确性和一致性',
    legal: '要求精确、严谨的法律语言，避免歧义'
  }
  return hints[template] || ''
}

const applyIntentTemplate = (template) => {
  if (template === 'custom') return
  
  const templates = {
    business: `商务${props.mode === 'zh-ar' ? '阿拉伯' : '中国'}伙伴，正式商务交流`,
    academic: `学术研究人员，${props.mode === 'zh-ar' ? '阿拉伯语' : '中文'}学术论文发表`,
    news: `${props.mode === 'zh-ar' ? '阿拉伯语' : '中文'}新闻媒体读者，信息传达`,
    literature: `文学爱好者，${props.mode === 'zh-ar' ? '阿拉伯语' : '中文'}文学作品翻译`,
    technical: `技术专业人士，${props.mode === 'zh-ar' ? '阿拉伯语' : '中文'}技术文档`,
    legal: `法律专业人士，${props.mode === 'zh-ar' ? '阿拉伯语' : '中文'}法律文件`
  }
  
  localIntent.value = templates[template] || ''
  updateIntent(localIntent.value)
}

const addQuickTag = (tag) => {
  if (localDirectRequest.value.includes(tag)) return
  
  if (localDirectRequest.value.trim()) {
    localDirectRequest.value += '、' + tag
  } else {
    localDirectRequest.value = tag
  }
  updateDirectRequest(localDirectRequest.value)
}

const handleTextInput = (value) => {
  localSourceText.value = value
  emit('update:sourceText', value)
}

const updateIntent = (value) => {
  emit('update:intent', value)
}

const updateReference = (value) => {
  emit('update:reference', value)
}

const updateDirectRequest = (value) => {
  emit('update:directRequest', value)
}

const clearText = () => {
  localSourceText.value = ''
  emit('update:sourceText', '')
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    localSourceText.value = text
    emit('update:sourceText', text)
    ElMessage.success('已从剪贴板粘贴文本')
  } catch (error) {
    ElMessage.error('无法从剪贴板读取内容')
  }
}

const uploadReference = () => {
  ElMessage.info('文件上传功能开发中...')
}

const analyzeReferenceStyle = () => {
  ElMessage.info('风格分析功能开发中...')
}

const handleNext = () => {
  if (canProceed.value) {
    emit('next')
  }
}

const handleBack = () => {
  emit('back')
}
</script>

<style scoped>
.translation-requirements-step {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 40px;
}

.step-header h2 {
  font-size: 28px;
  color: var(--text-dark);
  margin-bottom: 12px;
  font-weight: 600;
}

.step-description {
  font-size: 14px;
  color: var(--text-medium);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.requirements-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  color: var(--text-dark);
  margin: 0;
  font-weight: 600;
}

.text-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-light);
}

.text-input-section,
.requirements-config {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(156, 175, 136, 0.3);
  padding: 24px;
}

.text-input {
  margin-bottom: 12px;
}

.text-actions {
  display: flex;
  gap: 8px;
}

.requirement-group {
  margin-bottom: 24px;
}

.requirement-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.template-selector {
  margin-bottom: 8px;
}

.template-select {
  width: 100%;
}

.requirement-input {
  margin-bottom: 8px;
}

.template-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-light);
  background: rgba(156, 175, 136, 0.1);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(156, 175, 136, 0.2);
}

.reference-actions {
  display: flex;
  gap: 8px;
}

.quick-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-tag-label {
  font-size: 12px;
  color: var(--text-light);
}

.quick-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-tag:hover {
  background: var(--forest-green);
  color: white;
}

.requirements-preview {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(156, 175, 136, 0.2);
  padding: 20px;
  margin-bottom: 30px;
}

.requirements-preview h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: var(--text-dark);
  margin-bottom: 16px;
  font-weight: 600;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  font-size: 13px;
  color: var(--text-medium);
}

.preview-item strong {
  color: var(--text-dark);
  margin-right: 8px;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-actions .el-button {
  padding: 12px 30px;
  font-size: 14px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 968px) {
  .requirements-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .step-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .step-actions .el-button {
    width: 100%;
  }
}
</style> 