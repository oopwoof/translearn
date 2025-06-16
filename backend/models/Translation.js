const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  originalText: {
    type: String,
    required: true,
    trim: true
  },
  translatedText: {
    type: String,
    required: true,
    trim: true
  },
  sourceLanguage: {
    type: String,
    required: true,
    default: 'auto'
  },
  targetLanguage: {
    type: String,
    required: true,
    default: 'zh'
  },
  model: {
    type: String,
    default: 'claude-3-sonnet'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 创建索引以提高查询性能
translationSchema.index({ createdAt: -1 });
translationSchema.index({ originalText: 'text', translatedText: 'text' });

module.exports = mongoose.model('Translation', translationSchema);
