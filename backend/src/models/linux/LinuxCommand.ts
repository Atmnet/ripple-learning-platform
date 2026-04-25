/**
 * Linux 命令数据库
 * 包含 Linux / MySQL 学习命令的详细说明、选项和示例
 */
import { MYSQL_COMMAND_DB } from "./MySQLCommands";

export interface CommandOption {
  flag: string;
  desc: string;
}

export interface CommandExample {
  cmd: string;
  desc: string;
}

export interface LinuxCommand {
  name: string;
  desc: string;
  longDesc: string;
  category: string;
  syntax: string;
  options: CommandOption[];
  examples: CommandExample[];
  usageScenarios: string[];
  related: string[];
  tips?: string;
  note?: string;
}

export interface CategoryInfo {
  key: string;
  name: string;
  icon: string;
  description: string;
}

// 分类定义
export const CATEGORIES: Record<string, CategoryInfo> = {
  file: {
    key: "file",
    name: "文件管理",
    icon: "📁",
    description: "文件和目录的创建、查看、操作"
  },
  text: {
    key: "text",
    name: "文本处理",
    icon: "📝",
    description: "查看和处理文本文件内容"
  },
  system: {
    key: "system",
    name: "系统监控",
    icon: "⚙️",
    description: "系统信息查看和进程管理"
  },
  network: {
    key: "network",
    name: "网络工具",
    icon: "🌐",
    description: "网络连接和通信相关命令"
  },
  permission: {
    key: "permission",
    name: "权限管理",
    icon: "🔒",
    description: "文件权限和用户管理"
  },
  package: {
    key: "package",
    name: "软件包",
    icon: "📦",
    description: "软件包安装和管理"
  },
  compression: {
    key: "compression",
    name: "压缩归档",
    icon: "🗜️",
    description: "文件压缩和解压"
  },
  search: {
    key: "search",
    name: "搜索查找",
    icon: "🔍",
    description: "文件和内容搜索"
  },
  shell: {
    key: "shell",
    name: "Shell脚本",
    icon: "🐘",
    description: "Shell脚本编程基础，包括变量、条件判断、循环结构、case语句等"
  },
  mysql: {
    key: "mysql",
    name: "MySQL学习",
    icon: "🗃️",
    description: "数据库基础、SQL语句、表结构设计与数据操作"
  }
};

// 命令数据库
export const COMMAND_DB: Record<string, LinuxCommand> = {
  // ============ 文件管理命令 (16个) ============
  ls: {
    name: "ls",
    desc: "列出目录内容",
    longDesc: "ls (list) 是 Linux 中最常用的命令之一，用于显示指定目录中的文件和子目录列表。",
    category: "file",
    syntax: "ls [选项] [文件/目录]",
    options: [
      { flag: "-l", desc: "以长格式显示详细信息（权限、所有者、大小、修改时间）" },
      { flag: "-a", desc: "显示所有文件，包括隐藏文件（以.开头）" },
      { flag: "-h", desc: "以人类可读的方式显示文件大小（K, M, G）" },
      { flag: "-t", desc: "按修改时间排序（最新的在前）" },
      { flag: "-r", desc: "反向排序" },
      { flag: "-S", desc: "按文件大小排序（最大的在前）" },
      { flag: "-d", desc: "显示目录本身而非其内容" },
      { flag: "-1", desc: "每行只显示一个文件" },
      { flag: "--color", desc: "用颜色区分文件类型" }
    ],
    examples: [
      { cmd: "ls", desc: "列出当前目录的文件" },
      { cmd: "ls -la", desc: "详细列出所有文件（包括隐藏文件）" },
      { cmd: "ls -lh", desc: "详细列出，文件大小人类可读" },
      { cmd: "ls -lt", desc: "按时间排序详细列出" },
      { cmd: "ls -lhS", desc: "按大小排序显示详细信息" },
      { cmd: "ls -R /home", desc: "递归显示 /home 目录下所有文件" }
    ],
    usageScenarios: [
      "查看当前目录有哪些文件",
      "查看文件详细信息（权限、大小、时间）",
      "查找最近修改的文件",
      "查看隐藏配置文件"
    ],
    related: ["cd", "pwd", "tree"],
    tips: "ls -la 是查看目录内容最常用的组合命令"
  },
  cd: {
    name: "cd",
    desc: "切换当前工作目录",
    longDesc: "cd (change directory) 用于切换当前工作目录，是最基础也最常用的命令之一。",
    category: "file",
    syntax: "cd [目录]",
    options: [],
    examples: [
      { cmd: "cd /home", desc: "切换到 /home 目录" },
      { cmd: "cd ~", desc: "切换到用户主目录" },
      { cmd: "cd ..", desc: "切换到上级目录" },
      { cmd: "cd -", desc: "切换到上次所在的目录" },
      { cmd: "cd ~user", desc: "切换到指定用户的主目录" },
      { cmd: "cd /var/log", desc: "切换到系统日志目录" }
    ],
    usageScenarios: [
      "进入项目目录",
      "返回上级目录",
      "快速回到主目录",
      "在目录间快速切换"
    ],
    related: ["pwd", "ls"],
    tips: "cd - 可以快速在两个目录间来回切换"
  },
  pwd: {
    name: "pwd",
    desc: "显示当前工作目录的完整路径",
    longDesc: "pwd (print working directory) 显示当前所在位置的完整绝对路径。",
    category: "file",
    syntax: "pwd",
    options: [
      { flag: "-L", desc: "显示逻辑路径（包含符号链接）" },
      { flag: "-P", desc: "显示物理路径（解析所有符号链接）" }
    ],
    examples: [
      { cmd: "pwd", desc: "显示当前目录路径" },
      { cmd: "pwd -P", desc: "显示物理路径（去除符号链接）" }
    ],
    usageScenarios: [
      "确认当前所在位置",
      "复制当前路径用于其他操作",
      "在脚本中获取工作目录"
    ],
    related: ["cd", "ls"],
    tips: "pwd 的输出可以用 $(pwd) 嵌入到其他命令中"
  },
  mkdir: {
    name: "mkdir",
    desc: "创建目录",
    longDesc: "mkdir (make directory) 用于创建新的目录。可以一次创建多个目录，也可以递归创建多级目录。",
    category: "file",
    syntax: "mkdir [选项] 目录名",
    options: [
      { flag: "-p", desc: "递归创建目录（包括父目录），目录已存在时不报错" },
      { flag: "-v", desc: "显示创建过程" },
      { flag: "-m", desc: "设置目录权限" }
    ],
    examples: [
      { cmd: "mkdir test", desc: "创建 test 目录" },
      { cmd: "mkdir -p a/b/c", desc: "递归创建多级目录" },
      { cmd: "mkdir -p project/{src,docs,tests}", desc: "同时创建多个子目录" },
      { cmd: "mkdir -m 755 public", desc: "创建目录并设置权限" }
    ],
    usageScenarios: [
      "创建项目目录结构",
      "一次性创建多级嵌套目录",
      "批量创建多个目录"
    ],
    related: ["rmdir", "rm", "cd"],
    tips: "mkdir -p 是创建多级目录的必备选项"
  },
  rmdir: {
    name: "rmdir",
    desc: "删除空目录",
    longDesc: "rmdir (remove directory) 用于删除空目录。如果目录不为空，需要先清空目录内容。",
    category: "file",
    syntax: "rmdir [选项] 目录名",
    options: [
      { flag: "-p", desc: "递归删除父目录（父目录为空时）" },
      { flag: "-v", desc: "显示删除过程" }
    ],
    examples: [
      { cmd: "rmdir empty_dir", desc: "删除空目录" },
      { cmd: "rmdir -p a/b/c", desc: "删除 c 及其空父目录" }
    ],
    usageScenarios: [
      "删除空的临时目录",
      "清理空的项目目录"
    ],
    related: ["rm", "mkdir"],
    tips: "通常使用 rm -r 替代，可以删除非空目录"
  },
  rm: {
    name: "rm",
    desc: "删除文件或目录",
    longDesc: "rm (remove) 用于删除文件或目录。**注意：删除操作不可恢复，使用时务必小心！**",
    category: "file",
    syntax: "rm [选项] 文件/目录",
    options: [
      { flag: "-r", desc: "递归删除（用于删除目录及其内容）" },
      { flag: "-f", desc: "强制删除，不提示确认，忽略不存在的文件" },
      { flag: "-i", desc: "删除前提示确认" },
      { flag: "-v", desc: "显示删除过程" }
    ],
    examples: [
      { cmd: "rm file.txt", desc: "删除 file.txt 文件" },
      { cmd: "rm -r dir", desc: "删除 dir 目录及其内容" },
      { cmd: "rm -rf dir", desc: "强制递归删除（慎用！）" },
      { cmd: "rm -i *.log", desc: "删除日志文件前逐个确认" },
      { cmd: "rm -rf /", desc: "删除系统所有文件（**危险！**）" }
    ],
    usageScenarios: [
      "删除不需要的文件",
      "清理临时目录",
      "批量删除符合条件的文件"
    ],
    related: ["rmdir", "mv"],
    tips: "rm -rf / 会删除系统所有文件，是危险操作！"
  },
  cp: {
    name: "cp",
    desc: "复制文件或目录",
    longDesc: "cp (copy) 用于复制文件或目录。可以复制单个文件、多个文件，或递归复制整个目录。",
    category: "file",
    syntax: "cp [选项] 源文件 目标文件",
    options: [
      { flag: "-r", desc: "递归复制（用于复制目录）" },
      { flag: "-R", desc: "递归复制（同上，保留特殊文件）" },
      { flag: "-i", desc: "覆盖前提示确认" },
      { flag: "-v", desc: "显示复制过程" },
      { flag: "-p", desc: "保留文件属性（时间戳、权限等）" },
      { flag: "-f", desc: "强制覆盖" },
      { flag: "-a", desc: "归档模式，相当于 -dR --preserve=all" }
    ],
    examples: [
      { cmd: "cp file1.txt file2.txt", desc: "复制文件" },
      { cmd: "cp -r dir1 dir2", desc: "复制目录" },
      { cmd: "cp *.txt /backup/", desc: "复制所有 txt 文件到备份目录" },
      { cmd: "cp -a /src /dst", desc: "完整复制目录，保留所有属性" },
      { cmd: "cp -i file.txt /etc/", desc: "复制时如存在则提示确认" }
    ],
    usageScenarios: [
      "备份重要文件",
      "复制配置文件到指定位置",
      "批量复制文件"
    ],
    related: ["mv", "scp", "rsync"],
    tips: "cp -a 是备份目录的最佳选择，可保留所有属性"
  },
  mv: {
    name: "mv",
    desc: "移动或重命名文件/目录",
    longDesc: "mv (move) 用于移动文件或目录到新的位置，也可用于重命名文件/目录。",
    category: "file",
    syntax: "mv [选项] 源文件 目标文件",
    options: [
      { flag: "-i", desc: "覆盖前提示确认" },
      { flag: "-v", desc: "显示移动过程" },
      { flag: "-f", desc: "强制覆盖，不提示" },
      { flag: "-n", desc: "不覆盖已存在的文件" }
    ],
    examples: [
      { cmd: "mv old.txt new.txt", desc: "重命名文件" },
      { cmd: "mv file.txt /home/", desc: "移动文件到 /home 目录" },
      { cmd: "mv *.log /backup/", desc: "移动所有日志文件" },
      { cmd: "mv -i file.txt /etc/", desc: "移动时如存在则提示" }
    ],
    usageScenarios: [
      "重命名文件或目录",
      "移动文件到其他位置",
      "整理文件位置"
    ],
    related: ["cp", "rm"],
    tips: "mv 在同一目录下就是重命名，跨目录就是移动"
  },
  touch: {
    name: "touch",
    desc: "创建空文件或更新文件时间戳",
    longDesc: "touch 用于创建新的空文件，或更新已有文件的访问时间和修改时间。",
    category: "file",
    syntax: "touch [选项] 文件名",
    options: [
      { flag: "-a", desc: "只更新访问时间" },
      { flag: "-m", desc: "只修改修改时间" },
      { flag: "-t", desc: "使用指定时间戳" },
      { flag: "-c", desc: "文件不存在时不创建" }
    ],
    examples: [
      { cmd: "touch newfile.txt", desc: "创建空文件" },
      { cmd: "touch file.txt", desc: "更新 file.txt 的时间戳" },
      { cmd: "touch {1..10}.txt", desc: "批量创建 10 个空文件" },
      { cmd: "touch -t 202401011200 file.txt", desc: "设置特定时间戳" }
    ],
    usageScenarios: [
      "快速创建空文件",
      "更新文件时间戳",
      "批量创建测试文件"
    ],
    related: ["mkdir", "cat", "stat"],
    tips: "touch {1..10}.txt 可以批量创建多个空文件"
  },
  tree: {
    name: "tree",
    desc: "以树状图显示目录结构",
    longDesc: "tree 以层级树状结构显示目录和文件，直观展示项目结构。",
    category: "file",
    syntax: "tree [选项] [目录]",
    options: [
      { flag: "-L N", desc: "限制显示的层级深度为 N" },
      { flag: "-d", desc: "只显示目录，不显示文件" },
      { flag: "-a", desc: "显示所有文件（包括隐藏文件）" },
      { flag: "-I pattern", desc: "忽略匹配的文件" },
      { flag: "--du", desc: "显示目录大小" }
    ],
    examples: [
      { cmd: "tree", desc: "显示当前目录的树状结构" },
      { cmd: "tree -L 2", desc: "只显示两层深度" },
      { cmd: "tree -d", desc: "只显示目录结构" },
      { cmd: "tree -I 'node_modules|__pycache__'", desc: "忽略指定目录" }
    ],
    usageScenarios: [
      "查看项目目录结构",
      "生成文档中的目录树",
      "快速了解目录层级"
    ],
    related: ["ls", "find"],
    tips: "tree -L 2 是查看项目结构的最佳选择"
  },
  ln: {
    name: "ln",
    desc: "创建文件链接",
    longDesc: "ln (link) 用于创建硬链接或符号链接（软链接）。符号链接类似于 Windows 的快捷方式。",
    category: "file",
    syntax: "ln [选项] 源文件 链接文件",
    options: [
      { flag: "-s", desc: "创建符号链接（软链接）" },
      { flag: "-f", desc: "强制创建，如链接存在则删除" },
      { flag: "-i", desc: "链接存在时提示确认" },
      { flag: "-v", desc: "显示创建过程" }
    ],
    examples: [
      { cmd: "ln file.txt hardlink", desc: "创建硬链接" },
      { cmd: "ln -s /opt/app app-link", desc: "创建符号链接" },
      { cmd: "ln -sf target link", desc: "强制更新符号链接" }
    ],
    usageScenarios: [
      "创建文件快捷方式",
      "管理多版本软件",
      "配置文件统一管理"
    ],
    related: ["ls", "rm"],
    tips: "软链接可以跨文件系统，硬链接不行；删除源文件后软链接失效"
  },
  stat: {
    name: "stat",
    desc: "显示文件详细状态信息",
    longDesc: "stat 显示文件的详细元数据，包括大小、权限、时间戳、inode 等信息。",
    category: "file",
    syntax: "stat [选项] 文件",
    options: [
      { flag: "-f", desc: "显示文件系统信息" },
      { flag: "-c", desc: "自定义输出格式" },
      { flag: "-t", desc: "以简洁格式显示" }
    ],
    examples: [
      { cmd: "stat file.txt", desc: "显示文件的完整状态" },
      { cmd: "stat -c '%s' file.txt", desc: "只显示文件大小" },
      { cmd: "stat -c '%y %n' *.txt", desc: "显示所有 txt 文件的修改时间" }
    ],
    usageScenarios: [
      "查看文件完整元数据",
      "获取文件 inode 信息",
      "批量获取文件属性"
    ],
    related: ["ls", "file"],
    tips: "stat -c 配合格式化字符串可以精确获取所需信息"
  },
  file: {
    name: "file",
    desc: "识别文件类型",
    longDesc: "file 通过检查文件内容来判断文件类型，而不是依赖文件扩展名。",
    category: "file",
    syntax: "file [选项] 文件",
    options: [
      { flag: "-b", desc: "不显示文件名" },
      { flag: "-i", desc: "显示 MIME 类型" },
      { flag: "-f file", desc: "从文件中读取要检查的文件列表" }
    ],
    examples: [
      { cmd: "file document.pdf", desc: "识别文件类型" },
      { cmd: "file /bin/ls", desc: "查看可执行文件信息" },
      { cmd: "file -i *.txt", desc: "显示所有 txt 文件的 MIME 类型" }
    ],
    usageScenarios: [
      "确认文件真实类型",
      "检查可执行文件架构",
      "批量识别未知文件"
    ],
    related: ["ls", "stat"],
    tips: "file 检查文件内容，不依赖扩展名"
  },
  dd: {
    name: "dd",
    desc: "转换和复制文件",
    longDesc: "dd 是一个底层的文件复制和转换工具，常用于磁盘镜像、数据备份等操作。**使用不当可能破坏数据！**",
    category: "file",
    syntax: "dd [选项]",
    options: [
      { flag: "if=文件", desc: "输入文件" },
      { flag: "of=文件", desc: "输出文件" },
      { flag: "bs=N", desc: "设置块大小为 N 字节" },
      { flag: "count=N", desc: "只复制 N 个块" },
      { flag: "skip=N", desc: "跳过输入的前 N 个块" },
      { flag: "status=progress", desc: "显示进度" }
    ],
    examples: [
      { cmd: "dd if=input.txt of=output.txt", desc: "复制文件" },
      { cmd: "dd if=/dev/zero of=empty.img bs=1M count=100", desc: "创建 100MB 空文件" },
      { cmd: "dd if=/dev/sda of=disk.img bs=4M", desc: "备份整个磁盘" }
    ],
    usageScenarios: [
      "创建指定大小的空文件",
      "备份磁盘镜像",
      "低级别数据复制"
    ],
    related: ["cp", "cat"],
    tips: "dd 是危险命令，使用前要确认 if 和 of 参数！"
  },

  // ============ 文本处理命令 ============
  cat: {
    name: "cat",
    desc: "连接并显示文件内容",
    longDesc: "cat (concatenate) 用于连接文件并显示内容，是最常用的文件查看命令。适合查看小文件。",
    category: "text",
    syntax: "cat [选项] 文件",
    options: [
      { flag: "-n", desc: "显示所有行号" },
      { flag: "-b", desc: "显示行号（空行除外）" },
      { flag: "-s", desc: "将多个连续空行压缩为一行" },
      { flag: "-E", desc: "在每行末尾显示 $" },
      { flag: "-T", desc: "将 TAB 显示为 ^I" }
    ],
    examples: [
      { cmd: "cat file.txt", desc: "显示文件内容" },
      { cmd: "cat -n file.txt", desc: "带行号显示文件内容" },
      { cmd: "cat file1 file2 > combined.txt", desc: "合并多个文件" },
      { cmd: "cat > file.txt", desc: "从键盘输入创建文件（Ctrl+D 结束）" }
    ],
    usageScenarios: [
      "查看小文件内容",
      "合并多个文件",
      "创建简单文件"
    ],
    related: ["less", "more", "head", "tail"],
    tips: "cat 适合小文件，大文件请用 less 或 more"
  },
  head: {
    name: "head",
    desc: "显示文件开头部分",
    longDesc: "head 默认显示文件前 10 行，可查看文件开头内容或日志文件的开头部分。",
    category: "text",
    syntax: "head [选项] 文件",
    options: [
      { flag: "-n N", desc: "显示前 N 行" },
      { flag: "-c N", desc: "显示前 N 字节" },
      { flag: "-q", desc: "不显示文件名" }
    ],
    examples: [
      { cmd: "head file.txt", desc: "显示文件前 10 行" },
      { cmd: "head -n 5 file.txt", desc: "显示文件前 5 行" },
      { cmd: "head -n 20 *.log", desc: "显示所有日志文件前 20 行" }
    ],
    usageScenarios: [
      "快速查看文件开头",
      "查看日志文件头部",
      "提取文件前几行"
    ],
    related: ["tail", "cat", "less"],
    tips: "head -n -5 可以显示除最后 5 行外的所有内容"
  },
  tail: {
    name: "tail",
    desc: "显示文件结尾部分",
    longDesc: "tail 默认显示文件最后 10 行，常用于查看日志文件。支持实时监控文件变化。",
    category: "text",
    syntax: "tail [选项] 文件",
    options: [
      { flag: "-n N", desc: "显示最后 N 行" },
      { flag: "-f", desc: "实时追踪文件新增内容（监控日志）" },
      { flag: "-F", desc: "类似 -f，但文件被删除或重建时继续追踪" },
      { flag: "-c N", desc: "显示最后 N 字节" }
    ],
    examples: [
      { cmd: "tail file.txt", desc: "显示文件最后 10 行" },
      { cmd: "tail -f log.txt", desc: "实时查看日志文件" },
      { cmd: "tail -n 100 app.log | head -20", desc: "查看日志第 81-100 行" }
    ],
    usageScenarios: [
      "查看日志文件最新内容",
      "实时监控日志输出",
      "查看文件末尾内容"
    ],
    related: ["head", "less", "grep"],
    tips: "tail -f 是查看实时日志的神器，按 Ctrl+C 退出"
  },
  less: {
    name: "less",
    desc: "分页查看文件内容",
    longDesc: "less 是一个分页查看器，适合查看大文件。支持向前/向后滚动、搜索等功能。",
    category: "text",
    syntax: "less [选项] 文件",
    options: [
      { flag: "-N", desc: "显示行号" },
      { flag: "-i", desc: "搜索时忽略大小写" },
      { flag: "-S", desc: "截断长行（不换行）" },
      { flag: "-F", desc: "文件内容少于一屏时直接退出" }
    ],
    examples: [
      { cmd: "less file.txt", desc: "分页查看大文件" },
      { cmd: "less +F log.txt", desc: "类似 tail -f，可实时查看" },
      { cmd: "less -N file.txt", desc: "带行号查看" }
    ],
    usageScenarios: [
      "查看大文件内容",
      "浏览日志文件",
      "查看手册页"
    ],
    related: ["more", "cat", "head"],
    note: "在 less 中: 空格-下一页, b-上一页, q-退出, /-搜索, n-下一个匹配, N-上一个匹配",
    tips: "按 / 输入关键词搜索，按 n 跳到下一个匹配"
  },
  grep: {
    name: "grep",
    desc: "在文件中搜索匹配的文本",
    longDesc: "grep (global regular expression print) 是强大的文本搜索工具，支持正则表达式，是文本处理的核心工具。",
    category: "text",
    syntax: "grep [选项] 模式 文件",
    options: [
      { flag: "-i", desc: "忽略大小写" },
      { flag: "-n", desc: "显示行号" },
      { flag: "-r", desc: "递归搜索目录" },
      { flag: "-v", desc: "显示不匹配的行（反向匹配）" },
      { flag: "-c", desc: "只显示匹配行数" },
      { flag: "-l", desc: "只显示包含匹配的文件名" },
      { flag: "-w", desc: "只匹配整个单词" },
      { flag: "-E", desc: "使用扩展正则表达式" },
      { flag: "-o", desc: "只显示匹配的部分" },
      { flag: "--color", desc: "高亮显示匹配内容" }
    ],
    examples: [
      { cmd: "grep 'hello' file.txt", desc: "在文件中搜索 hello" },
      { cmd: "grep -i 'hello' file.txt", desc: "忽略大小写搜索" },
      { cmd: "grep -rn 'pattern' /path", desc: "递归搜索目录" },
      { cmd: "grep -v 'error' log.txt", desc: "显示不含 error 的行" },
      { cmd: "grep -E '^[0-9]+$' file.txt", desc: "使用正则表达式匹配纯数字行" }
    ],
    usageScenarios: [
      "在日志中查找错误信息",
      "在代码中搜索特定函数",
      "过滤命令输出",
      "批量搜索多个文件"
    ],
    related: ["egrep", "fgrep", "awk", "sed"],
    tips: "grep --color=auto 可以高亮显示匹配内容"
  },
  wc: {
    name: "wc",
    desc: "统计文件的行数、字数、字节数",
    longDesc: "wc (word count) 用于统计文件中的行数、单词数和字节数，是分析文件内容的基础工具。",
    category: "text",
    syntax: "wc [选项] 文件",
    options: [
      { flag: "-l", desc: "只统计行数" },
      { flag: "-w", desc: "只统计字数（单词数）" },
      { flag: "-c", desc: "只统计字节数" },
      { flag: "-m", desc: "只统计字符数" },
      { flag: "-L", desc: "显示最长行的长度" }
    ],
    examples: [
      { cmd: "wc file.txt", desc: "统计行数、字数、字节数" },
      { cmd: "wc -l file.txt", desc: "统计文件行数" },
      { cmd: "ls -la | wc -l", desc: "统计目录中文件数量" },
      { cmd: "wc -l *.py", desc: "统计所有 Python 文件的行数" }
    ],
    usageScenarios: [
      "统计代码行数",
      "统计日志条目数",
      "分析文件大小"
    ],
    related: ["cat", "grep"],
    tips: "wc -l 是统计行数最常用的命令"
  },
  more: {
    name: "more",
    desc: "分页查看文件内容",
    longDesc: "more 是一个简单的分页查看器，只能向前滚动，适合快速查看文件。",
    category: "text",
    syntax: "more 文件",
    options: [
      { flag: "-N", desc: "每屏显示 N 行" },
      { flag: "+N", desc: "从第 N 行开始显示" }
    ],
    examples: [
      { cmd: "more file.txt", desc: "分页查看文件" },
      { cmd: "ls -la | more", desc: "管道输出到 more 分页显示" }
    ],
    usageScenarios: [
      "简单分页查看",
      "管道输出分页"
    ],
    related: ["less", "cat"],
    note: "按空格下一页，按回车下一行，q 退出",
    tips: "现代系统推荐使用 less 替代 more"
  },
  sort: {
    name: "sort",
    desc: "对文本行进行排序",
    longDesc: "sort 用于对文本文件的行进行排序，支持多种排序方式和字段选择。",
    category: "text",
    syntax: "sort [选项] 文件",
    options: [
      { flag: "-r", desc: "反向排序" },
      { flag: "-n", desc: "按数字排序" },
      { flag: "-k N", desc: "按第 N 列排序" },
      { flag: "-t", desc: "指定分隔符" },
      { flag: "-u", desc: "去重（唯一）" },
      { flag: "-f", desc: "忽略大小写" }
    ],
    examples: [
      { cmd: "sort file.txt", desc: "按字母顺序排序" },
      { cmd: "sort -n numbers.txt", desc: "按数字大小排序" },
      { cmd: "sort -k 2 -t ',' data.csv", desc: "按 CSV 第 2 列排序" },
      { cmd: "sort -r file.txt", desc: "反向排序" }
    ],
    usageScenarios: [
      "排序日志文件",
      "整理数据文件",
      "按特定字段排序"
    ],
    related: ["uniq", "awk"],
    tips: "sort 配合 uniq 可以去重排序"
  },
  uniq: {
    name: "uniq",
    desc: "报告或删除重复行",
    longDesc: "uniq 用于报告或删除文件中相邻的重复行。通常需要先 sort 排序。",
    category: "text",
    syntax: "uniq [选项] 文件",
    options: [
      { flag: "-c", desc: "统计每行出现的次数" },
      { flag: "-d", desc: "只显示重复的行" },
      { flag: "-u", desc: "只显示唯一的行" },
      { flag: "-i", desc: "忽略大小写" }
    ],
    examples: [
      { cmd: "uniq file.txt", desc: "删除相邻重复行" },
      { cmd: "sort file.txt | uniq", desc: "完整去重" },
      { cmd: "sort file.txt | uniq -c", desc: "统计每行出现次数" },
      { cmd: "sort file.txt | uniq -d", desc: "只显示重复的行" }
    ],
    usageScenarios: [
      "统计词频",
      "去重日志条目",
      "找出重复记录"
    ],
    related: ["sort", "wc"],
    tips: "uniq 只能去除相邻重复，通常需要先 sort"
  },
  cut: {
    name: "cut",
    desc: "提取文本列",
    longDesc: "cut 用于从每行中提取指定的列，常用于处理 CSV、日志等结构化数据。",
    category: "text",
    syntax: "cut [选项] 文件",
    options: [
      { flag: "-d", desc: "指定分隔符" },
      { flag: "-f N", desc: "提取第 N 个字段" },
      { flag: "-c N", desc: "提取第 N 个字符" },
      { flag: "-b N", desc: "提取第 N 个字节" }
    ],
    examples: [
      { cmd: "cut -d':' -f1 /etc/passwd", desc: "提取用户名" },
      { cmd: "cut -c1-10 file.txt", desc: "提取每行前 10 个字符" },
      { cmd: "cut -f1,3 data.csv", desc: "提取第 1 和 3 列" }
    ],
    usageScenarios: [
      "提取 CSV 列",
      "处理日志字段",
      "提取特定字符范围"
    ],
    related: ["awk", "sed"],
    tips: "cut -d'分隔符' -f列号 是标准用法"
  },
  awk: {
    name: "awk",
    desc: "文本处理编程语言",
    longDesc: "awk 是强大的文本处理工具，支持模式匹配、字段处理、计算等功能。",
    category: "text",
    syntax: "awk '模式 {动作}' 文件",
    options: [
      { flag: "-F", desc: "指定字段分隔符" },
      { flag: "-v", desc: "定义变量" }
    ],
    examples: [
      { cmd: "awk '{print $1}' file.txt", desc: "打印第一列" },
      { cmd: "awk -F':' '{print $1}' /etc/passwd", desc: "按冒号分隔，打印第一列" },
      { cmd: "awk '{sum+=$1} END {print sum}' file.txt", desc: "求第一列的和" },
      { cmd: "awk '/error/ {print $0}' log.txt", desc: "打印包含 error 的行" }
    ],
    usageScenarios: [
      "提取和格式化数据",
      "简单计算和统计",
      "复杂文本处理"
    ],
    related: ["sed", "grep", "cut"],
    tips: "$0 表示整行，$1 $2 表示第 1、2 个字段"
  },
  sed: {
    name: "sed",
    desc: "流编辑器",
    longDesc: "sed (stream editor) 是流编辑器，用于对文本进行过滤和转换。",
    category: "text",
    syntax: "sed [选项] '命令' 文件",
    options: [
      { flag: "-i", desc: "直接修改文件" },
      { flag: "-n", desc: "静默模式，只打印指定行" },
      { flag: "-e", desc: "执行多个命令" }
    ],
    examples: [
      { cmd: "sed 's/old/new/' file.txt", desc: "替换每行第一个 old 为 new" },
      { cmd: "sed 's/old/new/g' file.txt", desc: "替换所有 old 为 new" },
      { cmd: "sed -i 's/foo/bar/g' file.txt", desc: "直接修改文件" },
      { cmd: "sed '2d' file.txt", desc: "删除第 2 行" },
      { cmd: "sed -n '5,10p' file.txt", desc: "打印第 5-10 行" }
    ],
    usageScenarios: [
      "批量替换文本",
      "删除指定行",
      "提取特定行"
    ],
    related: ["awk", "grep", "tr"],
    tips: "sed 's/旧/新/g' 是最常用的替换语法"
  },
  tr: {
    name: "tr",
    desc: "字符转换",
    longDesc: "tr (translate) 用于转换或删除字符，常用于大小写转换、删除特定字符等。",
    category: "text",
    syntax: "tr [选项] 字符集1 字符集2",
    options: [
      { flag: "-d", desc: "删除字符" },
      { flag: "-s", desc: "压缩重复字符" },
      { flag: "-t", desc: "截断字符集1 到字符集2 的长度" }
    ],
    examples: [
      { cmd: "echo 'HELLO' | tr 'A-Z' 'a-z'", desc: "大写转小写" },
      { cmd: "tr -d '0-9' < file.txt", desc: "删除所有数字" },
      { cmd: "tr -s ' ' < file.txt", desc: "压缩多个空格为单个" }
    ],
    usageScenarios: [
      "大小写转换",
      "删除特定字符",
      "字符替换"
    ],
    related: ["sed", "awk"],
    tips: "tr 只能处理单字符替换，复杂替换用 sed"
  },
  tee: {
    name: "tee",
    desc: "读取并输出到多个目标",
    longDesc: "tee 从标准输入读取数据，同时输出到标准输出和文件。名字来源于 T 形管。",
    category: "text",
    syntax: "tee [选项] 文件",
    options: [
      { flag: "-a", desc: "追加到文件而不是覆盖" },
      { flag: "-i", desc: "忽略中断信号" }
    ],
    examples: [
      { cmd: "echo 'hello' | tee file.txt", desc: "输出到屏幕并写入文件" },
      { cmd: "ls -la | tee output.txt", desc: "显示 ls 输出并保存" },
      { cmd: "command | tee -a log.txt", desc: "追加到日志文件" }
    ],
    usageScenarios: [
      "保存命令输出同时查看",
      "记录命令执行过程",
      "多路输出"
    ],
    related: ["cat", "redirect"],
    tips: "tee 可以在管道中保存中间结果"
  },
  xargs: {
    name: "xargs",
    desc: "从标准输入构建并执行命令",
    longDesc: "xargs 从标准输入读取参数，构建并执行命令。常用于处理大量文件。",
    category: "text",
    syntax: "xargs [选项] 命令",
    options: [
      { flag: "-n N", desc: "每次使用 N 个参数" },
      { flag: "-P N", desc: "使用 N 个进程并行执行" },
      { flag: "-I {}", desc: "使用 {} 作为占位符" },
      { flag: "-0", desc: "以 null 字符分隔输入" }
    ],
    examples: [
      { cmd: "find . -name '*.txt' | xargs rm", desc: "删除所有 txt 文件" },
      { cmd: "cat files.txt | xargs -I {} cp {} /backup/", desc: "批量复制文件" },
      { cmd: "echo 1 2 3 | xargs -n1 echo", desc: "每行输出一个数字" }
    ],
    usageScenarios: [
      "处理 find 的结果",
      "批量执行命令",
      "并行处理任务"
    ],
    related: ["find", "exec"],
    tips: "xargs -I {} 可以自定义占位符位置"
  },

  // ============ 系统监控命令 (12个) ============
  ps: {
    name: "ps",
    desc: "显示进程状态",
    longDesc: "ps (process status) 显示当前系统的进程信息。",
    category: "system",
    syntax: "ps [选项]",
    options: [
      { flag: "aux", desc: "显示所有用户的所有进程（BSD格式）" },
      { flag: "-ef", desc: "显示所有进程的完整信息（标准格式）" },
      { flag: "-u user", desc: "显示指定用户的进程" },
      { flag: "-p pid", desc: "显示指定PID的进程" }
    ],
    examples: [
      { cmd: "ps aux", desc: "显示所有进程" },
      { cmd: "ps aux | grep nginx", desc: "查找nginx进程" },
      { cmd: "ps -ef", desc: "标准格式显示所有进程" }
    ],
    usageScenarios: [
      "查看当前运行的进程",
      "查找特定进程",
      "查看进程资源使用"
    ],
    related: ["top", "htop", "kill", "pgrep"]
  },
  top: {
    name: "top",
    desc: "实时显示进程状态",
    longDesc: "top 实时显示系统中各个进程的资源占用情况，是系统监控的核心工具。",
    category: "system",
    syntax: "top [选项]",
    options: [
      { flag: "-d N", desc: "设置刷新间隔为 N 秒" },
      { flag: "-p pid", desc: "监控指定进程" },
      { flag: "-u user", desc: "只显示指定用户的进程" }
    ],
    examples: [
      { cmd: "top", desc: "启动实时监控" },
      { cmd: "top -p 1234", desc: "监控PID 1234的进程" }
    ],
    usageScenarios: [
      "监控系统资源使用",
      "找出占用CPU/内存高的进程",
      "实时进程管理"
    ],
    related: ["htop", "ps", "free"],
    note: "在top中: P-按CPU排序, M-按内存排序, k-杀死进程, q-退出"
  },
  htop: {
    name: "htop",
    desc: "交互式进程查看器",
    longDesc: "htop 是 top 的增强版，提供彩色界面、鼠标支持和更友好的交互。",
    category: "system",
    syntax: "htop",
    options: [],
    examples: [
      { cmd: "htop", desc: "启动交互式进程查看器" }
    ],
    usageScenarios: [
      "交互式进程管理",
      "直观监控系统资源"
    ],
    related: ["top"],
    tips: "按F1-F10可使用各种功能，方向键导航"
  },
  kill: {
    name: "kill",
    desc: "终止进程",
    longDesc: "kill 向进程发送信号，默认发送终止信号(SIGTERM)。",
    category: "system",
    syntax: "kill [信号] PID",
    options: [
      { flag: "-9", desc: "强制终止(SIGKILL)" },
      { flag: "-15", desc: "正常终止(SIGTERM，默认)" },
      { flag: "-l", desc: "列出所有信号" }
    ],
    examples: [
      { cmd: "kill 1234", desc: "终止PID 1234的进程" },
      { cmd: "kill -9 1234", desc: "强制终止进程" },
      { cmd: "killall firefox", desc: "终止所有firefox进程" }
    ],
    usageScenarios: [
      "终止卡死的进程",
      "停止后台服务",
      "进程管理"
    ],
    related: ["pkill", "killall", "pgrep"],
    tips: "kill -9 是最后手段，可能丢失数据"
  },
  df: {
    name: "df",
    desc: "显示磁盘空间使用情况",
    longDesc: "df (disk free) 显示文件系统的磁盘空间使用情况。",
    category: "system",
    syntax: "df [选项] [文件]",
    options: [
      { flag: "-h", desc: "以人类可读格式显示" },
      { flag: "-T", desc: "显示文件系统类型" },
      { flag: "-i", desc: "显示inode信息" }
    ],
    examples: [
      { cmd: "df -h", desc: "以人类可读格式显示磁盘空间" },
      { cmd: "df -T", desc: "显示文件系统类型" }
    ],
    usageScenarios: [
      "检查磁盘剩余空间",
      "查看文件系统类型"
    ],
    related: ["du", "lsblk"]
  },
  du: {
    name: "du",
    desc: "显示目录或文件磁盘使用量",
    longDesc: "du (disk usage) 显示文件和目录占用的磁盘空间。",
    category: "system",
    syntax: "du [选项] [文件/目录]",
    options: [
      { flag: "-h", desc: "以人类可读格式显示" },
      { flag: "-s", desc: "只显示总计" },
      { flag: "-a", desc: "显示所有文件和目录" },
      { flag: "--max-depth=N", desc: "限制显示层级" }
    ],
    examples: [
      { cmd: "du -sh /home", desc: "显示/home目录总大小" },
      { cmd: "du -h --max-depth=1", desc: "显示当前目录下各子目录大小" }
    ],
    usageScenarios: [
      "查看目录占用空间",
      "找出大文件或目录"
    ],
    related: ["df", "ncdu"]
  },
  free: {
    name: "free",
    desc: "显示内存使用情况",
    longDesc: "free 显示系统内存和交换分区的使用情况。",
    category: "system",
    syntax: "free [选项]",
    options: [
      { flag: "-h", desc: "以人类可读格式显示" },
      { flag: "-m", desc: "以MB显示" },
      { flag: "-g", desc: "以GB显示" },
      { flag: "-s N", desc: "每N秒刷新一次" }
    ],
    examples: [
      { cmd: "free -h", desc: "以人类可读格式显示内存" }
    ],
    usageScenarios: [
      "检查可用内存",
      "监控内存使用"
    ],
    related: ["top", "vmstat"]
  },
  uptime: {
    name: "uptime",
    desc: "显示系统运行时间和负载",
    longDesc: "uptime 显示系统已运行时间、当前时间和平均负载。",
    category: "system",
    syntax: "uptime",
    options: [],
    examples: [
      { cmd: "uptime", desc: "显示系统运行时间" }
    ],
    usageScenarios: [
      "查看系统已运行多久",
      "检查系统负载"
    ],
    related: ["w", "who"]
  },
  uname: {
    name: "uname",
    desc: "显示系统信息",
    longDesc: "uname 显示系统内核信息。",
    category: "system",
    syntax: "uname [选项]",
    options: [
      { flag: "-a", desc: "显示所有信息" },
      { flag: "-r", desc: "显示内核版本" },
      { flag: "-n", desc: "显示主机名" }
    ],
    examples: [
      { cmd: "uname -a", desc: "显示所有系统信息" },
      { cmd: "uname -r", desc: "显示内核版本" }
    ],
    usageScenarios: [
      "查看系统版本",
      "获取内核信息"
    ],
    related: ["hostname"]
  },
  whoami: {
    name: "whoami",
    desc: "显示当前用户名",
    longDesc: "whoami 显示当前有效的用户名。",
    category: "system",
    syntax: "whoami",
    options: [],
    examples: [
      { cmd: "whoami", desc: "显示当前用户名" }
    ],
    usageScenarios: [
      "确认当前用户身份"
    ],
    related: ["who", "w", "id"]
  },
  which: {
    name: "which",
    desc: "查找命令位置",
    longDesc: "which 在PATH中查找可执行文件的路径。",
    category: "system",
    syntax: "which [选项] 命令",
    options: [],
    examples: [
      { cmd: "which python", desc: "查找python命令位置" },
      { cmd: "which -a python", desc: "查找所有匹配的python" }
    ],
    usageScenarios: [
      "查找命令安装位置",
      "确认使用的命令版本"
    ],
    related: ["whereis", "type"]
  },
  whereis: {
    name: "whereis",
    desc: "查找命令的二进制、源码和手册页",
    longDesc: "whereis 查找命令相关文件的位置。",
    category: "system",
    syntax: "whereis [选项] 命令",
    options: [],
    examples: [
      { cmd: "whereis ls", desc: "查找ls命令相关文件" }
    ],
    usageScenarios: [
      "查找命令的完整位置",
      "查找手册页位置"
    ],
    related: ["which", "man"]
  },

  // ============ 网络工具命令 (12个) ============
  ping: {
    name: "ping",
    desc: "测试网络连通性",
    longDesc: "ping 发送ICMP回显请求测试网络连通性和延迟。",
    category: "network",
    syntax: "ping [选项] 主机",
    options: [
      { flag: "-c N", desc: "发送N个数据包后停止" },
      { flag: "-i N", desc: "间隔N秒发送" },
      { flag: "-s N", desc: "设置数据包大小" }
    ],
    examples: [
      { cmd: "ping baidu.com", desc: "持续ping百度" },
      { cmd: "ping -c 4 baidu.com", desc: "ping 4次后停止" }
    ],
    usageScenarios: [
      "测试网络连通性",
      "检测网络延迟"
    ],
    related: ["traceroute", "curl"]
  },
  curl: {
    name: "curl",
    desc: "数据传输工具",
    longDesc: "curl 是一个强大的命令行工具，用于在客户端与服务器之间传输数据。",
    category: "network",
    syntax: "curl [选项] URL",
    options: [
      { flag: "-O", desc: "使用远程文件名保存" },
      { flag: "-o file", desc: "指定保存文件名" },
      { flag: "-L", desc: "跟随重定向" },
      { flag: "-I", desc: "只获取响应头" },
      { flag: "-s", desc: "静默模式" }
    ],
    examples: [
      { cmd: "curl https://api.example.com", desc: "获取URL内容" },
      { cmd: "curl -O http://example.com/file.zip", desc: "下载文件" },
      { cmd: "curl -X POST -d 'key=value' URL", desc: "发送POST请求" }
    ],
    usageScenarios: [
      "测试API接口",
      "下载文件",
      "发送HTTP请求"
    ],
    related: ["wget", "httpie"]
  },
  wget: {
    name: "wget",
    desc: "非交互式网络下载工具",
    longDesc: "wget 用于从网络下载文件，支持HTTP、HTTPS、FTP协议。",
    category: "network",
    syntax: "wget [选项] URL",
    options: [
      { flag: "-O file", desc: "指定输出文件名" },
      { flag: "-c", desc: "断点续传" },
      { flag: "-b", desc: "后台下载" },
      { flag: "--limit-rate", desc: "限制下载速度" }
    ],
    examples: [
      { cmd: "wget http://example.com/file.zip", desc: "下载文件" },
      { cmd: "wget -c http://example.com/file.zip", desc: "断点续传" }
    ],
    usageScenarios: [
      "下载文件",
      "批量下载",
      "断点续传"
    ],
    related: ["curl", "axel"]
  },
  ssh: {
    name: "ssh",
    desc: "安全远程登录",
    longDesc: "ssh (Secure Shell) 提供加密的远程登录和命令执行。",
    category: "network",
    syntax: "ssh [选项] [user@]host [命令]",
    options: [
      { flag: "-p port", desc: "指定端口" },
      { flag: "-i file", desc: "指定私钥文件" },
      { flag: "-v", desc: "显示详细信息" }
    ],
    examples: [
      { cmd: "ssh user@192.168.1.1", desc: "远程登录服务器" },
      { cmd: "ssh -p 2222 user@host", desc: "指定端口登录" }
    ],
    usageScenarios: [
      "远程服务器管理",
      "安全登录远程主机"
    ],
    related: ["scp", "sftp"]
  },
  scp: {
    name: "scp",
    desc: "安全复制文件",
    longDesc: "scp 基于SSH在主机间安全复制文件。",
    category: "network",
    syntax: "scp [选项] 源文件 目标文件",
    options: [
      { flag: "-r", desc: "递归复制目录" },
      { flag: "-P port", desc: "指定端口" },
      { flag: "-i file", desc: "指定私钥" }
    ],
    examples: [
      { cmd: "scp file.txt user@host:/path/", desc: "复制文件到远程" },
      { cmd: "scp -r dir/ user@host:/path/", desc: "复制目录到远程" }
    ],
    usageScenarios: [
      "在主机间传输文件",
      "安全文件复制"
    ],
    related: ["ssh", "rsync"]
  },
  netstat: {
    name: "netstat",
    desc: "显示网络连接、路由表、接口统计",
    longDesc: "netstat 显示网络相关信息。",
    category: "network",
    syntax: "netstat [选项]",
    options: [
      { flag: "-t", desc: "显示TCP连接" },
      { flag: "-u", desc: "显示UDP连接" },
      { flag: "-l", desc: "显示监听端口" },
      { flag: "-n", desc: "显示数字地址" },
      { flag: "-p", desc: "显示进程信息" }
    ],
    examples: [
      { cmd: "netstat -tuln", desc: "显示所有监听端口" },
      { cmd: "netstat -anp", desc: "显示所有连接和进程" }
    ],
    usageScenarios: [
      "查看网络连接",
      "查看监听端口"
    ],
    related: ["ss", "lsof"]
  },
  ss: {
    name: "ss",
    desc: "套接字统计工具",
    longDesc: "ss 是 netstat 的现代替代品，速度更快。",
    category: "network",
    syntax: "ss [选项]",
    options: [
      { flag: "-t", desc: "显示TCP" },
      { flag: "-u", desc: "显示UDP" },
      { flag: "-l", desc: "显示监听" },
      { flag: "-n", desc: "不解析服务名" },
      { flag: "-p", desc: "显示进程" }
    ],
    examples: [
      { cmd: "ss -tlnp", desc: "显示TCP监听端口" },
      { cmd: "ss -s", desc: "显示统计信息" }
    ],
    usageScenarios: [
      "查看套接字信息",
      "替代netstat"
    ],
    related: ["netstat"]
  },
  traceroute: {
    name: "traceroute",
    desc: "追踪路由路径",
    longDesc: "traceroute 显示数据包到达目标经过的路由节点。",
    category: "network",
    syntax: "traceroute [选项] 主机",
    options: [],
    examples: [
      { cmd: "traceroute baidu.com", desc: "追踪到百度的路由" }
    ],
    usageScenarios: [
      "诊断网络路由问题",
      "查看数据包路径"
    ],
    related: ["ping", "mtr"]
  },
  nslookup: {
    name: "nslookup",
    desc: "DNS查询工具",
    longDesc: "nslookup 查询域名系统(DNS)以获取域名解析信息。",
    category: "network",
    syntax: "nslookup [域名] [服务器]",
    options: [],
    examples: [
      { cmd: "nslookup baidu.com", desc: "查询域名IP" }
    ],
    usageScenarios: [
      "域名解析查询",
      "DNS故障排查"
    ],
    related: ["dig", "host"]
  },
  dig: {
    name: "dig",
    desc: "DNS查询工具",
    longDesc: "dig 是功能强大的DNS查询工具，比nslookup更详细。",
    category: "network",
    syntax: "dig [@server] [选项] 域名",
    options: [
      { flag: "+short", desc: "简短输出" }
    ],
    examples: [
      { cmd: "dig baidu.com", desc: "查询域名信息" },
      { cmd: "dig @8.8.8.8 baidu.com", desc: "使用指定DNS服务器查询" }
    ],
    usageScenarios: [
      "详细DNS查询",
      "DNS故障排查"
    ],
    related: ["nslookup"]
  },
  ifconfig: {
    name: "ifconfig",
    desc: "配置网络接口",
    longDesc: "ifconfig 显示和配置网络接口参数。",
    category: "network",
    syntax: "ifconfig [接口] [选项]",
    options: [
      { flag: "up", desc: "启用接口" },
      { flag: "down", desc: "禁用接口" }
    ],
    examples: [
      { cmd: "ifconfig", desc: "显示所有接口" },
      { cmd: "ifconfig eth0", desc: "显示eth0信息" }
    ],
    usageScenarios: [
      "查看网络接口配置",
      "配置IP地址"
    ],
    related: ["ip", "iwconfig"]
  },
  ip: {
    name: "ip",
    desc: "网络配置工具",
    longDesc: "ip 是现代Linux推荐使用的网络配置工具，替代ifconfig。",
    category: "network",
    syntax: "ip [选项] 对象 {命令|help}",
    options: [
      { flag: "addr", desc: "地址管理" },
      { flag: "link", desc: "网络设备" },
      { flag: "route", desc: "路由表" }
    ],
    examples: [
      { cmd: "ip addr", desc: "显示IP地址" },
      { cmd: "ip link", desc: "显示网络设备" },
      { cmd: "ip route", desc: "显示路由表" }
    ],
    usageScenarios: [
      "网络配置管理",
      "查看网络信息"
    ],
    related: ["ifconfig"]
  },

  // ============ 权限管理命令 (8个) ============
  chmod: {
    name: "chmod",
    desc: "修改文件权限",
    longDesc: "chmod 修改文件或目录的访问权限。",
    category: "permission",
    syntax: "chmod [选项] 模式 文件",
    options: [
      { flag: "-R", desc: "递归修改" },
      { flag: "-v", desc: "显示详细过程" }
    ],
    examples: [
      { cmd: "chmod 755 file", desc: "设置权限为755" },
      { cmd: "chmod +x script.sh", desc: "添加执行权限" },
      { cmd: "chmod u+w file", desc: "给所有者添加写权限" }
    ],
    usageScenarios: [
      "设置文件权限",
      "使脚本可执行",
      "修改目录权限"
    ],
    related: ["chown", "chgrp"]
  },
  chown: {
    name: "chown",
    desc: "修改文件所有者和组",
    longDesc: "chown 修改文件或目录的所有者和所属组。",
    category: "permission",
    syntax: "chown [选项] [所有者][:[组]] 文件",
    options: [
      { flag: "-R", desc: "递归修改" }
    ],
    examples: [
      { cmd: "chown user file", desc: "修改所有者" },
      { cmd: "chown user:group file", desc: "同时修改所有者和组" },
      { cmd: "chown :group file", desc: "只修改组" }
    ],
    usageScenarios: [
      "修改文件所有者",
      "修改文件所属组"
    ],
    related: ["chmod", "chgrp"]
  },
  sudo: {
    name: "sudo",
    desc: "以超级用户权限执行命令",
    longDesc: "sudo 允许授权用户以root或其他用户身份执行命令。",
    category: "permission",
    syntax: "sudo [选项] 命令",
    options: [
      { flag: "-i", desc: "模拟初始登录" },
      { flag: "-u user", desc: "以指定用户执行" },
      { flag: "-s", desc: "启动shell" }
    ],
    examples: [
      { cmd: "sudo apt update", desc: "以root执行命令" },
      { cmd: "sudo -i", desc: "切换到root用户" }
    ],
    usageScenarios: [
      "执行需要特权的命令",
      "临时获取root权限"
    ],
    related: ["su"]
  },
  su: {
    name: "su",
    desc: "切换用户",
    longDesc: "su 切换到其他用户身份，默认切换到root。",
    category: "permission",
    syntax: "su [选项] [用户名]",
    options: [
      { flag: "-", desc: "切换并加载环境" },
      { flag: "-c", desc: "执行命令后返回" }
    ],
    examples: [
      { cmd: "su -", desc: "切换到root" },
      { cmd: "su - username", desc: "切换到指定用户" }
    ],
    usageScenarios: [
      "切换用户身份",
      "临时获取root shell"
    ],
    related: ["sudo"]
  },
  passwd: {
    name: "passwd",
    desc: "修改密码",
    longDesc: "passwd 修改用户密码。",
    category: "permission",
    syntax: "passwd [用户名]",
    options: [],
    examples: [
      { cmd: "passwd", desc: "修改当前用户密码" },
      { cmd: "sudo passwd user", desc: "修改其他用户密码" }
    ],
    usageScenarios: [
      "修改密码"
    ],
    related: []
  },
  id: {
    name: "id",
    desc: "显示用户和组ID",
    longDesc: "id 显示用户ID、组ID和所属组。",
    category: "permission",
    syntax: "id [用户名]",
    options: [],
    examples: [
      { cmd: "id", desc: "显示当前用户信息" }
    ],
    usageScenarios: [
      "查看用户ID",
      "查看所属组"
    ],
    related: ["whoami", "groups"]
  },
  groups: {
    name: "groups",
    desc: "显示用户所属组",
    longDesc: "groups 显示用户所属的所有组。",
    category: "permission",
    syntax: "groups [用户名]",
    options: [],
    examples: [
      { cmd: "groups", desc: "显示当前用户所属组" }
    ],
    usageScenarios: [
      "查看所属组"
    ],
    related: ["id"]
  },
  umask: {
    name: "umask",
    desc: "设置默认文件权限掩码",
    longDesc: "umask 设置新建文件和目录的默认权限。",
    category: "permission",
    syntax: "umask [模式]",
    options: [],
    examples: [
      { cmd: "umask", desc: "显示当前掩码" },
      { cmd: "umask 022", desc: "设置掩码为022" }
    ],
    usageScenarios: [
      "设置默认文件权限"
    ],
    related: ["chmod"]
  },

  // ============ 压缩归档命令 (8个) ============
  tar: {
    name: "tar",
    desc: "归档工具",
    longDesc: "tar 用于打包和解包归档文件。",
    category: "compression",
    syntax: "tar [选项] 归档文件 [文件...]",
    options: [
      { flag: "-c", desc: "创建归档" },
      { flag: "-x", desc: "解压/提取" },
      { flag: "-t", desc: "列出内容" },
      { flag: "-v", desc: "显示过程" },
      { flag: "-f", desc: "指定文件名" },
      { flag: "-z", desc: "使用gzip" },
      { flag: "-j", desc: "使用bzip2" },
      { flag: "-C", desc: "切换到指定目录" }
    ],
    examples: [
      { cmd: "tar -cvf archive.tar file1 file2", desc: "创建归档" },
      { cmd: "tar -xvf archive.tar", desc: "解压归档" },
      { cmd: "tar -czvf archive.tar.gz dir/", desc: "创建gzip压缩归档" }
    ],
    usageScenarios: [
      "打包文件",
      "备份数据",
      "分发软件"
    ],
    related: ["gzip", "zip"]
  },
  gzip: {
    name: "gzip",
    desc: "文件压缩",
    longDesc: "gzip 压缩和解压文件。",
    category: "compression",
    syntax: "gzip [选项] 文件",
    options: [
      { flag: "-d", desc: "解压" },
      { flag: "-k", desc: "保留原文件" },
      { flag: "-v", desc: "显示压缩比" }
    ],
    examples: [
      { cmd: "gzip file.txt", desc: "压缩文件" },
      { cmd: "gzip -d file.txt.gz", desc: "解压文件" },
      { cmd: "gunzip file.txt.gz", desc: "解压文件（等价于gzip -d）" }
    ],
    usageScenarios: [
      "压缩单个文件",
      "解压gzip文件"
    ],
    related: ["gunzip", "tar"]
  },
  gunzip: {
    name: "gunzip",
    desc: "解压gzip文件",
    longDesc: "gunzip 解压gzip压缩的文件。",
    category: "compression",
    syntax: "gunzip [选项] 文件",
    options: [],
    examples: [
      { cmd: "gunzip file.gz", desc: "解压文件" }
    ],
    usageScenarios: [
      "解压gzip文件"
    ],
    related: ["gzip"]
  },
  bzip2: {
    name: "bzip2",
    desc: "文件压缩",
    longDesc: "bzip2 使用Burrows-Wheeler算法压缩文件，通常比gzip压缩比更高。",
    category: "compression",
    syntax: "bzip2 [选项] 文件",
    options: [
      { flag: "-d", desc: "解压" },
      { flag: "-k", desc: "保留原文件" }
    ],
    examples: [
      { cmd: "bzip2 file.txt", desc: "压缩文件" },
      { cmd: "bunzip2 file.txt.bz2", desc: "解压文件" }
    ],
    usageScenarios: [
      "高压缩比压缩"
    ],
    related: ["bunzip2", "gzip"]
  },
  bunzip2: {
    name: "bunzip2",
    desc: "解压bzip2文件",
    longDesc: "bunzip2 解压bzip2压缩的文件。",
    category: "compression",
    syntax: "bunzip2 文件",
    options: [],
    examples: [
      { cmd: "bunzip2 file.bz2", desc: "解压文件" }
    ],
    usageScenarios: [
      "解压bzip2文件"
    ],
    related: ["bzip2"]
  },
  zip: {
    name: "zip",
    desc: "创建zip压缩包",
    longDesc: "zip 创建与Windows兼容的zip格式压缩包。",
    category: "compression",
    syntax: "zip [选项] 压缩包 文件...",
    options: [
      { flag: "-r", desc: "递归压缩目录" },
      { flag: "-9", desc: "最高压缩率" }
    ],
    examples: [
      { cmd: "zip archive.zip file1.txt file2.txt", desc: "创建zip包" },
      { cmd: "zip -r archive.zip dir/", desc: "递归压缩目录" }
    ],
    usageScenarios: [
      "创建zip格式压缩包",
      "与Windows交换文件"
    ],
    related: ["unzip"]
  },
  unzip: {
    name: "unzip",
    desc: "解压zip文件",
    longDesc: "unzip 解压zip格式的压缩包。",
    category: "compression",
    syntax: "unzip [选项] 压缩包",
    options: [
      { flag: "-d dir", desc: "指定解压目录" },
      { flag: "-l", desc: "列出内容" },
      { flag: "-o", desc: "覆盖不提示" }
    ],
    examples: [
      { cmd: "unzip archive.zip", desc: "解压到当前目录" },
      { cmd: "unzip archive.zip -d /tmp/", desc: "解压到指定目录" }
    ],
    usageScenarios: [
      "解压zip文件"
    ],
    related: ["zip"]
  },
  xz: {
    name: "xz",
    desc: "文件压缩",
    longDesc: "xz 使用LZMA算法压缩文件，通常提供最高压缩比。",
    category: "compression",
    syntax: "xz [选项] 文件",
    options: [
      { flag: "-d", desc: "解压" },
      { flag: "-k", desc: "保留原文件" }
    ],
    examples: [
      { cmd: "xz file.txt", desc: "压缩文件" },
      { cmd: "unxz file.txt.xz", desc: "解压文件" }
    ],
    usageScenarios: [
      "最高压缩比压缩"
    ],
    related: ["unxz"]
  },

  // ============ 搜索查找命令 (5个) ============
  find: {
    name: "find",
    desc: "查找文件",
    longDesc: "find 在目录层次结构中搜索文件。",
    category: "search",
    syntax: "find [路径] [表达式]",
    options: [
      { flag: "-name", desc: "按文件名查找" },
      { flag: "-type", desc: "按类型查找(f/d/l)" },
      { flag: "-size", desc: "按大小查找" },
      { flag: "-mtime", desc: "按修改时间查找" },
      { flag: "-exec", desc: "执行命令" }
    ],
    examples: [
      { cmd: "find . -name '*.txt'", desc: "查找所有txt文件" },
      { cmd: "find /var -type d", desc: "查找所有目录" },
      { cmd: "find . -size +100M", desc: "查找大于100M的文件" }
    ],
    usageScenarios: [
      "查找特定文件",
      "批量处理文件",
      "清理旧文件"
    ],
    related: ["locate", "grep"]
  },
  locate: {
    name: "locate",
    desc: "快速查找文件",
    longDesc: "locate 使用预建数据库快速查找文件，比find快但可能不实时。",
    category: "search",
    syntax: "locate [选项] 模式",
    options: [
      { flag: "-i", desc: "忽略大小写" },
      { flag: "-r", desc: "使用正则表达式" }
    ],
    examples: [
      { cmd: "locate nginx.conf", desc: "查找nginx配置文件" }
    ],
    usageScenarios: [
      "快速查找文件",
      "查找配置文件位置"
    ],
    related: ["find", "updatedb"]
  },
  updatedb: {
    name: "updatedb",
    desc: "更新locate数据库",
    longDesc: "updatedb 更新locate使用的文件数据库。",
    category: "search",
    syntax: "updatedb",
    options: [],
    examples: [
      { cmd: "sudo updatedb", desc: "更新数据库" }
    ],
    usageScenarios: [
      "更新文件数据库"
    ],
    related: ["locate"]
  },

  // ============ Shell脚本命令 (8个) ============
  echo: {
    name: "echo",
    desc: "输出文本",
    longDesc: "echo 将参数输出到标准输出。",
    category: "shell",
    syntax: "echo [选项] 字符串",
    options: [
      { flag: "-n", desc: "不输出换行符" },
      { flag: "-e", desc: "启用转义字符" }
    ],
    examples: [
      { cmd: "echo 'Hello World'", desc: "输出文本" },
      { cmd: "echo $HOME", desc: "输出变量值" },
      { cmd: "echo 'test' > file.txt", desc: "写入文件" }
    ],
    usageScenarios: [
      "输出信息",
      "调试脚本",
      "创建文件"
    ],
    related: ["printf"]
  },
  alias: {
    name: "alias",
    desc: "创建命令别名",
    longDesc: "alias 为命令创建简短别名。",
    category: "shell",
    syntax: "alias [名称=命令]",
    options: [],
    examples: [
      { cmd: "alias ll='ls -la'", desc: "创建别名" },
      { cmd: "alias", desc: "列出所有别名" },
      { cmd: "unalias ll", desc: "删除别名" }
    ],
    usageScenarios: [
      "简化常用命令",
      "自定义命令"
    ],
    related: ["unalias"]
  },
  export: {
    name: "export",
    desc: "设置环境变量",
    longDesc: "export 将变量导出为环境变量，供子进程使用。",
    category: "shell",
    syntax: "export [变量=值]",
    options: [],
    examples: [
      { cmd: "export PATH=$PATH:/new/path", desc: "添加PATH" },
      { cmd: "export MY_VAR=value", desc: "设置环境变量" }
    ],
    usageScenarios: [
      "设置环境变量",
      "配置PATH"
    ],
    related: ["env", "set"]
  },
  source: {
    name: "source",
    desc: "执行脚本并影响当前shell",
    longDesc: "source 在当前shell中执行脚本，而非创建子shell。",
    category: "shell",
    syntax: "source 脚本 或 . 脚本",
    options: [],
    examples: [
      { cmd: "source ~/.bashrc", desc: "重新加载配置" },
      { cmd: ". ./script.sh", desc: "执行脚本" }
    ],
    usageScenarios: [
      "重新加载配置文件",
      "在当前shell执行脚本"
    ],
    related: ["bash"]
  },
  history: {
    name: "history",
    desc: "显示命令历史",
    longDesc: "history 显示当前会话的命令历史。",
    category: "shell",
    syntax: "history [选项]",
    options: [
      { flag: "-c", desc: "清空历史" },
      { flag: "-d", desc: "删除指定条目" }
    ],
    examples: [
      { cmd: "history", desc: "显示历史" },
      { cmd: "history | grep ssh", desc: "搜索历史" },
      { cmd: "!100", desc: "执行第100条历史命令" }
    ],
    usageScenarios: [
      "查找之前执行的命令",
      "重复执行历史命令"
    ],
    related: []
  },
  env: {
    name: "env",
    desc: "显示或设置环境变量",
    longDesc: "env 显示当前环境变量或在指定环境中执行命令。",
    category: "shell",
    syntax: "env [选项] [名称=值...] [命令]",
    options: [],
    examples: [
      { cmd: "env", desc: "显示所有环境变量" },
      { cmd: "env VAR=value command", desc: "设置变量并执行命令" }
    ],
    usageScenarios: [
      "查看环境变量",
      "临时设置环境变量"
    ],
    related: ["printenv", "export"]
  },
  exit: {
    name: "exit",
    desc: "退出shell",
    longDesc: "exit 终止当前shell并返回退出码。",
    category: "shell",
    syntax: "exit [退出码]",
    options: [],
    examples: [
      { cmd: "exit", desc: "退出shell" },
      { cmd: "exit 0", desc: "成功退出" },
      { cmd: "exit 1", desc: "失败退出" }
    ],
    usageScenarios: [
      "退出终端",
      "脚本中结束执行"
    ],
    related: []
  },
  clear: {
    name: "clear",
    desc: "清空终端屏幕",
    longDesc: "clear 清空终端屏幕，将光标移到左上角。",
    category: "shell",
    syntax: "clear",
    options: [],
    examples: [
      { cmd: "clear", desc: "清屏" }
    ],
    usageScenarios: [
      "清屏"
    ],
    related: [],
    tips: "快捷键Ctrl+L效果相同"
  },

  // ============ 软件包管理命令 (12个) ============
  apt: {
    name: "apt",
    desc: "高级软件包工具（Debian/Ubuntu）",
    longDesc: "apt 是 Debian 和 Ubuntu 系统中用于管理软件包的高级工具，提供软件包的安装、升级、删除等功能",
    category: "package",
    syntax: "apt [选项] 命令",
    options: [
      { flag: "update", desc: "更新软件包列表" },
      { flag: "upgrade", desc: "升级所有已安装的软件包" },
      { flag: "install", desc: "安装软件包" },
      { flag: "remove", desc: "删除软件包（保留配置文件）" },
      { flag: "purge", desc: "彻底删除软件包（包括配置文件）" },
      { flag: "autoremove", desc: "删除不再需要的依赖包" },
      { flag: "search", desc: "搜索软件包" },
      { flag: "show", desc: "显示软件包详细信息" },
      { flag: "list", desc: "列出软件包" }
    ],
    examples: [
      { cmd: "sudo apt update", desc: "更新软件包列表" },
      { cmd: "sudo apt upgrade", desc: "升级所有软件包" },
      { cmd: "sudo apt install nginx", desc: "安装nginx" },
      { cmd: "sudo apt remove nginx", desc: "卸载nginx" },
      { cmd: "sudo apt purge nginx", desc: "彻底删除nginx及配置" },
      { cmd: "apt search mysql", desc: "搜索mysql相关软件" }
    ],
    usageScenarios: [
      "安装新软件",
      "更新系统",
      "卸载软件",
      "搜索可用软件"
    ],
    related: ["dpkg", "apt-get"],
    tips: "使用apt需要sudo权限",
    note: "Ubuntu 16.04+ 推荐使用apt代替apt-get"
  },

  aptget: {
    name: "apt-get",
    desc: "APT包处理工具",
    longDesc: "apt-get 是 Debian/Ubuntu 系统的底层包管理工具，功能更底层和完整",
    category: "package",
    syntax: "apt-get [选项] 命令",
    options: [
      { flag: "update", desc: "更新软件包列表" },
      { flag: "upgrade", desc: "升级软件包" },
      { flag: "dist-upgrade", desc: "完整系统升级" },
      { flag: "install", desc: "安装软件包" },
      { flag: "remove", desc: "删除软件包" },
      { flag: "purge", desc: "彻底删除" },
      { flag: "autoclean", desc: "清理旧版本软件包" },
      { flag: "clean", desc: "清理下载的软件包" }
    ],
    examples: [
      { cmd: "sudo apt-get update", desc: "更新软件列表" },
      { cmd: "sudo apt-get install vim", desc: "安装vim" },
      { cmd: "sudo apt-get clean", desc: "清理缓存" }
    ],
    usageScenarios: [
      "脚本中包管理",
      "系统维护"
    ],
    related: ["apt", "dpkg"]
  },

  dpkg: {
    name: "dpkg",
    desc: "Debian包管理器",
    longDesc: "dpkg 是Debian系Linux底层的包管理工具，用于安装、构建、删除和管理.deb软件包",
    category: "package",
    syntax: "dpkg [选项] 动作",
    options: [
      { flag: "-i", desc: "安装软件包" },
      { flag: "-r", desc: "删除软件包" },
      { flag: "-P", desc: "彻底删除（包括配置）" },
      { flag: "-l", desc: "列出已安装的包" },
      { flag: "-s", desc: "显示包状态" },
      { flag: "-L", desc: "列出包安装的文件" },
      { flag: "-S", desc: "查找文件属于哪个包" }
    ],
    examples: [
      { cmd: "sudo dpkg -i package.deb", desc: "安装.deb包" },
      { cmd: "dpkg -l | grep nginx", desc: "查看已安装的nginx" },
      { cmd: "dpkg -L vim", desc: "查看vim安装了哪些文件" },
      { cmd: "dpkg -S /bin/ls", desc: "查看/bin/ls属于哪个包" }
    ],
    usageScenarios: [
      "安装本地.deb包",
      "查询包信息",
      "解决包依赖问题"
    ],
    related: ["apt", "apt-get"],
    note: "dpkg不处理依赖关系，通常与apt配合使用"
  },

  yum: {
    name: "yum",
    desc: "Yellowdog Updater Modified（CentOS/RHEL）",
    longDesc: "yum 是CentOS、RHEL、Fedora等系统的软件包管理器，用于自动解决依赖关系",
    category: "package",
    syntax: "yum [选项] 命令",
    options: [
      { flag: "install", desc: "安装软件包" },
      { flag: "remove", desc: "删除软件包" },
      { flag: "update", desc: "更新软件包" },
      { flag: "check-update", desc: "检查可用更新" },
      { flag: "search", desc: "搜索软件包" },
      { flag: "info", desc: "显示软件包信息" },
      { flag: "list", desc: "列出软件包" },
      { flag: "clean", desc: "清理缓存" }
    ],
    examples: [
      { cmd: "sudo yum install httpd", desc: "安装Apache" },
      { cmd: "sudo yum update", desc: "更新所有包" },
      { cmd: "sudo yum remove httpd", desc: "卸载Apache" },
      { cmd: "yum search mysql", desc: "搜索mysql" },
      { cmd: "yum info nginx", desc: "查看nginx信息" }
    ],
    usageScenarios: [
      "CentOS/RHEL软件安装",
      "系统更新",
      "软件搜索"
    ],
    related: ["rpm", "dnf"],
    note: "新版CentOS/RHEL推荐使用dnf代替yum"
  },

  dnf: {
    name: "dnf",
    desc: "Dandified YUM（新版Fedora/CentOS/RHEL）",
    longDesc: "dnf 是yum的下一代版本，提供更好的依赖解析和性能，是Fedora、新版CentOS/RHEL的默认包管理器",
    category: "package",
    syntax: "dnf [选项] 命令",
    options: [
      { flag: "install", desc: "安装软件包" },
      { flag: "remove", desc: "删除软件包" },
      { flag: "upgrade", desc: "升级软件包" },
      { flag: "search", desc: "搜索软件包" },
      { flag: "info", desc: "显示软件包信息" },
      { flag: "list", desc: "列出软件包" },
      { flag: "autoremove", desc: "删除无用依赖" }
    ],
    examples: [
      { cmd: "sudo dnf install nginx", desc: "安装nginx" },
      { cmd: "sudo dnf upgrade", desc: "升级系统" },
      { cmd: "sudo dnf autoremove", desc: "清理无用依赖" },
      { cmd: "dnf search python3", desc: "搜索python3" }
    ],
    usageScenarios: [
      "Fedora/RHEL8+软件管理",
      "系统更新维护"
    ],
    related: ["yum", "rpm"]
  },

  rpm: {
    name: "rpm",
    desc: "RPM包管理器",
    longDesc: "rpm 是Red Hat系Linux底层的包管理工具，用于管理.rpm格式的软件包",
    category: "package",
    syntax: "rpm [选项]",
    options: [
      { flag: "-i", desc: "安装软件包" },
      { flag: "-U", desc: "升级软件包" },
      { flag: "-e", desc: "删除软件包" },
      { flag: "-qa", desc: "查询所有已安装包" },
      { flag: "-qi", desc: "查询包信息" },
      { flag: "-ql", desc: "列出包中的文件" },
      { flag: "-qf", desc: "查询文件属于哪个包" }
    ],
    examples: [
      { cmd: "sudo rpm -ivh package.rpm", desc: "安装rpm包（显示进度）" },
      { cmd: "rpm -qa | grep httpd", desc: "查询已安装的httpd" },
      { cmd: "rpm -qf /bin/ls", desc: "查询文件所属包" },
      { cmd: "rpm -ql vim-common", desc: "列出vim包文件" }
    ],
    usageScenarios: [
      "安装本地rpm包",
      "查询包信息"
    ],
    related: ["yum", "dnf"],
    note: "rpm不自动解决依赖，建议使用yum/dnf"
  },

  pacman: {
    name: "pacman",
    desc: "Arch Linux包管理器",
    longDesc: "pacman 是Arch Linux及其衍生发行版（如Manjaro）的软件包管理器",
    category: "package",
    syntax: "pacman [选项] 操作",
    options: [
      { flag: "-S", desc: "同步/安装软件包" },
      { flag: "-R", desc: "删除软件包" },
      { flag: "-Syu", desc: "同步并更新系统" },
      { flag: "-Ss", desc: "搜索软件包" },
      { flag: "-Si", desc: "显示软件包信息" },
      { flag: "-Q", desc: "查询已安装包" },
      { flag: "-Sc", desc: "清理缓存" }
    ],
    examples: [
      { cmd: "sudo pacman -S vim", desc: "安装vim" },
      { cmd: "sudo pacman -Syu", desc: "更新系统" },
      { cmd: "sudo pacman -R firefox", desc: "卸载firefox" },
      { cmd: "pacman -Ss nginx", desc: "搜索nginx" },
      { cmd: "pacman -Q | grep vim", desc: "查询已安装包" }
    ],
    usageScenarios: [
      "Arch Linux软件管理",
      "系统更新"
    ],
    related: ["yay"]
  },

  snap: {
    name: "snap",
    desc: "Snap包管理器",
    longDesc: "snap 是Ubuntu开发的通用软件包格式，提供沙箱环境和自动更新",
    category: "package",
    syntax: "snap [选项] 命令",
    options: [
      { flag: "install", desc: "安装软件" },
      { flag: "remove", desc: "删除软件" },
      { flag: "list", desc: "列出已安装软件" },
      { flag: "find", desc: "搜索软件" },
      { flag: "info", desc: "显示软件信息" },
      { flag: "refresh", desc: "更新软件" },
      { flag: "run", desc: "运行软件" }
    ],
    examples: [
      { cmd: "sudo snap install vlc", desc: "安装VLC播放器" },
      { cmd: "sudo snap install code --classic", desc: "安装VS Code" },
      { cmd: "sudo snap remove vlc", desc: "卸载VLC" },
      { cmd: "snap list", desc: "列出已安装snap" },
      { cmd: "snap find video", desc: "搜索视频软件" }
    ],
    usageScenarios: [
      "安装通用软件包",
      "使用新版应用"
    ],
    related: ["flatpak"],
    note: "Snap包自动更新，但启动较慢"
  },

  flatpak: {
    name: "flatpak",
    desc: "Flatpak应用分发",
    longDesc: "flatpak 是另一种通用Linux应用格式，支持沙箱和多版本共存",
    category: "package",
    syntax: "flatpak [选项] 命令",
    options: [
      { flag: "install", desc: "安装应用" },
      { flag: "uninstall", desc: "卸载应用" },
      { flag: "update", desc: "更新应用" },
      { flag: "list", desc: "列出应用" },
      { flag: "search", desc: "搜索应用" },
      { flag: "run", desc: "运行应用" }
    ],
    examples: [
      { cmd: "flatpak install flathub org.videolan.VLC", desc: "安装VLC" },
      { cmd: "flatpak update", desc: "更新应用" },
      { cmd: "flatpak list", desc: "列出应用" },
      { cmd: "flatpak search gimp", desc: "搜索GIMP" }
    ],
    usageScenarios: [
      "安装Flatpak应用",
      "多版本软件管理"
    ],
    related: ["snap"]
  },

  pip: {
    name: "pip",
    desc: "Python包管理器",
    longDesc: "pip 是Python的标准包管理工具，用于安装和管理Python库",
    category: "package",
    syntax: "pip [选项] 命令",
    options: [
      { flag: "install", desc: "安装包" },
      { flag: "uninstall", desc: "卸载包" },
      { flag: "list", desc: "列出已安装包" },
      { flag: "freeze", desc: "导出依赖清单" },
      { flag: "show", desc: "显示包信息" },
      { flag: "search", desc: "搜索包" },
      { flag: "-r", desc: "从requirements.txt安装" }
    ],
    examples: [
      { cmd: "pip install requests", desc: "安装requests库" },
      { cmd: "pip install -r requirements.txt", desc: "安装依赖" },
      { cmd: "pip uninstall requests", desc: "卸载" },
      { cmd: "pip list", desc: "查看已安装包" },
      { cmd: "pip freeze > requirements.txt", desc: "导出依赖" }
    ],
    usageScenarios: [
      "Python开发",
      "安装Python库"
    ],
    related: ["python", "virtualenv"]
  },

  npm: {
    name: "npm",
    desc: "Node.js包管理器",
    longDesc: "npm 是Node.js的默认包管理器，用于管理JavaScript库和项目依赖",
    category: "package",
    syntax: "npm 命令 [选项]",
    options: [
      { flag: "install", desc: "安装包" },
      { flag: "uninstall", desc: "卸载包" },
      { flag: "list", desc: "列出已安装包" },
      { flag: "update", desc: "更新包" },
      { flag: "init", desc: "初始化项目" },
      { flag: "run", desc: "运行脚本" },
      { flag: "-g", desc: "全局安装" }
    ],
    examples: [
      { cmd: "npm install express", desc: "安装express" },
      { cmd: "npm install -g typescript", desc: "全局安装TypeScript" },
      { cmd: "npm uninstall lodash", desc: "卸载包" },
      { cmd: "npm list", desc: "查看依赖树" },
      { cmd: "npm run build", desc: "运行build脚本" }
    ],
    usageScenarios: [
      "Node.js开发",
      "前端项目构建"
    ],
    related: ["node", "yarn", "pnpm"]
  },

  gem: {
    name: "gem",
    desc: "Ruby包管理器",
    longDesc: "gem 是Ruby的包管理工具，用于安装和管理Ruby库和程序",
    category: "package",
    syntax: "gem 命令 [选项]",
    options: [
      { flag: "install", desc: "安装gem" },
      { flag: "uninstall", desc: "卸载gem" },
      { flag: "list", desc: "列出已安装gem" },
      { flag: "update", desc: "更新gem" },
      { flag: "search", desc: "搜索gem" },
      { flag: "build", desc: "构建gem" }
    ],
    examples: [
      { cmd: "gem install rails", desc: "安装Rails" },
      { cmd: "gem uninstall rails", desc: "卸载" },
      { cmd: "gem list", desc: "查看已安装" },
      { cmd: "gem update", desc: "更新所有gem" }
    ],
    usageScenarios: [
      "Ruby开发",
      "安装Ruby工具"
    ],
    related: ["ruby", "bundle"]
  },

  // ============ 进程管理增强命令 (8个) ============
  pkill: {
    name: "pkill",
    desc: "按名称发送信号给进程",
    longDesc: "pkill 根据进程名或其他属性发送信号给进程，是killall的替代工具",
    category: "system",
    syntax: "pkill [选项] 进程名",
    options: [
      { flag: "-f", desc: "匹配完整命令行" },
      { flag: "-n", desc: "只杀最新的进程" },
      { flag: "-o", desc: "只杀最老的进程" },
      { flag: "-signal", desc: "指定信号" },
      { flag: "-u", desc: "指定用户" },
      { flag: "-x", desc: "精确匹配" }
    ],
    examples: [
      { cmd: "pkill firefox", desc: "终止firefox进程" },
      { cmd: "pkill -9 python", desc: "强制终止python" },
      { cmd: "pkill -f 'node app.js'", desc: "匹配完整命令" }
    ],
    usageScenarios: [
      "批量终止进程",
      "按名称杀进程"
    ],
    related: ["kill", "killall", "pgrep"]
  },

  killall: {
    name: "killall",
    desc: "按名称终止进程",
    longDesc: "killall 发送信号给所有指定名称的进程",
    category: "system",
    syntax: "killall [选项] 进程名",
    options: [
      { flag: "-9", desc: "强制终止" },
      { flag: "-i", desc: "交互式确认" },
      { flag: "-q", desc: "静默模式" },
      { flag: "-r", desc: "使用正则表达式" },
      { flag: "-u", desc: "指定用户" }
    ],
    examples: [
      { cmd: "killall nginx", desc: "终止所有nginx进程" },
      { cmd: "killall -9 chrome", desc: "强制关闭chrome" },
      { cmd: "killall -i firefox", desc: "交互式终止" }
    ],
    usageScenarios: [
      "终止同名进程",
      "批量关闭程序"
    ],
    related: ["kill", "pkill"]
  },

  pgrep: {
    name: "pgrep",
    desc: "按名称查找进程ID",
    longDesc: "pgrep 根据进程名或其他属性查找进程ID",
    category: "system",
    syntax: "pgrep [选项] 进程名",
    options: [
      { flag: "-f", desc: "匹配完整命令行" },
      { flag: "-l", desc: "显示进程名" },
      { flag: "-n", desc: "只显示最新的" },
      { flag: "-o", desc: "只显示最老的" },
      { flag: "-u", desc: "指定用户" },
      { flag: "-x", desc: "精确匹配" }
    ],
    examples: [
      { cmd: "pgrep ssh", desc: "查找ssh进程ID" },
      { cmd: "pgrep -l firefox", desc: "显示进程名和ID" },
      { cmd: "pgrep -u root nginx", desc: "查找root用户的nginx" }
    ],
    usageScenarios: [
      "查找进程ID",
      "脚本中获取PID"
    ],
    related: ["pkill", "ps"]
  },

  nice: {
    name: "nice",
    desc: "以指定优先级运行命令",
    longDesc: "nice 设置程序的调度优先级，值越大优先级越低",
    category: "system",
    syntax: "nice [选项] [命令]",
    options: [
      { flag: "-n", desc: "指定优先级（-20到19）" }
    ],
    examples: [
      { cmd: "nice -n 10 ./script.sh", desc: "以较低优先级运行" },
      { cmd: "nice -n 19 make", desc: "编译时降低优先级" }
    ],
    usageScenarios: [
      "后台任务降优先级",
      "避免占用太多CPU"
    ],
    related: ["renice", "top"]
  },

  renice: {
    name: "renice",
    desc: "修改运行中进程的优先级",
    longDesc: "renice 修改正在运行的进程的调度优先级",
    category: "system",
    syntax: "renice 优先级 [选项] -p PID",
    options: [
      { flag: "-p", desc: "指定进程ID" },
      { flag: "-u", desc: "指定用户" },
      { flag: "-g", desc: "指定进程组" }
    ],
    examples: [
      { cmd: "renice 10 -p 1234", desc: "降低PID 1234的优先级" },
      { cmd: "sudo renice -5 -p $(pgrep nginx)", desc: "提升nginx优先级" }
    ],
    usageScenarios: [
      "调整进程优先级",
      "优化系统性能"
    ],
    related: ["nice", "top"]
  },

  nohup: {
    name: "nohup",
    desc: "忽略挂起信号运行命令",
    longDesc: "nohup 使命令在用户退出登录后继续运行，输出重定向到nohup.out",
    category: "system",
    syntax: "nohup 命令 [参数]",
    options: [],
    examples: [
      { cmd: "nohup ./script.sh &", desc: "后台运行脚本" },
      { cmd: "nohup python server.py > output.log 2>&1 &", desc: "运行服务并重定向输出" }
    ],
    usageScenarios: [
      "后台运行长时间任务",
      "SSH断开保持运行"
    ],
    related: ["&", "disown", "screen", "tmux"]
  },

  watch: {
    name: "watch",
    desc: "定期执行命令并显示输出",
    longDesc: "watch 每隔一段时间执行指定命令，适合监控实时变化",
    category: "system",
    syntax: "watch [选项] 命令",
    options: [
      { flag: "-n", desc: "指定间隔秒数（默认2秒）" },
      { flag: "-d", desc: "高亮显示差异" },
      { flag: "-t", desc: "不显示标题" }
    ],
    examples: [
      { cmd: "watch -n 1 ps aux", desc: "每秒刷新进程列表" },
      { cmd: "watch -d ls -l", desc: "监控目录变化" },
      { cmd: "watch -n 5 df -h", desc: "每5秒检查磁盘" }
    ],
    usageScenarios: [
      "监控系统状态",
      "实时查看日志"
    ],
    related: ["top", "tail -f"]
  },

  jobs: {
    name: "jobs",
    desc: "显示后台作业",
    longDesc: "jobs 显示当前shell中后台运行的作业列表",
    category: "system",
    syntax: "jobs [选项]",
    options: [
      { flag: "-l", desc: "显示进程ID" },
      { flag: "-p", desc: "只显示进程ID" },
      { flag: "-r", desc: "只显示运行的作业" },
      { flag: "-s", desc: "只显示停止的作业" }
    ],
    examples: [
      { cmd: "jobs", desc: "查看后台作业" },
      { cmd: "jobs -l", desc: "显示PID" },
      { cmd: "kill %1", desc: "终止作业1" }
    ],
    usageScenarios: [
      "管理后台任务",
      "查看暂停的任务"
    ],
    related: ["bg", "fg", "kill"]
  },

  // ============ 用户和组管理命令 (10个) ============
  useradd: {
    name: "useradd",
    desc: "创建新用户",
    longDesc: "useradd 创建新用户账户",
    category: "permission",
    syntax: "useradd [选项] 用户名",
    options: [
      { flag: "-m", desc: "创建主目录" },
      { flag: "-d", desc: "指定主目录" },
      { flag: "-s", desc: "指定登录shell" },
      { flag: "-g", desc: "指定主组" },
      { flag: "-G", desc: "指定附加组" },
      { flag: "-c", desc: "添加注释/全名" },
      { flag: "-e", desc: "设置账户过期日期" },
      { flag: "-u", desc: "指定UID" }
    ],
    examples: [
      { cmd: "sudo useradd -m john", desc: "创建用户并创建主目录" },
      { cmd: "sudo useradd -m -s /bin/bash -c 'John Smith' john", desc: "创建用户并设置shell" },
      { cmd: "sudo useradd -m -G sudo,developers alice", desc: "创建用户并添加到组" }
    ],
    usageScenarios: [
      "创建新用户",
      "系统用户管理"
    ],
    related: ["userdel", "usermod", "passwd"]
  },

  userdel: {
    name: "userdel",
    desc: "删除用户",
    longDesc: "userdel 删除用户账户",
    category: "permission",
    syntax: "userdel [选项] 用户名",
    options: [
      { flag: "-r", desc: "删除主目录和邮件" },
      { flag: "-f", desc: "强制删除" }
    ],
    examples: [
      { cmd: "sudo userdel john", desc: "删除用户（保留主目录）" },
      { cmd: "sudo userdel -r john", desc: "删除用户及主目录" }
    ],
    usageScenarios: [
      "删除用户账户",
      "清理无用账户"
    ],
    related: ["useradd", "usermod"]
  },

  usermod: {
    name: "usermod",
    desc: "修改用户账户",
    longDesc: "usermod 修改现有用户的属性",
    category: "permission",
    syntax: "usermod [选项] 用户名",
    options: [
      { flag: "-aG", desc: "添加用户到组（不覆盖现有组）" },
      { flag: "-g", desc: "修改主组" },
      { flag: "-G", desc: "修改附加组" },
      { flag: "-d", desc: "修改主目录" },
      { flag: "-m", desc: "移动主目录内容" },
      { flag: "-s", desc: "修改登录shell" },
      { flag: "-L", desc: "锁定账户" },
      { flag: "-U", desc: "解锁账户" }
    ],
    examples: [
      { cmd: "sudo usermod -aG sudo john", desc: "添加用户到sudo组" },
      { cmd: "sudo usermod -s /bin/zsh john", desc: "修改默认shell" },
      { cmd: "sudo usermod -L john", desc: "锁定用户" }
    ],
    usageScenarios: [
      "添加用户到组",
      "修改用户属性",
      "锁定账户"
    ],
    related: ["useradd", "gpasswd"]
  },

  groupadd: {
    name: "groupadd",
    desc: "创建新组",
    longDesc: "groupadd 创建新的用户组",
    category: "permission",
    syntax: "groupadd [选项] 组名",
    options: [
      { flag: "-g", desc: "指定GID" },
      { flag: "-r", desc: "创建系统组" }
    ],
    examples: [
      { cmd: "sudo groupadd developers", desc: "创建developers组" },
      { cmd: "sudo groupadd -g 1001 mygroup", desc: "指定GID创建组" }
    ],
    usageScenarios: [
      "创建用户组",
      "组织权限管理"
    ],
    related: ["groupdel", "groupmod"]
  },

  groupdel: {
    name: "groupdel",
    desc: "删除组",
    longDesc: "groupdel 删除用户组",
    category: "permission",
    syntax: "groupdel 组名",
    options: [],
    examples: [
      { cmd: "sudo groupdel developers", desc: "删除developers组" }
    ],
    usageScenarios: [
      "删除无用组",
      "清理组信息"
    ],
    related: ["groupadd", "groupmod"]
  },

  gpasswd: {
    name: "gpasswd",
    desc: "管理组密码和成员",
    longDesc: "gpasswd 管理组密码、添加/删除组成员",
    category: "permission",
    syntax: "gpasswd [选项] 组名",
    options: [
      { flag: "-a", desc: "添加用户到组" },
      { flag: "-d", desc: "从组删除用户" },
      { flag: "-A", desc: "设置组管理员" },
      { flag: "-M", desc: "设置组成员" },
      { flag: "-r", desc: "删除组密码" }
    ],
    examples: [
      { cmd: "sudo gpasswd -a john developers", desc: "添加john到组" },
      { cmd: "sudo gpasswd -d john developers", desc: "从组删除john" },
      { cmd: "sudo gpasswd -A john developers", desc: "设置john为组管理员" }
    ],
    usageScenarios: [
      "管理组成员",
      "设置组管理员"
    ],
    related: ["usermod", "groupadd"]
  },

  last: {
    name: "last",
    desc: "显示用户登录历史",
    longDesc: "last 显示最近登录系统的用户列表",
    category: "permission",
    syntax: "last [选项] [用户名]",
    options: [
      { flag: "-a", desc: "显示主机名在最后" },
      { flag: "-n", desc: "显示最近N条" },
      { flag: "-f", desc: "指定日志文件" }
    ],
    examples: [
      { cmd: "last", desc: "显示所有登录记录" },
      { cmd: "last john", desc: "显示john的登录记录" },
      { cmd: "last -n 10", desc: "显示最近10条" }
    ],
    usageScenarios: [
      "查看登录历史",
      "审计用户活动"
    ],
    related: ["who", "w"]
  },

  lastlog: {
    name: "lastlog",
    desc: "显示所有用户最近登录",
    longDesc: "lastlog 显示系统中所有用户的最近登录信息",
    category: "permission",
    syntax: "lastlog [选项]",
    options: [
      { flag: "-u", desc: "指定用户" },
      { flag: "-b", desc: "显示指定日期前的登录" },
      { flag: "-t", desc: "显示指定日期后的登录" }
    ],
    examples: [
      { cmd: "lastlog", desc: "显示所有用户最近登录" },
      { cmd: "lastlog -u john", desc: "显示john的登录信息" }
    ],
    usageScenarios: [
      "检查未登录用户",
      "安全审计"
    ],
    related: ["last"]
  },

  w: {
    name: "w",
    desc: "显示登录用户及正在执行的命令",
    longDesc: "w 显示当前登录用户及其正在执行的命令",
    category: "permission",
    syntax: "w [选项] [用户]",
    options: [
      { flag: "-h", desc: "不显示标题" },
      { flag: "-u", desc: "忽略当前进程时间" },
      { flag: "-s", desc: "简洁格式" }
    ],
    examples: [
      { cmd: "w", desc: "显示所有登录用户" },
      { cmd: "w john", desc: "显示john的信息" },
      { cmd: "w -s", desc: "简洁格式显示" }
    ],
    usageScenarios: [
      "查看在线用户",
      "监控用户活动"
    ],
    related: ["who", "last"]
  },

  who: {
    name: "who",
    desc: "显示当前登录用户",
    longDesc: "who 显示当前登录到系统的用户信息",
    category: "permission",
    syntax: "who [选项]",
    options: [
      { flag: "-a", desc: "显示所有信息" },
      { flag: "-b", desc: "显示最后启动时间" },
      { flag: "-q", desc: "快速显示用户名和数量" },
      { flag: "-u", desc: "显示空闲时间" }
    ],
    examples: [
      { cmd: "who", desc: "显示登录用户" },
      { cmd: "who -b", desc: "显示系统启动时间" },
      { cmd: "who -q", desc: "快速统计用户" }
    ],
    usageScenarios: [
      "查看登录用户",
      "统计在线人数"
    ],
    related: ["w", "whoami"]
  },

  // ============ 磁盘和文件系统命令 (10个) ============
  fdisk: {
    name: "fdisk",
    desc: "磁盘分区表管理",
    longDesc: "fdisk 是Linux下的磁盘分区管理工具",
    category: "file",
    syntax: "fdisk [选项] 设备",
    options: [
      { flag: "-l", desc: "列出分区表" },
      { flag: "-s", desc: "显示分区大小" }
    ],
    examples: [
      { cmd: "sudo fdisk -l", desc: "列出所有磁盘分区" },
      { cmd: "sudo fdisk /dev/sdb", desc: "编辑sdb分区表" }
    ],
    usageScenarios: [
      "磁盘分区",
      "查看分区信息"
    ],
    related: ["parted", "mkfs"]
  },

  parted: {
    name: "parted",
    desc: "磁盘分区管理",
    longDesc: "parted 是功能强大的磁盘分区工具，支持GPT分区",
    category: "file",
    syntax: "parted [选项] 设备 [命令]",
    options: [
      { flag: "-l", desc: "列出所有分区" },
      { flag: "-s", desc: "脚本模式" },
      { flag: "-a", desc: "对齐模式" }
    ],
    examples: [
      { cmd: "sudo parted -l", desc: "列出所有分区" },
      { cmd: "sudo parted /dev/sdb print", desc: "显示分区表" }
    ],
    usageScenarios: [
      "大容量磁盘分区",
      "GPT分区管理"
    ],
    related: ["fdisk", "gparted"]
  },

  mkfs: {
    name: "mkfs",
    desc: "创建文件系统",
    longDesc: "mkfs 在设备上创建Linux文件系统",
    category: "file",
    syntax: "mkfs [选项] [-t 类型] 设备",
    options: [
      { flag: "-t", desc: "指定文件系统类型" },
      { flag: "-c", desc: "检查坏块" },
      { flag: "-V", desc: "显示版本" }
    ],
    examples: [
      { cmd: "sudo mkfs -t ext4 /dev/sdb1", desc: "创建ext4文件系统" },
      { cmd: "sudo mkfs.ext4 /dev/sdb1", desc: "创建ext4文件系统" },
      { cmd: "sudo mkfs -t xfs /dev/sdc1", desc: "创建xfs文件系统" }
    ],
    usageScenarios: [
      "格式化磁盘",
      "准备存储设备"
    ],
    related: ["fdisk", "mount"]
  },

  mount: {
    name: "mount",
    desc: "挂载文件系统",
    longDesc: "mount 将文件系统挂载到指定挂载点",
    category: "file",
    syntax: "mount [选项] 设备 挂载点",
    options: [
      { flag: "-t", desc: "指定文件系统类型" },
      { flag: "-o", desc: "指定挂载选项" },
      { flag: "-a", desc: "挂载/etc/fstab中的所有文件系统" },
      { flag: "-r", desc: "只读挂载" },
      { flag: "-w", desc: "读写挂载" },
      { flag: "-B", desc: "绑定挂载" }
    ],
    examples: [
      { cmd: "sudo mount /dev/sdb1 /mnt", desc: "挂载分区到/mnt" },
      { cmd: "sudo mount -t ext4 /dev/sdb1 /mnt", desc: "指定类型挂载" },
      { cmd: "sudo mount -o remount,rw /", desc: "重新挂载为读写" },
      { cmd: "mount | grep /dev/sdb", desc: "查看挂载信息" }
    ],
    usageScenarios: [
      "挂载磁盘",
      "挂载USB设备",
      "挂载ISO文件"
    ],
    related: ["umount", "fstab"]
  },

  umount: {
    name: "umount",
    desc: "卸载文件系统",
    longDesc: "umount 卸载已挂载的文件系统",
    category: "file",
    syntax: "umount [选项] 设备或挂载点",
    options: [
      { flag: "-a", desc: "卸载/etc/mtab中的所有文件系统" },
      { flag: "-f", desc: "强制卸载" },
      { flag: "-l", desc: "延迟卸载（懒卸载）" },
      { flag: "-r", desc: "只读重新挂载" }
    ],
    examples: [
      { cmd: "sudo umount /mnt", desc: "卸载/mnt" },
      { cmd: "sudo umount /dev/sdb1", desc: "按设备卸载" },
      { cmd: "sudo umount -f /mnt", desc: "强制卸载" }
    ],
    usageScenarios: [
      "安全移除设备",
      "卸载磁盘"
    ],
    related: ["mount", "eject"]
  },

  blkid: {
    name: "blkid",
    desc: "显示块设备属性",
    longDesc: "blkid 显示块设备的UUID、文件系统类型等属性",
    category: "file",
    syntax: "blkid [选项] [设备]",
    options: [
      { flag: "-s", desc: "只显示指定标签" },
      { flag: "-o", desc: "指定输出格式" },
      { flag: "-u", desc: "只显示指定文件系统类型" }
    ],
    examples: [
      { cmd: "sudo blkid", desc: "显示所有块设备" },
      { cmd: "sudo blkid /dev/sda1", desc: "显示指定设备" },
      { cmd: "blkid -s UUID /dev/sda1", desc: "只显示UUID" }
    ],
    usageScenarios: [
      "查找设备UUID",
      "识别文件系统类型"
    ],
    related: ["lsblk", "fdisk"]
  },

  lsblk: {
    name: "lsblk",
    desc: "列出块设备信息",
    longDesc: "lsblk 以树状结构列出所有块设备及其挂载点",
    category: "file",
    syntax: "lsblk [选项]",
    options: [
      { flag: "-a", desc: "显示空设备" },
      { flag: "-f", desc: "显示文件系统信息" },
      { flag: "-l", desc: "使用列表格式" },
      { flag: "-o", desc: "指定输出列" },
      { flag: "-p", desc: "显示完整路径" },
      { flag: "-t", desc: "显示拓扑结构" }
    ],
    examples: [
      { cmd: "lsblk", desc: "显示块设备树" },
      { cmd: "lsblk -f", desc: "显示文件系统" },
      { cmd: "lsblk -o NAME,SIZE,MOUNTPOINT", desc: "自定义输出" }
    ],
    usageScenarios: [
      "查看磁盘结构",
      "查看挂载点"
    ],
    related: ["blkid", "df"]
  },

  eject: {
    name: "eject",
    desc: "弹出可移动设备",
    longDesc: "eject 弹出光盘、USB设备等可移动介质",
    category: "file",
    syntax: "eject [选项] 设备",
    options: [
      { flag: "-r", desc: "卸载并弹出光盘" },
      { flag: "-s", desc: "关闭光盘托盘" },
      { flag: "-f", desc: "强制卸载" },
      { flag: "-q", desc: "查询状态" }
    ],
    examples: [
      { cmd: "eject", desc: "弹出默认设备" },
      { cmd: "eject /dev/cdrom", desc: "弹出光驱" },
      { cmd: "eject -s /dev/cdrom", desc: "关闭光驱" }
    ],
    usageScenarios: [
      "弹出光盘",
      "安全移除USB"
    ],
    related: ["umount"]
  },

  sync: {
    name: "sync",
    desc: "同步文件系统缓冲区",
    longDesc: "sync 将内存中的数据强制写入磁盘，确保数据持久化",
    category: "file",
    syntax: "sync [选项] [文件]",
    options: [
      { flag: "-d", desc: "只同步该文件的数据" },
      { flag: "-f", desc: "只同步该文件" }
    ],
    examples: [
      { cmd: "sync", desc: "同步所有缓冲区" },
      { cmd: "sync file.txt", desc: "同步指定文件" }
    ],
    usageScenarios: [
      "安全拔出设备前",
      "确保数据写入磁盘"
    ],
    related: ["mount", "umount"]
  },

  fsck: {
    name: "fsck",
    desc: "检查和修复文件系统",
    longDesc: "fsck 检查和修复Linux文件系统的错误",
    category: "file",
    syntax: "fsck [选项] 设备",
    options: [
      { flag: "-A", desc: "检查/etc/fstab中的所有文件系统" },
      { flag: "-a", desc: "自动修复（不推荐）" },
      { flag: "-y", desc: "对所有问题回答yes" },
      { flag: "-n", desc: "不执行修复，只检查" },
      { flag: "-r", desc: "交互式修复" },
      { flag: "-t", desc: "指定文件系统类型" },
      { flag: "-V", desc: "详细模式" }
    ],
    examples: [
      { cmd: "sudo fsck /dev/sdb1", desc: "检查并修复分区" },
      { cmd: "sudo fsck -n /dev/sdb1", desc: "只检查不修复" },
      { cmd: "sudo fsck -y /dev/sdb1", desc: "自动修复" }
    ],
    usageScenarios: [
      "修复损坏的文件系统",
      "磁盘检查"
    ],
    related: ["mkfs", "mount"],
    note: "必须在卸载的文件系统上运行"
  }
};

const ALL_COMMANDS: Record<string, LinuxCommand> = {
  ...COMMAND_DB,
  ...MYSQL_COMMAND_DB,
};

// 按分类获取命令
export function getCommandsByCategory(category: string): LinuxCommand[] {
  return Object.values(ALL_COMMANDS).filter(cmd => cmd.category === category);
}

// 搜索命令
export function searchCommands(keyword: string): LinuxCommand[] {
  const lowerKeyword = keyword.toLowerCase();
  return Object.values(ALL_COMMANDS).filter(cmd =>
    cmd.name.toLowerCase().includes(lowerKeyword) ||
    cmd.desc.toLowerCase().includes(lowerKeyword) ||
    cmd.longDesc.toLowerCase().includes(lowerKeyword)
  );
}

// 获取所有命令名称
export function getAllCommandNames(): string[] {
  return Object.keys(ALL_COMMANDS);
}

// 获取命令详情
export function getCommandByName(name: string): LinuxCommand | undefined {
  return ALL_COMMANDS[name];
}
