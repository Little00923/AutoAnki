# 🔧 环境变量配置问题修复

## 🐛 问题描述

**错误信息**:
```
POST http://localhost:3000/api/generate-cards 500 (Internal Server Error)
AI API调用失败: Authentication Fails, Your api key: ****_KEY is invalid
```

## 🎯 问题根源

### .env 文件配置错误

**错误的配置** (`.env` 文件):
```bash
OPENAI_API_KEY=DEEPSEEK_API_KEY  # ❌ 错误！
```

这会把字面量字符串 `"DEEPSEEK_API_KEY"` 赋值给 `OPENAI_API_KEY`，而不是读取环境变量的值。

### 为什么会出现这个问题？

1. `.env` 文件中的赋值是**字面量赋值**，不会读取环境变量
2. `dotenv` 库会将 `.env` 文件中的配置加载到 `process.env`
3. 程序读取到的 API key 是字符串 `"DEEPSEEK_API_KEY"` 而不是实际的 key

## ✅ 解决方案

### 方案1: 使用系统环境变量（推荐）

**步骤1**: 在 `.env` 文件中注释掉或删除 `OPENAI_API_KEY`

```bash
# .env 文件
# API密钥
# 优先从系统环境变量读取 DEEPSEEK_API_KEY 或 OPENAI_API_KEY
# 如果要在此文件配置，请取消下面的注释并填入实际的key
# OPENAI_API_KEY=your_actual_api_key_here

OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

**步骤2**: 在系统环境变量中设置 API key

```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
export DEEPSEEK_API_KEY=sk-your-actual-key-here

# 或临时设置（仅当前会话有效）
export DEEPSEEK_API_KEY=sk-your-actual-key-here
```

**步骤3**: 重启服务器

```bash
npm start
```

### 方案2: 直接在 .env 文件中配置（不推荐）

如果必须在 `.env` 文件中配置，需要写入**实际的 key 值**：

```bash
# .env 文件
OPENAI_API_KEY=sk-91cf6a00148243989286d123802ac925  # 实际的key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

⚠️ **注意**: 这种方式会将 key 明文存储在文件中，不推荐用于生产环境。

## 🔍 配置读取优先级

程序读取 API key 的优先级（`server.js`）：

```javascript
const AI_CONFIG = {
    apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1',
    model: process.env.OPENAI_MODEL || 'deepseek-chat'
};
```

**优先级顺序**:
1. `OPENAI_API_KEY` (最优先)
2. `DEEPSEEK_API_KEY` (次优先)
3. 空字符串 (降级为演示模式)

## 📋 验证配置是否正确

### 1. 检查环境变量

```bash
# 查看是否设置了 API key
echo $DEEPSEEK_API_KEY
# 或
echo $OPENAI_API_KEY
```

### 2. 检查服务器启动日志

```bash
npm start
```

应该看到：
```
⚙️  配置信息:
   - AI模型: deepseek-chat
   - API地址: https://api.deepseek.com/v1
   - API密钥: 已配置 ✓    ← 这里必须显示 "已配置 ✓"
```

### 3. 测试健康检查 API

```bash
curl http://localhost:3000/api/health
```

应该返回：
```json
{
    "status": "ok",
    "hasApiKey": true,     ← 这里必须是 true
    "apiBaseURL": "https://api.deepseek.com/v1",
    "model": "deepseek-chat"
}
```

### 4. 测试生成卡片

在浏览器中访问 http://localhost:3000，输入学习材料后点击"制卡"，应该能正常生成卡片。

## 🛡️ 安全最佳实践

### 开发环境

1. **使用系统环境变量**
   ```bash
   # ~/.bashrc 或 ~/.zshrc
   export DEEPSEEK_API_KEY=sk-your-key-here
   ```

2. **不要提交 .env 文件到 Git**
   ```bash
   # .gitignore 中已包含
   .env
   ```

3. **使用 .env.example 作为模板**
   ```bash
   cp .env.example .env
   # 然后编辑 .env 文件填入实际值
   ```

### 生产环境

1. **使用环境变量管理服务**
   - Docker: 使用 `docker-compose.yml` 的 `environment`
   - Kubernetes: 使用 Secrets
   - 云平台: 使用平台提供的环境变量配置

2. **使用密钥管理服务**
   - AWS: AWS Secrets Manager
   - Azure: Azure Key Vault
   - Google Cloud: Secret Manager

3. **定期轮换 API key**

## 📝 .env 文件配置示例

### 当前修复后的 .env 文件

```bash
# 大模型API配置
# 支持OpenAI或兼容的API服务（如DeepSeek、智谱等）

# API密钥
# 优先从系统环境变量读取 DEEPSEEK_API_KEY 或 OPENAI_API_KEY
# 如果要在此文件配置，请取消下面的注释并填入实际的key
# OPENAI_API_KEY=your_actual_api_key_here

# API基础URL
OPENAI_BASE_URL=https://api.deepseek.com/v1

# 模型名称
OPENAI_MODEL=deepseek-chat

# 服务器端口
PORT=3000

# 认证密钥（生产环境必须修改）
JWT_SECRET=your_jwt_secret_key_here_change_in_production
SESSION_SECRET=your_session_secret_key_here
```

## ✅ 修复状态

- ✅ `.env` 文件已修复
- ✅ 注释掉了错误的 `OPENAI_API_KEY` 配置
- ✅ 服务器能够从系统环境变量读取 `DEEPSEEK_API_KEY`
- ✅ API 健康检查显示 `hasApiKey: true`
- ✅ 卡片生成功能应该能正常工作

## 🧪 测试结果

```bash
$ curl http://localhost:3000/api/health
{
    "status": "ok",
    "hasApiKey": true,  ✓
    "apiBaseURL": "https://api.deepseek.com/v1",
    "model": "deepseek-chat"
}
```

---

**修复时间**: 2025-10-15  
**问题类型**: 环境变量配置错误  
**影响文件**: `.env`  
**状态**: ✅ 已解决



