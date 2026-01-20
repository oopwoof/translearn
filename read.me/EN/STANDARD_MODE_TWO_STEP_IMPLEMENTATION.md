# Standard Mode Two-Step Translation Implementation - v0.5

## 🎯 Feature Overview

Split standard mode translation into two prompts:
1. **First Prompt**: Translation analysis and strategy expert, outputs translation analysis and strategy report
2. **Second Prompt**: Senior translator, performs actual translation based on the analysis report

## 🔧 Implementation Principle

### 1. Two-Step Processing Flow

```javascript
// Standard mode translation flow
if (prompt.isTwoStep) {
  // Step 1: Analysis and strategy
  const analysisResponse = await callClaudeAPI(prompt.analysisPrompt)
  const analysisResult = parseAnalysisResponse(analysisResponse)
  
  // Step 2: Actual translation
  const translationPromptWithReport = prompt.translationPrompt.replace(
    '{analysis_report}', 
    JSON.stringify(analysisResult, null, 2)
  )
  const translationResponse = await callClaudeAPI(translationPromptWithReport)
  const translationResult = parseTranslationResponse(translationResponse, text, mode)
  
  // Merge results
  result = {
    translatedText: translationResult.translatedText,
    analysis: {
      ...analysisResult,
      ...translationResult.analysis,
      analyzedAt: new Date().toISOString()
    }
  }
}
```

### 2. First Prompt: Translation Analysis and Strategy Expert

**Role**: Professional ${sourceLanguage}-${targetLanguage} translation analysis and strategy expert

**Workflow**:
1. Analyze original text characteristics (text type, style, domain, emotional tone, theme, pragmatic function, and linguistic structure)
2. Think about initial translation strategy based on text characteristics
3. Extract professional terminology, localized idioms/expressions
4. Analyze translation strategy in combination with translation guidance
5. Think about improving current translation strategy (under_guidance_strategy)
6. Think about translation strategy for terminology/idioms
7. Summarize and provide specific and comprehensive translation strategy recommendations to professional translators

**Dynamic Output Format**:
```json
{
  "text_characteristics": "Analyze text type...",
  "initial_translation_strategy": "Initial translation strategy based on text characteristics",
  "existing_terminology/idioms": ["term/idiom1", "term/idiom2"...],
  "intent/audience_analysis": "Analyze the impact of translation intent/audience on translation strategy",  // Only when input exists
  "reference_translation_analysis": "Analyze the impact of reference translation style on translation strategy",  // Only when input exists
  "direct_instruction_analysis": "Analyze the impact of direct requirements on translation strategy",  // Only when input exists
  "under_guidance_strategy": "Improved translation strategy after analyzing with translation guidance",  // Only when 2+ requirements exist
  "terminology/idioms_translation_strategy": "Translation strategy for the above terminology/idioms",
  "final_translate_advice": "Summarize and provide specific and comprehensive translation strategy recommendations to professional translators"
}
```

### 3. Second Prompt: Senior Translator

**Role**: Senior, professional ${sourceLanguage}-${targetLanguage} translator

**Workflow**:
1. Browse and understand the client's original translation requirements document
2. Carefully read and understand the translation analysis and strategy expert's report, independently evaluate the rationality of each analysis
3. Perform first direct translation according to the improved strategy and original translation requirements, without omitting any information
4. Review the first direct translation, polish again, making the content more compliant with translation strategy and rules while maintaining the original meaning

**Output Format**:
```json
{
  "translate_advice_rationality": "Whether reasonable, improvements for unreasonable parts",
  "initial_translation": "First direct translation result",
  "initial_translation_revising_strategy": "Review translation, including whether client's original requirements are omitted",
  "revised_translation": "Final polished translation"
}
```

## 📊 Dynamic Field Control

### Translation Guidance Section
- Only included in the prompt when there is input content (not empty)
- The translation guidance section of the first prompt and the original translation requirements section of the second prompt only include non-empty requirements

### Analysis Fields
- `intent/audience_analysis`: Only used when there is intent/audience input
- `reference_translation_analysis`: Only used when there is reference translation input
- `direct_instruction_analysis`: Only used when there is direct requirement input
- `under_guidance_strategy`: Only used when there are two or more requirements

## 🔍 Parsing Functions

### 1. Analysis Response Parsing
```javascript
function parseAnalysisResponse(response) {
  // Support JSON and text format parsing
  // Extract text characteristics, terminology, suggestions, dynamic analysis fields, etc.
}
```

### 2. Translation Response Parsing
```javascript
function parseTranslationResponse(response, originalText, mode) {
  // Support JSON and text format parsing
  // Extract translation results, suggestions, translation process, etc.
}
```

## 🎨 Frontend Interface Updates

### New Analysis Cards
- **Translation Strategy Analysis**: Display initial translation strategy
- **Intent/Audience Analysis**: Display intent/audience analysis results
- **Reference Translation Analysis**: Display reference translation analysis results
- **Direct Requirement Analysis**: Display direct requirement analysis results
- **Guidance Strategy**: Display improved strategy with translation guidance
- **Terminology Translation Strategy**: Display terminology translation strategy
- **Translation Process**: Display first direct translation and polished translation

### Style Design
- Each analysis card uses different color themes
- Maintain consistency with existing analysis panel
- Responsive design, adapt to different screen sizes

## 🧪 Test Cases

### Test 1: No Translation Requirements
```javascript
{
  quality: 'standard',
  intent: '',
  reference: '',
  directRequest: ''
}
```
**Expected Result**: Only includes basic analysis fields, no dynamic analysis fields

### Test 2: Only Intent Requirement
```javascript
{
  quality: 'standard',
  intent: 'Business communication',
  reference: '',
  directRequest: ''
}
```
**Expected Result**: Includes intent analysis field, no guidance strategy field

### Test 3: Two or More Requirements
```javascript
{
  quality: 'standard',
  intent: 'Business cooperation',
  reference: 'Formal business letter',
  directRequest: 'Maintain professionalism and politeness'
}
```
**Expected Result**: Includes all analysis fields, including guidance strategy field

## 📈 Performance Optimization

### Token Saving Strategy
1. **Conditional Inclusion**: Only include corresponding fields when there is input
2. **Dynamic Format**: Output format adjusts dynamically based on input
3. **Intelligent Analysis**: Decide whether to include guidance strategy based on the number of requirements

### Processing Time
- **Step 1**: Analysis phase, approximately 40% of total time
- **Step 2**: Translation phase, approximately 60% of total time
- **Total Time**: Slightly longer than single-step processing, but higher quality

## 🚀 Usage

### Frontend Call
```javascript
const requirements = {
  quality: 'standard',  // Key: Use standard mode to trigger two-step processing
  intent: 'Business communication',    // Optional
  reference: 'Formal document',  // Optional
  directRequest: 'Maintain politeness' // Optional
}

const result = await translationStore.translateText(text, mode, requirements)
```

### Backend Processing
```javascript
// Automatically detect and build two-step prompt
const prompt = buildPrompt(text, mode, requirements)
if (prompt.isTwoStep) {
  // Execute two-step processing
} else {
  // Execute single-step processing
}
```

## 📝 Notes

1. **Backward Compatibility**: Maintain compatibility with existing API
2. **Error Handling**: Comprehensive error handling and fallback mechanisms
3. **Quality Assurance**: Ensure two-step processing does not affect translation quality
4. **Monitoring Logs**: Record two-step processing process for debugging

## 🎯 Future Optimization

1. **Caching Mechanism**: Cache analysis results to improve efficiency
2. **Parallel Processing**: Explore possibilities of parallel processing
3. **Intelligent Optimization**: Optimize prompt structure based on historical data
4. **A/B Testing**: Compare effects of different prompt structures

## 🔗 Related Files

- `backend/routes/translate.js`: Core implementation
- `frontend/src/components/AnalysisPanel.vue`: Frontend interface
- `frontend/src/stores/translation.js`: State management
- `read.me/TRANSLATION_DIFFERENCES.md`: Translation mode comparison

