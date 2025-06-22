<template>
    <div class="analysis-panel">
      <h3>翻译分析</h3>
      
      <!-- 功能球存放区 -->
      <div class="ball-drop-zone" 
           @dragover.prevent
           @drop.prevent="handleDrop"
           :class="{ 'has-balls': selectedBalls.length > 0 }"
      >
        <div v-if="selectedBalls.length === 0" class="drop-hint">
          拖拽功能球到这里
        </div>
        <div v-else class="selected-balls">
          <div v-for="ball in selectedBalls" 
               :key="ball.id" 
               class="selected-ball"
               :class="{ 'analyzed': isAnalyzed(ball.id), 'pending': isPending(ball.id) }"
          >
            <el-icon><component :is="ball.icon" /></el-icon>
            <span>{{ ball.label }}</span>
            <div class="ball-status">
              <el-icon v-if="isAnalyzed(ball.id)" class="status-icon analyzed-icon">
                <CircleCheck />
              </el-icon>
              <el-icon v-else-if="isPending(ball.id)" class="status-icon pending-icon">
                <Loading />
              </el-icon>
            </div>
            <el-icon 
              class="remove-ball"
              @click="removeBall(ball)"
            >
              <Close />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 分析按钮 -->
      <el-button 
        type="primary" 
        :disabled="!canAnalyze"
        @click="handleAnalyze"
        class="analyze-btn"
        :loading="analyzing"
      >
        {{ analyzing ? '分析中...' : getAnalyzeButtonText() }}
      </el-button>
      
      <!-- 分组设置 -->
      <div v-if="selectedBalls.length > 1" class="group-settings">
        <el-switch 
          v-model="useGroupedAnalysis"
          :active-text="`启用分组分析 (${groupSize}个/组)`"
          inactive-text="一次性分析"
          class="group-switch"
        />
        <div v-if="useGroupedAnalysis" class="group-size-selector">
          <span class="group-size-label">分组大小:</span>
          <el-radio-group v-model="groupSize" size="small">
            <el-radio-button :label="2">2个/组</el-radio-button>
            <el-radio-button :label="3">3个/组</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 分析进度 -->
      <div v-if="analysisProgress.isGrouped && analysisProgress.totalGroups > 0" class="analysis-progress">
        <div class="progress-info">
          <span>分组进度: {{ analysisProgress.completedGroups }} / {{ analysisProgress.totalGroups }}</span>
          <el-progress 
            :percentage="Math.round((analysisProgress.completedGroups / analysisProgress.totalGroups) * 100)"
            :stroke-width="8"
            class="progress-bar"
          />
        </div>
        <div v-if="analysisProgress.currentGroupBalls.length > 0" class="current-group">
          <span class="current-group-label">正在分析:</span>
          <el-tag 
            v-for="ballId in analysisProgress.currentGroupBalls" 
            :key="ballId"
            size="small"
            type="warning"
            class="current-ball-tag"
          >
            {{ selectedBalls.find(b => b.id === ballId)?.label || ballId }}
          </el-tag>
        </div>
      </div>



      <!-- 文本特征分析 -->
      <div v-if="displayedAnalysisData?.textCharacteristicsForHumanUse && hasAnalyzedBall('text-features')" class="analysis-section">
        <div class="feature-card">
          <p><strong>文本特征分析：</strong></p>
          <p class="feature-content">{{ displayedAnalysisData.textCharacteristicsForHumanUse }}</p>
          <p class="timestamp">分析时间: {{ formatTime(displayedAnalysisData.analyzedAt) }}</p>
        </div>
      </div>
  
      <!-- 专业术语、成语/习语分析 -->
      <div v-if="displayedAnalysisData?.terminologyIdiomsAnalysis && hasAnalyzedBall('terminology')" class="analysis-section">
        <div class="terminology-card">
          <p><strong>专业术语、成语/习语分析：</strong></p>
          <div v-for="(analysis, term) in displayedAnalysisData.terminologyIdiomsAnalysis" :key="term" class="term-analysis">
            <div class="term-title">{{ term }}</div>
            <div class="term-content">{{ analysis }}</div>
          </div>
        </div>
      </div>
  
      <!-- 翻译建议 -->
      <div v-if="displayedAnalysisData?.translationStrategyForHumanUse && hasAnalyzedBall('suggestions')" class="analysis-section">
        <div class="suggestions-card">
          <p><strong>翻译建议：</strong></p>
          <p class="suggestion-content">{{ displayedAnalysisData.translationStrategyForHumanUse }}</p>
        </div>
      </div>

      <!-- 翻译意图/受众分析 -->
      <div v-if="displayedAnalysisData?.intentAudienceAnalysisForHumanUse && hasAnalyzedBall('intent-analysis')" class="analysis-section">
        <div class="intent-card">
          <p><strong>翻译意图/受众分析：</strong></p>
          <p class="intent-content">{{ displayedAnalysisData.intentAudienceAnalysisForHumanUse }}</p>
        </div>
      </div>
  
      <!-- 参考译文风格分析 -->
      <div v-if="displayedAnalysisData?.referenceAnalysisForHumanUse && hasAnalyzedBall('reference-analysis')" class="analysis-section">
        <div class="reference-card">
          <p><strong>参考译文风格分析：</strong></p>
          <p class="reference-content">{{ displayedAnalysisData.referenceAnalysisForHumanUse }}</p>
          </div>
          </div>

      <!-- 直接要求分析 -->
      <div v-if="displayedAnalysisData?.directRequestAnalysisForHumanUse && hasAnalyzedBall('direct-request-analysis')" class="analysis-section">
        <div class="instruction-card">
          <p><strong>直接要求分析：</strong></p>
          <p class="instruction-content">{{ displayedAnalysisData.directRequestAnalysisForHumanUse }}</p>
        </div>
      </div>
  
      <!-- 加载状态 -->
      <div v-if="!hasAnyDisplayedContent && !selectedBalls.length" class="empty-state">
        <p>拖拽功能球到上方区域开始分析</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Close, CircleCheck, Loading } from '@element-plus/icons-vue'
  
  const props = defineProps({
    analysisData: {
      type: Object,
      default: null
    },
    analyzing: {
      type: Boolean,
      default: false
    },
    currentText: {
      type: String,
      default: ''
    }
  })
  
  const emit = defineEmits(['analyze', 'balls-changed'])
  
  const selectedBalls = ref([])
  const analyzedBalls = ref(new Set()) // 记录已分析过的功能球
  const displayedAnalysisData = ref({}) // 当前显示的分析数据
  const pendingBalls = ref(new Set()) // 记录正在分析的功能球
  const lastAnalyzedText = ref('') // 记录上次分析的文本
  const persistedAnalysisData = ref({}) // 持久化保存的所有分析数据，按功能球ID分组
  const useGroupedAnalysis = ref(false) // 是否使用分组分析，默认改为false
  const groupSize = ref(2) // 分组大小
  const analysisProgress = ref({ // 分析进度
    isGrouped: false,
    totalGroups: 0,
    completedGroups: 0,
    currentGroupBalls: []
  })
  
  const canAnalyze = computed(() => {
    const unanalyzedBalls = selectedBalls.value.filter(ball => !analyzedBalls.value.has(ball.id))
    return unanalyzedBalls.length > 0 && !props.analyzing && props.currentText.trim()
  })

  const hasAnyDisplayedContent = computed(() => {
    return Object.keys(displayedAnalysisData.value).length > 0
  })

  const shouldUseGroupedAnalysis = computed(() => {
    return useGroupedAnalysis.value && selectedBalls.value.length > groupSize.value
  })

  // 监听selectedBalls变化，通知父组件
  watch(selectedBalls, (newBalls) => {
    const ballIds = newBalls.map(ball => ball.id)
    emit('balls-changed', ballIds)
  }, { deep: true })

  // 监听当前文本变化，如果文本改变则清空所有分析状态
  watch(() => props.currentText, (newText, oldText) => {
    if (newText !== oldText && oldText && newText.trim() !== oldText.trim()) {
      clearAllAnalysisState()
    }
  })

  // 监听分析数据变化，更新显示的内容
  watch(() => props.analysisData, (newData) => {
    if (newData) {
      mergeAnalysisData(newData)
    }
  })
  
  const isAnalyzed = (ballId) => {
    return analyzedBalls.value.has(ballId)
  }

  const isPending = (ballId) => {
    return pendingBalls.value.has(ballId)
  }

  const hasAnalyzedBall = (ballId) => {
    return selectedBalls.value.some(ball => ball.id === ballId) && analyzedBalls.value.has(ballId)
  }

  const getAnalyzeButtonText = () => {
    const unanalyzedCount = selectedBalls.value.filter(ball => !analyzedBalls.value.has(ball.id)).length
    if (unanalyzedCount === 0) {
      return '所有功能球已分析'
    }
    
    if (shouldUseGroupedAnalysis.value) {
      const groups = Math.ceil(unanalyzedCount / groupSize.value)
      return `分组分析 ${unanalyzedCount} 个功能球 (${groups}组)`
    }
    
    return `分析 ${unanalyzedCount} 个新功能球`
  }

  const clearAllAnalysisState = () => {
    analyzedBalls.value.clear()
    displayedAnalysisData.value = {}
    pendingBalls.value.clear()
    lastAnalyzedText.value = ''
    persistedAnalysisData.value = {}
  }

  const mergeAnalysisData = (newData) => {
    console.log('🔍 mergeAnalysisData收到数据:', newData)
    
    // 后端返回的数据结构：{ data: 转换后格式, originalData: 原始格式 }
    const displayData = {}
    let originalData = null
    
    // 根据数据来源确定原始数据位置 - 增强错误处理
    try {
      if (newData.originalData) {
        // 来自一次性分析或分组分析接口
        originalData = newData.originalData
        console.log('📋 使用originalData字段')
      } else if (newData.textFeatures || newData.terminology || newData.suggestions) {
        // 直接是原始格式数据
        originalData = newData
        console.log('📋 直接使用newData作为原始数据')
      } else {
        console.warn('⚠️ 未识别的数据格式:', newData)
        return
      }
      
      if (originalData) {
        // 提取显示数据 - 增强容错性，支持增量合并
        if (originalData.textFeatures?.for_human_use) {
          displayData.textCharacteristicsForHumanUse = originalData.textFeatures.for_human_use
          console.log('🆕 添加文本特征分析显示')
        }
        
        if (originalData.terminology?.for_human_use && Object.keys(originalData.terminology.for_human_use).length > 0) {
          displayData.terminologyIdiomsAnalysis = originalData.terminology.for_human_use
          console.log('🆕 添加术语分析显示')
        }
        
        if (originalData.suggestions?.for_human_use) {
          displayData.translationStrategyForHumanUse = originalData.suggestions.for_human_use
          console.log('🆕 添加翻译建议显示')
        }
        
        if (originalData.intentAnalysis?.for_human_use) {
          displayData.intentAudienceAnalysisForHumanUse = originalData.intentAnalysis.for_human_use
          console.log('🆕 添加意图分析显示')
        }
        
        if (originalData.referenceAnalysis?.for_human_use) {
          displayData.referenceAnalysisForHumanUse = originalData.referenceAnalysis.for_human_use
          console.log('🆕 添加参考分析显示')
        }
        
        if (originalData.directRequestAnalysis?.for_human_use) {
          displayData.directRequestAnalysisForHumanUse = originalData.directRequestAnalysis.for_human_use
          console.log('🆕 添加直接要求分析显示')
        }
        
        if (originalData.analyzedAt) {
          displayData.analyzedAt = originalData.analyzedAt
        }
        
        console.log('📝 提取的显示数据:', displayData)
      }
      
      // 合并到显示数据中 - 确保响应式更新，支持增量添加
      if (Object.keys(displayData).length > 0) {
        // 增量合并：只添加新数据，不覆盖已有数据
        Object.keys(displayData).forEach(key => {
          if (displayData[key] !== null && displayData[key] !== undefined) {
            displayedAnalysisData.value[key] = displayData[key]
            console.log(`🎯 更新显示数据字段: ${key}`)
          }
        })
        
        // 强制触发Vue的响应式更新
        console.log('🔄 强制触发Vue响应式更新')
        displayedAnalysisData.value = { ...displayedAnalysisData.value }
        
        // 立即滚动到最新内容
        nextTick(() => {
          const panelElement = document.querySelector('.analysis-panel')
          if (panelElement) {
            panelElement.scrollTop = panelElement.scrollHeight
          }
        })
      }
      
      // 持久化保存分析数据，按功能球ID分组
      const contentMap = {
        'textFeatures': 'text-features',
        'terminology': 'terminology', 
        'suggestions': 'suggestions',
        'intentAnalysis': 'intent-analysis',
        'referenceAnalysis': 'reference-analysis',
        'directRequestAnalysis': 'direct-request-analysis'
      }
      
      // 使用原始数据进行持久化保存
      const dataToSave = originalData || newData
      
      if (dataToSave) {
        // 将新数据按功能球ID分组保存
        Object.keys(dataToSave).forEach(dataKey => {
          if (dataKey === 'analyzedAt') return // 跳过时间戳
          
          const ballId = contentMap[dataKey]
          if (ballId && dataToSave[dataKey]) {
            if (!persistedAnalysisData.value[ballId]) {
              persistedAnalysisData.value[ballId] = {}
            }
            persistedAnalysisData.value[ballId][dataKey] = dataToSave[dataKey]
            persistedAnalysisData.value[ballId].analyzedAt = dataToSave.analyzedAt
            
            // 同时保存转换后的显示格式以便恢复时使用
            if (dataKey === 'textFeatures' && dataToSave[dataKey]?.for_human_use) {
              persistedAnalysisData.value[ballId].textCharacteristicsForHumanUse = dataToSave[dataKey].for_human_use
            }
            if (dataKey === 'terminology' && dataToSave[dataKey]?.for_human_use) {
              persistedAnalysisData.value[ballId].terminologyIdiomsAnalysis = dataToSave[dataKey].for_human_use
            }
            if (dataKey === 'suggestions' && dataToSave[dataKey]?.for_human_use) {
              persistedAnalysisData.value[ballId].translationStrategyForHumanUse = dataToSave[dataKey].for_human_use
            }
            if (dataKey === 'intentAnalysis' && dataToSave[dataKey]?.for_human_use) {
              persistedAnalysisData.value[ballId].intentAudienceAnalysisForHumanUse = dataToSave[dataKey].for_human_use
            }
            if (dataKey === 'referenceAnalysis' && dataToSave[dataKey]?.for_human_use) {
              persistedAnalysisData.value[ballId].referenceAnalysisForHumanUse = dataToSave[dataKey].for_human_use
            }
            if (dataKey === 'directRequestAnalysis' && dataToSave[dataKey]?.for_human_use) {
              persistedAnalysisData.value[ballId].directRequestAnalysisForHumanUse = dataToSave[dataKey].for_human_use
            }
          }
        })
        
        // 自动标记有数据的功能球为已分析状态
        Object.keys(dataToSave).forEach(dataKey => {
          if (dataKey === 'analyzedAt') return
          
          const ballId = contentMap[dataKey]
          if (ballId && dataToSave[dataKey] && selectedBalls.value.some(ball => ball.id === ballId)) {
            analyzedBalls.value.add(ballId)
            console.log(`🎯 自动标记功能球为已分析: ${ballId}`)
          }
        })
      }
      
      lastAnalyzedText.value = props.currentText
      console.log('✅ mergeAnalysisData完成，已分析功能球:', Array.from(analyzedBalls.value))
      
    } catch (error) {
      console.error('❌ mergeAnalysisData处理失败:', error)
      ElMessage.error('分析数据处理失败')
    }
  }
  
  const handleDrop = (e) => {
    try {
      const dragDataStr = e.dataTransfer.getData('text/plain')
      let dragData
      
      try {
        dragData = JSON.parse(dragDataStr)
      } catch (parseError) {
        console.error('拖拽数据解析失败:', parseError)
        ElMessage.error('拖拽数据格式错误')
        return
      }
      
      // 检查是否是多选拖拽
      if (dragData.isMultiDrag && Array.isArray(dragData.balls)) {
        console.log('🎯 处理多选拖拽:', dragData)
        
        let addedCount = 0
        let restoredCount = 0
        
        dragData.balls.forEach(ballData => {
          // 检查是否已经存在
          if (!selectedBalls.value.find(b => b.id === ballData.id)) {
            selectedBalls.value.push({
              id: ballData.id,
              label: ballData.label,
              icon: ballData.icon,
              prompt: ballData.prompt
            })
            addedCount++
            
            // 检查是否有历史分析数据
            if (persistedAnalysisData.value[ballData.id]) {
              const historicalData = persistedAnalysisData.value[ballData.id]
              Object.assign(displayedAnalysisData.value, historicalData)
              analyzedBalls.value.add(ballData.id)
              restoredCount++
            }
          }
        })
        
        if (addedCount > 0) {
          ElMessage.success(`成功添加 ${addedCount} 个功能球` + (restoredCount > 0 ? `，恢复了 ${restoredCount} 个历史分析结果` : ''))
        }
      } else {
        // 单个功能球拖拽（原逻辑）
        const ballData = dragData
        if (!selectedBalls.value.find(b => b.id === ballData.id)) {
          selectedBalls.value.push({
            id: ballData.id,
            label: ballData.label,
            icon: ballData.icon,
            prompt: ballData.prompt
          })
          
          // 检查是否有该功能球的历史分析数据
          if (persistedAnalysisData.value[ballData.id]) {
            // 恢复显示历史分析数据
            const historicalData = persistedAnalysisData.value[ballData.id]
            Object.assign(displayedAnalysisData.value, historicalData)
            
            // 标记为已分析
            analyzedBalls.value.add(ballData.id)
            
            ElMessage.success(`恢复了 ${ballData.label} 的历史分析结果`)
          } else {
            ElMessage.success(`添加了功能球: ${ballData.label}`)
          }
        }
      }
    } catch (error) {
      console.error('Drop error:', error)
      ElMessage.error('拖拽处理失败')
    }
  }
  
  const removeBall = (ball) => {
    selectedBalls.value = selectedBalls.value.filter(b => b.id !== ball.id)
    // 移除对应的显示内容，但保留持久化数据和已分析状态
    removeDisplayedContent(ball.id)
  }

  const removeDisplayedContent = (ballId) => {
    // 根据功能球ID移除对应的显示内容，但保留持久化数据
    const contentMap = {
      'text-features': 'textCharacteristicsForHumanUse',
      'terminology': 'terminologyIdiomsAnalysis',
      'suggestions': 'translationStrategyForHumanUse',
      'intent-analysis': 'intentAudienceAnalysisForHumanUse',
      'reference-analysis': 'referenceAnalysisForHumanUse',
      'direct-request-analysis': 'directRequestAnalysisForHumanUse'
    }
    
    const contentKey = contentMap[ballId]
    if (contentKey && displayedAnalysisData.value[contentKey]) {
      delete displayedAnalysisData.value[contentKey]
    }
    
    // 注意：不删除persistedAnalysisData中的数据，以便重新拖拽时恢复
    // 也不删除analyzedBalls中的标记，保持已分析状态
  }

  // 接收外部移除球的指令
  const removeBallById = (ballId) => {
    selectedBalls.value = selectedBalls.value.filter(b => b.id !== ballId)
    removeDisplayedContent(ballId)
  }

  // 暴露方法给父组件
  defineExpose({
    removeBallById,
    clearAllAnalysisState
  })
  
  const handleAnalyze = () => {
    if (!canAnalyze.value) return
    
    // 只分析未分析过的功能球
    const unanalyzedBalls = selectedBalls.value.filter(ball => !analyzedBalls.value.has(ball.id))
    
    if (unanalyzedBalls.length === 0) {
      ElMessage.info('所有功能球已经分析过了')
      return
    }

    // 标记正在分析的功能球
    unanalyzedBalls.forEach(ball => {
      pendingBalls.value.add(ball.id)
    })

    // 初始化分析进度
    if (shouldUseGroupedAnalysis.value) {
      const totalGroups = Math.ceil(unanalyzedBalls.length / groupSize.value)
      analysisProgress.value = {
        isGrouped: true,
        totalGroups,
        completedGroups: 0,
        currentGroupBalls: []
      }
    } else {
      analysisProgress.value = {
        isGrouped: false,
        totalGroups: 1,
        completedGroups: 0,
        currentGroupBalls: []
      }
    }

    // 分析完成后的回调
    const onAnalysisComplete = (analyzedBallIds) => {
      analyzedBallIds.forEach(ballId => {
        analyzedBalls.value.add(ballId)
        pendingBalls.value.delete(ballId)
      })
    }

    // 根据是否使用分组分析选择不同的处理方式
    if (shouldUseGroupedAnalysis.value) {
      emit('analyze-grouped', {
        balls: unanalyzedBalls,
        groupSize: groupSize.value,
        onProgress: handleGroupedAnalysisProgress,
        onComplete: onAnalysisComplete
      })
    } else {
      emit('analyze', unanalyzedBalls, onAnalysisComplete)
    }
  }

  // 处理分组分析进度
  const handleGroupedAnalysisProgress = (progressData) => {
    console.log('分组分析进度:', progressData)
    
    try {
      switch (progressData.type) {
        case 'start':
          ElMessage.info(`开始分组分析，共${progressData.totalGroups}组`)
          break
          
        case 'group_start':
          analysisProgress.value.currentGroupBalls = progressData.ballIds || []
          ElMessage.info(`开始分析第${progressData.groupIndex}组`)
          break
          
        case 'group_complete':
          analysisProgress.value.completedGroups = progressData.completedGroups || 0
          
          // 清空当前组的球列表，表示分析完成
          analysisProgress.value.currentGroupBalls = []
          
          // 立即显示这一组的分析结果 - 增强实时显示
          if (progressData.data || progressData.originalData) {
            console.log(`🎉 第${progressData.groupIndex}组分析完成，立即更新显示:`, progressData)
            
            // 直接传递完整的progressData对象，包含data和originalData
            const dataToMerge = {
              data: progressData.data,
              originalData: progressData.originalData
            }
            mergeAnalysisData(dataToMerge)
            
            // 标记这一组的功能球为已分析
            if (progressData.ballIds && Array.isArray(progressData.ballIds)) {
              progressData.ballIds.forEach(ballId => {
                analyzedBalls.value.add(ballId)
                pendingBalls.value.delete(ballId)
                console.log(`✅ 标记功能球 ${ballId} 为已分析`)
              })
            }
            
            ElMessage.success(`第${progressData.groupIndex}组分析完成，包含 ${progressData.ballIds?.length || 0} 个功能球`)
          } else {
            console.warn(`⚠️ 第${progressData.groupIndex}组分析完成但无数据`)
          }
          break
          
        case 'group_error':
          ElMessage.error(`第${progressData.groupIndex}组分析失败: ${progressData.error}`)
          
          // 移除失败组的pending状态
          if (progressData.ballIds && Array.isArray(progressData.ballIds)) {
            progressData.ballIds.forEach(ballId => {
              pendingBalls.value.delete(ballId)
            })
          }
          break
          
        case 'complete':
          analysisProgress.value.completedGroups = progressData.totalGroups || analysisProgress.value.totalGroups
          ElMessage.success(`所有分组分析完成！成功${progressData.completedGroups || 0}组，失败${progressData.failedGroups || 0}组`)
          
          // 重置进度
          analysisProgress.value = {
            isGrouped: false,
            totalGroups: 0,
            completedGroups: 0,
            currentGroupBalls: []
          }
          break
          
        case 'error':
          ElMessage.error(`分组分析失败: ${progressData.message || '未知错误'}`)
          
          // 清理所有pending状态
          pendingBalls.value.clear()
          
          // 重置进度
          analysisProgress.value = {
            isGrouped: false,
            totalGroups: 0,
            completedGroups: 0,
            currentGroupBalls: []
          }
          break
          
        default:
          console.warn('⚠️ 未知的进度数据类型:', progressData.type)
      }
    } catch (error) {
      console.error('❌ 处理分组分析进度失败:', error)
      ElMessage.error('处理分析进度时发生错误')
    }
  }
  
  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString('zh-CN')
  }
  </script>
  
  <style scoped>
  .analysis-panel {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    -webkit-backdrop-filter: var(--glass-backdrop);
    border-radius: var(--radius-lg);
    border: 1px solid var(--glass-border);
    padding: 20px;
    box-shadow: var(--shadow-soft);
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 100%;
    transition: var(--transition-smooth);
    position: relative;
  }
  
  /* 🏜️ 分析面板沙漠装饰 */
  .analysis-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 15% 85%, var(--geometric-pattern) 0%, transparent 60%),
      linear-gradient(135deg, transparent 0%, var(--sand-texture) 30%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    opacity: 0.3;
  }
  
  .analysis-panel:hover {
    box-shadow: var(--shadow-medium);
    border-color: var(--desert-oasis-green);
  }
  
  .analysis-panel h3 {
    color: var(--deep-blue, #2c3e50) !important;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 24px;
    text-align: center;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
    position: relative;
    z-index: 2;
  }
  
  /* 🌟 标题星光簇装饰 */
  .analysis-panel h3 {
    position: relative;
  }
  
  .analysis-panel h3::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background: var(--desert-oasis-green);
    border-radius: 50%;
    box-shadow: 
      -15px -3px 0 1px var(--sky-horizon-blue),
      15px -5px 0 0px var(--twilight-purple),
      -10px 8px 0 1px var(--desert-sand-gold),
      12px 6px 0 0px var(--desert-oasis-green);
    animation: twinkle 4s ease-in-out infinite alternate;
    z-index: 1;
  }
  
  .analysis-panel h3::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: var(--bg-gradient-warm);
    border-radius: 2px;
    z-index: 1;
  }
  
  .ball-drop-zone {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(232, 216, 176, 0.1));
    border: 2px dashed var(--sky-horizon-blue);
    border-radius: var(--radius-lg);
    padding: 20px;
    margin-bottom: 20px;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 1;
  }
  
  .ball-drop-zone::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, var(--geometric-pattern) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, var(--sand-texture) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  .ball-drop-zone.has-balls {
    border-style: solid;
    border-color: var(--desert-oasis-green);
    background: linear-gradient(135deg, var(--geometric-pattern), rgba(255, 255, 255, 0.2));
    box-shadow: var(--shadow-soft);
  }
  
  .drop-hint {
    color: var(--deep-blue, #2c3e50) !important;
    font-size: 15px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  }
  
  .drop-hint::before {
    content: '🎯';
    font-size: 20px;
  }
  
  .selected-balls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    position: relative;
    z-index: 1;
  }
  
  .selected-ball {
    background: var(--bg-gradient-card);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: var(--radius-md);
    border: 1px solid var(--glass-border);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--deep-blue, #2c3e50) !important;
    box-shadow: var(--shadow-soft);
    position: relative;
    transition: var(--transition-smooth);
    font-weight: 600;
  }
  
  .selected-ball span {
    color: var(--deep-blue, #2c3e50) !important;
  }
  
  .selected-ball:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-medium);
    border-color: rgba(255, 255, 255, 0.4);
  }
  
  .selected-ball.analyzed {
    background: linear-gradient(135deg, rgba(46, 125, 50, 0.1), rgba(255, 255, 255, 0.3));
    border-color: rgba(46, 125, 50, 0.3);
    animation: success-glow 2s infinite alternate;
  }
  
  .selected-ball.pending {
    background: linear-gradient(135deg, rgba(254, 215, 170, 0.2), rgba(255, 255, 255, 0.3));
    border-color: rgba(254, 215, 170, 0.5);
    animation: pending-pulse 1.5s infinite;
  }
  
  @keyframes success-glow {
    from {
      box-shadow: var(--shadow-soft), 0 0 0 0 rgba(46, 125, 50, 0.3);
    }
    to {
      box-shadow: var(--shadow-medium), 0 0 0 4px rgba(46, 125, 50, 0.1);
    }
  }
  
  @keyframes pending-pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.02);
      opacity: 0.9;
    }
  }
  
  .ball-status {
    display: flex;
    align-items: center;
    margin-left: 4px;
  }
  
  .status-icon {
    font-size: 16px;
  }
  
  .analyzed-icon {
    color: #2E7D32 !important;
    animation: check-bounce 0.6s ease-out;
  }
  
  .pending-icon {
    color: #F57C00 !important;
    animation: spin 2s linear infinite;
  }
  
  @keyframes check-bounce {
    0% { transform: scale(0); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .analyze-btn {
    width: 100%;
    margin-bottom: 24px;
    position: relative;
    overflow: hidden;
  }
  
  .analyze-btn:hover:not(:disabled) {
    animation: oasis-ripple 2s ease-out;
  }
  
  .analyze-btn.is-loading {
    opacity: 0.8;
  }
  
  .analysis-section {
    margin-bottom: 20px;
    animation: slideUpFade 0.6s ease-out;
  }
  
  .feature-card {
    background: linear-gradient(135deg, rgba(46, 125, 50, 0.08), rgba(255, 255, 255, 0.3));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(46, 125, 50, 0.2);
    padding: 18px;
    border-left: 4px solid #2E7D32;
    box-shadow: var(--shadow-soft);
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
  }
  
  .feature-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
    border-left-color: #4CAF50;
  }
  
  .feature-card p, .feature-card strong {
    color: var(--deep-blue, #2c3e50) !important;
  }
  
  .terminology-card {
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.08), rgba(255, 255, 255, 0.3));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(52, 152, 219, 0.2);
    padding: 18px;
    border-left: 4px solid var(--soft-blue);
    box-shadow: var(--shadow-soft);
    transition: var(--transition-smooth);
    position: relative;
    overflow: hidden;
  }
  
  .terminology-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
    border-left-color: #66B1FF;
  }
  
  .terminology-card p, .terminology-card strong {
    color: var(--deep-blue, #2c3e50) !important;
  }
  
  .term-analysis {
    margin-bottom: 16px;
    padding: 12px;
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.05), rgba(255, 255, 255, 0.4));
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border-radius: var(--radius-md);
    border: 1px solid rgba(52, 152, 219, 0.1);
    transition: var(--transition-smooth);
  }
  
  .term-analysis:hover {
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.08), rgba(255, 255, 255, 0.5));
    border-color: rgba(52, 152, 219, 0.2);
  }
  
  .term-title {
    font-weight: 700;
    color: var(--deep-blue, #2c3e50) !important;
    margin-bottom: 6px;
    font-size: 14px;
  }
  
  .term-content {
    color: var(--deep-blue, #2c3e50) !important;
    line-height: 1.6;
    font-size: 13px;
    opacity: 0.9;
  }
  
  .suggestions-card {
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.08), rgba(255, 255, 255, 0.3));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(52, 152, 219, 0.2);
    padding: 18px;
    border-left: 4px solid #1976D2;
    box-shadow: var(--shadow-soft);
    transition: var(--transition-smooth);
  }
  
  .suggestions-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }
  
  .suggestions-card p, .suggestions-card strong {
    color: var(--deep-blue, #2c3e50) !important;
  }
  
  .intent-card {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.08), rgba(255, 255, 255, 0.3));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(76, 175, 80, 0.2);
    padding: 18px;
    border-left: 4px solid #4CAF50;
    box-shadow: var(--shadow-soft);
    transition: var(--transition-smooth);
  }
  
  .intent-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }
  
  .intent-card p, .intent-card strong {
    color: var(--deep-blue, #2c3e50) !important;
  }
  
  .reference-card {
    background: linear-gradient(135deg, rgba(156, 39, 176, 0.08), rgba(255, 255, 255, 0.3));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(156, 39, 176, 0.2);
    padding: 18px;
    border-left: 4px solid #9C27B0;
    box-shadow: var(--shadow-soft);
    transition: var(--transition-smooth);
  }
  
  .reference-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }
  
  .reference-card p, .reference-card strong {
    color: var(--deep-blue, #2c3e50) !important;
  }
  
  .instruction-card {
    background: linear-gradient(135deg, rgba(0, 188, 212, 0.08), rgba(255, 255, 255, 0.3));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(0, 188, 212, 0.2);
    padding: 18px;
    border-left: 4px solid #00BCD4;
    box-shadow: var(--shadow-soft);
    transition: var(--transition-smooth);
  }
  
  .instruction-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }
  
  .instruction-card p, .instruction-card strong {
    color: var(--deep-blue, #2c3e50) !important;
  }
  
  .feature-content,
  .suggestion-content,
  .intent-content,
  .reference-content,
  .instruction-content {
    color: var(--deep-blue, #2c3e50) !important;
    margin: 12px 0 0 0;
    line-height: 1.6;
    font-size: 14px;
    opacity: 0.9;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 8px 12px;
    border-radius: var(--radius-md);
    font-weight: 500;
  }
  
  .timestamp {
    color: rgba(44, 62, 80, 0.6) !important;
    font-size: 12px;
    margin: 12px 0 0 0;
    font-style: italic;
  }
  
  .empty-state {
    text-align: center;
    color: var(--deep-blue, #2c3e50) !important;
    padding: 60px 20px;
    font-size: 15px;
    position: relative;
  }
  
  .empty-state::before {
    content: '📋';
    display: block;
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
  }
  
  .remove-ball {
    font-size: 16px;
    color: rgba(44, 62, 80, 0.5) !important;
    cursor: pointer;
    margin-left: 6px;
    transition: var(--transition-smooth);
    border-radius: var(--radius-round);
    padding: 2px;
  }
  
  .remove-ball:hover {
    color: #F56C6C !important;
    transform: scale(1.2);
    background: rgba(245, 108, 108, 0.1);
  }
  
  .group-settings {
    margin-bottom: 24px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: var(--radius-md);
    border: 1px solid var(--glass-border);
  }
  
  .group-switch {
    margin-right: 12px;
  }
  
  .group-size-selector {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .group-size-label {
    font-size: 14px;
    color: var(--deep-blue, #2c3e50) !important;
    font-weight: 600;
  }
  
  .analysis-progress {
    margin-bottom: 24px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(46, 125, 50, 0.05), rgba(255, 255, 255, 0.3));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(46, 125, 50, 0.2);
    box-shadow: var(--shadow-soft);
    animation: progress-glow 3s infinite alternate;
  }
  
  @keyframes progress-glow {
    from {
      box-shadow: var(--shadow-soft);
    }
    to {
      box-shadow: var(--shadow-medium), 0 0 0 2px rgba(46, 125, 50, 0.1);
    }
  }
  
  .progress-info {
    margin-bottom: 12px;
    font-size: 14px;
    color: var(--deep-blue, #2c3e50) !important;
    font-weight: 600;
  }
  
  .progress-bar {
    width: 100%;
    margin-bottom: 12px;
  }
  
  .current-group {
    margin-top: 12px;
  }
  
  .current-group-label {
    font-weight: 700;
    margin-right: 12px;
    color: var(--deep-blue, #2c3e50) !important;
  }
  
  .current-ball-tag {
    margin-left: 6px;
  }
  
  /* 玻璃卡片装饰元素 */
  .feature-card::before,
  .terminology-card::before,
  .suggestions-card::before,
  .intent-card::before,
  .reference-card::before,
  .instruction-card::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 40px;
    height: 40px;
    background: 
      radial-gradient(circle at 50% 50%, transparent 30%, currentColor 31%, currentColor 32%, transparent 33%);
    opacity: 0.05;
    pointer-events: none;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .analysis-panel {
      padding: 16px;
      border-radius: var(--radius-md);
    }
    
    .analysis-panel h3 {
      font-size: 18px;
      margin-bottom: 16px;
    }
    
    .ball-drop-zone {
      padding: 16px;
      min-height: 100px;
    }
    
    .selected-balls {
      gap: 8px;
    }
    
    .selected-ball {
      padding: 8px 12px;
      font-size: 12px;
    }
    
    .feature-card,
    .terminology-card,
    .suggestions-card,
    .intent-card,
    .reference-card,
    .instruction-card {
      padding: 14px;
    }
  }
  
  /* 自定义滚动条 */
  .analysis-panel::-webkit-scrollbar {
    width: 6px;
  }
  
  .analysis-panel::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  .analysis-panel::-webkit-scrollbar-thumb {
    background: var(--soft-blue, #3498db);
    border-radius: 3px;
    transition: var(--transition-smooth);
  }
  
  .analysis-panel::-webkit-scrollbar-thumb:hover {
    background: var(--deep-blue, #2c3e50);
  }
  </style>

