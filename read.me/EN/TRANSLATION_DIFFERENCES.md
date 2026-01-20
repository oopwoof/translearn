# Fast vs Standard Translation - Detailed Comparison

## 📍 Code Location

All differences are defined in the `backend/routes/translate.js` file:

### 1. Workflow Selection Logic
```javascript
// Lines 245-260
function buildPrompt(text, mode, requirements) {
  const quality = requirements.quality || 'standard'
  
  if (quality === 'fast') {
    return buildFastPrompt(text, sourceLanguage, targetLanguage, requirements)
  } else if (quality === 'standard') {
    return buildStandardPrompt(text, sourceLanguage, targetLanguage, requirements)
  }
  // ...
}
```

### 2. Fast Translation Workflow (Lines 266-290)
```javascript
function buildFastPrompt(text, sourceLanguage, targetLanguage, requirements) {
  let prompt = `###Role
You are a professional ${sourceLanguage}-${targetLanguage} translation expert, striving for fidelity and fluency.

###Scenario
This is a fast translation scenario, commonly seen in daily communication, urgent processing, etc. Please optimize generation speed while ensuring fidelity and fluency.

###Task
Complete the following translation task. If there are translation intent/audience, reference translation style, and special requirements, please strictly refer to them and provide thinking process and translation results according to the format.

###Translation Guidance
- Translation intent/audience: ${requirements.intent || 'None'}
- Reference translation style, please summarize and learn the style of the following reference translation: ${requirements.reference || 'None'}
- Direct requirements: ${requirements.directRequest || 'None'}

###Original Text
${text}

###Output Format
Please strictly provide JSON response in the following format:
{"translate_advice": "Provide specific translation strategy recommendations",
"translate_result": "Provide accurate and fluent translation here"
}`
}
```

### 3. Standard Workflow (Lines 292-330)
```javascript
function buildStandardPrompt(text, sourceLanguage, targetLanguage, requirements) {
  let prompt = `###Role
You are a professional ${sourceLanguage}-${targetLanguage} translation expert, striving for fidelity and fluency.

###Scenario
This is a standard translation scenario, commonly seen in business, academic research, and content creation. Please balance efficiency and quality, focus on fidelity and fluency, including basic proofreading and polishing, ensuring suitability for formal use.

###Task
Complete the following translation task. If there are translation intent/audience, reference translation style, and special requirements, please strictly refer to them and provide thinking process and translation results according to the format.

###Workflow
1. Analyze original text characteristics, extract professional terminology, localized idioms/expressions.
2. Analyze translation strategy in combination with translation guidance.
3. First translation: directly translate according to news content, do not omit any information.
2. Re-translate based on the first direct translation result, making the content comply with translation guidance requirements and ${targetLanguage} expression habits while maintaining the original meaning.

###Translation Guidance
- Translation intent/audience: ${requirements.intent || 'None'}
- Reference translation style, please summarize and learn the style of the following reference translation: ${requirements.reference || 'None'}
- Direct requirements: ${requirements.directRequest || 'None'}

###Original Text
${text}

###Output Format
Please strictly provide JSON response in the following format:
{"text_characteristics": "Analyze text type (e.g., business text, academic text, etc.), style (e.g., formal style, polite style, etc.), text domain, emotional tone, text theme, pragmatic function, and linguistic structure characteristics",
"existing_terminology/idioms": ["term/idiom1", "term/idiom2"...],
"intent/audience_analysis": "",
"reference_translation_analysis": "",
"direct_instruction_analysis": "",
"terminology/idioms_translation_strategy": "Translation strategy for the above terminology/idioms"
"translate_advice": "Summarize and provide specific translation strategy recommendations for manual translation use",
"translate_1st_result": "First direct translation",
"translate_final_result": "Polished translation"
}`
}
```

## 🔍 Main Differences Comparison

| Aspect | Fast Translation | Standard Translation |
|--------|------------------|---------------------|
| **Scenario Description** | Daily communication, urgent processing | Business, academic research, content creation |
| **Optimization Target** | Generation speed | Balance between efficiency and quality |
| **Workflow** | Direct translation | 4-step detailed workflow |
| **Output Fields** | 2 fields | 8 detailed fields |
| **Analysis Depth** | Basic analysis | Deep analysis |

## 📊 Output Format Differences

### Fast Translation Output (2 fields)
```json
{
  "translate_advice": "Translation recommendations",
  "translate_result": "Translation result"
}
```

### Standard Output (8 fields)
```json
{
  "text_characteristics": "Text characteristic analysis",
  "existing_terminology/idioms": ["Term 1", "Term 2"],
  "intent/audience_analysis": "Intent analysis",
  "reference_translation_analysis": "Reference translation analysis",
  "direct_instruction_analysis": "Direct requirement analysis",
  "terminology/idioms_translation_strategy": "Terminology translation strategy",
  "translate_advice": "Translation recommendations",
  "translate_1st_result": "First direct translation",
  "translate_final_result": "Polished translation"
}
```

## 🎯 Actual Effect Differences

### Fast Translation Characteristics
- **Speed Priority**: Optimize generation speed
- **Concise Output**: Only return translation result and recommendations
- **Suitable Scenarios**: Daily conversation, urgent situations
- **Processing Time**: Relatively short

### Standard Characteristics
- **Quality Priority**: Balance efficiency and quality
- **Detailed Analysis**: Include text characteristics, terminology analysis, etc.
- **Suitable Scenarios**: Business documents, academic papers
- **Processing Time**: Relatively long

## 🔧 How to Verify Differences

### 1. View Console Logs
Check network requests in browser developer tools to see different request parameters:

**Fast Translation Request**:
```javascript
{
  "text": "Hello, world!",
  "mode": "zh-ar",
  "requirements": {
    "quality": "fast",  // Key difference
    "intent": "Daily communication",
    "reference": "",
    "directRequest": ""
  }
}
```

**Standard Request**:
```javascript
{
  "text": "Hello, world!",
  "mode": "zh-ar",
  "requirements": {
    "quality": "standard",  // Key difference
    "intent": "Business communication",
    "reference": "Formal document",
    "directRequest": "Use formal style"
  }
}
```

### 2. View Backend Logs
Different prompt templates can be seen in the backend console:

**Fast Translation Log**:
```
Starting translation: { text: 'Hello, world!...', mode: 'zh-ar' }
Claude response: ###Role You are a professional Chinese-Arabic translation expert...
```

**Standard Log**:
```
Starting translation: { text: 'Hello, world!...', mode: 'zh-ar' }
Claude response: ###Role You are a professional Chinese-Arabic translation expert...
###Workflow 1. Analyze original text characteristics...
```

### 3. Frontend Interface Differences
In `frontend/src/components/TranslationControls.vue`, quality selection buttons trigger different translation flows:

```javascript
// Lines 150-160
const handleTranslate = () => {
  const requirements = {
    quality: quality.value,  // 'fast' or 'standard'
    intent: intent.value,
    reference: reference.value,
    directRequest: directRequest.value
  }
  emit('translate', requirements)
}
```

## 🧪 Testing Methods

1. **Start Project**:
   ```bash
   npm run dev
   ```

2. **Test Fast Translation**:
   - Select "Chinese-Arabic" mode
   - Click "Fast" button
   - Enter text: "Hello, world!"
   - Click "Start Translation"

3. **Test Standard Translation**:
   - Select "Chinese-Arabic" mode
   - Click "Standard" button
   - Enter the same text: "Hello, world!"
   - Click "Start Translation"

4. **Compare Results**:
   - View translation results
   - Check detailed information in the analysis panel
   - Observe processing time differences

## 📝 Summary

The main differences between fast and standard translation are:

1. **Different Prompt Templates** - In `backend/routes/translate.js` lines 266-330
2. **Different Output Formats** - Fast has 2 fields, Standard has 8 fields
3. **Different Processing Depth** - Fast is direct translation, Standard includes detailed analysis
4. **Different Suitable Scenarios** - Fast is suitable for daily use, Standard is suitable for formal occasions

These differences ensure users can choose the most appropriate translation mode according to their specific needs.

