# Linux Tutor - Linux命令学习工具

一个功能完善的Linux命令学习平台，支持Web界面和CLI终端界面，包含81个常用命令、13个练习场景、300道测验题目，帮助初学者快速掌握Linux基础命令。

## ✨ 界面风格

采用**飞书风格浅色主题**，清爽现代的科技蓝配色：
- 主色调：`#3370ff` (飞书蓝)
- 浅色背景：白色 + 灰白辅助
- 深色文字：高对比度易读设计
- 圆角卡片：现代感界面元素

## 🚀 快速开始

### 方式一：本地运行

```bash
# 克隆项目
cd linux-tutor

# 安装依赖
pip install -r requirements.txt

# 运行Web版
python app.py
# 访问 http://localhost:5000

# 或运行CLI版
python main.py
```

### 方式二：Docker运行

```bash
# 构建镜像
docker build -t linux-tutor .

# 运行容器
docker run -d -p 5000:5000 --name linux-tutor linux-tutor

# 访问 http://localhost:5000
```

### 方式三：Docker Compose

```bash
# 启动
docker-compose up -d

# 停止
docker-compose down
```

## 📁 项目结构

```
linux-tutor/
├── app.py                 # Flask Web应用入口
├── main.py                # CLI终端应用入口
├── Dockerfile             # Docker镜像定义
├── docker-compose.yml     # Docker Compose配置
├── requirements.txt       # Python依赖
├── CLAUDE.md              # 项目架构文档
├── commands/              # 命令数据层
│   ├── data.py           # 81个命令数据库
│   └── categories.py     # 8个分类定义
├── modes/                 # 功能模式
│   ├── learn.py          # 学习模式
│   ├── practice.py       # 练习模式(13场景/40+题目)
│   └── quiz.py           # 测验模式(300道题)
├── simulator/             # 命令模拟器
│   └── sandbox.py        # 虚拟文件系统
├── ui/                    # CLI界面组件
│   ├── components.py
│   └── styles.py
├── static/                # Web静态资源
│   ├── css/style.css
│   └── js/app.js
└── templates/             # HTML模板
    └── index.html
```

## ✨ 功能特性

### 📚 学习模式
- **81个Linux命令**：覆盖文件、文本、系统、网络、权限、压缩、搜索7大类
- **详细教程**：每个命令包含语法、选项、示例、使用场景、相关命令
- **智能搜索**：支持按名称和描述搜索
- **分类浏览**：8个分类，带图标和描述
- **速查表**：快速查看所有命令

### 💪 练习模式
- **13个练习场景**：按8个分类组织
- **40+练习题目**：从基础到进阶
- **虚拟终端**：安全的模拟Linux环境
- **即时反馈**：
  - ✅ 答对：显示详细知识点讲解
  - ❌ 答错：分析错误原因，给出正确答案和提示
- **分类练习**：可按分类选择特定场景

### 🎯 测验模式
- **300道题目**：
  - 选择题：200道（4选项）
  - 判断题：50道（正确/错误）
  - 填空题：50道
- **多种模式**：
  - 快速测验（随机20题）
  - 专项练习（按题型）
  - 完整测验（300题）
  - 错题复习
- **详细解析**：每道题都有知识点讲解

### 🖥️ 在线终端（Web版）
- 安全的虚拟Linux环境
- 支持15+常用命令
- 会话隔离，多用户并发

## 📊 数据规模

| 项目 | 数量 |
|------|------|
| Linux命令 | 81个 |
| 命令分类 | 8个 |
| 练习场景 | 13个 |
| 练习题目 | 40+道 |
| 测验题目 | 300道 |
| 模拟器命令 | 15+个 |

## 📖 命令分类

| 分类 | 图标 | 命令数量 |
|------|------|----------|
| 文件管理 | 📁 | 16个 |
| 文本处理 | 📝 | 15个 |
| 系统监控 | ⚙️ | 14个 |
| 网络工具 | 🌐 | 14个 |
| 权限管理 | 🔒 | 5个 |
| 软件包管理 | 📦 | 5个 |
| 压缩归档 | 🗜️ | 7个 |
| 搜索查找 | 🔍 | 7个 |

## 🔌 API接口（Web版）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/categories` | GET | 获取分类列表 |
| `/api/commands/<cat>` | GET | 获取分类命令 |
| `/api/command/<name>` | GET | 获取命令详情 |
| `/api/search?q=xxx` | GET | 搜索命令 |
| `/api/scenarios` | GET | 获取练习场景 |
| `/api/scenario/<id>` | GET | 获取场景详情 |
| `/api/quiz/questions` | GET | 获取测验题目 |
| `/api/quiz/answer` | POST | 提交答案 |
| `/api/terminal/init` | GET | 初始化终端会话 |
| `/api/terminal/exec` | POST | 执行终端命令 |

## 🖥️ CLI终端版功能

CLI版本使用Rich库提供美观的终端界面：

```bash
python main.py
```

### 主菜单选项
1. **📚 学习模式** - 浏览和学习81个Linux命令
2. **💪 练习模式** - 在虚拟终端中完成实操练习
3. **🎯 测验模式** - 300道题目检验学习成果
4. **🖥️ 虚拟终端** - 自由练习Linux命令
5. **📊 学习统计** - 查看学习进度和成绩

## 🎯 支持的命令（模拟器）

### 文件管理
`ls`, `cd`, `pwd`, `mkdir`, `rmdir`, `rm`, `cp`, `mv`, `touch`, `tree`, `ln`, `stat`, `file`, `dd`

### 文本处理
`cat`, `head`, `tail`, `less`, `more`, `grep`, `wc`, `sort`, `uniq`, `cut`, `awk`, `sed`, `tr`, `tee`, `xargs`

### 系统监控
`ps`, `top`, `htop`, `kill`, `pkill`, `pgrep`, `df`, `du`, `free`, `uptime`, `vmstat`, `iostat`, `lsof`, `dmesg`

### 网络工具
`ping`, `curl`, `wget`, `netstat`, `ss`, `traceroute`, `nslookup`, `dig`, `ssh`, `scp`, `ifconfig`, `ip`, `nc`, `telnet`

### 权限管理
`chmod`, `chown`, `chgrp`, `sudo`, `su`

### 压缩归档
`tar`, `gzip`, `gunzip`, `bzip2`, `zip`, `unzip`, `xz`

### 搜索查找
`find`, `locate`, `which`, `whereis`, `type`, `updatedb`, `history`

## 🐳 Docker说明

### 构建参数

```dockerfile
FROM python:3.12-slim
EXPOSE 5000
```

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `FLASK_ENV` | production | 运行环境 |
| `FLASK_DEBUG` | 0 | 调试模式 |

### 数据持久化

当前版本使用内存存储会话数据，重启后数据会丢失。

## 📝 技术栈

- **后端**: Python 3.12 + Flask
- **CLI界面**: Rich库（终端UI）
- **前端**: HTML5 + CSS3 + jQuery (飞书风格浅色主题)
- **终端模拟**: 虚拟文件系统（内存实现）
- **部署**: Docker + Docker Compose
- **UI设计**: 飞书风格现代浅色主题

## 🔒 安全性

- 所有命令在虚拟文件系统中执行
- 无实际系统操作
- 安全的练习环境，可放心尝试任何命令

## 🎓 适合人群

- Linux初学者
- 准备面试的求职者
- 需要复习Linux命令的开发者
- 运维人员技能提升

## 📝 使用建议

1. **新手路径**：学习模式 → 练习模式 → 测验模式
2. **复习路径**：测验模式（错题复习） → 练习模式（薄弱分类）
3. **速查路径**：学习模式（速查表） → 虚拟终端（实操验证）

## 📄 License

MIT License

## 🤝 贡献

欢迎提交Issue和PR！

## 📧 联系

如有问题或建议，欢迎反馈。

---

**提示**：本项目旨在帮助Linux初学者学习基础命令，所有操作在虚拟环境中执行，不会对真实系统造成影响。
