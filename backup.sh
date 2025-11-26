#!/bin/bash
# AutoAnki 数据库备份脚本

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 配置
BACKUP_DIR="./backups"
DB_PATH="./database/autoanki.db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/autoanki_$DATE.db"
KEEP_DAYS=7  # 保留最近7天的备份

echo -e "${GREEN}🗄️  AutoAnki 数据库备份${NC}"
echo "================================"

# 检查数据库是否存在
if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}❌ 数据库文件不存在: $DB_PATH${NC}"
    exit 1
fi

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份数据库
echo "📦 正在备份数据库..."
cp "$DB_PATH" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    # 获取文件大小
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ 备份成功！${NC}"
    echo "   文件: $BACKUP_FILE"
    echo "   大小: $SIZE"
    
    # 清理旧备份
    echo ""
    echo "🧹 清理旧备份（保留最近${KEEP_DAYS}天）..."
    DELETED=$(find "$BACKUP_DIR" -name "autoanki_*.db" -mtime +$KEEP_DAYS -delete -print | wc -l)
    
    if [ $DELETED -gt 0 ]; then
        echo -e "${YELLOW}   已删除 $DELETED 个旧备份${NC}"
    else
        echo "   无需清理"
    fi
    
    # 显示当前备份列表
    echo ""
    echo "📋 当前备份列表:"
    ls -lh "$BACKUP_DIR" | tail -n +2 | awk '{print "   " $9 " (" $5 ")"}'
    
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.db 2>/dev/null | wc -l)
    echo ""
    echo -e "${GREEN}总计: $BACKUP_COUNT 个备份文件${NC}"
else
    echo -e "${RED}❌ 备份失败！${NC}"
    exit 1
fi

echo ""
echo "💡 恢复备份："
echo "   cp $BACKUP_FILE $DB_PATH"


