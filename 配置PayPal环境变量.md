# ✅ PayPal 环境变量配置完成

## 📋 当前状态

✅ **应用已经支持读取环境变量**
- 代码已配置好，会自动从环境变量读取 PayPal 凭证
- `.env` 文件已添加 PayPal 配置模板

---

## 🔧 下一步：填写您的 PayPal 凭证

### 方法1：编辑 .env 文件

打开 `.env` 文件，找到以下内容并替换：

```bash
# PayPal 支付配置
PAYPAL_MODE=sandbox                              # sandbox（测试）或 live（生产）
PAYPAL_CLIENT_ID=your_paypal_client_id_here     # 替换为您的 Client ID
PAYPAL_CLIENT_SECRET=your_paypal_secret_here    # 替换为您的 Secret
PAYPAL_RETURN_URL=http://localhost:3000/user-center.html#recharge
PAYPAL_CANCEL_URL=http://localhost:3000/user-center.html#recharge
```

### 方法2：使用命令直接设置（如果您已经有凭证）

```bash
# 在终端中运行（替换为您的实际值）
export PAYPAL_CLIENT_ID="AxxxxxxxxxxxxQ"
export PAYPAL_CLIENT_SECRET="ExxxxxxxxxxxxQ"
export PAYPAL_MODE="sandbox"
```

**注意**：使用 export 设置的环境变量只在当前终端会话有效。重启后失效。

---

## 📝 获取 PayPal 凭证

如果您还没有 PayPal Client ID 和 Secret：

### 1. 访问 PayPal 开发者网站
```
https://developer.paypal.com/
```

### 2. 登录并创建应用
1. 点击 **"My Apps & Credentials"**
2. 选择 **"Sandbox"** 标签
3. 点击 **"Create App"**
4. 输入应用名称：`AutoAnki`
5. 创建后即可看到：
   - **Client ID**: AxxxxxxxxxxxxQ
   - **Secret**: ExxxxxxxxxxxxQ

### 3. 复制凭证到 .env 文件

---

## 🔄 应用如何读取环境变量

### 代码已配置（无需修改）

您的应用 `server.js` 第一行：
```javascript
require('dotenv').config();
```

这会自动加载 `.env` 文件中的所有环境变量。

### PayPal 服务自动读取

`services/paypal-service.js` 会自动读取：
```javascript
process.env.PAYPAL_CLIENT_ID
process.env.PAYPAL_SECRET
process.env.PAYPAL_MODE
```

**无需修改任何代码！**

---

## ✅ 验证配置

### 1. 检查 .env 文件内容

```bash
cat .env | grep PAYPAL
```

应该看到：
```
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=AxxxxxxxxxxxxQ
PAYPAL_CLIENT_SECRET=ExxxxxxxxxxxxQ
...
```

### 2. 重启服务器

```bash
# 停止当前服务器
pkill -f "node server.js"

# 启动服务器（会自动加载新的环境变量）
npm start
```

### 3. 测试 PayPal 配置

访问：http://localhost:3000/user-center.html

1. 登录账号
2. 点击"充值"标签
3. 选择金额
4. 点击"确认充值"

**结果判断**：
- ✅ **跳转到 PayPal**：配置成功！
- ❌ **显示"测试模式"**：环境变量未正确设置

---

## 🔍 故障排查

### 问题1：显示"测试模式"

**原因**：环境变量未加载或值不正确

**解决方案**：
```bash
# 检查环境变量
echo $PAYPAL_CLIENT_ID

# 如果为空，检查 .env 文件
cat .env | grep PAYPAL_CLIENT_ID

# 重启服务器
pkill -f "node server.js"
npm start
```

### 问题2：环境变量中有空格或引号

**错误示例**：
```bash
PAYPAL_CLIENT_ID= AxxxxxxxxxxxxQ    # ❌ 等号后有空格
PAYPAL_CLIENT_ID="AxxxxxxxxxxxxQ"   # ⚠️ 不需要引号（.env文件中）
```

**正确示例**：
```bash
PAYPAL_CLIENT_ID=AxxxxxxxxxxxxQ     # ✅ 正确
```

### 问题3：环境变量未生效

**原因**：服务器未重启

**解决方案**：
```bash
# 必须重启服务器才能加载新的环境变量
pkill -f "node server.js"
npm start
```

---

## 📝 完整配置示例

### .env 文件示例（Sandbox 测试环境）

```bash
# AI API配置
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat

# 认证密钥
JWT_SECRET=your_jwt_secret_key_here_change_in_production
SESSION_SECRET=your_session_secret_key_here

# PayPal 配置（测试环境）
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=AZxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ
PAYPAL_CLIENT_SECRET=EJxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ
PAYPAL_RETURN_URL=http://localhost:3000/user-center.html#recharge
PAYPAL_CANCEL_URL=http://localhost:3000/user-center.html#recharge

# 服务器配置
PORT=3000
NODE_ENV=development
```

### .env 文件示例（Live 生产环境）

```bash
# PayPal 配置（生产环境）
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=生产环境的Client_ID
PAYPAL_CLIENT_SECRET=生产环境的Secret
PAYPAL_RETURN_URL=https://yourdomain.com/user-center.html#recharge
PAYPAL_CANCEL_URL=https://yourdomain.com/user-center.html#recharge
```

---

## 🚀 快速配置命令

### 一键配置（使用实际凭证替换）

```bash
cd /home/ling/coding/newAutoAnki

# 备份原 .env 文件
cp .env .env.backup

# 使用 sed 替换占位符（替换为您的实际值）
sed -i 's/your_paypal_client_id_here/您的实际Client_ID/' .env
sed -i 's/your_paypal_secret_here/您的实际Secret/' .env

# 验证配置
cat .env | grep PAYPAL

# 重启服务器
pkill -f "node server.js"
npm start
```

---

## 🎯 配置检查清单

- [x] ✅ `.env` 文件已存在
- [x] ✅ PayPal 配置模板已添加
- [ ] ⏳ 填写实际的 Client ID
- [ ] ⏳ 填写实际的 Secret
- [ ] ⏳ 重启服务器
- [ ] ⏳ 测试支付功能

---

## 💡 提示

### 不需要修改代码
- ✅ 应用已经配置好读取环境变量
- ✅ 只需在 `.env` 文件中填写凭证
- ✅ 重启服务器即可生效

### 安全建议
- 🔒 `.env` 文件包含敏感信息，不要提交到 Git
- 🔒 `.gitignore` 已配置忽略 `.env` 文件
- 🔒 生产环境使用单独的凭证

---

## 📞 需要帮助？

如果配置过程中遇到问题：

1. 查看服务器日志：
   ```bash
   tail -f /tmp/autoanki.log
   ```

2. 测试环境变量加载：
   ```bash
   node -e "require('dotenv').config(); console.log('PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID)"
   ```

3. 检查 PayPal SDK 是否安装：
   ```bash
   npm list @paypal/paypal-server-sdk
   ```

---

**配置完成后，您的应用就可以接受 PayPal 支付了！** 🎉


