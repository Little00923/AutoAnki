#!/bin/bash

# AutoAnki 快速充值脚本
# 用于手动给用户充值积分

echo "╔═══════════════════════════════════╗"
echo "║   AutoAnki 快速充值工具          ║"
echo "╚═══════════════════════════════════╝"
echo ""

# 检查数据库文件
if [ ! -f "database/autoanki.db" ]; then
    echo "❌ 错误：数据库文件不存在"
    exit 1
fi

# 获取用户输入
read -p "请输入用户名: " username

# 检查用户是否存在
USER_EXISTS=$(sqlite3 database/autoanki.db "SELECT COUNT(*) FROM users WHERE username='$username'")
if [ "$USER_EXISTS" -eq 0 ]; then
    echo "❌ 错误：用户 '$username' 不存在"
    exit 1
fi

echo "✓ 用户存在"

# 显示当前积分
CURRENT_CREDITS=$(sqlite3 database/autoanki.db "SELECT credits FROM users WHERE username='$username'")
echo "📊 当前积分: $CURRENT_CREDITS"
echo ""

# 获取充值金额
read -p "请输入充值金额（元）: " amount

# 验证输入
if ! [[ "$amount" =~ ^[0-9]+$ ]] || [ "$amount" -le 0 ]; then
    echo "❌ 错误：请输入有效的金额"
    exit 1
fi

# 计算积分（1元 = 100积分）
credits=$((amount * 100))

echo ""
echo "充值信息确认："
echo "  用户名: $username"
echo "  充值金额: ¥$amount"
echo "  获得积分: $credits"
echo "  当前积分: $CURRENT_CREDITS"
echo "  充值后积分: $((CURRENT_CREDITS + credits))"
echo ""

read -p "确认充值？(y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ 已取消充值"
    exit 0
fi

# 执行充值
sqlite3 database/autoanki.db << EOF
BEGIN TRANSACTION;

-- 更新用户积分
UPDATE users 
SET credits = credits + $credits,
    updated_at = CURRENT_TIMESTAMP
WHERE username = '$username';

-- 记录交易
INSERT INTO credit_transactions (user_id, amount, type, description, balance_after, created_at)
SELECT id, $credits, 'recharge', '手动充值 ¥${amount}', credits, CURRENT_TIMESTAMP
FROM users 
WHERE username = '$username';

COMMIT;
EOF

# 检查是否成功
if [ $? -eq 0 ]; then
    NEW_CREDITS=$(sqlite3 database/autoanki.db "SELECT credits FROM users WHERE username='$username'")
    echo ""
    echo "✅ 充值成功！"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  用户: $username"
    echo "  充值: +$credits 积分"
    echo "  当前积分: $NEW_CREDITS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 记录到日志
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 充值: $username +$credits积分 (¥$amount)" >> recharge.log
else
    echo "❌ 充值失败"
    exit 1
fi


