"""
学习模式 - 命令浏览和查询
"""
from rich.console import Console
from rich.panel import Panel
from rich.layout import Layout
from rich.text import Text
from rich.table import Table
from rich.prompt import Prompt

from commands.data import COMMAND_DB, get_commands_by_category, search_commands
from commands.categories import CATEGORIES
from ui.components import header, menu_item, create_table, divider, clear_screen
from ui.styles import STYLES, ICONS, COLORS

console = Console()


class LearnMode:
    """学习模式主类"""

    def __init__(self):
        self.current_category = None
        self.selected_command = None

    def run(self):
        """运行学习模式"""
        while True:
            clear_screen()
            console.print(header("📚 Linux命令学习模式"))

            if self.selected_command:
                self._show_command_detail()
                if not self._confirm_continue():
                    self.selected_command = None
                continue

            if self.current_category:
                self._show_category_commands()
            else:
                self._show_category_menu()

            choice = Prompt.ask("\n选择操作", choices=["1", "2", "3", "4", "b", "q"], default="1")

            if choice == "q":
                break
            elif choice == "b":
                if self.current_category:
                    self.current_category = None
                else:
                    break
            elif choice == "1":
                self._select_category()
            elif choice == "2":
                self._search_command()
            elif choice == "3":
                self._show_all_commands()
            elif choice == "4":
                self._show_cheatsheet()

    def _show_category_menu(self):
        """显示分类菜单"""
        console.print("\n[bold]选择学习分类：[/bold]\n")

        table = Table(box=None, show_header=False)
        table.add_column("编号", style=f"bold {COLORS['primary']}", width=4)
        table.add_column("图标", width=4)
        table.add_column("分类", style=f"bold {COLORS['info']}")
        table.add_column("描述", style=COLORS["muted"])

        for idx, (key, cat) in enumerate(CATEGORIES.items(), 1):
            cmd_count = len(get_commands_by_category(key))
            table.add_row(
                str(idx),
                cat["icon"],
                cat["name"],
                f"{cat['description']} ({cmd_count}个命令)"
            )

        console.print(table)

        console.print(f"\n[dim]{ICONS['menu']} 1. 选择分类[/dim]")
        console.print(f"[dim]{ICONS['menu']} 2. 搜索命令[/dim]")
        console.print(f"[dim]{ICONS['menu']} 3. 查看所有命令[/dim]")
        console.print(f"[dim]{ICONS['menu']} 4. 速查表[/dim]")
        console.print(f"[dim]{ICONS['back']} b. 返回主菜单[/dim]")
        console.print(f"[dim]{ICONS['exit']} q. 退出[/dim]")

    def _select_category(self):
        """选择分类"""
        cats = list(CATEGORIES.keys())
        try:
            choice = int(Prompt.ask("输入分类编号", default="1"))
            if 1 <= choice <= len(cats):
                self.current_category = cats[choice - 1]
        except ValueError:
            pass

    def _show_category_commands(self):
        """显示分类下的命令"""
        cat = CATEGORIES[self.current_category]
        commands = get_commands_by_category(self.current_category)

        console.print(f"\n[bold {COLORS['primary']}]{cat['icon']} {cat['name']}[/bold {COLORS['primary']}]")
        console.print(f"[dim]{cat['description']}[/dim]\n")

        if not commands:
            console.print("[dim]暂无命令数据[/dim]")
            return

        # 显示命令列表
        table = Table(box=None, show_header=False)
        table.add_column("编号", style=f"bold {COLORS['secondary']}", width=4)
        table.add_column("命令", style=f"bold {COLORS['success']}", width=12)
        table.add_column("描述")

        self.command_list = list(commands.keys())
        for idx, (name, cmd) in enumerate(commands.items(), 1):
            table.add_row(str(idx), name, cmd["desc"])

        console.print(table)

        # 选择命令查看详情
        try:
            choice = Prompt.ask("\n输入命令编号查看详情 (或b返回)", default="b")
            if choice == "b":
                self.current_category = None
            else:
                idx = int(choice) - 1
                if 0 <= idx < len(self.command_list):
                    self.selected_command = self.command_list[idx]
        except ValueError:
            if choice == "b":
                self.current_category = None

    def _show_command_detail(self):
        """显示命令详情"""
        cmd = COMMAND_DB.get(self.selected_command)
        if not cmd:
            return

        cat = CATEGORIES.get(cmd["category"], {})

        # 标题面板
        title = f"[bold]{cmd['name']}[/bold] - {cmd['desc']}"
        console.print(Panel(title, border_style=COLORS["primary"], padding=(1, 2)))

        # 详细描述
        if cmd.get("long_desc"):
            console.print(f"\n[dim]{cmd['long_desc']}[/dim]")

        # 基本信息
        console.print(f"\n[bold {COLORS['secondary']}]分类:[/bold {COLORS['secondary']}] {cat.get('icon', '')} {cat.get('name', '未知')}")
        console.print(f"[bold {COLORS['secondary']}]语法:[/bold {COLORS['secondary']}] {cmd['syntax']}")

        # 使用场景
        if cmd.get("usage_scenarios"):
            console.print(f"\n[bold {COLORS['info']}]适用场景:[/bold {COLORS['info']}]")
            for scenario in cmd["usage_scenarios"]:
                console.print(f"  • {scenario}")

        # 选项表格
        if cmd.get("options"):
            console.print(f"\n[bold {COLORS['info']}]选项:[/bold {COLORS['info']}]")
            opt_table = Table(box=None, show_header=False, padding=(0, 2))
            opt_table.add_column("选项", style=f"bold {COLORS['success']}", width=12)
            opt_table.add_column("说明")
            for opt in cmd["options"]:
                opt_table.add_row(opt["flag"], opt["desc"])
            console.print(opt_table)

        # 示例
        if cmd.get("examples"):
            console.print(f"\n[bold {COLORS['info']}]示例:[/bold {COLORS['info']}]")
            for ex in cmd["examples"]:
                console.print(Panel(
                    f"[bold green]{ex['cmd']}[/bold green]\n[dim]{ex['desc']}[/dim]",
                    border_style=COLORS["success"],
                    padding=(1, 2)
                ))

        # 相关命令
        if cmd.get("related"):
            related_str = ", ".join(cmd["related"])
            console.print(f"\n[bold {COLORS['warning']}]🔗 相关命令:[/bold {COLORS['warning']}] {related_str}")

        # 提示
        if cmd.get("tips"):
            console.print(f"\n[bold {COLORS['warning']}]💡 提示:[/bold {COLORS['warning']}] {cmd['tips']}")

        # 备注
        if cmd.get("note"):
            console.print(f"\n[bold {COLORS['warning']}]📝 备注:[/bold {COLORS['warning']}] {cmd['note']}")

    def _confirm_continue(self):
        """确认继续"""
        console.print("")
        choice = Prompt.ask("按回车继续, b返回分类, q退出", default="", choices=["", "b", "q"])
        if choice == "q":
            self.selected_command = None
            self.current_category = None
            return False
        elif choice == "b":
            self.selected_command = None
            return False
        return True

    def _search_command(self):
        """搜索命令"""
        keyword = Prompt.ask("\n输入搜索关键词")
        if not keyword:
            return

        results = search_commands(keyword)

        clear_screen()
        console.print(header(f"🔍 搜索 '{keyword}' 的结果"))

        if not results:
            console.print(f"\n[dim]没有找到包含 '{keyword}' 的命令[/dim]")
            Prompt.ask("按回车继续")
            return

        table = Table(box=None, show_header=False)
        table.add_column("编号", style=f"bold {COLORS['secondary']}", width=4)
        table.add_column("命令", style=f"bold {COLORS['success']}", width=12)
        table.add_column("描述")

        self.search_results = list(results.keys())
        for idx, (name, cmd) in enumerate(results.items(), 1):
            table.add_row(str(idx), name, cmd["desc"])

        console.print(table)

        try:
            choice = Prompt.ask("\n输入编号查看详情 (或b返回)", default="b")
            if choice != "b":
                idx = int(choice) - 1
                if 0 <= idx < len(self.search_results):
                    self.selected_command = self.search_results[idx]
                    self.current_category = results[self.selected_command]["category"]
        except ValueError:
            pass

    def _show_all_commands(self):
        """显示所有命令"""
        clear_screen()
        console.print(header("📋 所有命令列表"))

        table = create_table("命令速查", [
            {"name": "命令", "style": f"bold {COLORS['success']}", "width": 12},
            {"name": "描述", "width": 40},
            {"name": "分类", "width": 12}
        ])

        for name, cmd in sorted(COMMAND_DB.items()):
            cat_name = CATEGORIES.get(cmd["category"], {}).get("name", "未知")
            table.add_row(name, cmd["desc"], cat_name)

        console.print(table)
        Prompt.ask("\n按回车返回")

    def _show_cheatsheet(self):
        """显示速查表"""
        clear_screen()
        console.print(header("📌 Linux命令速查表"))

        for cat_key, cat in CATEGORIES.items():
            commands = get_commands_by_category(cat_key)
            if commands:
                console.print(f"\n[bold {COLORS['primary']}]{cat['icon']} {cat['name']}[/bold {COLORS['primary']}]")

                table = Table(box=None, show_header=False, padding=(0, 2))
                table.add_column("命令", style=f"bold {COLORS['success']}", width=12)
                table.add_column("描述")

                for name, cmd in sorted(commands.items()):
                    table.add_row(name, cmd["desc"])

                console.print(table)

        console.print(f"\n[dim]提示：使用 '命令名 --help' 可查看详细用法[/dim]")
        Prompt.ask("\n按回车返回")
