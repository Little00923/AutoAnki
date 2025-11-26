# AutoAnki Open 
 ---

Feature set: AI card creation + preview/edit + APKG export. Live example: https://autoanki.xyz/                 
                                                                                                                  
  ## Highlights                                                                                                   
                                                                                                                  
  - 🎯 Paste study materials and generate Anki cards in one click, with editing and paged preview                 
  - 🔌 Pick AI provider/model on the page; custom Base URL supported (proxy/self-hosted gateway)                  
  - 🗝️ API Key must be entered on the page (sent only for this request; never stored on server/browser)           
  - 🧳 Export .apkg deck for direct import into Anki                                                              
  - 🧪 Built-in demo data (use demoMode: true in the request to try)                                              
                                                                                                                  
  ## Quick Start                                                                                                  
                                                                                                                  
  1. Env: Node.js 18+                                                                                             
  2. Install deps (needs internet or local npm cache)                                                             
                                                                                                                  
  npm install                                                                                                     
                                                                                                                  
  > In offline/restricted environments, prepare npm cache yourself or generate package-lock.json where you have   
  > internet, then copy it.                                                                                       
                                                                                                                  
  3. Run (API Key required on the page)                                                                           
                                                                                                                  
  npm start                                                                                                       
  # Visit http://localhost:3000                                                                                   
                                                                                                                  
  > To adjust default Base URL/model, copy .env.example to .env and edit; the server does not inject any API key— 
  > enter it on the page.                                                                                         
                                                                                                                  
  4. Required steps                                                                                               
                                                                                                                  
  - On the homepage, choose a provider, then a model, and paste your API key; otherwise calls will fail.          
  - Hold Shift and click “Generate” to use built-in demo data for UI verification.                                
                                                                                                                  
  ## Provider & model options (defaults)                                                                          
                                                                                                                  
  | Provider | Base URL | Example models |                                                                        
  | --- | --- | --- |                                                                                             
  | OpenAI | https://api.openai.com/v1 | gpt-4o-mini / gpt-4o / gpt-3.5-turbo |                                   
  | Claude | https://api.anthropic.com | claude-3-5-sonnet-20241022 / claude-3-opus-20240229 / claude-3-haiku-    
  20240307 |                                                                                                      
  | Gemini | https://generativelanguage.googleapis.com/v1beta | gemini-1.5-pro-002 / gemini-1.5-flash-002 /       
  gemini-1.5-flash-8b / gemini-1.0-pro |                                                                          
  | DeepSeek | https://api.deepseek.com/v1 | deepseek-chat / deepseek-reasoner |                                  
  | Qwen (DashScope-compatible) | https://dashscope.aliyuncs.com/compatible-mode/v1 | qwen-turbo / qwen-plus /    
  qwen-max |                                                                                                      
                                                                                                                  
  You can switch provider and pick models from the dropdown, and override Base URL if needed. API keys are never  
  stored.                                                                                                         
                                                                                                                  
  ## Version notes                                                                                                
                                                                                                                  
  - Includes: AI card generation, preview/edit, APKG export, multi-provider model switching                       
  - Excludes: account system, credits/payments, databases, and related ops docs                                   
  - Simple UX: pick provider/model, paste API key; Shift+Generate for local demo mode                             
                                                                                                                  
  ## Minimal verification (with your own key)                                                                     
                                                                                                                  
  Use curl to hit the backend (replace provider/model/baseURL/apiKey):                                            
                                                                                                                  
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
                                                                                                                  
  If cards is returned, it worked; otherwise check the error field.                                               
                                                                                                                  
  ## Main scripts                                                                                                 
                                                                                                                  
  - npm start: launch Express static site + API                                                                   
  - npm run dev: nodemon hot reload                                                                               
                                                                                                                  
  ## Directory overview                                                                                           
                                                                                                                  
  - public/: frontend pages/assets (entry: public/index.html)                                                     
  - server.js: backend entry; exposes /api/generate-cards, /api/export-apkg, /api/providers                       
  - .env.example: sample environment variables (multi-provider defaults)                                          
                                                                                                                  
  ## FAQ                                                                                                          
                                                                                                                  
  - Only the listed models? Yes, the dropdown enforces known-stable models; to expand, add stable model names in  
    server.js under PROVIDERS.                                                                                    
  - No default key? For security, the server never injects keys; paste them on the page.                          
  - 401/403? Check that your key is valid and the Base URL/model matches the provider’s requirements.             
  - Slow/failing calls? Point Base URL to your proxy/gateway, or use Shift+Generate to verify the frontend flow   
    first.                                                                                                        
                                                                                                                  

---

功能：**AI 制卡 + 预览编辑 + APKG 导出** 效果可参考：https://autoanki.xyz/

## 特性
- 🎯 输入学习材料，一键生成 Anki 卡片，支持编辑与分页预览  
- 🔌 前端即可选择 AI 厂商 / 模型，自定义 Base URL（适配代理或自建网关）  
- 🗝️ API Key 必须在页面输入（只随当次请求发送，不会保存到服务器或浏览器）  
- 🧳 导出 `.apkg` 卡包，直接导入 Anki 使用  
- 🧪 内置示例数据（请求时可传 `demoMode: true` 体验）

## 快速开始
1) **环境**：Node.js 18+  
2) **安装依赖**（需要联网或本地 npm 缓存）  
```bash
npm install
```
> 如果你在离线/受限环境，请自行准备 npm 缓存，或在有网环境生成 `package-lock.json` 后再复制。

3) **启动（必须在页面填写 API Key）**
```bash
npm start
# 浏览器访问 http://localhost:3000
```
> 如需修改默认 Base URL / 模型，可以复制 `.env.example` 为 `.env` 后调整相应变量；API Key 不会从服务器注入，需在页面填写。

4) **必填项**
- 打开首页后，先选“厂商”，再选“模型”，在“API Key”框中粘贴你自己的密钥，否则无法调用。
- 按住 Shift 点击“制卡”可使用本地内置示例数据，验证 UI 流程。

## 首页模型选择（默认配置）
| 厂商 | Base URL | 示例模型 |
| --- | --- | --- |
| OpenAI | https://api.openai.com/v1 | gpt-4o-mini / gpt-4o / gpt-3.5-turbo |
| Claude | https://api.anthropic.com | claude-3-5-sonnet-20241022 / claude-3-opus-20240229 / claude-3-haiku-20240307 |
| Gemini | https://generativelanguage.googleapis.com/v1beta | gemini-1.5-pro-002 / gemini-1.5-flash-002 / gemini-1.5-flash-8b / gemini-1.0-pro |
| DeepSeek | https://api.deepseek.com/v1 | deepseek-chat / deepseek-reasoner |
| Qwen (DashScope兼容) | https://dashscope.aliyuncs.com/compatible-mode/v1 | qwen-turbo / qwen-plus / qwen-max |

在页面可直接切换厂商并从下拉选择模型，支持自定义 Base URL；API Key 不会被保存（仅随本次请求发送）。

## 版本说明
- 仅包含：AI 制卡、预览/编辑、APKG 导出、多厂商模型切换  
- 不包含：账号体系、积分/支付、数据库和相关运维文档  
- 交互保持简洁：主页选择厂商/模型，手填 API Key 即可使用；Shift+制卡为本地示例模式

## 最小验证（用你自己的 Key）
可用 curl 直连后端验证调用是否通畅（替换 provider/model/baseURL/apiKey）：
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
返回包含 `cards` 即成功；报错则会有 `error` 字段。

## 主要脚本
- `npm start`：启动 Express 静态站点 + API
- `npm run dev`：使用 nodemon 热重载

## 目录速览
- `public/`：前端页面与静态资源（首页入口：`public/index.html`）
- `server.js`：后端入口，暴露 `/api/generate-cards`、`/api/export-apkg`、`/api/providers`
- `.env.example`：示例环境变量（多厂商支持）

## 常见问题
- **只能用列表里的模型吗？** 当前前端强制使用下拉列表，避免误填不可用模型。如需扩充可在 `server.js` 的 `PROVIDERS` 中追加稳定可调的模型名。  
- **为什么没有默认密钥？** 出于安全考虑，服务器不注入任何密钥，必须在前端手填。  
- **提示 401/403？** 检查 Key 是否有效、对应 Base URL/模型是否匹配厂商要求。  
- **调用缓慢或失败？** 可在 Base URL 中改为你的代理/网关；或先用 Shift+制卡验证前端流程。

## 贡献
欢迎提交 Issue / PR，一起完善更多模型适配和部署方式。***
