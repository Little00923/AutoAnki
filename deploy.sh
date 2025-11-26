#!/bin/bash
# AutoAnki 一键部署脚本

set -e

echo "🚀 AutoAnki 云服务器部署脚本"
echo "=============================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否为root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ 请使用 sudo 运行此脚本${NC}"
   exit 1
fi

# 显示系统信息
echo -e "\n${BLUE}📊 系统信息:${NC}"
echo "操作系统: $(lsb_release -d | cut -f2-)"
echo "内核版本: $(uname -r)"
echo "内存: $(free -h | awk '/^Mem:/ {print $2}')"
echo "磁盘: $(df -h / | awk 'NR==2 {print $2}')"

# 选择部署方式
echo -e "\n${YELLOW}请选择部署方式：${NC}"
echo "1) Docker 部署（推荐，环境隔离）"
echo "2) PM2 部署（传统方式，灵活性高）"
echo "3) 仅安装 Nginx 反向代理"
echo "4) 完整部署（Docker + Nginx + SSL）"
read -p "请输入选项 (1-4): " deploy_method

case $deploy_method in
    1)
        echo -e "\n${GREEN}🐳 开始 Docker 部署...${NC}"
        
        # 检查Docker
        if ! command -v docker &> /dev/null; then
            echo "📦 安装 Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            rm get-docker.sh
            usermod -aG docker $SUDO_USER
        else
            echo "✓ Docker 已安装"
        fi
        
        # 检查Docker Compose
        if ! command -v docker-compose &> /dev/null; then
            echo "📦 安装 Docker Compose..."
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        else
            echo "✓ Docker Compose 已安装"
        fi
        
        # 配置环境变量
        if [ ! -f .env ]; then
            echo -e "\n${YELLOW}⚙️  配置环境变量...${NC}"
            cp .env.example .env
            echo -e "${RED}❗ 重要：请立即编辑 .env 文件${NC}"
            echo "   需要配置："
            echo "   1. OPENAI_API_KEY (必填)"
            echo "   2. JWT_SECRET (必须修改)"
            echo "   3. SESSION_SECRET (必须修改)"
            echo ""
            read -p "是否现在编辑？(y/n) " edit_env
            if [ "$edit_env" = "y" ]; then
                ${EDITOR:-nano} .env
            fi
        fi
        
        # 启动服务
        echo -e "\n${GREEN}🚀 启动服务...${NC}"
        docker-compose down 2>/dev/null || true
        docker-compose up -d --build
        
        # 等待服务启动
        echo "等待服务启动..."
        sleep 10
        
        # 检查状态
        if docker-compose ps | grep -q "Up"; then
            SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
            echo -e "\n${GREEN}✅ Docker 部署成功！${NC}"
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "📍 访问地址: http://${SERVER_IP}:3000"
            echo -e "📊 查看状态: docker-compose ps"
            echo -e "📋 查看日志: docker-compose logs -f"
            echo -e "🔄 重启服务: docker-compose restart"
            echo -e "⏹️  停止服务: docker-compose down"
            echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        else
            echo -e "\n${RED}❌ 部署失败，查看日志：docker-compose logs${NC}"
            exit 1
        fi
        ;;
        
    2)
        echo -e "\n${GREEN}⚡ 开始 PM2 部署...${NC}"
        
        # 检查 Node.js
        if ! command -v node &> /dev/null; then
            echo "📦 安装 Node.js 18..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
            apt install -y nodejs
        else
            NODE_VERSION=$(node -v)
            echo "✓ Node.js 已安装 ($NODE_VERSION)"
        fi
        
        # 安装 PM2
        if ! command -v pm2 &> /dev/null; then
            echo "📦 安装 PM2..."
            npm install -g pm2
        else
            echo "✓ PM2 已安装"
        fi
        
        # 安装依赖
        echo "📦 安装项目依赖..."
        npm install --production
        
        # 配置环境变量
        if [ ! -f .env ]; then
            echo -e "\n${YELLOW}⚙️  配置环境变量...${NC}"
            cp .env.example .env
            echo -e "${RED}❗ 重要：请立即编辑 .env 文件${NC}"
            read -p "是否现在编辑？(y/n) " edit_env
            if [ "$edit_env" = "y" ]; then
                ${EDITOR:-nano} .env
            fi
        fi
        
        # 创建PM2配置文件（如果不存在）
        if [ ! -f ecosystem.config.js ]; then
            echo "创建 PM2 配置文件..."
            cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'autoanki',
    script: './server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
EOF
        fi
        
        # 创建日志目录
        mkdir -p logs
        
        # 启动服务
        echo -e "\n${GREEN}🚀 启动服务...${NC}"
        pm2 delete autoanki 2>/dev/null || true
        pm2 start ecosystem.config.js
        
        # 设置开机自启
        pm2 save
        pm2 startup | tail -n 1 | bash
        
        # 等待服务启动
        sleep 5
        
        SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
        echo -e "\n${GREEN}✅ PM2 部署成功！${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "📍 访问地址: http://${SERVER_IP}:3000"
        echo -e "📊 查看状态: pm2 status"
        echo -e "📋 查看日志: pm2 logs autoanki"
        echo -e "📈 实时监控: pm2 monit"
        echo -e "🔄 重启服务: pm2 restart autoanki"
        echo -e "⏹️  停止服务: pm2 stop autoanki"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        ;;
        
    3)
        echo -e "\n${GREEN}🌐 安装 Nginx 反向代理...${NC}"
        
        # 安装 Nginx
        if ! command -v nginx &> /dev/null; then
            echo "📦 安装 Nginx..."
            apt update
            apt install -y nginx
        else
            echo "✓ Nginx 已安装"
        fi
        
        # 获取域名
        read -p "请输入你的域名（例如 example.com）: " domain
        
        # 创建 Nginx 配置
        cat > /etc/nginx/sites-available/autoanki << EOF
server {
    listen 80;
    server_name $domain www.$domain;

    access_log /var/log/nginx/autoanki-access.log;
    error_log /var/log/nginx/autoanki-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF
        
        # 启用配置
        ln -sf /etc/nginx/sites-available/autoanki /etc/nginx/sites-enabled/
        
        # 测试配置
        nginx -t
        
        # 重启 Nginx
        systemctl restart nginx
        systemctl enable nginx
        
        echo -e "\n${GREEN}✅ Nginx 配置成功！${NC}"
        echo -e "请确保域名 $domain 已解析到本服务器"
        echo -e "访问地址: http://$domain"
        
        # 询问是否配置SSL
        read -p "是否配置 SSL 证书？(y/n) " setup_ssl
        if [ "$setup_ssl" = "y" ]; then
            if ! command -v certbot &> /dev/null; then
                echo "📦 安装 Certbot..."
                apt install -y certbot python3-certbot-nginx
            fi
            
            echo "🔒 配置 SSL 证书..."
            certbot --nginx -d $domain -d www.$domain
            
            echo -e "\n${GREEN}✅ SSL 配置成功！${NC}"
            echo -e "访问地址: https://$domain"
        fi
        ;;
        
    4)
        echo -e "\n${GREEN}🎯 完整部署（Docker + Nginx + SSL）${NC}"
        
        # 执行 Docker 部署
        bash $0 <<< "1"
        
        # 等待Docker启动
        sleep 5
        
        # 执行 Nginx 配置
        bash $0 <<< "3"
        
        echo -e "\n${GREEN}🎉 完整部署成功！${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ 无效的选项${NC}"
        exit 1
        ;;
esac

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎉 部署完成！${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\n${YELLOW}📝 后续步骤：${NC}"
echo "1. 确保 .env 文件已正确配置"
echo "2. 配置防火墙规则"
echo "3. 设置定期数据库备份"
echo "4. 监控服务运行状态"
echo ""
echo -e "${YELLOW}📚 更多帮助：${NC}"
echo "- 查看完整文档: cat DEPLOYMENT_GUIDE.md"
echo "- 备份数据库: ./backup.sh"
echo "- 更新代码: git pull && 重启服务"
echo ""


