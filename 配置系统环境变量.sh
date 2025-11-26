#!/bin/bash

# AutoAnki PayPal 环境变量配置脚本

echo "🔧 配置 PayPal 环境变量"
echo "================================"
echo ""
echo "请输入您的 PayPal Client ID："
read -p "> " CLIENT_ID

echo ""
echo "请输入您的 PayPal Secret："
read -s -p "> " CLIENT_SECRET
echo ""

echo ""
echo "选择环境模式："
echo "1) sandbox (测试环境)"
echo "2) live (生产环境)"
read -p "请选择 [1/2]: " MODE_CHOICE

if [ "$MODE_CHOICE" = "2" ]; then
    MODE="live"
else
    MODE="sandbox"
fi

# 添加到 ~/.bashrc（永久生效）
echo "" >> ~/.bashrc
echo "# AutoAnki PayPal Configuration" >> ~/.bashrc
echo "export PAYPAL_MODE=\"$MODE\"" >> ~/.bashrc
echo "export PAYPAL_CLIENT_ID=\"$CLIENT_ID\"" >> ~/.bashrc
echo "export PAYPAL_CLIENT_SECRET=\"$CLIENT_SECRET\"" >> ~/.bashrc
echo "export PAYPAL_RETURN_URL=\"http://localhost:3000/user-center.html#recharge\"" >> ~/.bashrc
echo "export PAYPAL_CANCEL_URL=\"http://localhost:3000/user-center.html#recharge\"" >> ~/.bashrc

# 立即生效（当前会话）
export PAYPAL_MODE="$MODE"
export PAYPAL_CLIENT_ID="$CLIENT_ID"
export PAYPAL_CLIENT_SECRET="$CLIENT_SECRET"
export PAYPAL_RETURN_URL="http://localhost:3000/user-center.html#recharge"
export PAYPAL_CANCEL_URL="http://localhost:3000/user-center.html#recharge"

echo ""
echo "✅ 配置完成！"
echo ""
echo "环境变量已添加到 ~/.bashrc"
echo "当前会话已生效"
echo ""
echo "验证配置："
echo "  PAYPAL_MODE: $PAYPAL_MODE"
echo "  PAYPAL_CLIENT_ID: ${PAYPAL_CLIENT_ID:0:10}...${PAYPAL_CLIENT_ID: -5}"
echo "  PAYPAL_CLIENT_SECRET: ********"
echo ""
echo "现在可以启动服务器："
echo "  npm start"
echo ""
