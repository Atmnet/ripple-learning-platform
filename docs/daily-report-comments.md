# 日报评论功能实现说明

## 功能概述
已实现日报评论和反馈功能，支持：
- 学生对已提交的日报进行评论
- 老师对所有日报进行评论和反馈
- 评论的编辑和删除
- 已读/未读状态标记

## 实现内容

### 1. 数据库表
新增 `daily_report_comments` 表：
- `id` - 评论ID
- `report_id` - 关联日报ID
- `user_id` - 评论用户ID
- `content` - 评论内容
- `is_read` - 是否已读
- `created_at` / `updated_at` - 时间戳

### 2. 后端 API
新增接口：
- `GET /api/daily-reports/:id/comments` - 获取评论列表
- `POST /api/daily-reports/:id/comments` - 发表评论
- `PUT /api/daily-reports/:id/comments/:commentId` - 编辑评论
- `DELETE /api/daily-reports/comments/:commentId` - 删除评论

修改接口：
- `GET /api/daily-reports/admin/status` - 返回数据包含评论数量

### 3. 前端页面
修改文件：
- `DailyReportDetail.vue` - 详情页新增评论区域
- `DailyReportsAdmin.vue` - 管理列表显示评论数量

## 权限控制
- 学生只能评论自己的日报
- 老师可以评论所有日报
- 只能编辑/删除自己的评论（管理员除外）
- 日报作者查看评论时自动标记为已读

## 界面预览
日报详情页新增：
- 评论数量徽章
- 评论列表（显示用户名、角色、时间、内容）
- 评论编辑/删除操作
- 发表评论表单

## 数据库迁移
重新启动后端服务时会自动创建评论表：
```bash
cd backend && npm run dev
```

## 使用说明
1. 学生提交日报后，老师可以在日报详情页发表评论反馈
2. 学生可以查看老师的评论并回复
3. 有新评论时详情页会显示"有新评论"提示
4. 管理端列表显示每份日报的评论数量
