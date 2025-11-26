# 🪶 AutoAnki 轻量级部署指南（1核1G服务器）

## 📊 性能评估

### 你的服务器配置
- **CPU**: 1核
- **内存**: 1GB
- **评估**: 低配服务器，需要优化部署方案

### 资源占用对比

| 部署方式 | 基础内存占用 | CPU占用 | 推荐度 |
|---------|------------|---------|--------|
| Docker | ~300-400MB | 中等 | ⭐⭐ |
| PM2 | ~150-200MB | 较低 | ⭐⭐⭐⭐ |
| 直接运行 | ~100-150MB | 最低 | ⭐⭐⭐⭐⭐ |

**结论**：对于1核1G服务器，推荐使用 **直接运行** 或 **PM2部署**，避免使用Docker。

---

## 🚀 推荐方案：轻量级部署

### 方案一：直接运行（最轻量）⭐⭐⭐⭐⭐

```bash
# 1. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 2. 克隆项目
git clone <你的仓库>
cd newAutoAnki

# 3. 安装依赖（生产模式）
npm install --production

# 4. 配置环境变量
cp .env.example .env
nano .env

# 5. 创建启动脚本
cat > start-lightweight.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
nohup node server.js > logs/app.log 2>&1 &
echo $! > app.pid
echo "✅ 服务已启动，PID: $(cat app.pid)"
EOF

chmod +x start-lightweight.sh

# 6. 启动
./start-lightweight.sh
```

**内存占用：约100-150MB**

### 方案二：PM2轻量版⭐⭐⭐⭐

```bash
# 使用PM2，但不启用集群模式
npm install -g pm2

# 使用轻量配置
pm2 start server.js --name autoanki \
  --max-memory-restart 400M \
  --no-autorestart \
  --instances 1
  
pm2 save
```

**内存占用：约150-200MB**

---

## ⚙️ 性能优化配置

### 1. 创建轻量级配置文件

创建 `ecosystem.lightweight.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'autoanki',
    script: './server.js',
    instances: 1,  // 只运行1个实例
    exec_mode: 'fork',  // fork模式，不用cluster
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Node.js内存限制
      NODE_OPTIONS: '--max-old-space-size=400'  // 限制最大400MB
    },
    max_memory_restart: '400M',  // 超过400MB自动重启
    autorestart: true,
    watch: false,
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    // 减少日志输出
    log_type: 'json'
  }]
};
```

启动：
```bash
pm2 start ecosystem.lightweight.config.js
pm2 save
```

### 2. 优化 server.js

在 `server.js` 顶部添加：

```javascript
// 生产环境性能优化
if (process.env.NODE_ENV === 'production') {
    // 减少事件监听器警告
    require('events').EventEmitter.defaultMaxListeners = 15;
}
```

### 3. 配置Swap（重要！）

1核1G服务器**强烈建议**配置Swap：

```bash
# 创建2GB swap文件
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久生效
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 验证
free -h
```

配置后实际可用内存：**1GB RAM + 2GB Swap = 3GB**

### 4. 系统优化

```bash
# 清理不必要的服务
sudo systemctl disable snapd
sudo systemctl stop snapd

# 优化系统参数
cat << EOF | sudo tee -a /etc/sysctl.conf
# 减少swap使用倾向
vm.swappiness=10
# 优化文件系统缓存
vm.vfs_cache_pressure=50
EOF

sudo sysctl -p
```

---

## 📦 轻量级Nginx配置

如果使用Nginx，使用最小化配置：

```nginx
# /etc/nginx/sites-available/autoanki-light
server {
    listen 80;
    server_name yourdomain.com;

    # 减小缓冲区
    client_body_buffer_size 10K;
    client_header_buffer_size 1k;
    client_max_body_size 8m;
    large_client_header_buffers 2 1k;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # 关闭缓冲（减少内存占用）
        proxy_buffering off;
    }

    # 静态文件
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_pass http://localhost:3000;
        expires 7d;
    }
}
```

---

## 🛠️ 数据库优化

SQLite在低内存环境下的优化：

创建 `database/optimize.sql`：

```sql
-- 减少内存占用
PRAGMA cache_size = -2000;  -- 2MB缓存
PRAGMA temp_store = MEMORY;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- 定期优化
VACUUM;
ANALYZE;
```

执行优化：
```bash
sqlite3 database/autoanki.db < database/optimize.sql
```

---

## 📋 启动管理脚本

创建 `lightweight-manager.sh`：

```bash
#!/bin/bash
# AutoAnki 轻量级管理脚本

PID_FILE="app.pid"
LOG_FILE="logs/app.log"

case "$1" in
    start)
        if [ -f $PID_FILE ]; then
            echo "服务已在运行 (PID: $(cat $PID_FILE))"
            exit 1
        fi
        mkdir -p logs
        export NODE_ENV=production
        export NODE_OPTIONS="--max-old-space-size=400"
        nohup node server.js > $LOG_FILE 2>&1 &
        echo $! > $PID_FILE
        echo "✅ 服务已启动 (PID: $(cat $PID_FILE))"
        ;;
    stop)
        if [ ! -f $PID_FILE ]; then
            echo "服务未运行"
            exit 1
        fi
        PID=$(cat $PID_FILE)
        kill $PID
        rm $PID_FILE
        echo "⏹️  服务已停止"
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        if [ -f $PID_FILE ]; then
            PID=$(cat $PID_FILE)
            if ps -p $PID > /dev/null; then
                echo "✅ 服务运行中 (PID: $PID)"
                echo "内存占用: $(ps -p $PID -o rss= | awk '{printf "%.1fMB", $1/1024}')"
            else
                echo "❌ PID文件存在但进程未运行"
                rm $PID_FILE
            fi
        else
            echo "⏹️  服务未运行"
        fi
        ;;
    logs)
        tail -f $LOG_FILE
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
```

使用：
```bash
chmod +x lightweight-manager.sh

./lightweight-manager.sh start    # 启动
./lightweight-manager.sh stop     # 停止
./lightweight-manager.sh restart  # 重启
./lightweight-manager.sh status   # 状态
./lightweight-manager.sh logs     # 日志
```

---

## 🔧 环境变量优化

修改 `.env`，减少不必要的功能：

```env
# 基础配置
NODE_ENV=production
PORT=3000

# AI配置（必需）
OPENAI_API_KEY=your_key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat

# 安全配置
JWT_SECRET=your_secret
SESSION_SECRET=your_session_secret

# 如果不需要支付功能，可以注释掉PayPal配置
# PAYPAL_MODE=
# PAYPAL_CLIENT_ID=
# PAYPAL_CLIENT_SECRET=
```

---

## 📊 性能监控

### 简单的监控脚本

创建 `monitor.sh`：

```bash
#!/bin/bash
# 性能监控脚本

echo "====== 系统资源 ======"
free -h
echo ""
echo "====== CPU负载 ======"
uptime
echo ""
echo "====== 进程状态 ======"
if [ -f app.pid ]; then
    PID=$(cat app.pid)
    ps aux | grep $PID | grep -v grep
else
    echo "服务未运行"
fi
echo ""
echo "====== 磁盘使用 ======"
df -h / | tail -n 1
```

定时监控：
```bash
# 每小时记录一次
crontab -e
# 添加：0 * * * * /path/to/monitor.sh >> /path/to/logs/monitor.log
```

---

## ⚡ 使用建议

### DO（推荐做）

✅ **配置Swap** - 必须！将可用内存提升到3GB
✅ **使用生产模式** - `NODE_ENV=production`
✅ **限制内存** - 设置 `--max-old-space-size=400`
✅ **定期重启** - 每天凌晨自动重启（清理内存）
✅ **监控资源** - 定时检查内存和CPU
✅ **关闭不用的服务** - 如snapd等

### DON'T（不要做）

❌ **不要用Docker** - 额外开销太大
❌ **不要用集群模式** - 1核没必要
❌ **不要开太多日志** - 占用IO和磁盘
❌ **不要同时运行其他重型服务** - 如MySQL、Redis等
❌ **不要忘记配置Swap** - 否则很容易OOM

---

## 🔄 定时任务配置

```bash
crontab -e
```

添加：
```bash
# 每天凌晨3点重启（清理内存）
0 3 * * * cd /path/to/newAutoAnki && ./lightweight-manager.sh restart

# 每天凌晨2点备份
0 2 * * * cd /path/to/newAutoAnki && ./backup.sh

# 每周日清理日志
0 4 * * 0 cd /path/to/newAutoAnki && find logs -name "*.log" -mtime +7 -delete
```

---

## 📈 预期性能

配置优化后：

| 指标 | 数值 |
|------|------|
| 内存占用 | 100-200MB（Node.js进程） |
| 可用内存 | 800MB RAM + 2GB Swap |
| 并发用户 | 10-20人同时在线 |
| 响应时间 | 1-3秒（取决于AI API） |
| 稳定性 | 良好（配合定时重启） |

**注意**：AI卡片生成的速度主要取决于API服务商，与服务器性能关系不大。

---

## 🆘 常见问题

### 1. 内存不足OOM

```bash
# 检查是否配置了Swap
free -h

# 如果没有，立即配置
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 2. 服务响应慢

```bash
# 检查CPU和内存
top

# 重启服务
./lightweight-manager.sh restart

# 清理缓存
sync && echo 3 | sudo tee /proc/sys/vm/drop_caches
```

### 3. 磁盘空间不足

```bash
# 清理日志
find logs -name "*.log" -mtime +7 -delete

# 清理旧备份
find backups -name "*.db" -mtime +7 -delete

# 清理npm缓存
npm cache clean --force
```

---

## 🎯 完整部署流程（1核1G专用）

```bash
# 1. 配置Swap（最重要！）
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 2. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 克隆项目
cd ~
git clone <你的仓库>
cd newAutoAnki

# 4. 安装依赖（只安装生产依赖）
npm install --production

# 5. 配置环境
cp .env.example .env
nano .env  # 修改必要的配置

# 6. 创建管理脚本
chmod +x lightweight-manager.sh

# 7. 启动服务
./lightweight-manager.sh start

# 8. 配置开机自启（可选）
cat << EOF | sudo tee /etc/systemd/system/autoanki.service
[Unit]
Description=AutoAnki Service
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
Environment=NODE_OPTIONS=--max-old-space-size=400

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable autoanki
sudo systemctl start autoanki
```

**部署时间：约5分钟**

---

## 💡 额外优化建议

### 1. 使用CDN

如果有一定流量，使用免费CDN（如Cloudflare）可以：
- 减少服务器压力
- 加速静态文件访问
- 提供基础DDoS防护

### 2. 限制并发

在 `server.js` 中添加简单的限流：

```javascript
// 在文件顶部添加
const requestCounts = new Map();

app.use((req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, []);
    }
    
    const requests = requestCounts.get(ip);
    const recentRequests = requests.filter(time => now - time < 60000);
    
    if (recentRequests.length > 20) {  // 每分钟最多20个请求
        return res.status(429).json({ error: '请求过于频繁' });
    }
    
    recentRequests.push(now);
    requestCounts.set(ip, recentRequests);
    next();
});
```

### 3. 数据库定期优化

```bash
# 每周执行一次
sqlite3 database/autoanki.db "VACUUM; ANALYZE;"
```

---

## 🎊 总结

对于1核1G服务器：

✅ **必须做**：
1. 配置2GB Swap
2. 使用直接运行或PM2（不用Docker）
3. 限制Node.js内存 (400MB)
4. 定时重启清理内存

✅ **性能足够**：
- 10-20人同时使用
- 响应时间1-3秒
- 稳定运行

✅ **成本最优**：
- 低配服务器（约￥50-100/年）
- 完全够用
- 性价比极高

---

**现在你可以放心部署了！** 🚀

有问题随时查看这份轻量级指南。


