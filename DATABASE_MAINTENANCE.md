# 📊 AutoAnki 数据库维护指南

## 数据库概览

### 基本信息
- **数据库类型**: SQLite3
- **数据库文件**: `database/autoanki.db`
- **数据库大小**: 轻量级（通常小于10MB）
- **数据库引擎**: better-sqlite3 / sqlite3

### 数据表结构

| 表名 | 用途 | 主要字段 |
|------|------|----------|
| `users` | 用户信息 | id, username, email, credits, free_cards_used |
| `credit_transactions` | 积分交易记录 | user_id, amount, type, balance_after |
| `orders` | 充值订单 | user_id, order_no, amount, credits, status |
| `card_generations` | 卡片生成记录 | user_id, session_id, card_count, credits_used |
| `system_config` | 系统配置 | key, value, description |

## 🛠️ 数据库管理工具

### 1. SQLite CLI（命令行）

#### 安装
```bash
# Ubuntu/Debian
sudo apt-get install sqlite3

# macOS
brew install sqlite3

# Windows
# 从 https://www.sqlite.org/download.html 下载
```

#### 使用
```bash
# 进入数据库
sqlite3 database/autoanki.db

# SQLite 命令
.tables              # 查看所有表
.schema users        # 查看表结构
.mode column         # 设置列模式显示
.headers on          # 显示列名
.quit                # 退出
```

### 2. SQLite Browser（图形界面，推荐）

#### 安装
```bash
# Ubuntu/Debian
sudo apt-get install sqlitebrowser

# macOS
brew install --cask db-browser-for-sqlite

# Windows
# 从 https://sqlitebrowser.org/dl/ 下载
```

#### 使用
1. 启动 DB Browser for SQLite
2. 打开数据库：`File -> Open Database`
3. 选择 `database/autoanki.db`
4. 可以浏览数据、执行查询、修改数据等

### 3. VS Code 扩展（如果使用 VS Code）

推荐扩展：
- **SQLite Viewer**: 可以直接在 VS Code 中查看和编辑 SQLite 数据库
- **SQLite**: 提供语法高亮和智能提示

## 📋 常用维护任务

### 1. 查看用户信息

```sql
-- 查看所有用户
SELECT id, username, email, credits, free_cards_used, created_at 
FROM users 
ORDER BY created_at DESC;

-- 查看特定用户
SELECT * FROM users WHERE username = 'your_username';

-- 查看积分前10的用户
SELECT username, credits 
FROM users 
ORDER BY credits DESC 
LIMIT 10;
```

### 2. 管理用户积分

```sql
-- 给用户充值积分（手动充值）
-- 注意：需要同时更新 users 表和 credit_transactions 表

-- 步骤1：更新用户积分
UPDATE users 
SET credits = credits + 1000 
WHERE username = 'your_username';

-- 步骤2：记录交易（推荐使用应用程序的充值功能）
-- 或手动插入：
INSERT INTO credit_transactions (user_id, amount, type, description, balance_after)
SELECT id, 1000, 'recharge', '手动充值', credits
FROM users 
WHERE username = 'your_username';

-- 查看用户当前积分
SELECT username, credits FROM users WHERE username = 'your_username';
```

### 3. 重置试用额度

```sql
-- 重置特定用户的试用额度
UPDATE users 
SET free_cards_used = 0 
WHERE username = 'your_username';

-- 重置所有用户的试用额度（谨慎使用）
UPDATE users SET free_cards_used = 0;

-- 删除匿名用户的试用记录
DELETE FROM card_generations 
WHERE user_id IS NULL AND is_trial = 1;
```

### 4. 查看积分消费记录

```sql
-- 查看用户的所有交易记录
SELECT 
    ct.created_at,
    ct.type,
    ct.amount,
    ct.balance_after,
    ct.description
FROM credit_transactions ct
JOIN users u ON ct.user_id = u.id
WHERE u.username = 'your_username'
ORDER BY ct.created_at DESC;

-- 查看最近的消费记录
SELECT 
    u.username,
    ct.amount,
    ct.type,
    ct.description,
    ct.created_at
FROM credit_transactions ct
JOIN users u ON ct.user_id = u.id
WHERE ct.type = 'consume'
ORDER BY ct.created_at DESC
LIMIT 20;
```

### 5. 查看卡片生成统计

```sql
-- 查看总体统计
SELECT 
    COUNT(*) as total_generations,
    SUM(card_count) as total_cards,
    SUM(credits_used) as total_credits_used,
    SUM(CASE WHEN is_trial = 1 THEN card_count ELSE 0 END) as trial_cards
FROM card_generations;

-- 查看用户生成统计
SELECT 
    u.username,
    COUNT(*) as generations,
    SUM(cg.card_count) as total_cards,
    SUM(cg.credits_used) as credits_spent
FROM card_generations cg
JOIN users u ON cg.user_id = u.id
GROUP BY u.id
ORDER BY total_cards DESC;
```

### 6. 订单管理

```sql
-- 查看所有订单
SELECT 
    o.order_no,
    u.username,
    o.amount,
    o.credits,
    o.payment_method,
    o.status,
    o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC;

-- 查看待支付订单
SELECT * FROM orders WHERE status = 'pending';

-- 手动更新订单状态（谨慎使用）
UPDATE orders 
SET status = 'paid', payment_time = CURRENT_TIMESTAMP 
WHERE order_no = 'ORD123456789';
```

### 7. 系统配置管理

```sql
-- 查看所有配置
SELECT * FROM system_config;

-- 修改配置
UPDATE system_config SET value = '20' WHERE key = 'credits_per_card';
UPDATE system_config SET value = '15' WHERE key = 'free_trial_cards';
UPDATE system_config SET value = '15' WHERE key = 'logged_in_trial_cards';
UPDATE system_config SET value = '100' WHERE key = 'recharge_rate';
```

## 🔄 备份与恢复

### 自动备份脚本

创建备份脚本 `backup_db.sh`:

```bash
#!/bin/bash
# 数据库备份脚本

BACKUP_DIR="./backups"
DB_FILE="database/autoanki.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/autoanki_backup_$DATE.db"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
cp $DB_FILE $BACKUP_FILE

# 压缩备份
gzip $BACKUP_FILE

echo "数据库已备份到: ${BACKUP_FILE}.gz"

# 删除7天前的备份
find $BACKUP_DIR -name "autoanki_backup_*.db.gz" -mtime +7 -delete
```

使用：
```bash
chmod +x backup_db.sh
./backup_db.sh
```

### 手动备份

```bash
# 简单复制
cp database/autoanki.db database/autoanki.db.backup

# 带时间戳的备份
cp database/autoanki.db "database/autoanki.db.backup.$(date +%Y%m%d)"

# 压缩备份
tar -czf autoanki_backup_$(date +%Y%m%d).tar.gz database/autoanki.db
```

### 恢复备份

```bash
# 停止服务器
pkill -f "node server.js"

# 恢复数据库
cp database/autoanki.db.backup database/autoanki.db

# 或从压缩包恢复
gunzip -c backups/autoanki_backup_20251015.db.gz > database/autoanki.db

# 重启服务器
npm start
```

## 🧹 数据库维护

### 1. 清理旧数据

```sql
-- 删除30天前的匿名用户试用记录
DELETE FROM card_generations 
WHERE user_id IS NULL 
AND created_at < datetime('now', '-30 days');

-- 删除已取消的订单（90天前）
DELETE FROM orders 
WHERE status = 'cancelled' 
AND created_at < datetime('now', '-90 days');
```

### 2. 优化数据库

```bash
# 使用 SQLite CLI
sqlite3 database/autoanki.db "VACUUM;"
sqlite3 database/autoanki.db "ANALYZE;"
```

或在 SQL 中：
```sql
VACUUM;    -- 重建数据库文件，回收空间
ANALYZE;   -- 更新查询优化器统计信息
```

### 3. 检查数据库完整性

```bash
sqlite3 database/autoanki.db "PRAGMA integrity_check;"
```

应该返回 `ok`。

## 📊 监控和统计

### 创建监控查询脚本

```sql
-- stats.sql
-- 系统整体统计

SELECT '=== 用户统计 ===' as info;
SELECT 
    COUNT(*) as total_users,
    SUM(credits) as total_credits,
    AVG(credits) as avg_credits
FROM users;

SELECT '=== 卡片生成统计 ===' as info;
SELECT 
    COUNT(*) as total_generations,
    SUM(card_count) as total_cards,
    SUM(CASE WHEN is_trial = 1 THEN card_count ELSE 0 END) as trial_cards,
    SUM(CASE WHEN is_trial = 0 THEN card_count ELSE 0 END) as paid_cards
FROM card_generations;

SELECT '=== 今日统计 ===' as info;
SELECT 
    COUNT(DISTINCT user_id) as active_users,
    SUM(card_count) as cards_generated
FROM card_generations
WHERE date(created_at) = date('now');

SELECT '=== 订单统计 ===' as info;
SELECT 
    status,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    SUM(credits) as total_credits
FROM orders
GROUP BY status;
```

使用：
```bash
sqlite3 database/autoanki.db < stats.sql
```

## 🔐 安全建议

### 1. 文件权限

```bash
# 设置数据库文件权限（仅所有者可读写）
chmod 600 database/autoanki.db

# 设置数据库目录权限
chmod 700 database/
```

### 2. 定期备份

- 建议每天自动备份一次
- 保留至少7天的备份
- 重要数据建议异地备份

### 3. 访问控制

- 不要将数据库文件暴露在 web 服务器可访问的目录
- 使用防火墙限制数据库访问
- 定期审计数据库访问日志

## 🚀 性能优化

### 1. 添加索引（已在初始化时创建）

```sql
-- 如果需要添加额外的索引
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON credit_transactions(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_generations_user_date 
ON card_generations(user_id, created_at);
```

### 2. 查询优化

```sql
-- 使用 EXPLAIN QUERY PLAN 分析查询
EXPLAIN QUERY PLAN 
SELECT * FROM users WHERE username = 'test';
```

## 📞 常见问题

### Q: 数据库文件损坏怎么办？
A: 
1. 从最近的备份恢复
2. 使用 `PRAGMA integrity_check;` 检查
3. 如果部分损坏，可以尝试导出数据到新数据库

### Q: 如何迁移到 MySQL/PostgreSQL？
A: 
1. 导出 SQLite 数据为 SQL 文件
2. 使用迁移工具（如 pgloader）
3. 修改 `database/db.js` 适配新数据库

### Q: 数据库变大了怎么办？
A: 
1. 定期清理旧数据
2. 运行 `VACUUM` 回收空间
3. 归档历史数据

## 📚 相关资源

- [SQLite 官方文档](https://www.sqlite.org/docs.html)
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [SQLite 性能优化](https://www.sqlite.org/optoverview.html)

---

**维护建议**：
- ✅ 每天自动备份
- ✅ 每周查看统计数据
- ✅ 每月清理旧数据
- ✅ 每季度优化数据库（VACUUM）

**紧急联系**：如果遇到数据库问题，请参考本文档或查看 `database/db.js` 源代码。



