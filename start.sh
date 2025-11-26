#!/bin/bash

echo "=========================================="
echo "   AutoAnki - Anki卡包生成器"
echo "=========================================="
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "[提示] 首次运行，正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败"
        exit 1
    fi
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    echo ""
    echo "[警告] 未找到.env配置文件"
    echo "[提示] 正在创建默认配置文件..."
    cp .env.example .env
    echo ""
    echo "请编辑.env文件，填入你的API密钥后重新运行"
    echo ""
    exit 0
fi

# 启动服务器
echo ""
echo "[启动] 正在启动AutoAnki服务器..."
echo ""
node server.js




