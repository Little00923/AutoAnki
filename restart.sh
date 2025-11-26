#!/bin/bash
# AutoAnki 重启脚本

echo "🔄 正在重启 AutoAnki..."

# 停止服务器
pkill -f "node server.js"
echo "✓ 已停止旧进程"

# 等待2秒
sleep 2

# 启动服务器（后台运行）
nohup npm start > /tmp/autoanki.log 2>&1 &
echo "✓ 正在启动服务器..."

# 等待3秒让服务器启动
sleep 3

# 检查状态
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ 服务器重启成功！"
    echo "📍 访问地址: http://localhost:3000"
else
    echo "⚠️  服务器启动中，请稍等..."
    echo "📋 查看日志: tail -f /tmp/autoanki.log"
fi
