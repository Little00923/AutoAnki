# 💳 PayPal 支付配置指南

## 概述

AutoAnki 使用 PayPal 作为国际支付方式，支持全球用户充值。

---

## 🚀 快速配置

### 步骤1：创建 PayPal 开发者账号

1. 访问：https://developer.paypal.com/
2. 点击 "Log in to Dashboard"
3. 使用 PayPal 账号登录（或注册新账号）

### 步骤2：创建应用

1. 登录后，点击 "My Apps & Credentials"
2. 选择 "Sandbox" 标签（测试环境）
3. 点击 "Create App"
4. 输入应用名称：`AutoAnki`
5. 点击 "Create App"

### 步骤3：获取 API 密钥

创建应用后，您会看到：

```
Client ID: AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ
Secret: ExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ
```

### 步骤4：配置环境变量

在项目根目录的 `.env` 文件中添加：

```bash
# PayPal 配置
PAYPAL_MODE=sandbox                    # sandbox 或 live
PAYPAL_CLIENT_ID=你的Client_ID
PAYPAL_CLIENT_SECRET=你的Secret
PAYPAL_RETURN_URL=http://localhost:3000/payment-success
PAYPAL_CANCEL_URL=http://localhost:3000/payment-cancel
```

**生产环境配置**：
```bash
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=生产环境的Client_ID
PAYPAL_CLIENT_SECRET=生产环境的Secret
PAYPAL_RETURN_URL=https://yourdomain.com/payment-success
PAYPAL_CANCEL_URL=https://yourdomain.com/payment-cancel
```

---

## 💰 价格设置

### 国际定价建议

| 积分包 | 美元价格 | 积分数 | 单位成本 |
|-------|---------|--------|----------|
| Basic | $1.99 | 1000 | $0.00199/积分 |
| Popular | $9.99 | 5000 | $0.00199/积分 |
| Pro | $19.99 | 10000 | $0.00199/积分 |
| Premium | $49.99 | 25000 | $0.00199/积分 |

按照 15积分/卡片，约 $0.03/卡片

---

## 🔧 PayPal SDK 安装

```bash
npm install @paypal/checkout-server-sdk
```

---

## 📝 集成说明

### 后端集成

PayPal 支付流程：
1. 用户选择充值金额
2. 创建 PayPal 订单
3. 跳转到 PayPal 支付页面
4. 用户完成支付
5. PayPal 回调通知
6. 验证支付并充值积分

### 前端集成

使用 PayPal JavaScript SDK：

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD"></script>
```

---

## 🧪 测试支付

### 测试账号

PayPal Sandbox 提供测试账号：

**买家账号（用于测试购买）**:
- Email: sb-buyer@personal.example.com
- Password: 在 Sandbox 账号页面查看

**卖家账号（收款账号）**:
- Email: sb-seller@business.example.com
- Password: 在 Sandbox 账号页面查看

### 测试卡号

PayPal 测试环境接受任何有效格式的信用卡。

### 测试流程

1. 选择充值金额
2. 点击 PayPal 支付
3. 使用测试买家账号登录
4. 完成支付
5. 验证积分到账

---

## 🌍 支持的货币

PayPal 支持多种货币：

- **USD** - 美元（默认）
- **EUR** - 欧元
- **GBP** - 英镑
- **JPY** - 日元
- **CNY** - 人民币
- **AUD** - 澳元
- **CAD** - 加元

---

## 🔒 安全建议

### 1. 验证 Webhook

```javascript
const crypto = require('crypto');

function verifyPayPalWebhook(headers, body) {
    const signature = headers['paypal-transmission-sig'];
    const transmissionId = headers['paypal-transmission-id'];
    const timestamp = headers['paypal-transmission-time'];
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    
    // 验证逻辑
    // ...
}
```

### 2. 使用 HTTPS

生产环境必须使用 HTTPS。

### 3. 限制充值金额

```javascript
const MIN_AMOUNT = 1.99;    // 最小充值 $1.99
const MAX_AMOUNT = 999.99;  // 最大充值 $999.99
```

---

## 📊 手续费说明

### PayPal 手续费

- **国内交易**: 2.9% + $0.30 USD
- **国际交易**: 4.4% + 固定费用
- **货币转换**: 约 3-4%

### 定价建议

考虑手续费后的定价：
```
实际收入 = 充值金额 - 手续费
$9.99 - ($9.99 × 0.029 + $0.30) = $9.40

建议定价时考虑 5% 的手续费余量
```

---

## 🔄 Webhook 配置

### 1. 创建 Webhook

在 PayPal 开发者控制台：
1. 进入应用设置
2. 点击 "Add Webhook"
3. Webhook URL: `https://yourdomain.com/api/payment/paypal/webhook`
4. 选择事件类型：
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`

### 2. 验证 Webhook

```javascript
app.post('/api/payment/paypal/webhook', async (req, res) => {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const headers = req.headers;
    const body = req.body;
    
    // 验证签名
    const isValid = await verifyWebhookSignature(webhookId, headers, body);
    
    if (!isValid) {
        return res.status(400).send('Invalid signature');
    }
    
    // 处理事件
    const event = body.event_type;
    if (event === 'PAYMENT.CAPTURE.COMPLETED') {
        // 充值积分
        await processPayment(body);
    }
    
    res.status(200).send('OK');
});
```

---

## 📱 移动端支持

PayPal SDK 自动适配移动端：
- 手机浏览器：显示移动优化界面
- PayPal App：支持应用内支付

---

## 🐛 常见问题

### Q1: 如何切换到生产环境？

1. 在 PayPal Dashboard 切换到 "Live" 标签
2. 创建生产环境应用
3. 获取生产环境的 Client ID 和 Secret
4. 更新 `.env` 文件：`PAYPAL_MODE=live`

### Q2: 支付成功但未到账？

检查：
1. Webhook 是否正确配置
2. 订单状态是否更新
3. 查看服务器日志
4. 检查数据库交易记录

### Q3: 如何退款？

```javascript
const refund = await paypal.payments.refund({
    amount: {
        total: '9.99',
        currency: 'USD'
    }
});
```

---

## 📚 相关文档

- [PayPal 开发者文档](https://developer.paypal.com/docs/)
- [PayPal REST API](https://developer.paypal.com/docs/api/overview/)
- [PayPal SDK for Node.js](https://github.com/paypal/Checkout-NodeJS-SDK)
- [PayPal Webhooks](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)

---

## ✅ 配置检查清单

- [ ] 创建 PayPal 开发者账号
- [ ] 创建应用并获取 API 密钥
- [ ] 配置环境变量
- [ ] 安装 PayPal SDK
- [ ] 配置 Webhook
- [ ] 测试 Sandbox 支付
- [ ] 切换到生产环境
- [ ] 验证真实支付

---

**配置完成后即可接受全球用户的 PayPal 支付！** 🎉


