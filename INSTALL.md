# AutoAnki 安装指南

## 系统要求

- **Node.js**: v14.0.0 或更高版本
- **npm**: v6.0.0 或更高版本
- **操作系统**: Windows、macOS 或 Linux
- **浏览器**: Chrome、Firefox、Safari、Edge（现代版本）

## 检查环境

在开始前，检查你的系统是否已安装Node.js：

```bash
node --version
npm --version
```

如果未安装，请访问 https://nodejs.org/ 下载安装。

## 安装步骤

### 步骤 1: 下载项目

如果你还没有项目文件，可以通过以下方式获取：

**Git克隆（如果有仓库）：**
```bash
git clone https://github.com/yourusername/autoanki.git
cd autoanki
```

**或直接使用现有文件夹：**
```bash
cd d:\MyProgram\newAutoAnki
```

### 步骤 2: 安装依赖

在项目根目录运行：

```bash
npm install
```

这将安装以下依赖：
- express (Web服务器)
- cors (跨域支持)
- anki-apkg-export (Anki卡包生成)

**预期输出：**
```
added 57 packages in 5s
```

### 步骤 3: 配置环境变量（可选）

#### 3.1 创建配置文件

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

#### 3.2 编辑配置

用文本编辑器打开 `.env` 文件：

**如果使用OpenAI：**
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo
PORT=3000
```

**如果使用DeepSeek（推荐）：**
```env
OPENAI_API_KEY=sk-your-deepseek-api-key-here
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
PORT=3000
```

**如果使用智谱AI：**
```env
OPENAI_API_KEY=your-zhipu-api-key-here
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
OPENAI_MODEL=glm-4
PORT=3000
```

**💡 提示：** 如果暂时没有API密钥，可以跳过此步骤，使用演示模式！

### 步骤 4: 启动应用

#### 方法A：使用启动脚本（推荐）

**Windows：**
双击 `start.bat` 文件

**Mac/Linux：**
```bash
chmod +x start.sh
./start.sh
```

#### 方法B：使用npm命令

```bash
npm start
```

### 步骤 5: 访问应用

看到以下输出表示启动成功：

```
╔═══════════════════════════════════════════╗
║        AutoAnki 服务器已启动              ║
╚═══════════════════════════════════════════╝

🌐 访问地址: http://localhost:3000
📝 API端点: 
   - POST /api/generate-cards (生成卡片)
   - POST /api/export-apkg (导出卡包)
   - GET  /api/health (健康检查)

⚙️  配置信息:
   - AI模型: gpt-3.5-turbo
   - API地址: https://api.openai.com/v1
   - API密钥: 已配置 ✓
```

打开浏览器访问：**http://localhost:3000**

## 验证安装

### 1. 健康检查

访问：http://localhost:3000/api/health

应该看到：
```json
{
  "status": "ok",
  "hasApiKey": true,
  "apiBaseURL": "https://api.openai.com/v1",
  "model": "gpt-3.5-turbo"
}
```

### 2. 测试演示模式

1. 打开 http://localhost:3000
2. 在文本框中输入任意文本
3. **按住 Shift 键**，点击"制卡"
4. 等待2秒，应该看到生成的演示卡片

### 3. 测试真实API（如果已配置）

1. 在文本框中粘贴以下内容：
```
光合作用是绿色植物利用光能，将二氧化碳和水转化为有机物，
并释放氧气的过程。
```
2. 点击"制卡"（不按Shift）
3. 等待AI生成卡片

### 4. 测试导出功能

1. 生成卡片后，点击"导出"按钮
2. 浏览器应该下载一个 `.apkg` 文件
3. 可以将此文件导入Anki测试

## 常见安装问题

### 问题1: npm install 失败

**症状：**
```
npm ERR! code ECONNREFUSED
```

**解决方案：**
```bash
# 清理npm缓存
npm cache clean --force

# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 重新安装
npm install
```

### 问题2: 端口被占用

**症状：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案：**

**方法1：更改端口**
在 `.env` 文件中添加：
```env
PORT=3001
```

**方法2：关闭占用端口的程序**

Windows:
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Mac/Linux:
```bash
lsof -i :3000
kill -9 <PID>
```

### 问题3: Node版本过低

**症状：**
```
SyntaxError: Unexpected token '?'
```

**解决方案：**
升级Node.js到v14或更高版本：
https://nodejs.org/

### 问题4: API调用失败

**症状：**
前端显示"生成卡片失败"

**检查步骤：**
1. 确认 `.env` 文件存在且配置正确
2. 检查API密钥是否有效
3. 检查网络连接
4. 查看控制台错误信息
5. 使用演示模式测试（Shift+点击）

## 开发模式

如果你想修改代码并实时重载：

```bash
npm run dev
```

这将使用 `nodemon` 监听文件变化并自动重启服务器。

## 卸载

如果要完全卸载：

```bash
# 删除依赖
rm -rf node_modules

# 删除配置（可选）
rm .env

# 如果要删除整个项目
cd ..
rm -rf newAutoAnki
```

## 更新

如果有新版本发布：

```bash
# 拉取最新代码
git pull

# 更新依赖
npm install

# 重启服务
npm start
```

## 生产部署（可选）

如果要部署到服务器：

### 使用PM2（推荐）

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name autoanki

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs autoanki

# 重启
pm2 restart autoanki
```

### 使用Docker（可选）

创建 `Dockerfile`：
```dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

构建和运行：
```bash
docker build -t autoanki .
docker run -p 3000:3000 --env-file .env autoanki
```

## 技术支持

如果遇到问题：

1. 查看 [QUICKSTART.md](QUICKSTART.md)
2. 查看 [README.md](README.md)
3. 检查服务器控制台日志
4. 检查浏览器控制台
5. 在GitHub提Issue

## 下一步

安装成功后：
- 阅读 [QUICKSTART.md](QUICKSTART.md) 快速上手
- 查看 [examples/](examples/) 目录中的示例材料
- 开始制作你的第一个Anki卡包！

---

**祝你安装顺利！** 🎉

如有问题，请随时反馈。




