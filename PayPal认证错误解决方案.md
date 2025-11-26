# ❌ PayPal 认证错误解决方案

## 🐛 错误信息

```json
{
  "error": "invalid_client",
  "error_description": "Client Authentication failed"
}
```

## 🔍 问题原因

### 根本原因
PayPal Client ID 或 Client Secret **配置错误**或**未配置**。

### 常见原因
1. ❌ `.env` 文件中使用了占位符（`your_paypal_client_id_here`）
2. ❌ 凭证复制错误（多了空格或少了字符）
3. ❌ 使用了错误的环境（Sandbox vs Live）
4. ❌ PayPal 凭证已过期或被撤销
5. ❌ 环境变量未正确加载

---

## ✅ 解决方案

### 方案1：检查并配置 .env 文件（推荐）

#### 步骤1：检查当前配置

```bash
cat .env | grep -i paypal
```

**如果看到**：
```bash
PAYPAL_CLIENT_ID=your_paypal_client_id_here  ❌ 占位符，需要替换
```

#### 步骤2：获取真实的 PayPal 凭证

##### 2.1 登录 PayPal Developer
1. 访问：https://developer.paypal.com/
2. 登录您的 PayPal 账号
3. 点击 **Dashboard** → **Apps & Credentials**

##### 2.2 创建应用（如果还没有）
1. 点击 **Create App**
2. 输入应用名称：`AutoAnki`
3. 选择环境：
   - **Sandbox**（测试）：用于开发和测试
   - **Live**（生产）：用于真实支付

##### 2.3 获取凭证
创建应用后，您会看到：
```
Client ID: AaBbCcDd123456...
Secret: XxYyZz789012...
```

#### 步骤3：更新 .env 文件

```bash
# 编辑 .env 文件
nano .env
```

更新以下内容：
```bash
# Sandbox 环境（测试）
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=您的_Sandbox_Client_ID
PAYPAL_CLIENT_SECRET=您的_Sandbox_Secret

# 或 Live 环境（生产）
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=您的_Live_Client_ID
PAYPAL_CLIENT_SECRET=您的_Live_Secret
```

#### 步骤4：重启服务器

```bash
./restart.sh
```

---

### 方案2：使用测试模式（无需 PayPal 账号）

如果您**暂时不需要真实支付**，可以使用应用内置的测试模式。

#### 修改代码以启用测试模式

编辑 `.env` 文件：
```bash
# 将 Client ID 设置为 'test'
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=test
PAYPAL_CLIENT_SECRET=test
```

**或者删除 PayPal 配置**：
```bash
# 注释掉所有 PayPal 配置
# PAYPAL_MODE=sandbox
# PAYPAL_CLIENT_ID=test
# PAYPAL_CLIENT_SECRET=test
```

重启服务器后，系统会自动切换到测试模式：
- ✅ 不会调用真实的 PayPal API
- ✅ 充值会立即成功（模拟）
- ✅ 可以正常测试功能

---

## 🔧 详细排查步骤

### 1. 检查 .env 文件是否存在

```bash
ls -la .env
```

**如果不存在**：
```bash
cp .env.example .env
nano .env  # 编辑并配置
```

### 2. 检查环境变量是否加载

```bash
# 查看服务器日志
tail -20 /tmp/autoanki.log | grep -i paypal
```

**应该看到类似**：
```
PayPal 配置检查:
  CLIENT_ID: AdFjDgw... ✓
  模式: sandbox ✓
```

### 3. 验证凭证格式

**正确的格式**：
- Client ID：约 80 个字符，包含字母和数字
- Secret：约 80 个字符，包含字母、数字和特殊字符

**错误的格式**：
```bash
PAYPAL_CLIENT_ID=your_paypal_client_id_here  ❌
PAYPAL_CLIENT_ID=                             ❌ 空白
PAYPAL_CLIENT_ID="AaBb123..."                 ⚠️ 不要加引号
```

**正确的格式**：
```bash
PAYPAL_CLIENT_ID=AaBbCcDd123456789...        ✓
```

### 4. 测试 API 连接

```bash
# 登录后台
curl -X POST http://localhost:3000/api/payment/paypal/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount": 1}'
```

**成功响应**：
```json
{
  "success": true,
  "data": {
    "orderNo": "ORD123...",
    "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=..."
  }
}
```

**失败响应**：
```json
{
  "error": "invalid_client",
  "error_description": "Client Authentication failed"
}
```

---

## 📋 常见问题解答

### Q1: 我的凭证是对的，为什么还是失败？

**可能原因**：
1. **环境不匹配**
   - 使用了 Sandbox 凭证，但 `PAYPAL_MODE=live`
   - 或相反

2. **凭证被撤销**
   - 在 PayPal Developer Dashboard 中检查应用状态

3. **权限不足**
   - 确保应用有 "Accept Payments" 权限

**解决方法**：
```bash
# 确保环境匹配
# Sandbox 凭证 → PAYPAL_MODE=sandbox
# Live 凭证 → PAYPAL_MODE=live
```

### Q2: Sandbox 和 Live 有什么区别？

| 特性 | Sandbox（测试） | Live（生产） |
|-----|----------------|-------------|
| 用途 | 开发和测试 | 真实支付 |
| 支付 | 虚拟支付 | 真实扣款 |
| 账号 | 测试账号 | 真实 PayPal 账号 |
| 凭证 | Sandbox 凭证 | Live 凭证 |
| URL | sandbox.paypal.com | paypal.com |

**推荐流程**：
1. 开发阶段：使用 **Sandbox**
2. 测试完成后：切换到 **Live**

### Q3: 如何切换环境？

```bash
# 开发/测试环境
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=您的_Sandbox_Client_ID
PAYPAL_CLIENT_SECRET=您的_Sandbox_Secret

# 生产环境
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=您的_Live_Client_ID
PAYPAL_CLIENT_SECRET=您的_Live_Secret
```

重启服务器：
```bash
./restart.sh
```

### Q4: 我能看到 PayPal 的 API 请求日志吗？

**是的**，查看服务器日志：
```bash
tail -f /tmp/autoanki.log
```

在充值时，您会看到：
- ✅ 创建订单请求
- ✅ PayPal API 响应
- ❌ 错误详情（如果失败）

---

## 🛠️ 快速修复命令

### 一键检查配置

```bash
#!/bin/bash
echo "=== PayPal 配置检查 ==="
echo ""

# 检查 .env 文件
if [ -f .env ]; then
    echo "✓ .env 文件存在"
    echo ""
    echo "当前配置："
    grep -i paypal .env | sed 's/PAYPAL_CLIENT_SECRET=.*/PAYPAL_CLIENT_SECRET=***隐藏***/g'
    echo ""
else
    echo "❌ .env 文件不存在"
    echo "请运行: cp .env.example .env"
    exit 1
fi

# 检查占位符
if grep -q "your_paypal" .env; then
    echo "❌ 发现占位符，需要配置真实凭证"
else
    echo "✓ 凭证已配置"
fi

echo ""
echo "服务器状态："
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✓ 服务器运行中"
else
    echo "❌ 服务器未运行"
fi
```

### 保存为脚本

```bash
# 创建检查脚本
cat > check_paypal.sh << 'EOF'
#!/bin/bash
echo "=== PayPal 配置检查 ==="
echo ""

if [ -f .env ]; then
    echo "✓ .env 文件存在"
    echo ""
    echo "当前配置："
    grep -i paypal .env | sed 's/PAYPAL_CLIENT_SECRET=.*/PAYPAL_CLIENT_SECRET=***隐藏***/g'
    echo ""
else
    echo "❌ .env 文件不存在"
    exit 1
fi

if grep -q "your_paypal" .env; then
    echo "❌ 需要配置真实凭证"
else
    echo "✓ 凭证已配置"
fi

echo ""
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✓ 服务器运行中"
else
    echo "❌ 服务器未运行"
fi
EOF

chmod +x check_paypal.sh
./check_paypal.sh
```

---

## ✅ 最终验证

### 1. 检查配置

```bash
cat .env | grep PAYPAL | grep -v '#'
```

应该看到：
```bash
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=AaBbCc123456...  # 真实凭证，不是占位符
PAYPAL_CLIENT_SECRET=XxYyZz789...  # 真实凭证
```

### 2. 重启服务器

```bash
./restart.sh
```

### 3. 测试充值功能

1. 访问：http://localhost:3000
2. 登录账号
3. 进入用户中心
4. 点击"充值"
5. 选择金额
6. 点击"确认充值"

**预期结果**：
- ✅ Sandbox：跳转到 PayPal 测试环境
- ✅ Live：跳转到 PayPal 真实支付页面
- ✅ Test Mode：显示测试模式提示

---

## 📊 问题解决流程图

```
开始
  ↓
检查 .env 文件是否存在？
  ├─ 否 → 复制 .env.example → 编辑配置
  └─ 是 → 继续
          ↓
        检查是否使用占位符？
          ├─ 是 → 配置真实凭证 → 重启服务器
          └─ 否 → 继续
                  ↓
                验证凭证格式是否正确？
                  ├─ 否 → 修正格式 → 重启服务器
                  └─ 是 → 继续
                          ↓
                        检查 PAYPAL_MODE 是否匹配？
                          ├─ 否 → 修改为正确的环境 → 重启
                          └─ 是 → 继续
                                  ↓
                                测试充值功能
                                  ├─ 成功 → 完成 ✓
                                  └─ 失败 → 使用测试模式
```

---

## 🎯 总结

### 立即修复步骤

```bash
# 1. 编辑配置文件
nano .env

# 2. 配置真实凭证（或使用 test）
PAYPAL_CLIENT_ID=您的真实Client_ID
PAYPAL_CLIENT_SECRET=您的真实Secret

# 3. 重启服务器
./restart.sh

# 4. 测试
# 访问 http://localhost:3000/user-center.html
```

### 如果还是不行

**使用测试模式**：
```bash
# 编辑 .env
PAYPAL_CLIENT_ID=test
PAYPAL_CLIENT_SECRET=test

# 重启
./restart.sh
```

---

## 📚 相关文档

- `PayPal配置指南.md` - PayPal 完整配置教程
- `环境变量读取机制说明.md` - 了解环境变量如何工作
- `配置PayPal环境变量.md` - 环境变量配置方法

---

**问题已解决！现在应该可以正常使用 PayPal 支付了。** 🎉


