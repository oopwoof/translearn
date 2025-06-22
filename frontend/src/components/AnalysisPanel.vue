<template>
    <div class="analysis-panel">
      <h3>翻译分析</h3>
      
      <!-- 功能球存放区 -->
      <div class="ball-drop-zone" 
           @dragover.prevent
           @drop.prevent="handleDrop"
           :class="{ 
             'has-balls': selectedBalls.length > 0,
             'show-breath-hint': showAnalysisHint && selectedBalls.length === 0 && !hasAnyDisplayedContent && props.currentText && props.currentText.trim().length > 0
           }"
      >
        <div v-if="selectedBalls.length === 0" class="drop-hint">
          拖拽功能球到这里
        </div>
        
        <!-- 呼吸提示动画 -->
        <div v-if="showAnalysisHint && selectedBalls.length === 0 && !hasAnyDisplayedContent && props.currentText && props.currentText.trim().length > 0" class="breath-hint-overlay">
          <div class="breath-hint-text">拖拽功能球开始分析</div>
        </div>
        <div v-else class="selected-balls">
          <div v-for="ball in selectedBalls" 
               :key="ball.id" 
               class="selected-ball"
               :class="{ 'analyzed': isAnalyzed(ball.id), 'pending': isPending(ball.id) }"
          >
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
    },
    showAnalysisHint: {
      type: Boolean,
      default: false
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
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 15px;
  box-shadow: 
    0 8px 32px var(--shadow-light),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(34, 139, 34, 0.3); /* 使用森林绿 */
  height: fit-content;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  font-size: 13px;
  color: var(--text-dark);
  position: relative;
}
  
  /* 添加顶部装饰线条 */
  .analysis-panel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 15px;
    right: 15px;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      var(--forest-green) 30%, 
      var(--deep-green) 50%, 
      var(--forest-green) 70%, 
      transparent 100%);
    opacity: 0.7;
    border-radius: 0 0 2px 2px;
  }
  
  /* 添加侧边装饰线条 */
  .analysis-panel::after {
    content: '';
    position: absolute;
    left: 0;
    top: 20px;
    bottom: 20px;
    width: 3px;
    background: linear-gradient(180deg, 
      transparent 0%, 
      rgba(34, 139, 34, 0.6) 30%, /* 使用森林绿 */
      rgba(0, 100, 0, 0.8) 50%, /* 使用深绿色 */
      rgba(34, 139, 34, 0.6) 70%, /* 使用森林绿 */
      transparent 100%);
    border-radius: 0 3px 3px 0;
  }

  .analysis-panel h3 {
    margin: 0 0 15px 0;
    color: var(--text-dark);
    font-size: 16px;
    font-weight: 700;
    position: relative;
    padding-left: 10px;
  }

  /* 确保统一背景标题的显示效果 */
  .analysis-panel h3.unified-title-bg {
    margin: -15px -15px 15px -15px;
    padding: 15px;
    border-radius: 20px 20px 8px 8px;
  }
  
  /* 为标题添加装饰线条 */
  .analysis-panel h3::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background: var(--forest-green);
    border-radius: 2px;
  }
  
  .ball-drop-zone {
    background: rgba(240, 248, 240, 0.1);
    backdrop-filter: blur(10px);
    border: 2px dashed rgba(34, 139, 34, 0.6); /* 使用森林绿 */
    border-radius: 20px;
    padding: 12px;
    margin-bottom: 12px;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    position: relative;
  }
  
  /* 为拖拽区添加角落装饰 */
  .ball-drop-zone::before,
  .ball-drop-zone::after {
    content: '';
    position: absolute;
    width: 15px;
    height: 15px;
    border: 2px solid var(--forest-green);
    opacity: 0.6;
  }

  .ball-drop-zone::before {
    top: 5px;
    left: 5px;
    border-right: none;
    border-bottom: none;
  }

  .ball-drop-zone::after {
    bottom: 5px;
    right: 5px;
    border-left: none;
    border-top: none;
  }

  .ball-drop-zone.has-balls {
    border-style: solid;
    border-color: var(--forest-green);
    background: rgba(34, 139, 34, 0.08); /* 使用森林绿 */
    backdrop-filter: blur(15px);
  }
  
  .drop-hint {
    color: var(--text-light);
    font-size: 12px;
    font-style: italic;
  }
  
  .selected-balls {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .selected-ball {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 4px 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--text-dark);
    box-shadow: 
      0 4px 12px var(--shadow-light),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(34, 139, 34, 0.2); /* 使用森林绿 */
    position: relative;
    transition: all 0.3s ease;
    min-height: 24px;
  }

  .selected-ball.analyzed {
    background: rgba(34, 139, 34, 0.1); /* 使用森林绿 */
    border: 1px solid var(--forest-green);
    color: var(--text-dark);
    font-weight: 600;
    box-shadow: 
      0 4px 12px rgba(34, 139, 34, 0.3), /* 使用森林绿 */
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .selected-ball.pending {
    background: rgba(255, 193, 7, 0.15);
    border: 1px solid #ffc107;
    color: #ff8f00;
  }

  .ball-status {
    display: flex;
    align-items: center;
    margin-left: 2px;
  }

  .status-icon {
    font-size: 12px;
  }

  .analyzed-icon {
    color: var(--forest-green);
  }

  .pending-icon {
    color: #ff8f00;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .analyze-btn {
    width: 100%;
    margin-bottom: 15px;
  }
  
  .analyze-btn.is-loading {
    opacity: 0.8;
  }
  
  .analysis-section {
    margin-bottom: 12px;
  }
  
  .feature-card,
  .terminology-card,
  .suggestions-card,
  .intent-card,
  .reference-card,
  .instruction-card {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(15px);
    border-radius: 15px;
    padding: 10px;
    border-left: 3px solid var(--forest-green); /* 主要使用森林绿 */
    border: 1px solid rgba(34, 139, 34, 0.2); /* 使用森林绿 */
    box-shadow: 
      0 4px 16px var(--shadow-light),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    position: relative;
  }

  /* 为卡片添加右侧装饰线条 */
  .feature-card::after,
  .terminology-card::after,
  .suggestions-card::after,
  .intent-card::after,
  .reference-card::after,
  .instruction-card::after {
    content: '';
    position: absolute;
    right: 0;
    top: 10px;
    bottom: 10px;
    width: 1px;
    background: linear-gradient(180deg, 
      transparent 0%, 
      rgba(34, 139, 34, 0.3) 50%, /* 使用森林绿 */
      transparent 100%);
  }

  .feature-card:hover,
  .terminology-card:hover,
  .suggestions-card:hover,
  .intent-card:hover,
  .reference-card:hover,
  .instruction-card:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px var(--shadow-medium),
      inset 0 2px 0 rgba(255, 255, 255, 0.2);
    border-color: var(--forest-green);
  }

  .terminology-card {
    border-left-color: var(--deep-green);
  }

  .suggestions-card {
    background: rgba(34, 139, 34, 0.03); /* 使用森林绿 */
    border-left-color: var(--accent-emerald);
    /* 金色小点缀 */
  }

  .suggestions-card::before {
    content: '';
    position: absolute;
    top: 5px;
    right: 5px;
    width: 4px;
    height: 4px;
    background: var(--desert-gold);
    border-radius: 50%;
    opacity: 0.7;
  }

  .term-analysis {
    margin-bottom: 8px;
    padding: 6px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(5px);
    border-radius: 12px;
    border: 1px solid var(--glass-border);
  }

  .term-title {
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 3px;
    font-size: 12px;
  }

  .term-content {
    color: var(--text-medium);
    line-height: 1.4;
    font-size: 11px;
  }

  .feature-content,
  .suggestion-content,
  .intent-content,
  .reference-content,
  .instruction-content {
    color: var(--text-medium);
    margin: 6px 0 0 0;
    line-height: 1.4;
    font-size: 12px;
  }

  .timestamp {
    color: var(--text-light);
    font-size: 10px;
    margin: 6px 0 0 0;
    font-style: italic;
  }
  
  .empty-state {
    text-align: center;
    color: var(--text-light);
    padding: 30px 15px;
    font-size: 12px;
    font-style: italic;
  }
  
  .remove-ball {
    font-size: 12px;
    color: var(--text-light);
    cursor: pointer;
    margin-left: 3px;
    transition: all 0.3s ease;
  }
  
  .remove-ball:hover {
    color: #f44336;
    transform: scale(1.2);
  }

  .group-settings {
    margin-bottom: 15px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    border: 1px solid var(--glass-border);
  }

  .group-switch {
    margin-right: 8px;
  }

  .group-size-selector {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .group-size-label {
    font-size: 12px;
    color: var(--text-medium);
    font-weight: 500;
  }

  .analysis-progress {
    margin-bottom: 15px;
    padding: 12px;
    background: rgba(248, 250, 252, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    border: 1px solid var(--glass-border);
    box-shadow: 0 4px 16px var(--shadow-light);
  }

  .progress-info {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--text-medium);
    font-weight: 500;
  }

  .progress-bar {
    width: 100%;
    margin-bottom: 8px;
  }

  .current-group {
    margin-top: 8px;
  }

  .current-group-label {
    font-weight: 600;
    margin-right: 8px;
    font-size: 12px;
    color: var(--text-dark);
  }

  .current-ball-tag {
    margin-left: 4px;
  }

  /* 调整Element Plus组件的样式 */
  .analysis-panel :deep(.el-button) {
    font-size: 12px;
    background: linear-gradient(135deg, var(--forest-green) 0%, var(--accent-emerald) 100%);
    border: none;
    border-radius: 20px;
    color: black;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(34, 139, 34, 0.3); /* 使用森林绿 */
  }

  .analysis-panel :deep(.el-button:hover) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(34, 139, 34, 0.4); /* 使用森林绿 */
  }

  .analysis-panel :deep(.el-switch__label) {
    font-size: 11px;
    color: var(--text-medium);
  }

  .analysis-panel :deep(.el-radio-button__inner) {
    font-size: 11px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.3);
    border: 1px solid var(--glass-border);
    color: var(--text-dark);
  }

  .analysis-panel :deep(.el-radio-button__original:checked + .el-radio-button__inner) {
    background: var(--forest-green);
    border-color: var(--forest-green);
    color: white;
  }

  .analysis-panel :deep(.el-tag) {
    font-size: 10px;
    background: rgba(34, 139, 34, 0.1); /* 使用森林绿 */
    border-color: var(--forest-green);
    color: var(--text-dark);
  }

  .analysis-panel :deep(.el-progress-bar__outer) {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
  }

  .analysis-panel :deep(.el-progress-bar__inner) {
    background: linear-gradient(135deg, var(--forest-green) 0%, var(--accent-emerald) 100%);
    border-radius: 10px;
  }

  /* 拖拽区域呼吸提示动画 */
  .ball-drop-zone.show-breath-hint {
    animation: breatheDropZone 3s ease-in-out infinite;
  }

  .breath-hint-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    pointer-events: none;
  }

  .breath-hint-text {
    color: white;
    font-size: 12px;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    background: rgba(34, 139, 34, 0.85);
    padding: 8px 16px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(34, 139, 34, 0.3);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(34, 139, 34, 0.7);
    opacity: 0.9;
  }

  @keyframes breatheDropZone {
    0%, 100% { 
      background: rgba(240, 248, 240, 0.1);
      border-color: rgba(34, 139, 34, 0.6);
      transform: scale(1);
    }
    50% { 
      background: rgba(34, 139, 34, 0.2);
      border-color: rgba(34, 139, 34, 0.8);
      transform: scale(1.02);
    }
  }
  </style>

