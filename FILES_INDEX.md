# AutoAnki 文件索引

## 📂 完整文件列表

### 核心代码文件

| 文件 | 类型 | 行数 | 说明 |
|------|------|------|------|
| `server.js` | JavaScript | ~200 | Node.js后端服务器，处理API请求和AI调用 |
| `public/index.html` | HTML | ~70 | 前端主页面，包含输入和预览两个视图 |
| `public/style.css` | CSS | ~250 | 完整样式表，参考原型图设计 |
| `public/app.js` | JavaScript | ~220 | 前端逻辑，状态管理和用户交互 |
| `public/demo-data.js` | JavaScript | ~60 | 演示模式的示例卡片数据 |

### 配置文件

| 文件 | 类型 | 说明 |
|------|------|------|
| `package.json` | JSON | 项目依赖和脚本配置 |
| `.env.example` | ENV | 环境变量配置模板 |
| `.gitignore` | Text | Git忽略规则 |

### 启动脚本

| 文件 | 平台 | 说明 |
|------|------|------|
| `start.bat` | Windows | Windows启动脚本 |
| `start.sh` | Unix | Linux/Mac启动脚本 |

### 文档文件

| 文件 | 用途 | 字数 | 目标读者 |
|------|------|------|---------|
| `README.md` | 项目主文档 | ~2500 | 所有用户 |
| `QUICKSTART.md` | 快速开始 | ~1500 | 新用户 |
| `INSTALL.md` | 安装指南 | ~2000 | 技术用户 |
| `USAGE.md` | 使用手册 | ~3000 | 进阶用户 |
| `PROJECT_SUMMARY.md` | 技术总结 | ~2500 | 开发者 |
| `WELCOME.md` | 欢迎页面 | ~1800 | 首次用户 |
| `FILES_INDEX.md` | 本文件 | ~400 | 所有人 |
| `LICENSE` | 许可证 | - | 法律 |

### 示例文件

| 文件 | 主题 | 字数 | 推荐卡片数 |
|------|------|------|-----------|
| `examples/example-1-photosynthesis.txt` | 生物学 | ~400 | 15-25 |
| `examples/example-2-programming.txt` | 编程 | ~350 | 10-20 |
| `examples/example-3-history.txt` | 历史 | ~450 | 20-30 |
| `examples/README.md` | 说明 | ~500 | - |

## 📊 项目统计

### 代码统计
- **总代码行数**: ~1000行
- **JavaScript**: ~480行
- **HTML**: ~70行
- **CSS**: ~250行
- **其他**: ~200行

### 文件统计
- **总文件数**: 21个
- **代码文件**: 5个
- **文档文件**: 8个
- **配置文件**: 3个
- **示例文件**: 4个
- **其他**: 1个

### 文档统计
- **总文档字数**: ~14,200字
- **文档页数**: ~28页（A4纸估算）
- **代码注释**: 充足
- **示例材料**: 3个完整示例

## 🗂️ 目录结构

```
newAutoAnki/
├── 📁 public/                  # 前端文件
│   ├── 📄 index.html          # 主页面
│   ├── 📄 style.css           # 样式
│   ├── 📄 app.js              # 前端逻辑
│   └── 📄 demo-data.js        # 演示数据
│
├── 📁 examples/                # 示例材料
│   ├── 📄 example-1-photosynthesis.txt
│   ├── 📄 example-2-programming.txt
│   ├── 📄 example-3-history.txt
│   └── 📄 README.md
│
├── 📄 server.js               # 后端服务器
├── 📄 package.json            # 依赖配置
├── 📄 .env.example            # 环境变量模板
├── 📄 .gitignore              # Git忽略
│
├── 📄 start.bat               # Windows启动
├── 📄 start.sh                # Unix启动
│
├── 📄 README.md               # 项目主文档
├── 📄 QUICKSTART.md           # 快速开始
├── 📄 INSTALL.md              # 安装指南
├── 📄 USAGE.md                # 使用手册
├── 📄 PROJECT_SUMMARY.md      # 技术总结
├── 📄 WELCOME.md              # 欢迎页面
├── 📄 FILES_INDEX.md          # 文件索引（本文件）
└── 📄 LICENSE                 # MIT许可证
```

## 🎯 文件阅读顺序建议

### 新用户
1. `WELCOME.md` - 欢迎和概览
2. `QUICKSTART.md` - 30秒上手
3. `examples/README.md` - 示例说明
4. 开始使用！

### 技术用户
1. `README.md` - 项目总览
2. `INSTALL.md` - 详细安装
3. `USAGE.md` - 完整使用
4. `PROJECT_SUMMARY.md` - 技术细节

### 开发者
1. `PROJECT_SUMMARY.md` - 技术架构
2. `server.js` - 后端代码
3. `public/app.js` - 前端逻辑
4. `FILES_INDEX.md` - 文件索引（本文件）

## 📝 文件用途速查

### 想要...
- **快速开始** → `QUICKSTART.md`
- **安装应用** → `INSTALL.md`
- **学习使用** → `USAGE.md`
- **了解技术** → `PROJECT_SUMMARY.md`
- **查看示例** → `examples/`
- **修改代码** → `server.js`, `public/app.js`
- **调整样式** → `public/style.css`
- **配置API** → `.env.example`
- **解决问题** → `INSTALL.md` FAQ部分

## 🔍 关键代码位置

### 前端 (public/)
- **页面切换**: `app.js` 第35-49行
- **生成卡片**: `app.js` 第52-119行
- **卡片渲染**: `app.js` 第122-154行
- **编辑功能**: `app.js` 第178-192行
- **导出功能**: `app.js` 第205-236行

### 后端 (server.js)
- **系统提示词**: 第24-74行
- **生成卡片API**: 第77-145行
- **演示模式**: 第86-100行
- **导出APKG**: 第149-182行
- **健康检查**: 第185-193行

### 样式 (public/style.css)
- **输入页面**: 第42-125行
- **预览页面**: 第164-235行
- **卡片样式**: 第237-272行
- **响应式**: 第317-338行

## 🛠️ 自定义修改指南

### 修改AI提示词
📝 编辑 `server.js` 第24-74行的 `SYSTEM_PROMPT`

### 修改界面样式
🎨 编辑 `public/style.css`

### 调整卡片类型
🔧 修改 `server.js` 的提示词和 `public/app.js` 的渲染逻辑

### 添加新功能
- 前端功能: 编辑 `public/app.js`
- 后端API: 编辑 `server.js`
- 界面元素: 编辑 `public/index.html` 和 `public/style.css`

## 📦 依赖关系

```
package.json
    ├── express (Web服务器)
    ├── cors (跨域支持)
    └── anki-apkg-export (卡包生成)

server.js
    ├── 依赖 package.json
    ├── 读取 .env
    └── 服务 public/

public/index.html
    ├── 引用 style.css
    └── 引用 app.js

public/app.js
    ├── 调用 server.js API
    └── 可选使用 demo-data.js
```

## 🔄 更新历史

- **v1.0.0** (2025-10-15) - 初始版本
  - ✅ 核心功能完成
  - ✅ 完整文档
  - ✅ 演示模式
  - ✅ 三个示例

## 📋 待办事项（未来版本）

- [ ] 支持文档上传（PDF、DOCX）
- [ ] 批量处理
- [ ] 历史记录
- [ ] 用户系统
- [ ] 数据库集成
- [ ] 更多AI模型选择

## 🎯 文件完整性检查清单

- [x] 所有核心代码文件
- [x] 所有配置文件
- [x] 所有文档文件
- [x] 所有示例文件
- [x] 启动脚本
- [x] 许可证
- [x] README

## 📞 获取帮助

如果找不到某个文件或功能：
1. 查看本索引
2. 阅读 `README.md`
3. 检查 `PROJECT_SUMMARY.md`
4. 在GitHub提Issue

---

**文件索引版本**: v1.0.0  
**最后更新**: 2025-10-15  
**总文件数**: 21  
**项目状态**: ✅ 完成




