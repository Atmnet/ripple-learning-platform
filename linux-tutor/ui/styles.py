"""
UI样式定义 - 飞书风格浅色主题
"""

# 主题颜色 - 飞书蓝
COLORS = {
    "primary": "blue",             # 主色：飞书蓝
    "secondary": "cyan",           # 辅助：青色
    "success": "green",            # 成功：绿色
    "warning": "yellow",           # 警告：黄色
    "error": "red",                # 错误：红色
    "info": "bright_blue",         # 信息：亮蓝
    "text": "white",               # 文字：白色
    "muted": "dim blue",           # 暗淡：淡蓝
    "border": "blue",              # 边框：蓝色
    "header": "bright_blue",       # 标题：亮蓝
    "highlight": "cyan"            # 高亮：青色
}

# 样式预设
STYLES = {
    "title": f"bold {COLORS['header']}",
    "subtitle": f"{COLORS['secondary']}",
    "command": f"bold {COLORS['success']}",
    "code": f"{COLORS['primary']}",
    "hint": f"italic {COLORS['warning']}",
    "error": f"bold {COLORS['error']}",
    "success": f"bold {COLORS['success']}",
    "prompt": f"bold {COLORS['primary']}",
    "menu_selected": f"bold {COLORS['highlight']}",
    "menu_normal": f"{COLORS['text']}",
    "category": f"bold {COLORS['info']}",
    "description": f"{COLORS['muted']}"
}

# 表情符号
ICONS = {
    "menu": "▶",
    "back": "◀",
    "check": "✓",
    "cross": "✗",
    "hint": "💡",
    "tip": "📌",
    "learn": "📚",
    "practice": "💪",
    "quiz": "🎯",
    "exit": "👋",
    "folder": "📁",
    "file": "📄",
    "star": "⭐",
    "fire": "🔥",
    "rocket": "🚀"
}

# 边框样式
BORDERS = {
    "default": "blue",
    "success": "green",
    "error": "red",
    "warning": "yellow",
    "info": "bright_blue"
}
