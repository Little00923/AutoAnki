require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const AnkiExport = require('anki-apkg-export').default;

const app = express();
const PORT = process.env.PORT || 3000;

const PROVIDERS = {
    openai: {
        id: 'openai',
        name: 'OpenAI / 兼容接口',
        type: 'openai',
        defaultBaseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        defaultModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']
    },
    deepseek: {
        id: 'deepseek',
        name: 'DeepSeek',
        type: 'openai',
        defaultBaseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
        defaultModel: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        models: ['deepseek-chat', 'deepseek-reasoner']
    },
    qwen: {
        id: 'qwen',
        name: 'Qwen / 通义千问 (兼容模式)',
        type: 'openai',
        defaultBaseURL: process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        defaultModel: process.env.QWEN_MODEL || 'qwen-turbo',
        models: ['qwen-turbo', 'qwen-plus', 'qwen-max']
    },
    claude: {
        id: 'claude',
        name: 'Claude (Anthropic)',
        type: 'anthropic',
        defaultBaseURL: process.env.CLAUDE_BASE_URL || 'https://api.anthropic.com',
        defaultModel: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307']
    },
    gemini: {
        id: 'gemini',
        name: 'Gemini (Google)',
        type: 'gemini',
        defaultBaseURL: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
        defaultModel: process.env.GEMINI_MODEL || 'gemini-1.5-pro-002',
        models: ['gemini-1.5-pro-002', 'gemini-1.5-flash-002', 'gemini-1.5-flash-8b', 'gemini-1.0-pro']
    }
};

const DEFAULT_PROVIDER = 'openai';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

const SYSTEM_PROMPT_ZH = `# 角色
你是一名精通学习科学和认知心理学的教育专家，专门负责将学习材料转化为高效的记忆卡片。

# 输出语言
**非常重要**：请仔细识别用户输入文本的实际语言，并确保生成的卡片内容（包括问题和答案）使用与输入文本相同的语言。

判断标准：看文本的**主体叙述语言**，而不是其中的代码、变量名、函数名或专业术语。

## 正确识别示例

### 应识别为中文的情况：
1. "React使用useState来管理组件状态，语法是const [state, setState] = useState(initialValue)"
   → 主体是中文说明，生成中文卡片：
   - front: "React中useState的基本语法是什么？"
   - back: "const [state, setState] = useState(initialValue)"

2. "数组的map方法可以遍历数组，例如：arr.map(item => item * 2)"
   → 主体是中文，生成中文卡片

3. "机器学习中的dropout是一种正则化技术，通过随机丢弃神经元来防止过拟合"
   → 虽然包含dropout、过拟合等术语，但主体是中文

4. "使用git commit -m命令可以提交代码，-m参数用于添加提交信息"
   → 主体叙述是中文

5. "SQL的SELECT语句用于查询数据库，基本格式为SELECT * FROM table_name"
   → 虽然包含大量英文SQL语句，但说明文字是中文

### 应识别为英文的情况：
1. "The useState hook in React manages component state with syntax: const [state, setState] = useState()"
   → 主体是英文说明，生成英文卡片

2. "Machine learning's dropout technique prevents overfitting by randomly dropping neurons"
   → 主体是英文

3. "Use git commit -m to commit changes with a message"
   → 主体叙述是英文

# 任务
请将用户提供的学习材料转化为一组遵循认知科学原则的Anki卡片。

# 重点识别标准
在分析文本时，请优先选择以下类型的知识点：
- **核心定义**：明确的概念定义和专业术语
- **基本原理**：支撑整个知识体系的基础原理
- **因果关系**：重要的因果逻辑关系
- **关键区别**：容易混淆的概念之间的区别
- **重要过程**：包含3-5个步骤的核心流程
- **经典理论**：领域内公认的重要理论和模型

**避免提取**：
- 琐碎的细节、过长的列举(超过5项)、背景信息、作者观点、修辞性内容

# 核心原则
请严格遵守以下制卡原则：
1. **重要性优先**：只选择材料中最关键、最基础、最常被测试的知识点
2. **最小信息原则**：每张卡片只测试一个孤立的知识点
3. **主动回忆**：卡片正面应作为线索，迫使大脑主动提取信息
4. **精细编码**：在答案中适当添加比喻、图像提示或个人联系
5. **层次化测试**：结合基础记忆和理解性问答

# 输出格式
请严格按照以下JSON格式输出：

{
  "analysis_summary": {
    "total_concepts_identified": 数字,
    "recommended_card_distribution": {
      "basic_qa": 数字,
      "cloze": 数字, 
      "enumeration": 数字,
      "contextual_qa": 数字
    },
    "key_concepts": ["概念1", "概念2", ...]
  },
  "cards": [
    {
      "type": "basic_qa|cloze|enumeration|contextual_qa",
      "front": "卡片正面内容",
      "back": "卡片背面内容",
      "tags": ["标签1", "标签2"],
      "enhancement_note": "精细加工建议（可选）"
    }
  ]
}

# 卡片类型说明
- **basic_qa**: 基础问答卡 - 测试核心定义和事实
  - front: 问题
  - back: 答案

- **cloze**: 填空卡 - 适合关键术语记忆
  - front: 挖空后的句子，用___（下划线）或[...]表示空格位置
  - back: 仅包含被挖空的答案（多个答案用顿号、逗号或换行分隔）

- **enumeration**: 枚举卡 - 为列表中的每一项创建独立子卡
  - front: 列举类问题
  - back: 多个要点

- **contextual_qa**: 上下文问答卡 - 测试因果关系、原理理解
  - front: 需要理解和推理的问题
  - back: 详细解释

# 生成规则
1. 首先分析文本，识别核心概念和关系
2. 为每个核心概念选择最合适的卡片类型
3. **对于填空卡（cloze类型）：**
   - front字段：将关键词替换为___（三个下划线）的完整句子
   - back字段：仅包含被挖空的答案，多个答案用顿号分隔
4. **对于问答卡（basic_qa类型）：**
   - front字段：明确的问题
   - back字段：简洁的答案
5. 确保卡片正面是清晰的提问或填空，不是简单的标题
6. 对于复杂概念，考虑拆分成多张卡片
7. 为卡片添加相关主题标签

# 数量指导
- 简短段落(100-200字)：生成3-5张卡片
- 中等文章(300-500字)：生成5-8张卡片  
- 长篇文章(500-1500字)：生成8-15张卡片
- **最大限制**：无论文本长度，最多生成20张卡片，优先选择最核心的知识点
`;

const SYSTEM_PROMPT_EN = `# Role
You are an education expert proficient in learning science and cognitive psychology, specialized in converting learning materials into efficient memory flashcards.

# Output Language
**CRITICAL**: Please carefully identify the actual language of the user's input text, and ensure that all generated flashcard content (including questions and answers) uses the SAME language as the input text.

Identification Criterion: Focus on the **primary narrative language**, not the code, variable names, function names, or technical terms embedded in the text.

### Should be identified as Chinese:
1. "React使用useState来管理组件状态，语法是const [state, setState] = useState(initialValue)"
2. "数组的map方法可以遍历数组，例如：arr.map(item => item * 2)"
3. "机器学习中的dropout是一种正则化技术，通过随机丢弃神经元来防止过拟合"
4. "使用git commit -m命令可以提交代码，-m参数用于添加提交信息"
5. "SQL的SELECT语句用于查询数据库，基本格式为SELECT * FROM table_name"

### Should be identified as English:
1. "The useState hook in React manages component state with syntax: const [state, setState] = useState()"
2. "Machine learning's dropout technique prevents overfitting by randomly dropping neurons"
3. "Use git commit -m to commit changes with a message"
4. "The SQL SELECT statement queries databases with format: SELECT * FROM table_name"

# Task
Convert the user-provided learning materials into a set of Anki flashcards following cognitive science principles.

# Key Content Identification Standards
When analyzing text, prioritize the following types of knowledge points:
- **Core Definitions**: Clear concept definitions and professional terminology
- **Fundamental Principles**: Basic principles supporting the entire knowledge system
- **Causal Relationships**: Important causal logic relationships
- **Key Distinctions**: Differences between easily confused concepts
- **Important Processes**: Core workflows with 3-5 steps
- **Classic Theories**: Widely recognized important theories and models in the field

# Core Principles
1. **Prioritize Importance**: Only select the most critical, fundamental, and frequently tested knowledge points
2. **Minimum Information Principle**: Each card tests only one isolated knowledge point
3. **Active Recall**: The front of the card should serve as a cue, forcing the brain to actively retrieve information
4. **Elaborative Encoding**: Appropriately add analogies, visual cues, or personal connections in answers
5. **Hierarchical Testing**: Combine basic memory and comprehension Q&A

# Output Format
Return the JSON result that follows the schema used in the Chinese prompt above.`;

function getSystemPrompt(language = 'zh') {
    return language.startsWith('en') ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ZH;
}

function getUserPrompt(material, requestedCards, maxCards, language = 'zh') {
    if (language.startsWith('en')) {
        return `Please generate approximately ${requestedCards} Anki flashcards (maximum ${maxCards}) based on the following learning materials:\n\n${material}\n\nPlease strictly return the result in JSON format.`;
    }
    return `请根据以下学习材料生成约${requestedCards}张Anki卡片（最多${maxCards}张）：\n\n${material}\n\n请严格按照JSON格式返回结果。`;
}

const DEMO_CARDS = require('./public/demo-data.js');

function normalizeBaseURL(url) {
    return (url || '').replace(/\/$/, '');
}

function getProviderConfig(providerId) {
    return PROVIDERS[providerId] || PROVIDERS[DEFAULT_PROVIDER];
}

function resolveApiKey(overrideKey) {
    return (overrideKey || '').trim();
}

async function callOpenAICompatible({ baseURL, model, apiKey, systemPrompt, userPrompt }) {
    const response = await fetch(`${normalizeBaseURL(baseURL)}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI兼容接口调用失败: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

async function callClaude({ baseURL, model, apiKey, systemPrompt, userPrompt }) {
    const response = await fetch(`${normalizeBaseURL(baseURL)}/v1/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            max_tokens: 4000,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude 接口调用失败: ${error}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
}

async function callGemini({ baseURL, model, apiKey, systemPrompt, userPrompt }) {
    const url = `${normalizeBaseURL(baseURL)}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.7 }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini 接口调用失败: ${error}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    return parts.map(part => part.text || '').join('\n');
}

async function generateWithProvider({ providerId, model, baseURL, apiKey, systemPrompt, userPrompt }) {
    const config = getProviderConfig(providerId);
    const resolvedModel = model || config.defaultModel;
    const resolvedBaseURL = normalizeBaseURL(baseURL || config.defaultBaseURL);
        const resolvedKey = resolveApiKey(apiKey);

        if (!resolvedKey) {
            throw new Error(`缺少 ${config.name} 的 API 密钥，请在页面中填写后重试。`);
        }

    switch (config.type) {
        case 'openai':
            return {
                provider: config.id,
                model: resolvedModel,
                baseURL: resolvedBaseURL,
                content: await callOpenAICompatible({
                    baseURL: resolvedBaseURL,
                    model: resolvedModel,
                    apiKey: resolvedKey,
                    systemPrompt,
                    userPrompt
                })
            };
        case 'anthropic':
            return {
                provider: config.id,
                model: resolvedModel,
                baseURL: resolvedBaseURL,
                content: await callClaude({
                    baseURL: resolvedBaseURL,
                    model: resolvedModel,
                    apiKey: resolvedKey,
                    systemPrompt,
                    userPrompt
                })
            };
        case 'gemini':
            return {
                provider: config.id,
                model: resolvedModel,
                baseURL: resolvedBaseURL,
                content: await callGemini({
                    baseURL: resolvedBaseURL,
                    model: resolvedModel,
                    apiKey: resolvedKey,
                    systemPrompt,
                    userPrompt
                })
            };
        default:
            throw new Error(`未支持的模型类型: ${config.type}`);
    }
}

function parseCardResult(rawContent) {
    const jsonMatch = rawContent.match(/```json\n([\s\S]*?)\n```/) ||
        rawContent.match(/```\n([\s\S]*?)\n```/) ||
        [null, rawContent];
    const jsonString = jsonMatch[1] || rawContent;
    const parsed = JSON.parse(jsonString);

    if (!parsed.cards || !Array.isArray(parsed.cards)) {
        throw new Error('AI 返回数据格式不正确');
    }

    return parsed;
}

app.get('/api/providers', (req, res) => {
    const providers = Object.values(PROVIDERS).map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        defaultBaseURL: p.defaultBaseURL,
        defaultModel: p.defaultModel,
        models: p.models
    }));

    res.json({
        defaultProvider: DEFAULT_PROVIDER,
        providers
    });
});

app.post('/api/generate-cards', async (req, res) => {
    try {
        const {
            material,
            cardCount = 10,
            demoMode = false,
            language = 'zh',
            provider = DEFAULT_PROVIDER,
            model,
            baseURL,
            apiKey
        } = req.body;

        if (!material || !material.trim()) {
            return res.status(400).json({ error: '请提供学习材料内容' });
        }

        const inputLanguage = language || 'zh';
        const maxLength = inputLanguage.startsWith('en') ? 6000 : 4000;
        if (material.length > maxLength) {
            return res.status(400).json({
                error: inputLanguage.startsWith('en')
                    ? `Text too long: ${material.length} characters. Please limit to ${maxLength} characters.`
                    : `文本过长，当前${material.length}字，请控制在${maxLength}字以内`
            });
        }

        const maxCards = 20;
        const requestedCards = Math.min(Math.max(parseInt(cardCount, 10) || 10, 1), maxCards);

        if (demoMode) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return res.json({
                success: true,
                cards: DEMO_CARDS.cards.slice(0, requestedCards),
                analysis: DEMO_CARDS.analysis_summary,
                isDemo: true
            });
        }

        const systemPrompt = getSystemPrompt(inputLanguage);
        const userPrompt = getUserPrompt(material, requestedCards, maxCards, inputLanguage);

        const aiResult = await generateWithProvider({
            providerId: provider,
            model,
            baseURL,
            apiKey,
            systemPrompt,
            userPrompt
        });

        const parsed = parseCardResult(aiResult.content);

        res.json({
            success: true,
            cards: parsed.cards,
            analysis: parsed.analysis_summary,
            provider: aiResult.provider,
            model: aiResult.model,
            baseURL: aiResult.baseURL
        });
    } catch (error) {
        console.error('生成卡片错误:', error);
        res.status(500).json({
            error: error.message || '生成卡片失败，请重试'
        });
    }
});

app.post('/api/export-apkg', async (req, res) => {
    try {
        const { cards } = req.body;

        if (!cards || !Array.isArray(cards) || cards.length === 0) {
            return res.status(400).json({ error: '没有可导出的卡片' });
        }

        const apkg = new AnkiExport('AutoAnki卡组');

        cards.forEach(card => {
            apkg.addCard(card.front || '', card.back || '');
        });

        const zip = await apkg.save();

        res.setHeader('Content-Type', 'application/apkg');
        res.setHeader('Content-Disposition', 'attachment; filename="anki-cards.apkg"');
        res.send(Buffer.from(zip));
    } catch (error) {
        console.error('导出APKG错误:', error);
        res.status(500).json({
            error: error.message || '导出失败，请重试'
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        providers: Object.values(PROVIDERS).map(p => ({
            id: p.id,
            model: p.defaultModel,
            baseURL: p.defaultBaseURL
        }))
    });
});

app.get('/api/detect-language', (req, res) => {
    res.json({
        language: 'en',
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''
    });
});

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║     AutoAnki 开源版服务已启动         ║
╚══════════════════════════════════════╝

访问: http://localhost:${PORT}
可用提供商: ${Object.keys(PROVIDERS).join(', ')}
`);
});

module.exports = app;
