# AutoAnki Open (Lite)

开源精简版，保留了 **AI 制卡 + 预览编辑 + APKG 导出** 的核心能力，移除了账号、支付、数据库等闭源依赖，并新增多模型/厂商自定义入口。

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
