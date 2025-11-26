# 🚀 AutoAnki 云服务器部署清单

使用此清单确保部署过程顺利，不遗漏任何重要步骤。

---

## 📝 部署前准备

### 1. 服务器准备
- [ ] 已购买云服务器（阿里云/腾讯云/AWS等）
- [ ] 服务器规格：至少1GB RAM，10GB存储
- [ ] 操作系统：Ubuntu 20.04+ 或 CentOS 7+
- [ ] 已获取服务器公网IP
- [ ] 可以通过SSH登录服务器

### 2. 域名准备（可选但推荐）
- [ ] 已购买域名
- [ ] DNS解析已配置指向服务器IP
- [ ] 等待DNS生效（通常5-30分钟）

### 3. API准备
- [ ] 已获取OpenAI/DeepSeek API Key
- [ ] API Key已测试可用
- [ ] 账户有足够余额

### 4. PayPal准备（如需支付功能）
- [ ] 已注册PayPal企业账户
- [ ] 已创建应用获取Client ID和Secret
- [ ] 已配置Webhook URL
- [ ] 已从Sandbox切换到Live模式

---

## 🔧 部署步骤

### 阶段一：服务器初始化

```bash
# SSH登录服务器
ssh root@你的服务器IP
```

- [ ] 1.1 更新系统
```bash
sudo apt update && sudo apt upgrade -y
```

- [ ] 1.2 配置防火墙
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000
sudo ufw enable
```

- [ ] 1.3 安装Git
```bash
sudo apt install git -y
```

### 阶段二：选择部署方式

#### 方式A：Docker部署（推荐）

- [ ] 2A.1 运行一键部署脚本
```bash
cd ~
git clone https://github.com/yourusername/newAutoAnki.git
cd newAutoAnki
sudo ./deploy.sh
# 选择选项 1
```

- [ ] 2A.2 验证Docker安装
```bash
docker --version
docker-compose --version
```

- [ ] 2A.3 编辑环境变量
```bash
nano .env
```

必须修改的配置：
```env
OPENAI_API_KEY=sk-...
JWT_SECRET=随机字符串32位以上
SESSION_SECRET=随机字符串32位以上
```

- [ ] 2A.4 启动服务
```bash
docker-compose up -d
```

- [ ] 2A.5 检查状态
```bash
docker-compose ps
docker-compose logs -f
```

#### 方式B：PM2部署

- [ ] 2B.1 安装Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

- [ ] 2B.2 安装PM2
```bash
sudo npm install -g pm2
```

- [ ] 2B.3 克隆项目
```bash
cd ~
git clone https://github.com/yourusername/newAutoAnki.git
cd newAutoAnki
```

- [ ] 2B.4 安装依赖
```bash
npm install --production
```

- [ ] 2B.5 配置环境变量
```bash
cp .env.example .env
nano .env
```

- [ ] 2B.6 启动服务
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 阶段三：Nginx反向代理（推荐）

- [ ] 3.1 安装Nginx
```bash
sudo apt install nginx -y
```

- [ ] 3.2 创建配置文件
```bash
sudo cp nginx.conf.template /etc/nginx/sites-available/autoanki
```

- [ ] 3.3 修改域名
```bash
sudo nano /etc/nginx/sites-available/autoanki
# 将 yourdomain.com 替换为实际域名
```

- [ ] 3.4 启用配置
```bash
sudo ln -s /etc/nginx/sites-available/autoanki /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 阶段四：SSL证书配置（强烈推荐）

- [ ] 4.1 安装Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

- [ ] 4.2 申请证书
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

- [ ] 4.3 测试自动续期
```bash
sudo certbot renew --dry-run
```

---

## ✅ 部署验证

### 功能测试

- [ ] 访问首页正常显示
```bash
# 浏览器访问
http://你的IP:3000
# 或（如果配置了域名）
https://yourdomain.com
```

- [ ] 健康检查API正常
```bash
curl http://localhost:3000/api/health
# 应返回：{"status":"ok","hasApiKey":true,...}
```

- [ ] 用户注册功能正常
  - [ ] 可以注册新用户
  - [ ] 注册后自动获得300积分
  - [ ] 可以正常登录

- [ ] 卡片生成功能正常
  - [ ] 输入文本可以生成卡片
  - [ ] 中文内容生成中文卡片
  - [ ] 英文内容生成英文卡片
  - [ ] 卡片可以正常导出

- [ ] PayPal支付功能正常（如已配置）
  - [ ] 可以创建支付订单
  - [ ] 可以完成支付流程
  - [ ] 支付后积分正确充值

### 性能测试

- [ ] 页面加载速度 < 3秒
- [ ] API响应时间 < 1秒
- [ ] 卡片生成时间合理（取决于AI模型）

### 安全检查

- [ ] `.env` 文件中的密钥已修改
- [ ] `.env` 文件不在Git中（已被.gitignore）
- [ ] 数据库文件权限正确
- [ ] 防火墙规则已配置
- [ ] HTTPS已启用（如配置了域名）

---

## 🛡️ 安全加固

- [ ] 修改SSH端口（可选）
```bash
sudo nano /etc/ssh/sshd_config
# 修改 Port 22 为其他端口
sudo systemctl restart sshd
```

- [ ] 禁用root登录（可选）
```bash
sudo nano /etc/ssh/sshd_config
# 设置 PermitRootLogin no
```

- [ ] 配置fail2ban（可选）
```bash
sudo apt install fail2ban -y
```

- [ ] 定期更新系统
```bash
sudo apt update && sudo apt upgrade -y
```

---

## 📊 监控和维护

### 定时任务设置

- [ ] 设置数据库自动备份
```bash
crontab -e
# 添加：0 2 * * * cd /path/to/newAutoAnki && ./backup.sh
```

- [ ] 设置自动更新（可选）
```bash
# 每周日凌晨3点自动更新
0 3 * * 0 cd /path/to/newAutoAnki && ./update.sh
```

### 日志管理

- [ ] 配置日志轮转
```bash
sudo nano /etc/logrotate.d/autoanki
```

```
/path/to/newAutoAnki/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

### 监控工具（可选）

- [ ] 安装监控面板（如 Netdata）
```bash
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

---

## 📈 性能优化

- [ ] 启用Nginx Gzip压缩
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

- [ ] 配置CDN（如有需要）
- [ ] 数据库定期优化
```bash
./db_manager.sh
# 选择 vacuum 选项
```

---

## 🔄 更新流程

当需要更新代码时：

- [ ] 备份数据库
```bash
./backup.sh
```

- [ ] 拉取最新代码
```bash
git pull
```

- [ ] 更新依赖
```bash
npm install --production  # PM2方式
# 或
docker-compose up -d --build  # Docker方式
```

- [ ] 重启服务
```bash
pm2 restart autoanki      # PM2方式
# 或
docker-compose restart    # Docker方式
```

- [ ] 验证功能正常

---

## 🆘 应急预案

### 服务无法启动

1. 查看日志
```bash
# Docker
docker-compose logs -f

# PM2
pm2 logs autoanki
```

2. 检查端口占用
```bash
sudo lsof -i :3000
```

3. 检查磁盘空间
```bash
df -h
```

### 数据库损坏

1. 停止服务
2. 从备份恢复
```bash
cp backups/autoanki_YYYYMMDD_HHMMSS.db database/autoanki.db
```
3. 重启服务

### API额度不足

1. 登录API提供商网站
2. 充值或升级套餐
3. 更新 `.env` 中的API Key（如果更换）

---

## 📞 支持和帮助

- **完整文档**：查看 `DEPLOYMENT_GUIDE.md`
- **快速指南**：查看 `QUICK_DEPLOY.md`
- **常见问题**：查看文档的"常见问题"部分
- **提交Issue**：在GitHub仓库提交问题

---

## ✨ 完成庆祝

当你完成以上所有检查项后：

```
 ██████╗ ██████╗ ███╗   ██╗ ██████╗ ██████╗  █████╗ ████████╗███████╗██╗
██╔════╝██╔═══██╗████╗  ██║██╔════╝ ██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██║
██║     ██║   ██║██╔██╗ ██║██║  ███╗██████╔╝███████║   ██║   ███████╗██║
██║     ██║   ██║██║╚██╗██║██║   ██║██╔══██╗██╔══██║   ██║   ╚════██║╚═╝
╚██████╗╚██████╔╝██║ ╚████║╚██████╔╝██║  ██║██║  ██║   ██║   ███████║██╗
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝
```

🎉 **恭喜！AutoAnki 已成功部署到云服务器！**

---

*最后更新：2025-10-17*


