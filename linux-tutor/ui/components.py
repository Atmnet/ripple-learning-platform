"""
通用UI组件
"""
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.console import Console
from rich.align import Align
from rich.box import ROUNDED, DOUBLE

from .styles import STYLES, ICONS, COLORS

console = Console()


def header(text: str) -> Panel:
    """创建标题面板"""
    return Panel(
        Align.center(Text(text, style=STYLES["title"], justify="center")),
        box=DOUBLE,
        border_style=COLORS["primary"]
    )


def menu_item(text: str, selected: bool = False, icon: str = "") -> Text:
    """创建菜单项"""
    prefix = f"{ICONS['menu']} " if selected else "  "
    style = STYLES["menu_selected"] if selected else STYLES["menu_normal"]
    content = f"{prefix}{icon} {text}" if icon else f"{prefix}{text}"
    return Text(content, style=style)


def command_box(cmd: str, desc: str = "") -> Panel:
    """创建命令展示框"""
    content = Text()
    content.append(f"$ {cmd}", style=STYLES["command"])
    if desc:
        content.append(f"\n{desc}", style=STYLES["description"])
    return Panel(content, border_style=COLORS["success"], padding=(1, 2))


def info_panel(title: str, content: str, style: str = "info") -> Panel:
    """创建信息面板"""
    border = COLORS.get(style, COLORS["info"])
    return Panel(
        Text(content, style=STYLES["description"]),
        title=f"[bold]{title}[/bold]",
        border_style=border,
        padding=(1, 2)
    )


def hint_box(hint: str) -> Panel:
    """创建提示框"""
    return Panel(
        Text(f"{ICONS['hint']} {hint}", style=STYLES["hint"]),
        border_style=COLORS["warning"],
        padding=(1, 2)
    )


def result_box(success: bool, message: str) -> Panel:
    """创建结果反馈框"""
    icon = ICONS["check"] if success else ICONS["cross"]
    color = COLORS["success"] if success else COLORS["error"]
    style = STYLES["success"] if success else STYLES["error"]
    return Panel(
        Text(f"{icon} {message}", style=style),
        border_style=color,
        padding=(1, 2)
    )


def create_table(title: str, columns: list) -> Table:
    """创建表格"""
    table = Table(
        title=f"[bold {COLORS['primary']}]{title}[/bold {COLORS['primary']}]",
        box=ROUNDED,
        border_style=COLORS["border"],
        header_style=f"bold {COLORS['secondary']}"
    )
    for col in columns:
        table.add_column(col["name"], style=col.get("style", ""), width=col.get("width"))
    return table


def progress_bar(current: int, total: int, width: int = 30) -> str:
    """创建进度条"""
    filled = int(width * current / total)
    bar = "█" * filled + "░" * (width - filled)
    return f"[{bar}] {current}/{total}"


def divider(text: str = "") -> Text:
    """创建分隔线"""
    if text:
        return Text(f"───── {text} ─────", style=COLORS["muted"])
    return Text("─" * 50, style=COLORS["muted"])


def clear_screen():
    """清屏"""
    console.clear()
