<template>
  <div class="function-area" :class="{ expanded: isExpanded }">
    <div class="function-container">
      <div class="function-grid">
        <FunctionBall
          v-for="ball in availableFunctionBalls"
          :key="ball.id"
          v-bind="ball"
          :disabled="ball.disabled"
          :disabledReason="ball.disabledReason"
          @dragstart="handleDragStart"
          @dragend="handleDragEnd"
        />
      </div>
      <div class="expand-button" @click="toggleExpand">
        <el-icon :class="{ 'is-expanded': isExpanded }">
          <ArrowDown />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import FunctionBall from './FunctionBall.vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'zh-ar'
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
  excludedBallIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['ball-removed'])

const isExpanded = ref(false)

const allFunctionBalls = computed(() => {
  // 所有功能球都显示，但根据输入框状态设置是否可拖拽
  return [
    {
      id: 'text-features',
      label: '文本特征分析',
      icon: 'Document',
      prompt: '输出文本特征',
      disabled: false,
      disabledReason: ''
    },
    {
      id: 'terminology',
      label: '专业术语、成语/习语',
      icon: 'Collection',
      prompt: '输出文本专业术语、成语/习语',
      disabled: false,
      disabledReason: ''
    },
    {
      id: 'suggestions',
      label: '翻译建议',
      icon: 'Light',
      prompt: '给出可直接供人工翻译使用的翻译建议',
      disabled: false,
      disabledReason: ''
    },
    {
      id: 'intent-analysis',
      label: '翻译意图/受众分析',
      icon: 'User',
      prompt: '分析翻译意图和受众',
      disabled: !props.intent || !props.intent.trim(),
      disabledReason: !props.intent || !props.intent.trim() ? '请先在控制面板输入"意图/受众"' : ''
    },
    {
      id: 'reference-analysis',
      label: '参考译文风格分析',
      icon: 'Files',
      prompt: '分析参考译文风格',
      disabled: !props.reference || !props.reference.trim(),
      disabledReason: !props.reference || !props.reference.trim() ? '请先在控制面板输入"参考译文风格"' : ''
    },
    {
      id: 'direct-request-analysis',
      label: '直接要求分析',
      icon: 'Flag',
      prompt: '分析直接要求',
      disabled: !props.directRequest || !props.directRequest.trim(),
      disabledReason: !props.directRequest || !props.directRequest.trim() ? '请先在控制面板输入"直接要求"' : ''
    }
  ]
})

// 过滤出可用的功能球（排除已经被拖入分析面板的）
const availableFunctionBalls = computed(() => {
  return allFunctionBalls.value.filter(ball => !props.excludedBallIds.includes(ball.id))
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const handleDragStart = (ball) => {
  // 可以在这里添加拖拽开始的处理逻辑
}

const handleDragEnd = () => {
  // 可以在这里添加拖拽结束的处理逻辑
}

// 监听条件功能球的变化，当输入框清空时通知父组件移除对应的球
watch(() => [props.intent, props.reference, props.directRequest], (newValues, oldValues) => {
  const [newIntent, newReference, newDirectRequest] = newValues
  const [oldIntent, oldReference, oldDirectRequest] = oldValues

  // 检查意图/受众输入框是否被清空
  if (oldIntent && oldIntent.trim() && (!newIntent || !newIntent.trim())) {
    emit('ball-removed', 'intent-analysis')
  }

  // 检查参考译文输入框是否被清空
  if (oldReference && oldReference.trim() && (!newReference || !newReference.trim())) {
    emit('ball-removed', 'reference-analysis')
  }

  // 检查直接要求输入框是否被清空
  if (oldDirectRequest && oldDirectRequest.trim() && (!newDirectRequest || !newDirectRequest.trim())) {
    emit('ball-removed', 'direct-request-analysis')
  }
}, { deep: true })
</script>

<style scoped>
.function-area {
  background: #f5f7fa;
  padding: 12px 20px;
  transition: all 0.3s;
  flex-shrink: 0;
  border-bottom: 1px solid #e4e7ed;
}

.function-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s;
}

.function-grid {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 4px;
  transition: all 0.3s;
  flex-wrap: wrap;
}

.expand-button {
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  z-index: 1;
}

.expand-button:hover {
  transform: translateX(-50%) scale(1.1);
}

.expand-button .el-icon {
  font-size: 16px;
  color: #1E3050;
  transition: transform 0.3s;
}

.expand-button .is-expanded {
  transform: rotate(180deg);
}

.function-area.expanded .function-container {
  padding-bottom: 32px;
}

.function-area:not(.expanded) .function-grid {
  max-height: 80px;
  overflow: hidden;
}
</style> 