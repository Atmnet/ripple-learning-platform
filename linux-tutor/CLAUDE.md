# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## UI/UX Design Guidelines

### Visual Style
- **Theme**: 飞书风格浅色主题 (Feishu-inspired Light Theme)
- **Primary Color**: `#3370ff` (飞书蓝)
- **Background**: White `#ffffff` / Light gray `#f5f6f7`
- **Text**: Dark `#1f2329` / Secondary `#646a73`
- **Border**: Light gray `#dee0e3`

### Color Palette (CSS Variables)
```css
--primary: #3370ff;        /* 飞书蓝 */
--primary-light: #4080ff;  /* 亮蓝 */
--primary-dark: #245bdb;   /* 深蓝 */
--bg-darker: #ffffff;      /* 主背景 */
--bg-dark: #f5f6f7;        /* 次级背景 */
--bg-card: #ffffff;        /* 卡片背景 */
--text-primary: #1f2329;   /* 主文字 */
--text-secondary: #646a73; /* 次要文字 */
--border: #dee0e3;         /* 边框 */
```

### Design Principles
1. Light backgrounds with dark text for readability
2. Blue accents for interactive elements
3. Subtle borders and shadows
4. Modern card-based layout
5. Clean, minimalist aesthetic

## Project Overview

Linux Tutor is an interactive Linux command learning tool with both CLI (terminal UI using Rich) and Web (Flask) interfaces. It features a virtual filesystem simulator that provides a safe environment for beginners to practice Linux commands.

## Running the Application

### Web Version (Flask)
```bash
# Install dependencies
pip install flask rich

# Run development server
python app.py
# Access at http://localhost:5000
```

### CLI Version (Terminal UI)
```bash
# Run TUI version
python main.py
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t linux-tutor .
docker run -d -p 5000:5000 linux-tutor

# Or use Docker Compose
docker-compose up -d
```

## High-Level Architecture

### Dual Interface Design
The project maintains two separate entry points sharing the same core logic:
- `app.py` - Flask web server with REST API endpoints
- `main.py` - Terminal UI using Rich library

Both interfaces consume the same underlying modules:
- `commands/` - Command definitions and categorization
- `modes/` - Learn, Practice, Quiz logic
- `simulator/` - Virtual filesystem implementation

### Data Flow
1. **Command Data**: Static data in `commands/data.py` (81 Linux commands with descriptions, options, examples, usage scenarios)
2. **Categorization**: `commands/categories.py` defines 8 categories (file, text, system, network, permission, package, compression, search)
3. **Practice Scenarios**: `modes/practice.py` contains 13 progressive learning scenarios with 40+ tasks across 8 categories
4. **Quiz System**: `modes/quiz.py` has 300 questions (200 choice, 50 true/false, 50 fill-in-the-blank)

### Virtual Filesystem Simulator
The `simulator/sandbox.py` implements a complete in-memory filesystem:
- `VirtualFileSystem` - Manages file/directory structure in a Python dict
- `CommandSimulator` - Parses and executes simulated Linux commands
- `VirtualFile` - Represents files with metadata (permissions, timestamps, content)

Supported commands: ls, cd, pwd, mkdir, rmdir, rm, cp, mv, touch, tree, ln, stat, file, dd, cat, head, tail, less, more, grep, wc, sort, uniq, cut, awk, sed, tr, tee, xargs, ps, top, htop, kill, pkill, pgrep, df, du, free, uptime, vmstat, iostat, lsof, dmesg, ping, curl, wget, netstat, ss, traceroute, nslookup, dig, ssh, scp, ifconfig, ip, nc, telnet, chmod, chown, chgrp, sudo, su, tar, gzip, gunzip, bzip2, zip, unzip, xz, find, locate, which, whereis, type

Key feature: The simulator maintains per-session state via `user_sessions` dict in Flask, allowing multiple concurrent users.

### API Design (Flask)
REST endpoints in `app.py`:
- `/api/categories` - List command categories
- `/api/commands/<category>` - Commands in a category
- `/api/command/<name>` - Detailed command info
- `/api/search?q=keyword` - Search commands
- `/api/scenarios` - Practice scenarios list
- `/api/scenario/<id>` - Scenario details (tasks without validation functions)
- `/api/quiz/questions` - Random 10 quiz questions (no answers)
- `/api/quiz/answer` - POST answer, returns correctness
- `/api/terminal/init` - Create new simulator session
- `/api/terminal/exec` - Execute command in session

### Frontend (Web)
- Single-page jQuery application in `static/js/app.js`
- Tab-based navigation between Learn/Practice/Quiz/Terminal modes
- Terminal emulator uses AJAX to execute commands via API

## Important Implementation Notes

### Import Path Handling
`app.py` and `main.py` both use `sys.path.insert(0, ".")` to enable absolute imports from project root. Modules use absolute imports like `from commands.data import ...` rather than relative imports.

### JSON Serialization Limitation
The practice scenarios in `modes/practice.py` contain lambda functions for task validation. When exposed via API in `app.py`, these are stripped out - only `prompt`, `hint`, and `success_msg` are returned. The frontend currently handles validation client-side in `static/js/app.js`.

### Session Management
Flask stores `CommandSimulator` instances in `user_sessions` dict keyed by UUID. Sessions persist only in memory (lost on server restart). No database is used.

### Character Encoding
The CLI version uses Rich library for terminal rendering. On Windows, may require `PYTHONIOENCODING=utf-8` environment variable to display Unicode characters correctly.

## Adding New Content

### New Linux Commands
Edit `commands/data.py`:
- Add entry to `COMMAND_DB` dict following existing structure
- Use category keys from `commands/categories.py`
- Include name, desc, category, syntax, options list, examples list

### New Practice Scenarios
Edit `modes/practice.py`:
- Add to `PRACTICE_SCENARIOS` list
- Each scenario needs: id, title, description, difficulty, tasks array
- Each task needs: prompt, check (lambda), success_msg, hint

### New Quiz Questions
Edit `modes/quiz.py`:
- Add to `QUIZ_QUESTIONS` list
- Choice type: type, question, options (list), answer (index), explain
- Fill type: type, question, answer (string or list for multiple correct), explain

## File Structure Summary

```
linux-tutor/
├── app.py              # Flask web entry
├── main.py             # CLI TUI entry
├── commands/           # Command data layer
│   ├── data.py         # COMMAND_DB dict (81 commands)
│   └── categories.py   # CATEGORIES dict (8 categories)
├── modes/              # Application logic
│   ├── learn.py        # LearnMode class (TUI)
│   ├── practice.py     # PracticeMode class + PRACTICE_SCENARIOS (13 scenes)
│   └── quiz.py         # QuizMode class + QUIZ_QUESTIONS (300 questions)
├── simulator/          # Core simulation engine
│   └── sandbox.py      # VirtualFileSystem, CommandSimulator
├── ui/                 # TUI components (Rich-based)
│   ├── components.py   # Reusable UI widgets
│   └── styles.py       # Colors, icons, styles
├── static/             # Web assets
│   ├── css/style.css
│   └── js/app.js       # jQuery SPA
└── templates/
    └── index.html      # Main web page
```

## Dependencies

- `flask` - Web framework
- `rich` - Terminal UI rendering (CLI version only)
- `jquery` - Frontend (loaded via CDN)
- `font-awesome` - Icons (loaded via CDN)
