#!/usr/bin/env python3
"""
Linux Tutor - 功能演示脚本
自动展示各模式功能
"""
import sys
sys.path.insert(0, ".")

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.align import Align

from commands.data import COMMAND_DB, get_commands_by_category
from commands.categories import CATEGORIES
from simulator.sandbox import CommandSimulator
from ui.styles import COLORS, ICONS, STYLES

console = Console()

def demo_learn():
    """演示学习模式"""
    console.print("\n" + "="*60)
    console.print("[bold cyan]📚 学习模式演示[/bold cyan]")
    console.print("="*60)

    # 显示分类
    console.print("\n[bold]命令分类：[/bold]")
    table = Table(show_header=False, box=None)
    table.add_column("图标", width=4)
    table.add_column("分类", style="bold cyan")
    table.add_column("描述", style="dim")

    for key, cat in CATEGORIES.items():
        count = len(get_commands_by_category(key))
        table.add_row(cat["icon"], cat["name"], f"{cat['description']} ({count}个命令)")
    console.print(table)

    # 显示示例命令
    console.print("\n[bold]示例命令 - ls (列出目录内容)：[/bold]")
    cmd = COMMAND_DB["ls"]
    console.print(f"  描述: {cmd['desc']}")
    console.print(f"  语法: {cmd['syntax']}")
    console.print("  常用选项:")
    for opt in cmd["options"][:3]:
        console.print(f"    {opt['flag']:<8} - {opt['desc']}")
    console.print("  示例:")
    for ex in cmd["examples"][:2]:
        console.print(f"    $ {ex['cmd']:<12} # {ex['desc']}")

def demo_practice():
    """演示练习模式"""
    console.print("\n" + "="*60)
    console.print("[bold green]💪 练习模式演示[/bold green]")
    console.print("="*60)

    sim = CommandSimulator()

    # 显示初始状态
    console.print(f"\n[bold]初始目录:[/bold] {sim.fs.cwd}")

    # 执行一系列命令
    commands = [
        "pwd",
        "ls -la",
        "mkdir testdir",
        "cd testdir",
        "pwd",
        "touch file.txt",
        "ls",
        "cd ..",
        "ls",
    ]

    console.print("\n[bold]模拟执行命令序列：[/bold]")
    for cmd in commands:
        success, output, error = sim.execute(cmd)
        prompt = f"[bold green]$[/bold green] {cmd}"
        if success and output and output != "__CLEAR__":
            console.print(f"{prompt}")
            console.print(f"{output}")
        elif error:
            console.print(f"{prompt}")
            console.print(f"[red]{error}[/red]")
        else:
            console.print(f"{prompt}")

    console.print(f"\n[bold]当前目录:[/bold] {sim.fs.cwd}")

def demo_quiz():
    """演示测验模式"""
    console.print("\n" + "="*60)
    console.print("[bold yellow]🎯 测验模式演示[/bold yellow]")
    console.print("="*60)

    # 示例题目
    questions = [
        {
            "q": "哪个命令用于显示当前工作目录的完整路径？",
            "options": ["ls", "pwd", "cd", "path"],
            "answer": "pwd"
        },
        {
            "q": "如何创建一个名为 'test' 的新目录？",
            "options": ["new test", "create test", "mkdir test", "makedir test"],
            "answer": "mkdir test"
        },
    ]

    console.print("\n[bold]示例题目：[/bold]")
    for i, q in enumerate(questions, 1):
        console.print(f"\n[bold cyan]题目 {i}:[/bold cyan] {q['q']}")
        for j, opt in enumerate(q['options']):
            letter = chr(65 + j)
            marker = "[green]✓[/green]" if opt == q['answer'] else " "
            console.print(f"  {marker} {letter}. {opt}")

def show_stats():
    """显示统计信息"""
    console.print("\n" + "="*60)
    console.print("[bold magenta]📊 项目统计[/bold magenta]")
    console.print("="*60)

    # 命令统计
    table = Table(title="命令分类统计", border_style="cyan")
    table.add_column("分类", style="bold")
    table.add_column("数量", justify="center")

    total = 0
    for cat_key, cat in CATEGORIES.items():
        count = len(get_commands_by_category(cat_key))
        total += count
        table.add_row(f"{cat['icon']} {cat['name']}", str(count))

    table.add_row("总计", str(total), style="bold cyan")
    console.print(table)

    console.print(f"\n[dim]项目文件：[/dim]")
    console.print("  • main.py - 主程序入口")
    console.print("  • commands/data.py - 25+ 命令数据库")
    console.print("  • modes/learn.py - 学习模式")
    console.print("  • modes/practice.py - 练习模式 (6个场景)")
    console.print("  • modes/quiz.py - 测验模式 (16+题目)")
    console.print("  • simulator/sandbox.py - 虚拟文件系统")

def main():
    """主函数"""
    # 标题
    banner = """
    ██╗     ██╗███╗   ██╗██╗  ██╗██╗  ██╗   ██╗
    ██║     ██║████╗  ██║██║ ██╔╝╚██╗██╔╝   ██║
    ██║     ██║██╔██╗ ██║█████╔╝  ╚███╔╝    ██║
    ██║     ██║██║╚██╗██║██╔═██╗  ██╔██╗    ██║
    ███████╗██║██║ ╚████║██║  ██╗██╔╝ ██╗   ██║
    ╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝
    """
    console.print(Panel(
        Align.center(Text(banner + "\nLinux命令学习工具 v1.0\n", style="bold cyan")),
        border_style="cyan",
        padding=(1, 2)
    ))

    # 运行演示
    demo_learn()
    demo_practice()
    demo_quiz()
    show_stats()

    # 结束
    console.print("\n" + "="*60)
    console.print("[bold green]✓ 演示完成！[/bold green]")
    console.print("="*60)
    console.print("\n运行命令: python main.py")
    console.print("开始交互式学习！\n")

if __name__ == "__main__":
    main()
