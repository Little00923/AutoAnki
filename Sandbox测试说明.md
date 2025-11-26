# 💰 Sandbox 测试与积分余额说明

## ✅ 核心答案

**Sandbox 测试会增加余额吗？**

**会的！** Sandbox 完成支付后，**会真实增加应用内的积分余额**。

---

## 🔍 详细解释

### Sandbox vs Live 的区别

| 特性 | Sandbox（测试） | Live（生产） |
|-----|----------------|-------------|
| **PayPal 环境** | 测试环境 | 真实环境 |
| **支付账号** | 测试账号（虚拟） | 真实 PayPal 账号 |
| **钱** | 虚拟钱（不扣真钱） | 真钱（真实扣款） |
| **应用积分** | ✅ **真实增加** | ✅ **真实增加** |
| **数据库** | 真实数据库 | 真实数据库 |
| **可生成卡片** | ✅ 可以 | ✅ 可以 |

---

## 💡 工作流程对比

### Sandbox 模式流程

```
1. 用户点击充值 $5
   ↓
2. 跳转到 PayPal Sandbox 测试环境
   ↓
3. 使用【测试账号】登录
   （虚拟账号，如 test@example.com）
   ↓
4. 使用【虚拟钱】完成支付
   （不扣真钱！）
   ↓
5. 返回应用
   ↓
6. ✅ 积分 +3500（真实增加！）
   ↓
7. 可以用这些积分生成卡片
```

### Live 模式流程

```
1. 用户点击充值 $5
   ↓
2. 跳转到 PayPal 真实环境
   ↓
3. 使用【真实 PayPal 账号】登录
   ↓
4. 从【真实银行卡/余额】扣款 $5
   （真实扣款！）
   ↓
5. 返回应用
   ↓
6. ✅ 积分 +3500（真实增加！）
   ↓
7. 可以用这些积分生成卡片
```

**关键区别**：
- Sandbox：虚拟支付，但积分真实增加
- Live：真实支付，积分真实增加

---

## 🎯 为什么 Sandbox 也会增加积分？

### 代码逻辑

无论 Sandbox 还是 Live，支付完成后都会执行相同的积分充值逻辑：

```javascript
// services/paypal-service.js - processPayment 函数

async function processPayment(orderNo) {
    // 1. 查找订单
    const order = await orderOperations.findByOrderNo(orderNo);
    
    // 2. 更新订单状态为"已支付"
    await orderOperations.updateStatus(orderNo, 'paid', new Date());
    
    // 3. 充值积分（无论 sandbox 还是 live）
    await creditOperations.recharge(
        order.user_id,    // 用户ID
        order.amount,     // 金额
        order.credits     // 积分数量
    );
    
    // ✓ 积分真实增加到数据库！
}
```

**重点**：代码不区分 Sandbox 和 Live，只要支付完成，就会：
1. ✅ 在数据库中增加积分
2. ✅ 更新订单状态
3. ✅ 记录充值历史

---

## 📊 实际测试示例

### 测试场景：Sandbox 充值 $5

#### 操作前
```
用户积分：300
账户余额：300
```

#### 操作
```
1. 进入用户中心
2. 点击"充值"
3. 选择 $5
4. 跳转到 PayPal Sandbox
5. 使用测试账号登录
6. 完成虚拟支付
7. 返回应用
```

#### 操作后
```
用户积分：3800  ← 增加了 3500（$5 × 700）
账户余额：3800
充值记录：+$5 (3500积分)
订单状态：已支付
```

**结论**：✅ 积分真实增加！可以正常使用！

---

## 🆚 三种模式对比

实际上我们的应用支持三种模式：

### 模式1：Sandbox（测试环境）

**配置**：
```bash
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=您的_Sandbox_Client_ID
PAYPAL_CLIENT_SECRET=您的_Sandbox_Secret
```

**特点**：
- ✅ 连接 PayPal 测试环境
- ✅ 使用虚拟支付
- ✅ 积分真实增加
- ✅ 可以测试完整流程
- 💰 不扣真钱

**适用场景**：开发测试、演示

---

### 模式2：Live（生产环境）

**配置**：
```bash
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=您的_Live_Client_ID
PAYPAL_CLIENT_SECRET=您的_Live_Secret
```

**特点**：
- ✅ 连接 PayPal 真实环境
- ✅ 真实支付
- ✅ 积分真实增加
- 💰 扣真钱

**适用场景**：正式运营

---

### 模式3：Test（纯测试模式）

**配置**：
```bash
PAYPAL_CLIENT_ID=test
PAYPAL_CLIENT_SECRET=test
```

**特点**：
- ✅ 不连接 PayPal
- ✅ 模拟支付（立即成功）
- ✅ 积分真实增加
- 💰 不涉及真钱
- ⚠️ 仅用于功能测试

**适用场景**：无 PayPal 账号时的功能测试

---

## 🎓 常见问题

### Q1: Sandbox 充值的积分可以用来生成卡片吗？

**A**: ✅ 可以！积分是真实存储在数据库中的，可以正常使用。

### Q2: Sandbox 测试会扣我的钱吗？

**A**: ❌ 不会！Sandbox 使用虚拟钱包，不会扣真钱。

### Q3: 如何获取 Sandbox 测试账号？

**A**: 在 PayPal Developer Dashboard 中创建测试账号：

```
1. 访问：https://developer.paypal.com/
2. 登录
3. 进入：Sandbox → Accounts
4. 创建测试买家账号（Buyer Account）
5. 使用这个账号测试支付
```

### Q4: Sandbox 积分会自动消失吗？

**A**: ❌ 不会！积分存储在本地数据库中，除非：
- 手动删除数据库
- 使用管理命令清除
- 重置数据库

### Q5: 我应该用 Sandbox 还是 Live？

**A**: 
- **开发/测试阶段**：使用 Sandbox
- **正式运营**：切换到 Live

### Q6: 如何切换 Sandbox 和 Live？

**A**: 编辑 `.env` 文件：

```bash
# 开发测试
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=Sandbox_Client_ID
PAYPAL_CLIENT_SECRET=Sandbox_Secret

# 正式运营（切换后重启服务器）
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=Live_Client_ID
PAYPAL_CLIENT_SECRET=Live_Secret
```

然后重启：
```bash
./restart.sh
```

---

## 🔧 实际测试步骤

### 准备工作

1. **确保使用 Sandbox 模式**
   ```bash
   cat .env | grep PAYPAL_MODE
   # 应该看到：PAYPAL_MODE=sandbox
   ```

2. **准备测试账号**
   - 在 PayPal Developer 创建测试买家账号
   - 或使用现有测试账号

### 测试流程

```bash
# 1. 启动服务器
./restart.sh

# 2. 打开浏览器
访问：http://localhost:3000

# 3. 登录/注册账号
查看当前积分

# 4. 进入用户中心 → 充值
选择金额（如 $5）

# 5. 点击"确认充值"
跳转到 PayPal Sandbox

# 6. 使用测试账号登录
Email: 测试账号@sandbox.paypal.com
Password: 测试密码

# 7. 完成支付
点击"立即付款"

# 8. 返回应用
检查积分是否增加

# 9. 测试生成卡片
使用新增的积分生成卡片
```

### 验证结果

```bash
# 查看数据库
sqlite3 database/autoanki.db

# 查询用户积分
SELECT id, username, credits FROM users;

# 查询充值记录
SELECT * FROM credit_history WHERE type='recharge' ORDER BY id DESC LIMIT 5;

# 查询订单
SELECT * FROM orders WHERE status='paid' ORDER BY id DESC LIMIT 5;
```

---

## 📋 总结

### 核心要点

1. ✅ **Sandbox 会增加积分余额**
   - 积分是真实存储在数据库中的
   - 可以正常使用这些积分

2. ✅ **Sandbox 不扣真钱**
   - 使用虚拟支付
   - 适合测试和开发

3. ✅ **Sandbox 和 Live 的区别**
   - 只在支付方式上不同（虚拟 vs 真实）
   - 积分充值逻辑完全相同

4. ✅ **推荐使用流程**
   ```
   开发 → Sandbox 测试 → 验证无误 → 切换到 Live
   ```

---

## 🎯 快速参考

| 场景 | 使用模式 | 会增加积分吗 | 会扣真钱吗 |
|-----|---------|------------|-----------|
| 开发测试 | Sandbox | ✅ 会 | ❌ 不会 |
| 演示 | Sandbox | ✅ 会 | ❌ 不会 |
| 无PayPal账号 | Test | ✅ 会 | ❌ 不会 |
| 正式运营 | Live | ✅ 会 | ✅ 会 |

---

**结论：Sandbox 模式完全可以用来测试，充值的积分是真实有效的！** 🎉


