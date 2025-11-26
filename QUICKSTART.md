# AutoAnki 快速开始指南

## 🚀 30秒快速体验

### 步骤1：安装依赖（仅首次）

打开终端/命令行，运行：

```bash
npm install
```

### 步骤2：启动应用

**Windows用户：**
```bash
双击运行 start.bat 文件
```

**Mac/Linux用户：**
```bash
chmod +x start.sh
./start.sh
```

或者直接运行：
```bash
npm start
```

### 步骤3：打开浏览器

访问：http://localhost:3000

### 步骤4：体验演示模式（无需API配置）

1. 在文本框中输入任意学习材料（或使用示例）
2. **按住 Shift 键**，点击"制卡"按钮
3. 查看生成的演示卡片
4. 点击"导出"下载.apkg文件

**示例学习材料：**
```
光合作用是绿色植物利用光能，将二氧化碳和水转化为有机物，
并释放氧气的过程。它包括光反应和暗反应两个阶段。
```

## 🔧 配置真实AI（可选）

如果想使用真实的AI生成卡片：

### 1. 创建配置文件

复制示例配置：
```bash
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux
```

### 2. 获取API密钥

推荐选项（选一个即可）：

**选项A：DeepSeek（推荐，便宜好用）**
1. 访问：https://platform.deepseek.com/
2. 注册并获取API密钥
3. 编辑.env文件：
```env
OPENAI_API_KEY=sk-your-deepseek-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

**选项B：OpenAI**
1. 访问：https://platform.openai.com/
2. 获取API密钥
3. 编辑.env文件：
```env
OPENAI_API_KEY=sk-your-openai-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo
```

**选项C：智谱AI**
1. 访问：https://open.bigmodel.cn/
2. 获取API密钥
3. 编辑.env文件：
```env
OPENAI_API_KEY=your-zhipu-key
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
OPENAI_MODEL=glm-4
```

### 3. 重启服务

按 Ctrl+C 停止服务器，然后重新运行：
```bash
npm start
```

## 📝 使用流程

### 完整使用流程：

1. **输入材料** → 粘贴学习内容到文本框
2. **设置数量** → 选择要生成的卡片数量（1-100）
3. **生成卡片** → 点击"制卡"按钮（或Shift+点击使用演示模式）
4. **预览编辑** → 查看并编辑生成的卡片
5. **导出卡包** → 点击"导出"下载.apkg文件
6. **导入Anki** → 在Anki中导入.apkg文件开始学习

## 💡 常见问题

**Q：没有API密钥可以用吗？**
A：可以！按住Shift键点击"制卡"使用演示模式。

**Q：API密钥要钱吗？**
A：需要。但DeepSeek很便宜，生成一张卡片只需几分钱。

**Q：生成失败怎么办？**
A：
1. 检查.env文件配置是否正确
2. 确认API密钥有余额
3. 检查网络连接
4. 使用演示模式测试

**Q：如何在Anki中使用？**
A：
1. 打开Anki
2. 文件 → 导入
3. 选择下载的.apkg文件
4. 点击导入
5. 开始学习！

## 🎯 使用技巧

### 材料准备技巧：
- ✅ 使用清晰的段落和结构
- ✅ 包含完整的定义和解释
- ✅ 200-1000字最佳
- ❌ 避免纯列表或碎片化信息

### 卡片数量建议：
- 短文本（<300字）：**5-10张**
- 中等文本（300-800字）：**10-20张**
- 长文本（>800字）：**20-50张**

### 编辑优化：
- 检查卡片的准确性
- 添加个人理解和例子
- 简化复杂的表述
- 确保问答对应

## 📚 下一步

- 阅读完整文档：[README.md](README.md)
- 详细使用指南：[USAGE.md](USAGE.md)
- 开始制作你的第一个卡包！

## 🆘 需要帮助？

- 查看详细文档
- 检查日志输出
- 在GitHub提Issue

---

**现在就开始体验吧！** 🎉

运行 `npm start`，打开 http://localhost:3000




