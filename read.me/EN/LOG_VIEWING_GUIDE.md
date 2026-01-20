# Backend Log Viewing Guide

## 📋 Methods for Viewing Logs

### Method 1: View via API Interface (Recommended)

Access the log viewing interface:
```
http://localhost:3000/api/logs
```

**Parameter Description**:
- `date`: Optional, specify the date to view, format: `YYYY-MM-DD`
- Default: View today's logs

**Examples**:
```
http://localhost:3000/api/logs                    # View today's logs
http://localhost:3000/api/logs?date=2024-01-15    # View logs for specified date
```

**Return Format**:
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-01-15T10:30:00.000Z",
      "level": "info",
      "message": "Starting translation",
      "data": {
        "text": "Hello, world!...",
        "mode": "zh-ar",
        "quality": "standard"
      }
    }
  ]
}
```

### Method 2: View Log Files

Log files are saved in the `backend/logs/` directory, named by date:
```
backend/logs/2024-01-15.log
```

**Log File Format**:
Each line is a JSON object, containing:
- `timestamp`: Timestamp
- `level`: Log level (info, error, warn)
- `message`: Log message
- `data`: Additional data (optional)

### Method 3: Console Output

If the server is started via `npm run dev`, logs will also be output to the console.

## 🔍 Log Level Description

### INFO (Information)
- Server startup information
- Translation request start and completion
- API call records
- Health check requests

### ERROR (Error)
- Translation failures
- API call errors
- File read errors
- Other system errors

### WARN (Warning)
- Non-fatal warning messages

## 📊 Translation Log Details

### Standard Mode Two-Step Translation Logs

```
1. Starting translation
   - Text content (first 50 characters)
   - Translation mode (zh-ar/ar-zh)
   - Quality level (standard)

2. Using two-step translation processing
   - Indicates use of two-step processing

3. Step 1: Starting translation analysis and strategy
   - Starting analysis phase

4. Analysis response
   - Claude API analysis response (first 200 characters)

5. Step 2: Starting actual translation
   - Starting translation phase

6. Translation response
   - Claude API translation response (first 200 characters)

7. Translation completed
   - Translation result (first 50 characters)
```

### Fast/Premium Mode Logs

```
1. Starting translation
   - Text content (first 50 characters)
   - Translation mode (zh-ar/ar-zh)
   - Quality level (fast/premium)

2. Using single-step translation processing
   - Indicates use of single-step processing

3. Claude response
   - Complete Claude API response (first 200 characters)

4. Translation completed
   - Translation result (first 50 characters)
```

## 🛠️ Debugging Tips

### 1. View Specific Type of Logs

Using browser developer tools or Postman:
```javascript
// View all translation-related logs
fetch('/api/logs')
  .then(res => res.json())
  .then(data => {
    const translationLogs = data.data.filter(log => 
      log.message.includes('translation')
    )
    console.log(translationLogs)
  })
```

### 2. View Error Logs

```javascript
// View all error logs
fetch('/api/logs')
  .then(res => res.json())
  .then(data => {
    const errorLogs = data.data.filter(log => 
      log.level === 'error'
    )
    console.log(errorLogs)
  })
```

### 3. View Logs for Specific Time

```javascript
// View logs from the last hour
fetch('/api/logs')
  .then(res => res.json())
  .then(data => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentLogs = data.data.filter(log => 
      new Date(log.timestamp) > oneHourAgo
    )
    console.log(recentLogs)
  })
```

## 📈 Performance Monitoring

### Request Response Time

Logs include response time for each request:
```
POST /api/translate/claude - 200 - 2500ms
```

### Translation Quality Analysis

Through logs, you can analyze:
- Translation time for different quality levels
- Performance differences between two-step translation vs single-step translation
- Error rate and failure reasons

## 🔧 Log Configuration

### Modify Log Level

Modify the log function in `backend/app.js`:
```javascript
function logToFile(level, message, data = null) {
  // Can add log level filtering
  if (level === 'debug' && process.env.NODE_ENV === 'production') {
    return // Don't record debug logs in production environment
  }
  // ... other code
}
```

### Log Rotation

Log files are automatically split by day, you can add log cleanup functionality:
```javascript
// Clean up log files older than 7 days
function cleanupOldLogs() {
  const logDir = path.join(__dirname, 'logs')
  const files = fs.readdirSync(logDir)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  files.forEach(file => {
    const filePath = path.join(logDir, file)
    const stats = fs.statSync(filePath)
    if (stats.mtime < sevenDaysAgo) {
      fs.unlinkSync(filePath)
    }
  })
}
```

## 🚀 Quick Start

1. **Start Server**:
   ```bash
   npm run dev
   ```

2. **View Real-time Logs**:
   - Open browser and visit `http://localhost:3000/api/logs`
   - Or view console output

3. **Test Translation Function**:
   - Perform translation operations in the frontend
   - Observe log records

4. **Analyze Logs**:
   - View translation process
   - Monitor performance metrics
   - Troubleshoot errors

## 📝 Notes

1. **Log File Size**: Log files will grow over time, recommend regular cleanup
2. **Sensitive Information**: Logs may contain translation content, pay attention to privacy protection
3. **Performance Impact**: Logging will slightly affect performance, consider asynchronous writing in production environment
4. **Storage Space**: Ensure sufficient disk space for storing log files

