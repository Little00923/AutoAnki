#!/bin/bash
# AutoAnki 更新脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 AutoAnki 更新脚本${NC}"
echo "================================"

# 检测部署方式
if [ -f "docker-compose.yml" ] && docker-compose ps 2>/dev/null | grep -q "Up"; then
    DEPLOY_METHOD="docker"
elif pm2 list 2>/dev/null | grep -q "autoanki"; then
    DEPLOY_METHOD="pm2"
else
    DEPLOY_METHOD="manual"
fi

echo "检测到部署方式: $DEPLOY_METHOD"
echo ""

# 1. 备份数据库
echo -e "${YELLOW}📦 步骤 1/5: 备份数据库...${NC}"
if [ -x "./backup.sh" ]; then
    ./backup.sh
else
    echo -e "${YELLOW}⚠️  备份脚本不存在，跳过备份${NC}"
fi

# 2. 拉取最新代码
echo -e "\n${YELLOW}📥 步骤 2/5: 拉取最新代码...${NC}"
git fetch origin
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
LATEST_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/$CURRENT_BRANCH)

if [ "$LATEST_COMMIT" = "$REMOTE_COMMIT" ]; then
    echo -e "${GREEN}✓ 已是最新版本，无需更新${NC}"
    read -p "是否强制重启服务？(y/n) " force_restart
    if [ "$force_restart" != "y" ]; then
        exit 0
    fi
else
    echo "发现新版本，正在更新..."
    git pull origin $CURRENT_BRANCH
    echo -e "${GREEN}✓ 代码更新完成${NC}"
fi

# 3. 更新依赖
echo -e "\n${YELLOW}📦 步骤 3/5: 更新依赖...${NC}"
if [ -f "package.json" ]; then
    if [ "$DEPLOY_METHOD" = "docker" ]; then
        echo "Docker模式，将在重新构建时安装依赖"
    else
        npm install --production
        echo -e "${GREEN}✓ 依赖更新完成${NC}"
    fi
fi

# 4. 检查环境变量
echo -e "\n${YELLOW}⚙️  步骤 4/5: 检查环境变量...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env 文件不存在${NC}"
    read -p "是否从 .env.example 创建？(y/n) " create_env
    if [ "$create_env" = "y" ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  请编辑 .env 文件配置必要参数${NC}"
    fi
else
    echo -e "${GREEN}✓ 环境变量文件存在${NC}"
fi

# 5. 重启服务
echo -e "\n${YELLOW}🔄 步骤 5/5: 重启服务...${NC}"
case $DEPLOY_METHOD in
    docker)
        echo "正在重启 Docker 容器..."
        docker-compose down
        docker-compose up -d --build
        sleep 5
        
        if docker-compose ps | grep -q "Up"; then
            echo -e "${GREEN}✅ Docker 服务重启成功！${NC}"
            docker-compose ps
        else
            echo -e "${RED}❌ Docker 服务启动失败${NC}"
            echo "查看日志: docker-compose logs"
            exit 1
        fi
        ;;
        
    pm2)
        echo "正在重启 PM2 进程..."
        pm2 restart autoanki
        sleep 3
        
        if pm2 list | grep -q "autoanki.*online"; then
            echo -e "${GREEN}✅ PM2 服务重启成功！${NC}"
            pm2 status autoanki
        else
            echo -e "${RED}❌ PM2 服务启动失败${NC}"
            echo "查看日志: pm2 logs autoanki"
            exit 1
        fi
        ;;
        
    manual)
        echo -e "${YELLOW}⚠️  请手动重启服务${NC}"
        echo "   Docker: docker-compose restart"
        echo "   PM2: pm2 restart autoanki"
        echo "   手动: pkill -f 'node server.js' && npm start"
        ;;
esac

# 验证服务
echo -e "\n${YELLOW}🔍 验证服务状态...${NC}"
sleep 2

if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:3000/api/health)
    echo -e "${GREEN}✅ 服务运行正常${NC}"
    echo "   健康检查: $HEALTH"
else
    echo -e "${RED}❌ 服务可能未正常启动${NC}"
    echo "   请检查日志"
fi

# 完成
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 更新完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 查看状态:"
if [ "$DEPLOY_METHOD" = "docker" ]; then
    echo "   docker-compose ps"
    echo "   docker-compose logs -f"
elif [ "$DEPLOY_METHOD" = "pm2" ]; then
    echo "   pm2 status"
    echo "   pm2 logs autoanki"
fi
echo ""
echo "🌐 访问地址:"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
echo "   http://${SERVER_IP}:3000"


