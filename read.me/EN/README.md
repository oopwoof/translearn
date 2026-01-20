# Intelligent Translation System - Quality Grading Feature

## Feature Overview

This system implements translation workflows based on different quality levels, allowing users to select translation quality according to their needs:

### Quality Levels

1. **Fast Translation**
   - Suitable for: Daily communication, urgent processing
   - Features: Optimized generation speed, ensuring basic fidelity and fluency
   - Output: Concise translation results

2. **Standard Translation**
   - Suitable for: Business, academic, content creation
   - Features: Balance between efficiency and quality, including basic proofreading and polishing
   - Output: Detailed translation analysis, including text characteristics, terminology analysis, translation suggestions, etc.

3. **Premium Translation**
   - Suitable for: Important documents, formal occasions
   - Features: Pursuing the highest quality, focusing on cultural adaptability
   - Output: High-quality translation results (to be improved)

## Usage

### Frontend Interface

1. Select translation direction (Chinese-Arabic or Arabic-Chinese) in the translation workspace
2. Select quality level:
   - Click the "Fast" button for quick translation
   - Click the "Standard" button for standard translation
   - Click the "Premium" button for premium translation
3. Fill in translation requirements (optional):
   - Translation intent/audience
   - Reference translation style
   - Direct requirements
4. Click the "Start Translation" button

### API Calls

```javascript
// Fast translation example
const response = await fetch('/api/translate/claude', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello, world!',
    mode: 'zh-ar',
    requirements: {
      quality: 'fast',
      intent: 'Daily communication',
      reference: '',
      directRequest: ''
    }
  })
});

// Standard translation example
const response = await fetch('/api/translate/claude', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Welcome to our company',
    mode: 'zh-ar',
    requirements: {
      quality: 'standard',
      intent: 'Business communication',
      reference: 'Formal business documents',
      directRequest: 'Use formal style'
    }
  })
});
```

## Technical Implementation

### Backend Architecture

- **Workflow Selection**: Select different prompt templates based on the `quality` parameter
- **JSON Parsing**: Support structured JSON responses and traditional text responses
- **Error Handling**: Comprehensive error handling and fallback mechanisms

### Frontend Optimization

- **Visual Feedback**: Optimized color and interaction effects for quality selection buttons
- **State Management**: Using Pinia for state management
- **Responsive Design**: Adapt to different screen sizes

## Starting the Project

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Configuration

Ensure that necessary environment variables are configured in the `backend/.env` file:

```env
CLAUDE_API_KEY=your_claude_api_key
CLAUDE_BASE_URL=your_claude_base_url
```

## Testing

System functionality has been verified through comprehensive testing, including:
- Translation workflows for three quality levels
- Analysis transmission mechanism
- Frontend and backend API interfaces

## Notes

1. Ensure Claude API key is configured correctly
2. Maintain stable network connection, API calls may take a long time
3. For long text translation, it is recommended to use standard or premium mode
4. Fast mode is suitable for short text and urgent situations

