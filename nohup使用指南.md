# 📚 nohup 命令使用指南

## 什么是 nohup？

`nohup` = **no hangup**（不挂断）

让程序在后台运行，即使关闭终端窗口也不会停止进程。

---

## 🎯 基本语法

```bash
nohup 命令 [参数] > 日志文件 2>&1 &
```

### 各部分说明

| 部分 | 含义 | 是否必需 |
|-----|------|---------|
| `nohup` | 不挂断命令 | 必需 |
| `命令 [参数]` | 要执行的程序 | 必需 |
| `> 日志文件` | 重定向输出 | 可选 |
| `2>&1` | 错误也重定向 | 推荐 |
| `&` | 后台运行 | 必需 |

---

## 💡 实际示例

### 示例1：启动 AutoAnki（我们在用的）

```bash
nohup npm start > /tmp/autoanki.log 2>&1 &
```

**效果**：
- ✅ 后台运行服务器
- ✅ 关闭终端也不停止
- ✅ 日志保存到 `/tmp/autoanki.log`
- ✅ 错误也记录到日志

### 示例2：简单版本

```bash
# 默认输出到当前目录的 nohup.out
nohup npm start &
```

### 示例3：不保存日志

```bash
# 丢弃所有输出（不推荐）
nohup npm start > /dev/null 2>&1 &
```

### 示例4：运行其他命令

```bash
# 运行 Python 脚本
nohup python3 my_script.py > app.log 2>&1 &

# 运行长时间任务
nohup ./long_task.sh > task.log 2>&1 &

# 运行数据库
nohup mysqld > mysql.log 2>&1 &
```

---

## 🔍 符号详解

### `>` 输出重定向

```bash
command > file.log    # 标准输出写入文件（覆盖）
command >> file.log   # 标准输出追加到文件
```

### `2>&1` 错误重定向

```bash
2>&1    # 将标准错误（2）重定向到标准输出（1）的位置
```

**为什么需要**：
- 默认情况下，只有正常输出会被重定向
- 错误信息仍会显示在终端
- `2>&1` 确保错误也保存到日志文件

### `&` 后台运行

```bash
command &    # 在后台运行
```

**不加 `&` 的后果**：
- 程序在前台运行
- 终端被占用，无法输入其他命令
- 关闭终端程序就停止

---

## 📊 完整流程示例

### 启动应用

```bash
# 1. 进入项目目录
cd /home/ling/coding/newAutoAnki

# 2. 使用 nohup 启动
nohup npm start > /tmp/autoanki.log 2>&1 &

# 3. 记录进程ID
# 输出示例：[1] 12345
# 12345 就是进程ID (PID)
```

### 查看进程

```bash
# 查看所有 Node.js 进程
ps aux | grep node

# 查看特定进程
ps aux | grep "node server.js"

# 查看进程树
pstree -p | grep node
```

### 查看日志

```bash
# 实时查看日志（最常用）
tail -f /tmp/autoanki.log

# 查看最后 50 行
tail -50 /tmp/autoanki.log

# 查看最前面的日志
head -20 /tmp/autoanki.log

# 搜索日志中的错误
grep -i error /tmp/autoanki.log
```

### 停止进程

```bash
# 方法1：使用 pkill（推荐）
pkill -f "node server.js"

# 方法2：使用进程ID
kill 12345

# 方法3：强制停止
kill -9 12345
# 或
pkill -9 -f "node server.js"
```

---

## 🎯 AutoAnki 专用命令

### 启动服务器

```bash
# 方法1：使用重启脚本（推荐）
./restart.sh

# 方法2：手动启动
nohup npm start > /tmp/autoanki.log 2>&1 &
echo "✓ 服务器已在后台启动"
echo "查看日志: tail -f /tmp/autoanki.log"
```

### 停止服务器

```bash
pkill -f "node server.js"
```

### 重启服务器

```bash
# 停止并重启
pkill -f "node server.js" && sleep 2 && nohup npm start > /tmp/autoanki.log 2>&1 &
```

### 查看状态

```bash
# 检查是否运行
ps aux | grep "node server.js" | grep -v grep

# 查看日志
tail -f /tmp/autoanki.log

# 测试服务器
curl http://localhost:3000/api/health
```

---

## 🔧 常见场景

### 场景1：SSH 远程服务器

```bash
# 通过 SSH 登录服务器
ssh user@server

# 启动应用（使用 nohup）
cd /path/to/app
nohup npm start > app.log 2>&1 &

# 退出 SSH（应用继续运行）
exit
```

**不用 nohup 的后果**：
- 退出 SSH 时应用也会停止

### 场景2：长时间任务

```bash
# 数据备份（需要几小时）
nohup tar -czf backup.tar.gz /data > backup.log 2>&1 &

# 数据处理
nohup python3 process_data.py > process.log 2>&1 &

# 数据库导入
nohup mysql < dump.sql > import.log 2>&1 &
```

### 场景3：多个服务

```bash
# 启动多个服务
nohup npm start > /tmp/app1.log 2>&1 &
nohup python3 service2.py > /tmp/app2.log 2>&1 &
nohup ./service3 > /tmp/app3.log 2>&1 &

# 查看所有后台任务
jobs -l
```

---

## 📝 实用技巧

### 技巧1：保存 PID

```bash
# 启动并保存进程ID
nohup npm start > /tmp/autoanki.log 2>&1 &
echo $! > /tmp/autoanki.pid

# 后续可以直接停止
kill $(cat /tmp/autoanki.pid)
```

### 技巧2：日志轮转

```bash
# 启动时添加时间戳
nohup npm start > /tmp/autoanki-$(date +%Y%m%d).log 2>&1 &

# 或者定期清理日志
> /tmp/autoanki.log  # 清空日志文件
```

### 技巧3：启动多个实例

```bash
# 不同端口运行多个实例
PORT=3000 nohup npm start > /tmp/app-3000.log 2>&1 &
PORT=3001 nohup npm start > /tmp/app-3001.log 2>&1 &
PORT=3002 nohup npm start > /tmp/app-3002.log 2>&1 &
```

### 技巧4：创建启动脚本

```bash
#!/bin/bash
# start.sh

APP_NAME="autoanki"
LOG_FILE="/tmp/${APP_NAME}.log"
PID_FILE="/tmp/${APP_NAME}.pid"

# 停止旧进程
if [ -f "$PID_FILE" ]; then
    kill $(cat "$PID_FILE") 2>/dev/null
    rm "$PID_FILE"
fi

# 启动新进程
nohup npm start > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

echo "✓ $APP_NAME 已启动"
echo "  PID: $(cat $PID_FILE)"
echo "  日志: $LOG_FILE"
```

---

## ⚠️ 注意事项

### 1. 日志文件会持续增长

```bash
# 定期检查日志大小
ls -lh /tmp/autoanki.log

# 清空日志
> /tmp/autoanki.log

# 或者使用日志轮转工具
```

### 2. 进程管理

```bash
# 推荐：使用进程管理器（生产环境）
# - PM2 (Node.js)
# - systemd (Linux 服务)
# - Supervisor
# - Docker

# PM2 示例
npm install -g pm2
pm2 start npm --name "autoanki" -- start
pm2 list
pm2 logs autoanki
pm2 restart autoanki
```

### 3. 权限问题

```bash
# 确保日志目录有写权限
touch /tmp/autoanki.log
chmod 644 /tmp/autoanki.log

# 或使用当前用户目录
nohup npm start > ~/autoanki.log 2>&1 &
```

---

## 🆚 对比：不同的后台运行方式

| 方式 | 命令 | 优点 | 缺点 |
|-----|------|-----|------|
| **nohup** | `nohup cmd &` | 简单，通用 | 需手动管理 |
| **screen** | `screen cmd` | 可重新连接 | 需要安装 |
| **tmux** | `tmux new cmd` | 功能强大 | 学习曲线 |
| **systemd** | `systemctl start` | 自动重启 | 需 root |
| **PM2** | `pm2 start` | 专业工具 | Node.js 专用 |
| **Docker** | `docker run -d` | 隔离环境 | 需容器化 |

---

## 📋 快速参考

### 启动命令

```bash
# 基本
nohup npm start &

# 带日志
nohup npm start > app.log 2>&1 &

# 完整（推荐）
nohup npm start > /tmp/autoanki.log 2>&1 &
```

### 管理命令

```bash
# 查看进程
ps aux | grep node

# 查看日志
tail -f /tmp/autoanki.log

# 停止进程
pkill -f "node server.js"

# 重启
./restart.sh
```

### 日志命令

```bash
# 实时查看
tail -f /tmp/autoanki.log

# 查看最后N行
tail -20 /tmp/autoanki.log

# 搜索错误
grep ERROR /tmp/autoanki.log

# 清空日志
> /tmp/autoanki.log
```

---

## 🎯 总结

### nohup 的核心作用

```
正常运行：终端关闭 → 进程停止
使用nohup：终端关闭 → 进程继续运行
```

### 最佳实践

1. ✅ 始终使用 `2>&1` 重定向错误
2. ✅ 指定日志文件位置
3. ✅ 定期检查日志大小
4. ✅ 使用进程管理脚本
5. ✅ 生产环境考虑使用 PM2 或 systemd

### AutoAnki 推荐用法

```bash
# 开发/测试环境
nohup npm start > /tmp/autoanki.log 2>&1 &

# 或使用重启脚本
./restart.sh

# 生产环境（推荐使用 PM2）
pm2 start npm --name "autoanki" -- start
```

---

**现在您应该完全理解 nohup 的用法了！** 🚀


