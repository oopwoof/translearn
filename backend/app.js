const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()

// 中间件
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 静态文件服务
app.use(express.static(path.join(__dirname, '../frontend/dist')))

// API路由
app.use('/api/translate', require('./routes/translate'))

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// SPA路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
  console.log(`📝 API文档: http://localhost:${PORT}/api/health`)
})

module.exports = app
