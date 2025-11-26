# AutoAnki Open (Lite)

开源精简版，保留了 **AI 制卡 + 预览编辑 + APKG 导出** 的核心能力，移除了账号、支付、数据库等依赖，并新增多模型/厂商选择。

Feature set: **AI card creation + preview/edit + APKG export**. Live example: https://autoanki.xyz/

---
## 🇨🇳 特性
- 🎯 输入学习材料，一键生成 Anki 卡片，支持编辑与分页预览  
- 🔌 前端选择 AI 厂商/模型，支持自定义 Base URL（代理/自建网关）  
- 🗝️ API Key 必须在页面输入（仅随当次请求发送，不会保存）  
- 🧳 导出 `.apkg` 卡包，直接导入 Anki  
- 🧪 内置示例数据（请求时传 `demoMode: true` 体验）

## 🇨🇳 快速开始
1) 环境：Node.js 18+  
2) 安装依赖（需联网或本地 npm 缓存）  
```bash
npm install
```
> 离线/受限环境可先在有网处生成 `package-lock.json` 或准备 npm 缓存。

3) 启动（页面手填 API Key）
```bash
npm start
# 浏览器访问 http://localhost:3000
```
> 如需改默认 Base URL/模型，复制 `.env.example` 为 `.env` 调整；API Key 不会由服务器注入，需在页面填写。

4) 必填项
- 先选“厂商”，再选“模型”，在“API Key”框中粘贴密钥，否则无法调用。
- 按住 Shift 点击“制卡”可用内置示例数据验证流程。

## 🇨🇳 首页模型选择（默认）
| 厂商 | Base URL | 示例模型 |
| --- | --- | --- |
| OpenAI | https://api.openai.com/v1 | gpt-4o-mini / gpt-4o / gpt-3.5-turbo |
| Claude | https://api.anthropic.com | claude-3-5-sonnet-20241022 / claude-3-opus-20240229 / claude-3-haiku-20240307 |
| Gemini | https://generativelanguage.googleapis.com/v1beta | gemini-1.5-pro-002 / gemini-1.5-flash-002 / gemini-1.5-flash-8b / gemini-1.0-pro |
| DeepSeek | https://api.deepseek.com/v1 | deepseek-chat / deepseek-reasoner |
| Qwen (DashScope兼容) | https://dashscope.aliyuncs.com/compatible-mode/v1 | qwen-turbo / qwen-plus / qwen-max |

可直接切换厂商并从下拉选择模型，支持自定义 Base URL；API Key 不会被保存。

## 🇨🇳 版本说明
- 包含：AI 制卡、预览/编辑、APKG 导出、多厂商模型切换  
- 不含：账号、积分/支付、数据库和运维文档  
- 交互简洁：选厂商/模型 + 手填 API Key；Shift+制卡为本地示例

## 🇨🇳 最小验证（用你的 Key）
```bash
curl -X POST http://localhost:3000/api/generate-cards \
  -H "Content-Type: application/json" \
  -d '{
    "material":"简短测试文本",
    "cardCount":1,
    "language":"zh",
    "provider":"deepseek",
    "model":"deepseek-chat",
    "baseURL":"https://api.deepseek.com/v1",
    "apiKey":"YOUR_KEY"
  }'
```
返回包含 `cards` 即成功；报错会有 `error` 字段。

## 🇨🇳 主要脚本
- `npm start`：启动 Express 静态站点 + API
- `npm run dev`：nodemon 热重载

## 🇨🇳 目录速览
- `public/`：前端入口 `public/index.html`
- `server.js`：后端入口（/api/generate-cards、/api/export-apkg、/api/providers）
- `.env.example`：环境变量示例（多厂商默认值）

## 🇨🇳 常见问题
- **只能用列表模型吗？** 目前强制下拉，避免误填不可用模型；如需扩充，在 `server.js` 的 `PROVIDERS` 添加稳定模型名。  
- **为什么没有默认密钥？** 出于安全，服务器不注入密钥，需前端手填。  
- **401/403？** 检查 Key 与 Base URL/模型是否匹配厂商要求。  
- **慢/失败？** Base URL 可指向你的代理/网关；或用 Shift+制卡先验证前端流程。

---
## 🇺🇸 English

Feature set: **AI card creation + preview/edit + APKG export**. Live demo: https://autoanki.xyz/

## Highlights
- 🎯 One-click Anki cards from pasted text; edit + paged preview  
- 🔌 Pick provider/model on the page; custom Base URL (proxy/self-hosted)  
- 🗝️ API key is required on the page (sent only for this request; never stored)  
- 🧳 Export `.apkg` deck for Anki  
- 🧪 Built-in demo data (`demoMode: true`)

## Quick Start
1) Node.js 18+  
2) Install deps: `npm install`  
   > Offline? Generate `package-lock.json` with internet or prepare npm cache.  
3) Run (API key required on page):  
```bash
npm start
# open http://localhost:3000
```
   > To tweak default Base URL/model, copy `.env.example` → `.env`; keys are NOT injected by server—paste them on the page.  
4) Required: pick provider, pick model, paste your API key. Shift+Generate uses local demo data.

## Providers & Models
| Provider | Base URL | Example models |
| --- | --- | --- |
| OpenAI | https://api.openai.com/v1 | gpt-4o-mini / gpt-4o / gpt-3.5-turbo |
| Claude | https://api.anthropic.com | claude-3-5-sonnet-20241022 / claude-3-opus-20240229 / claude-3-haiku-20240307 |
| Gemini | https://generativelanguage.googleapis.com/v1beta | gemini-1.5-pro-002 / gemini-1.5-flash-002 / gemini-1.5-flash-8b / gemini-1.0-pro |
| DeepSeek | https://api.deepseek.com/v1 | deepseek-chat / deepseek-reasoner |
| Qwen (DashScope) | https://dashscope.aliyuncs.com/compatible-mode/v1 | qwen-turbo / qwen-plus / qwen-max |

Dropdown enforces known-stable models; Base URL override supported. Keys are never stored.

## Version Notes
- Includes: AI card generation, preview/edit, APKG export, multi-provider switching  
- Excludes: accounts, credits/payments, databases, ops docs  
- Simple UX: pick provider/model, paste API key; Shift+Generate for local demo

## Minimal Check (curl)
```bash
curl -X POST http://localhost:3000/api/generate-cards \
  -H "Content-Type: application/json" \
  -d '{
    "material":"short test text",
    "cardCount":1,
    "language":"zh",
    "provider":"deepseek",
    "model":"deepseek-chat",
    "baseURL":"https://api.deepseek.com/v1",
    "apiKey":"YOUR_KEY"
  }'
```
If `cards` is present, it worked; otherwise check `error`.

## Scripts
- `npm start`: launch Express + API
- `npm run dev`: nodemon hot reload

## Structure
- `public/`: frontend entry `public/index.html`
- `server.js`: backend entry (`/api/generate-cards`, `/api/export-apkg`, `/api/providers`)
- `.env.example`: sample env (provider defaults)

## FAQ
- **Only listed models?** Yes, dropdown guards against invalid names; extend `PROVIDERS` in `server.js` for stable additions.  
- **No default key?** For security, keys are never injected—paste them on the page.  
- **401/403?** Verify key, Base URL, and model match provider requirements.  
- **Slow/failing?** Point Base URL to your proxy/gateway, or use Shift+Generate to validate UI first.

## Contributing
Issues/PRs welcome—help expand model support and deployment options.***
