# Dynamic Prompt Implementation - v0.45

## 🎯 Feature Overview

Dynamically adjust prompts based on the completion status of translation requirements to save token usage. Only when users fill in corresponding translation requirements will the corresponding guidance content be included in the prompt.

## 🔧 Implementation Principle

### 1. Monitor Translation Requirements
```javascript
// Check if translation requirements are empty
function hasTranslationRequirements(requirements) {
  return {
    hasIntent: requirements.intent && requirements.intent.trim() !== '',
    hasReference: requirements.reference && requirements.reference.trim() !== '',
    hasDirectRequest: requirements.directRequest && requirements.directRequest.trim() !== ''
  }
}
```

### 2. Dynamic Translation Guidance Building
```javascript
// Build translation guidance section
function buildTranslationGuidance(requirements, hasRequirements) {
  let guidance = '###Translation Guidance\n'
  
  if (hasRequirements.hasIntent) {
    guidance += `- Translation intent/audience: ${requirements.intent}\n`
  }
  
  if (hasRequirements.hasReference) {
    guidance += `- Reference translation style, please summarize and learn the style of the following reference translation: ${requirements.reference}\n`
  }
  
  if (hasRequirements.hasDirectRequest) {
    guidance += `- Direct requirements: ${requirements.directRequest}\n`
  }
  
  // If there are no requirements, add default description
  if (!hasRequirements.hasIntent && !hasRequirements.hasReference && !hasRequirements.hasDirectRequest) {
    guidance += '- No special requirements, please translate according to standard translation norms.\n'
  }
  
  return guidance
}
```

### 3. Dynamic Output Format Building
```javascript
// Build standard translation output format
function buildStandardOutputFormat(hasRequirements) {
  let outputFormat = `{"text_characteristics": "Analyze text type...",
"existing_terminology/idioms": ["term/idiom1", "term/idiom2"...]`
  
  // Only add analysis fields when there is corresponding input
  if (hasRequirements.hasIntent) {
    outputFormat += `,
"intent/audience_analysis": ""`
  }
  
  if (hasRequirements.hasReference) {
    outputFormat += `,
"reference_translation_analysis": ""`
  }
  
  if (hasRequirements.hasDirectRequest) {
    outputFormat += `,
"direct_instruction_analysis": ""`
  }
  
  outputFormat += `,
"terminology/idioms_translation_strategy": "Translation strategy for the above terminology/idioms",
"translate_advice": "Summarize and provide specific translation strategy recommendations for manual translation use",
"translate_1st_result": "First direct translation",
"translate_final_result": "Polished translation"
}`
  
  return outputFormat
}
```

## 📊 Comparison Effect

### Without Translation Requirements
**Fast Prompt Length**: ~200 tokens
**Standard Prompt Length**: ~350 tokens

### With All Translation Requirements
**Fast Prompt Length**: ~280 tokens (+40%)
**Standard Prompt Length**: ~450 tokens (+29%)

### Token Saving Effect
- **No requirements**: Save approximately 40-80 tokens
- **Partial requirements**: Save approximately 20-40 tokens
- **All requirements**: No saving, but provides complete functionality

## 🧪 Test Cases

### Test 1: No Translation Requirements
```javascript
{
  quality: 'fast',
  intent: '',
  reference: '',
  directRequest: ''
}
```
**Expected Result**: Translation guidance only includes default description

### Test 2: Only Intent Requirement
```javascript
{
  quality: 'standard',
  intent: 'Business communication',
  reference: '',
  directRequest: ''
}
```
**Expected Result**: Translation guidance includes intent, output format includes intent analysis field

### Test 3: With Reference Translation Style
```javascript
{
  quality: 'standard',
  intent: '',
  reference: 'Formal business document style',
  directRequest: ''
}
```
**Expected Result**: Translation guidance includes reference translation, output format includes reference translation analysis field

### Test 4: With Direct Requirements
```javascript
{
  quality: 'standard',
  intent: '',
  reference: '',
  directRequest: 'Use formal style'
}
```
**Expected Result**: Translation guidance includes direct requirements, output format includes direct requirement analysis field

### Test 5: All Requirements Present
```javascript
{
  quality: 'standard',
  intent: 'Business cooperation',
  reference: 'Formal business letter',
  directRequest: 'Maintain professionalism and politeness'
}
```
**Expected Result**: Translation guidance includes all requirements, output format includes all analysis fields

## 🔍 Code Location

### Core Functions
- `hasTranslationRequirements()` - Check translation requirements
- `buildTranslationGuidance()` - Build translation guidance
- `buildStandardOutputFormat()` - Build output format

### Application Locations
- `buildFastPrompt()` - Fast translation workflow
- `buildStandardPrompt()` - Standard workflow
- `parseJsonResponse()` - Parse response

## 📈 Performance Optimization

### Token Saving Strategy
1. **Conditional Inclusion**: Only include corresponding fields when there is input
2. **Default Value Handling**: Use concise default description when there are no requirements
3. **Dynamic Format**: Output format adjusts dynamically based on input

### Monitoring Metrics
- Prompt length changes
- Token usage
- Translation quality maintenance

## 🚀 Usage

### Frontend Call
```javascript
const requirements = {
  quality: 'standard',
  intent: 'Business communication',        // Optional
  reference: 'Formal document',      // Optional
  directRequest: 'Maintain politeness'   // Optional
}

const result = await translationStore.translateText(text, mode, requirements)
```

### Backend Processing
```javascript
// Automatically detect and build dynamic prompt
const prompt = buildPrompt(text, mode, requirements)
const response = await callClaudeAPI(prompt)
```

## 📝 Notes

1. **Backward Compatibility**: Maintain compatibility with existing API
2. **Error Handling**: Comprehensive error handling and fallback mechanisms
3. **Quality Assurance**: Ensure dynamic prompts do not affect translation quality
4. **Monitoring Logs**: Record prompt length changes for optimization

## 🎯 Future Optimization

1. **Finer Granularity Control**: Support more combinations of translation requirements
2. **Intelligent Optimization**: Optimize prompt structure based on historical data
3. **A/B Testing**: Compare effects of different prompt structures
4. **Caching Mechanism**: Cache commonly used prompt templates

