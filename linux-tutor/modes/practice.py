"""
练习模式 - 场景化命令练习
按分类组织的渐进式学习系统
"""
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt
from rich.table import Table

from simulator.sandbox import CommandSimulator
from ui.components import header, command_box, hint_box, result_box, clear_screen
from ui.styles import STYLES, ICONS, COLORS
from command_validator import (
    CommandValidator, parse_command,
    make_ls_validator, make_tar_validator,
    make_head_validator, make_tail_validator,
    make_grep_validator, make_ping_validator
)

console = Console()


class Task:
    """单个练习任务"""
    def __init__(self, prompt, check_func=None, validator=None, correct_patterns=None,
                 success_msg=None, hint=None, explanation_on_correct=None,
                 explanation_on_wrong=None, category="general"):
        """
        初始化任务

        :param prompt: 任务提示
        :param check_func: 旧的 lambda 检查函数（已弃用，保留兼容）
        :param validator: 新的 CommandValidator 验证器（推荐）
        :param correct_patterns: 正确答案模式列表
        :param success_msg: 成功消息
        :param hint: 提示
        :param explanation_on_correct: 答对解释
        :param explanation_on_wrong: 答错解释
        :param category: 分类
        """
        self.prompt = prompt
        self._check_func = check_func
        self._validator = validator
        self.correct_patterns = correct_patterns or []
        self.success_msg = success_msg or "正确！"
        self.hint = hint or "请输入正确的命令"
        self.explanation_on_correct = explanation_on_correct or ""
        self.explanation_on_wrong = explanation_on_wrong or ""
        self.category = category

    def check(self, cmd: str) -> bool:
        """验证命令是否正确"""
        # 优先使用新的验证器
        if self._validator:
            is_valid, _ = self._validator.validate(cmd)
            return is_valid
        # 兼容旧的 lambda 函数
        elif self._check_func:
            return self._check_func(cmd)
        return False


class Scenario:
    """练习场景"""
    def __init__(self, id, title, description, difficulty, category, tasks, setup=None):
        self.id = id
        self.title = title
        self.description = description
        self.difficulty = difficulty
        self.category = category
        self.tasks = tasks
        self.setup = setup or []


# ============ 文件管理类练习 ============
file_scenarios = [
    Scenario(
        id=1,
        title="目录探索基础",
        description="学习查看当前位置、列出文件、切换目录的基本操作",
        difficulty="简单",
        category="file",
        setup=[],
        tasks=[
            Task(
                prompt="查看当前所在的完整路径",
                validator=CommandValidator(expected_cmd="pwd"),
                correct_patterns=["pwd"],
                success_msg="✓ 正确！pwd 显示当前工作目录",
                hint="使用 pwd 命令",
                explanation_on_correct="pwd (print working directory) 显示当前所在目录的完整绝对路径，是定位自己的基础命令。",
                explanation_on_wrong="你需要使用 pwd 命令来查看当前路径。",
                category="file"
            ),
            Task(
                prompt="列出当前目录的所有文件和文件夹",
                validator=CommandValidator(expected_cmd="ls"),
                correct_patterns=["ls", "ls .", "ls ./"],
                success_msg="✓ 很好！ls 列出目录内容",
                hint="使用 ls 命令",
                explanation_on_correct="ls 是最基础的命令，用于列出目录中的文件和子目录。",
                explanation_on_wrong="使用 ls 命令可以列出当前目录的内容。",
                category="file"
            ),
            Task(
                prompt="以详细格式列出所有文件（包括隐藏文件）",
                validator=make_ls_validator(required_opts={"-l", "-a"}),
                correct_patterns=["ls -la", "ls -al", "ls -a -l", "ls -l -a"],
                success_msg="✓ 完美！ls -la 显示所有文件的详细信息",
                hint="使用 ls 的 -l（长格式）和 -a（所有文件）选项",
                explanation_on_correct="-l 选项使用长格式显示，包括权限、所有者、大小、修改时间；-a 选项显示所有文件包括以.开头的隐藏文件。",
                explanation_on_wrong="需要同时使用 -l（长格式）和 -a（所有文件）两个选项。顺序不重要。",
                category="file"
            ),
            Task(
                prompt="进入 Documents 目录",
                validator=CommandValidator(expected_cmd="cd", arg_contains=["Documents"]),
                correct_patterns=["cd Documents", "cd ./Documents"],
                success_msg="✓ 正确！你已进入 Documents 目录",
                hint="使用 cd 命令后跟目录名",
                explanation_on_correct="cd (change directory) 用于切换目录。Documents 是常见的用户文档目录。",
                explanation_on_wrong="使用 cd 命令后跟目录名可以进入该目录。",
                category="file"
            ),
            Task(
                prompt="返回上级目录",
                validator=CommandValidator(expected_cmd="cd", arg_patterns=[r"\.\.$"]),
                correct_patterns=["cd .."],
                success_msg="✓ 正确！cd .. 返回上级目录",
                hint="使用 cd ..（两个点表示上级目录）",
                explanation_on_correct=".. 是特殊目录名，表示父目录（上级目录）。cd .. 让你返回上一层。",
                explanation_on_wrong="使用 cd .. 返回上级目录。注意是两个点。",
                category="file"
            ),
        ]
    ),
    Scenario(
        id=2,
        title="创建目录和文件",
        description="学习创建目录结构和管理文件",
        difficulty="简单",
        category="file",
        setup=[],
        tasks=[
            Task(
                prompt="创建一个名为 projects 的目录",
                validator=CommandValidator(expected_cmd="mkdir", arg_contains=["projects"]),
                correct_patterns=["mkdir projects"],
                success_msg="✓ 目录创建成功！",
                hint="使用 mkdir 命令创建目录",
                explanation_on_correct="mkdir (make directory) 用于创建新目录。这是组织文件的基础操作。",
                explanation_on_wrong="使用 mkdir 后跟目录名来创建目录。例如：mkdir projects",
                category="file"
            ),
            Task(
                prompt="进入 projects 目录",
                validator=CommandValidator(expected_cmd="cd", arg_contains=["projects"]),
                correct_patterns=["cd projects"],
                success_msg="✓ 已进入项目目录",
                hint="使用 cd projects",
                explanation_on_correct="进入目录后才能在其中创建文件或子目录。",
                explanation_on_wrong="使用 cd 命令进入刚创建的 projects 目录。",
                category="file"
            ),
            Task(
                prompt="创建 src 和 docs 两个子目录",
                validator=CommandValidator(expected_cmd="mkdir", arg_count=2),
                correct_patterns=["mkdir src docs", "mkdir docs src"],
                success_msg="✓ 项目结构创建完成！",
                hint="mkdir 可以同时创建多个目录: mkdir src docs",
                explanation_on_correct="mkdir 可以一次性创建多个目录，用空格分隔目录名。",
                explanation_on_wrong="mkdir 可以同时创建多个目录，只需用空格分隔：mkdir src docs",
                category="file"
            ),
            Task(
                prompt="创建一个空的 README.txt 文件",
                validator=CommandValidator(expected_cmd="touch", arg_contains=["README.txt"]),
                correct_patterns=["touch README.txt"],
                success_msg="✓ 文件创建成功！",
                hint="使用 touch 命令创建空文件",
                explanation_on_correct="touch 命令用于创建空文件或更新文件的时间戳。",
                explanation_on_wrong="使用 touch 命令创建空文件，例如：touch README.txt",
                category="file"
            ),
        ]
    ),
    Scenario(
        id=3,
        title="文件操作进阶",
        description="复制、移动、重命名和删除文件",
        difficulty="中等",
        category="file",
        setup=["touch old.txt", "echo 'content' > data.txt"],
        tasks=[
            Task(
                prompt="将 old.txt 复制为 backup.txt",
                check_func=lambda cmd: cmd.strip() == "cp old.txt backup.txt",
                correct_patterns=["cp old.txt backup.txt"],
                success_msg="✓ 复制成功！",
                hint="使用 cp 命令: cp 源文件 目标文件",
                explanation_on_correct="cp (copy) 用于复制文件。原文件保留，创建一份副本。",
                explanation_on_wrong="cp 的语法是：cp 源文件 目标文件。例如：cp old.txt backup.txt",
                category="file"
            ),
            Task(
                prompt="将 backup.txt 重命名为 archive.txt",
                check_func=lambda cmd: cmd.strip() == "mv backup.txt archive.txt",
                correct_patterns=["mv backup.txt archive.txt"],
                success_msg="✓ 重命名成功！",
                hint="使用 mv 命令进行重命名",
                explanation_on_correct="mv (move) 可以在同一目录内重命名文件，也可以移动到不同目录。",
                explanation_on_wrong="mv 的语法是：mv 原文件名 新文件名。注意这是重命名，不是复制。",
                category="file"
            ),
            Task(
                prompt="将 archive.txt 移动到 /tmp 目录（假设有权限）",
                check_func=lambda cmd: cmd.strip() in ["mv archive.txt /tmp", "mv archive.txt /tmp/"],
                correct_patterns=["mv archive.txt /tmp", "mv archive.txt /tmp/"],
                success_msg="✓ 移动成功！",
                hint="mv 源文件 目标目录/",
                explanation_on_correct="mv 可以将文件移动到另一个目录，同时可以改名也可以不改名。",
                explanation_on_wrong="使用 mv 文件 目录/ 的格式移动文件。例如：mv archive.txt /tmp/",
                category="file"
            ),
            Task(
                prompt="删除 old.txt 文件",
                check_func=lambda cmd: cmd.strip() == "rm old.txt",
                correct_patterns=["rm old.txt"],
                success_msg="✓ 删除成功！",
                hint="使用 rm 命令删除文件",
                explanation_on_correct="rm (remove) 永久删除文件。删除后无法恢复，请谨慎使用！",
                explanation_on_wrong="使用 rm 文件名删除文件。注意：删除后无法恢复，确保输入正确的文件名。",
                category="file"
            ),
        ]
    ),
]

# ============ 文本处理类练习 ============
text_scenarios = [
    Scenario(
        id=4,
        title="查看文件内容",
        description="学习查看文件的多种方法",
        difficulty="简单",
        category="text",
        setup=["echo 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10\nLine 11\nLine 12' > sample.txt"],
        tasks=[
            Task(
                prompt="查看 sample.txt 的完整内容",
                validator=CommandValidator(expected_cmd="cat", arg_contains=["sample.txt"]),
                correct_patterns=["cat sample.txt"],
                success_msg="✓ 正确！cat 显示文件全部内容",
                hint="使用 cat 命令查看文件",
                explanation_on_correct="cat (concatenate) 将文件内容输出到屏幕，适合查看小文件。",
                explanation_on_wrong="使用 cat 文件名 查看文件内容。cat 是最基础的文件查看命令。",
                category="text"
            ),
            Task(
                prompt="查看 sample.txt 的前5行",
                validator=make_head_validator(lines=5, filename="sample.txt"),
                correct_patterns=["head -n 5 sample.txt", "head -n5 sample.txt"],
                success_msg="✓ 正确！head 显示文件开头",
                hint="使用 head -n 5 sample.txt",
                explanation_on_correct="head 默认显示前10行，-n 5 指定只显示前5行。",
                explanation_on_wrong="head -n 5 sample.txt 显示文件前5行。head 默认显示10行，-n 可以指定行数。",
                category="text"
            ),
            Task(
                prompt="查看 sample.txt 的最后3行",
                validator=make_tail_validator(lines=3, filename="sample.txt"),
                correct_patterns=["tail -n 3 sample.txt", "tail -n3 sample.txt"],
                success_msg="✓ 正确！tail 显示文件结尾",
                hint="使用 tail -n 3 sample.txt",
                explanation_on_correct="tail 显示文件末尾内容，常用于查看日志文件。",
                explanation_on_wrong="tail -n 3 sample.txt 显示文件最后3行。tail 默认显示最后10行。",
                category="text"
            ),
            Task(
                prompt="查看 sample.txt 并显示行号",
                check_func=lambda cmd: cmd.strip().startswith("cat") and "-n" in cmd and "sample.txt" in cmd,
                correct_patterns=["cat -n sample.txt"],
                success_msg="✓ 正确！cat -n 显示行号",
                hint="使用 cat -n sample.txt",
                explanation_on_correct="-n 选项让 cat 显示行号，方便定位内容。",
                explanation_on_wrong="cat -n sample.txt 显示文件内容并带行号。",
                category="text"
            ),
        ]
    ),
    Scenario(
        id=5,
        title="搜索文本内容",
        description="学习在文件中搜索特定文本",
        difficulty="中等",
        category="text",
        setup=["echo 'Hello World\nhello linux\nHELLO bash\nWelcome to Linux\nLinux is great' > greeting.txt"],
        tasks=[
            Task(
                prompt="在 greeting.txt 中搜索包含 'hello' 的行（忽略大小写）",
                check_func=lambda cmd: cmd.strip().startswith("grep") and "-i" in cmd and "hello" in cmd.lower() and "greeting.txt" in cmd,
                correct_patterns=["grep -i hello greeting.txt", "grep -i 'hello' greeting.txt"],
                success_msg="✓ 找到了匹配的内容！",
                hint="使用 grep -i 'hello' greeting.txt",
                explanation_on_correct="grep 用于搜索文本，-i 选项忽略大小写，可以匹配 Hello、hello、HELLO 等。",
                explanation_on_wrong="grep -i 'hello' greeting.txt 搜索不区分大小写的 hello。-i 是忽略大小写的关键选项。",
                category="text"
            ),
            Task(
                prompt="在 greeting.txt 中搜索 'hello' 并显示行号",
                check_func=lambda cmd: cmd.strip().startswith("grep") and "-n" in cmd and "greeting.txt" in cmd,
                correct_patterns=["grep -n hello greeting.txt", "grep -n 'hello' greeting.txt"],
                success_msg="✓ 正确！显示匹配行的行号",
                hint="使用 grep -n 'hello' greeting.txt",
                explanation_on_correct="-n 选项显示匹配行的行号，方便定位。",
                explanation_on_wrong="grep -n 可以显示匹配行的行号。可以和其他选项如 -i 组合使用：grep -in",
                category="text"
            ),
            Task(
                prompt="统计 greeting.txt 的总行数",
                check_func=lambda cmd: cmd.strip().startswith("wc") and "-l" in cmd and "greeting.txt" in cmd,
                correct_patterns=["wc -l greeting.txt"],
                success_msg="✓ 正确！统计了文件行数",
                hint="使用 wc -l greeting.txt",
                explanation_on_correct="wc (word count) -l 只统计行数。wc 默认统计行数、字数和字节数。",
                explanation_on_wrong="wc -l 文件名 统计文件行数。wc 还可以用 -w 统计字数，-c 统计字节数。",
                category="text"
            ),
        ]
    ),
    Scenario(
        id=6,
        title="文本排序与去重",
        description="学习对文本进行排序和去重",
        difficulty="中等",
        category="text",
        setup=["printf 'banana\napple\ncherry\napple\nbanana\ndate' > fruits.txt"],
        tasks=[
            Task(
                prompt="对 fruits.txt 按字母顺序排序",
                check_func=lambda cmd: cmd.strip() == "sort fruits.txt",
                correct_patterns=["sort fruits.txt"],
                success_msg="✓ 正确！已按字母顺序排序",
                hint="使用 sort fruits.txt",
                explanation_on_correct="sort 按字母顺序对每行进行排序输出。",
                explanation_on_wrong="sort 文件名 对文件内容按字母顺序排序。注意这是输出排序结果，不修改原文件。",
                category="text"
            ),
            Task(
                prompt="排序并去除重复行",
                check_func=lambda cmd: cmd.strip().startswith("sort") and "uniq" in cmd and "fruits.txt" in cmd,
                correct_patterns=["sort fruits.txt | uniq"],
                success_msg="✓ 正确！排序并去重",
                hint="先 sort 排序，再用 uniq 去重",
                explanation_on_correct="管道符 | 将 sort 的输出传给 uniq。uniq 只能去除相邻的重复行，所以需要先排序。",
                explanation_on_wrong="sort fruits.txt | uniq 先排序再去重。注意 uniq 只能去除相邻重复行，所以要先用 sort。",
                category="text"
            ),
            Task(
                prompt="统计每种水果出现的次数",
                check_func=lambda cmd: cmd.strip().startswith("sort") and "uniq" in cmd and "-c" in cmd and "fruits.txt" in cmd,
                correct_patterns=["sort fruits.txt | uniq -c"],
                success_msg="✓ 正确！统计了出现次数",
                hint="sort fruits.txt | uniq -c",
                explanation_on_correct="uniq -c 统计每行出现的次数，常用于词频统计。",
                explanation_on_wrong="sort fruits.txt | uniq -c 统计每种水果出现次数。-c 是 count 的意思。",
                category="text"
            ),
        ]
    ),
]

# ============ 系统监控类练习 ============
system_scenarios = [
    Scenario(
        id=7,
        title="查看系统状态",
        description="学习查看磁盘、内存和进程状态",
        difficulty="简单",
        category="system",
        setup=[],
        tasks=[
            Task(
                prompt="查看磁盘空间使用情况（人类可读格式）",
                check_func=lambda cmd: cmd.strip().startswith("df") and "-h" in cmd,
                correct_patterns=["df -h", "df -h .", "df -h /"],
                success_msg="✓ 正确！df -h 显示磁盘空间",
                hint="使用 df -h",
                explanation_on_correct="df (disk free) -h 以人类可读格式（K、M、G）显示磁盘空间。",
                explanation_on_wrong="df -h 显示磁盘空间使用情况。-h 让人类可读，会显示为 GB、MB 而不是字节数。",
                category="system"
            ),
            Task(
                prompt="查看当前目录的磁盘使用量",
                check_func=lambda cmd: cmd.strip().startswith("du") and "-sh" in cmd and ("." in cmd or len(cmd.strip()) == 6),
                correct_patterns=["du -sh", "du -sh .", "du -sh ./"],
                success_msg="✓ 正确！du 显示目录大小",
                hint="使用 du -sh 或 du -sh .",
                explanation_on_correct="du (disk usage) -s 只显示总和，-h 人类可读。. 表示当前目录。",
                explanation_on_wrong="du -sh 显示当前目录总大小。-s 是 summary，-h 是 human-readable。",
                category="system"
            ),
            Task(
                prompt="查看内存使用情况",
                check_func=lambda cmd: cmd.strip().startswith("free") and "-h" in cmd,
                correct_patterns=["free -h", "free -m", "free -g"],
                success_msg="✓ 正确！free 显示内存使用",
                hint="使用 free -h",
                explanation_on_correct="free 显示内存和交换分区使用情况，-h 让人类可读。",
                explanation_on_wrong="free -h 显示内存使用情况。注意 available 列才是实际可用内存。",
                category="system"
            ),
            Task(
                prompt="查看当前运行的进程（简单列表）",
                check_func=lambda cmd: cmd.strip() == "ps",
                correct_patterns=["ps"],
                success_msg="✓ 正确！ps 显示进程状态",
                hint="使用 ps 命令",
                explanation_on_correct="ps (process status) 显示当前 shell 的进程。ps aux 显示所有进程。",
                explanation_on_wrong="ps 显示当前 shell 的进程。想看所有进程用 ps aux，想看实时更新用 top。",
                category="system"
            ),
        ]
    ),
    Scenario(
        id=8,
        title="进程管理",
        description="学习查看和管理进程",
        difficulty="中等",
        category="system",
        setup=[],
        tasks=[
            Task(
                prompt="显示所有进程的详细信息",
                check_func=lambda cmd: cmd.strip().startswith("ps") and "aux" in cmd,
                correct_patterns=["ps aux", "ps -aux"],
                success_msg="✓ 正确！ps aux 显示所有进程",
                hint="使用 ps aux",
                explanation_on_correct="ps aux 显示所有用户的所有进程，是查看系统进程的常用命令。",
                explanation_on_wrong="ps aux 是查看所有进程的标准命令。aux 是选项组合，a 表示所有用户，u 表示用户格式，x 表示包括无终端进程。",
                category="system"
            ),
            Task(
                prompt="在进程列表中搜索 sshd 进程",
                check_func=lambda cmd: cmd.strip().startswith("ps") and "grep" in cmd and "sshd" in cmd,
                correct_patterns=["ps aux | grep sshd"],
                success_msg="✓ 正确！使用管道过滤进程",
                hint="ps aux | grep sshd",
                explanation_on_correct="管道符 | 将 ps aux 的输出传给 grep 过滤，只显示包含 sshd 的行。",
                explanation_on_wrong="ps aux | grep sshd 查找 sshd 进程。管道符 | 将左边命令的输出传给右边处理。",
                category="system"
            ),
            Task(
                prompt="查看系统运行时间",
                check_func=lambda cmd: cmd.strip() == "uptime",
                correct_patterns=["uptime"],
                success_msg="✓ 正确！uptime 显示运行时间",
                hint="使用 uptime 命令",
                explanation_on_correct="uptime 显示系统已运行时间、当前时间和系统负载。",
                explanation_on_wrong="uptime 显示系统已经运行了多久。负载值应该小于 CPU 核心数。",
                category="system"
            ),
        ]
    ),
]

# ============ 网络工具类练习 ============
network_scenarios = [
    Scenario(
        id=9,
        title="网络连通性测试",
        description="学习测试网络连接",
        difficulty="简单",
        category="network",
        setup=[],
        tasks=[
            Task(
                prompt="测试与百度网站的连通性（ping 4次后停止）",
                validator=make_ping_validator(count=4, host="baidu.com"),
                correct_patterns=["ping -c 4 baidu.com", "ping -c4 baidu.com"],
                success_msg="✓ 正确！ping 测试网络连通",
                hint="使用 ping -c 4 baidu.com",
                explanation_on_correct="ping 发送 ICMP 包测试连通性，-c 4 表示发送4次后停止。",
                explanation_on_wrong="ping -c 4 baidu.com 发送4个测试包。-c 是 count，如果不加会一直 ping。",
                category="network"
            ),
            Task(
                prompt="查看本机网络接口配置",
                check_func=lambda cmd: cmd.strip() in ["ip addr", "ip a", "ifconfig"],
                correct_patterns=["ip addr", "ip a", "ifconfig"],
                success_msg="✓ 正确！显示网络接口信息",
                hint="使用 ip addr 或 ifconfig",
                explanation_on_correct="ip addr 是现代 Linux 推荐的方式，显示所有网络接口的 IP 地址。",
                explanation_on_wrong="ip addr 显示网络接口和 IP 地址。ifconfig 是老式命令，新系统可能需要用 ip 命令。",
                category="network"
            ),
            Task(
                prompt="查看路由表",
                check_func=lambda cmd: cmd.strip() in ["ip route", "ip r", "route -n"],
                correct_patterns=["ip route", "ip r", "route -n"],
                success_msg="✓ 正确！显示路由表",
                hint="使用 ip route",
                explanation_on_correct="ip route 显示系统的路由表，包括默认网关。",
                explanation_on_wrong="ip route 显示路由表。default via 开头的是默认网关。",
                category="network"
            ),
        ]
    ),
    Scenario(
        id=10,
        title="网络下载",
        description="学习从网络下载文件",
        difficulty="中等",
        category="network",
        setup=[],
        tasks=[
            Task(
                prompt="使用 curl 获取网页内容（以 httpbin.org/get 为例）",
                check_func=lambda cmd: cmd.strip().startswith("curl") and "httpbin" in cmd,
                correct_patterns=["curl httpbin.org/get"],
                success_msg="✓ 正确！curl 获取网页内容",
                hint="使用 curl httpbin.org/get",
                explanation_on_correct="curl 是强大的 HTTP 客户端，可以下载文件、测试 API 等。",
                explanation_on_wrong="curl URL 获取网页内容。curl -O 可以保存为文件。",
                category="network"
            ),
            Task(
                prompt="查看 httpbin.org/get 的 HTTP 响应头信息（不下载内容）",
                check_func=lambda cmd: cmd.strip().startswith("curl") and "-I" in cmd,
                correct_patterns=["curl -I httpbin.org/get"],
                success_msg="✓ 正确！-I 只显示响应头",
                hint="使用 curl -I httpbin.org/get",
                explanation_on_correct="curl -I 发送 HEAD 请求，只获取响应头而不下载内容。",
                explanation_on_wrong="curl -I 只显示响应头信息，不下载页面内容。",
                category="network"
            ),
        ]
    ),
]

# ============ 权限管理类练习 ============
permission_scenarios = [
    Scenario(
        id=11,
        title="文件权限基础",
        description="学习查看和修改文件权限",
        difficulty="中等",
        category="permission",
        setup=["touch script.sh"],
        tasks=[
            Task(
                prompt="查看 script.sh 的详细权限信息",
                check_func=lambda cmd: cmd.strip().startswith("ls") and "-l" in cmd and "script.sh" in cmd,
                correct_patterns=["ls -l script.sh", "ls -la script.sh"],
                success_msg="✓ 正确！显示文件权限",
                hint="使用 ls -l script.sh",
                explanation_on_correct="ls -l 显示文件的权限、所有者、组、大小等信息。权限格式如 -rw-r--r--。",
                explanation_on_wrong="ls -l 文件名 显示文件详细信息，包括权限。权限格式：rwx 分别代表读、写、执行。",
                category="permission"
            ),
            Task(
                prompt="给 script.sh 添加执行权限（使用符号模式）",
                check_func=lambda cmd: cmd.strip().startswith("chmod") and "+x" in cmd and "script.sh" in cmd,
                correct_patterns=["chmod +x script.sh", "chmod u+x script.sh"],
                success_msg="✓ 正确！添加执行权限",
                hint="使用 chmod +x script.sh",
                explanation_on_correct="chmod +x 给所有用户添加执行权限。u+x 只给所有者添加。",
                explanation_on_wrong="chmod +x script.sh 给文件添加执行权限。x 代表 execute（执行）。",
                category="permission"
            ),
            Task(
                prompt="设置 script.sh 权限为所有者可读写执行，其他人只读（数字模式）",
                check_func=lambda cmd: cmd.strip().startswith("chmod") and "744" in cmd and "script.sh" in cmd,
                correct_patterns=["chmod 744 script.sh"],
                success_msg="✓ 正确！使用数字模式设置权限",
                hint="使用 chmod 744 script.sh",
                explanation_on_correct="数字模式：7=rwx(4+2+1), 4=r(4), 4=r(4)。744 = rwxr--r--。",
                explanation_on_wrong="chmod 744 script.sh 设置权限。数字含义：7=4+2+1(rwx)，4=4(r)，4=4(r)。",
                category="permission"
            ),
        ]
    ),
]

# ============ 压缩归档类练习 ============
compression_scenarios = [
    Scenario(
        id=12,
        title="压缩与解压",
        description="学习使用 tar 和 gzip 压缩文件",
        difficulty="中等",
        category="compression",
        setup=["mkdir archive_dir", "touch archive_dir/file1.txt", "touch archive_dir/file2.txt"],
        tasks=[
            Task(
                prompt="将 archive_dir 目录打包为 archive.tar（不压缩）",
                validator=make_tar_validator(required_opts={"-c", "-v", "-f"}, archive_ext=".tar"),
                correct_patterns=["tar -cvf archive.tar archive_dir", "tar -cvf archive.tar archive_dir/"],
                success_msg="✓ 正确！创建了 tar 归档",
                hint="使用 tar -cvf archive.tar archive_dir",
                explanation_on_correct="tar -c 创建归档，-v 显示过程，-f 指定文件名。",
                explanation_on_wrong="tar -cvf archive.tar archive_dir 打包目录。-c 创建，-v 详细，-f 指定文件。",
                category="compression"
            ),
            Task(
                prompt="将 archive_dir 目录打包并压缩为 archive.tar.gz",
                validator=make_tar_validator(required_opts={"-c", "-z", "-v", "-f"}, archive_ext=".tar.gz"),
                correct_patterns=["tar -czvf archive.tar.gz archive_dir", "tar -czvf archive.tar.gz archive_dir/"],
                success_msg="✓ 正确！创建了压缩归档",
                hint="使用 tar -czvf archive.tar.gz archive_dir",
                explanation_on_correct="-z 选项启用 gzip 压缩，生成的文件更小。",
                explanation_on_wrong="tar -czvf archive.tar.gz archive_dir 创建 gzip 压缩包。-z 表示用 gzip 压缩。",
                category="compression"
            ),
            Task(
                prompt="查看 archive.tar 的内容（不解压）",
                validator=make_tar_validator(required_opts={"-t", "-v", "-f"}, archive_ext=".tar"),
                correct_patterns=["tar -tvf archive.tar", "tar -tvf archive.tar ."],
                success_msg="✓ 正确！列出了归档内容",
                hint="使用 tar -tvf archive.tar",
                explanation_on_correct="tar -t 列出归档内容，-v 显示详细信息，不解压。",
                explanation_on_wrong="tar -tvf archive.tar 查看压缩包内容而不解压。",
                category="compression"
            ),
            Task(
                prompt="解压 archive.tar.gz 到当前目录",
                validator=make_tar_validator(required_opts={"-x", "-z", "-v", "-f"}, archive_ext=".tar.gz"),
                correct_patterns=["tar -xzvf archive.tar.gz", "tar -xzvf archive.tar.gz ."],
                success_msg="✓ 正确！解压完成",
                hint="使用 tar -xzvf archive.tar.gz",
                explanation_on_correct="tar -x 解压，-z 处理 gzip 压缩，-v 显示过程，-f 指定文件。",
                explanation_on_wrong="tar -xzvf archive.tar.gz 解压。-x 是 extract（解压），-z 处理 gzip。",
                category="compression"
            ),
        ]
    ),
]

# ============ 搜索查找类练习 ============
search_scenarios = [
    Scenario(
        id=13,
        title="文件搜索",
        description="学习查找文件和命令",
        difficulty="中等",
        category="search",
        setup=["touch findme.txt", "mkdir subdir", "touch subdir/another.txt"],
        tasks=[
            Task(
                prompt="在当前目录及子目录中查找所有 .txt 文件",
                check_func=lambda cmd: cmd.strip().startswith("find") and "-name" in cmd and "*.txt" in cmd,
                correct_patterns=["find . -name '*.txt'", "find . -name *.txt"],
                success_msg="✓ 正确！找到所有 txt 文件",
                hint="使用 find . -name '*.txt'",
                explanation_on_correct="find 从指定路径递归搜索。-name 按文件名匹配，通配符 * 匹配任意字符。",
                explanation_on_wrong="find . -name '*.txt' 搜索所有 txt 文件。. 表示当前目录，* 是通配符。",
                category="search"
            ),
            Task(
                prompt="查找当前目录下所有目录（不包括文件）",
                check_func=lambda cmd: cmd.strip().startswith("find") and "-type d" in cmd,
                correct_patterns=["find . -type d", "find -type d"],
                success_msg="✓ 正确！找到所有目录",
                hint="使用 find . -type d",
                explanation_on_correct="-type d 只匹配目录（directory），-type f 只匹配文件。",
                explanation_on_wrong="find . -type d 查找目录。-type f 是查找文件，-type d 是查找目录。",
                category="search"
            ),
            Task(
                prompt="查找 python 命令的位置",
                check_func=lambda cmd: cmd.strip().startswith("which") and "python" in cmd,
                correct_patterns=["which python", "which python3"],
                success_msg="✓ 正确！找到命令位置",
                hint="使用 which python",
                explanation_on_correct="which 在 PATH 环境变量中查找可执行文件的位置。",
                explanation_on_wrong="which 命令 查找命令的可执行文件路径。只在 PATH 中搜索。",
                category="search"
            ),
        ]
    ),
]

# ============ Shell脚本类练习 ============
shell_scenarios = [
    Scenario(
        id=14,
        title="变量基础",
        description="学习Shell变量的定义与使用",
        difficulty="简单",
        category="shell",
        setup=[],
        tasks=[
            Task(
                prompt="定义一个名为 name 的变量，值为 'Linux'",
                check_func=lambda cmd: cmd.strip() == "name='Linux'" or cmd.strip() == 'name="Linux"',
                correct_patterns=["name='Linux'", 'name="Linux"', "name=Linux"],
                success_msg="✓ 正确！变量定义成功",
                hint="使用 name='Linux' 定义变量",
                explanation_on_correct="Shell变量定义时等号两边不能有空格，值可以用单引号或双引号包围。",
                explanation_on_wrong="变量定义的格式是：变量名=值。注意等号两边不能有空格！",
                category="shell"
            ),
            Task(
                prompt="输出变量 name 的值",
                check_func=lambda cmd: cmd.strip() == "echo $name" or cmd.strip() == 'echo ${name}',
                correct_patterns=["echo $name", "echo ${name}"],
                success_msg="✓ 正确！成功输出变量值",
                hint="使用 $name 或 ${name} 访问变量",
                explanation_on_correct="$变量名 用于访问变量的值，${变量名} 可以更清晰地界定变量边界。",
                explanation_on_wrong="使用 $变量名 来引用变量的值，例如：echo $name",
                category="shell"
            ),
            Task(
                prompt="定义一个 readonly 变量 PI，值为 3.14",
                check_func=lambda cmd: cmd.strip().startswith("readonly") and "PI" in cmd and "3.14" in cmd,
                correct_patterns=["readonly PI=3.14", "readonly PI='3.14'", 'readonly PI="3.14"'],
                success_msg="✓ 正确！只读变量定义成功",
                hint="使用 readonly PI=3.14",
                explanation_on_correct="readonly 定义的变量不能被修改或删除，常用于定义常量。",
                explanation_on_wrong="readonly 变量名=值 定义只读变量，之后不能修改。",
                category="shell"
            ),
            Task(
                prompt="显示所有已定义的只读变量",
                check_func=lambda cmd: cmd.strip() == "readonly -p",
                correct_patterns=["readonly -p"],
                success_msg="✓ 正确！显示了所有只读变量",
                hint="使用 readonly -p",
                explanation_on_correct="readonly -p 列出当前 shell 中所有只读变量。",
                explanation_on_wrong="readonly -p 显示所有只读变量，-p 是 print 的意思。",
                category="shell"
            ),
        ]
    ),
    Scenario(
        id=15,
        title="特殊变量",
        description="学习Shell特殊变量的使用",
        difficulty="简单",
        category="shell",
        setup=[],
        tasks=[
            Task(
                prompt="显示当前脚本的名称（特殊变量）",
                check_func=lambda cmd: cmd.strip() == "echo $0",
                correct_patterns=["echo $0"],
                success_msg="✓ 正确！$0 表示脚本名",
                hint="使用 $0 获取脚本名",
                explanation_on_correct="$0 是一个特殊变量，代表当前脚本或命令的名称。",
                explanation_on_wrong="$0 表示脚本本身的名称，用 echo $0 可以显示。",
                category="shell"
            ),
            Task(
                prompt="显示第一个位置参数",
                check_func=lambda cmd: cmd.strip() == "echo $1",
                correct_patterns=["echo $1"],
                success_msg="✓ 正确！$1 是第一个参数",
                hint="使用 $1 获取第一个参数",
                explanation_on_correct="$1, $2, ... $9 分别代表第1到第9个位置参数，${10}及以上需要用花括号。",
                explanation_on_wrong="$1 代表传递给脚本的第一个参数，用 echo $1 显示。",
                category="shell"
            ),
            Task(
                prompt="显示传递给脚本的参数个数",
                check_func=lambda cmd: cmd.strip() == "echo $#",
                correct_patterns=["echo $#"],
                success_msg="✓ 正确！$# 表示参数个数",
                hint="使用 $# 获取参数总数",
                explanation_on_correct="$# 表示传递给脚本或函数的参数个数。",
                explanation_on_wrong="$# 是一个特殊变量，表示参数的数量，用 echo $# 显示。",
                category="shell"
            ),
            Task(
                prompt="显示上一条命令的退出状态码",
                check_func=lambda cmd: cmd.strip() == "echo $?",
                correct_patterns=["echo $?"],
                success_msg="✓ 正确！$? 是退出状态码",
                hint="使用 $? 获取退出状态码",
                explanation_on_correct="$? 保存上一条命令的退出状态码，0表示成功，非0表示失败。",
                explanation_on_wrong="$? 保存上一条命令的退出状态，0表示成功，用 echo $? 显示。",
                category="shell"
            ),
        ]
    ),
    Scenario(
        id=16,
        title="if条件判断基础",
        description="学习if语句的基本使用",
        difficulty="简单",
        category="shell",
        setup=[],
        tasks=[
            Task(
                prompt="编写if语句：如果变量a等于5，则输出'等于5'（使用 [ ] 格式）",
                check_func=lambda cmd: "if [ $a -eq 5 ]; then echo '等于5'; fi" in cmd.replace('  ', ' ').strip() or "if [ $a -eq 5 ]; then echo \"等于5\"; fi" in cmd.replace('  ', ' ').strip(),
                correct_patterns=["if [ $a -eq 5 ]; then echo '等于5'; fi"],
                success_msg="✓ 正确！if语句格式正确",
                hint="使用 if [ $a -eq 5 ]; then echo '等于5'; fi",
                explanation_on_correct="if 语句以 if 开头，以 fi 结束。方括号 [ ] 是 test 命令的简写。",
                explanation_on_wrong="if语句格式：if 条件; then 命令; fi。注意[ ] 前后要有空格！",
                category="shell"
            ),
            Task(
                prompt="编写if-else语句：如果文件file.txt存在，输出'存在'，否则输出'不存在'",
                check_func=lambda cmd: "if [ -f file.txt ]; then echo '存在'; else echo '不存在'; fi" in cmd.replace('  ', ' ').strip(),
                correct_patterns=["if [ -f file.txt ]; then echo '存在'; else echo '不存在'; fi"],
                success_msg="✓ 正确！文件测试正确",
                hint="使用 -f 测试文件是否存在",
                explanation_on_correct="-f 测试文件是否存在且是普通文件，-e 只测试是否存在。",
                explanation_on_wrong="-f 用于测试文件是否存在，格式：if [ -f 文件名 ]; then ... else ... fi",
                category="shell"
            ),
            Task(
                prompt="测试字符串变量name是否为空串",
                check_func=lambda cmd: "[ -z \"$name\" ]" in cmd or "[ -z $name ]" in cmd,
                correct_patterns=["[ -z \"$name\" ]", "if [ -z \"$name\" ]"],
                success_msg="✓ 正确！-z测试空字符串",
                hint="使用 -z 选项测试字符串长度是否为0",
                explanation_on_correct="-z 测试字符串长度是否为0（空串），-n 测试长度是否非0。",
                explanation_on_wrong="[ -z \"$name\" ] 测试name是否为空字符串。建议给变量加引号。",
                category="shell"
            ),
        ]
    ),
    Scenario(
        id=17,
        title="条件判断进阶",
        description="学习复杂条件判断",
        difficulty="中等",
        category="shell",
        setup=[],
        tasks=[
            Task(
                prompt="使用if-elif-else：如果a等于1输出'一'，等于2输出'二'，否则输出'其他'",
                check_func=lambda cmd: "if [ $a -eq 1 ]; then echo '一'; elif [ $a -eq 2 ]; then echo '二'; else echo '其他'; fi" in cmd.replace('  ', ' ').strip(),
                correct_patterns=["if [ $a -eq 1 ]; then echo '一'; elif [ $a -eq 2 ]; then echo '二'; else echo '其他'; fi"],
                success_msg="✓ 正确！elif使用正确",
                hint="使用 elif 添加额外条件分支",
                explanation_on_correct="elif (else if) 用于添加多个条件分支，可以有多个elif。",
                explanation_on_wrong="elif用于多分支判断，格式：if ... then ... elif ... then ... else ... fi",
                category="shell"
            ),
            Task(
                prompt="测试变量a是否大于10且小于100（使用逻辑与）",
                check_func=lambda cmd: ("[ $a -gt 10 -a $a -lt 100 ]" in cmd or "[ $a -gt 10 ] && [ $a -lt 100 ]" in cmd),
                correct_patterns=["[ $a -gt 10 -a $a -lt 100 ]", "[ $a -gt 10 ] && [ $a -lt 100 ]"],
                success_msg="✓ 正确！逻辑与测试正确",
                hint="使用 -a 或 && 进行逻辑与运算",
                explanation_on_correct="-a 在方括号内表示逻辑与，&& 在方括号之间也表示逻辑与。",
                explanation_on_wrong="-a 是逻辑与(and)，-o 是逻辑或(or)。也可以写成 [ ] && [ ]",
                category="shell"
            ),
            Task(
                prompt="测试变量a是否等于'start'或'begin'（使用逻辑或）",
                check_func=lambda cmd: ("[ \"$a\" = 'start' -o \"$a\" = 'begin' ]" in cmd or "[ \"$a\" = \"start\" -o \"$a\" = \"begin\" ]" in cmd or "[ \"$a\" = 'start' ] || [ \"$a\" = 'begin' ]" in cmd),
                correct_patterns=["[ \"$a\" = 'start' -o \"$a\" = 'begin' ]"],
                success_msg="✓ 正确！逻辑或测试正确",
                hint="使用 -o 或 || 进行逻辑或运算",
                explanation_on_correct="-o 在方括号内表示逻辑或，|| 在方括号之间也表示逻辑或。",
                explanation_on_wrong="-o 是逻辑或(or)，用于连接两个测试条件。",
                category="shell"
            ),
        ]
    ),
    Scenario(
        id=18,
        title="for循环",
        description="学习for循环的使用",
        difficulty="简单",
        category="shell",
        setup=[],
        tasks=[
            Task(
                prompt="使用for循环遍历1、2、3并输出每个数字",
                check_func=lambda cmd: "for i in 1 2 3; do echo $i; done" in cmd.replace('  ', ' ').strip(),
                correct_patterns=["for i in 1 2 3; do echo $i; done"],
                success_msg="✓ 正确！for循环格式正确",
                hint="格式：for 变量 in 列表; do 命令; done",
                explanation_on_correct="for循环遍历列表中的每个元素，in后面是要遍历的列表。",
                explanation_on_wrong="for循环格式：for 变量 in 列表; do 命令; done。注意用分号或换行分隔。",
                category="shell"
            ),
            Task(
                prompt="使用for循环输出当前目录下所有.txt文件的名称",
                check_func=lambda cmd: "for file in *.txt; do echo $file; done" in cmd.replace('  ', ' ').strip() or "for f in *.txt; do echo $f; done" in cmd.replace('  ', ' ').strip(),
                correct_patterns=["for file in *.txt; do echo $file; done"],
                success_msg="✓ 正确！通配符与for结合使用",
                hint="使用 *.txt 匹配所有txt文件",
                explanation_on_correct="通配符 * 匹配任意字符，*.txt 匹配所有以.txt结尾的文件。",
                explanation_on_wrong="for file in *.txt 可以遍历所有txt文件，* 是通配符。",
                category="shell"
            ),
            Task(
                prompt="使用大括号展开遍历1到5并输出",
                check_func=lambda cmd: "for i in {1..5}; do echo $i; done" in cmd.replace('  ', ' ').strip() or "for i in 1 2 3 4 5; do echo $i; done" in cmd.replace('  ', ' ').strip(),
                correct_patterns=["for i in {1..5}; do echo $i; done"],
                success_msg="✓ 正确！大括号展开使用正确",
                hint="使用 {1..5} 生成序列",
                explanation_on_correct="{1..5} 是大括号展开，会生成1到5的序列，是Shell的内置功能。",
                explanation_on_wrong="{1..5} 生成1到5的序列，是Shell的扩展语法。",
                category="shell"
            ),
            Task(
                prompt="使用for循环遍历所有命令行参数并输出",
                check_func=lambda cmd: "for arg in $@; do echo $arg; done" in cmd.replace('  ', ' ').strip() or "for arg in $*; do echo $arg; done" in cmd.replace('  ', ' ').strip() or "for arg; do echo $arg; done" in cmd.replace('  ', ' ').strip(),
                correct_patterns=["for arg in $@; do echo $arg; done"],
                success_msg="✓ 正确！$@表示所有参数",
                hint="使用 $@ 表示所有参数",
                explanation_on_correct="$@ 表示所有位置参数，可以遍历处理每个参数。",
                explanation_on_wrong="$@ 表示所有参数，for arg in $@ 可以遍历每个参数。",
                category="shell"
            ),
        ]
    ),
    Scenario(
        id=19,
        title="while和until循环",
        description="学习条件循环的使用",
        difficulty="中等",
        category="shell",
        setup=[],
        tasks=[
            Task(
                prompt="使用while循环：当i小于5时，输出i并递增i（假设i初始为0）",
                check_func=lambda cmd: "while [ $i -lt 5 ]; do echo $i; i=$((i+1)); done" in cmd.replace('  ', ' ').strip() or "while [ $i -lt 5 ]; do echo $i; i=$i+1; done" in cmd.replace('  ', ' ').strip(),
                correct_patterns=["while [ $i -lt 5 ]; do echo $i; i=$((i+1)); done"],
                success_msg="✓ 正确！while循环格式正确",
                hint="格式：while 条件; do 命令; done",
                explanation_on_correct="while循环在条件为真时重复执行，条件为假时退出。",
                explanation_on_wrong="while循环格式：while 条件; do 命令; done。注意需要修改循环变量避免死循环。",
                category="shell"
            ),
            Task(
                prompt="使用until循环：直到i大于等于10时停止，每次输出i并递增i",
                check_func=lambda cmd: "until [ $i -ge 10 ]; do echo $i; i=$((i+1)); done" in cmd.replace('  ', ' ').strip(),
                correct_patterns=["until [ $i -ge 10 ]; do echo $i; i=$((i+1)); done"],
                success_msg="✓ 正确！until循环格式正确",
                hint="until与while相反，条件为假时执行",
                explanation_on_correct="until循环在条件为假时执行，条件为真时停止，与while相反。",
                explanation_on_wrong="until循环格式：until 条件; do 命令; done。条件为假时执行循环。",
                category="shell"
            ),
            Task(
                prompt="使用while配合read命令逐行读取file.txt文件",
                check_func=lambda cmd: "while read line; do echo $line; done < file.txt" in cmd.replace('  ', ' ').strip(),
                correct_patterns=["while read line; do echo $line; done < file.txt"],
                success_msg="✓ 正确！while read是读取文件的标准方式",
                hint="使用 while read 变量; do ... done < 文件",
                explanation_on_correct="while read 配合输入重定向是逐行读取文件的标准方法。",
                explanation_on_wrong="while read line; do ... done < file.txt 逐行读取文件内容。",
                category="shell"
            ),
        ]
    ),
    Scenario(
        id=20,
        title="case语句",
        description="学习case多分支选择",
        difficulty="中等",
        category="shell",
        setup=[],
        tasks=[
            Task(
                prompt="使用case语句：如果变量action等于start输出'启动'，等于stop输出'停止'，其他情况输出'未知'",
                check_func=lambda cmd: "case $action in start) echo '启动';; stop) echo '停止';; *) echo '未知';; esac" in cmd.replace('  ', ' ').strip() or "case $action in\nstart) echo '启动';;\nstop) echo '停止';;\n*) echo '未知';;\nesac" in cmd.replace('  ', ' ').strip(),
                correct_patterns=["case $action in start) echo '启动';; stop) echo '停止';; *) echo '未知';; esac"],
                success_msg="✓ 正确！case语句格式正确",
                hint="格式：case 变量 in 模式) 命令;; esac",
                explanation_on_correct="case语句以 case 开头，esac 结束。每个模式以 ) 结束，代码块以 ;; 结束。",
                explanation_on_wrong="case格式：case 变量 in 模式) 命令;; 模式) 命令;; *) 默认;; esac",
                category="shell"
            ),
            Task(
                prompt="使用case语句匹配文件扩展名：.txt输出'文本'，.sh输出'脚本'，其他输出'其他'",
                check_func=lambda cmd: "case $file in *.txt) echo '文本';; *.sh) echo '脚本';; *) echo '其他';; esac" in cmd.replace('  ', ' ').strip(),
                correct_patterns=["case $file in *.txt) echo '文本';; *.sh) echo '脚本';; *) echo '其他';; esac"],
                success_msg="✓ 正确！通配符匹配正确",
                hint="使用 *.txt 这样的模式进行通配符匹配",
                explanation_on_correct="case语句支持通配符模式匹配，* 匹配任意字符。",
                explanation_on_wrong="case支持通配符，*.txt 匹配所有txt文件，*.sh 匹配所有sh文件。",
                category="shell"
            ),
            Task(
                prompt="使用case语句匹配大小写的yes：Y或y开头的字符串都输出'确认'",
                check_func=lambda cmd: "[Yy]*" in cmd or "[Yy]" in cmd,
                correct_patterns=["case $ans in [Yy]*) echo '确认';; esac", "case $ans in [Yy]) echo '确认';; esac"],
                success_msg="✓ 正确！字符范围匹配正确",
                hint="使用 [Yy] 匹配Y或y",
                explanation_on_correct="[Yy] 是字符类，匹配 Y 或 y 中的一个。",
                explanation_on_wrong="[Yy] 表示匹配Y或y，[Yy]* 匹配以Y或y开头的字符串。",
                category="shell"
            ),
        ]
    ),
]

# 合并所有场景
ALL_SCENARIOS = (
    file_scenarios +
    text_scenarios +
    system_scenarios +
    network_scenarios +
    permission_scenarios +
    compression_scenarios +
    search_scenarios +
    shell_scenarios
)


class PracticeMode:
    """练习模式主类"""

    def __init__(self):
        self.simulator = CommandSimulator()
        self.current_scenario = None
        self.current_task_idx = 0
        self.scenarios = ALL_SCENARIOS

    def run(self):
        """运行练习模式"""
        while True:
            if self.current_scenario is None:
                if not self._show_category_menu():
                    break
            else:
                if not self._run_scenario():
                    break

    def _show_category_menu(self):
        """显示分类选择菜单"""
        clear_screen()
        console.print(header("💪 命令练习模式"))
        console.print("\n[dim]选择练习分类：[/dim]\n")

        # 按分类统计场景
        from commands.categories import CATEGORIES

        table = Table(box=None, show_header=False)
        table.add_column("编号", style=f"bold {COLORS['primary']}", width=4)
        table.add_column("图标", width=4)
        table.add_column("分类", style=f"bold {COLORS['info']}")
        table.add_column("场景数", width=8)
        table.add_column("描述", style=COLORS["muted"])

        self.category_keys = list(CATEGORIES.keys())

        for idx, cat_key in enumerate(self.category_keys, 1):
            cat = CATEGORIES[cat_key]
            count = len([s for s in self.scenarios if s.category == cat_key])
            if count > 0:
                table.add_row(
                    str(idx),
                    cat["icon"],
                    cat["name"],
                    f"{count}个",
                    cat["description"]
                )

        # 全部场景选项
        table.add_row(
            "0",
            "📚",
            "全部场景",
            f"{len(self.scenarios)}个",
            "按顺序练习所有场景"
        )

        console.print(table)
        console.print(f"\n[dim]{ICONS['back']} b. 返回主菜单 | {ICONS['exit']} q. 退出[/dim]")

        choices = [str(i) for i in range(len(self.category_keys) + 1)] + ["b", "q"]
        choice = Prompt.ask("\n选择分类", choices=choices)

        if choice == "q":
            return False
        elif choice == "b":
            return False
        elif choice == "0":
            self.filtered_scenarios = self.scenarios
            return self._show_scenario_list("全部场景")
        else:
            cat_key = self.category_keys[int(choice) - 1]
            cat_name = CATEGORIES[cat_key]["name"]
            self.filtered_scenarios = [s for s in self.scenarios if s.category == cat_key]
            return self._show_scenario_list(cat_name)

    def _show_scenario_list(self, category_name):
        """显示场景列表"""
        clear_screen()
        console.print(header(f"💪 {category_name} - 选择场景"))
        console.print("\n[dim]选择一个场景开始练习：[/dim]\n")

        table = Table(box=None, show_header=False)
        table.add_column("编号", style=f"bold {COLORS['primary']}", width=4)
        table.add_column("场景", style=f"bold {COLORS['info']}")
        table.add_column("难度", width=8)
        table.add_column("任务数", width=6)
        table.add_column("描述", style=COLORS["muted"])

        for idx, scenario in enumerate(self.filtered_scenarios, 1):
            diff_color = {
                "简单": "green",
                "中等": "yellow",
                "困难": "red"
            }.get(scenario.difficulty, "white")

            table.add_row(
                str(idx),
                scenario.title,
                f"[{diff_color}]{scenario.difficulty}[/{diff_color}]",
                str(len(scenario.tasks)),
                scenario.description[:30] + "..." if len(scenario.description) > 30 else scenario.description
            )

        console.print(table)
        console.print(f"\n[dim]{ICONS['back']} b. 返回分类 | {ICONS['exit']} q. 退出[/dim]")

        choices = [str(i) for i in range(1, len(self.filtered_scenarios) + 1)] + ["b", "q"]
        choice = Prompt.ask("\n选择场景", choices=choices)

        if choice == "q":
            return False
        elif choice == "b":
            self.current_scenario = None
            return True
        else:
            self.current_scenario = self.filtered_scenarios[int(choice) - 1]
            self.current_task_idx = 0
            # 重置模拟器
            self.simulator = CommandSimulator()
            # 执行场景初始化
            for cmd in self.current_scenario.setup:
                self.simulator.execute(cmd)
            return True

    def _run_scenario(self):
        """运行当前场景"""
        scenario = self.current_scenario

        while self.current_task_idx < len(scenario.tasks):
            task = scenario.tasks[self.current_task_idx]

            clear_screen()

            # 显示场景信息
            title = f"{ICONS['rocket']} 场景 {scenario.id}: {scenario.title}"
            console.print(Panel(title, border_style=COLORS["primary"], padding=(1, 2)))
            console.print(f"[dim]{scenario.description}[/dim]\n")

            # 显示进度
            progress_text = f"任务进度: {self.current_task_idx + 1} / {len(scenario.tasks)}"
            console.print(f"[bold {COLORS['secondary']}]{progress_text}[/bold {COLORS['secondary']}]")

            # 显示当前任务
            console.print(Panel(
                f"[bold]{task.prompt}[/bold]",
                title="当前任务",
                border_style=COLORS["info"],
                padding=(1, 2)
            ))

            # 显示帮助提示
            console.print(f"[dim]输入 hint 获取提示 | exit 退出场景[/dim]")

            # 获取用户输入
            console.print("")
            user_cmd = Prompt.ask(f"[bold {COLORS['success']}]$[/bold {COLORS['success']}]")

            if user_cmd.strip().lower() == "exit":
                self.current_scenario = None
                return True
            elif user_cmd.strip().lower() == "hint":
                console.print(Panel(
                    f"💡 {task.hint}",
                    border_style=COLORS["warning"],
                    title="提示"
                ))
                Prompt.ask("按回车继续")
                continue

            # 执行命令
            success, output, error = self.simulator.execute(user_cmd)

            # 显示命令输出
            if output:
                if output == "__CLEAR__":
                    console.clear()
                else:
                    console.print(Panel(output, border_style=COLORS["border"], padding=(1, 2), title="输出"))

            if error:
                console.print(Panel(error, border_style=COLORS["error"], title="错误"))

            # 检查任务完成
            if task.check(user_cmd):
                # 答对 - 显示详细解释
                console.print(Panel(
                    f"[bold green]✓ {task.success_msg}[/bold green]\n\n"
                    f"[cyan]📖 知识点讲解：[/cyan]\n{task.explanation_on_correct}",
                    border_style="green",
                    padding=(1, 2)
                ))
                self.current_task_idx += 1

                if self.current_task_idx >= len(scenario.tasks):
                    console.print(f"\n[bold {COLORS['success']}]{ICONS['star']} 🎉 恭喜！你已完成这个场景的所有任务！[/bold {COLORS['success']}]")
                    Prompt.ask("按回车继续")
                    self.current_scenario = None
                    return True
                else:
                    Prompt.ask("任务完成！按回车继续下一个任务")
            else:
                # 答错 - 显示错误分析和正确答案
                if not success:
                    # 命令执行出错
                    console.print(Panel(
                        f"[bold red]✗ 命令执行出错[/bold red]\n\n"
                        f"[yellow]错误信息：[/yellow] {error}\n\n"
                        f"[cyan]💡 提示：[/cyan] {task.explanation_on_wrong}",
                        border_style="red",
                        padding=(1, 2)
                    ))
                else:
                    # 命令执行成功但不符合要求
                    console.print(Panel(
                        f"[bold yellow]⚠ 命令执行了，但没有完成当前任务[/bold yellow]\n\n"
                        f"[cyan]📖 提示：[/cyan] {task.explanation_on_wrong}\n\n"
                        f"[dim]正确答案示例：{', '.join(task.correct_patterns[:2])}[/dim]",
                        border_style="yellow",
                        padding=(1, 2)
                    ))
                Prompt.ask("按回车继续尝试")

        return True

# 兼容旧版本导入
PRACTICE_SCENARIOS = ALL_SCENARIOS
