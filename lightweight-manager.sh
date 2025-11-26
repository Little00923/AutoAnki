#!/bin/bash
# AutoAnki 轻量级管理脚本（适用于1核1G服务器）

PID_FILE="app.pid"
LOG_FILE="logs/app.log"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd $APP_DIR

case "$1" in
    start)
        if [ -f $PID_FILE ]; then
            PID=$(cat $PID_FILE)
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "${YELLOW}服务已在运行 (PID: $PID)${NC}"
                exit 1
            else
                echo -e "${YELLOW}清理旧的PID文件${NC}"
                rm $PID_FILE
            fi
        fi
        
        # 创建日志目录
        mkdir -p logs
        
        # 设置环境变量（轻量级模式）
        export NODE_ENV=production
        export NODE_OPTIONS="--max-old-space-size=400"
        
        # 启动服务
        nohup node server.js > $LOG_FILE 2>&1 &
        echo $! > $PID_FILE
        
        sleep 2
        
        if ps -p $(cat $PID_FILE) > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 服务已启动${NC}"
            echo -e "   PID: $(cat $PID_FILE)"
            echo -e "   内存限制: 400MB"
            echo -e "   日志文件: $LOG_FILE"
            echo -e "   访问地址: http://localhost:3000"
        else
            echo -e "${RED}❌ 服务启动失败，查看日志: tail -f $LOG_FILE${NC}"
            rm $PID_FILE
            exit 1
        fi
        ;;
        
    stop)
        if [ ! -f $PID_FILE ]; then
            echo -e "${YELLOW}服务未运行${NC}"
            exit 1
        fi
        
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID
            sleep 2
            
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "${YELLOW}强制停止...${NC}"
                kill -9 $PID
            fi
            
            rm $PID_FILE
            echo -e "${GREEN}⏹️  服务已停止${NC}"
        else
            echo -e "${YELLOW}进程不存在，清理PID文件${NC}"
            rm $PID_FILE
        fi
        ;;
        
    restart)
        echo -e "${BLUE}🔄 重启服务...${NC}"
        $0 stop
        sleep 3
        $0 start
        ;;
        
    status)
        if [ -f $PID_FILE ]; then
            PID=$(cat $PID_FILE)
            if ps -p $PID > /dev/null 2>&1; then
                MEM=$(ps -p $PID -o rss= | awk '{printf "%.1f", $1/1024}')
                CPU=$(ps -p $PID -o %cpu= | awk '{printf "%.1f", $1}')
                UPTIME=$(ps -p $PID -o etime= | tr -d ' ')
                
                echo -e "${GREEN}✅ 服务运行中${NC}"
                echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo -e "   PID:     $PID"
                echo -e "   内存:    ${MEM}MB"
                echo -e "   CPU:     ${CPU}%"
                echo -e "   运行时间: $UPTIME"
                echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                
                # 系统资源
                echo -e "\n${BLUE}系统资源:${NC}"
                free -h | grep -E "Mem|Swap" | awk '{printf "   %-6s %6s / %6s\n", $1, $3, $2}'
                
                # 磁盘空间
                echo -e "\n${BLUE}磁盘空间:${NC}"
                df -h / | tail -n 1 | awk '{printf "   使用: %s / %s (%s)\n", $3, $2, $5}'
                
                # 健康检查
                echo -e "\n${BLUE}健康检查:${NC}"
                if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
                    echo -e "   ${GREEN}✓ API响应正常${NC}"
                else
                    echo -e "   ${RED}✗ API无响应${NC}"
                fi
            else
                echo -e "${RED}❌ PID文件存在但进程未运行${NC}"
                rm $PID_FILE
            fi
        else
            echo -e "${YELLOW}⏹️  服务未运行${NC}"
        fi
        ;;
        
    logs)
        if [ ! -f $LOG_FILE ]; then
            echo -e "${YELLOW}日志文件不存在${NC}"
            exit 1
        fi
        
        if [ "$2" = "-f" ] || [ "$2" = "--follow" ]; then
            tail -f $LOG_FILE
        else
            tail -n ${2:-50} $LOG_FILE
        fi
        ;;
        
    health)
        echo -e "${BLUE}执行健康检查...${NC}"
        
        # 检查进程
        if [ -f $PID_FILE ]; then
            PID=$(cat $PID_FILE)
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "${GREEN}✓ 进程运行中${NC}"
            else
                echo -e "${RED}✗ 进程未运行${NC}"
                exit 1
            fi
        else
            echo -e "${RED}✗ 服务未启动${NC}"
            exit 1
        fi
        
        # 检查API
        HEALTH=$(curl -s http://localhost:3000/api/health 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ API响应正常${NC}"
            echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
        else
            echo -e "${RED}✗ API无响应${NC}"
            exit 1
        fi
        ;;
        
    monitor)
        echo -e "${BLUE}====== AutoAnki 性能监控 ======${NC}\n"
        
        # CPU和内存
        echo -e "${YELLOW}系统资源：${NC}"
        free -h
        echo ""
        uptime
        echo ""
        
        # 进程状态
        if [ -f $PID_FILE ]; then
            PID=$(cat $PID_FILE)
            echo -e "${YELLOW}进程状态：${NC}"
            ps aux | head -n 1
            ps aux | grep $PID | grep -v grep
            echo ""
        fi
        
        # 磁盘
        echo -e "${YELLOW}磁盘使用：${NC}"
        df -h / | grep -v tmpfs
        echo ""
        
        # 网络
        echo -e "${YELLOW}网络连接：${NC}"
        ss -tulpn | grep :3000 || echo "端口3000未监听"
        ;;
        
    *)
        echo -e "${BLUE}AutoAnki 轻量级管理脚本${NC}"
        echo ""
        echo "用法: $0 {command} [options]"
        echo ""
        echo "命令:"
        echo "  start           启动服务"
        echo "  stop            停止服务"
        echo "  restart         重启服务"
        echo "  status          查看状态"
        echo "  logs [N|-f]     查看日志（N=行数，-f=实时）"
        echo "  health          健康检查"
        echo "  monitor         性能监控"
        echo ""
        echo "示例:"
        echo "  $0 start                  # 启动服务"
        echo "  $0 logs 100               # 查看最后100行日志"
        echo "  $0 logs -f                # 实时查看日志"
        echo "  $0 monitor                # 查看性能"
        exit 1
        ;;
esac


