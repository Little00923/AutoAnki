# AutoAnki 云服务器部署指南

本指南将帮助你将AutoAnki部署到云服务器（阿里云、腾讯云、AWS等）。

## 📋 目录

- [前置准备](#前置准备)
- [方案一：Docker部署（推荐）](#方案一docker部署推荐)
- [方案二：PM2部署](#方案二pm2部署)
- [方案三：Nginx反向代理](#方案三nginx反向代理)
- [SSL证书配置](#ssl证书配置)
- [常见问题](#常见问题)

---

## 前置准备

### 1. 服务器要求

- **操作系统**：Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **内存**：至少 1GB RAM（推荐 2GB+）
- **磁盘**：至少 10GB 可用空间
- **网络**：需要开放端口 80、443、3000

### 2. 安装必要软件

#### 更新系统
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

#### 安装 Node.js 18+
```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

#### 安装 Git
```bash
sudo apt install git -y
```

### 3. 防火墙配置

```bash
# Ubuntu (UFW)
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 3000    # AutoAnki (开发/测试)
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

---

## 方案一：Docker部署（推荐）

### 优势
- ✅ 环境隔离，不污染系统
- ✅ 一键部署，配置简单
- ✅ 容易迁移和扩展

### 1. 安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version

# 将当前用户加入docker组（避免每次使用sudo）
sudo usermod -aG docker $USER
newgrp docker
```

### 2. 克隆项目

```bash
cd ~
git clone https://github.com/yourusername/newAutoAnki.git
cd newAutoAnki
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**重要配置项：**
```env
# AI API配置（必填）
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat

# 认证密钥（必须修改！）
JWT_SECRET=your_secure_random_string_here_32_chars_min
SESSION_SECRET=another_secure_random_string_here

# PayPal支付（如需支付功能）
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret
PAYPAL_RETURN_URL=https://yourdomain.com/user-center.html#recharge
PAYPAL_CANCEL_URL=https://yourdomain.com/user-center.html#recharge

# 服务器配置
PORT=3000
NODE_ENV=production
```

### 4. 启动服务

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看状态
docker-compose ps
```

### 5. 验证部署

```bash
# 检查健康状态
curl http://localhost:3000/api/health

# 应该返回：{"status":"ok","hasApiKey":true,...}
```

### 6. Docker 常用命令

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f autoanki

# 更新代码后重新部署
git pull
docker-compose down
docker-compose up -d --build

# 清理未使用的镜像
docker system prune -a
```

---

## 方案二：PM2部署

### 优势
- ✅ 自动重启，稳定性高
- ✅ 日志管理方便
- ✅ 支持负载均衡

### 1. 安装 PM2

```bash
sudo npm install -g pm2
```

### 2. 克隆并安装项目

```bash
cd ~
git clone https://github.com/yourusername/newAutoAnki.git
cd newAutoAnki

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
nano .env
```

### 3. 创建 PM2 配置文件

```bash
nano ecosystem.config.js
```

```javascript
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
```

### 4. 启动服务

```bash
# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

### 5. PM2 常用命令

```bash
# 查看状态
pm2 status
pm2 list

# 查看日志
pm2 logs autoanki
pm2 logs autoanki --lines 100

# 重启
pm2 restart autoanki

# 停止
pm2 stop autoanki

# 删除
pm2 delete autoanki

# 监控
pm2 monit

# 更新代码后
git pull
npm install --production
pm2 restart autoanki
```

---

## 方案三：Nginx反向代理

### 为什么需要Nginx？

- ✅ 支持域名访问（如 https://autoanki.com）
- ✅ SSL/HTTPS 加密
- ✅ 静态文件缓存加速
- ✅ 负载均衡

### 1. 安装 Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/autoanki
```

**基础配置（HTTP）：**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 访问日志
    access_log /var/log/nginx/autoanki-access.log;
    error_log /var/log/nginx/autoanki-error.log;

    # 代理到Node.js应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        proxy_pass http://localhost:3000;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/autoanki /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 4. 配置域名

在你的域名服务商（如阿里云、腾讯云）配置DNS：

```
类型    主机记录    记录值
A       @           你的服务器IP
A       www         你的服务器IP
```

---

## SSL证书配置

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 自动配置SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 测试自动续期
sudo certbot renew --dry-run
```

Certbot会自动修改Nginx配置，添加SSL。配置后的效果：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # HTTP自动跳转HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL证书
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... 其他配置同上
}
```

---

## 🚀 一键部署脚本

创建 `deploy.sh`：

```bash
nano deploy.sh
```

```bash
#!/bin/bash
# AutoAnki 一键部署脚本

set -e

echo "🚀 AutoAnki 云服务器部署脚本"
echo "=============================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ 请使用 sudo 运行此脚本${NC}"
   exit 1
fi

# 选择部署方式
echo -e "\n${YELLOW}请选择部署方式：${NC}"
echo "1) Docker 部署（推荐）"
echo "2) PM2 部署"
read -p "请输入选项 (1 或 2): " deploy_method

if [ "$deploy_method" = "1" ]; then
    echo -e "\n${GREEN}🐳 开始 Docker 部署...${NC}"
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        echo "📦 安装 Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "📦 安装 Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    # 配置环境变量
    if [ ! -f .env ]; then
        echo -e "\n${YELLOW}⚙️  配置环境变量...${NC}"
        cp .env.example .env
        echo -e "${RED}❗ 请编辑 .env 文件，配置 API Key 等信息${NC}"
        read -p "配置完成后按 Enter 继续..."
    fi
    
    # 启动服务
    echo -e "\n${GREEN}🚀 启动服务...${NC}"
    docker-compose down 2>/dev/null || true
    docker-compose up -d --build
    
    # 检查状态
    sleep 5
    if docker-compose ps | grep -q "Up"; then
        echo -e "\n${GREEN}✅ 部署成功！${NC}"
        echo -e "访问地址: http://$(curl -s ifconfig.me):3000"
    else
        echo -e "\n${RED}❌ 部署失败，查看日志：docker-compose logs${NC}"
    fi

elif [ "$deploy_method" = "2" ]; then
    echo -e "\n${GREEN}⚡ 开始 PM2 部署...${NC}"
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo "📦 安装 Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
    fi
    
    # 安装 PM2
    if ! command -v pm2 &> /dev/null; then
        echo "📦 安装 PM2..."
        npm install -g pm2
    fi
    
    # 安装依赖
    echo "📦 安装项目依赖..."
    npm install --production
    
    # 配置环境变量
    if [ ! -f .env ]; then
        echo -e "\n${YELLOW}⚙️  配置环境变量...${NC}"
        cp .env.example .env
        echo -e "${RED}❗ 请编辑 .env 文件，配置 API Key 等信息${NC}"
        read -p "配置完成后按 Enter 继续..."
    fi
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动服务
    echo -e "\n${GREEN}🚀 启动服务...${NC}"
    pm2 delete autoanki 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    echo -e "\n${GREEN}✅ 部署成功！${NC}"
    echo -e "访问地址: http://$(curl -s ifconfig.me):3000"
    echo -e "查看状态: pm2 status"
    echo -e "查看日志: pm2 logs autoanki"
fi

echo -e "\n${GREEN}🎉 部署完成！${NC}"
```

```bash
# 赋予执行权限
chmod +x deploy.sh

# 运行
sudo ./deploy.sh
```

---

## 📝 更新和维护

### Docker方式更新

```bash
cd ~/newAutoAnki
git pull
docker-compose down
docker-compose up -d --build
```

### PM2方式更新

```bash
cd ~/newAutoAnki
git pull
npm install --production
pm2 restart autoanki
```

### 数据库备份

```bash
# 创建备份脚本
nano backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp database/autoanki.db "$BACKUP_DIR/autoanki_$DATE.db"
echo "✅ 备份完成: $BACKUP_DIR/autoanki_$DATE.db"

# 保留最近7天的备份
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
```

```bash
chmod +x backup.sh

# 添加定时任务（每天凌晨2点备份）
crontab -e
# 添加：0 2 * * * cd /path/to/newAutoAnki && ./backup.sh
```

---

## 🐛 常见问题

### 1. 端口被占用

```bash
# 查看占用3000端口的进程
sudo lsof -i :3000
# 或
sudo netstat -tulpn | grep 3000

# 结束进程
sudo kill -9 <PID>
```

### 2. 数据库权限问题

```bash
# 确保数据库目录可写
chmod 755 database
chmod 644 database/autoanki.db
```

### 3. 内存不足

```bash
# 查看内存使用
free -h

# 如果内存不足，创建swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 4. Docker容器无法启动

```bash
# 查看详细日志
docker-compose logs autoanki

# 重新构建
docker-compose down -v
docker-compose up -d --build --force-recreate
```

### 5. PayPal回调失败

确保在PayPal后台配置正确的Webhook URL：
```
https://yourdomain.com/api/payment/paypal/webhook
```

---

## 🔒 安全建议

1. **修改默认密钥**：务必修改 `.env` 中的 `JWT_SECRET` 和 `SESSION_SECRET`
2. **使用HTTPS**：配置SSL证书，避免数据传输被窃取
3. **定期更新**：及时更新系统和依赖包
4. **防火墙**：只开放必要的端口
5. **数据库备份**：定期备份数据库
6. **日志监控**：定期检查日志，发现异常及时处理

```bash
# 生成安全的随机密钥
openssl rand -base64 32
```

---

## 📊 性能监控

### 使用PM2监控

```bash
pm2 monit          # 实时监控
pm2 logs           # 查看日志
pm2 status         # 查看状态
```

### 使用Docker监控

```bash
docker stats autoanki              # 实时资源使用
docker-compose logs -f --tail=100  # 查看日志
```

---

## 📞 获取帮助

- 查看项目文档：`README.md`
- 提交Issue：GitHub Issues
- 查看日志定位问题

---

**祝你部署顺利！** 🎉


