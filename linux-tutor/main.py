"""
Linux命令学习工具 - 主程序
适合小白学习Linux命令的交互式工具
"""
import sys
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.align import Align
from rich.box import DOUBLE, ROUNDED

# 添加项目路径
sys.path.insert(0, "")

from modes.learn import LearnMode
from modes.practice import PracticeMode
from modes.quiz import QuizMode
from ui.styles import COLORS, ICONS, STYLES
from ui.components import clear_screen
from rich.prompt import Prompt

console = Console()


def print_banner():
    """打印程序横幅"""
    banner = """
    ██╗     ██╗███╗   ██╗██╗  ██╗██╗  ██╗   ██╗
    ██║     ██║████╗  ██║██║ ██╔╝╚██╗██╔╝   ██║
    ██║     ██║██╔██╗ ██║█████╔╝  ╚███╔╝    ██║
    ██║     ██║██║╚██╗██║██╔═██╗  ██╔██╗    ██║
    ███████╗██║██║ ╚████║██║  ██╗██╔╝ ██╗   ██║
    ╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝
    """
    subtitle = "Linux命令学习工具 v1.0"
    desc = "适合初学者的交互式Linux命令学习环境"

    content = Text()
    content.append(banner, style=f"bold {COLORS['primary']}")
    content.append(f"\n{subtitle}\n", style=f"bold {COLORS['secondary']}")
    content.append(desc, style=COLORS["muted"])

    panel = Panel(
        Align.center(content),
        box=DOUBLE,
        border_style=COLORS["primary"],
        padding=(1, 2)
    )
    console.print(panel)


def print_main_menu():
    """打印主菜单"""
    console.print("\n")

    menu_items = [
        ("1", f"{ICONS['learn']} 学习模式", "浏览命令分类，查看详细说明和示例"),
        ("2", f"{ICONS['practice']} 练习模式", "在模拟终端中完成场景化任务"),
        ("3", f"{ICONS['quiz']} 测验模式", "选择题和填空题检验学习成果"),
        ("4", f"{ICONS['exit']} 退出", "退出程序"),
    ]

    for key, title, desc in menu_items:
        panel = Panel(
            f"[bold {COLORS['success']}]{key}.[/bold {COLORS['success']}] {title}\n[dim]{desc}[/dim]",
            box=ROUNDED,
            border_style=COLORS["border"],
            padding=(1, 2),
            width=60
        )
        console.print(Align.center(panel))

    console.print("\n")


def show_welcome():
    """显示欢迎信息"""
    welcome_text = """
欢迎来到 Linux Tutor！这是一个专门为Linux初学者设计的交互式学习工具。

功能介绍：
  • 学习模式：按分类浏览常用命令，查看详细说明和使用示例
  • 练习模式：在安全的模拟环境中实操，完成各种场景任务
  • 测验模式：通过选择题和填空题检验你的学习成果

操作说明：
  • 使用数字键选择菜单选项
  • 按 b 返回上一级，按 q 退出当前模式
  • 在练习模式中输入 hint 获取提示
"""
    console.print(Panel(
        welcome_text,
        title=f"{ICONS['rocket']} 快速开始",
        border_style=COLORS["info"],
        padding=(1, 2)
    ))


def main():
    """主函数"""
    clear_screen()
    print_banner()
    show_welcome()

    learn_mode = LearnMode()
    practice_mode = PracticeMode()
    quiz_mode = QuizMode()

    while True:
        print_main_menu()

        choice = Prompt.ask(
            "请选择功能",
            choices=["1", "2", "3", "4"],
            default="1"
        )

        if choice == "1":
            learn_mode.run()
        elif choice == "2":
            practice_mode.run()
        elif choice == "3":
            quiz_mode.run()
        elif choice == "4":
            break

        clear_screen()
        print_banner()

    # 退出
    clear_screen()
    console.print(Panel(
        Align.center(Text(
            f"{ICONS['rocket']} 感谢使用 Linux Tutor！\n继续加油学习Linux！",
            style=f"bold {COLORS['success']}"
        )),
        box=DOUBLE,
        border_style=COLORS["success"],
        padding=(2, 4)
    ))


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print(f"\n\n{ICONS['exit']} 程序已中断，再见！")
        sys.exit(0)
    except Exception as e:
        console.print(f"\n[bold red]程序出错: {e}[/bold red]")
        sys.exit(1)
