# Translation Quality Grading Feature Demo

## Feature Demo

### 1. Fast Translation Mode

**Suitable Scenarios**: Daily communication, urgent processing

**Features**:
- Optimized generation speed
- Ensure basic fidelity and fluency
- Concise output format

**Example**:
```
Original Text: "Hello, world!"
Quality: Fast
Output: Concise Arabic translation
```

### 2. Standard Mode

**Suitable Scenarios**: Business, academic, content creation

**Features**:
- Balance efficiency and quality
- Include basic proofreading and polishing
- Detailed translation analysis

**Example**:
```
Original Text: "Welcome to our company, we are committed to providing the highest quality services to our customers."
Quality: Standard
Output: 
- Translation result
- Text characteristic analysis
- Professional terminology identification
- Translation recommendations
```

### 3. Premium Mode

**Suitable Scenarios**: Important documents, formal occasions

**Features**:
- Pursue the highest quality
- Focus on cultural adaptability
- High-quality translation results

**Example**:
```
Original Text: "This is an important legal document that requires accurate translation."
Quality: Premium
Output: High-quality legal document translation
```

## Interface Operation Guide

### Step 1: Select Translation Direction
- Click "Chinese-Arabic" button for Chinese to Arabic translation
- Click "Arabic-Chinese" button for Arabic to Chinese translation

### Step 2: Select Quality Level
- **Fast**: Click "Fast" button, suitable for quick translation
- **Standard**: Click "Standard" button, suitable for formal documents
- **Premium**: Click "Premium" button, suitable for important documents

### Step 3: Fill in Translation Requirements (Optional)
- **Translation Intent/Audience**: Such as "Business partners", "Academic exchange"
- **Reference Translation Style**: Paste reference translation
- **Direct Requirements**: Such as "Preserve polite expressions", "Use formal style"

### Step 4: Start Translation
- Click "Start Translation" button
- Wait for translation to complete
- View translation results and analysis

## Visual Optimization

### Quality Selection Buttons
- Use gradient blue background
- Hover effect: Slight upward movement and shadow
- Selected state: White indicator bar at bottom
- Clear visual feedback

### Responsive Design
- Adapt to different screen sizes
- Mobile-friendly layout
- Smooth interaction experience

## Technical Features

### Backend Optimization
- Support JSON format responses
- Intelligent parsing and error handling
- Multi-workflow support

### Frontend Optimization
- State management optimization
- Comprehensive error handling
- User experience improvement

## Test Cases

### Test 1: Fast Translation Function
```bash
curl -X POST http://localhost:3000/api/translate/claude \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!",
    "mode": "zh-ar",
    "requirements": {
      "quality": "fast",
      "intent": "Daily communication",
      "reference": "",
      "directRequest": ""
    }
  }'
```

### Test 2: Standard Translation
```bash
curl -X POST http://localhost:3000/api/translate/claude \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Welcome to our company",
    "mode": "zh-ar",
    "requirements": {
      "quality": "standard",
      "intent": "Business communication",
      "reference": "Formal business document",
      "directRequest": "Use formal style"
    }
  }'
```

## Notes

1. **API Key**: Ensure Claude API key is configured correctly
2. **Network Connection**: Maintain stable network connection
3. **Text Length**: Long text is recommended to use standard or premium mode
4. **Special Characters**: Support special characters for Arabic and Chinese
5. **Error Handling**: The system automatically handles common errors and provides friendly prompts

