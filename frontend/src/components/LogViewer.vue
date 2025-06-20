<template>
  <div class="log-viewer">
    <div class="log-header">
      <h3>后端日志查看器</h3>
      <div class="log-controls">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="loadLogs"
        />
        <el-button 
          type="primary" 
          @click="loadLogs"
          :loading="loading"
        >
          刷新日志
        </el-button>
        <el-button @click="clearLogs">
          清空日志
        </el-button>
      </div>
    </div>

    <div class="log-content">
      <div v-if="loading" class="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        加载中...
      </div>
      
      <div v-else-if="logs.length === 0" class="empty-logs">
        暂无日志数据
      </div>
      
      <div v-else class="log-list">
        <div 
          v-for="(log, index) in logs" 
          :key="index"
          class="log-item"
          :class="`log-${log.level}`"
        >
          <div class="log-timestamp">
            {{ formatTime(log.timestamp) }}
          </div>
          <div class="log-level" :class="`level-${log.level}`">
            {{ log.level.toUpperCase() }}
          </div>
          <div class="log-message">
            {{ log.message }}
          </div>
          <div v-if="log.data" class="log-data">
            <el-button 
              size="small" 
              @click="toggleData(index)"
            >
              {{ expandedData[index] ? '隐藏' : '显示' }} 详情
            </el-button>
            <div v-if="expandedData[index]" class="data-content">
              <pre>{{ JSON.stringify(log.data, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const logs = ref([])
const loading = ref(false)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const expandedData = ref({})

const loadLogs = async () => {
  loading.value = true
  try {
    const response = await fetch(`/api/logs?date=${selectedDate.value}`)
    const result = await response.json()
    
    if (result.success) {
      logs.value = result.data
      ElMessage.success('日志加载成功')
    } else {
      ElMessage.error('日志加载失败')
    }
  } catch (error) {
    console.error('加载日志失败:', error)
    ElMessage.error('日志加载失败')
  } finally {
    loading.value = false
  }
}

const clearLogs = () => {
  logs.value = []
  expandedData.value = {}
  ElMessage.success('日志已清空')
}

const toggleData = (index) => {
  expandedData.value[index] = !expandedData.value[index]
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

onMounted(() => {
  loadLogs()
})
</script>

<style scoped>
.log-viewer {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 140px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.log-header h3 {
  margin: 0;
  color: #1E3050;
  font-size: 18px;
}

.log-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.log-content {
  flex: 1;
  overflow-y: auto;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
  gap: 10px;
}

.empty-logs {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #ddd;
}

.log-item.log-info {
  border-left-color: #409eff;
  background: #f0f9ff;
}

.log-item.log-error {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.log-item.log-warn {
  border-left-color: #e6a23c;
  background: #fdf6ec;
}

.log-timestamp {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.log-level {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 6px;
}

.level-info {
  background: #409eff;
  color: white;
}

.level-error {
  background: #f56c6c;
  color: white;
}

.level-warn {
  background: #e6a23c;
  color: white;
}

.log-message {
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.log-data {
  margin-top: 8px;
}

.data-content {
  margin-top: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 8px;
}

.data-content pre {
  margin: 0;
  font-size: 12px;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
}
</style> 