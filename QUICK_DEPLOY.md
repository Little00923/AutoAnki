# 🚀 AutoAnki 快速部署指南

适用于想要快速在云服务器上部署AutoAnki的用户。

## ⚡ 5分钟快速部署

### 方案一：Docker一键部署（最简单）

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/newAutoAnki.git
cd newAutoAnki

# 2. 配置环境变量
cp .env.example .env
nano .env  # 修改 OPENAI_API_KEY、JWT_SECRET、SESSION_SECRET

# 3. 一键部署
chmod +x deploy.sh
sudo ./deploy.sh
# 选择：1 (Docker部署)

# 完成！访问 http://你的服务器IP:3000
```

### 方案二：手动Docker部署

```bash
# 1. 安装Docker
curl -fsSL https://get.docker.com | sh

# 2. 克隆并配置
git clone https://github.com/yourusername/newAutoAnki.git
cd newAutoAnki
cp .env.example .env
nano .env

# 3. 启动
docker-compose up -d

# 4. 查看状态
docker-compose ps
docker-compose logs -f
```

### 方案三：PM2部署

```bash
# 1. 安装Node.js和PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 2. 克隆并安装
git clone https://github.com/yourusername/newAutoAnki.git
cd newAutoAnki
npm install --production

# 3. 配置
cp .env.example .env
nano .env

# 4. 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔧 必需配置项

编辑 `.env` 文件，**必须修改**以下内容：

```env
# 1. AI API（必填）
OPENAI_API_KEY=sk-your-actual-api-key-here

# 2. 安全密钥（必须修改，使用随机字符串）
JWT_SECRET=请替换为随机字符串32字符以上
SESSION_SECRET=请替换为另一个随机字符串

# 3. PayPal（如果需要支付功能）
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=你的PayPal Client ID
PAYPAL_CLIENT_SECRET=你的PayPal Secret
PAYPAL_RETURN_URL=https://yourdomain.com/user-center.html#recharge
PAYPAL_CANCEL_URL=https://yourdomain.com/user-center.html#recharge
```

**生成安全密钥：**
```bash
openssl rand -base64 32
```

---

## 🌐 配置域名和HTTPS

### 1. DNS配置

在域名服务商处添加A记录：
```
类型: A
主机记录: @
记录值: 你的服务器IP

类型: A
主机记录: www
记录值: 你的服务器IP
```

### 2. Nginx配置

```bash
# 安装Nginx
sudo apt install nginx -y

# 使用模板创建配置
sudo cp nginx.conf.template /etc/nginx/sites-available/autoanki

# 修改域名
sudo nano /etc/nginx/sites-available/autoanki
# 将 yourdomain.com 替换为你的实际域名

# 启用配置
sudo ln -s /etc/nginx/sites-available/autoanki /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. SSL证书（Let's Encrypt免费）

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 自动配置SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 完成！现在可以通过 https://yourdomain.com 访问
```

---

## 📋 常用命令速查

### Docker方式

```bash
# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启
docker-compose restart

# 停止
docker-compose down

# 更新
git pull && docker-compose up -d --build
```

### PM2方式

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs autoanki

# 重启
pm2 restart autoanki

# 停止
pm2 stop autoanki

# 更新
git pull && npm install --production && pm2 restart autoanki
```

---

## 🔥 防火墙配置

```bash
# Ubuntu (UFW)
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable

# 查看状态
sudo ufw status
```

---

## 🛠️ 维护脚本

项目提供了便捷的维护脚本：

```bash
# 一键部署
sudo ./deploy.sh

# 更新应用
./update.sh

# 备份数据库
./backup.sh

# 重启服务
./restart.sh
```

---

## ✅ 验证部署

部署完成后，访问以下URL验证：

```bash
# 健康检查
curl http://localhost:3000/api/health

# 应该返回：
# {"status":"ok","hasApiKey":true,"apiBaseURL":"...","model":"..."}
```

浏览器访问：
- `http://你的IP:3000` - 应用首页
- `https://你的域名` - 如果配置了Nginx和SSL

---

## 🐛 常见问题

### 1. 端口被占用
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### 2. Docker容器无法启动
```bash
docker-compose logs
docker-compose down -v
docker-compose up -d --build
```

### 3. 内存不足
```bash
# 创建swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 4. API Key错误
检查 `.env` 文件中的 `OPENAI_API_KEY` 是否正确配置

---

## 📊 性能优化建议

1. **使用Nginx反向代理**：提升静态文件访问速度
2. **配置CDN**：加速全球访问
3. **开启Gzip压缩**：减少传输数据量
4. **定期备份数据库**：使用 `./backup.sh`
5. **监控资源使用**：`docker stats` 或 `pm2 monit`

---

## 🎯 生产环境检查清单

在正式上线前，请确认：

- [ ] `.env` 文件已正确配置
- [ ] `JWT_SECRET` 和 `SESSION_SECRET` 已修改为随机字符串
- [ ] 数据库目录有写权限
- [ ] 防火墙规则已配置
- [ ] Nginx反向代理已配置（推荐）
- [ ] SSL证书已配置（推荐）
- [ ] 定时备份脚本已设置
- [ ] PayPal配置已改为生产环境（如需支付）
- [ ] 服务设置为开机自启

---

## 📞 获取帮助

- **详细文档**：查看 `DEPLOYMENT_GUIDE.md`
- **PayPal配置**：查看 `PayPal配置指南.md`
- **数据库维护**：查看 `数据库维护指南.md`
- **快速上手**：查看 `QUICKSTART.md`

---

**祝你部署顺利！** 🎉

如有问题，请查看完整部署文档或提交Issue。


