#!/bin/bash
# AutoAnki 数据库管理脚本
# 使用方法: ./db_manager.sh [命令]

DB_FILE="database/autoanki.db"

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查数据库文件
if [ ! -f "$DB_FILE" ]; then
    echo "❌ 数据库文件不存在: $DB_FILE"
    exit 1
fi

# 显示菜单
show_menu() {
    echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   AutoAnki 数据库管理工具          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
    echo ""
    echo "请选择操作："
    echo "  1) 查看所有用户"
    echo "  2) 查看用户详情"
    echo "  3) 给用户充值积分"
    echo "  4) 重置用户试用额度"
    echo "  5) 查看积分交易记录"
    echo "  6) 查看订单记录"
    echo "  7) 查看系统配置"
    echo "  8) 修改系统配置"
    echo "  9) 查看数据库统计"
    echo " 10) 备份数据库"
    echo " 11) 优化数据库"
    echo " 12) 进入 SQLite 控制台"
    echo "  0) 退出"
    echo ""
}

# 1. 查看所有用户
view_users() {
    echo -e "${BLUE}=== 所有用户 ===${NC}"
    sqlite3 -column -header "$DB_FILE" << 'EOF'
SELECT 
    id,
    username,
    email,
    credits as '积分',
    free_cards_used as '已用卡片',
    datetime(created_at, 'localtime') as '注册时间'
FROM users 
ORDER BY id DESC;
EOF
}

# 2. 查看用户详情
view_user_detail() {
    echo -n "请输入用户名或ID: "
    read input
    
    echo -e "${BLUE}=== 用户详情 ===${NC}"
    sqlite3 -column -header "$DB_FILE" << EOF
SELECT 
    id,
    username,
    email,
    credits as '积分余额',
    free_cards_used as '已使用卡片数',
    is_logged_in_trial_used as '试用标记',
    datetime(created_at, 'localtime') as '注册时间',
    datetime(updated_at, 'localtime') as '更新时间'
FROM users 
WHERE username = '$input' OR id = '$input';
EOF
    
    echo ""
    echo -e "${BLUE}=== 最近10条积分记录 ===${NC}"
    sqlite3 -column -header "$DB_FILE" << EOF
SELECT 
    ct.type as '类型',
    ct.amount as '金额',
    ct.balance_after as '余额',
    ct.description as '说明',
    datetime(ct.created_at, 'localtime') as '时间'
FROM credit_transactions ct
JOIN users u ON ct.user_id = u.id
WHERE u.username = '$input' OR u.id = '$input'
ORDER BY ct.created_at DESC 
LIMIT 10;
EOF
}

# 3. 给用户充值积分
recharge_user() {
    echo -n "请输入用户名: "
    read username
    echo -n "请输入充值积分数: "
    read credits
    echo -n "请输入充值说明（如：手动充值）: "
    read desc
    
    sqlite3 "$DB_FILE" << EOF
BEGIN TRANSACTION;

-- 更新用户积分
UPDATE users 
SET credits = credits + $credits 
WHERE username = '$username';

-- 记录交易
INSERT INTO credit_transactions (user_id, amount, type, description, balance_after)
SELECT id, $credits, 'recharge', '$desc', credits
FROM users 
WHERE username = '$username';

COMMIT;
EOF
    
    echo -e "${GREEN}✓ 充值成功！${NC}"
    
    # 显示充值后余额
    sqlite3 -column -header "$DB_FILE" << EOF
SELECT username, credits as '当前积分' 
FROM users 
WHERE username = '$username';
EOF
}

# 4. 重置用户试用额度
reset_trial() {
    echo -n "请输入用户名: "
    read username
    
    sqlite3 "$DB_FILE" << EOF
UPDATE users 
SET free_cards_used = 0 
WHERE username = '$username';
EOF
    
    echo -e "${GREEN}✓ 试用额度已重置！${NC}"
}

# 5. 查看积分交易记录
view_transactions() {
    echo -n "请输入用户名（留空查看全部）: "
    read username
    
    if [ -z "$username" ]; then
        echo -e "${BLUE}=== 最近20条交易记录 ===${NC}"
        sqlite3 -column -header "$DB_FILE" << 'EOF'
SELECT 
    u.username as '用户',
    ct.type as '类型',
    ct.amount as '金额',
    ct.balance_after as '余额',
    ct.description as '说明',
    datetime(ct.created_at, 'localtime') as '时间'
FROM credit_transactions ct
JOIN users u ON ct.user_id = u.id
ORDER BY ct.created_at DESC 
LIMIT 20;
EOF
    else
        echo -e "${BLUE}=== $username 的交易记录 ===${NC}"
        sqlite3 -column -header "$DB_FILE" << EOF
SELECT 
    ct.type as '类型',
    ct.amount as '金额',
    ct.balance_after as '余额',
    ct.description as '说明',
    datetime(ct.created_at, 'localtime') as '时间'
FROM credit_transactions ct
JOIN users u ON ct.user_id = u.id
WHERE u.username = '$username'
ORDER BY ct.created_at DESC;
EOF
    fi
}

# 6. 查看订单记录
view_orders() {
    echo -e "${BLUE}=== 订单记录 ===${NC}"
    sqlite3 -column -header "$DB_FILE" << 'EOF'
SELECT 
    o.order_no as '订单号',
    u.username as '用户',
    o.amount as '金额',
    o.credits as '积分',
    o.payment_method as '支付方式',
    o.status as '状态',
    datetime(o.created_at, 'localtime') as '创建时间'
FROM orders o
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC 
LIMIT 20;
EOF
}

# 7. 查看系统配置
view_config() {
    echo -e "${BLUE}=== 系统配置 ===${NC}"
    sqlite3 -column -header "$DB_FILE" << 'EOF'
SELECT 
    key as '配置项',
    value as '值',
    description as '说明'
FROM system_config;
EOF
}

# 8. 修改系统配置
update_config() {
    view_config
    echo ""
    echo -n "请输入要修改的配置项（key）: "
    read key
    echo -n "请输入新的值: "
    read value
    
    sqlite3 "$DB_FILE" << EOF
UPDATE system_config 
SET value = '$value', updated_at = CURRENT_TIMESTAMP 
WHERE key = '$key';
EOF
    
    echo -e "${GREEN}✓ 配置已更新！${NC}"
    echo -e "${YELLOW}注意：部分配置需要重启服务器才能生效${NC}"
}

# 9. 查看数据库统计
view_stats() {
    echo -e "${BLUE}=== 数据库统计 ===${NC}"
    
    echo "【用户统计】"
    sqlite3 -column -header "$DB_FILE" << 'EOF'
SELECT 
    COUNT(*) as '总用户数',
    SUM(credits) as '总积分',
    AVG(credits) as '平均积分'
FROM users;
EOF
    
    echo ""
    echo "【卡片生成统计】"
    sqlite3 -column -header "$DB_FILE" << 'EOF'
SELECT 
    COUNT(*) as '总生成次数',
    SUM(card_count) as '总卡片数',
    SUM(CASE WHEN is_trial = 1 THEN card_count ELSE 0 END) as '试用卡片',
    SUM(CASE WHEN is_trial = 0 THEN card_count ELSE 0 END) as '付费卡片'
FROM card_generations;
EOF
    
    echo ""
    echo "【今日统计】"
    sqlite3 -column -header "$DB_FILE" << 'EOF'
SELECT 
    COUNT(DISTINCT user_id) as '活跃用户',
    SUM(card_count) as '生成卡片数'
FROM card_generations
WHERE date(created_at) = date('now');
EOF
}

# 10. 备份数据库
backup_db() {
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/autoanki_backup_$DATE.db"
    
    cp "$DB_FILE" "$BACKUP_FILE"
    gzip "$BACKUP_FILE"
    
    echo -e "${GREEN}✓ 数据库已备份到: ${BACKUP_FILE}.gz${NC}"
    
    # 显示所有备份
    echo ""
    echo "现有备份文件："
    ls -lh "$BACKUP_DIR"/*.gz 2>/dev/null | tail -5
}

# 11. 优化数据库
optimize_db() {
    echo "正在优化数据库..."
    sqlite3 "$DB_FILE" "VACUUM;"
    sqlite3 "$DB_FILE" "ANALYZE;"
    echo -e "${GREEN}✓ 数据库优化完成！${NC}"
    
    # 显示数据库大小
    DB_SIZE=$(du -h "$DB_FILE" | cut -f1)
    echo "当前数据库大小: $DB_SIZE"
}

# 12. 进入 SQLite 控制台
open_console() {
    echo -e "${BLUE}进入 SQLite 控制台（输入 .quit 退出）${NC}"
    sqlite3 -column -header "$DB_FILE"
}

# 主循环
main() {
    while true; do
        show_menu
        read -p "请选择 (0-12): " choice
        echo ""
        
        case $choice in
            1) view_users ;;
            2) view_user_detail ;;
            3) recharge_user ;;
            4) reset_trial ;;
            5) view_transactions ;;
            6) view_orders ;;
            7) view_config ;;
            8) update_config ;;
            9) view_stats ;;
            10) backup_db ;;
            11) optimize_db ;;
            12) open_console ;;
            0) echo "再见！"; exit 0 ;;
            *) echo -e "${YELLOW}无效选择，请重试${NC}" ;;
        esac
        
        echo ""
        read -p "按回车继续..."
        clear
    done
}

# 如果有参数，执行特定命令
if [ $# -gt 0 ]; then
    case $1 in
        users) view_users ;;
        stats) view_stats ;;
        backup) backup_db ;;
        config) view_config ;;
        *) echo "未知命令: $1"; exit 1 ;;
    esac
else
    clear
    main
fi


