# AutoAnki 用户系统使用指南

## 功能概览

AutoAnki 现已集成完整的用户系统和积分机制，支持用户注册、登录、充值和消费管理。

## 核心功能

### 1. 试用机制

#### 未登录用户
- 免费试用：**10张卡片**
- 无需注册即可体验核心功能

#### 已登录用户
- 免费试用：**20张卡片**（基础10张 + 登录额外10张）
- 试用额度用完后需要充值积分

### 2. 积分系统

#### 积分消耗
- 每张卡片消耗：**15积分**（可在系统配置中调整）
- 使用试用额度时不消耗积分
- 积分不足时会提示充值

#### 充值方式
- **微信支付**：扫码支付
- **支付宝支付**：扫码支付
- 充值汇率：**1元 = 100积分**

### 3. 用户中心

#### 账户概览
- 查看当前积分余额
- 查看试用额度使用情况
- 查看已生成卡片总数

#### 充值功能
- 快速选择充值金额（¥10/30/50/100）
- 支持自定义充值金额
- 选择支付方式（微信/支付宝）
- 扫码支付完成充值

#### 消费记录
- 查看积分变动明细
- 包含充值、消费、退款记录
- 显示每次操作后的余额

#### 订单记录
- 查看所有充值订单
- 订单状态跟踪
- 订单详情查询

## 使用流程

### 初次使用
1. 打开 AutoAnki 首页
2. 直接使用免费试用（10张卡片）
3. 无需注册即可体验

### 注册登录
1. 点击右上角"登录/注册"按钮
2. 填写用户名、邮箱、密码完成注册
3. 或使用已有账号登录

### 生成卡片
1. 输入学习材料（最多3000字）
2. 选择生成数量（1-20张）
3. 点击"制卡"按钮
4. 系统自动判断使用试用额度或扣除积分

### 充值积分
1. 进入用户中心
2. 点击"充值"标签
3. 选择充值金额
4. 选择支付方式
5. 扫码完成支付
6. 积分自动到账

## 技术特性

### 后端架构
- **框架**：Express.js
- **数据库**：SQLite3 (better-sqlite3)
- **认证**：JWT + Session
- **密码加密**：bcryptjs

### 数据库表结构
- `users`：用户信息表
- `credit_transactions`：积分交易记录
- `orders`：订单表
- `card_generations`：卡片生成记录
- `system_config`：系统配置表

### 安全特性
- 密码哈希存储
- JWT token认证
- Session管理
- CORS配置
- SQL注入防护

## API接口

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 积分相关
- `GET /api/credits/history` - 获取积分历史
- `GET /api/config` - 获取系统配置

### 支付相关
- `POST /api/payment/create-order` - 创建充值订单
- `GET /api/payment/order/:orderNo` - 查询订单状态
- `GET /api/payment/orders` - 获取订单列表
- `POST /api/payment/mock-pay` - 模拟支付（测试用）

### 卡片生成
- `POST /api/generate-cards` - 生成卡片（已集成权限控制）
- `POST /api/export-apkg` - 导出APKG文件

## 配置说明

### 环境变量配置（.env文件）

```env
# AI API配置
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat

# 认证密钥
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here

# 微信支付配置
WECHAT_APP_ID=
WECHAT_MCH_ID=
WECHAT_API_KEY=
WECHAT_NOTIFY_URL=

# 支付宝配置
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
ALIPAY_NOTIFY_URL=

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 系统配置（可在数据库中调整）

- `credits_per_card`：每张卡片消耗积分数（默认：15）
- `free_trial_cards`：未登录用户试用卡片数（默认：10）
- `logged_in_trial_cards`：登录用户额外试用数（默认：10）
- `recharge_rate`：充值汇率（默认：100，即1元=100积分）

## 安装部署

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

### 3. 启动服务
```bash
npm start
```

### 4. 访问应用
打开浏览器访问：http://localhost:3000

## 测试功能

### 模拟支付
在开发环境中，可以使用"模拟支付"功能测试充值流程：
1. 创建充值订单
2. 在支付弹窗中点击"模拟支付完成"按钮
3. 积分立即到账

### 演示模式
按住 Shift 键点击"制卡"按钮可使用演示模式，无需配置AI API。

## 注意事项

1. **生产环境**：
   - 必须修改 JWT_SECRET 和 SESSION_SECRET
   - 配置真实的支付接口参数
   - 使用 HTTPS 协议
   - 设置 NODE_ENV=production

2. **支付集成**：
   - 当前支付功能为模拟实现
   - 实际使用需要接入真实的微信/支付宝支付API
   - 需要配置支付回调URL

3. **数据库**：
   - SQLite适合中小规模应用
   - 大规模应用建议迁移到 MySQL/PostgreSQL

4. **安全建议**：
   - 定期备份数据库
   - 使用强密码策略
   - 启用 HTTPS
   - 设置合理的会话过期时间

## 常见问题

### Q: 如何修改积分单价？
A: 在数据库的 `system_config` 表中修改 `credits_per_card` 的值，或通过API更新配置。

### Q: 如何重置用户试用额度？
A: 直接修改用户表中的 `free_cards_used` 字段为 0。

### Q: 支付接口如何对接？
A: 在 `services/payment.js` 中实现真实的微信/支付宝支付API调用逻辑。

### Q: 如何查看用户数据？
A: 数据库文件位于 `database/autoanki.db`，可使用SQLite工具查看。

## 技术支持

如有问题或建议，请提交Issue或联系开发团队。

---

**版本**: 2.0  
**最后更新**: 2025-10-15



