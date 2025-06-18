<template>
  <div class="translation-form">
    <el-card class="form-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>🌍 智能翻译</h2>
          <el-tag v-if="translationStore.isTranslating" type="info" effect="plain">
            翻译中...
          </el-tag>
        </div>
      </template>

      <!-- 语言选择 -->
      <div class="language-selector">
        <el-select
          v-model="sourceLanguage"
          placeholder="源语言"
          style="width: 120px"
        >
          <el-option
            v-for="lang in translationStore.languages"
            :key="lang.code"
            :label="lang.name"
            :value="lang.code"
          />
        </el-select>

        <el-button
          type="primary"
          :icon="Switch"
          circle
          size="small"
          @click="swapLanguages"
          :disabled="sourceLanguage === 'auto'"
        />

        <el-select
          v-model="targetLanguage"
          placeholder="目标语言"
          style="width: 120px"
        >
          <el-option
            v-for="lang in translationStore.languages.filter(l => l.code !== 'auto')"
            :key="lang.code"
            :label="lang.name"
            :value="lang.code"
          />
        </el-select>
      </div>

      <!-- 翻译输入区域 -->
      <div class="translation-area">
        <div class="input-section">
          <div class="section-header">
            <span class="section-title">原文</span>
            <span class="text-count">{{ originalText.length }}/5000</span>
          </div>
          <el-input
            v-model="originalText"
            type="textarea"
            :rows="6"
            placeholder="请输入要翻译的文本..."
            maxlength="5000"
            show-word-limit
            resize="none"
            @input="onInputChange"
          />
        </div>

        <div class="output-section">
          <div class="section-header">
            <span class="section-title">译文</span>
            <div class="action-buttons" v-if="translatedText">
              <el-button
                type="primary"
                :icon="CopyDocument"
                size="small"
                @click="copyTranslation"
              >
                复制
              </el-button>
              <el-button
                type="success"
                :icon="Download"
                size="small"
                @click="saveTranslation"
              >
                保存
              </el-button>
            </div>
          </div>
          <el-input
            v-model="translatedText"
            type="textarea"
            :rows="6"
            placeholder="翻译结果将显示在这里..."
            readonly
            resize="none"
            v-loading="translationStore.isTranslating"
            element-loading-text="正在翻译..."
          />
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button
          type="primary"
          size="large"
          @click="handleTranslate"
          :loading="translationStore.isTranslating"
          :disabled="!originalText.trim()"
        >
          <template #icon>
            <el-icon><Translate /></el-icon>
          </template>
          {{ translationStore.isTranslating ? '翻译中...' : '翻译' }}
        </el-button>

        <el-button
          size="large"
          @click="clearAll"
          :disabled="translationStore.isTranslating"
        >
          <template #icon>
            <el-icon><Delete /></el-icon>
          </template>
          清空
        </el-button>
      </div>

      <!-- 错误提示 -->
      <el-alert
        v-if="translationStore.error"
        :title="translationStore.error"
        type="error"
        show-icon
        :closable="true"
        @close="translationStore.clearError"
        style="margin-top: 16px"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Switch, CopyDocument, Download, Delete } from '@element-plus/icons-vue';
import { useTranslationStore } from '@/stores/translation';

// Store
const translationStore = useTranslationStore();

// 响应式数据
const originalText = ref('');
const translatedText = ref('');
const sourceLanguage = ref('auto');
const targetLanguage = ref('zh');

// 输入防抖
let inputTimer = null;
const onInputChange = () => {
  if (inputTimer) clearTimeout(inputTimer);
  inputTimer = setTimeout(() => {
    if (originalText.value.trim() && originalText.value.length > 50) {
      // 自动翻译长文本
      handleTranslate();
    }
  }, 2000);
};

// 交换语言
const swapLanguages = () => {
  if (sourceLanguage.value === 'auto') return;
  
  const temp = sourceLanguage.value;
  sourceLanguage.value = targetLanguage.value;
  targetLanguage.value = temp;
  
  // 如果有翻译结果，交换文本
  if (translatedText.value) {
    const tempText = originalText.value;
    originalText.value = translatedText.value;
    translatedText.value = tempText;
  }
};

// 翻译处理
const handleTranslate = async () => {
  if (!originalText.value.trim()) {
    ElMessage.warning('请输入要翻译的文本');
    return;
  }

  try {
    // 确定翻译模式
    let mode = 'zh-ar'; // 默认中译阿
    if (sourceLanguage.value === 'ar' && targetLanguage.value === 'zh') {
      mode = 'ar-zh'; // 阿译中
    } else if (sourceLanguage.value === 'zh' && targetLanguage.value === 'ar') {
      mode = 'zh-ar'; // 中译阿
    }

    // 构建翻译要求（使用标准质量）
    const requirements = {
      quality: 'standard',
      intent: '',
      reference: '',
      directRequest: ''
    };

    const result = await translationStore.translateText(
      originalText.value,
      mode,
      requirements
    );
    
    translatedText.value = result.translatedText;
    ElMessage.success('翻译完成！');
  } catch (error) {
    ElMessage.error(error.message || '翻译失败');
  }
};

// 复制翻译结果
const copyTranslation = async () => {
  try {
    await navigator.clipboard.writeText(translatedText.value);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea');
    textArea.value = translatedText.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    ElMessage.success('已复制到剪贴板');
  }
};

// 保存翻译
const saveTranslation = () => {
  const content = `原文：${originalText.value}\n\n译文：${translatedText.value}\n\n翻译时间：${new Date().toLocaleString()}`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `翻译_${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  ElMessage.success('翻译已保存');
};

// 清空所有内容
const clearAll = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有内容吗？', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    originalText.value = '';
    translatedText.value = '';
    translationStore.clearCurrentTranslation();
    ElMessage.success('已清空');
  } catch {
    // 用户取消
  }
};

// 监听当前翻译变化
watch(
  () => translationStore.currentTranslation,
  (newTranslation) => {
    if (newTranslation) {
      translatedText.value = newTranslation.translatedText;
    }
  }
);
</script>

<style scoped>
.translation-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form-card {
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  justify-content: center;
}

.translation-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.input-section,
.output-section {
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-title {
  font-weight: 600;
  color: #606266;
  font-size: 14px;
}

.text-count {
  font-size: 12px;
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .translation-area {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .language-selector {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .action-section {
    flex-direction: column;
    align-items: center;
  }
  
  .action-section .el-button {
    width: 100%;
    max-width: 200px;
  }
}
</style>

