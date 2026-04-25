# Ripple Learning Platform

Ripple Learning Platform 是一个面向教学、培训和内部学习场景的教学管理平台，当前采用 Docker 部署方式运行，包含前端、核心业务服务、AI 服务、MySQL、Redis 和 Linux 练习辅助服务。

本 README 仅保留 **Docker 首次部署**、**数据库初始化**、**HTTPS 配置**、**运行校验** 和 **常见维护操作**。

## 一、项目组成

仓库当前包含以下主要目录：

- `frontend`
  - Vue 3 前端应用
  - 学员端与后台管理端共用
- `backend`
  - 核心业务服务
  - 负责认证、日报、作业、考试、视频资源、系统设置等
- `ai-service`
  - 独立 AI 服务
  - 当前用于模拟面试及后续 AI 扩展能力
- `docker`
  - Docker Compose、Nginx、MySQL 初始化脚本
- `linux-tutor`
  - Linux 练习辅助服务

## 二、部署架构

生产环境通过 Docker Compose 启动以下服务：

- `mysql`
- `redis`
- `backend`
- `ai-service`
- `frontend`
- `linux-tutor`

外部访问入口：

- 网站首页：`https://www.atomai.cloud`
- 核心 API：`/api/*`
- AI 接口：
  - `/api/ai-assistant/*`
  - `/api/mock-interview/*`

## 三、首次部署前准备

### 1. 服务器要求

建议至少满足：

- Linux 服务器
- 已安装 Docker
- 已安装 Docker Compose
- 已开放端口：
  - `80`
  - `443`
  - 如需外部直连数据库再开放 `3306`

### 2. 域名解析

将以下域名解析到服务器公网 IP：

- `www.atomai.cloud`
- `atomai.cloud`

### 3. HTTPS 证书

当前 Nginx 配置固定读取以下证书路径：

- `docker/certs/atomai.cloud.pem`
- `docker/certs/atomai.cloud.key`

也就是说，你需要把证书文件放到仓库中的：

```text
docker/certs/atomai.cloud.pem
docker/certs/atomai.cloud.key
```

Nginx 配置文件位置：

- [frontend/nginx.conf](E:/code/ripple-learning-platform/frontend/nginx.conf)

## 四、首次部署完整流程

### 第 1 步：准备代码

把项目代码拉到服务器，例如：

```bash
git clone <your-repo-url> ripple-learning-platform
cd ripple-learning-platform
```

### 第 2 步：准备 Docker 环境变量

在 `docker` 目录下创建 `.env` 文件。

可参考：

- [docker/.env.example](E:/code/ripple-learning-platform/docker/.env.example)

建议至少配置：

```env
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=ripple_learning_platform
MYSQL_USER=ripple_user
MYSQL_PASSWORD=your_db_password

JWT_SECRET=your_jwt_secret

DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

REDIS_URL=redis://redis:6379
```

如果暂时不用 DeepSeek，可以把 `DEEPSEEK_API_KEY` 留空。

### 第 3 步：放置 HTTPS 证书

将证书放到：

```text
docker/certs/atomai.cloud.pem
docker/certs/atomai.cloud.key
```

### 第 4 步：启动整套服务

```bash
cd docker
docker compose up -d --build
```

### 第 5 步：检查容器状态

```bash
docker compose ps
```

你应该能看到以下容器：

- `ripple-mysql`
- `ripple-redis`
- `ripple-backend`
- `ripple-ai-service`
- `ripple-frontend`
- `ripple-linux-tutor`

### 第 6 步：检查后端 migration 是否执行

后端启动时会自动执行 migration。

相关文件：

- [backend/src/config/database.ts](E:/code/ripple-learning-platform/backend/src/config/database.ts)
- [backend/src/database/migrate.ts](E:/code/ripple-learning-platform/backend/src/database/migrate.ts)

当前 migration 包括：

- `001_initial_schema.sql`
- `002_indexes_and_compat.sql`
- `003_app_settings.sql`
- `004_bos_storage_settings.sql`

进入 MySQL 检查：

```bash
docker exec -it ripple-mysql mysql -uroot -p
```

执行：

```sql
USE ripple_learning_platform;
SELECT * FROM schema_migrations ORDER BY version;
```

期望看到：

- `001_initial_schema.sql`
- `002_indexes_and_compat.sql`
- `003_app_settings.sql`
- `004_bos_storage_settings.sql`

### 第 7 步：执行数据库结构校验

仓库已提供数据库校验脚本：

- [validate_schema.sql](E:/code/ripple-learning-platform/backend/src/database/validate_schema.sql)

可以这样执行：

```bash
docker exec -i ripple-mysql mysql -uroot -pYOUR_ROOT_PASSWORD ripple_learning_platform < ../backend/src/database/validate_schema.sql
```

重点关注：

- `migration_status`
- `table_status`
- `column_status`
- `index_status`
- `app_settings_status`

都应为 `OK`。

### 第 8 步：如果数据库是旧库，执行修复脚本

如果你发现：

- `app_settings` 缺失
- `graded_by` 缺失
- migration 记录没写
- 管理员姓名乱码

可以执行修复脚本：

- [manual_fix_2026_04_24.sql](E:/code/ripple-learning-platform/backend/src/database/manual_fix_2026_04_24.sql)

执行方式：

```bash
docker exec -i ripple-mysql mysql -uroot -pYOUR_ROOT_PASSWORD ripple_learning_platform < ../backend/src/database/manual_fix_2026_04_24.sql
```

执行完成后，再重新执行一次：

- [validate_schema.sql](E:/code/ripple-learning-platform/backend/src/database/validate_schema.sql)

### 第 9 步：检查健康检查接口

backend：

- `/health/live`
- `/health/ready`
- `/health`

ai-service：

- `/health/live`
- `/health/ready`

你可以在服务器上检查：

```bash
curl http://127.0.0.1:3001/health/ready
curl http://127.0.0.1:3002/health/ready
```

### 第 10 步：打开网站验证

访问：

```text
https://www.atomai.cloud
```

首次上线建议至少检查：

- 登录页是否正常打开
- 学员首页是否正常显示
- 后台首页是否正常显示
- 今日作业、今日日报、在线视频、考试入口是否可访问
- 系统设置页是否可打开

## 五、首次部署后重点检查项

### 1. 数据库时区

当前 Compose 已配置：

- `TZ=Asia/Shanghai`
- MySQL `--default-time-zone=+08:00`

建议检查：

```bash
docker exec -it ripple-mysql mysql -uroot -pYOUR_ROOT_PASSWORD -e "SELECT NOW(), @@global.time_zone, @@session.time_zone;"
```

### 2. Redis 时间与运行状态

检查：

```bash
docker exec -it ripple-redis redis-cli ping
docker exec -it ripple-redis date
```

### 3. HTTPS 是否生效

检查：

- `http://www.atomai.cloud` 是否自动跳转到 `https://www.atomai.cloud`
- 证书是否被浏览器正确识别

## 六、系统设置说明

后台系统设置当前支持：

- 允许学员注册
- 日报提醒
- 作业提醒
- 最大文件大小
- 百度 BOS 开关
- BOS 域名
- BOS Bucket
- BOS AK
- BOS SK
- API 限流配置

说明：

- BOS 配置已改为从系统设置读取
- 不再依赖后端配置文件硬编码
- 若 BOS 未启用或配置不完整，会自动回退到本地 `/uploads`

## 七、作业上传与下载说明

### 上传

- 优先使用系统设置中的 BOS 配置
- BOS 上传失败时自动回退到本地 `/uploads`

### 下载

- 作业下载统一走后端代理
- 下载文件名由后端动态生成
- 若资源失效，会明确返回：
  - 附件不存在或已失效
  - 附件暂时无法访问

## 八、登录超时说明

当前系统已支持：

- 空闲超时自动失效
- token 过期后重新登录
- 登录失败和会话过期已区分处理

也就是说：

- 密码错误不会再误提示“登录过期”
- 真正的会话失效才会跳回登录页

## 九、后台与学员端主路由

### 学员端

- `/`
- `/daily-reports`
- `/assignments`
- `/videos`
- `/mock-interview`
- `/learning/commands`
- `/learning/practice`
- `/learning/quiz`
- `/linux-exam`

### 管理后台

- `/admin`
- `/admin/users`
- `/admin/daily-reports`
- `/admin/assignments`
- `/admin/exams`
- `/admin/videos`
- `/admin/gradebook`
- `/admin/system`

## 十、常用维护命令

### 查看容器状态

```bash
cd docker
docker compose ps
```

### 查看后端日志

```bash
docker logs -f ripple-backend
```

### 查看 AI 服务日志

```bash
docker logs -f ripple-ai-service
```

### 查看前端日志

```bash
docker logs -f ripple-frontend
```

### 查看 MySQL 日志

```bash
docker logs -f ripple-mysql
```

### 重启某个服务

```bash
cd docker
docker compose restart backend
docker compose restart frontend
docker compose restart ai-service
```

### 重新构建并启动

```bash
cd docker
docker compose up -d --build
```

## 十一、当前已知约束

- 如果数据库是历史旧库，建议优先执行校验脚本和修复脚本
- 当前数据库结构以 migration 为主线，不要再依赖运行时建表
- 如果修改了证书、Nginx 或 Docker Compose，需要重新构建或重启相关服务

## 十二、推荐首次部署后保留的检查记录

建议你保留以下结果截图或输出，方便后续排障：

- `docker compose ps`
- `schema_migrations` 查询结果
- `validate_schema.sql` 执行结果
- `backend / ai-service / mysql` 健康检查结果
- 网站首页与后台首页可访问截图
