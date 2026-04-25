"""
Linux命令数据库
包含常用命令的详细说明、选项和示例
"""

COMMAND_DB = {
    # ============ 文件管理命令 (16个) ============
    "ls": {
        "name": "ls",
        "desc": "列出目录内容",
        "long_desc": "ls (list) 是 Linux 中最常用的命令之一，用于显示指定目录中的文件和子目录列表。",
        "category": "file",
        "syntax": "ls [选项] [文件/目录]",
        "options": [
            {"flag": "-l", "desc": "以长格式显示详细信息（权限、所有者、大小、修改时间）"},
            {"flag": "-a", "desc": "显示所有文件，包括隐藏文件（以.开头）"},
            {"flag": "-h", "desc": "以人类可读的方式显示文件大小（K, M, G）"},
            {"flag": "-t", "desc": "按修改时间排序（最新的在前）"},
            {"flag": "-r", "desc": "反向排序"},
            {"flag": "-S", "desc": "按文件大小排序（最大的在前）"},
            {"flag": "-d", "desc": "显示目录本身而非其内容"},
            {"flag": "-1", "desc": "每行只显示一个文件"},
            {"flag": "--color", "desc": "用颜色区分文件类型"},
        ],
        "examples": [
            {"cmd": "ls", "desc": "列出当前目录的文件"},
            {"cmd": "ls -la", "desc": "详细列出所有文件（包括隐藏文件）"},
            {"cmd": "ls -lh", "desc": "详细列出，文件大小人类可读"},
            {"cmd": "ls -lt", "desc": "按时间排序详细列出"},
            {"cmd": "ls -lhS", "desc": "按大小排序显示详细信息"},
            {"cmd": "ls -R /home", "desc": "递归显示 /home 目录下所有文件"},
        ],
        "usage_scenarios": [
            "查看当前目录有哪些文件",
            "查看文件详细信息（权限、大小、时间）",
            "查找最近修改的文件",
            "查看隐藏配置文件"
        ],
        "related": ["cd", "pwd", "tree"],
        "tips": "ls -la 是查看目录内容最常用的组合命令"
    },
    "cd": {
        "name": "cd",
        "desc": "切换当前工作目录",
        "long_desc": "cd (change directory) 用于切换当前工作目录，是最基础也最常用的命令之一。",
        "category": "file",
        "syntax": "cd [目录]",
        "options": [],
        "examples": [
            {"cmd": "cd /home", "desc": "切换到 /home 目录"},
            {"cmd": "cd ~", "desc": "切换到用户主目录"},
            {"cmd": "cd ..", "desc": "切换到上级目录"},
            {"cmd": "cd -", "desc": "切换到上次所在的目录"},
            {"cmd": "cd ~user", "desc": "切换到指定用户的主目录"},
            {"cmd": "cd /var/log", "desc": "切换到系统日志目录"},
        ],
        "usage_scenarios": [
            "进入项目目录",
            "返回上级目录",
            "快速回到主目录",
            "在目录间快速切换"
        ],
        "related": ["pwd", "ls"],
        "tips": "cd - 可以快速在两个目录间来回切换"
    },
    "pwd": {
        "name": "pwd",
        "desc": "显示当前工作目录的完整路径",
        "long_desc": "pwd (print working directory) 显示当前所在位置的完整绝对路径。",
        "category": "file",
        "syntax": "pwd",
        "options": [
            {"flag": "-L", "desc": "显示逻辑路径（包含符号链接）"},
            {"flag": "-P", "desc": "显示物理路径（解析所有符号链接）"},
        ],
        "examples": [
            {"cmd": "pwd", "desc": "显示当前目录路径"},
            {"cmd": "pwd -P", "desc": "显示物理路径（去除符号链接）"},
        ],
        "usage_scenarios": [
            "确认当前所在位置",
            "复制当前路径用于其他操作",
            "在脚本中获取工作目录"
        ],
        "related": ["cd", "ls"],
        "tips": "pwd 的输出可以用 $(pwd) 嵌入到其他命令中"
    },
    "mkdir": {
        "name": "mkdir",
        "desc": "创建目录",
        "long_desc": "mkdir (make directory) 用于创建新的目录。可以一次创建多个目录，也可以递归创建多级目录。",
        "category": "file",
        "syntax": "mkdir [选项] 目录名",
        "options": [
            {"flag": "-p", "desc": "递归创建目录（包括父目录），目录已存在时不报错"},
            {"flag": "-v", "desc": "显示创建过程"},
            {"flag": "-m", "desc": "设置目录权限"},
        ],
        "examples": [
            {"cmd": "mkdir test", "desc": "创建 test 目录"},
            {"cmd": "mkdir -p a/b/c", "desc": "递归创建多级目录"},
            {"cmd": "mkdir -p project/{src,docs,tests}", "desc": "同时创建多个子目录"},
            {"cmd": "mkdir -m 755 public", "desc": "创建目录并设置权限"},
        ],
        "usage_scenarios": [
            "创建项目目录结构",
            "一次性创建多级嵌套目录",
            "批量创建多个目录"
        ],
        "related": ["rmdir", "rm", "cd"],
        "tips": "mkdir -p 是创建多级目录的必备选项"
    },
    "rmdir": {
        "name": "rmdir",
        "desc": "删除空目录",
        "long_desc": "rmdir (remove directory) 用于删除空目录。如果目录不为空，需要先清空目录内容。",
        "category": "file",
        "syntax": "rmdir [选项] 目录名",
        "options": [
            {"flag": "-p", "desc": "递归删除父目录（父目录为空时）"},
            {"flag": "-v", "desc": "显示删除过程"},
        ],
        "examples": [
            {"cmd": "rmdir empty_dir", "desc": "删除空目录"},
            {"cmd": "rmdir -p a/b/c", "desc": "删除 c 及其空父目录"},
        ],
        "usage_scenarios": [
            "删除空的临时目录",
            "清理空的项目目录"
        ],
        "related": ["rm", "mkdir"],
        "tips": "通常使用 rm -r 替代，可以删除非空目录"
    },
    "rm": {
        "name": "rm",
        "desc": "删除文件或目录",
        "long_desc": "rm (remove) 用于删除文件或目录。**注意：删除操作不可恢复，使用时务必小心！**",
        "category": "file",
        "syntax": "rm [选项] 文件/目录",
        "options": [
            {"flag": "-r", "desc": "递归删除（用于删除目录及其内容）"},
            {"flag": "-f", "desc": "强制删除，不提示确认，忽略不存在的文件"},
            {"flag": "-i", "desc": "删除前提示确认"},
            {"flag": "-v", "desc": "显示删除过程"},
        ],
        "examples": [
            {"cmd": "rm file.txt", "desc": "删除 file.txt 文件"},
            {"cmd": "rm -r dir", "desc": "删除 dir 目录及其内容"},
            {"cmd": "rm -rf dir", "desc": "强制递归删除（慎用！）"},
            {"cmd": "rm -i *.log", "desc": "删除日志文件前逐个确认"},
            {"cmd": "rm -rf /", "desc": "删除系统所有文件（**危险！**）"},
        ],
        "usage_scenarios": [
            "删除不需要的文件",
            "清理临时目录",
            "批量删除符合条件的文件"
        ],
        "related": ["rmdir", "mv"],
        "tips": "rm -rf / 会删除系统所有文件，是危险操作！"
    },
    "cp": {
        "name": "cp",
        "desc": "复制文件或目录",
        "long_desc": "cp (copy) 用于复制文件或目录。可以复制单个文件、多个文件，或递归复制整个目录。",
        "category": "file",
        "syntax": "cp [选项] 源文件 目标文件",
        "options": [
            {"flag": "-r", "desc": "递归复制（用于复制目录）"},
            {"flag": "-R", "desc": "递归复制（同上，保留特殊文件）"},
            {"flag": "-i", "desc": "覆盖前提示确认"},
            {"flag": "-v", "desc": "显示复制过程"},
            {"flag": "-p", "desc": "保留文件属性（时间戳、权限等）"},
            {"flag": "-f", "desc": "强制覆盖"},
            {"flag": "-a", "desc": "归档模式，相当于 -dR --preserve=all"},
        ],
        "examples": [
            {"cmd": "cp file1.txt file2.txt", "desc": "复制文件"},
            {"cmd": "cp -r dir1 dir2", "desc": "复制目录"},
            {"cmd": "cp *.txt /backup/", "desc": "复制所有 txt 文件到备份目录"},
            {"cmd": "cp -a /src /dst", "desc": "完整复制目录，保留所有属性"},
            {"cmd": "cp -i file.txt /etc/", "desc": "复制时如存在则提示确认"},
        ],
        "usage_scenarios": [
            "备份重要文件",
            "复制配置文件到指定位置",
            "批量复制文件"
        ],
        "related": ["mv", "scp", "rsync"],
        "tips": "cp -a 是备份目录的最佳选择，可保留所有属性"
    },
    "mv": {
        "name": "mv",
        "desc": "移动或重命名文件/目录",
        "long_desc": "mv (move) 用于移动文件或目录到新的位置，也可用于重命名文件/目录。",
        "category": "file",
        "syntax": "mv [选项] 源文件 目标文件",
        "options": [
            {"flag": "-i", "desc": "覆盖前提示确认"},
            {"flag": "-v", "desc": "显示移动过程"},
            {"flag": "-f", "desc": "强制覆盖，不提示"},
            {"flag": "-n", "desc": "不覆盖已存在的文件"},
        ],
        "examples": [
            {"cmd": "mv old.txt new.txt", "desc": "重命名文件"},
            {"cmd": "mv file.txt /home/", "desc": "移动文件到 /home 目录"},
            {"cmd": "mv *.log /backup/", "desc": "移动所有日志文件"},
            {"cmd": "mv -i file.txt /etc/", "desc": "移动时如存在则提示"},
        ],
        "usage_scenarios": [
            "重命名文件或目录",
            "移动文件到其他位置",
            "整理文件位置"
        ],
        "related": ["cp", "rm"],
        "tips": "mv 在同一目录下就是重命名，跨目录就是移动"
    },
    "touch": {
        "name": "touch",
        "desc": "创建空文件或更新文件时间戳",
        "long_desc": "touch 用于创建新的空文件，或更新已有文件的访问时间和修改时间。",
        "category": "file",
        "syntax": "touch [选项] 文件名",
        "options": [
            {"flag": "-a", "desc": "只更新访问时间"},
            {"flag": "-m", "desc": "只修改修改时间"},
            {"flag": "-t", "desc": "使用指定时间戳"},
            {"flag": "-c", "desc": "文件不存在时不创建"},
        ],
        "examples": [
            {"cmd": "touch newfile.txt", "desc": "创建空文件"},
            {"cmd": "touch file.txt", "desc": "更新 file.txt 的时间戳"},
            {"cmd": "touch {1..10}.txt", "desc": "批量创建 10 个空文件"},
            {"cmd": "touch -t 202401011200 file.txt", "desc": "设置特定时间戳"},
        ],
        "usage_scenarios": [
            "快速创建空文件",
            "更新文件时间戳",
            "批量创建测试文件"
        ],
        "related": ["mkdir", "cat", "stat"],
        "tips": "touch {1..10}.txt 可以批量创建多个空文件"
    },

    # ============ 新增文件管理命令 ============
    "tree": {
        "name": "tree",
        "desc": "以树状图显示目录结构",
        "long_desc": "tree 以层级树状结构显示目录和文件，直观展示项目结构。",
        "category": "file",
        "syntax": "tree [选项] [目录]",
        "options": [
            {"flag": "-L N", "desc": "限制显示的层级深度为 N"},
            {"flag": "-d", "desc": "只显示目录，不显示文件"},
            {"flag": "-a", "desc": "显示所有文件（包括隐藏文件）"},
            {"flag": "-I pattern", "desc": "忽略匹配的文件"},
            {"flag": "--du", "desc": "显示目录大小"},
        ],
        "examples": [
            {"cmd": "tree", "desc": "显示当前目录的树状结构"},
            {"cmd": "tree -L 2", "desc": "只显示两层深度"},
            {"cmd": "tree -d", "desc": "只显示目录结构"},
            {"cmd": "tree -I 'node_modules|__pycache__'", "desc": "忽略指定目录"},
        ],
        "usage_scenarios": [
            "查看项目目录结构",
            "生成文档中的目录树",
            "快速了解目录层级"
        ],
        "related": ["ls", "find"],
        "tips": "tree -L 2 是查看项目结构的最佳选择"
    },
    "ln": {
        "name": "ln",
        "desc": "创建文件链接",
        "long_desc": "ln (link) 用于创建硬链接或符号链接（软链接）。符号链接类似于 Windows 的快捷方式。",
        "category": "file",
        "syntax": "ln [选项] 源文件 链接文件",
        "options": [
            {"flag": "-s", "desc": "创建符号链接（软链接）"},
            {"flag": "-f", "desc": "强制创建，如链接存在则删除"},
            {"flag": "-i", "desc": "链接存在时提示确认"},
            {"flag": "-v", "desc": "显示创建过程"},
        ],
        "examples": [
            {"cmd": "ln file.txt hardlink", "desc": "创建硬链接"},
            {"cmd": "ln -s /opt/app app-link", "desc": "创建符号链接"},
            {"cmd": "ln -sf target link", "desc": "强制更新符号链接"},
        ],
        "usage_scenarios": [
            "创建文件快捷方式",
            "管理多版本软件",
            "配置文件统一管理"
        ],
        "related": ["ls", "rm"],
        "tips": "软链接可以跨文件系统，硬链接不行；删除源文件后软链接失效"
    },
    "stat": {
        "name": "stat",
        "desc": "显示文件详细状态信息",
        "long_desc": "stat 显示文件的详细元数据，包括大小、权限、时间戳、inode 等信息。",
        "category": "file",
        "syntax": "stat [选项] 文件",
        "options": [
            {"flag": "-f", "desc": "显示文件系统信息"},
            {"flag": "-c", "desc": "自定义输出格式"},
            {"flag": "-t", "desc": "以简洁格式显示"},
        ],
        "examples": [
            {"cmd": "stat file.txt", "desc": "显示文件的完整状态"},
            {"cmd": "stat -c '%s' file.txt", "desc": "只显示文件大小"},
            {"cmd": "stat -c '%y %n' *.txt", "desc": "显示所有 txt 文件的修改时间"},
        ],
        "usage_scenarios": [
            "查看文件完整元数据",
            "获取文件 inode 信息",
            "批量获取文件属性"
        ],
        "related": ["ls", "file"],
        "tips": "stat -c 配合格式化字符串可以精确获取所需信息"
    },
    "file": {
        "name": "file",
        "desc": "识别文件类型",
        "long_desc": "file 通过检查文件内容来判断文件类型，而不是依赖文件扩展名。",
        "category": "file",
        "syntax": "file [选项] 文件",
        "options": [
            {"flag": "-b", "desc": "不显示文件名"},
            {"flag": "-i", "desc": "显示 MIME 类型"},
            {"flag": "-f file", "desc": "从文件中读取要检查的文件列表"},
        ],
        "examples": [
            {"cmd": "file document.pdf", "desc": "识别文件类型"},
            {"cmd": "file /bin/ls", "desc": "查看可执行文件信息"},
            {"cmd": "file -i *.txt", "desc": "显示所有 txt 文件的 MIME 类型"},
        ],
        "usage_scenarios": [
            "确认文件真实类型",
            "检查可执行文件架构",
            "批量识别未知文件"
        ],
        "related": ["ls", "stat"],
        "tips": "file 检查文件内容，不依赖扩展名"
    },
    "dd": {
        "name": "dd",
        "desc": "转换和复制文件",
        "long_desc": "dd 是一个底层的文件复制和转换工具，常用于磁盘镜像、数据备份等操作。**使用不当可能破坏数据！**",
        "category": "file",
        "syntax": "dd [选项]",
        "options": [
            {"flag": "if=文件", "desc": "输入文件"},
            {"flag": "of=文件", "desc": "输出文件"},
            {"flag": "bs=N", "desc": "设置块大小为 N 字节"},
            {"flag": "count=N", "desc": "只复制 N 个块"},
            {"flag": "skip=N", "desc": "跳过输入的前 N 个块"},
            {"flag": "status=progress", "desc": "显示进度"},
        ],
        "examples": [
            {"cmd": "dd if=input.txt of=output.txt", "desc": "复制文件"},
            {"cmd": "dd if=/dev/zero of=empty.img bs=1M count=100", "desc": "创建 100MB 空文件"},
            {"cmd": "dd if=/dev/sda of=disk.img bs=4M", "desc": "备份整个磁盘"},
        ],
        "usage_scenarios": [
            "创建指定大小的空文件",
            "备份磁盘镜像",
            "低级别数据复制"
        ],
        "related": ["cp", "cat"],
        "tips": "dd 是危险命令，使用前要确认 if 和 of 参数！"
    },
    "cat": {
        "name": "cat",
        "desc": "连接并显示文件内容",
        "long_desc": "cat (concatenate) 用于连接文件并显示内容，是最常用的文件查看命令。适合查看小文件。",
        "category": "text",
        "syntax": "cat [选项] 文件",
        "options": [
            {"flag": "-n", "desc": "显示所有行号"},
            {"flag": "-b", "desc": "显示行号（空行除外）"},
            {"flag": "-s", "desc": "将多个连续空行压缩为一行"},
            {"flag": "-E", "desc": "在每行末尾显示 $"},
            {"flag": "-T", "desc": "将 TAB 显示为 ^I"},
        ],
        "examples": [
            {"cmd": "cat file.txt", "desc": "显示文件内容"},
            {"cmd": "cat -n file.txt", "desc": "带行号显示文件内容"},
            {"cmd": "cat file1 file2 > combined.txt", "desc": "合并多个文件"},
            {"cmd": "cat > file.txt", "desc": "从键盘输入创建文件（Ctrl+D 结束）"},
        ],
        "usage_scenarios": [
            "查看小文件内容",
            "合并多个文件",
            "创建简单文件"
        ],
        "related": ["less", "more", "head", "tail"],
        "tips": "cat 适合小文件，大文件请用 less 或 more"
    },
    "head": {
        "name": "head",
        "desc": "显示文件开头部分",
        "long_desc": "head 默认显示文件前 10 行，可查看文件开头内容或日志文件的开头部分。",
        "category": "text",
        "syntax": "head [选项] 文件",
        "options": [
            {"flag": "-n N", "desc": "显示前 N 行"},
            {"flag": "-c N", "desc": "显示前 N 字节"},
            {"flag": "-q", "desc": "不显示文件名"},
        ],
        "examples": [
            {"cmd": "head file.txt", "desc": "显示文件前 10 行"},
            {"cmd": "head -n 5 file.txt", "desc": "显示文件前 5 行"},
            {"cmd": "head -n 20 *.log", "desc": "显示所有日志文件前 20 行"},
        ],
        "usage_scenarios": [
            "快速查看文件开头",
            "查看日志文件头部",
            "提取文件前几行"
        ],
        "related": ["tail", "cat", "less"],
        "tips": "head -n -5 可以显示除最后 5 行外的所有内容"
    },
    "tail": {
        "name": "tail",
        "desc": "显示文件结尾部分",
        "long_desc": "tail 默认显示文件最后 10 行，常用于查看日志文件。支持实时监控文件变化。",
        "category": "text",
        "syntax": "tail [选项] 文件",
        "options": [
            {"flag": "-n N", "desc": "显示最后 N 行"},
            {"flag": "-f", "desc": "实时追踪文件新增内容（监控日志）"},
            {"flag": "-F", "desc": "类似 -f，但文件被删除或重建时继续追踪"},
            {"flag": "-c N", "desc": "显示最后 N 字节"},
        ],
        "examples": [
            {"cmd": "tail file.txt", "desc": "显示文件最后 10 行"},
            {"cmd": "tail -f log.txt", "desc": "实时查看日志文件"},
            {"cmd": "tail -n 100 app.log | head -20", "desc": "查看日志第 81-100 行"},
        ],
        "usage_scenarios": [
            "查看日志文件最新内容",
            "实时监控日志输出",
            "查看文件末尾内容"
        ],
        "related": ["head", "less", "grep"],
        "tips": "tail -f 是查看实时日志的神器，按 Ctrl+C 退出"
    },
    "less": {
        "name": "less",
        "desc": "分页查看文件内容",
        "long_desc": "less 是一个分页查看器，适合查看大文件。支持向前/向后滚动、搜索等功能。",
        "category": "text",
        "syntax": "less [选项] 文件",
        "options": [
            {"flag": "-N", "desc": "显示行号"},
            {"flag": "-i", "desc": "搜索时忽略大小写"},
            {"flag": "-S", "desc": "截断长行（不换行）"},
            {"flag": "-F", "desc": "文件内容少于一屏时直接退出"},
        ],
        "examples": [
            {"cmd": "less file.txt", "desc": "分页查看大文件"},
            {"cmd": "less +F log.txt", "desc": "类似 tail -f，可实时查看"},
            {"cmd": "less -N file.txt", "desc": "带行号查看"},
        ],
        "usage_scenarios": [
            "查看大文件内容",
            "浏览日志文件",
            "查看手册页"
        ],
        "related": ["more", "cat", "head"],
        "note": "在 less 中: 空格-下一页, b-上一页, q-退出, /-搜索, n-下一个匹配, N-上一个匹配",
        "tips": "按 / 输入关键词搜索，按 n 跳到下一个匹配"
    },
    "grep": {
        "name": "grep",
        "desc": "在文件中搜索匹配的文本",
        "long_desc": "grep (global regular expression print) 是强大的文本搜索工具，支持正则表达式，是文本处理的核心工具。",
        "category": "text",
        "syntax": "grep [选项] 模式 文件",
        "options": [
            {"flag": "-i", "desc": "忽略大小写"},
            {"flag": "-n", "desc": "显示行号"},
            {"flag": "-r", "desc": "递归搜索目录"},
            {"flag": "-v", "desc": "显示不匹配的行（反向匹配）"},
            {"flag": "-c", "desc": "只显示匹配行数"},
            {"flag": "-l", "desc": "只显示包含匹配的文件名"},
            {"flag": "-w", "desc": "只匹配整个单词"},
            {"flag": "-E", "desc": "使用扩展正则表达式"},
            {"flag": "-o", "desc": "只显示匹配的部分"},
            {"flag": "--color", "desc": "高亮显示匹配内容"},
        ],
        "examples": [
            {"cmd": "grep 'hello' file.txt", "desc": "在文件中搜索 hello"},
            {"cmd": "grep -i 'hello' file.txt", "desc": "忽略大小写搜索"},
            {"cmd": "grep -rn 'pattern' /path", "desc": "递归搜索目录"},
            {"cmd": "grep -v 'error' log.txt", "desc": "显示不含 error 的行"},
            {"cmd": "grep -E '^[0-9]+$' file.txt", "desc": "使用正则表达式匹配纯数字行"},
        ],
        "usage_scenarios": [
            "在日志中查找错误信息",
            "在代码中搜索特定函数",
            "过滤命令输出",
            "批量搜索多个文件"
        ],
        "related": ["egrep", "fgrep", "awk", "sed"],
        "tips": "grep --color=auto 可以高亮显示匹配内容"
    },
    "wc": {
        "name": "wc",
        "desc": "统计文件的行数、字数、字节数",
        "long_desc": "wc (word count) 用于统计文件中的行数、单词数和字节数，是分析文件内容的基础工具。",
        "category": "text",
        "syntax": "wc [选项] 文件",
        "options": [
            {"flag": "-l", "desc": "只统计行数"},
            {"flag": "-w", "desc": "只统计字数（单词数）"},
            {"flag": "-c", "desc": "只统计字节数"},
            {"flag": "-m", "desc": "只统计字符数"},
            {"flag": "-L", "desc": "显示最长行的长度"},
        ],
        "examples": [
            {"cmd": "wc file.txt", "desc": "统计行数、字数、字节数"},
            {"cmd": "wc -l file.txt", "desc": "统计文件行数"},
            {"cmd": "ls -la | wc -l", "desc": "统计目录中文件数量"},
            {"cmd": "wc -l *.py", "desc": "统计所有 Python 文件的行数"},
        ],
        "usage_scenarios": [
            "统计代码行数",
            "统计日志条目数",
            "分析文件大小"
        ],
        "related": ["cat", "grep"],
        "tips": "wc -l 是统计行数最常用的命令"
    },

    # ============ 新增文本处理命令 ============
    "more": {
        "name": "more",
        "desc": "分页查看文件内容",
        "long_desc": "more 是一个简单的分页查看器，只能向前滚动，适合快速查看文件。",
        "category": "text",
        "syntax": "more 文件",
        "options": [
            {"flag": "-N", "desc": "每屏显示 N 行"},
            {"flag": "+N", "desc": "从第 N 行开始显示"},
        ],
        "examples": [
            {"cmd": "more file.txt", "desc": "分页查看文件"},
            {"cmd": "ls -la | more", "desc": "管道输出到 more 分页显示"},
        ],
        "usage_scenarios": [
            "简单分页查看",
            "管道输出分页"
        ],
        "related": ["less", "cat"],
        "note": "按空格下一页，按回车下一行，q 退出",
        "tips": "现代系统推荐使用 less 替代 more"
    },
    "sort": {
        "name": "sort",
        "desc": "对文本行进行排序",
        "long_desc": "sort 用于对文本文件的行进行排序，支持多种排序方式和字段选择。",
        "category": "text",
        "syntax": "sort [选项] 文件",
        "options": [
            {"flag": "-r", "desc": "反向排序"},
            {"flag": "-n", "desc": "按数字排序"},
            {"flag": "-k N", "desc": "按第 N 列排序"},
            {"flag": "-t", "desc": "指定分隔符"},
            {"flag": "-u", "desc": "去重（唯一）"},
            {"flag": "-f", "desc": "忽略大小写"},
        ],
        "examples": [
            {"cmd": "sort file.txt", "desc": "按字母顺序排序"},
            {"cmd": "sort -n numbers.txt", "desc": "按数字大小排序"},
            {"cmd": "sort -k 2 -t ',' data.csv", "desc": "按 CSV 第 2 列排序"},
            {"cmd": "sort -r file.txt", "desc": "反向排序"},
        ],
        "usage_scenarios": [
            "排序日志文件",
            "整理数据文件",
            "按特定字段排序"
        ],
        "related": ["uniq", "awk"],
        "tips": "sort 配合 uniq 可以去重排序"
    },
    "uniq": {
        "name": "uniq",
        "desc": "报告或删除重复行",
        "long_desc": "uniq 用于报告或删除文件中相邻的重复行。通常需要先 sort 排序。",
        "category": "text",
        "syntax": "uniq [选项] 文件",
        "options": [
            {"flag": "-c", "desc": "统计每行出现的次数"},
            {"flag": "-d", "desc": "只显示重复的行"},
            {"flag": "-u", "desc": "只显示唯一的行"},
            {"flag": "-i", "desc": "忽略大小写"},
        ],
        "examples": [
            {"cmd": "uniq file.txt", "desc": "删除相邻重复行"},
            {"cmd": "sort file.txt | uniq", "desc": "完整去重"},
            {"cmd": "sort file.txt | uniq -c", "desc": "统计每行出现次数"},
            {"cmd": "sort file.txt | uniq -d", "desc": "只显示重复的行"},
        ],
        "usage_scenarios": [
            "统计词频",
            "去重日志条目",
            "找出重复记录"
        ],
        "related": ["sort", "wc"],
        "tips": "uniq 只能去除相邻重复，通常需要先 sort"
    },
    "cut": {
        "name": "cut",
        "desc": "提取文本列",
        "long_desc": "cut 用于从每行中提取指定的列，常用于处理 CSV、日志等结构化数据。",
        "category": "text",
        "syntax": "cut [选项] 文件",
        "options": [
            {"flag": "-d", "desc": "指定分隔符"},
            {"flag": "-f N", "desc": "提取第 N 个字段"},
            {"flag": "-c N", "desc": "提取第 N 个字符"},
            {"flag": "-b N", "desc": "提取第 N 个字节"},
        ],
        "examples": [
            {"cmd": "cut -d':' -f1 /etc/passwd", "desc": "提取用户名"},
            {"cmd": "cut -c1-10 file.txt", "desc": "提取每行前 10 个字符"},
            {"cmd": "cut -f1,3 data.csv", "desc": "提取第 1 和 3 列"},
        ],
        "usage_scenarios": [
            "提取 CSV 列",
            "处理日志字段",
            "提取特定字符范围"
        ],
        "related": ["awk", "sed"],
        "tips": "cut -d'分隔符' -f列号 是标准用法"
    },
    "awk": {
        "name": "awk",
        "desc": "文本处理编程语言",
        "long_desc": "awk 是强大的文本处理工具，支持模式匹配、字段处理、计算等功能。",
        "category": "text",
        "syntax": "awk '模式 {动作}' 文件",
        "options": [
            {"flag": "-F", "desc": "指定字段分隔符"},
            {"flag": "-v", "desc": "定义变量"},
        ],
        "examples": [
            {"cmd": "awk '{print $1}' file.txt", "desc": "打印第一列"},
            {"cmd": "awk -F':' '{print $1}' /etc/passwd", "desc": "按冒号分隔，打印第一列"},
            {"cmd": "awk '{sum+=$1} END {print sum}' file.txt", "desc": "求第一列的和"},
            {"cmd": "awk '/error/ {print $0}' log.txt", "desc": "打印包含 error 的行"},
        ],
        "usage_scenarios": [
            "提取和格式化数据",
            "简单计算和统计",
            "复杂文本处理"
        ],
        "related": ["sed", "grep", "cut"],
        "tips": "$0 表示整行，$1 $2 表示第 1、2 个字段"
    },
    "sed": {
        "name": "sed",
        "desc": "流编辑器",
        "long_desc": "sed (stream editor) 是流编辑器，用于对文本进行过滤和转换。",
        "category": "text",
        "syntax": "sed [选项] '命令' 文件",
        "options": [
            {"flag": "-i", "desc": "直接修改文件"},
            {"flag": "-n", "desc": "静默模式，只打印指定行"},
            {"flag": "-e", "desc": "执行多个命令"},
        ],
        "examples": [
            {"cmd": "sed 's/old/new/' file.txt", "desc": "替换每行第一个 old 为 new"},
            {"cmd": "sed 's/old/new/g' file.txt", "desc": "替换所有 old 为 new"},
            {"cmd": "sed -i 's/foo/bar/g' file.txt", "desc": "直接修改文件"},
            {"cmd": "sed '2d' file.txt", "desc": "删除第 2 行"},
            {"cmd": "sed -n '5,10p' file.txt", "desc": "打印第 5-10 行"},
        ],
        "usage_scenarios": [
            "批量替换文本",
            "删除指定行",
            "提取特定行"
        ],
        "related": ["awk", "grep", "tr"],
        "tips": "sed 's/旧/新/g' 是最常用的替换语法"
    },
    "tr": {
        "name": "tr",
        "desc": "字符转换",
        "long_desc": "tr (translate) 用于转换或删除字符，常用于大小写转换、删除特定字符等。",
        "category": "text",
        "syntax": "tr [选项] 字符集1 字符集2",
        "options": [
            {"flag": "-d", "desc": "删除字符"},
            {"flag": "-s", "desc": "压缩重复字符"},
            {"flag": "-t", "desc": "截断字符集1 到字符集2 的长度"},
        ],
        "examples": [
            {"cmd": "echo 'HELLO' | tr 'A-Z' 'a-z'", "desc": "大写转小写"},
            {"cmd": "tr -d '0-9' < file.txt", "desc": "删除所有数字"},
            {"cmd": "tr -s ' ' < file.txt", "desc": "压缩多个空格为单个"},
        ],
        "usage_scenarios": [
            "大小写转换",
            "删除特定字符",
            "字符替换"
        ],
        "related": ["sed", "awk"],
        "tips": "tr 只能处理单字符替换，复杂替换用 sed"
    },
    "tee": {
        "name": "tee",
        "desc": "读取并输出到多个目标",
        "long_desc": "tee 从标准输入读取数据，同时输出到标准输出和文件。名字来源于 T 形管。",
        "category": "text",
        "syntax": "tee [选项] 文件",
        "options": [
            {"flag": "-a", "desc": "追加到文件而不是覆盖"},
            {"flag": "-i", "desc": "忽略中断信号"},
        ],
        "examples": [
            {"cmd": "echo 'hello' | tee file.txt", "desc": "输出到屏幕并写入文件"},
            {"cmd": "ls -la | tee output.txt", "desc": "显示 ls 输出并保存"},
            {"cmd": "command | tee -a log.txt", "desc": "追加到日志文件"},
        ],
        "usage_scenarios": [
            "保存命令输出同时查看",
            "记录命令执行过程",
            "多路输出"
        ],
        "related": ["cat", "redirect"],
        "tips": "tee 可以在管道中保存中间结果"
    },
    "xargs": {
        "name": "xargs",
        "desc": "从标准输入构建并执行命令",
        "long_desc": "xargs 从标准输入读取参数，构建并执行命令。常用于处理大量文件。",
        "category": "text",
        "syntax": "xargs [选项] 命令",
        "options": [
            {"flag": "-n N", "desc": "每次使用 N 个参数"},
            {"flag": "-P N", "desc": "使用 N 个进程并行执行"},
            {"flag": "-I {}", "desc": "使用 {} 作为占位符"},
            {"flag": "-0", "desc": "以 null 字符分隔输入"},
        ],
        "examples": [
            {"cmd": "find . -name '*.txt' | xargs rm", "desc": "删除所有 txt 文件"},
            {"cmd": "cat files.txt | xargs -I {} cp {} /backup/", "desc": "批量复制文件"},
            {"cmd": "echo 1 2 3 | xargs -n1 echo", "desc": "每行输出一个数字"},
        ],
        "usage_scenarios": [
            "处理 find 的结果",
            "批量执行命令",
            "并行处理任务"
        ],
        "related": ["find", "exec"],
        "tips": "xargs -I {} 可以自定义占位符位置"
    },

    # ============ 系统监控命令 (14个) ============
    "ps": {
        "name": "ps",
        "desc": "显示进程状态",
        "long_desc": "ps (process status) 用于显示当前系统运行的进程信息，是进程管理的基础工具。",
        "category": "system",
        "syntax": "ps [选项]",
        "options": [
            {"flag": "aux", "desc": "显示所有用户的所有进程（BSD 风格）"},
            {"flag": "ef", "desc": "显示完整格式的所有进程（标准风格）"},
            {"flag": "-e", "desc": "显示所有进程"},
            {"flag": "-f", "desc": "显示完整格式"},
            {"flag": "-u 用户", "desc": "显示指定用户的进程"},
            {"flag": "-p PID", "desc": "显示指定 PID 的进程"},
        ],
        "examples": [
            {"cmd": "ps", "desc": "显示当前 shell 的进程"},
            {"cmd": "ps aux", "desc": "显示所有进程"},
            {"cmd": "ps aux | grep nginx", "desc": "查找 nginx 进程"},
            {"cmd": "ps -ef --forest", "desc": "以树形显示进程关系"},
        ],
        "usage_scenarios": [
            "查看运行中的进程",
            "查找特定进程",
            "分析进程关系"
        ],
        "related": ["top", "htop", "pgrep", "kill"],
        "tips": "ps aux 是最常用的查看所有进程的命令"
    },
    "top": {
        "name": "top",
        "desc": "实时显示进程状态",
        "long_desc": "top 实时显示系统中各个进程的资源占用情况，是性能监控的常用工具。",
        "category": "system",
        "syntax": "top",
        "options": [
            {"flag": "-p PID", "desc": "只监控指定 PID 的进程"},
            {"flag": "-u 用户", "desc": "只监控指定用户的进程"},
            {"flag": "-d N", "desc": "设置刷新间隔为 N 秒"},
        ],
        "examples": [
            {"cmd": "top", "desc": "实时显示系统进程和资源使用"},
            {"cmd": "top -p 1234", "desc": "只监控 PID 1234"},
            {"cmd": "top -u www", "desc": "只监控 www 用户的进程"},
        ],
        "usage_scenarios": [
            "监控系统资源使用",
            "找出资源占用高的进程",
            "实时进程管理"
        ],
        "related": ["ps", "htop", "kill"],
        "note": "按 q 退出，按 M 按内存排序，按 P 按 CPU 排序，按 k 杀死进程",
        "tips": "按 H 显示线程，按 c 显示完整命令路径"
    },
    "df": {
        "name": "df",
        "desc": "显示磁盘空间使用情况",
        "long_desc": "df (disk free) 显示文件系统的磁盘空间使用情况，包括总容量、已用、可用等。",
        "category": "system",
        "syntax": "df [选项]",
        "options": [
            {"flag": "-h", "desc": "以人类可读格式显示"},
            {"flag": "-T", "desc": "显示文件系统类型"},
            {"flag": "-i", "desc": "显示 inode 信息"},
            {"flag": "-a", "desc": "显示所有文件系统"},
        ],
        "examples": [
            {"cmd": "df -h", "desc": "显示磁盘空间（人类可读）"},
            {"cmd": "df -h /home", "desc": "显示 /home 分区的空间"},
            {"cmd": "df -i", "desc": "显示 inode 使用情况"},
        ],
        "usage_scenarios": [
            "检查磁盘空间是否充足",
            "查看分区使用情况",
            "监控 inode 使用率"
        ],
        "related": ["du", "lsblk", "mount"],
        "tips": "df -h 是最常用的查看磁盘空间命令"
    },
    "du": {
        "name": "du",
        "desc": "显示目录或文件的磁盘使用量",
        "long_desc": "du (disk usage) 显示目录或文件的磁盘使用量，常用于查找大文件或大目录。",
        "category": "system",
        "syntax": "du [选项] 文件/目录",
        "options": [
            {"flag": "-h", "desc": "以人类可读格式显示"},
            {"flag": "-s", "desc": "只显示总和"},
            {"flag": "-a", "desc": "显示所有文件和目录的大小"},
            {"flag": "--max-depth=N", "desc": "只显示到第 N 层目录"},
            {"flag": "-c", "desc": "显示总计"},
        ],
        "examples": [
            {"cmd": "du -h file.txt", "desc": "显示文件大小"},
            {"cmd": "du -sh dir", "desc": "显示目录总大小"},
            {"cmd": "du -h --max-depth=1 /var", "desc": "显示 /var 下各目录大小"},
            {"cmd": "du -ah | sort -rh | head -20", "desc": "找出最大的 20 个文件"},
        ],
        "usage_scenarios": [
            "查找占用空间大的目录",
            "分析磁盘使用情况",
            "清理磁盘空间"
        ],
        "related": ["df", "sort", "ncdu"],
        "tips": "du -sh * 可以快速查看当前目录下各文件/目录的大小"
    },
    "free": {
        "name": "free",
        "desc": "显示内存使用情况",
        "long_desc": "free 显示系统内存和交换分区的使用情况，包括物理内存、交换空间等。",
        "category": "system",
        "syntax": "free [选项]",
        "options": [
            {"flag": "-h", "desc": "以人类可读格式显示"},
            {"flag": "-m", "desc": "以 MB 显示"},
            {"flag": "-g", "desc": "以 GB 显示"},
            {"flag": "-t", "desc": "显示总计"},
            {"flag": "-s N", "desc": "每 N 秒刷新一次"},
        ],
        "examples": [
            {"cmd": "free -h", "desc": "显示内存使用情况"},
            {"cmd": "free -mt", "desc": "以 MB 显示并包含总计"},
            {"cmd": "free -s 5", "desc": "每 5 秒刷新"},
        ],
        "usage_scenarios": [
            "检查内存使用情况",
            "监控内存使用率",
            "查看交换空间使用"
        ],
        "related": ["top", "vmstat", "cat /proc/meminfo"],
        "tips": "available 列才是真实可用内存"
    },
    "uptime": {
        "name": "uptime",
        "desc": "显示系统运行时间和负载",
        "long_desc": "uptime 显示系统已经运行了多久，以及系统的平均负载。",
        "category": "system",
        "syntax": "uptime",
        "options": [
            {"flag": "-p", "desc": "以友好格式显示运行时间"},
            {"flag": "-s", "desc": "显示系统启动时间"},
        ],
        "examples": [
            {"cmd": "uptime", "desc": "显示系统运行时间和负载"},
            {"cmd": "uptime -p", "desc": "显示已运行时长"},
            {"cmd": "uptime -s", "desc": "显示启动时间"},
        ],
        "usage_scenarios": [
            "查看系统运行时长",
            "检查系统负载",
            "排查系统问题"
        ],
        "related": ["w", "who", "top"],
        "tips": "负载值通常应低于 CPU 核心数"
    },

    # ============ 新增系统监控命令 ============
    "htop": {
        "name": "htop",
        "desc": "交互式进程查看器",
        "long_desc": "htop 是 top 的增强版，提供彩色界面、鼠标支持、更友好的交互体验。",
        "category": "system",
        "syntax": "htop",
        "options": [
            {"flag": "-u 用户", "desc": "只显示指定用户的进程"},
            {"flag": "-p PID", "desc": "只显示指定 PID"},
        ],
        "examples": [
            {"cmd": "htop", "desc": "启动交互式进程查看器"},
            {"cmd": "htop -u root", "desc": "只显示 root 用户的进程"},
        ],
        "usage_scenarios": [
            "更直观地监控系统资源",
            "方便地管理进程",
            "替代 top"
        ],
        "related": ["top", "ps"],
        "tips": "F9 可以发送信号终止进程"
    },
    "kill": {
        "name": "kill",
        "desc": "终止进程",
        "long_desc": "kill 用于向进程发送信号，默认发送 TERM 信号终止进程。",
        "category": "system",
        "syntax": "kill [选项] PID",
        "options": [
            {"flag": "-9", "desc": "强制终止（SIGKILL）"},
            {"flag": "-15", "desc": "正常终止（SIGTERM，默认）"},
            {"flag": "-l", "desc": "列出所有信号"},
        ],
        "examples": [
            {"cmd": "kill 1234", "desc": "终止 PID 为 1234 的进程"},
            {"cmd": "kill -9 1234", "desc": "强制终止进程"},
            {"cmd": "killall firefox", "desc": "终止所有 firefox 进程"},
        ],
        "usage_scenarios": [
            "终止卡死的进程",
            "管理后台进程",
            "发送信号控制进程"
        ],
        "related": ["killall", "pkill", "ps"],
        "tips": "kill -9 是最后手段，可能导致数据丢失"
    },
    "pkill": {
        "name": "pkill",
        "desc": "按名称终止进程",
        "long_desc": "pkill 按进程名称或其他属性查找并终止进程。",
        "category": "system",
        "syntax": "pkill [选项] 模式",
        "options": [
            {"flag": "-f", "desc": "匹配完整命令行"},
            {"flag": "-u 用户", "desc": "只终止指定用户的进程"},
            {"flag": "-n", "desc": "只终止最新的匹配进程"},
        ],
        "examples": [
            {"cmd": "pkill firefox", "desc": "终止 firefox 进程"},
            {"cmd": "pkill -f 'python app.py'", "desc": "按完整命令匹配"},
        ],
        "usage_scenarios": [
            "按名称终止进程",
            "批量终止进程"
        ],
        "related": ["kill", "killall", "pgrep"],
        "tips": "pkill 支持正则表达式匹配"
    },
    "pgrep": {
        "name": "pgrep",
        "desc": "按名称查找进程ID",
        "long_desc": "pgrep 按进程名称查找 PID，常与 pkill 配合使用。",
        "category": "system",
        "syntax": "pgrep [选项] 模式",
        "options": [
            {"flag": "-l", "desc": "同时显示进程名"},
            {"flag": "-a", "desc": "显示完整命令行"},
            {"flag": "-u 用户", "desc": "只搜索指定用户的进程"},
            {"flag": "-f", "desc": "匹配完整命令行"},
        ],
        "examples": [
            {"cmd": "pgrep firefox", "desc": "查找 firefox 的 PID"},
            {"cmd": "pgrep -l python", "desc": "查找并显示 python 进程名"},
        ],
        "usage_scenarios": [
            "查找进程 PID",
            "验证进程是否运行"
        ],
        "related": ["pkill", "ps", "kill"],
        "tips": "pgrep -l 可以看到进程名和 PID"
    },
    "vmstat": {
        "name": "vmstat",
        "desc": "报告虚拟内存统计",
        "long_desc": "vmstat 报告进程、内存、分页、块 I/O、陷阱和 CPU 活动。",
        "category": "system",
        "syntax": "vmstat [选项] [延迟] [次数]",
        "options": [
            {"flag": "-a", "desc": "显示活跃/非活跃内存"},
            {"flag": "-s", "desc": "显示事件计数器"},
            {"flag": "-d", "desc": "显示磁盘统计"},
        ],
        "examples": [
            {"cmd": "vmstat 1", "desc": "每秒刷新显示"},
            {"cmd": "vmstat 1 5", "desc": "每秒刷新，共 5 次"},
            {"cmd": "vmstat -s", "desc": "显示内存统计摘要"},
        ],
        "usage_scenarios": [
            "监控内存使用",
            "分析系统性能",
            "排查内存问题"
        ],
        "related": ["top", "free", "iostat"],
        "tips": "vmstat 1 可以持续监控系统状态"
    },
    "iostat": {
        "name": "iostat",
        "desc": "报告 CPU 和 I/O 统计",
        "long_desc": "iostat 用于监控系统的输入/输出设备负载。",
        "category": "system",
        "syntax": "iostat [选项] [延迟] [次数]",
        "options": [
            {"flag": "-x", "desc": "显示扩展统计"},
            {"flag": "-d", "desc": "只显示设备统计"},
            {"flag": "-c", "desc": "只显示 CPU 统计"},
        ],
        "examples": [
            {"cmd": "iostat", "desc": "显示 CPU 和设备统计"},
            {"cmd": "iostat -x 1", "desc": "每秒显示扩展统计"},
        ],
        "usage_scenarios": [
            "监控磁盘 I/O",
            "分析 I/O 瓶颈",
            "检查设备性能"
        ],
        "related": ["vmstat", "iotop"],
        "tips": "iostat -x 可以看到更详细的 I/O 统计"
    },
    "lsof": {
        "name": "lsof",
        "desc": "列出打开的文件",
        "long_desc": "lsof (list open files) 列出系统中被进程打开的文件，包括网络连接。",
        "category": "system",
        "syntax": "lsof [选项]",
        "options": [
            {"flag": "-i", "desc": "显示网络连接"},
            {"flag": "-p PID", "desc": "显示指定进程的文件"},
            {"flag": "-u 用户", "desc": "显示指定用户的文件"},
            {"flag": "+d 目录", "desc": "显示打开该目录的进程"},
        ],
        "examples": [
            {"cmd": "lsof -i :80", "desc": "查看使用 80 端口的进程"},
            {"cmd": "lsof -p 1234", "desc": "查看 PID 1234 打开的文件"},
            {"cmd": "lsof +d /var/log", "desc": "查看谁在使用 /var/log"},
        ],
        "usage_scenarios": [
            "查找占用端口的进程",
            "查看进程打开的文件",
            "排查文件被占用问题"
        ],
        "related": ["netstat", "fuser"],
        "tips": "lsof -i :端口号 是排查端口占用问题的利器"
    },
    "dmesg": {
        "name": "dmesg",
        "desc": "显示内核环缓冲消息",
        "long_desc": "dmesg 显示内核环缓冲区的消息，包含系统启动信息和硬件检测信息。",
        "category": "system",
        "syntax": "dmesg [选项]",
        "options": [
            {"flag": "-T", "desc": "显示可读时间戳"},
            {"flag": "-H", "desc": "人类可读格式"},
            {"flag": "-w", "desc": "实时跟踪新消息"},
            {"flag": "-l", "desc": "按级别过滤"},
        ],
        "examples": [
            {"cmd": "dmesg | tail", "desc": "查看最近的内核消息"},
            {"cmd": "dmesg -T", "desc": "显示带时间戳的消息"},
            {"cmd": "dmesg | grep -i error", "desc": "查看错误信息"},
        ],
        "usage_scenarios": [
            "查看系统启动问题",
            "排查硬件问题",
            "检查驱动加载"
        ],
        "related": ["journalctl", "syslog"],
        "tips": "dmesg -T 可以看到人类可读的时间"
    },

    # ============ 网络工具命令 (14个) ============
    "ping": {
        "name": "ping",
        "desc": "测试与目标主机的网络连通性",
        "long_desc": "ping 发送 ICMP 回显请求到目标主机，测试网络连通性和延迟。",
        "category": "network",
        "syntax": "ping [选项] 目标主机",
        "options": [
            {"flag": "-c N", "desc": "发送 N 个包后停止"},
            {"flag": "-i N", "desc": "每 N 秒发送一个包"},
            {"flag": "-s N", "desc": "设置包大小为 N 字节"},
            {"flag": "-t N", "desc": "设置 TTL 为 N"},
        ],
        "examples": [
            {"cmd": "ping baidu.com", "desc": "测试与百度的连通性"},
            {"cmd": "ping -c 4 8.8.8.8", "desc": "ping 谷歌 DNS 4 次"},
            {"cmd": "ping -i 0.2 192.168.1.1", "desc": "快速 ping 本地网关"},
        ],
        "usage_scenarios": [
            "测试网络连通性",
            "检查网络延迟",
            "排查网络故障"
        ],
        "related": ["traceroute", "telnet", "nc"],
        "tips": "按 Ctrl+C 停止 ping"
    },
    "curl": {
        "name": "curl",
        "desc": "从 URL 传输数据",
        "long_desc": "curl 是功能强大的数据传输工具，支持多种协议（HTTP、HTTPS、FTP 等）。",
        "category": "network",
        "syntax": "curl [选项] URL",
        "options": [
            {"flag": "-O", "desc": "保存为远程文件名"},
            {"flag": "-L", "desc": "跟随重定向"},
            {"flag": "-o 文件", "desc": "保存为指定文件名"},
            {"flag": "-I", "desc": "只显示响应头"},
            {"flag": "-X 方法", "desc": "指定请求方法（GET/POST/PUT/DELETE）"},
            {"flag": "-H '头信息'", "desc": "添加请求头"},
            {"flag": "-d '数据'", "desc": "发送 POST 数据"},
            {"flag": "-s", "desc": "静默模式"},
        ],
        "examples": [
            {"cmd": "curl https://api.github.com", "desc": "获取 API 内容"},
            {"cmd": "curl -O http://example.com/file.zip", "desc": "下载文件"},
            {"cmd": "curl -I https://example.com", "desc": "查看响应头"},
            {"cmd": "curl -X POST -d 'name=john' https://api.example.com", "desc": "发送 POST 请求"},
            {"cmd": "curl -H 'Authorization: token' https://api.example.com", "desc": "添加认证头"},
        ],
        "usage_scenarios": [
            "测试 API 接口",
            "下载文件",
            "发送 HTTP 请求",
            "调试网络服务"
        ],
        "related": ["wget", "httpie"],
        "tips": "curl -I 可以快速检查网站是否可用"
    },
    "wget": {
        "name": "wget",
        "desc": "从网络下载文件",
        "long_desc": "wget 是强大的非交互式文件下载工具，支持断点续传、递归下载等。",
        "category": "network",
        "syntax": "wget [选项] URL",
        "options": [
            {"flag": "-O 文件名", "desc": "指定保存文件名"},
            {"flag": "-c", "desc": "断点续传"},
            {"flag": "-r", "desc": "递归下载"},
            {"flag": "-b", "desc": "后台下载"},
            {"flag": "-q", "desc": "静默模式"},
            {"flag": "--limit-rate=速度", "desc": "限制下载速度"},
        ],
        "examples": [
            {"cmd": "wget http://example.com/file.zip", "desc": "下载文件"},
            {"cmd": "wget -c http://example.com/large.zip", "desc": "断点续传下载"},
            {"cmd": "wget -r -np http://example.com/docs/", "desc": "递归下载目录"},
        ],
        "usage_scenarios": [
            "下载大文件",
            "批量下载资源",
            "断点续传",
            "镜像网站"
        ],
        "related": ["curl", "axel"],
        "tips": "wget -c 可以在网络中断后继续下载"
    },
    "netstat": {
        "name": "netstat",
        "desc": "显示网络连接、路由表等信息",
        "long_desc": "netstat 显示网络连接、路由表、接口统计等信息。",
        "category": "network",
        "syntax": "netstat [选项]",
        "options": [
            {"flag": "-t", "desc": "显示 TCP 连接"},
            {"flag": "-u", "desc": "显示 UDP 连接"},
            {"flag": "-n", "desc": "以数字形式显示地址和端口"},
            {"flag": "-l", "desc": "显示监听的端口"},
            {"flag": "-p", "desc": "显示进程信息"},
            {"flag": "-a", "desc": "显示所有连接"},
        ],
        "examples": [
            {"cmd": "netstat -tuln", "desc": "显示所有监听的 TCP/UDP 端口"},
            {"cmd": "netstat -anp | grep :80", "desc": "查看 80 端口的连接"},
            {"cmd": "netstat -s", "desc": "显示网络统计"},
        ],
        "usage_scenarios": [
            "查看端口占用",
            "排查网络问题",
            "监控网络连接"
        ],
        "related": ["ss", "lsof"],
        "tips": "netstat -tlnp 是查看监听端口的常用命令"
    },

    # ============ 新增网络命令 ============
    "ss": {
        "name": "ss",
        "desc": "查看套接字统计",
        "long_desc": "ss 是 netstat 的现代替代品，速度更快，功能更强大。",
        "category": "network",
        "syntax": "ss [选项]",
        "options": [
            {"flag": "-t", "desc": "显示 TCP 套接字"},
            {"flag": "-u", "desc": "显示 UDP 套接字"},
            {"flag": "-l", "desc": "显示监听套接字"},
            {"flag": "-n", "desc": "不解析服务名称"},
            {"flag": "-p", "desc": "显示进程信息"},
            {"flag": "-s", "desc": "显示摘要统计"},
        ],
        "examples": [
            {"cmd": "ss -tlnp", "desc": "显示监听的 TCP 端口"},
            {"cmd": "ss -s", "desc": "显示套接字统计"},
            {"cmd": "ss -tlnp | grep :80", "desc": "查看 80 端口"},
        ],
        "usage_scenarios": [
            "替代 netstat",
            "查看网络连接",
            "排查端口问题"
        ],
        "related": ["netstat", "lsof"],
        "tips": "ss 比 netstat 更快更高效"
    },
    "traceroute": {
        "name": "traceroute",
        "desc": "跟踪数据包路由路径",
        "long_desc": "traceroute 显示数据包到达目标所经过的路由节点。",
        "category": "network",
        "syntax": "traceroute [选项] 目标",
        "options": [
            {"flag": "-I", "desc": "使用 ICMP 代替 UDP"},
            {"flag": "-T", "desc": "使用 TCP"},
            {"flag": "-n", "desc": "不解析主机名"},
            {"flag": "-m N", "desc": "设置最大跳数为 N"},
        ],
        "examples": [
            {"cmd": "traceroute baidu.com", "desc": "追踪到百度的路由"},
            {"cmd": "traceroute -I 8.8.8.8", "desc": "使用 ICMP 追踪"},
        ],
        "usage_scenarios": [
            "排查网络路由问题",
            "分析网络延迟",
            "检查网络路径"
        ],
        "related": ["ping", "mtr"],
        "tips": "tracert 是 Windows 上的等价命令"
    },
    "nslookup": {
        "name": "nslookup",
        "desc": "查询 DNS 记录",
        "long_desc": "nslookup 查询 DNS 服务器获取域名对应的 IP 地址或其他 DNS 记录。",
        "category": "network",
        "syntax": "nslookup [选项] 域名 [DNS服务器]",
        "options": [
            {"flag": "-type=A", "desc": "查询 A 记录"},
            {"flag": "-type=MX", "desc": "查询 MX 记录"},
            {"flag": "-type=NS", "desc": "查询 NS 记录"},
        ],
        "examples": [
            {"cmd": "nslookup baidu.com", "desc": "查询百度域名"},
            {"cmd": "nslookup -type=MX gmail.com", "desc": "查询邮件服务器"},
        ],
        "usage_scenarios": [
            "检查 DNS 解析",
            "排查域名问题",
            "查询邮件服务器"
        ],
        "related": ["dig", "host"],
        "tips": "dig 是更现代的 DNS 查询工具"
    },
    "dig": {
        "name": "dig",
        "desc": "DNS 查询工具",
        "long_desc": "dig 是功能强大的 DNS 查询工具，比 nslookup 更灵活。",
        "category": "network",
        "syntax": "dig [选项] 域名 [类型]",
        "options": [
            {"flag": "+short", "desc": "简短输出"},
            {"flag": "@服务器", "desc": "指定 DNS 服务器"},
            {"flag": "-x IP", "desc": "反向 DNS 查询"},
        ],
        "examples": [
            {"cmd": "dig baidu.com", "desc": "查询域名"},
            {"cmd": "dig +short baidu.com", "desc": "简短输出"},
            {"cmd": "dig @8.8.8.8 baidu.com", "desc": "使用指定 DNS 查询"},
            {"cmd": "dig -x 8.8.8.8", "desc": "反向查询 IP"},
        ],
        "usage_scenarios": [
            "详细 DNS 查询",
            "排查 DNS 问题",
            "测试 DNS 服务器"
        ],
        "related": ["nslookup", "host"],
        "tips": "dig +trace 可以追踪 DNS 查询过程"
    },
    "ssh": {
        "name": "ssh",
        "desc": "安全远程登录",
        "long_desc": "ssh (Secure Shell) 提供加密的远程登录和命令执行。",
        "category": "network",
        "syntax": "ssh [选项] 用户@主机",
        "options": [
            {"flag": "-p 端口", "desc": "指定端口（默认 22）"},
            {"flag": "-i 密钥", "desc": "指定私钥文件"},
            {"flag": "-X", "desc": "启用 X11 转发"},
            {"flag": "-N", "desc": "不执行远程命令（用于端口转发）"},
            {"flag": "-L 端口转发", "desc": "设置本地端口转发"},
        ],
        "examples": [
            {"cmd": "ssh user@server", "desc": "远程登录服务器"},
            {"cmd": "ssh -p 2222 user@server", "desc": "使用指定端口登录"},
            {"cmd": "ssh -i ~/.ssh/id_rsa user@server", "desc": "使用密钥登录"},
        ],
        "usage_scenarios": [
            "远程管理服务器",
            "安全传输数据",
            "执行远程命令"
        ],
        "related": ["scp", "sftp"],
        "tips": "ssh-copy-id 可以方便地配置密钥登录"
    },
    "scp": {
        "name": "scp",
        "desc": "安全复制文件",
        "long_desc": "scp (secure copy) 基于 SSH 在主机间安全复制文件。",
        "category": "network",
        "syntax": "scp [选项] 源文件 目标文件",
        "options": [
            {"flag": "-P 端口", "desc": "指定端口（注意大写 P）"},
            {"flag": "-r", "desc": "递归复制目录"},
            {"flag": "-p", "desc": "保留文件属性"},
            {"flag": "-C", "desc": "压缩传输"},
        ],
        "examples": [
            {"cmd": "scp file.txt user@server:/path/", "desc": "复制到远程服务器"},
            {"cmd": "scp -r dir user@server:/path/", "desc": "复制目录"},
            {"cmd": "scp user@server:/path/file.txt ./", "desc": "从远程复制到本地"},
        ],
        "usage_scenarios": [
            "远程文件传输",
            "备份到远程服务器",
            "部署文件"
        ],
        "related": ["ssh", "rsync"],
        "tips": "scp -r 可以递归复制整个目录"
    },
    "ifconfig": {
        "name": "ifconfig",
        "desc": "配置网络接口",
        "long_desc": "ifconfig 显示或配置网络接口信息。现代系统推荐使用 ip 命令。",
        "category": "network",
        "syntax": "ifconfig [接口] [选项]",
        "options": [
            {"flag": "up", "desc": "启用接口"},
            {"flag": "down", "desc": "禁用接口"},
            {"flag": "inet IP", "desc": "设置 IP 地址"},
        ],
        "examples": [
            {"cmd": "ifconfig", "desc": "显示所有接口信息"},
            {"cmd": "ifconfig eth0", "desc": "显示 eth0 信息"},
            {"cmd": "sudo ifconfig eth0 up", "desc": "启用 eth0"},
        ],
        "usage_scenarios": [
            "查看 IP 地址",
            "配置网络接口",
            "启用/禁用网卡"
        ],
        "related": ["ip", "nmcli"],
        "tips": "ip addr 是 ifconfig 的现代替代"
    },
    "ip": {
        "name": "ip",
        "desc": "网络配置工具",
        "long_desc": "ip 是新一代网络配置工具，功能全面，替代 ifconfig、route 等命令。",
        "category": "network",
        "syntax": "ip [选项] 对象 命令",
        "options": [
            {"flag": "addr", "desc": "管理地址"},
            {"flag": "link", "desc": "管理网络接口"},
            {"flag": "route", "desc": "管理路由"},
        ],
        "examples": [
            {"cmd": "ip addr", "desc": "显示所有接口地址"},
            {"cmd": "ip addr show eth0", "desc": "显示 eth0 地址"},
            {"cmd": "ip link set eth0 up", "desc": "启用 eth0"},
            {"cmd": "ip route", "desc": "显示路由表"},
        ],
        "usage_scenarios": [
            "查看网络配置",
            "管理网络接口",
            "配置路由"
        ],
        "related": ["ifconfig", "route"],
        "tips": "ip addr show 是查看 IP 的推荐方式"
    },
    "nc": {
        "name": "nc",
        "desc": "网络工具瑞士军刀",
        "long_desc": "nc (netcat) 是功能强大的网络工具，可用于端口扫描、数据传输、远程 shell 等。",
        "category": "network",
        "syntax": "nc [选项] 主机 端口",
        "options": [
            {"flag": "-l", "desc": "监听模式"},
            {"flag": "-p 端口", "desc": "指定本地端口"},
            {"flag": "-v", "desc": "显示详细信息"},
            {"flag": "-z", "desc": "扫描模式（不发送数据）"},
            {"flag": "-w N", "desc": "设置超时 N 秒"},
        ],
        "examples": [
            {"cmd": "nc -zv 192.168.1.1 22", "desc": "测试 22 端口是否开放"},
            {"cmd": "nc -zv 192.168.1.1 1-1000", "desc": "扫描 1-1000 端口"},
            {"cmd": "nc -l 1234", "desc": "在 1234 端口监听"},
            {"cmd": "nc 192.168.1.1 80", "desc": "连接到 80 端口"},
        ],
        "usage_scenarios": [
            "测试端口连通性",
            "简单的端口扫描",
            "传输文件",
            "创建简单的服务"
        ],
        "related": ["telnet", "curl"],
        "tips": "nc 是网络调试的利器"
    },
    "telnet": {
        "name": "telnet",
        "desc": "远程登录协议客户端",
        "long_desc": "telnet 用于远程登录和测试端口连接。**注意：数据不加密，生产环境请用 SSH**。",
        "category": "network",
        "syntax": "telnet [选项] 主机 [端口]",
        "options": [],
        "examples": [
            {"cmd": "telnet 192.168.1.1 80", "desc": "测试 80 端口"},
            {"cmd": "telnet server 23", "desc": "远程登录（不推荐）"},
        ],
        "usage_scenarios": [
            "测试端口连通性",
            "调试网络服务"
        ],
        "related": ["nc", "ssh"],
        "tips": "现在主要用于测试端口，不再用于远程登录"
    },

    # ============ 权限管理命令 (6个) ============
    "chmod": {
        "name": "chmod",
        "desc": "修改文件权限",
        "long_desc": "chmod (change mode) 修改文件的访问权限，包括读、写、执行权限。",
        "category": "permission",
        "syntax": "chmod [选项] 模式 文件",
        "options": [
            {"flag": "-R", "desc": "递归修改目录及其内容的权限"},
            {"flag": "-v", "desc": "显示修改过程"},
            {"flag": "-c", "desc": "只在有变化时显示"},
        ],
        "examples": [
            {"cmd": "chmod 755 file", "desc": "设置权限为 rwxr-xr-x"},
            {"cmd": "chmod u+x file", "desc": "给所有者添加执行权限"},
            {"cmd": "chmod a+r file", "desc": "给所有用户添加读权限"},
            {"cmd": "chmod -R 755 dir", "desc": "递归修改目录权限"},
        ],
        "usage_scenarios": [
            "设置脚本可执行",
            "修改文件访问权限",
            "保护敏感文件"
        ],
        "related": ["chown", "ls", "umask"],
        "note": "权限数字: 4=读, 2=写, 1=执行; 例如 755=rwxr-xr-x",
        "tips": "chmod +x script.sh 可以快速添加执行权限"
    },
    "chown": {
        "name": "chown",
        "desc": "修改文件所有者和所属组",
        "long_desc": "chown (change owner) 修改文件的所有者和所属组。",
        "category": "permission",
        "syntax": "chown [选项] 用户:组 文件",
        "options": [
            {"flag": "-R", "desc": "递归修改"},
            {"flag": "-v", "desc": "显示修改过程"},
            {"flag": "--reference=文件", "desc": "参考指定文件的权限"},
        ],
        "examples": [
            {"cmd": "chown user file", "desc": "修改文件所有者为 user"},
            {"cmd": "chown user:group file", "desc": "修改所有者和所属组"},
            {"cmd": "chown :group file", "desc": "只修改所属组"},
            {"cmd": "chown -R user:group dir", "desc": "递归修改目录"},
        ],
        "usage_scenarios": [
            "修改文件所有者",
            "修改文件所属组",
            "批量修改权限"
        ],
        "related": ["chmod", "chgrp"],
        "tips": "chown -R 需要 root 权限"
    },
    "chgrp": {
        "name": "chgrp",
        "desc": "修改文件所属组",
        "long_desc": "chgrp (change group) 专门用于修改文件的所属组。",
        "category": "permission",
        "syntax": "chgrp [选项] 组 文件",
        "options": [
            {"flag": "-R", "desc": "递归修改"},
        ],
        "examples": [
            {"cmd": "chgrp developers file.txt", "desc": "修改文件所属组"},
            {"cmd": "chgrp -R www-data /var/www", "desc": "递归修改目录所属组"},
        ],
        "usage_scenarios": [
            "修改文件组权限",
            "配合 chmod 使用"
        ],
        "related": ["chown", "chmod"],
        "tips": "chown :group 和 chgrp group 效果相同"
    },
    "sudo": {
        "name": "sudo",
        "desc": "以超级用户权限执行命令",
        "long_desc": "sudo (superuser do) 允许普通用户以 root 权限执行命令。",
        "category": "permission",
        "syntax": "sudo [选项] 命令",
        "options": [
            {"flag": "-u 用户", "desc": "以指定用户身份执行"},
            {"flag": "-i", "desc": "模拟登录 shell"},
            {"flag": "-E", "desc": "保留环境变量"},
            {"flag": "-H", "desc": "将 HOME 设为目标用户的主目录"},
        ],
        "examples": [
            {"cmd": "sudo apt update", "desc": "以 root 权限执行命令"},
            {"cmd": "sudo -i", "desc": "切换到 root 用户"},
            {"cmd": "sudo -u www whoami", "desc": "以 www 用户执行"},
        ],
        "usage_scenarios": [
            "执行需要 root 权限的命令",
            "临时获取管理员权限",
            "切换用户身份"
        ],
        "related": ["su"],
        "tips": "sudo 命令会记录到日志，便于审计"
    },
    "su": {
        "name": "su",
        "desc": "切换用户",
        "long_desc": "su (switch user) 切换到其他用户身份，默认是 root。",
        "category": "permission",
        "syntax": "su [选项] [用户]",
        "options": [
            {"flag": "-", "desc": "切换到用户环境（包括环境变量）"},
            {"flag": "-c 命令", "desc": "执行命令后返回"},
            {"flag": "-l", "desc": "类似 -，切换到登录 shell"},
        ],
        "examples": [
            {"cmd": "su -", "desc": "切换到 root 并加载环境"},
            {"cmd": "su - username", "desc": "切换到指定用户"},
            {"cmd": "su -c 'whoami' root", "desc": "以 root 执行命令后返回"},
        ],
        "usage_scenarios": [
            "切换到 root 用户",
            "切换到其他用户",
            "临时执行其他用户命令"
        ],
        "related": ["sudo"],
        "tips": "su - 和 sudo -i 都能获得 root shell"
    },

    # ============ 搜索查找命令 (8个) ============
    "find": {
        "name": "find",
        "desc": "在目录层次结构中搜索文件",
        "long_desc": "find 是最强大的文件搜索工具，支持按名称、类型、大小、时间等多种条件搜索。",
        "category": "search",
        "syntax": "find 路径 [选项] 条件",
        "options": [
            {"flag": "-name", "desc": "按名称搜索（区分大小写）"},
            {"flag": "-iname", "desc": "按名称搜索（不区分大小写）"},
            {"flag": "-type", "desc": "按类型搜索（f 文件, d 目录, l 链接）"},
            {"flag": "-size", "desc": "按大小搜索（+100M 大于 100M）"},
            {"flag": "-mtime", "desc": "按修改时间搜索（-7 7天内）"},
            {"flag": "-exec", "desc": "对结果执行命令"},
            {"flag": "-delete", "desc": "删除匹配的文件"},
        ],
        "examples": [
            {"cmd": "find . -name '*.txt'", "desc": "查找所有 txt 文件"},
            {"cmd": "find /home -type d", "desc": "查找所有目录"},
            {"cmd": "find . -size +100M", "desc": "查找大于 100M 的文件"},
            {"cmd": "find . -name '*.log' -mtime +30 -delete", "desc": "删除 30 天前的日志"},
            {"cmd": "find . -type f -exec chmod 644 {} \\;", "desc": "修改所有文件权限"},
        ],
        "usage_scenarios": [
            "查找特定文件",
            "批量处理文件",
            "清理旧文件",
            "查找大文件"
        ],
        "related": ["locate", "grep", "xargs"],
        "tips": "find -exec 可以结合其他命令批量处理"
    },
    "locate": {
        "name": "locate",
        "desc": "快速查找文件",
        "long_desc": "locate 通过预建的数据库快速查找文件，比 find 快但需要定期更新数据库。",
        "category": "search",
        "syntax": "locate [选项] 模式",
        "options": [
            {"flag": "-i", "desc": "忽略大小写"},
            {"flag": "-r", "desc": "使用正则表达式"},
            {"flag": "-c", "desc": "只显示匹配数量"},
        ],
        "examples": [
            {"cmd": "locate filename", "desc": "快速查找文件"},
            {"cmd": "locate '*.conf'", "desc": "查找所有配置文件"},
            {"cmd": "sudo updatedb", "desc": "更新 locate 数据库"},
        ],
        "usage_scenarios": [
            "快速定位文件",
            "查找命令位置",
            "批量查找"
        ],
        "related": ["find", "which"],
        "tips": "locate 比 find 快，但可能包含已删除的文件"
    },
    "which": {
        "name": "which",
        "desc": "查找命令的可执行文件路径",
        "long_desc": "which 在 PATH 中查找命令的位置。",
        "category": "search",
        "syntax": "which [选项] 命令",
        "options": [
            {"flag": "-a", "desc": "显示所有匹配路径"},
        ],
        "examples": [
            {"cmd": "which python", "desc": "查找 python 命令的位置"},
            {"cmd": "which -a python", "desc": "查找所有 python 路径"},
        ],
        "usage_scenarios": [
            "确认使用哪个命令",
            "检查命令是否安装"
        ],
        "related": ["whereis", "type"],
        "tips": "which 只在 PATH 中搜索"
    },
    "whereis": {
        "name": "whereis",
        "desc": "查找命令的二进制、源和手册页",
        "long_desc": "whereis 查找命令的二进制文件、源码和手册页位置。",
        "category": "search",
        "syntax": "whereis [选项] 命令",
        "options": [
            {"flag": "-b", "desc": "只查找二进制文件"},
            {"flag": "-m", "desc": "只查找手册页"},
            {"flag": "-s", "desc": "只查找源码"},
        ],
        "examples": [
            {"cmd": "whereis python", "desc": "查找 python 相关文件"},
            {"cmd": "whereis -b ls", "desc": "只找 ls 的二进制文件"},
        ],
        "usage_scenarios": [
            "查找命令完整信息",
            "找到手册页位置"
        ],
        "related": ["which", "locate"],
        "tips": "whereis 比 which 提供更全面的信息"
    },
    "type": {
        "name": "type",
        "desc": "显示命令类型",
        "long_desc": "type 显示命令的类型（内建命令、别名、函数或外部命令）。",
        "category": "search",
        "syntax": "type [选项] 命令",
        "options": [
            {"flag": "-a", "desc": "显示所有匹配"},
            {"flag": "-t", "desc": "只显示类型"},
        ],
        "examples": [
            {"cmd": "type ls", "desc": "显示 ls 的类型"},
            {"cmd": "type cd", "desc": "显示 cd 是内建命令"},
            {"cmd": "type -a echo", "desc": "显示所有 echo 定义"},
        ],
        "usage_scenarios": [
            "了解命令类型",
            "排查命令别名"
        ],
        "related": ["which", "alias"],
        "tips": "type 可以识别 shell 内建命令"
    },
    "updatedb": {
        "name": "updatedb",
        "desc": "更新 locate 数据库",
        "long_desc": "updatedb 更新 locate 使用的文件名数据库，通常需要 root 权限。",
        "category": "search",
        "syntax": "updatedb [选项]",
        "options": [
            {"flag": "-U 路径", "desc": "只更新指定路径"},
            {"flag": "-v", "desc": "显示进度"},
        ],
        "examples": [
            {"cmd": "sudo updatedb", "desc": "更新 locate 数据库"},
            {"cmd": "sudo updatedb -U /home", "desc": "只更新 /home 目录"},
        ],
        "usage_scenarios": [
            "更新 locate 数据库",
            "确保 locate 结果准确"
        ],
        "related": ["locate", "find"],
        "tips": "updatedb 通常由 cron 定期自动执行"
    },
    "history": {
        "name": "history",
        "desc": "显示命令历史",
        "long_desc": "history 显示用户执行过的命令历史列表。",
        "category": "search",
        "syntax": "history [选项]",
        "options": [
            {"flag": "-c", "desc": "清空历史"},
            {"flag": "-d N", "desc": "删除第 N 条历史"},
        ],
        "examples": [
            {"cmd": "history", "desc": "显示所有历史命令"},
            {"cmd": "history | grep ssh", "desc": "搜索历史中的 ssh 命令"},
            {"cmd": "!100", "desc": "执行第 100 条历史命令"},
            {"cmd": "!!", "desc": "执行上一条命令"},
        ],
        "usage_scenarios": [
            "查找之前执行的命令",
            "重复执行历史命令",
            "清理敏感命令"
        ],
        "related": ["grep"],
        "tips": "Ctrl+R 可以交互式搜索历史"
    },

    # ============ 压缩归档命令 (10个) ============
    "tar": {
        "name": "tar",
        "desc": "归档和压缩文件",
        "long_desc": "tar (tape archive) 用于创建和提取归档文件，常与压缩工具结合使用。",
        "category": "compression",
        "syntax": "tar [选项] 归档文件 源文件",
        "options": [
            {"flag": "-c", "desc": "创建归档"},
            {"flag": "-x", "desc": "解压归档"},
            {"flag": "-v", "desc": "显示过程"},
            {"flag": "-f", "desc": "指定归档文件名"},
            {"flag": "-z", "desc": "使用 gzip 压缩/解压"},
            {"flag": "-j", "desc": "使用 bzip2 压缩/解压"},
            {"flag": "-J", "desc": "使用 xz 压缩/解压"},
            {"flag": "-t", "desc": "列出归档内容"},
            {"flag": "-p", "desc": "保留权限"},
            {"flag": "-C 目录", "desc": "切换到指定目录"},
        ],
        "examples": [
            {"cmd": "tar -cvf archive.tar file1 file2", "desc": "创建 tar 归档"},
            {"cmd": "tar -xvf archive.tar", "desc": "解压 tar 归档"},
            {"cmd": "tar -czvf archive.tar.gz dir", "desc": "创建 gzip 压缩归档"},
            {"cmd": "tar -xzvf archive.tar.gz", "desc": "解压 gzip 压缩归档"},
            {"cmd": "tar -tvf archive.tar", "desc": "查看归档内容"},
        ],
        "usage_scenarios": [
            "备份文件和目录",
            "打包分发软件",
            "压缩日志归档"
        ],
        "related": ["gzip", "zip", "rsync"],
        "tips": "tar -czvf 和 tar -xzvf 是最常用的组合"
    },
    "gzip": {
        "name": "gzip",
        "desc": "压缩文件",
        "long_desc": "gzip 是常用的文件压缩工具，压缩后文件扩展名为 .gz。",
        "category": "compression",
        "syntax": "gzip [选项] 文件",
        "options": [
            {"flag": "-d", "desc": "解压"},
            {"flag": "-k", "desc": "保留原文件"},
            {"flag": "-v", "desc": "显示压缩比"},
            {"flag": "-r", "desc": "递归压缩目录"},
            {"flag": "-N", "desc": "N 为 1-9，压缩级别（默认 6）"},
        ],
        "examples": [
            {"cmd": "gzip file.txt", "desc": "压缩 file.txt 为 file.txt.gz"},
            {"cmd": "gzip -d file.txt.gz", "desc": "解压文件"},
            {"cmd": "gzip -k file.txt", "desc": "压缩并保留原文件"},
            {"cmd": "gunzip file.txt.gz", "desc": "解压（等价于 gzip -d）"},
        ],
        "usage_scenarios": [
            "压缩单个文件",
            "配合 tar 使用"
        ],
        "related": ["gunzip", "tar", "bzip2"],
        "tips": "gzip 只能压缩单个文件，目录需要先 tar"
    },

    # ============ 新增压缩命令 ============
    "gunzip": {
        "name": "gunzip",
        "desc": "解压 gzip 文件",
        "long_desc": "gunzip 是 gzip -d 的别名，用于解压 .gz 文件。",
        "category": "compression",
        "syntax": "gunzip [选项] 文件",
        "options": [
            {"flag": "-k", "desc": "保留原文件"},
            {"flag": "-v", "desc": "显示解压过程"},
        ],
        "examples": [
            {"cmd": "gunzip file.txt.gz", "desc": "解压文件"},
            {"cmd": "gunzip -k file.txt.gz", "desc": "解压但保留原文件"},
        ],
        "usage_scenarios": [
            "解压 gzip 文件"
        ],
        "related": ["gzip", "zcat"],
        "tips": "gunzip 等价于 gzip -d"
    },
    "bzip2": {
        "name": "bzip2",
        "desc": "高性能文件压缩",
        "long_desc": "bzip2 使用 Burrows-Wheeler 算法，通常比 gzip 压缩比更高但速度较慢。",
        "category": "compression",
        "syntax": "bzip2 [选项] 文件",
        "options": [
            {"flag": "-d", "desc": "解压"},
            {"flag": "-k", "desc": "保留原文件"},
            {"flag": "-v", "desc": "显示压缩比"},
        ],
        "examples": [
            {"cmd": "bzip2 file.txt", "desc": "压缩文件为 file.txt.bz2"},
            {"cmd": "bzip2 -d file.txt.bz2", "desc": "解压文件"},
            {"cmd": "bunzip2 file.txt.bz2", "desc": "解压（等价于 bzip2 -d）"},
        ],
        "usage_scenarios": [
            "需要更高压缩比的场景"
        ],
        "related": ["bunzip2", "gzip", "tar"],
        "tips": "bzip2 压缩比通常比 gzip 高 10-15%"
    },
    "zip": {
        "name": "zip",
        "desc": "创建 zip 压缩包",
        "long_desc": "zip 是跨平台的压缩格式，与 Windows 兼容性好。",
        "category": "compression",
        "syntax": "zip [选项] 压缩包 文件",
        "options": [
            {"flag": "-r", "desc": "递归压缩目录"},
            {"flag": "-e", "desc": "加密压缩包"},
            {"flag": "-q", "desc": "静默模式"},
            {"flag": "-9", "desc": "最大压缩比"},
        ],
        "examples": [
            {"cmd": "zip archive.zip file1 file2", "desc": "创建 zip 压缩包"},
            {"cmd": "zip -r archive.zip dir/", "desc": "递归压缩目录"},
            {"cmd": "unzip archive.zip", "desc": "解压 zip 文件"},
        ],
        "usage_scenarios": [
            "与 Windows 交换文件",
            "需要加密的压缩",
            "简单的压缩需求"
        ],
        "related": ["unzip", "tar"],
        "tips": "zip 格式通用性好，适合跨平台交换"
    },
    "unzip": {
        "name": "unzip",
        "desc": "解压 zip 文件",
        "long_desc": "unzip 用于解压 .zip 格式的压缩文件。",
        "category": "compression",
        "syntax": "unzip [选项] 压缩包",
        "options": [
            {"flag": "-d 目录", "desc": "解压到指定目录"},
            {"flag": "-l", "desc": "列出内容不解压"},
            {"flag": "-o", "desc": "覆盖已有文件"},
            {"flag": "-q", "desc": "静默模式"},
        ],
        "examples": [
            {"cmd": "unzip archive.zip", "desc": "解压到当前目录"},
            {"cmd": "unzip archive.zip -d /tmp/extract", "desc": "解压到指定目录"},
            {"cmd": "unzip -l archive.zip", "desc": "查看压缩包内容"},
        ],
        "usage_scenarios": [
            "解压 zip 文件",
            "查看 zip 内容"
        ],
        "related": ["zip", "tar"],
        "tips": "unzip -l 可以快速查看内容不解压"
    },
    "xz": {
        "name": "xz",
        "desc": "高压缩比文件压缩",
        "long_desc": "xz 提供最高的压缩比，但压缩速度较慢，常用于压缩发行版镜像。",
        "category": "compression",
        "syntax": "xz [选项] 文件",
        "options": [
            {"flag": "-d", "desc": "解压"},
            {"flag": "-k", "desc": "保留原文件"},
            {"flag": "-T N", "desc": "使用 N 个线程"},
        ],
        "examples": [
            {"cmd": "xz file.txt", "desc": "压缩为 file.txt.xz"},
            {"cmd": "xz -d file.txt.xz", "desc": "解压"},
            {"cmd": "xz -k file.txt", "desc": "压缩但保留原文件"},
        ],
        "usage_scenarios": [
            "需要最高压缩比的场景",
            "压缩大文件"
        ],
        "related": ["unxz", "gzip", "bzip2"],
        "tips": "xz 压缩比最高但最慢，适合长期归档"
    },

    # ============ 新增软件包管理命令 (8个) ============
    "apt": {
        "name": "apt",
        "desc": "Debian/Ubuntu 包管理工具",
        "long_desc": "apt 是 Debian 系发行版的高级包管理工具，结合了 apt-get 和 apt-cache 的功能。",
        "category": "package",
        "syntax": "apt [选项] 命令",
        "options": [
            {"flag": "update", "desc": "更新包列表"},
            {"flag": "upgrade", "desc": "升级已安装的包"},
            {"flag": "install", "desc": "安装包"},
            {"flag": "remove", "desc": "删除包"},
            {"flag": "autoremove", "desc": "删除自动安装的依赖"},
            {"flag": "search", "desc": "搜索包"},
            {"flag": "show", "desc": "显示包信息"},
        ],
        "examples": [
            {"cmd": "sudo apt update", "desc": "更新包列表"},
            {"cmd": "sudo apt upgrade", "desc": "升级所有包"},
            {"cmd": "sudo apt install nginx", "desc": "安装 nginx"},
            {"cmd": "sudo apt remove nginx", "desc": "删除 nginx"},
            {"cmd": "apt search web server", "desc": "搜索 web 服务器"},
        ],
        "usage_scenarios": [
            "安装软件包",
            "系统更新升级",
            "管理软件包"
        ],
        "related": ["apt-get", "dpkg"],
        "tips": "apt 是新一代工具，推荐替代 apt-get"
    },
    "apt-get": {
        "name": "apt-get",
        "desc": "Debian/Ubuntu 包管理（传统）",
        "long_desc": "apt-get 是传统的包管理工具，功能与 apt 类似但输出更适合脚本。",
        "category": "package",
        "syntax": "apt-get [选项] 命令",
        "options": [
            {"flag": "update", "desc": "更新包列表"},
            {"flag": "upgrade", "desc": "升级包"},
            {"flag": "install", "desc": "安装包"},
            {"flag": "remove", "desc": "删除包"},
            {"flag": "purge", "desc": "删除包及配置文件"},
            {"flag": "autoremove", "desc": "删除不需要的依赖"},
        ],
        "examples": [
            {"cmd": "sudo apt-get update", "desc": "更新包列表"},
            {"cmd": "sudo apt-get install package", "desc": "安装包"},
            {"cmd": "sudo apt-get purge package", "desc": "彻底删除包"},
        ],
        "usage_scenarios": [
            "脚本中管理软件包",
            "服务器维护"
        ],
        "related": ["apt", "dpkg"],
        "tips": "交互式使用 apt，脚本使用 apt-get"
    },
    "yum": {
        "name": "yum",
        "desc": "RHEL/CentOS 包管理（旧版）",
        "long_desc": "yum 是 RHEL/CentOS 7 及以前版本的包管理工具。",
        "category": "package",
        "syntax": "yum [选项] 命令",
        "options": [
            {"flag": "install", "desc": "安装包"},
            {"flag": "remove", "desc": "删除包"},
            {"flag": "update", "desc": "更新包"},
            {"flag": "search", "desc": "搜索包"},
            {"flag": "info", "desc": "显示包信息"},
        ],
        "examples": [
            {"cmd": "sudo yum install nginx", "desc": "安装 nginx"},
            {"cmd": "sudo yum update", "desc": "更新所有包"},
            {"cmd": "yum search web", "desc": "搜索 web 相关包"},
        ],
        "usage_scenarios": [
            "CentOS/RHEL 7 及以前版本"
        ],
        "related": ["dnf", "rpm"],
        "tips": "新版 RHEL/CentOS 推荐使用 dnf"
    },
    "dnf": {
        "name": "dnf",
        "desc": "RHEL/CentOS 包管理（新版）",
        "long_desc": "dnf 是 yum 的下一代替代品，速度更快，依赖处理更好。",
        "category": "package",
        "syntax": "dnf [选项] 命令",
        "options": [
            {"flag": "install", "desc": "安装包"},
            {"flag": "remove", "desc": "删除包"},
            {"flag": "update", "desc": "更新包"},
            {"flag": "search", "desc": "搜索包"},
            {"flag": "info", "desc": "显示包信息"},
        ],
        "examples": [
            {"cmd": "sudo dnf install nginx", "desc": "安装 nginx"},
            {"cmd": "sudo dnf update", "desc": "更新所有包"},
            {"cmd": "dnf search web", "desc": "搜索 web 相关包"},
        ],
        "usage_scenarios": [
            "Fedora/RHEL 8+/CentOS 8 包管理"
        ],
        "related": ["yum", "rpm"],
        "tips": "dnf 是 yum 的现代替代品"
    },
    "pacman": {
        "name": "pacman",
        "desc": "Arch Linux 包管理",
        "long_desc": "pacman 是 Arch Linux 及其衍生版（Manjaro 等）的包管理工具。",
        "category": "package",
        "syntax": "pacman [选项] 操作",
        "options": [
            {"flag": "-S", "desc": "同步/安装包"},
            {"flag": "-R", "desc": "删除包"},
            {"flag": "-Sy", "desc": "更新包数据库"},
            {"flag": "-Su", "desc": "升级系统"},
            {"flag": "-Ss", "desc": "搜索包"},
            {"flag": "-Qi", "desc": "查询已安装包信息"},
        ],
        "examples": [
            {"cmd": "sudo pacman -S nginx", "desc": "安装 nginx"},
            {"cmd": "sudo pacman -Syu", "desc": "更新系统"},
            {"cmd": "pacman -Ss web", "desc": "搜索 web 相关包"},
        ],
        "usage_scenarios": [
            "Arch Linux 系统维护"
        ],
        "related": ["yay", "makepkg"],
        "tips": "pacman -Syu 是 Arch 更新系统的标准命令"
    },

    # ============ Shell脚本命令 (16个) ============
    "variable": {
        "name": "变量定义",
        "desc": "Shell变量的定义与使用",
        "long_desc": "Shell脚本中变量用于存储数据，定义时不需要声明类型，直接使用等号赋值。",
        "category": "shell",
        "syntax": "变量名=值",
        "options": [
            {"flag": "=", "desc": "赋值运算符，等号两边不能有空格"},
            {"flag": "$变量名", "desc": "使用$符号访问变量值"},
            {"flag": "${变量名}", "desc": "使用花括号明确变量边界"},
        ],
        "examples": [
            {"cmd": "name='John'", "desc": "定义变量name"},
            {"cmd": "echo $name", "desc": "输出变量值"},
            {"cmd": "age=25; echo $age", "desc": "定义并使用变量"},
            {"cmd": "path=/home/user; echo ${path}/docs", "desc": "变量与其他字符串连接"},
        ],
        "usage_scenarios": [
            "存储配置信息",
            "保存用户输入",
            "临时存储计算结果",
            "构建动态路径"
        ],
        "related": ["readonly", "unset", "special_variables"],
        "tips": "Shell变量默认都是字符串类型，等号两边不能有空格"
    },
    "special_variables": {
        "name": "特殊变量",
        "desc": "Shell内置的特殊变量",
        "long_desc": "Shell提供了多个特殊变量用于获取脚本名称、参数、状态等信息。",
        "category": "shell",
        "syntax": "$n, $#, $*, $@, $?, $$, $0",
        "options": [
            {"flag": "$0", "desc": "脚本名称"},
            {"flag": "$1-$9", "desc": "第1到第9个位置参数"},
            {"flag": "${10}", "desc": "第10个及以上的位置参数"},
            {"flag": "$#", "desc": "参数个数"},
            {"flag": "$*", "desc": "所有参数作为一个字符串"},
            {"flag": "$@", "desc": "所有参数作为多个字符串"},
            {"flag": "$?", "desc": "上一个命令的退出状态码"},
            {"flag": "$$", "desc": "当前进程ID"},
        ],
        "examples": [
            {"cmd": "echo $0", "desc": "显示脚本名"},
            {"cmd": "echo $1 $2", "desc": "显示第1、2个参数"},
            {"cmd": "echo $#", "desc": "显示参数总数"},
            {"cmd": "echo $?", "desc": "显示上条命令的退出码"},
        ],
        "usage_scenarios": [
            "获取命令行参数",
            "检查命令执行是否成功",
            "脚本自我引用"
        ],
        "related": ["shift"],
        "tips": "$? 为0表示成功，非0表示失败"
    },
    "readonly": {
        "name": "readonly",
        "desc": "定义只读变量",
        "long_desc": "readonly 用于定义不可修改的常量，防止变量被意外修改。",
        "category": "shell",
        "syntax": "readonly 变量名=值",
        "options": [
            {"flag": "-p", "desc": "显示所有只读变量"},
        ],
        "examples": [
            {"cmd": "readonly PI=3.14159", "desc": "定义常量PI"},
            {"cmd": "readonly name='John'", "desc": "定义只读变量"},
            {"cmd": "readonly -p", "desc": "列出所有只读变量"},
        ],
        "usage_scenarios": [
            "定义配置常量",
            "防止重要变量被修改"
        ],
        "related": ["variable"],
        "tips": "只读变量不能被修改或删除，直到脚本结束"
    },
    "unset": {
        "name": "unset",
        "desc": "删除变量或函数",
        "long_desc": "unset 用于删除已定义的变量或函数，释放内存空间。",
        "category": "shell",
        "syntax": "unset 变量名",
        "options": [
            {"flag": "-v", "desc": "删除变量（默认）"},
            {"flag": "-f", "desc": "删除函数"},
        ],
        "examples": [
            {"cmd": "unset name", "desc": "删除变量name"},
            {"cmd": "unset -f myfunc", "desc": "删除函数myfunc"},
        ],
        "usage_scenarios": [
            "清理不再使用的变量",
            "释放内存"
        ],
        "related": ["variable"],
        "tips": "unset不能删除只读变量"
    },
    "if": {
        "name": "if语句",
        "desc": "条件判断语句",
        "long_desc": "if语句用于根据条件执行不同的代码块，是Shell脚本中最基本的流程控制结构。",
        "category": "shell",
        "syntax": "if 条件; then 命令; elif 条件; then 命令; else 命令; fi",
        "options": [
            {"flag": "if", "desc": "开始条件判断"},
            {"flag": "then", "desc": "条件为真时执行的命令"},
            {"flag": "elif", "desc": "额外的条件分支"},
            {"flag": "else", "desc": "所有条件都不满足时执行"},
            {"flag": "fi", "desc": "结束if语句"},
        ],
        "examples": [
            {"cmd": "if [ $a -eq 5 ]; then echo '等于5'; fi", "desc": "简单if判断"},
            {"cmd": "if [ $a -gt 0 ]; then echo '正数'; else echo '负数'; fi", "desc": "if-else结构"},
            {"cmd": "if [ $a -eq 1 ]; then echo '1'; elif [ $a -eq 2 ]; then echo '2'; else echo '其他'; fi", "desc": "if-elif-else结构"},
        ],
        "usage_scenarios": [
            "根据条件执行不同操作",
            "错误处理",
            "参数验证"
        ],
        "related": ["test", "test_file", "test_string", "case"],
        "tips": "if和then可以写在一行用分号分隔，也可以写成多行"
    },
    "test": {
        "name": "test命令",
        "desc": "条件测试命令",
        "long_desc": "test命令用于测试条件是否成立，返回0表示真，非0表示假。也可以使用方括号[ ]简写。",
        "category": "shell",
        "syntax": "test 表达式 或 [ 表达式 ]",
        "options": [
            {"flag": "-eq", "desc": "数值相等(equal)"},
            {"flag": "-ne", "desc": "数值不相等(not equal)"},
            {"flag": "-gt", "desc": "大于(greater than)"},
            {"flag": "-lt", "desc": "小于(less than)"},
            {"flag": "-ge", "desc": "大于等于"},
            {"flag": "-le", "desc": "小于等于"},
            {"flag": "-a", "desc": "逻辑与(and)"},
            {"flag": "-o", "desc": "逻辑或(or)"},
            {"flag": "!", "desc": "逻辑非(not)"},
        ],
        "examples": [
            {"cmd": "test 5 -eq 5", "desc": "测试5等于5"},
            {"cmd": "[ $a -gt 10 ]", "desc": "测试变量a大于10"},
            {"cmd": "[ -f file.txt ]", "desc": "测试文件是否存在"},
            {"cmd": "[ $a -eq 5 -a $b -eq 3 ]", "desc": "逻辑与测试"},
        ],
        "usage_scenarios": [
            "数值比较",
            "文件测试",
            "字符串比较",
            "逻辑运算"
        ],
        "related": ["if", "test_file", "test_string"],
        "tips": "[ 是test的简写，但注意方括号前后要有空格"
    },
    "test_file": {
        "name": "文件测试",
        "desc": "文件属性测试运算符",
        "long_desc": "文件测试运算符用于检查文件的各种属性，如是否存在、类型、权限等。",
        "category": "shell",
        "syntax": "[ 选项 文件 ]",
        "options": [
            {"flag": "-e", "desc": "文件存在"},
            {"flag": "-f", "desc": "文件存在且是普通文件"},
            {"flag": "-d", "desc": "文件存在且是目录"},
            {"flag": "-r", "desc": "文件存在且可读"},
            {"flag": "-w", "desc": "文件存在且可写"},
            {"flag": "-x", "desc": "文件存在且可执行"},
            {"flag": "-s", "desc": "文件存在且大小非零"},
            {"flag": "-L", "desc": "文件存在且是符号链接"},
        ],
        "examples": [
            {"cmd": "[ -f file.txt ] && echo '存在'", "desc": "测试文件是否存在"},
            {"cmd": "[ -d /tmp ] && echo '是目录'", "desc": "测试是否是目录"},
            {"cmd": "[ -r file.txt ] && cat file.txt", "desc": "可读时才读取"},
            {"cmd": "[ -x script.sh ] && ./script.sh", "desc": "可执行时才执行"},
        ],
        "usage_scenarios": [
            "检查文件是否存在",
            "验证文件权限",
            "判断文件类型"
        ],
        "related": ["test", "if"],
        "tips": "使用&&和||可以组合多个条件测试"
    },
    "test_string": {
        "name": "字符串测试",
        "desc": "字符串比较运算符",
        "long_desc": "字符串测试用于比较两个字符串的关系，如相等、非空等。",
        "category": "shell",
        "syntax": "[ 字符串1 运算符 字符串2 ]",
        "options": [
            {"flag": "=", "desc": "字符串相等"},
            {"flag": "!=", "desc": "字符串不相等"},
            {"flag": "-z", "desc": "字符串长度为0（空串）"},
            {"flag": "-n", "desc": "字符串长度非0"},
        ],
        "examples": [
            {"cmd": "[ \"$str1\" = \"$str2\" ]", "desc": "比较两个字符串是否相等"},
            {"cmd": "[ -z \"$name\" ] && echo '名称为空'", "desc": "测试字符串是否为空"},
            {"cmd": "[ -n \"$name\" ] && echo '名称: $name'", "desc": "测试字符串非空"},
            {"cmd": "[ \"$a\" != \"$b\" ]", "desc": "测试字符串不相等"},
        ],
        "usage_scenarios": [
            "验证用户输入",
            "比较配置值",
            "检查参数是否为空"
        ],
        "related": ["test", "if"],
        "tips": "字符串变量建议加双引号，防止空值导致语法错误"
    },
    "for": {
        "name": "for循环",
        "desc": "遍历列表的循环结构",
        "long_desc": "for循环用于遍历列表中的每个元素，执行循环体。支持多种遍历方式。",
        "category": "shell",
        "syntax": "for 变量 in 列表; do 命令; done",
        "options": [
            {"flag": "in", "desc": "指定要遍历的列表"},
            {"flag": "do", "desc": "循环体开始"},
            {"flag": "done", "desc": "循环结束"},
        ],
        "examples": [
            {"cmd": "for i in 1 2 3; do echo $i; done", "desc": "遍历数字列表"},
            {"cmd": "for file in *.txt; do echo $file; done", "desc": "遍历所有txt文件"},
            {"cmd": "for i in {1..5}; do echo $i; done", "desc": "使用范围展开"},
            {"cmd": "for arg in $@; do echo $arg; done", "desc": "遍历所有参数"},
        ],
        "usage_scenarios": [
            "批量处理文件",
            "遍历参数列表",
            "生成序列",
            "遍历数组"
        ],
        "related": ["while", "until", "break_continue"],
        "tips": "for file in *.txt 可以遍历所有匹配的文件"
    },
    "while": {
        "name": "while循环",
        "desc": "条件循环结构",
        "long_desc": "while循环在条件为真时重复执行循环体，适用于不知道循环次数的场景。",
        "category": "shell",
        "syntax": "while 条件; do 命令; done",
        "options": [
            {"flag": "条件", "desc": "循环继续的条件"},
            {"flag": "do", "desc": "循环体开始"},
            {"flag": "done", "desc": "循环结束"},
        ],
        "examples": [
            {"cmd": "while [ $i -lt 10 ]; do echo $i; i=$((i+1)); done", "desc": "计数器循环"},
            {"cmd": "while read line; do echo $line; done < file.txt", "desc": "逐行读取文件"},
            {"cmd": "while true; do echo '循环'; sleep 1; done", "desc": "无限循环"},
        ],
        "usage_scenarios": [
            "读取文件内容",
            "等待条件满足",
            "无限循环任务"
        ],
        "related": ["for", "until", "break_continue"],
        "tips": "while read配合重定向是读取文件的常用方式"
    },
    "until": {
        "name": "until循环",
        "desc": "直到型循环结构",
        "long_desc": "until循环与while相反，在条件为假时执行循环体，直到条件为真才停止。",
        "category": "shell",
        "syntax": "until 条件; do 命令; done",
        "options": [
            {"flag": "条件", "desc": "循环停止的条件"},
            {"flag": "do", "desc": "循环体开始"},
            {"flag": "done", "desc": "循环结束"},
        ],
        "examples": [
            {"cmd": "until [ $i -ge 10 ]; do echo $i; i=$((i+1)); done", "desc": "计数器until循环"},
            {"cmd": "until ping -c1 google.com; do sleep 5; done", "desc": "等待网络恢复"},
        ],
        "usage_scenarios": [
            "等待某个事件发生",
            "重试直到成功"
        ],
        "related": ["while", "for"],
        "tips": "until条件为假时执行，条件为真时停止"
    },
    "break_continue": {
        "name": "break和continue",
        "desc": "循环控制语句",
        "long_desc": "break用于立即退出循环，continue用于跳过当前迭代继续下一次循环。",
        "category": "shell",
        "syntax": "break [n]; continue [n]",
        "options": [
            {"flag": "break", "desc": "跳出整个循环"},
            {"flag": "continue", "desc": "跳过本次循环剩余部分"},
            {"flag": "n", "desc": "指定跳出的循环层数"},
        ],
        "examples": [
            {"cmd": "for i in 1 2 3; do if [ $i -eq 2 ]; then break; fi; echo $i; done", "desc": "遇到2时退出循环"},
            {"cmd": "for i in 1 2 3; do if [ $i -eq 2 ]; then continue; fi; echo $i; done", "desc": "跳过2继续循环"},
        ],
        "usage_scenarios": [
            "提前退出循环",
            "跳过特定条件",
            "多层循环控制"
        ],
        "related": ["for", "while", "until"],
        "tips": "break 2可以跳出两层循环"
    },
    "case": {
        "name": "case语句",
        "desc": "多分支选择结构",
        "long_desc": "case语句用于多分支选择，根据变量值匹配不同的模式执行相应的代码块。",
        "category": "shell",
        "syntax": "case 变量 in 模式1) 命令;; 模式2) 命令;; esac",
        "options": [
            {"flag": "in", "desc": "开始模式匹配"},
            {"flag": ")", "desc": "模式结束"},
            {"flag": ";;", "desc": "代码块结束"},
            {"flag": "esac", "desc": "case语句结束"},
            {"flag": "*)", "desc": "默认匹配模式"},
        ],
        "examples": [
            {"cmd": "case $a in 1) echo '一';; 2) echo '二';; *) echo '其他';; esac", "desc": "简单的case判断"},
            {"cmd": "case $file in *.txt) echo '文本';; *.sh) echo '脚本';; *) echo '其他';; esac", "desc": "通配符匹配"},
            {"cmd": "case $ans in [Yy]*) echo '是';; [Nn]*) echo '否';; esac", "desc": "字符范围匹配"},
        ],
        "usage_scenarios": [
            "菜单选择",
            "参数处理",
            "文件类型判断"
        ],
        "related": ["if"],
        "tips": "*) 是默认分支，类似if中的else"
    },
    "shift": {
        "name": "shift",
        "desc": "参数移位",
        "long_desc": "shift命令将位置参数向左移动，$2变成$1，$3变成$2，用于处理不定数量的参数。",
        "category": "shell",
        "syntax": "shift [n]",
        "options": [
            {"flag": "n", "desc": "移动的位数，默认1"},
        ],
        "examples": [
            {"cmd": "shift", "desc": "参数左移一位"},
            {"cmd": "shift 2", "desc": "参数左移两位"},
            {"cmd": "while [ $# -gt 0 ]; do echo $1; shift; done", "desc": "遍历所有参数"},
        ],
        "usage_scenarios": [
            "处理不定数量参数",
            "命令行参数解析"
        ],
        "related": ["special_variables"],
        "tips": "shift会修改$1,$2等参数的值，常用于while循环处理参数"
    },
    "source": {
        "name": "source",
        "desc": "执行指定脚本文件",
        "long_desc": "source命令在当前shell环境中执行指定脚本，常用于加载配置文件或函数库。",
        "category": "shell",
        "syntax": "source 文件名 或 . 文件名",
        "options": [],
        "examples": [
            {"cmd": "source ~/.bashrc", "desc": "重新加载bash配置"},
            {"cmd": ". ./lib.sh", "desc": "加载函数库"},
            {"cmd": "source config.env", "desc": "加载环境变量配置"},
        ],
        "usage_scenarios": [
            "加载配置文件",
            "导入函数库",
            "设置环境变量"
        ],
        "related": ["exit"],
        "tips": "source和.是等价的，都是在当前shell执行，而非子shell"
    },
    "exit": {
        "name": "exit",
        "desc": "退出脚本",
        "long_desc": "exit命令用于终止脚本执行并返回退出状态码给父进程。",
        "category": "shell",
        "syntax": "exit [状态码]",
        "options": [
            {"flag": "0", "desc": "成功退出（默认）"},
            {"flag": "1-255", "desc": "错误退出，不同值表示不同错误"},
        ],
        "examples": [
            {"cmd": "exit 0", "desc": "成功退出"},
            {"cmd": "exit 1", "desc": "一般错误退出"},
            {"cmd": "[ -f file.txt ] || exit 1", "desc": "文件不存在则退出"},
        ],
        "usage_scenarios": [
            "正常结束脚本",
            "错误处理退出",
            "返回状态码"
        ],
        "related": ["source"],
        "tips": "exit 0表示成功，非0表示各种错误"
    },
}

# 按分类获取命令
def get_commands_by_category(category: str) -> dict:
    """获取指定分类的所有命令"""
    return {k: v for k, v in COMMAND_DB.items() if v["category"] == category}

# 搜索命令
def search_commands(keyword: str) -> dict:
    """根据关键字搜索命令"""
    keyword = keyword.lower()
    results = {}
    for name, cmd in COMMAND_DB.items():
        if (keyword in name.lower() or
            keyword in cmd["desc"].lower()):
            results[name] = cmd
    return results
