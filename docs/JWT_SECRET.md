# JWT Secret 配置说明

## 是否必须配置？

**不是必须配置，但生产环境强烈推荐配置！**

- 如果不配置，系统会使用默认密钥：`default_jwt_secret_change_in_production`
- 虽然可以运行，但**极不安全**，任何人都可以用默认密钥伪造 token

## 应该配置成什么？

JWT Secret 应该是一个：
- **随机生成的字符串**
- **长度至少 32 位**
- **包含大小写字母、数字、特殊字符**

## 如何生成？

### 方式一：使用 OpenSSL（推荐）
```bash
# 生成 64 位随机字符串
openssl rand -base64 64

# 或生成 32 位随机字符串
openssl rand -hex 32
```

### 方式二：使用 Node.js
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 方式三：使用 Linux /dev/urandom
```bash
cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1
```

### 方式四：在线工具（仅开发测试使用）
- https://www.grc.com/passwords.htm
- https://passwordsgenerator.net/

## 配置方法

### 开发环境
修改 `backend/.env` 文件：
```env
JWT_SECRET=your_generated_secret_here
```

### Docker 部署
1. 复制示例文件：
```bash
cd docker
cp .env.example .env
```

2. 编辑 `.env` 文件，设置 JWT_SECRET：
```env
JWT_SECRET=your_generated_secret_here
```

3. 重新启动服务：
```bash
docker-compose down
docker-compose up -d
```

## 安全建议

⚠️ **重要提示**：
1. **永远不要**将真实的 JWT Secret 提交到代码仓库
2. **定期更换** JWT Secret（建议每 3-6 个月）
3. **不同环境使用不同密钥**（开发、测试、生产）
4. **妥善保管**，丢失后所有已颁发的 token 都将失效

## 更换密钥的影响

更换 JWT Secret 后：
- ✅ 新颁发的 token 使用新密钥
- ❌ 所有已颁发的 token 将失效（用户需要重新登录）

建议在低峰期更换密钥。
