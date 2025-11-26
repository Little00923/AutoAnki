# 🧪 快速测试指南

## 测试新的试用逻辑

### 准备工作

1. **清除浏览器数据**
```javascript
// 在浏览器控制台（F12）执行
localStorage.clear();
location.reload();
```

2. **确认服务器运行**
```bash
curl http://localhost:3000/api/health
# 应返回: {"status":"ok","hasApiKey":true,...}
```

## 🎯 测试场景

### 场景1: 未登录用户试用

#### 测试步骤

1. **访问主页**
   - URL: http://localhost:3000
   - 检查显示: `🎁 免费试用: 3/3 次`

2. **第一次试用**
   ```
   操作: 输入学习材料，设置生成 2 张卡片
   点击: "制卡"
   预期: ✅ 成功生成 2 张卡片
   显示: 🎁 免费试用: 2/3 次
   ```

3. **第二次试用**
   ```
   操作: 返回主页，再次生成 2 张
   预期: ✅ 成功生成
   显示: 🎁 免费试用: 1/3 次
   ```

4. **第三次试用**
   ```
   操作: 返回主页，再次生成 2 张
   预期: ✅ 成功生成
   显示: 🎁 免费试用: 0/3 次
   ```

5. **第四次尝试**
   ```
   操作: 返回主页，尝试生成卡片
   预期: ❌ 提示 "免费试用次数已用完，请登录继续使用"
   弹窗: 询问是否前往登录页
   ```

6. **刷新测试**
   ```
   操作: 刷新浏览器（F5）
   预期: ✅ 显示仍为 "0/3 次"（不会重置）
   ```

7. **尝试生成超过2张**
   ```
   操作: 清除localStorage，设置生成 3 张或更多
   预期: ❌ 提示 "未登录用户每次只能生成2张卡片"
   ```

### 场景2: 新用户注册

#### 测试步骤

1. **进入注册页**
   ```
   操作: 点击 "登录/注册"
   预期: 显示提示
         "🎁 未登录用户：每次生成2张，共可试用3次"
         "🎉 注册即送300积分（可生成20张卡片）"
   ```

2. **注册新账号**
   ```
   填写:
   - 用户名: testuser123
   - 邮箱: test123@example.com  
   - 密码: password123
   
   操作: 点击 "注册"
   预期: ✅ 注册成功，自动登录
   ```

3. **检查赠送积分**
   ```
   检查: 右上角显示 "💎 积分: 300"
   预期: ✅ 不显示试用次数（只显示积分）
   ```

4. **生成卡片测试**
   ```
   操作: 生成 5 张卡片
   预期: ✅ 成功生成
   显示: 💎 积分: 225 (300 - 75)
   ```

5. **验证数据库**
   ```bash
   # 在服务器端执行
   sqlite3 database/autoanki.db
   
   # 查看新用户积分
   SELECT username, credits FROM users WHERE username = 'testuser123';
   
   # 查看赠送记录
   SELECT * FROM credit_transactions 
   WHERE user_id = (SELECT id FROM users WHERE username = 'testuser123')
   AND description = '新用户注册赠送';
   ```

### 场景3: 已有用户登录

#### 测试步骤

1. **使用已有账号登录**
   ```
   操作: 登录已注册账号
   预期: 显示实际积分余额
   ```

2. **检查是否有试用**
   ```
   预期: ❌ 不显示试用次数
         ✅ 只显示积分
   ```

3. **生成卡片**
   ```
   操作: 生成卡片
   预期: ✅ 直接扣积分，不使用试用
   ```

## 🔍 检查点清单

### 前端显示检查

- [ ] 未登录显示: `🎁 免费试用: X/3 次`
- [ ] 已登录显示: `💎 积分: XXX`（不显示试用）
- [ ] 登录页提示正确
- [ ] 用户中心说明正确

### 功能检查

- [ ] 未登录每次只能生成2张
- [ ] 未登录总共只能试用3次
- [ ] 刷新后试用次数不重置
- [ ] 新用户注册自动获得300积分
- [ ] 已登录用户不使用试用，直接扣积分
- [ ] 积分不足时正确提示充值

### 数据库检查

- [ ] `system_config` 表包含新配置项
- [ ] 新用户 `credits` 字段为 300
- [ ] `credit_transactions` 记录注册赠送
- [ ] `card_generations` 正确记录试用次数

## 📊 数据库验证命令

### 查看系统配置

```bash
sqlite3 database/autoanki.db "SELECT * FROM system_config;"
```

应显示:
```
credits_per_card|15|每张卡片消耗积分数
free_trial_times|3|未登录用户免费试用次数
free_trial_cards_per_time|2|未登录用户每次可生成卡片数
new_user_gift_credits|300|新用户注册赠送积分
recharge_rate|100|充值汇率：1元=100积分
```

### 查看用户积分

```bash
sqlite3 database/autoanki.db "SELECT id, username, credits FROM users ORDER BY id DESC LIMIT 5;"
```

### 查看试用记录

```bash
sqlite3 database/autoanki.db "
SELECT 
    session_id,
    COUNT(*) as times_used,
    SUM(card_count) as total_cards
FROM card_generations
WHERE user_id IS NULL AND is_trial = 1
GROUP BY session_id;
"
```

### 查看注册赠送记录

```bash
sqlite3 database/autoanki.db "
SELECT 
    u.username,
    ct.amount,
    ct.description,
    ct.created_at
FROM credit_transactions ct
JOIN users u ON ct.user_id = u.id
WHERE ct.description = '新用户注册赠送'
ORDER BY ct.created_at DESC
LIMIT 10;
"
```

## 🐛 故障排查

### 问题1: 显示还是旧的 "10/10 张"

**原因**: 浏览器缓存

**解决**:
```javascript
// 强制刷新
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (macOS)

// 或清除缓存
localStorage.clear();
location.reload();
```

### 问题2: 注册后没有300积分

**检查**:
```bash
# 查看数据库
sqlite3 database/autoanki.db "
SELECT * FROM users WHERE username = 'your_username';
"

# 查看交易记录
sqlite3 database/autoanki.db "
SELECT * FROM credit_transactions 
WHERE user_id = (SELECT id FROM users WHERE username = 'your_username');
"
```

**解决**:
```bash
# 手动补充积分（如果确实丢失）
sqlite3 database/autoanki.db "
UPDATE users SET credits = 300 WHERE username = 'your_username';

INSERT INTO credit_transactions (user_id, amount, type, description, balance_after)
SELECT id, 300, 'recharge', '手动补发注册赠送', 300
FROM users WHERE username = 'your_username';
"
```

### 问题3: 刷新后试用次数重置

**检查 localStorage**:
```javascript
// 在控制台执行
console.log(localStorage.getItem('anonymousTrialUsed'));
// 应该显示数字: "0", "1", "2", 或 "3"
```

**原因**:
- 可能在无痕模式下
- 可能浏览器设置禁用了 localStorage

### 问题4: API 返回 500 错误

**查看日志**:
```bash
tail -50 /tmp/autoanki.log
```

**检查数据库**:
```bash
# 确认数据库完整性
sqlite3 database/autoanki.db "PRAGMA integrity_check;"
```

## 🎯 性能测试

### 测试并发注册

```bash
# 使用 Apache Bench 测试（如果安装了）
ab -n 10 -c 2 -p register.json -T application/json http://localhost:3000/api/auth/register

# register.json 内容:
# {"username":"test","email":"test@test.com","password":"123456"}
```

### 测试试用限制

```bash
# 使用 curl 测试
for i in {1..4}; do
    echo "尝试 $i:"
    curl -X POST http://localhost:3000/api/generate-cards \
         -H "Content-Type: application/json" \
         -d '{"material":"测试材料","cardCount":2}' \
         --cookie-jar cookies.txt --cookie cookies.txt
    echo -e "\n---\n"
    sleep 1
done
```

## ✅ 测试完成标准

全部通过以下测试即为成功:

- [x] 未登录用户每次只能生成2张 ✓
- [x] 未登录用户总共试用3次 ✓
- [x] localStorage 正确追踪，防刷新 ✓
- [x] 新用户注册获得300积分 ✓
- [x] 已登录用户直接使用积分 ✓
- [x] 前端显示正确 ✓
- [x] 数据库记录正确 ✓
- [x] API配置返回正确 ✓

---

**测试环境**: http://localhost:3000  
**数据库**: `database/autoanki.db`  
**日志文件**: `/tmp/autoanki.log`


