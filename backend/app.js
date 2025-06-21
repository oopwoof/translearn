const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const app = express()

// 创建日志目录
const logDir = path.join(__dirname, 'logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 日志函数
function logToFile(level, message, data = null) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    message,
    data
  }
  
  const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`)
  const logLine = JSON.stringify(logEntry) + '\n'
  
  fs.appendFileSync(logFile, logLine)
  
  // 同时输出到控制台
  const consoleMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`
  
  if (data) {
    // 检查是否包含时间信息，如果有则突出显示
    if (data.duration || data.groupDuration || data.step1Duration || data.step2Duration || data.totalDuration) {
      let timeInfo = ''
      if (data.duration) timeInfo += ` ⏱️ 耗时: ${data.duration}`
      if (data.groupDuration) timeInfo += ` ⏱️ 组耗时: ${data.groupDuration}`
      if (data.step1Duration) timeInfo += ` ⏱️ 步骤1: ${data.step1Duration}`
      if (data.step2Duration) timeInfo += ` ⏱️ 步骤2: ${data.step2Duration}`
      if (data.totalDuration) timeInfo += ` ⏱️ 总耗时: ${data.totalDuration}`
      
      console.log(consoleMessage + timeInfo)
      
      // 如果有其他重要信息，也显示出来
      const otherData = { ...data }
      delete otherData.duration
      delete otherData.groupDuration
      delete otherData.step1Duration
      delete otherData.step2Duration
      delete otherData.totalDuration
      delete otherData.startTime
      delete otherData.endTime
      delete otherData.groupStartTime
      delete otherData.groupEndTime
      
      if (Object.keys(otherData).length > 0) {
        console.log('  📊 其他信息:', otherData)
      }
    } else {
      console.log(consoleMessage, data)
    }
  } else {
    console.log(consoleMessage)
  }
}

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    logToFile('info', `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`)
  })
  
  next()
})

// 错误日志中间件
app.use((err, req, res, next) => {
  logToFile('error', `Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method
  })
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  })
})

// 导出日志函数供其他模块使用
global.logToFile = logToFile

// 中间件
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 记录所有API请求的输入内容和输出内容
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    global.logToFile('info', 'API请求输入', {
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query
    });

    // monkey patch res.json 记录输出
    const oldJson = res.json;
    res.json = function (data) {
      global.logToFile('info', 'API请求输出', {
        path: req.path,
        output: data
      });
      return oldJson.call(this, data);
    };
  }
  next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, '../frontend/dist')))

// API路由
app.use('/api/translate', require('./routes/translate'))

// 健康检查
app.get('/api/health', (req, res) => {
  logToFile('info', 'Health check requested')
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 日志查看接口
app.get('/api/logs', (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0]
    const logFile = path.join(logDir, `${date}.log`)
    
    if (fs.existsSync(logFile)) {
      const logs = fs.readFileSync(logFile, 'utf8')
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .reverse() // 最新的日志在前面
      
      res.json({
        success: true,
        data: logs
      })
    } else {
      res.json({
        success: true,
        data: []
      })
    }
  } catch (error) {
    logToFile('error', 'Failed to read logs', error.message)
    res.status(500).json({
      success: false,
      message: '读取日志失败'
    })
  }
})

// SPA路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  logToFile('info', `🚀 服务器运行在 http://localhost:${PORT}`)
  logToFile('info', `📝 API文档: http://localhost:${PORT}/api/health`)
  logToFile('info', `📋 日志查看: http://localhost:${PORT}/api/logs`)
})

module.exports = app
