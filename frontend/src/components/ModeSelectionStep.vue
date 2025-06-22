<template>
  <div class="mode-selection-step">
    <div class="step-header">
      <h2>选择翻译模式</h2>
      <p class="step-description">请选择您的翻译方向，这将决定后续的界面布局和功能配置</p>
    </div>
    
    <div class="mode-cards">
      <div 
        class="mode-card" 
        :class="{ selected: localMode === 'zh-ar' }" 
        @click="selectMode('zh-ar')"
      >
        <div class="mode-icon">
          <div class="language-flag">🇨🇳</div>
          <div class="arrow">→</div>
          <div class="language-flag">🇸🇦</div>
        </div>
        <h3>中文 → 阿拉伯语</h3>
        <div class="mode-details">
          <p>将中文文本翻译为阿拉伯语</p>
          <ul class="feature-list">
            <li>支持简体中文</li>
            <li>输出标准阿拉伯语</li>
            <li>适合商务、学术、文学等场景</li>
          </ul>
        </div>
        <div class="mode-indicator">
          <el-icon v-if="localMode === 'zh-ar'" class="check-icon">
            <CircleCheck />
          </el-icon>
        </div>
      </div>
      
      <div 
        class="mode-card" 
        :class="{ selected: localMode === 'ar-zh' }" 
        @click="selectMode('ar-zh')"
      >
        <div class="mode-icon">
          <div class="language-flag">🇸🇦</div>
          <div class="arrow">→</div>
          <div class="language-flag">🇨🇳</div>
        </div>
        <h3>阿拉伯语 → 中文</h3>
        <div class="mode-details">
          <p>将阿拉伯语文本翻译为中文</p>
          <ul class="feature-list">
            <li>支持标准阿拉伯语</li>
            <li>输出简体中文</li>
            <li>准确理解阿语语法特点</li>
          </ul>
        </div>
        <div class="mode-indicator">
          <el-icon v-if="localMode === 'ar-zh'" class="check-icon">
            <CircleCheck />
          </el-icon>
        </div>
      </div>
    </div>
    
    <div class="mode-footer">
      <div class="tips">
        <el-icon><InfoFilled /></el-icon>
        <span>选择模式后，系统将自动配置相应的文本输入区域和分析功能</span>
      </div>
      
      <div class="action-buttons">
        <el-button 
          type="primary" 
          size="large"
          :disabled="!localMode"
          @click="handleNext"
        >
          下一步：填写翻译需求
          <el-icon class="ml-2"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { CircleCheck, InfoFilled, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  mode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:mode', 'next'])

const localMode = ref(props.mode)

watch(() => props.mode, (newVal) => {
  localMode.value = newVal
})

const selectMode = (mode) => {
  localMode.value = mode
  emit('update:mode', mode)
}

const handleNext = () => {
  if (localMode.value) {
    emit('next')
  }
}
</script>

<style scoped>
.mode-selection-step {
  padding: 30px;
  max-width: 900px;
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
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.mode-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
}

.mode-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-lg);
  border: 2px solid rgba(156, 175, 136, 0.3);
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 280px;
}

.mode-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(34, 139, 34, 0.15);
  border-color: rgba(34, 139, 34, 0.5);
}

.mode-card.selected {
  border-color: var(--forest-green);
  box-shadow: 0 8px 32px rgba(34, 139, 34, 0.25);
  background: rgba(34, 139, 34, 0.05);
}

.mode-card.selected::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--forest-green), var(--emerald-green));
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.mode-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.language-flag {
  font-size: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(156, 175, 136, 0.3);
}

.arrow {
  font-size: 24px;
  color: var(--forest-green);
  font-weight: bold;
}

.mode-card h3 {
  font-size: 20px;
  color: var(--text-dark);
  margin-bottom: 12px;
  text-align: center;
  font-weight: 600;
}

.mode-details p {
  font-size: 14px;
  color: var(--text-medium);
  text-align: center;
  margin-bottom: 16px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  font-size: 12px;
  color: var(--text-light);
  padding: 4px 0;
  position: relative;
  padding-left: 16px;
}

.feature-list li::before {
  content: '•';
  color: var(--forest-green);
  position: absolute;
  left: 0;
  top: 4px;
}

.mode-indicator {
  position: absolute;
  top: 15px;
  right: 15px;
}

.check-icon {
  font-size: 24px;
  color: var(--forest-green);
}

.mode-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.tips {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-light);
  background: rgba(156, 175, 136, 0.1);
  padding: 12px 20px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(156, 175, 136, 0.2);
}

.tips .el-icon {
  color: var(--forest-green);
}

.action-buttons {
  text-align: center;
}

.action-buttons .el-button {
  padding: 12px 30px;
  font-size: 14px;
  font-weight: 600;
}

.ml-2 {
  margin-left: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mode-cards {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .mode-card {
    padding: 20px;
    min-height: auto;
  }
  
  .language-flag {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
  
  .arrow {
    font-size: 20px;
  }
}
</style> 