"""
命令模拟器 - 虚拟文件系统
提供安全的命令执行环境，模拟Linux命令行为
"""
import re
from datetime import datetime
from typing import Optional


class VirtualFile:
    """虚拟文件对象"""
    def __init__(self, name: str, is_dir: bool = False, size: int = 0, content: str = ""):
        self.name = name
        self.is_dir = is_dir
        self.size = size if not is_dir else 4096
        self.content = content
        self.created = datetime.now()
        self.modified = datetime.now()
        self.permissions = "drwxr-xr-x" if is_dir else "-rw-r--r--"
        self.owner = "user"
        self.group = "user"


class VirtualFileSystem:
    """虚拟文件系统"""
    def __init__(self):
        self.root = {
            "/": VirtualFile("/", is_dir=True),
            "/home": VirtualFile("home", is_dir=True),
            "/home/user": VirtualFile("user", is_dir=True),
            "/home/user/Documents": VirtualFile("Documents", is_dir=True),
            "/home/user/Downloads": VirtualFile("Downloads", is_dir=True),
            "/home/user/Desktop": VirtualFile("Desktop", is_dir=True),
            "/etc": VirtualFile("etc", is_dir=True),
            "/var": VirtualFile("var", is_dir=True),
            "/tmp": VirtualFile("tmp", is_dir=True),
            "/home/user/readme.txt": VirtualFile("readme.txt", content="欢迎使用Linux学习工具！"),
            "/home/user/Documents/note.txt": VirtualFile("note.txt", content="这是一个笔记文件。"),
        }
        self.cwd = "/home/user"  # 当前工作目录
        self.history = []  # 命令历史

    def get_absolute_path(self, path: str) -> str:
        """将相对路径转换为绝对路径"""
        if path.startswith("/"):
            return path
        if path == "~":
            return "/home/user"
        if path == "-" and self.history:
            return self.history[-1] if self.history else self.cwd
        if path.startswith("~/"):
            return "/home/user" + path[1:]

        # 处理相对路径
        parts = self.cwd.split("/") + path.split("/")
        result = []
        for part in parts:
            if part == "" or part == ".":
                continue
            elif part == "..":
                if result:
                    result.pop()
            else:
                result.append(part)
        return "/" + "/".join(result) if result else "/"

    def get_parent_dir(self, path: str) -> str:
        """获取父目录"""
        if path == "/":
            return "/"
        parent = "/".join(path.rstrip("/").split("/")[:-1])
        return parent if parent else "/"

    def exists(self, path: str) -> bool:
        """检查路径是否存在"""
        abs_path = self.get_absolute_path(path)
        return abs_path in self.root

    def is_dir(self, path: str) -> bool:
        """检查是否是目录"""
        abs_path = self.get_absolute_path(path)
        if abs_path in self.root:
            return self.root[abs_path].is_dir
        return False

    def list_dir(self, path: str = None) -> dict:
        """列出目录内容"""
        target = self.cwd if path is None else self.get_absolute_path(path)
        result = {}

        for abs_path, file_obj in self.root.items():
            parent = self.get_parent_dir(abs_path)
            if parent == target or (parent + "/") == target:
                if abs_path != target:
                    result[file_obj.name] = file_obj

        # 添加. 和 ..
        result["."] = self.root.get(target, VirtualFile(".", is_dir=True))
        result[".."] = VirtualFile("..", is_dir=True)

        return result

    def get_file(self, path: str) -> Optional[VirtualFile]:
        """获取文件对象"""
        abs_path = self.get_absolute_path(path)
        return self.root.get(abs_path)

    def create_file(self, path: str, content: str = "") -> bool:
        """创建文件"""
        abs_path = self.get_absolute_path(path)
        if abs_path in self.root:
            return False

        parent = self.get_parent_dir(abs_path)
        if parent not in self.root or not self.root[parent].is_dir:
            return False

        name = abs_path.split("/")[-1] if abs_path != "/" else "/"
        self.root[abs_path] = VirtualFile(name, content=content, size=len(content))
        return True

    def create_dir(self, path: str) -> bool:
        """创建目录"""
        abs_path = self.get_absolute_path(path)
        if abs_path in self.root:
            return False

        # 确保父目录存在
        parent = self.get_parent_dir(abs_path)
        if parent not in self.root or not self.root[parent].is_dir:
            return False

        name = abs_path.split("/")[-1] if abs_path != "/" else "/"
        self.root[abs_path] = VirtualFile(name, is_dir=True)
        return True

    def remove(self, path: str, recursive: bool = False) -> bool:
        """删除文件或目录"""
        abs_path = self.get_absolute_path(path)
        if abs_path not in self.root:
            return False

        file_obj = self.root[abs_path]
        if file_obj.is_dir and not recursive:
            # 检查是否为空目录
            for p in self.root:
                if p.startswith(abs_path + "/"):
                    return False

        # 递归删除
        to_remove = [abs_path]
        if recursive:
            for p in list(self.root.keys()):
                if p.startswith(abs_path + "/"):
                    to_remove.append(p)

        for p in to_remove:
            del self.root[p]

        return True

    def move(self, src: str, dst: str) -> bool:
        """移动文件"""
        src_abs = self.get_absolute_path(src)
        dst_abs = self.get_absolute_path(dst)

        if src_abs not in self.root:
            return False

        # 如果目标是目录，移动到目录内
        if dst_abs in self.root and self.root[dst_abs].is_dir:
            name = src_abs.split("/")[-1]
            dst_abs = dst_abs.rstrip("/") + "/" + name

        file_obj = self.root[src_abs]
        file_obj.name = dst_abs.split("/")[-1]
        self.root[dst_abs] = file_obj
        del self.root[src_abs]
        return True

    def copy(self, src: str, dst: str) -> bool:
        """复制文件"""
        src_abs = self.get_absolute_path(src)
        dst_abs = self.get_absolute_path(dst)

        if src_abs not in self.root:
            return False

        src_obj = self.root[src_abs]

        # 如果目标是目录，复制到目录内
        if dst_abs in self.root and self.root[dst_abs].is_dir:
            name = src_abs.split("/")[-1]
            dst_abs = dst_abs.rstrip("/") + "/" + name

        if src_obj.is_dir:
            # 递归复制目录
            self.root[dst_abs] = VirtualFile(dst_abs.split("/")[-1], is_dir=True)
            for p, f in list(self.root.items()):
                if p.startswith(src_abs + "/"):
                    rel = p[len(src_abs):]
                    new_path = dst_abs + rel
                    self.root[new_path] = VirtualFile(
                        new_path.split("/")[-1],
                        is_dir=f.is_dir,
                        content=f.content,
                        size=f.size
                    )
        else:
            self.root[dst_abs] = VirtualFile(
                dst_abs.split("/")[-1],
                content=src_obj.content,
                size=src_obj.size
            )
        return True

    def change_dir(self, path: str) -> bool:
        """切换目录"""
        abs_path = self.get_absolute_path(path)
        if abs_path in self.root and self.root[abs_path].is_dir:
            self.history.append(self.cwd)
            self.cwd = abs_path
            return True
        return False


class CommandSimulator:
    """命令模拟器"""
    def __init__(self):
        self.fs = VirtualFileSystem()
        self.commands = {
            "ls": self.cmd_ls,
            "cd": self.cmd_cd,
            "pwd": self.cmd_pwd,
            "mkdir": self.cmd_mkdir,
            "rm": self.cmd_rm,
            "cp": self.cmd_cp,
            "mv": self.cmd_mv,
            "touch": self.cmd_touch,
            "cat": self.cmd_cat,
            "head": self.cmd_head,
            "tail": self.cmd_tail,
            "echo": self.cmd_echo,
            "clear": self.cmd_clear,
            "help": self.cmd_help,
            "whoami": self.cmd_whoami,
            "date": self.cmd_date,
        }

    def execute(self, command_line: str) -> tuple:
        """
        执行命令
        返回: (success: bool, output: str, error: str)
        """
        command_line = command_line.strip()
        if not command_line:
            return True, "", ""

        # 解析命令
        parts = self._parse_command(command_line)
        if not parts:
            return True, "", ""

        cmd = parts[0]
        args = parts[1:]

        # 处理管道
        if "|" in command_line:
            return self._handle_pipe(command_line)

        if cmd in self.commands:
            try:
                return self.commands[cmd](args)
            except Exception as e:
                return False, "", f"{cmd}: 执行错误: {str(e)}"
        else:
            return False, "", f"{cmd}: 命令未找到"

    def _parse_command(self, line: str) -> list:
        """简单命令解析"""
        parts = []
        current = ""
        in_quotes = False
        for char in line:
            if char == '"':
                in_quotes = not in_quotes
            elif char == ' ' and not in_quotes:
                if current:
                    parts.append(current)
                    current = ""
            else:
                current += char
        if current:
            parts.append(current)
        return parts

    def _handle_pipe(self, command_line: str) -> tuple:
        """处理管道命令"""
        commands = command_line.split("|")
        if len(commands) < 2:
            return False, "", "管道格式错误"

        # 执行第一个命令
        first_cmd = commands[0].strip()
        success, output, error = self.execute(first_cmd)

        if not success:
            return success, output, error

        # 简化处理：只支持 grep
        second = commands[1].strip()
        if second.startswith("grep "):
            pattern = second[5:].strip().strip('"\'')
            lines = output.split('\n')
            filtered = [l for l in lines if pattern in l]
            return True, '\n'.join(filtered), ""
        elif second.startswith("wc "):
            if "-l" in second:
                lines = output.strip().split('\n')
                return True, str(len(lines)), ""
            return True, str(len(output)), ""

        return True, output, ""

    def cmd_ls(self, args: list) -> tuple:
        """ls命令"""
        path = self.fs.cwd
        show_all = False
        long_format = False
        human_readable = False

        for arg in args:
            if arg.startswith("-"):
                if "a" in arg:
                    show_all = True
                if "l" in arg:
                    long_format = True
                if "h" in arg:
                    human_readable = True
            else:
                path = arg

        try:
            items = self.fs.list_dir(path)
        except:
            return False, "", f"ls: 无法访问'{path}': 没有该文件或目录"

        if not items:
            return True, "", ""

        # 排序：目录在前，然后按名称
        sorted_items = sorted(items.items(), key=lambda x: (not x[1].is_dir, x[0]))

        if not show_all:
            sorted_items = [(n, f) for n, f in sorted_items if not n.startswith(".")]

        if long_format:
            lines = []
            for name, file_obj in sorted_items:
                size = file_obj.size
                if human_readable:
                    size = self._human_readable_size(size)
                else:
                    size = str(size)
                line = f"{file_obj.permissions} 1 {file_obj.owner} {file_obj.group} {size:>8} {file_obj.modified.strftime('%m月 %d %H:%M')} {name}"
                lines.append(line)
            return True, '\n'.join(lines), ""
        else:
            names = [name + "/" if file_obj.is_dir else name for name, file_obj in sorted_items]
            return True, '  '.join(names), ""

    def cmd_cd(self, args: list) -> tuple:
        """cd命令"""
        path = args[0] if args else "~"
        if self.fs.change_dir(path):
            return True, "", ""
        return False, "", f"cd: 无法进入目录'{path}': 没有该文件或目录"

    def cmd_pwd(self, args: list) -> tuple:
        """pwd命令"""
        return True, self.fs.cwd, ""

    def cmd_mkdir(self, args: list) -> tuple:
        """mkdir命令"""
        if not args:
            return False, "", "mkdir: 缺少操作数"

        recursive = False
        paths = []

        for arg in args:
            if arg == "-p":
                recursive = True
            elif not arg.startswith("-"):
                paths.append(arg)

        for path in paths:
            abs_path = self.fs.get_absolute_path(path)
            if recursive:
                # 递归创建父目录
                parts = abs_path.strip("/").split("/")
                current = "/"
                for part in parts:
                    current = current.rstrip("/") + "/" + part
                    if current not in self.fs.root:
                        self.fs.create_dir(current)
            else:
                if not self.fs.create_dir(path):
                    return False, "", f"mkdir: 无法创建目录'{path}': 文件已存在"
        return True, "", ""

    def cmd_rm(self, args: list) -> tuple:
        """rm命令"""
        if not args:
            return False, "", "rm: 缺少操作数"

        recursive = False
        force = False
        paths = []

        for arg in args:
            if arg == "-r" or arg == "-R":
                recursive = True
            elif arg == "-f":
                force = True
            elif not arg.startswith("-"):
                paths.append(arg)

        for path in paths:
            if not self.fs.remove(path, recursive):
                if not force:
                    return False, "", f"rm: 无法删除'{path}': 没有该文件或目录"
        return True, "", ""

    def cmd_cp(self, args: list) -> tuple:
        """cp命令"""
        if len(args) < 2:
            return False, "", "cp: 缺少目标文件"

        recursive = False
        paths = []

        for arg in args:
            if arg == "-r" or arg == "-R":
                recursive = True
            elif not arg.startswith("-"):
                paths.append(arg)

        if len(paths) < 2:
            return False, "", "cp: 缺少目标文件"

        src = paths[0]
        dst = paths[1]

        if not self.fs.copy(src, dst):
            return False, "", f"cp: 无法复制'{src}'"
        return True, "", ""

    def cmd_mv(self, args: list) -> tuple:
        """mv命令"""
        if len(args) < 2:
            return False, "", "mv: 缺少目标文件"

        paths = [a for a in args if not a.startswith("-")]
        if len(paths) < 2:
            return False, "", "mv: 缺少目标文件"

        src = paths[0]
        dst = paths[1]

        if not self.fs.move(src, dst):
            return False, "", f"mv: 无法移动'{src}'"
        return True, "", ""

    def cmd_touch(self, args: list) -> tuple:
        """touch命令"""
        if not args:
            return False, "", "touch: 缺少文件参数"

        for path in args:
            if not path.startswith("-"):
                if not self.fs.exists(path):
                    self.fs.create_file(path)
        return True, "", ""

    def cmd_cat(self, args: list) -> tuple:
        """cat命令"""
        if not args:
            return True, "", ""

        contents = []
        for path in args:
            if not path.startswith("-"):
                file_obj = self.fs.get_file(path)
                if file_obj is None:
                    return False, "", f"cat: {path}: 没有该文件或目录"
                if file_obj.is_dir:
                    return False, "", f"cat: {path}: 是一个目录"
                contents.append(file_obj.content)

        return True, '\n'.join(contents), ""

    def cmd_head(self, args: list) -> tuple:
        """head命令"""
        lines = 10
        path = None

        for arg in args:
            if arg.startswith("-n"):
                lines = int(arg[2:]) if len(arg) > 2 else 10
            elif not arg.startswith("-"):
                path = arg

        if not path:
            return False, "", "head: 缺少文件参数"

        file_obj = self.fs.get_file(path)
        if file_obj is None:
            return False, "", f"head: 无法打开'{path}': 没有该文件或目录"

        content_lines = file_obj.content.split('\n')
        return True, '\n'.join(content_lines[:lines]), ""

    def cmd_tail(self, args: list) -> tuple:
        """tail命令"""
        lines = 10
        path = None

        for arg in args:
            if arg.startswith("-n"):
                lines = int(arg[2:]) if len(arg) > 2 else 10
            elif not arg.startswith("-"):
                path = arg

        if not path:
            return False, "", "tail: 缺少文件参数"

        file_obj = self.fs.get_file(path)
        if file_obj is None:
            return False, "", f"tail: 无法打开'{path}': 没有该文件或目录"

        content_lines = file_obj.content.split('\n')
        return True, '\n'.join(content_lines[-lines:]), ""

    def cmd_echo(self, args: list) -> tuple:
        """echo命令"""
        return True, ' '.join(args), ""

    def cmd_clear(self, args: list) -> tuple:
        """clear命令"""
        return True, "__CLEAR__", ""

    def cmd_help(self, args: list) -> tuple:
        """help命令"""
        help_text = """可用的模拟命令:
  ls      - 列出目录内容
  cd      - 切换目录
  pwd     - 显示当前路径
  mkdir   - 创建目录
  rm      - 删除文件/目录
  cp      - 复制文件/目录
  mv      - 移动/重命名文件
  touch   - 创建空文件
  cat     - 查看文件内容
  head    - 查看文件开头
  tail    - 查看文件结尾
  echo    - 输出文本
  clear   - 清屏
  help    - 显示帮助
  whoami  - 显示当前用户
  date    - 显示日期时间
"""
        return True, help_text, ""

    def cmd_whoami(self, args: list) -> tuple:
        """whoami命令"""
        return True, "user", ""

    def cmd_date(self, args: list) -> tuple:
        """date命令"""
        return True, datetime.now().strftime("%a %b %d %H:%M:%S %Z %Y"), ""

    def _human_readable_size(self, size: int) -> str:
        """转换字节为人类可读格式"""
        for unit in ['B', 'K', 'M', 'G', 'T']:
            if size < 1024:
                return f"{size}{unit}"
            size /= 1024
        return f"{size}P"


# 全局模拟器实例
simulator = CommandSimulator()
