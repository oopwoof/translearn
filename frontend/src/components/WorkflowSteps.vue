<template>
  <div class="workflow-steps">
    <div class="step-indicator">
      <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
        <div class="step-circle">
          <span class="step-number">1</span>
          <el-icon v-if="currentStep > 1" class="check-icon"><Check /></el-icon>
        </div>
        <span class="step-title">模式选择</span>
        <div class="step-description">中阿-阿中翻译方向</div>
      </div>
      
      <div class="step-connector" :class="{ active: currentStep > 1 }"></div>
      
      <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
        <div class="step-circle">
          <span class="step-number">2</span>
          <el-icon v-if="currentStep > 2" class="check-icon"><Check /></el-icon>
        </div>
        <span class="step-title">翻译需求</span>
        <div class="step-description">填写翻译要求和上下文</div>
      </div>
      
      <div class="step-connector" :class="{ active: currentStep > 2 }"></div>
      
      <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
        <div class="step-circle">
          <span class="step-number">3</span>
          <el-icon v-if="currentStep > 3" class="check-icon"><Check /></el-icon>
        </div>
        <span class="step-title">功能分析</span>
        <div class="step-description">选择和执行翻译分析</div>
      </div>
      
      <div class="step-connector" :class="{ active: currentStep > 3 }"></div>
      
      <div class="step" :class="{ active: currentStep >= 4, completed: currentStep > 4 }">
        <div class="step-circle">
          <span class="step-number">4</span>
          <el-icon v-if="currentStep > 4" class="check-icon"><Check /></el-icon>
        </div>
        <span class="step-title">质量翻译</span>
        <div class="step-description">选择质量等级并执行翻译</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Check } from '@element-plus/icons-vue'

const props = defineProps({
  currentStep: {
    type: Number,
    default: 1
  }
})
</script>

<style scoped>
.workflow-steps {
  padding: 20px 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
  border: 1px solid rgba(34, 139, 34, 0.2);
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  opacity: 0.5;
  transition: all 0.3s ease;
  min-width: 150px;
}

.step.active {
  opacity: 1;
  color: var(--forest-green);
}

.step.completed {
  opacity: 0.8;
  color: var(--deep-green);
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(156, 175, 136, 0.2);
  border: 2px solid rgba(156, 175, 136, 0.5);
  margin-bottom: 8px;
  position: relative;
  transition: all 0.3s ease;
}

.step.active .step-circle {
  background: linear-gradient(135deg, var(--forest-green), var(--emerald-green));
  border-color: var(--forest-green);
  color: white;
  box-shadow: 0 4px 15px rgba(34, 139, 34, 0.3);
}

.step.completed .step-circle {
  background: var(--deep-green);
  border-color: var(--deep-green);
  color: white;
}

.step-number {
  font-size: 14px;
  font-weight: 600;
}

.check-icon {
  font-size: 16px;
  color: white;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-dark);
}

.step.active .step-title {
  color: var(--forest-green);
}

.step-description {
  font-size: 11px;
  color: var(--text-light);
  line-height: 1.3;
  max-width: 120px;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: rgba(156, 175, 136, 0.3);
  margin: 0 15px;
  position: relative;
  top: -15px;
  transition: all 0.3s ease;
}

.step-connector.active {
  background: linear-gradient(90deg, var(--forest-green), var(--emerald-green));
  box-shadow: 0 1px 3px rgba(34, 139, 34, 0.3);
}

/* 添加装饰效果 */
.workflow-steps::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  height: 3px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--forest-green) 25%, 
    var(--emerald-green) 50%, 
    var(--forest-green) 75%, 
    transparent 100%);
  opacity: 0.6;
  border-radius: 0 0 3px 3px;
}

.workflow-steps {
  position: relative;
}
</style> 