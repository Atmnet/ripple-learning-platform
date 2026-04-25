/**
 * Linux 测验题库
 * 包含 Linux 与 MySQL 题目，支持按分类进行知识测验
 */
import {
  MYSQL_CHOICE_QUESTIONS,
  MYSQL_FILL_QUESTIONS,
  MYSQL_TRUE_FALSE_QUESTIONS,
} from "./MySQLQuiz";

export type QuestionType = "choice" | "truefalse" | "fill";

export interface BaseQuestion {
  id: number;
  type: QuestionType;
  category: string;
  question: string;
  explain: string;
}

export interface ChoiceQuestion extends BaseQuestion {
  type: "choice";
  options: string[];
  answer: number; // 正确答案的索引
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "truefalse";
  answer: boolean;
}

export interface FillQuestion extends BaseQuestion {
  type: "fill";
  answer: string | string[]; // 支持多个正确答案
}

export type QuizQuestion = ChoiceQuestion | TrueFalseQuestion | FillQuestion;

// ============ 选择题 200道 ============
export const CHOICE_QUESTIONS: Omit<ChoiceQuestion, "id">[] = [
  // ===== 文件管理类 选择题 (50道) =====
  { type: "choice", category: "file", question: "哪个命令用于显示当前工作目录的完整路径？", options: ["ls", "pwd", "cd", "path"], answer: 1, explain: "pwd (Print Working Directory) 显示当前所在目录的完整路径" },
  { type: "choice", category: "file", question: "ls -la 命令中的 -a 选项是什么意思？", options: ["显示所有文件包括隐藏文件", "以详细格式显示", "按时间排序", "显示帮助信息"], answer: 0, explain: "-a 选项表示 all，显示所有文件包括隐藏文件（以.开头的文件）" },
  { type: "choice", category: "file", question: "如何创建一个名为 'test' 的新目录？", options: ["new test", "create test", "mkdir test", "makedir test"], answer: 2, explain: "mkdir (Make Directory) 用于创建新目录" },
  { type: "choice", category: "file", question: "删除非空目录应该使用哪个命令？", options: ["rm -d", "rmdir", "rm -r", "del"], answer: 2, explain: "rm -r 递归删除目录及其内容，rmdir只能删除空目录" },
  { type: "choice", category: "file", question: "cd .. 命令的作用是？", options: ["回到主目录", "切换到根目录", "返回上级目录", "切换到用户目录"], answer: 2, explain: ".. 表示上级目录，cd .. 返回上一级目录" },
  { type: "choice", category: "file", question: "cp file1.txt file2.txt 命令会？", options: ["移动文件", "复制文件", "重命名文件", "删除文件"], answer: 1, explain: "cp (Copy) 命令用于复制文件或目录" },
  { type: "choice", category: "file", question: "mv old.txt new.txt 命令的作用是？", options: ["复制文件", "移动文件", "重命名文件", "以上都可以"], answer: 3, explain: "mv 既可用于移动文件，也可用于重命名（在同一目录内移动即重命名）" },
  { type: "choice", category: "file", question: "touch 命令的主要用途是？", options: ["触摸文件", "创建空文件或更新时间戳", "修改文件内容", "查看文件"], answer: 1, explain: "touch 用于创建空文件或更新已有文件的时间戳" },
  { type: "choice", category: "file", question: "mkdir -p 中的 -p 选项表示？", options: ["显示创建过程", "递归创建父目录", "设置权限", "创建多个目录"], answer: 1, explain: "-p (parents) 自动创建不存在的父目录" },
  { type: "choice", category: "file", question: "rm -rf 命令中的 -f 选项表示？", options: ["强制删除不提示", "递归删除", "显示过程", "仅删除文件"], answer: 0, explain: "-f (force) 强制删除，不提示确认，忽略不存在的文件" },
  { type: "choice", category: "file", question: "ls -lh 中 -h 选项的作用是？", options: ["显示隐藏文件", "以人类可读格式显示大小", "按时间排序", "显示帮助"], answer: 1, explain: "-h (human-readable) 以 K、M、G 等格式显示文件大小" },
  { type: "choice", category: "file", question: "cd ~ 命令会切换到？", options: ["根目录", "上级目录", "用户主目录", "临时目录"], answer: 2, explain: "~ 代表当前用户的主目录（home directory）" },
  { type: "choice", category: "file", question: "cd - 命令的作用是？", options: ["切换到根目录", "切换到上次所在目录", "返回主目录", "无任何作用"], answer: 1, explain: "cd - 切换到上次所在的目录，方便在两个目录间切换" },
  { type: "choice", category: "file", question: "cp -r 命令中的 -r 选项表示？", options: ["递归复制目录", "强制覆盖", "显示过程", "保留属性"], answer: 0, explain: "-r (recursive) 递归复制，用于复制目录及其内容" },
  { type: "choice", category: "file", question: "mv -i 命令中的 -i 选项表示？", options: ["忽略错误", "交互式提示", "强制覆盖", "显示过程"], answer: 1, explain: "-i (interactive) 覆盖前提示用户确认" },
  { type: "choice", category: "file", question: "rm -i 命令中的 -i 选项表示？", options: ["强制删除", "删除前提示确认", "递归删除", "显示过程"], answer: 1, explain: "-i 在删除每个文件前提示用户确认，更安全" },
  { type: "choice", category: "file", question: "ls -t 命令会按什么排序？", options: ["文件名", "文件大小", "修改时间", "创建时间"], answer: 2, explain: "-t 按修改时间排序，最新的文件在前" },
  { type: "choice", category: "file", question: "ls -S 命令会按什么排序？", options: ["文件名", "文件大小", "修改时间", "访问时间"], answer: 1, explain: "-S 按文件大小排序，最大的文件在前" },
  { type: "choice", category: "file", question: "ls -r 命令的作用是？", options: ["递归显示", "反向排序", "显示相对路径", "只读模式"], answer: 1, explain: "-r (reverse) 反向排序，与其他排序选项配合使用" },
  { type: "choice", category: "file", question: "rmdir 命令只能删除什么样的目录？", options: ["任何目录", "空目录", "非空目录", "隐藏目录"], answer: 1, explain: "rmdir 只能删除空目录，删除非空目录需要用 rm -r" },
  { type: "choice", category: "file", question: "tree 命令的作用是？", options: ["显示目录树状结构", "显示进程树", "显示文件内容", "显示磁盘使用"], answer: 0, explain: "tree 以树状图形式显示目录结构" },
  { type: "choice", category: "file", question: "tree -L 2 中的 -L 选项表示？", options: ["显示行数", "限制显示层级深度", "列出文件", "显示链接"], answer: 1, explain: "-L 限制显示的目录层级深度，-L 2 只显示两层" },
  { type: "choice", category: "file", question: "ln -s 创建的是？", options: ["硬链接", "软链接/符号链接", "复制文件", "快捷方式"], answer: 1, explain: "ln -s 创建软链接（符号链接），类似于Windows快捷方式" },
  { type: "choice", category: "file", question: "ln 不加 -s 创建的是？", options: ["软链接", "硬链接", "副本", "快捷方式"], answer: 1, explain: "ln 默认创建硬链接，硬链接和原文件共享inode" },
  { type: "choice", category: "file", question: "stat 命令的作用是？", options: ["显示文件状态信息", "查看系统状态", "统计文件数量", "启动程序"], answer: 0, explain: "stat 显示文件的详细元数据，包括inode、权限、时间戳等" },
  { type: "choice", category: "file", question: "file 命令的作用是？", options: ["创建文件", "识别文件类型", "打开文件", "复制文件"], answer: 1, explain: "file 通过检查文件内容判断文件类型，不依赖扩展名" },
  { type: "choice", category: "file", question: "dd 命令常用于？", options: ["文本编辑", "磁盘复制和数据转换", "删除目录", "下载文件"], answer: 1, explain: "dd 是底层数据复制工具，常用于磁盘镜像、备份" },
  { type: "choice", category: "file", question: "cp -a 中的 -a 选项表示？", options: ["全部", "归档模式", "异步复制", "追加"], answer: 1, explain: "-a (archive) 归档模式，保留所有属性，相当于 -dR --preserve=all" },
  { type: "choice", category: "file", question: "cp -p 中的 -p 选项表示？", options: ["显示进度", "保留文件属性", "强制覆盖", "递归复制"], answer: 1, explain: "-p (preserve) 保留文件属性如修改时间、权限等" },
  { type: "choice", category: "file", question: "mkdir -v 中的 -v 选项表示？", options: ["显示版本", "显示创建过程", "显示帮助", "验证"], answer: 1, explain: "-v (verbose) 显示详细的创建过程" },
  { type: "choice", category: "file", question: "rm -v 中的 -v 选项表示？", options: ["显示版本", "显示删除过程", "验证", "仅查看"], answer: 1, explain: "-v 显示被删除的文件名" },
  { type: "choice", category: "file", question: "mv file1 file2 dir/ 会将文件？", options: ["复制到目录", "移动到目录", "在目录中创建链接", "删除文件"], answer: 1, explain: "mv 可以将多个文件移动到一个目录中" },
  { type: "choice", category: "file", question: "pwd -P 的作用是？", options: ["显示物理路径", "显示逻辑路径", "打印工作目录", "显示父目录"], answer: 0, explain: "-P 显示物理路径，解析所有符号链接" },
  { type: "choice", category: "file", question: "ls -d 的作用是？", options: ["显示目录本身", "删除目录", "显示详细信息", "显示隐藏文件"], answer: 0, explain: "-d 显示目录本身而不是其内容" },
  { type: "choice", category: "file", question: "touch -t 的作用是？", options: ["创建临时文件", "指定时间戳", "测试文件", "显示类型"], answer: 1, explain: "-t 使用指定的时间戳而不是当前时间" },
  { type: "choice", category: "file", question: "chmod 777 file 设置什么权限？", options: ["只读", "读写", "读写执行", "无权限"], answer: 2, explain: "777 = rwxrwxrwx，所有用户都有读写执行权限" },
  { type: "choice", category: "file", question: "chmod 644 file 设置什么权限？", options: ["所有者可读写，其他只读", "所有人可读写", "只有所有者可读", "所有者可执行"], answer: 0, explain: "644 = rw-r--r--，所有者可读写，组和其他用户只读" },
  { type: "choice", category: "file", question: "chmod 755 directory 通常用于？", options: ["保护目录", "允许所有人访问目录", "设置目录可执行", "禁止访问"], answer: 1, explain: "755 = rwxr-xr-x，所有者可读写执行，其他人可读执行进入目录" },
  { type: "choice", category: "file", question: "chmod u+x file 表示？", options: ["给所有者添加执行权限", "给用户添加写权限", "给组添加执行权限", "给所有用户添加权限"], answer: 0, explain: "u+x 给文件所有者(u=user)添加执行(x)权限" },
  { type: "choice", category: "file", question: "chmod g-w file 表示？", options: ["给组添加写权限", "给组移除写权限", "给所有者移除写权限", "给其他用户移除写权限"], answer: 1, explain: "g-w 给组(group)移除写(write)权限" },
  { type: "choice", category: "file", question: "chmod a+r file 表示？", options: ["给所有者添加读权限", "给组添加读权限", "给所有用户添加读权限", "移除读权限"], answer: 2, explain: "a+r 给所有(all)用户添加读(read)权限" },
  { type: "choice", category: "file", question: "chown user:group file 的作用是？", options: ["修改文件内容", "修改文件所有者和组", "修改文件名", "修改文件权限"], answer: 1, explain: "chown 修改文件的所有者和所属组" },
  { type: "choice", category: "file", question: "chown -R 中的 -R 表示？", options: ["读取模式", "递归修改", "反向修改", "恢复默认"], answer: 1, explain: "-R (recursive) 递归修改目录及其内容的权限" },

  // ===== 文本处理类 选择题 (40道) =====
  { type: "choice", category: "text", question: "查看文件内容的命令是？", options: ["see", "view", "cat", "show"], answer: 2, explain: "cat 命令用于连接并显示文件内容" },
  { type: "choice", category: "text", question: "在 less 中如何退出查看？", options: ["按 q", "按 x", "按 exit", "按 quit"], answer: 0, explain: "在 less 查看器中，按 q 键退出" },
  { type: "choice", category: "text", question: "显示文件最后10行的命令是？", options: ["head", "tail", "last", "end"], answer: 1, explain: "tail 命令默认显示文件最后10行，head显示开头" },
  { type: "choice", category: "text", question: "grep 命令的作用是？", options: ["排序文件", "在文件中搜索文本", "替换文本", "统计字数"], answer: 1, explain: "grep (Global Regular Expression Print) 用于搜索匹配的行" },
  { type: "choice", category: "text", question: "tar -czvf archive.tar.gz dir 命令中 -z 选项表示？", options: ["压缩", "解压", "使用gzip压缩", "显示过程"], answer: 2, explain: "-z 选项表示使用 gzip 进行压缩/解压" },
  { type: "choice", category: "text", question: "head -n 20 file.txt 显示文件的？", options: ["最后20行", "前20行", "第20行", "20个字符"], answer: 1, explain: "head -n 20 显示文件的前20行" },
  { type: "choice", category: "text", question: "tail -f log.txt 的作用是？", options: ["显示最后10行", "实时追踪文件新增内容", "显示前10行", "查找错误"], answer: 1, explain: "tail -f (follow) 实时显示文件新增内容，常用于监控日志" },
  { type: "choice", category: "text", question: "less 相比 more 的优势是？", options: ["只能向前翻页", "可以前后翻页和搜索", "显示更快", "占用更少内存"], answer: 1, explain: "less 支持前后翻页、搜索等功能，比 more 更强大" },
  { type: "choice", category: "text", question: "在 less 中如何向前翻页？", options: ["空格键", "b键", "f键", "n键"], answer: 1, explain: "在 less 中按 b 键向前翻一页（back），空格向后翻页" },
  { type: "choice", category: "text", question: "在 less 中如何搜索？", options: ["按 / 后输入关键词", "按 s", "按 f", "按 ?"], answer: 0, explain: "按 / 后输入关键词搜索，n 查找下一个，N 查找上一个" },
  { type: "choice", category: "text", question: "grep -i pattern file 中的 -i 表示？", options: ["显示行号", "忽略大小写", "反向匹配", "递归搜索"], answer: 1, explain: "-i (ignore case) 忽略大小写进行匹配" },
  { type: "choice", category: "text", question: "grep -n pattern file 中的 -n 表示？", options: ["忽略大小写", "显示行号", "反向匹配", "统计数量"], answer: 1, explain: "-n (line number) 显示匹配行的行号" },
  { type: "choice", category: "text", question: "grep -v pattern file 中的 -v 表示？", options: ["显示版本", "反向匹配", "详细模式", "验证模式"], answer: 1, explain: "-v (invert) 反向匹配，显示不包含pattern的行" },
  { type: "choice", category: "text", question: "grep -r pattern dir/ 中的 -r 表示？", options: ["反向匹配", "递归搜索", "随机搜索", "替换"], answer: 1, explain: "-r (recursive) 递归搜索目录中的所有文件" },
  { type: "choice", category: "text", question: "grep -c pattern file 中的 -c 表示？", options: ["创建文件", "统计匹配行数", "复制文件", "清空文件"], answer: 1, explain: "-c (count) 只输出匹配的行数" },
  { type: "choice", category: "text", question: "wc file.txt 默认输出什么？", options: ["只有行数", "行数、字数、字节数", "只有字数", "文件大小"], answer: 1, explain: "wc 默认输出文件的行数、字数和字节数" },
  { type: "choice", category: "text", question: "wc -w file.txt 统计的是？", options: ["行数", "字数/单词数", "字节数", "字符数"], answer: 1, explain: "-w (words) 统计文件中的字数（单词数）" },
  { type: "choice", category: "text", question: "sort file.txt 默认按什么排序？", options: ["数字大小", "字母顺序", "时间", "文件大小"], answer: 1, explain: "sort 默认按字母顺序（ASCII顺序）对每行排序" },
  { type: "choice", category: "text", question: "sort -n file.txt 的作用是？", options: ["反向排序", "按数字排序", "忽略大小写", "按行号排序"], answer: 1, explain: "-n (numeric) 按数字大小排序而不是字母顺序" },
  { type: "choice", category: "text", question: "sort -r file.txt 的作用是？", options: ["随机排序", "反向排序", "递归排序", "恢复排序"], answer: 1, explain: "-r (reverse) 反向排序（降序）" },
  { type: "choice", category: "text", question: "uniq file.txt 的作用是？", options: ["统计唯一值", "去除相邻重复行", "排序", "计数"], answer: 1, explain: "uniq 去除相邻的重复行，通常需要先 sort 排序" },
  { type: "choice", category: "text", question: "uniq -c file.txt 的作用是？", options: ["去重", "统计每行出现次数", "排序", "清空文件"], answer: 1, explain: "uniq -c (count) 统计每行出现的次数" },
  { type: "choice", category: "text", question: "cut -d: -f1 /etc/passwd 的作用是？", options: ["显示完整文件", "按冒号分割提取第1列", "删除第1列", "排序第1列"], answer: 1, explain: "-d 指定分隔符，-f 指定提取的字段（列）" },
  { type: "choice", category: "text", question: "awk '{print $1}' file.txt 的作用是？", options: ["打印第一行", "打印第一列", "打印整个文件", "打印文件名"], answer: 1, explain: "$1 表示第一个字段（列），awk 默认按空格分割" },
  { type: "choice", category: "text", question: "sed 's/old/new/' file.txt 的作用是？", options: ["删除old", "将第一个old替换为new", "将所有old替换为new", "查找old"], answer: 1, explain: "sed s/old/new/ 替换每行第一个匹配的 old 为 new" },
  { type: "choice", category: "text", question: "sed 's/old/new/g' file.txt 中的 g 表示？", options: ["全局替换", "仅第一行", "仅最后一行", "生成新文件"], answer: 0, explain: "g (global) 全局替换，替换所有匹配而不仅是第一个" },
  { type: "choice", category: "text", question: "tr 'a-z' 'A-Z' 的作用是？", options: ["排序", "小写转大写", "翻译", "截断"], answer: 1, explain: "tr 进行字符转换，将 a-z 转换为 A-Z" },
  { type: "choice", category: "text", question: "echo 'hello' | tee file.txt 的作用是？", options: ["仅保存到文件", "显示并保存到文件", "追加到文件", "删除文件"], answer: 1, explain: "tee 从标准输入读取，同时输出到屏幕和文件" },
  { type: "choice", category: "text", question: "echo 'hello' | tee -a file.txt 中的 -a 表示？", options: ["全部", "追加到文件", "异步", "自动"], answer: 1, explain: "-a (append) 追加到文件而不是覆盖" },
  { type: "choice", category: "text", question: "find . -name '*.txt' | xargs rm 的作用是？", options: ["查找文件", "删除找到的文件", "复制文件", "移动文件"], answer: 1, explain: "xargs 将 find 的结果作为参数传给 rm 命令删除" },
  { type: "choice", category: "text", question: "cat -n file.txt 的作用是？", options: ["排序", "显示行号", "反转", "清空"], answer: 1, explain: "-n (number) 显示所有行的行号" },
  { type: "choice", category: "text", question: "cat -b file.txt 的作用是？", options: ["显示所有行号", "显示行号（空行除外）", "反向显示", "分屏显示"], answer: 1, explain: "-b (number-nonblank) 显示非空行的行号" },
  { type: "choice", category: "text", question: "more file.txt 相比 cat 的优势是？", options: ["更快", "分页显示大文件", "可以编辑", "占用更少内存"], answer: 1, explain: "more 分页显示文件，适合查看大文件" },
  { type: "choice", category: "text", question: "tail -n +5 file.txt 显示？", options: ["前5行", "第5行", "从第5行开始到末尾", "最后5行"], answer: 2, explain: "-n +5 表示从第5行开始显示到文件末尾" },
  { type: "choice", category: "text", question: "head -n -5 file.txt 显示？", options: ["前5行", "最后5行", "除最后5行外的所有行", "第5行"], answer: 2, explain: "-n -5 表示显示除最后5行外的所有内容" },

  // ===== 系统监控类 选择题 (35道) =====
  { type: "choice", category: "system", question: "显示所有进程信息的命令是？", options: ["process", "tasklist", "ps aux", "showproc"], answer: 2, explain: "ps aux 显示系统中所有用户的所有进程" },
  { type: "choice", category: "system", question: "ps aux | grep nginx 的作用是？", options: ["启动nginx", "停止nginx", "查找nginx进程", "安装nginx"], answer: 2, explain: "用管道将ps aux的输出传给grep过滤，查找nginx进程" },
  { type: "choice", category: "system", question: "top 命令的主要作用是？", options: ["显示文件顶部", "实时显示进程状态", "查看网络", "查看磁盘"], answer: 1, explain: "top 实时显示系统中进程的CPU、内存等资源使用情况" },
  { type: "choice", category: "system", question: "在 top 中按 M 键会？", options: ["显示帮助", "按内存排序", "按CPU排序", "显示更多选项"], answer: 1, explain: "top 中按 M 按内存使用率排序，按 P 按CPU排序" },
  { type: "choice", category: "system", question: "df -h 的作用是？", options: ["显示目录大小", "显示磁盘空间（人类可读）", "显示文件数量", "显示进程"], answer: 1, explain: "df (disk free) -h 以人类可读格式显示磁盘空间" },
  { type: "choice", category: "system", question: "du -sh dir/ 的作用是？", options: ["删除目录", "显示目录总大小", "显示目录内容", "复制目录"], answer: 1, explain: "du (disk usage) -s 汇总 -h 人类可读，显示目录总大小" },
  { type: "choice", category: "system", question: "free -h 的作用是？", options: ["释放内存", "显示内存使用情况", "清空缓存", "显示空闲时间"], answer: 1, explain: "free 显示系统内存和交换分区使用情况" },
  { type: "choice", category: "system", question: "uptime 命令显示？", options: ["系统运行时间和负载", "当前时间", "空闲时间", "启动时间"], answer: 0, explain: "uptime 显示系统已运行时间、当前时间和平均负载" },
  { type: "choice", category: "system", question: "htop 与 top 的区别是？", options: ["htop更慢", "htop有彩色界面和更多交互功能", "top功能更多", "没有区别"], answer: 1, explain: "htop 是 top 的增强版，有彩色界面、鼠标支持、更易用" },
  { type: "choice", category: "system", question: "kill 1234 的作用是？", options: ["启动进程", "终止PID为1234的进程", "查看进程", "重启进程"], answer: 1, explain: "kill 向指定PID的进程发送终止信号" },
  { type: "choice", category: "system", question: "kill -9 1234 中的 -9 表示？", options: ["9秒后终止", "强制终止", "第九个进程", "信号9"], answer: 1, explain: "-9 (SIGKILL) 强制终止进程，进程无法忽略" },
  { type: "choice", category: "system", question: "pkill process_name 的作用是？", options: ["按PID终止", "按名称终止进程", "暂停进程", "启动进程"], answer: 1, explain: "pkill 按进程名称终止匹配的进程" },
  { type: "choice", category: "system", question: "pgrep process_name 的作用是？", options: ["终止进程", "查找进程PID", "查看进程树", "启动进程"], answer: 1, explain: "pgrep 按名称查找进程的PID" },
  { type: "choice", category: "system", question: "vmstat 1 中的 1 表示？", options: ["显示1次", "每秒刷新一次", "显示1个进程", "持续1秒"], answer: 1, explain: "数字参数表示刷新间隔（秒），vmstat 1 每秒刷新" },
  { type: "choice", category: "system", question: "iostat 主要用于监控？", options: ["网络", "磁盘I/O", "内存", "CPU"], answer: 1, explain: "iostat 报告CPU统计和设备的I/O统计信息" },
  { type: "choice", category: "system", question: "lsof -i :80 的作用是？", options: ["监听80端口", "查看使用80端口的进程", "关闭80端口", "打开80端口"], answer: 1, explain: "lsof -i :80 查看使用80端口的进程信息" },
  { type: "choice", category: "system", question: "dmesg 命令显示？", options: ["消息日志", "内核环缓冲消息", "用户消息", "错误消息"], answer: 1, explain: "dmesg 显示内核环缓冲区的消息，包含启动信息" },
  { type: "choice", category: "system", question: "whoami 命令显示？", options: ["当前用户", "当前主机名", "当前时间", "当前目录"], answer: 0, explain: "whoami 显示当前用户的用户名" },
  { type: "choice", category: "system", question: "uname -a 的作用是？", options: ["显示所有系统信息", "显示用户名", "显示网络", "显示时间"], answer: 0, explain: "uname -a 显示系统内核名称、版本、主机名等所有信息" },
  { type: "choice", category: "system", question: "hostname 命令显示？", options: ["主机名", "用户名", "域名", "IP地址"], answer: 0, explain: "hostname 显示或设置系统的主机名" },
  { type: "choice", category: "system", question: "date 命令的作用是？", options: ["显示日期时间", "设置日期", "删除文件", "显示日历"], answer: 0, explain: "date 显示或设置系统日期和时间" },
  { type: "choice", category: "system", question: "clear 命令的作用是？", options: ["删除文件", "清空终端屏幕", "清除缓存", "重置系统"], answer: 1, explain: "clear 清空终端屏幕（相当于Ctrl+L）" },
  { type: "choice", category: "system", question: "echo $PATH 显示？", options: ["当前路径", "环境变量PATH的值", "文件路径", "目录路径"], answer: 1, explain: "$PATH 是环境变量，包含可执行文件的搜索路径" },
  { type: "choice", category: "system", question: "env 命令的作用是？", options: ["设置环境", "显示所有环境变量", "执行命令", "编辑配置"], answer: 1, explain: "env 显示当前所有的环境变量" },
  { type: "choice", category: "system", question: "which python 的作用是？", options: ["安装python", "查找python可执行文件路径", "运行python", "显示python版本"], answer: 1, explain: "which 在PATH中查找可执行文件的完整路径" },
  { type: "choice", category: "system", question: "whereis ls 的作用是？", options: ["查找ls命令的位置及相关文件", "运行ls", "显示ls帮助", "检查ls版本"], answer: 0, explain: "whereis 查找命令的二进制、源码和手册页位置" },
  { type: "choice", category: "system", question: "w 命令显示？", options: ["当前目录", "已登录用户及其操作", "系统时间", "网络状态"], answer: 1, explain: "w 显示已登录用户及他们正在执行的命令" },
  { type: "choice", category: "system", question: "who 命令显示？", options: ["当前用户", "已登录用户信息", "所有者", "管理员"], answer: 1, explain: "who 显示当前登录系统的用户信息" },
  { type: "choice", category: "system", question: "last 命令显示？", options: ["最后一条命令", "用户登录历史", "最后修改的文件", "系统启动时间"], answer: 1, explain: "last 显示用户的最近登录历史记录" },
  { type: "choice", category: "system", question: "crontab -l 的作用是？", options: ["列出当前用户的定时任务", "编辑定时任务", "删除定时任务", "启动定时任务"], answer: 0, explain: "crontab -l (list) 列出当前用户的定时任务" },
  { type: "choice", category: "system", question: "systemctl status sshd 的作用是？", options: ["启动ssh服务", "查看ssh服务状态", "停止ssh服务", "重启ssh服务"], answer: 1, explain: "systemctl status 查看服务的运行状态" },

  // ===== 网络工具类 选择题 (30道) =====
  { type: "choice", category: "network", question: "测试与目标主机的网络连通性用什么命令？", options: ["test", "ping", "connect", "nettest"], answer: 1, explain: "ping 发送ICMP包测试网络连通性和延迟" },
  { type: "choice", category: "network", question: "ping -c 4 baidu.com 中的 -c 4 表示？", options: ["连续ping", "ping 4次后停止", "每4秒ping一次", "ping 4个不同地址"], answer: 1, explain: "-c (count) 指定发送数据包的数量" },
  { type: "choice", category: "network", question: "curl 命令的主要作用是？", options: ["下载文件", "从URL传输数据", "测试网络", "显示网络配置"], answer: 1, explain: "curl 是强大的数据传输工具，支持HTTP、FTP等多种协议" },
  { type: "choice", category: "network", question: "curl -O URL 的作用是？", options: ["仅显示内容", "保存为远程文件名", "显示响应头", "跟随重定向"], answer: 1, explain: "-O (remote-name) 使用远程服务器的文件名保存" },
  { type: "choice", category: "network", question: "curl -I URL 的作用是？", options: ["下载文件", "仅显示响应头", "显示帮助", "安装软件"], answer: 1, explain: "-I (head) 发送HEAD请求，只获取响应头" },
  { type: "choice", category: "network", question: "wget 命令主要用于？", options: ["上传文件", "下载文件", "测试网络", "配置网络"], answer: 1, explain: "wget 是非交互式的网络文件下载工具" },
  { type: "choice", category: "network", question: "wget -c URL 中的 -c 表示？", options: ["继续下载", "复制", "创建", "检查"], answer: 0, explain: "-c (continue) 断点续传，从上次中断处继续下载" },
  { type: "choice", category: "network", question: "netstat -tuln 显示？", options: ["所有TCP和UDP监听端口", "所有进程", "所有用户", "所有文件"], answer: 0, explain: "-t TCP -u UDP -l 监听 -n 数字显示" },
  { type: "choice", category: "network", question: "netstat -anp 中的 -p 表示？", options: ["显示进程信息", "显示端口", "显示协议", "显示包"], answer: 0, explain: "-p (programs) 显示使用该连接的进程信息" },
  { type: "choice", category: "network", question: "ss -tlnp 与 netstat 相比？", options: ["更慢", "更快更高效", "功能更少", "已废弃"], answer: 1, explain: "ss 是 netstat 的现代替代品，速度更快" },
  { type: "choice", category: "network", question: "traceroute baidu.com 的作用是？", options: ["测试带宽", "追踪数据包路由路径", "显示DNS", "连接远程主机"], answer: 1, explain: "traceroute 显示数据包到达目标经过的路由节点" },
  { type: "choice", category: "network", question: "nslookup baidu.com 的作用是？", options: ["查找域名对应的IP", "测试连通性", "下载网页", "发送邮件"], answer: 0, explain: "nslookup 查询DNS服务器获取域名解析信息" },
  { type: "choice", category: "network", question: "dig baidu.com 的作用是？", options: ["挖掘数据", "DNS查询工具", "下载", "压缩"], answer: 1, explain: "dig 是功能强大的DNS查询工具" },
  { type: "choice", category: "network", question: "ssh user@host 的作用是？", options: ["发送邮件", "安全远程登录", "文件传输", "网络测试"], answer: 1, explain: "ssh (Secure Shell) 提供加密的远程登录" },
  { type: "choice", category: "network", question: "ssh -p 2222 user@host 中的 -p 表示？", options: ["密码", "端口号", "协议", "路径"], answer: 1, explain: "-p (port) 指定SSH连接的端口（默认22）" },
  { type: "choice", category: "network", question: "scp file.txt user@host:/path/ 的作用是？", options: ["远程登录", "安全复制文件到远程主机", "删除远程文件", "查看远程文件"], answer: 1, explain: "scp (secure copy) 基于SSH在主机间安全复制文件" },
  { type: "choice", category: "network", question: "scp -r dir/ user@host:/path/ 中的 -r 表示？", options: ["读取", "递归复制目录", "重启", "恢复"], answer: 1, explain: "-r (recursive) 递归复制整个目录" },
  { type: "choice", category: "network", question: "ifconfig 命令的作用是？", options: ["显示网络接口配置", "修改配置文件", "显示进程", "显示文件"], answer: 0, explain: "ifconfig 显示或配置网络接口信息" },
  { type: "choice", category: "network", question: "ip addr 与 ifconfig 相比？", options: ["更旧", "更现代推荐", "功能更少", "仅查看"], answer: 1, explain: "ip 命令是现代Linux推荐的网络配置工具" },
  { type: "choice", category: "network", question: "nc -zv host 80 的作用是？", options: ["连接", "测试端口连通性", "传输文件", "聊天"], answer: 1, explain: "nc (netcat) -z 扫描模式，测试端口是否开放" },
  { type: "choice", category: "network", question: "telnet host 80 的主要用途是？", options: ["加密连接", "测试端口连接", "文件传输", "远程登录（不推荐）"], answer: 1, explain: "telnet 现主要用于测试端口连接，因不加密不推荐用于远程登录" },
  { type: "choice", category: "network", question: "curl -L URL 中的 -L 表示？", options: ["列出", "跟随重定向", "本地", "日志"], answer: 1, explain: "-L (location) 跟随HTTP重定向" },
  { type: "choice", category: "network", question: "hostname -I 显示？", options: ["主机名", "IP地址", "域名", "网关"], answer: 1, explain: "hostname -I 显示主机的IP地址" },
  { type: "choice", category: "network", question: "route -n 显示？", options: ["路由器", "路由表", "网络设备", "网络统计"], answer: 1, explain: "route 显示和管理IP路由表" },

  // ===== 权限管理类 选择题 (20道) =====
  { type: "choice", category: "permission", question: "chmod 755 file 中的 755 表示什么权限？", options: ["所有用户可读可写可执行", "所有者全权限，其他读执行", "只有所有者可读写", "所有人只有读权限"], answer: 1, explain: "755 = rwxr-xr-x，所有者读写执行，组和其他用户读执行" },
  { type: "choice", category: "permission", question: "chmod 644 file 设置什么权限？", options: ["所有者可读写，其他只读", "所有人可读写", "只有所有者可读", "所有者可执行"], answer: 0, explain: "644 = rw-r--r--，所有者可读写，组和其他用户只读" },
  { type: "choice", category: "permission", question: "chmod 777 file 设置什么权限？", options: ["所有人只读", "所有人读写", "所有人读写执行", "只有所有者可访问"], answer: 2, explain: "777 = rwxrwxrwx，所有用户都有读写执行权限（不安全）" },
  { type: "choice", category: "permission", question: "chmod u+x file 表示？", options: ["给所有者添加执行权限", "给用户添加写权限", "给组添加执行权限", "给所有用户添加权限"], answer: 0, explain: "u+x 给文件所有者(u=user)添加执行(x)权限" },
  { type: "choice", category: "permission", question: "chmod g-w file 表示？", options: ["给组添加写权限", "给组移除写权限", "给所有者移除写权限", "给其他用户移除写权限"], answer: 1, explain: "g-w 给组(group)移除写(write)权限" },
  { type: "choice", category: "permission", question: "chmod o+r file 表示？", options: ["给所有者添加读权限", "给组添加读权限", "给其他用户添加读权限", "给所有用户添加权限"], answer: 2, explain: "o+r 给其他(other)用户添加读(read)权限" },
  { type: "choice", category: "permission", question: "chmod a+x file 中的 a 表示？", options: ["管理员", "所有用户", "任意", "追加"], answer: 1, explain: "a 表示 all，即所有者、组、其他所有用户" },
  { type: "choice", category: "permission", question: "chown user file 的作用是？", options: ["修改文件内容", "修改文件所有者", "修改文件名", "修改文件权限"], answer: 1, explain: "chown (change owner) 修改文件的所有者" },
  { type: "choice", category: "permission", question: "chown user:group file 的作用是？", options: ["修改所有者和组", "修改权限", "修改内容", "复制文件"], answer: 0, explain: "user:group 格式同时修改所有者和所属组" },
  { type: "choice", category: "permission", question: "sudo 命令的作用是？", options: ["切换用户", "以超级用户权限执行", "显示进程", "关闭系统"], answer: 1, explain: "sudo (superuser do) 以root权限执行命令" },
  { type: "choice", category: "permission", question: "su - 命令的作用是？", options: ["保存文件", "切换到root用户并加载环境", "显示用户", "启动服务"], answer: 1, explain: "su (switch user) - 切换到root并加载其环境变量" },
  { type: "choice", category: "permission", question: "ls -l 显示的权限格式如 -rw-r--r-- 中，第一个字符 '-' 表示？", options: ["普通文件", "目录", "链接", "设备"], answer: 0, explain: "第一个字符：- 普通文件，d 目录，l 链接，c/b 设备" },
  { type: "choice", category: "permission", question: "umask 0022 中的 022 表示？", options: ["创建文件的默认权限掩码", "用户ID", "组ID", "进程ID"], answer: 0, explain: "umask 设置新建文件/目录的默认权限掩码" },
  { type: "choice", category: "permission", question: "文件权限 rwxr-xr-x 数值表示为？", options: ["777", "755", "644", "711"], answer: 1, explain: "r=4 w=2 x=1，rwx=7 r-x=5 r-x=5，所以是755" },
  { type: "choice", category: "permission", question: "chgrp group file 的作用是？", options: ["修改所有者", "修改所属组", "修改权限", "修改文件名"], answer: 1, explain: "chgrp (change group) 修改文件的所属组" },
  { type: "choice", category: "permission", question: "sudo -i 的作用是？", options: ["查看信息", "模拟登录到root shell", "安装软件", "重启系统"], answer: 1, explain: "sudo -i (initial login) 模拟root登录，加载root环境" },
  { type: "choice", category: "permission", question: "passwd 命令的作用是？", options: ["查看密码", "修改密码", "删除密码", "创建用户"], answer: 1, explain: "passwd 修改用户密码" },
  { type: "choice", category: "permission", question: "id 命令显示？", options: ["进程ID", "用户和组ID信息", "文件名", "IP地址"], answer: 1, explain: "id 显示当前用户的UID、GID和所属的组" },
  { type: "choice", category: "permission", question: "groups 命令显示？", options: ["系统进程", "当前用户所属的所有组", "网络组", "文件组"], answer: 1, explain: "groups 显示当前用户所属的所有组" },
  { type: "choice", category: "permission", question: "whoami 显示？", options: ["当前用户", "主机名", "域名", "时间"], answer: 0, explain: "whoami 显示当前用户名" },

  // ===== 压缩归档类 选择题 (15道) =====
  { type: "choice", category: "compression", question: "tar -cvf archive.tar dir/ 中的 -c 表示？", options: ["检查", "创建", "复制", "清除"], answer: 1, explain: "-c (create) 创建新的归档文件" },
  { type: "choice", category: "compression", question: "tar -xvf archive.tar 中的 -x 表示？", options: ["检查", "解压/提取", "执行", "退出"], answer: 1, explain: "-x (extract) 从归档中提取文件" },
  { type: "choice", category: "compression", question: "tar -tvf archive.tar 中的 -t 表示？", options: ["测试", "列出内容", "时间", "类型"], answer: 1, explain: "-t (list) 列出归档文件的内容" },
  { type: "choice", category: "compression", question: "tar -czvf archive.tar.gz dir/ 中的 -z 表示？", options: ["压缩", "使用gzip", "零压缩", "区域"], answer: 1, explain: "-z 使用 gzip 进行压缩或解压" },
  { type: "choice", category: "compression", question: "tar -cjvf archive.tar.bz2 dir/ 中的 -j 表示？", options: ["连接", "使用bzip2", "跳转", "作业"], answer: 1, explain: "-j 使用 bzip2 进行压缩或解压" },
  { type: "choice", category: "compression", question: "gzip file.txt 会生成？", options: ["file.txt.gz", "file.txt.zip", "file.gz", "archive.gz"], answer: 0, explain: "gzip 压缩后原文件被替换为 .gz 文件" },
  { type: "choice", category: "compression", question: "gzip -d file.txt.gz 的作用是？", options: ["删除", "解压", "下载", "显示"], answer: 1, explain: "-d (decompress) 解压 gzip 文件" },
  { type: "choice", category: "compression", question: "gunzip 与 gzip -d 的关系是？", options: ["完全不同", "gunzip 等价于 gzip -d", "gunzip更强大", "gzip更快"], answer: 1, explain: "gunzip 是 gzip -d 的别名，功能完全相同" },
  { type: "choice", category: "compression", question: "bzip2 与 gzip 相比？", options: ["速度更快", "压缩比更高但速度较慢", "功能更少", "已废弃"], answer: 1, explain: "bzip2 通常比 gzip 压缩比高 10-15%，但速度较慢" },
  { type: "choice", category: "compression", question: "zip archive.zip file.txt 的作用是？", options: ["解压", "创建zip压缩包", "查看", "删除"], answer: 1, explain: "zip 创建兼容Windows的zip格式压缩包" },
  { type: "choice", category: "compression", question: "unzip archive.zip 的作用是？", options: ["创建压缩包", "解压zip文件", "查看内容", "删除"], answer: 1, explain: "unzip 解压 .zip 格式的压缩文件" },
  { type: "choice", category: "compression", question: "tar -C /tmp -xvf archive.tar 中的 -C 表示？", options: ["创建", "切换到指定目录", "检查", "复制"], answer: 1, explain: "-C (directory) 切换到指定目录再执行操作" },
  { type: "choice", category: "compression", question: "xz file.txt 会生成？", options: ["压缩比最高的文件", "file.txt.xz", "file.xz", "archive.xz"], answer: 1, explain: "xz 压缩生成 .xz 文件，压缩比通常最高" },
  { type: "choice", category: "compression", question: "tar 命令中 -p 选项表示？", options: ["暂停", "保留权限", "打印", "管道"], answer: 1, explain: "-p (preserve) 保留文件权限等属性" },
  { type: "choice", category: "compression", question: "tar -xf archive.tar --wildcards '*.txt' 的作用是？", options: ["解压所有文件", "只解压匹配的txt文件", "列出文件", "测试归档"], answer: 1, explain: "--wildcards 配合模式匹配，只解压匹配的文件" },

  // ===== 搜索查找类 选择题 (10道) =====
  { type: "choice", category: "search", question: "find . -name '*.txt' 的作用是？", options: ["创建txt文件", "查找所有txt文件", "删除txt文件", "重命名txt文件"], answer: 1, explain: "find 递归搜索指定名称的文件" },
  { type: "choice", category: "search", question: "find . -type d 的作用是？", options: ["查找所有文件", "查找所有目录", "查找链接", "查找设备"], answer: 1, explain: "-type d (directory) 只匹配目录类型" },
  { type: "choice", category: "search", question: "find . -size +100M 的作用是？", options: ["创建100M文件", "查找大于100M的文件", "删除大文件", "压缩文件"], answer: 1, explain: "-size +100M 查找大于100MB的文件" },
  { type: "choice", category: "search", question: "locate filename 与 find 相比？", options: ["更慢但更精确", "更快但可能过时", "功能更少", "已废弃"], answer: 1, explain: "locate 使用预建数据库搜索，速度快但可能包含已删除文件" },
  { type: "choice", category: "search", question: "updatedb 命令的作用是？", options: ["更新系统", "更新locate数据库", "更新软件", "更新时间"], answer: 1, explain: "updatedb 更新 locate 使用的文件数据库" },
  { type: "choice", category: "search", question: "which python 的作用是？", options: ["安装python", "查找python命令路径", "运行python", "显示版本"], answer: 1, explain: "which 在PATH中查找可执行文件的完整路径" },
  { type: "choice", category: "search", question: "whereis ls 的作用是？", options: ["运行ls", "查找ls命令及相关文件", "显示ls帮助", "显示ls版本"], answer: 1, explain: "whereis 查找命令的二进制、源码和手册页" },
  { type: "choice", category: "search", question: "type cd 的作用是？", options: ["运行cd", "显示cd命令的类型", "显示cd位置", "创建cd别名"], answer: 1, explain: "type 显示命令的类型（内建/别名/外部命令）" },
  { type: "choice", category: "search", question: "find . -mtime -7 的作用是？", options: ["7天前修改的文件", "最近7天内修改的文件", "7分钟后修改的文件", "修改时间为7点的文件"], answer: 1, explain: "-mtime -7 查找最近7天内修改的文件（-表示以内）" },
  { type: "choice", category: "search", question: "find . -name '*.log' -delete 的作用是？", options: ["查找日志文件", "删除找到的日志文件", "复制日志文件", "压缩日志文件"], answer: 1, explain: "-delete 删除找到的文件，与 -exec rm {} \\; 类似" },

  // ===== 补充选择题 (22道) =====
  { type: "choice", category: "file", question: "cp -v file1.txt file2.txt 中的 -v 表示？", options: ["查看", "显示过程（verbose）", "验证", "版本"], answer: 1, explain: "-v (verbose) 显示详细的复制过程" },
  { type: "choice", category: "file", question: "rm -rf /tmp/* 会删除？", options: ["/tmp目录本身", "/tmp目录下的所有内容", "根目录", "临时文件"], answer: 1, explain: "rm -rf /tmp/* 删除/tmp下的所有内容，但不删除/tmp目录本身" },
  { type: "choice", category: "file", question: "mv -f file1 file2 中的 -f 表示？", options: ["强制覆盖", "跟随", "格式化", "快速"], answer: 0, explain: "-f (force) 强制覆盖，不提示确认" },
  { type: "choice", category: "text", question: "grep -l pattern *.txt 的作用是？", options: ["列出匹配行", "只显示包含匹配的文件名", "显示行号", "统计数量"], answer: 1, explain: "-l (files-with-matches) 只显示包含匹配的文件名" },
  { type: "choice", category: "text", question: "grep -w word file.txt 的作用是？", options: ["显示整行", "只匹配整个单词", "显示字数", "反向匹配"], answer: 1, explain: "-w (word-regexp) 只匹配整个单词，不是子串" },
  { type: "choice", category: "text", question: "sort -u file.txt 的作用是？", options: ["排序并去重", "反向排序", "唯一排序", "更新排序"], answer: 0, explain: "-u (unique) 排序并去重，相当于 sort file | uniq" },
  { type: "choice", category: "system", question: "killall firefox 的作用是？", options: ["杀死一个firefox进程", "杀死所有firefox进程", "重启firefox", "启动firefox"], answer: 1, explain: "killall 按名称杀死所有匹配的进程" },
  { type: "choice", category: "system", question: "pstree 命令显示？", options: ["目录树", "进程树", "文件树", "用户树"], answer: 1, explain: "pstree 以树状图显示进程间的关系" },
  { type: "choice", category: "system", question: "nohup command & 的作用是？", options: ["前台运行", "后台运行且不受挂起影响", "定时运行", "循环运行"], answer: 1, explain: "nohup 使命令在后台运行，用户退出后仍继续执行" },
  { type: "choice", category: "system", question: "jobs 命令显示？", options: ["工作任务", "后台作业", "系统服务", "计划任务"], answer: 1, explain: "jobs 显示当前shell的后台作业状态" },
  { type: "choice", category: "network", question: "curl -s URL 中的 -s 表示？", options: ["保存", "静默模式", "安全模式", "显示"], answer: 1, explain: "-s (silent) 静默模式，不显示进度和错误信息" },
  { type: "choice", category: "network", question: "wget -P /tmp URL 中的 -P 表示？", options: ["端口", "保存到指定目录", "密码", "协议"], answer: 1, explain: "-P (directory-prefix) 指定下载保存的目录" },
  { type: "choice", category: "permission", question: "visudo 命令的作用是？", options: ["查看sudo", "安全编辑sudoers文件", "显示sudo日志", "验证sudo配置"], answer: 1, explain: "visudo 以安全方式编辑sudoers配置文件" },
  { type: "choice", category: "permission", question: "sudo -s 的作用是？", options: ["显示", "启动shell", "保存", "设置"], answer: 1, explain: "sudo -s 启动一个root权限的shell" },
  { type: "choice", category: "compression", question: "tar -czf archive.tar.gz dir/ 与 tar -czvf 的区别是？", options: ["压缩比不同", "是否显示过程", "压缩算法不同", "归档格式不同"], answer: 1, explain: "-v (verbose) 显示详细过程，不加则静默执行" },
  { type: "choice", category: "search", question: "find / -name file.txt 2>/dev/null 中的 2>/dev/null 表示？", options: ["显示错误", "丢弃错误信息", "重定向输出", "显示输出"], answer: 1, explain: "2>/dev/null 将标准错误（2）重定向到/dev/null丢弃" },
  { type: "choice", category: "text", question: "diff file1 file2 的作用是？", options: ["比较两个文件的差异", "显示文件不同", "合并文件", "分割文件"], answer: 0, explain: "diff 逐行比较两个文件的差异" },
  { type: "choice", category: "text", question: "comm file1 file2 的作用是？", options: ["比较两个已排序文件的差异", "合并文件", "压缩文件", "显示公共部分"], answer: 0, explain: "comm 比较两个已排序文件，显示共有、独有行" },
  { type: "choice", category: "system", question: "alias ll='ls -la' 的作用是？", options: ["创建目录", "创建命令别名", "列出文件", "显示帮助"], answer: 1, explain: "alias 创建命令别名，ll 就成为 ls -la 的快捷方式" },
  { type: "choice", category: "file", question: "basename /path/to/file.txt 的结果是？", options: ["/path/to/", "file.txt", "file", "txt"], answer: 1, explain: "basename 提取路径中的文件名部分" },
  { type: "choice", category: "file", question: "dirname /path/to/file.txt 的结果是？", options: ["/path/to", "file.txt", "/", "path"], answer: 0, explain: "dirname 提取路径中的目录部分" },
  { type: "choice", category: "text", question: "paste file1 file2 的作用是？", options: ["合并文件的行", "并排合并文件", "复制文件", "显示文件"], answer: 1, explain: "paste 将多个文件的行并排合并，默认用制表符分隔" },

  // ===== Shell脚本 选择题 (35道) =====
  // 变量系统 (10道)
  { type: "choice", category: "shell", question: "Shell中定义变量 name='Linux'，以下说法正确的是？", options: ["等号两边必须有空格", "等号两边不能有空格", "变量名必须以字母开头", "变量名区分大小写"], answer: 1, explain: "Shell变量定义时等号两边不能有空格，否则会被解释为命令" },
  { type: "choice", category: "shell", question: "如何引用变量name的值？", options: ["name", "$name", "#name", "&name"], answer: 1, explain: "$变量名 用于引用变量的值" },
  { type: "choice", category: "shell", question: "readonly 命令的作用是？", options: ["读取变量", "定义只读变量", "删除变量", "列出所有变量"], answer: 1, explain: "readonly 用于定义不可修改的常量" },
  { type: "choice", category: "shell", question: "$# 表示什么？", options: ["参数的值", "参数的个数", "上条命令的退出码", "当前进程ID"], answer: 1, explain: "$# 表示传递给脚本或函数的参数个数" },
  { type: "choice", category: "shell", question: "$0 表示什么？", options: ["第一个参数", "脚本名称", "最后一个参数", "参数总数"], answer: 1, explain: "$0 表示当前脚本或命令的名称" },
  { type: "choice", category: "shell", question: "$? 表示什么？", options: ["参数的值", "上条命令的退出状态码", "当前时间", "随机数"], answer: 1, explain: "$? 保存上一条命令的退出状态码，0表示成功" },
  { type: "choice", category: "shell", question: "unset 命令的作用是？", options: ["设置变量", "删除变量", "读取变量", "导出变量"], answer: 1, explain: "unset 用于删除已定义的变量" },
  { type: "choice", category: "shell", question: "${name} 和 $name 的区别是？", options: ["没有区别", "花括号可以更清晰界定变量边界", "${name}是数组语法", "$name是函数调用"], answer: 1, explain: "${变量名} 可以更清晰地界定变量边界，防止与后续字符混淆" },
  { type: "choice", category: "shell", question: "$$ 表示什么？", options: ["参数值", "当前进程ID", "父进程ID", "上条命令的退出码"], answer: 1, explain: "$$ 表示当前Shell进程的ID" },
  { type: "choice", category: "shell", question: "shift 命令的作用是？", options: ["切换目录", "将参数左移", "移动文件", "改变环境"], answer: 1, explain: "shift 将位置参数向左移动，$2变成$1" },

  // 条件判断 (10道)
  { type: "choice", category: "shell", question: "[ $a -eq 5 ] 中 -eq 的含义是？", options: ["等于（字符串）", "等于（数值）", "不等于", "赋值"], answer: 1, explain: "-eq 用于数值比较，表示 equal（等于）" },
  { type: "choice", category: "shell", question: "[ $a -gt 10 ] 中 -gt 的含义是？", options: ["大于", "小于", "等于", "不等于"], answer: 0, explain: "-gt 表示 greater than（大于）" },
  { type: "choice", category: "shell", question: "[ -f file.txt ] 测试什么？", options: ["是否是目录", "是否是普通文件", "是否可读", "是否可写"], answer: 1, explain: "-f 测试文件是否存在且是普通文件" },
  { type: "choice", category: "shell", question: "[ -d /tmp ] 测试什么？", options: ["文件是否存在", "是否是目录", "是否可读", "是否为空"], answer: 1, explain: "-d 测试文件是否存在且是目录" },
  { type: "choice", category: "shell", question: "[ -z \"$name\" ] 测试什么？", options: ["字符串非空", "字符串为空", "变量是否存在", "字符串长度"], answer: 1, explain: "-z 测试字符串长度是否为0（空串）" },
  { type: "choice", category: "shell", question: "[ \"$a\" = \"$b\" ] 中 = 的含义是？", options: ["赋值", "数值等于", "字符串相等", "不等于"], answer: 2, explain: "在 [ ] 中 = 用于字符串相等比较" },
  { type: "choice", category: "shell", question: "if 语句以什么结束？", options: ["end", "done", "fi", "endif"], answer: 2, explain: "if 语句以 fi 结束（if倒过来）" },
  { type: "choice", category: "shell", question: "[ $a -eq 5 -a $b -eq 3 ] 中 -a 的含义是？", options: ["逻辑与(and)", "逻辑或(or)", "赋值", "比较"], answer: 0, explain: "-a 表示逻辑与(and)，两个条件都满足" },
  { type: "choice", category: "shell", question: "elif 是什么意思？", options: ["否则", "如果", "否则如果", "结束"], answer: 2, explain: "elif 是 else if 的缩写，表示否则如果" },
  { type: "choice", category: "shell", question: "[ -e file.txt ] 测试什么？", options: ["文件是否存在", "是否是目录", "是否可执行", "是否非空"], answer: 0, explain: "-e 测试文件是否存在" },

  // 循环结构 (10道)
  { type: "choice", category: "shell", question: "for i in 1 2 3; do ... done 是什么结构？", options: ["if语句", "for循环", "while循环", "case语句"], answer: 1, explain: "这是for循环，遍历列表中的每个元素" },
  { type: "choice", category: "shell", question: "while [ $i -lt 5 ]; do ... done 什么时候停止？", options: ["i等于5时", "i大于等于5时", "i小于5时", "i等于0时"], answer: 1, explain: "while在条件为假时停止，-lt是小于，条件为假时i>=5" },
  { type: "choice", category: "shell", question: "for file in *.txt 会遍历什么？", options: ["所有文件", "所有txt文件", "所有目录", "所有隐藏文件"], answer: 1, explain: "*.txt 匹配所有以.txt结尾的文件" },
  { type: "choice", category: "shell", question: "break 命令的作用是？", options: ["继续下一次循环", "立即退出循环", "暂停循环", "跳过本次循环"], answer: 1, explain: "break 用于立即退出整个循环" },
  { type: "choice", category: "shell", question: "continue 命令的作用是？", options: ["退出循环", "跳过本次循环剩余部分，继续下一次", "暂停执行", "继续执行"], answer: 1, explain: "continue 跳过本次循环剩余部分，直接进入下一次循环" },
  { type: "choice", category: "shell", question: "until 循环与 while 循环的区别是？", options: ["没有区别", "until在条件为假时执行", "until只能用于文件测试", "until是无限循环"], answer: 1, explain: "until与while相反，until在条件为假时执行，直到条件为真才停止" },
  { type: "choice", category: "shell", question: "{1..5} 会展开成什么？", options: ["1 2 3 4 5", "1-5", "1到5", "{1..5}"], answer: 0, explain: "大括号展开 {1..5} 会生成 1 2 3 4 5" },
  { type: "choice", category: "shell", question: "for循环中 do 和 done 的作用是什么？", options: ["开始和结束", "循环体开始和结束", "条件判断", "参数传递"], answer: 1, explain: "do 表示循环体开始，done 表示循环结束" },
  { type: "choice", category: "shell", question: "while read line; do ... done < file.txt 的作用是？", options: ["写入文件", "逐行读取文件", "删除文件", "复制文件"], answer: 1, explain: "while read 配合重定向是逐行读取文件的标准方法" },
  { type: "choice", category: "shell", question: "$@ 表示什么？", options: ["参数个数", "所有参数作为多个字符串", "所有参数作为一个字符串", "第一个参数"], answer: 1, explain: "$@ 表示所有位置参数，作为多个独立的字符串" },

  // case语句 (5道)
  { type: "choice", category: "shell", question: "case 语句以什么结束？", options: ["end", "done", "esac", "endcase"], answer: 2, explain: "case 语句以 esac 结束（case倒过来）" },
  { type: "choice", category: "shell", question: "case语句中 ;; 的作用是？", options: ["继续下一个模式", "代码块结束", "逻辑与", "注释"], answer: 1, explain: ";; 表示该模式的代码块结束" },
  { type: "choice", category: "shell", question: "case $a in [Yy]*) 匹配什么？", options: ["以Y或y开头的字符串", "Y和y", "Y或y", "Yy"], answer: 0, explain: "[Yy]* 匹配以 Y 或 y 开头的任意字符串" },
  { type: "choice", category: "shell", question: "case语句中 *) 表示什么？", options: ["乘法", "默认匹配", "所有文件", "正则表达式"], answer: 1, explain: "*) 是默认模式，匹配前面所有模式都不匹配的情况" },
  { type: "choice", category: "shell", question: "case语句中每个模式以什么符号结束？", options: [":", ";", ")", ","], answer: 2, explain: "case语句中每个模式以 ) 结束" },

  // ===== 软件包管理类 选择题 (40道) =====
  { type: "choice", category: "package", question: "在Ubuntu/Debian系统中，更新软件包列表用什么命令？", options: ["apt upgrade", "apt update", "apt refresh", "apt sync"], answer: 1, explain: "apt update 从软件源获取最新的软件包信息" },
  { type: "choice", category: "package", question: "apt upgrade 的作用是？", options: ["更新软件列表", "升级所有已安装软件包", "安装新软件", "清理缓存"], answer: 1, explain: "apt upgrade 升级所有已安装的软件包到最新版本" },
  { type: "choice", category: "package", question: "apt install nginx 的作用是？", options: ["更新nginx", "安装nginx软件包", "删除nginx", "搜索nginx"], answer: 1, explain: "apt install 用于安装指定的软件包" },
  { type: "choice", category: "package", question: "apt remove nginx 和 apt purge nginx 的区别是？", options: ["没有区别", "remove保留配置文件，purge删除配置", "remove删除配置，purge保留配置", "remove是假删除"], answer: 1, explain: "remove 删除软件但保留配置文件，purge 彻底删除包括配置文件" },
  { type: "choice", category: "package", question: "apt search mysql 的作用是？", options: ["安装mysql", "搜索mysql相关的软件包", "查看mysql信息", "删除mysql"], answer: 1, explain: "apt search 在软件源中搜索匹配的软件包" },
  { type: "choice", category: "package", question: "apt autoremove 的作用是？", options: ["删除所有软件", "删除不再需要的依赖包", "自动安装依赖", "清理日志"], answer: 1, explain: "apt autoremove 删除自动安装但不再需要的依赖包" },
  { type: "choice", category: "package", question: "dpkg -i package.deb 的作用是？", options: ["删除deb包", "安装deb包", "查看deb包信息", "解压deb包"], answer: 1, explain: "dpkg -i (install) 安装.deb格式的软件包" },
  { type: "choice", category: "package", question: "dpkg -l | grep nginx 的作用是？", options: ["安装nginx", "查看已安装的nginx包", "删除nginx", "搜索nginx文件"], answer: 1, explain: "dpkg -l 列出所有已安装的包，配合grep查找特定包" },
  { type: "choice", category: "package", question: "dpkg -L vim 的作用是？", options: ["卸载vim", "查看vim安装了哪些文件", "安装vim", "搜索vim"], answer: 1, explain: "dpkg -L 列出指定软件包安装的所有文件" },
  { type: "choice", category: "package", question: "dpkg 和 apt 的主要区别是？", options: ["没有区别", "dpkg不处理依赖，apt自动处理依赖", "dpkg更高级", "apt只能删除"], answer: 1, explain: "dpkg是底层工具不处理依赖，apt是高级工具自动解决依赖" },
  { type: "choice", category: "package", question: "在CentOS/RHEL系统中，安装软件用什么命令？", options: ["apt install", "yum install", "pacman -S", "snap install"], answer: 1, explain: "yum install 是CentOS/RHEL系统的软件安装命令" },
  { type: "choice", category: "package", question: "yum update 的作用是？", options: ["仅更新软件列表", "升级所有已安装的软件包", "安装新软件", "删除旧软件"], answer: 1, explain: "yum update 更新系统中所有已安装的软件包" },
  { type: "choice", category: "package", question: "yum search httpd 的作用是？", options: ["安装httpd", "在仓库中搜索httpd", "删除httpd", "查看httpd日志"], answer: 1, explain: "yum search 在软件仓库中搜索匹配的软件包" },
  { type: "choice", category: "package", question: "rpm -ivh package.rpm 中的 vh 表示？", options: ["版本和帮助", "详细和显示进度", "验证和安装", "查看和隐藏"], answer: 1, explain: "-v (verbose) 详细输出，-h (hash) 显示安装进度条" },
  { type: "choice", category: "package", question: "rpm -qa | grep vim 的作用是？", options: ["安装vim", "查询已安装的vim包", "删除vim", "搜索vim文件"], answer: 1, explain: "-q (query) -a (all) 查询所有已安装的包" },
  { type: "choice", category: "package", question: "dnf 和 yum 的关系是？", options: ["完全相同", "dnf是yum的下一代版本", "dnf是旧版本", "没有关系"], answer: 1, explain: "dnf 是 yum 的下一代版本，提供更好的依赖解析和性能" },
  { type: "choice", category: "package", question: "pacman -S vim 是在哪个发行版中使用的？", options: ["Ubuntu", "CentOS", "Arch Linux", "Debian"], answer: 2, explain: "pacman 是 Arch Linux 及其衍生版的包管理器" },
  { type: "choice", category: "package", question: "pacman -Syu 的作用是？", options: ["仅安装软件", "同步并更新系统", "删除软件", "清理缓存"], answer: 1, explain: "-S (sync) -y (refresh) -u (upgrade) 同步并更新系统" },
  { type: "choice", category: "package", question: "snap install code --classic 中的 --classic 表示？", options: ["经典版本", "允许访问系统资源", "安装旧版", "仅安装一次"], answer: 1, explain: "--classic 允许snap应用拥有更广泛的系统访问权限" },
  { type: "choice", category: "package", question: "flatpak install flathub org.videolan.VLC 中的 flathub 是？", options: ["软件名", "远程仓库名称", "版本号", "作者名"], answer: 1, explain: "flathub 是Flatpak的主要软件仓库（remote）" },
  { type: "choice", category: "package", question: "pip install requests 的作用是？", options: ["安装系统软件", "安装Python库", "删除Python", "更新系统"], answer: 1, explain: "pip 是Python的包管理器，用于安装Python库" },
  { type: "choice", category: "package", question: "pip install -r requirements.txt 的作用是？", options: ["安装单个包", "从文件批量安装依赖", "删除依赖", "导出依赖"], answer: 1, explain: "-r (requirements) 从requirements.txt文件批量安装依赖" },
  { type: "choice", category: "package", question: "npm install -g typescript 中的 -g 表示？", options: ["获取最新版", "全局安装", "仅安装一次", "图形界面安装"], answer: 1, explain: "-g (global) 全局安装，所有项目可用" },
  { type: "choice", category: "package", question: "gem install rails 是在安装什么？", options: ["系统软件", "Ruby gem包", "Python库", "Node模块"], answer: 1, explain: "gem 是Ruby的包管理器，rails是Ruby的Web框架" },
  { type: "choice", category: "package", question: "apt list --installed 的作用是？", options: ["列出可安装软件", "列出已安装软件", "删除已安装软件", "更新软件列表"], answer: 1, explain: "--installed 选项只显示已安装的软件包" },
  { type: "choice", category: "package", question: "apt show nginx 的作用是？", options: ["安装nginx", "显示nginx软件包详细信息", "删除nginx", "搜索nginx"], answer: 1, explain: "apt show 显示软件包的详细描述、版本、依赖等信息" },
  { type: "choice", category: "package", question: "dpkg -S /bin/ls 的作用是？", options: ["查看文件内容", "查看文件属于哪个包", "安装文件", "删除文件"], answer: 1, explain: "-S (search) 查找文件属于哪个软件包" },
  { type: "choice", category: "package", question: "yum info httpd 的作用是？", options: ["安装httpd", "显示httpd软件包信息", "删除httpd", "搜索httpd"], answer: 1, explain: "yum info 显示软件包的详细信息" },
  { type: "choice", category: "package", question: "yum clean all 的作用是？", options: ["删除所有软件", "清理所有缓存", "更新系统", "列出软件"], answer: 1, explain: "yum clean all 清理下载的软件包缓存" },
  { type: "choice", category: "package", question: "rpm -qf /usr/bin/python3 的作用是？", options: ["安装Python", "查询文件属于哪个包", "删除Python", "搜索文件"], answer: 1, explain: "-qf (query file) 查询指定文件属于哪个rpm包" },
  { type: "choice", category: "package", question: "pacman -R firefox 的作用是？", options: ["安装firefox", "删除firefox", "搜索firefox", "更新firefox"], answer: 1, explain: "-R (remove) 删除指定的软件包" },
  { type: "choice", category: "package", question: "snap list 的作用是？", options: ["列出可安装软件", "列出已安装的snap", "删除snap", "搜索snap"], answer: 1, explain: "snap list 列出系统中已安装的snap软件" },
  { type: "choice", category: "package", question: "flatpak update 的作用是？", options: ["安装新应用", "更新所有Flatpak应用", "删除应用", "搜索应用"], answer: 1, explain: "flatpak update 更新所有已安装的Flatpak应用" },
  { type: "choice", category: "package", question: "pip list 的作用是？", options: ["列出系统软件", "列出已安装的Python包", "删除Python包", "搜索Python包"], answer: 1, explain: "pip list 列出当前环境中所有已安装的Python包" },
  { type: "choice", category: "package", question: "pip freeze > requirements.txt 的作用是？", options: ["从文件安装", "导出依赖到文件", "删除依赖", "更新依赖"], answer: 1, explain: "pip freeze 导出当前环境的依赖列表，> 重定向到文件" },
  { type: "choice", category: "package", question: "npm uninstall lodash 的作用是？", options: ["安装lodash", "卸载lodash", "更新lodash", "搜索lodash"], answer: 1, explain: "npm uninstall 删除已安装的npm包" },
  { type: "choice", category: "package", question: "npm run build 的作用是？", options: ["安装依赖", "运行package.json中定义的build脚本", "删除构建文件", "搜索包"], answer: 1, explain: "npm run 执行package.json scripts中定义的命令" },
  { type: "choice", category: "package", question: "gem list 的作用是？", options: ["列出系统用户", "列出已安装的gem", "删除gem", "搜索gem"], answer: 1, explain: "gem list 列出所有已安装的Ruby gem" },
  { type: "choice", category: "package", question: "gem update 的作用是？", options: ["安装新gem", "更新所有gem", "删除gem", "搜索gem"], answer: 1, explain: "gem update 更新所有已安装的gem到最新版本" },
  { type: "choice", category: "package", question: "使用apt安装软件通常需要什么权限？", options: ["普通用户", "sudo或root权限", "游客权限", "不需要权限"], answer: 1, explain: "软件包安装是系统级操作，需要sudo或root权限" },
  { type: "choice", category: "package", question: "apt-get dist-upgrade 和 apt-get upgrade 的区别是？", options: ["没有区别", "dist-upgrade可以升级系统组件", "upgrade更快", "dist-upgrade是旧命令"], answer: 1, explain: "dist-upgrade 可以处理依赖变化，升级系统核心组件" },

  // ===== 磁盘管理类 选择题 (20道) =====
  { type: "choice", category: "file", question: "fdisk -l 的作用是？", options: ["创建分区", "列出所有磁盘分区", "删除分区", "格式化磁盘"], answer: 1, explain: "fdisk -l 列出系统中所有磁盘和分区信息" },
  { type: "choice", category: "file", question: "lsblk 的作用是？", options: ["列出块设备", "列出文件", "列出进程", "列出用户"], answer: 0, explain: "lsblk 以树状结构列出所有块设备及其挂载点" },
  { type: "choice", category: "file", question: "mount /dev/sdb1 /mnt 的作用是？", options: ["格式化分区", "将分区挂载到/mnt", "删除分区", "创建分区"], answer: 1, explain: "mount 将文件系统挂载到指定挂载点" },
  { type: "choice", category: "file", question: "umount /mnt 的作用是？", options: ["挂载/mnt", "卸载/mnt", "删除/mnt", "创建/mnt"], answer: 1, explain: "umount 卸载已挂载的文件系统" },
  { type: "choice", category: "file", question: "blkid /dev/sda1 的作用是？", options: ["创建文件系统", "显示分区的UUID和类型", "删除分区", "挂载分区"], answer: 1, explain: "blkid 显示块设备的UUID、文件系统类型等属性" },
  { type: "choice", category: "file", question: "mkfs -t ext4 /dev/sdb1 的作用是？", options: ["挂载分区", "创建ext4文件系统", "删除分区", "查看分区"], answer: 1, explain: "mkfs 在设备上创建文件系统（格式化）" },
  { type: "choice", category: "file", question: "sync 命令的作用是？", options: ["同步时间", "将内存数据写入磁盘", "同步网络", "同步进程"], answer: 1, explain: "sync 强制将内存中的数据写入磁盘" },
  { type: "choice", category: "file", question: "fsck /dev/sdb1 的作用是？", options: ["格式化分区", "检查和修复文件系统", "挂载分区", "查看分区"], answer: 1, explain: "fsck 检查和修复Linux文件系统错误" },
  { type: "choice", category: "file", question: "eject /dev/cdrom 的作用是？", options: ["挂载光盘", "弹出光盘", "格式化光盘", "查看光盘"], answer: 1, explain: "eject 弹出可移动介质（光盘、USB等）" },
  { type: "choice", category: "file", question: "parted -l 的作用是？", options: ["创建分区", "列出所有分区", "删除分区", "格式化分区"], answer: 1, explain: "parted -l 列出所有磁盘的分区表信息" },

  // ===== 用户管理类 选择题 (20道) =====
  { type: "choice", category: "permission", question: "useradd -m john 中的 -m 表示？", options: ["修改用户", "创建主目录", "设置密码", "添加注释"], answer: 1, explain: "-m (create-home) 创建用户时同时创建主目录" },
  { type: "choice", category: "permission", question: "userdel -r john 中的 -r 表示？", options: ["重命名", "删除主目录", "保留配置", "强制删除"], answer: 1, explain: "-r (remove) 删除用户及其主目录和邮件" },
  { type: "choice", category: "permission", question: "usermod -aG sudo john 的作用是？", options: ["删除用户", "将john添加到sudo组", "修改用户名", "删除sudo组"], answer: 1, explain: "-aG (append to group) 将用户添加到附加组" },
  { type: "choice", category: "permission", question: "groupadd developers 的作用是？", options: ["删除组", "创建developers组", "修改组", "查看组"], answer: 1, explain: "groupadd 创建新的用户组" },
  { type: "choice", category: "permission", question: "gpasswd -a john developers 的作用是？", options: ["删除组", "添加john到developers组", "删除john", "修改组名"], answer: 1, explain: "gpasswd -a 将用户添加到组" },
  { type: "choice", category: "permission", question: "last 命令显示什么？", options: ["最后一条命令", "用户登录历史", "最后修改的文件", "系统启动时间"], answer: 1, explain: "last 显示用户的最近登录历史记录" },
  { type: "choice", category: "permission", question: "w 命令显示什么？", options: ["当前目录", "已登录用户及其操作", "系统时间", "网络状态"], answer: 1, explain: "w 显示当前登录用户及其正在执行的命令" },
  { type: "choice", category: "permission", question: "who 命令显示什么？", options: ["当前用户", "已登录用户信息", "所有者", "管理员"], answer: 1, explain: "who 显示当前登录系统的用户信息" },
  { type: "choice", category: "permission", question: "lastlog 命令的作用是？", options: ["显示登录历史", "显示所有用户最近登录", "显示系统日志", "显示错误日志"], answer: 1, explain: "lastlog 显示系统中所有用户的最近登录信息" },
  { type: "choice", category: "permission", question: "passwd john 的作用是？", options: ["查看密码", "修改john的密码", "删除john", "创建john"], answer: 1, explain: "passwd 修改指定用户的密码" },

  // ===== 进程管理增强 选择题 (10道) =====
  { type: "choice", category: "system", question: "pgrep ssh 的作用是？", options: ["终止ssh", "查找ssh进程的PID", "启动ssh", "安装ssh"], answer: 1, explain: "pgrep 按进程名查找进程的PID" },
  { type: "choice", category: "system", question: "pkill firefox 的作用是？", options: ["启动firefox", "终止所有firefox进程", "安装firefox", "查找firefox"], answer: 1, explain: "pkill 按名称发送信号终止匹配的进程" },
  { type: "choice", category: "system", question: "killall nginx 的作用是？", options: ["启动nginx", "终止所有名为nginx的进程", "安装nginx", "查看nginx"], answer: 1, explain: "killall 按进程名终止所有匹配的进程" },
  { type: "choice", category: "system", question: "nice -n 10 ./script.sh 的作用是？", options: ["10秒后运行", "以优先级10运行脚本", "运行10次", "运行10秒"], answer: 1, explain: "nice 以指定的调度优先级运行命令，值越大优先级越低" },
  { type: "choice", category: "system", question: "renice 10 -p 1234 的作用是？", options: ["重启进程", "修改进程1234的优先级为10", "删除进程", "查看进程"], answer: 1, explain: "renice 修改正在运行的进程的优先级" },
  { type: "choice", category: "system", question: "nohup ./script.sh & 的作用是？", options: ["前台运行", "后台运行且用户退出后继续运行", "立即终止", "定时运行"], answer: 1, explain: "nohup 使命令在用户退出登录后继续运行" },
  { type: "choice", category: "system", question: "watch -n 1 ps aux 的作用是？", options: ["运行一次ps", "每秒刷新显示进程列表", "每分钟运行", "仅查看一次"], answer: 1, explain: "watch 定期执行命令，-n 1 表示每秒刷新" },
  { type: "choice", category: "system", question: "jobs 命令显示什么？", options: ["系统作业", "当前shell的后台作业", "计划任务", "历史命令"], answer: 1, explain: "jobs 显示当前shell中后台运行的作业" },
  { type: "choice", category: "system", question: "命令后加 & 符号的作用是？", options: ["强制结束", "在后台运行", "输出到文件", "输入从文件"], answer: 1, explain: "& 符号使命令在后台运行" },

];

// ============ 判断题 50道 ============
export const TRUE_FALSE_QUESTIONS: Omit<TrueFalseQuestion, "id">[] = [
  // 文件管理类判断题 (15道)
  { type: "truefalse", category: "file", question: "ls -a 命令会显示以 . 开头的隐藏文件", answer: true, explain: "正确。-a (all) 选项显示所有文件，包括隐藏文件" },
  { type: "truefalse", category: "file", question: "rm -rf / 是一个危险的命令，会删除系统所有文件", answer: true, explain: "正确。rm -rf / 递归强制删除根目录下所有文件，会摧毁系统" },
  { type: "truefalse", category: "file", question: "cp 命令在复制文件时会删除源文件", answer: false, explain: "错误。cp 是复制，源文件保留；mv 才是移动（会删除源文件）" },
  { type: "truefalse", category: "file", question: "cd ~ 命令会切换到用户主目录", answer: true, explain: "正确。~ 代表当前用户的主目录" },
  { type: "truefalse", category: "file", question: "rmdir 命令可以删除非空目录", answer: false, explain: "错误。rmdir 只能删除空目录，删除非空目录需要用 rm -r" },
  { type: "truefalse", category: "file", question: "touch 命令既可以创建空文件，也可以更新已有文件的时间戳", answer: true, explain: "正确。touch 创建不存在的文件，或更新已有文件的时间" },
  { type: "truefalse", category: "file", question: "mkdir -p 可以递归创建多级目录", answer: true, explain: "正确。-p (parents) 自动创建不存在的父目录" },
  { type: "truefalse", category: "file", question: "mv 命令既可以移动文件，也可以重命名文件", answer: true, explain: "正确。mv 用于移动，在同一目录内移动即重命名" },
  { type: "truefalse", category: "file", question: "ls -l 命令输出中，文件大小默认以字节为单位显示", answer: true, explain: "正确。ls -l 默认以字节显示，加 -h 可用人类可读格式" },
  { type: "truefalse", category: "file", question: "chmod 777 file 会给所有用户设置只读权限", answer: false, explain: "错误。777 是 rwxrwxrwx，所有用户都有读写执行权限，不是只读" },
  { type: "truefalse", category: "file", question: "ln -s 创建的是硬链接", answer: false, explain: "错误。ln -s 创建软链接（符号链接），硬链接不需要 -s" },
  { type: "truefalse", category: "file", question: "软链接可以跨文件系统，而硬链接不可以", answer: true, explain: "正确。软链接可以指向不同分区的文件，硬链接必须在同一文件系统" },
  { type: "truefalse", category: "file", question: "rm 删除的文件会进入回收站，可以恢复", answer: false, explain: "错误。rm 永久删除文件，不会进入回收站，删除需谨慎" },
  { type: "truefalse", category: "file", question: "pwd 命令显示当前工作目录的完整路径", answer: true, explain: "正确。pwd (Print Working Directory) 显示当前完整路径" },
  { type: "truefalse", category: "file", question: "cd .. 命令会切换到根目录", answer: false, explain: "错误。cd .. 是切换到上级目录，不是根目录（根目录是 /）" },

  // 文本处理类判断题 (10道)
  { type: "truefalse", category: "text", question: "cat 命令适合查看大文件内容", answer: false, explain: "错误。cat 会一次性输出所有内容，不适合大文件，大文件应使用 less" },
  { type: "truefalse", category: "text", question: "tail -f 可以实时查看日志文件的新增内容", answer: true, explain: "正确。tail -f (follow) 会持续监控文件并显示新增内容" },
  { type: "truefalse", category: "text", question: "grep 命令默认区分大小写", answer: true, explain: "正确。grep 默认区分大小写，使用 -i 选项可忽略大小写" },
  { type: "truefalse", category: "text", question: "less 命令只能向前翻页，不能向后", answer: false, explain: "错误。less 支持前后翻页，按 b 键向前，空格向后" },
  { type: "truefalse", category: "text", question: "wc -l 统计文件的行数", answer: true, explain: "正确。wc -l (line) 统计文件的行数" },
  { type: "truefalse", category: "text", question: "sort 命令默认按数字大小排序", answer: false, explain: "错误。sort 默认按字母顺序排序，-n 选项才按数字排序" },
  { type: "truefalse", category: "text", question: "uniq 命令可以去除文件中所有重复行", answer: false, explain: "错误。uniq 只能去除相邻的重复行，通常需要先 sort 排序" },
  { type: "truefalse", category: "text", question: "head 默认显示文件的前10行", answer: true, explain: "正确。head 默认显示前10行，可用 -n 指定行数" },
  { type: "truefalse", category: "text", question: "sed 's/old/new/g' 会替换每行的第一个匹配", answer: false, explain: "错误。g 表示全局，会替换所有匹配；不加 g 才只替换第一个" },
  { type: "truefalse", category: "text", question: "awk 是一个文本处理编程语言", answer: true, explain: "正确。awk 是强大的文本处理工具，支持模式匹配和计算" },

  // 系统监控类判断题 (10道)
  { type: "truefalse", category: "system", question: "ps aux 显示当前用户的所有进程", answer: false, explain: "错误。ps aux 显示系统中所有用户的所有进程，不只是当前用户" },
  { type: "truefalse", category: "system", question: "top 命令会实时更新进程状态", answer: true, explain: "正确。top 实时显示进程状态，默认每隔几秒刷新" },
  { type: "truefalse", category: "system", question: "kill -9 是礼貌地请求进程终止", answer: false, explain: "错误。kill -9 (SIGKILL) 是强制终止，进程无法阻止；默认的 -15 才是礼貌请求" },
  { type: "truefalse", category: "system", question: "df 命令显示磁盘空间使用情况", answer: true, explain: "正确。df (disk free) 显示文件系统的磁盘空间使用情况" },
  { type: "truefalse", category: "system", question: "free 命令显示CPU使用情况", answer: false, explain: "错误。free 显示内存使用情况，top 或 htop 才显示CPU使用" },
  { type: "truefalse", category: "system", question: "uptime 命令显示系统已运行时间", answer: true, explain: "正确。uptime 显示系统运行时间、当前时间和平均负载" },
  { type: "truefalse", category: "system", question: "du -sh 显示目录的总大小", answer: true, explain: "正确。du -s (summary) -h (human-readable) 显示目录总大小" },
  { type: "truefalse", category: "system", question: "lsof 命令用于列出打开的文件", answer: true, explain: "正确。lsof (list open files) 列出进程打开的文件" },
  { type: "truefalse", category: "system", question: "htop 是 top 的简化版", answer: false, explain: "错误。htop 是 top 的增强版，有彩色界面、鼠标支持和更多功能" },
  { type: "truefalse", category: "system", question: "dmesg 显示内核环缓冲区的消息", answer: true, explain: "正确。dmesg 显示内核消息，包括启动信息和硬件检测" },

  // 网络工具类判断题 (8道)
  { type: "truefalse", category: "network", question: "ping 命令使用TCP协议测试连通性", answer: false, explain: "错误。ping 使用 ICMP 协议，不是 TCP" },
  { type: "truefalse", category: "network", question: "curl -O 使用远程文件名保存下载的文件", answer: true, explain: "正确。curl -O (remote-name) 使用服务器上的文件名保存" },
  { type: "truefalse", category: "network", question: "wget 和 curl 功能完全相同", answer: false, explain: "错误。wget 专精于下载，curl 更通用支持更多协议和功能" },
  { type: "truefalse", category: "network", question: "ssh 提供加密的远程登录", answer: true, explain: "正确。ssh (Secure Shell) 使用加密传输，比 telnet 安全" },
  { type: "truefalse", category: "network", question: "netstat 和 ss 功能类似，但 ss 更快", answer: true, explain: "正确。ss 是 netstat 的现代替代品，速度更快更高效" },
  { type: "truefalse", category: "network", question: "telnet 是安全的远程登录工具", answer: false, explain: "错误。telnet 明文传输不安全，生产环境应使用 ssh" },
  { type: "truefalse", category: "network", question: "scp 基于 SSH 进行安全文件传输", answer: true, explain: "正确。scp (secure copy) 使用 SSH 协议加密传输" },
  { type: "truefalse", category: "network", question: "ifconfig 是现代Linux推荐使用的网络配置工具", answer: false, explain: "错误。ip 命令是现代推荐工具，ifconfig 已逐渐被淘汰" },

  // 权限管理类判断题 (7道)
  { type: "truefalse", category: "permission", question: "chmod 755 中，7 表示所有者的权限", answer: true, explain: "正确。chmod 三位数字分别代表所有者、组、其他用户的权限" },
  { type: "truefalse", category: "permission", question: "sudo 允许普通用户以 root 权限执行命令", answer: true, explain: "正确。sudo (superuser do) 临时获取超级用户权限" },
  { type: "truefalse", category: "permission", question: "chown 只能修改文件所有者，不能修改组", answer: false, explain: "错误。chown user:group file 可以同时修改所有者和组" },
  { type: "truefalse", category: "permission", question: "文件权限 rwxr-xr-x 等于 755", answer: true, explain: "正确。r=4 w=2 x=1，计算得 7 5 5" },
  { type: "truefalse", category: "permission", question: "umask 设置新建文件的默认权限", answer: true, explain: "正确。umask 决定新建文件和目录的默认权限掩码" },
  { type: "truefalse", category: "permission", question: "root 用户不受文件权限限制", answer: true, explain: "正确。root 超级用户可以访问系统中的任何文件" },
  { type: "truefalse", category: "permission", question: "chmod u+x 给所有用户添加执行权限", answer: false, explain: "错误。u+x 只给所有者(user)添加，a+x 才是给所有用户" },

  // ===== Shell脚本 判断题 (15道) =====
  // 变量系统 (4道)
  { type: "truefalse", category: "shell", question: "Shell变量定义时 name = 'value' 是正确的写法", answer: false, explain: "错误。等号两边不能有空格，正确写法是 name='value'" },
  { type: "truefalse", category: "shell", question: "$? 保存上一条命令的退出状态码", answer: true, explain: "正确。$? 为0表示成功，非0表示失败" },
  { type: "truefalse", category: "shell", question: "readonly 定义的变量可以被修改", answer: false, explain: "错误。readonly 定义的是只读变量，不能被修改或删除" },
  { type: "truefalse", category: "shell", question: "$1 表示脚本的第一个参数", answer: true, explain: "正确。$1到$9表示第1到第9个位置参数" },

  // 条件判断 (4道)
  { type: "truefalse", category: "shell", question: "[ $a = 5 ] 和 [ $a -eq 5 ] 效果完全相同", answer: false, explain: "错误。= 用于字符串比较，-eq 用于数值比较" },
  { type: "truefalse", category: "shell", question: "if 语句必须以 fi 结束", answer: true, explain: "正确。if 语句以 fi 结束（if的倒写）" },
  { type: "truefalse", category: "shell", question: "[ -f file.txt ] 测试文件是否存在且是普通文件", answer: true, explain: "正确。-f 测试是否为普通文件，-e 只测试是否存在" },
  { type: "truefalse", category: "shell", question: "[ ] 是 test 命令的简写形式", answer: true, explain: "正确。[ ] 等价于 test 命令，但注意[ ] 前后要有空格" },

  // 循环结构 (4道)
  { type: "truefalse", category: "shell", question: "for 循环必须以 done 结束", answer: true, explain: "正确。for 循环以 done 结束" },
  { type: "truefalse", category: "shell", question: "while 循环在条件为真时执行循环体", answer: true, explain: "正确。while在条件为真时执行，条件为假时停止" },
  { type: "truefalse", category: "shell", question: "break 用于跳过本次循环进入下一次", answer: false, explain: "错误。break 是退出整个循环，continue 才是跳过本次" },
  { type: "truefalse", category: "shell", question: "until 循环与 while 循环的条件判断逻辑相同", answer: false, explain: "错误。until与while相反，until在条件为假时执行" },

  // case语句 (3道)
  { type: "truefalse", category: "shell", question: "case 语句必须以 esac 结束", answer: true, explain: "正确。case 语句以 esac 结束（case的倒写）" },
  { type: "truefalse", category: "shell", question: "case语句中 ;; 表示继续匹配下一个模式", answer: false, explain: "错误。;; 表示该模式的代码块结束，跳出case" },
  { type: "truefalse", category: "shell", question: "case $var in [Yy]*) 匹配以Y或y开头的字符串", answer: true, explain: "正确。[Yy]* 匹配以 Y 或 y 开头的任意字符串" },

  // 软件包管理类判断题 (20道)
  { type: "truefalse", category: "package", question: "apt update 用于更新软件包列表", answer: true, explain: "正确。apt update 从软件源获取最新的软件包信息" },
  { type: "truefalse", category: "package", question: "apt upgrade 用于安装新软件包", answer: false, explain: "错误。apt upgrade 用于升级已安装的软件包，不是安装新软件" },
  { type: "truefalse", category: "package", question: "apt remove 删除软件时会保留配置文件", answer: true, explain: "正确。apt remove 删除软件但保留配置文件，purge 才会删除配置" },
  { type: "truefalse", category: "package", question: "dpkg 可以自动处理软件包依赖关系", answer: false, explain: "错误。dpkg 是底层工具不处理依赖，apt 才自动处理依赖" },
  { type: "truefalse", category: "package", question: "yum 是 CentOS/RHEL 系统的包管理器", answer: true, explain: "正确。yum 是CentOS、RHEL等系统的软件包管理器" },
  { type: "truefalse", category: "package", question: "dnf 是 yum 的下一代版本", answer: true, explain: "正确。dnf 是 yum 的下一代，提供更好的依赖解析" },
  { type: "truefalse", category: "package", question: "pacman 是 Ubuntu 的包管理器", answer: false, explain: "错误。pacman 是 Arch Linux 的包管理器，Ubuntu 使用 apt" },
  { type: "truefalse", category: "package", question: "rpm -ivh 中的 v 表示显示详细输出", answer: true, explain: "正确。-v (verbose) 表示显示详细安装过程" },
  { type: "truefalse", category: "package", question: "pip 是 Node.js 的包管理器", answer: false, explain: "错误。pip 是 Python 的包管理器，npm 才是 Node.js 的" },
  { type: "truefalse", category: "package", question: "npm install -g 用于全局安装包", answer: true, explain: "正确。-g (global) 选项将包安装到全局位置" },
  { type: "truefalse", category: "package", question: "snap 是 Ubuntu 开发的通用包格式", answer: true, explain: "正确。snap 是 Ubuntu/Canonical 开发的通用软件包格式" },
  { type: "truefalse", category: "package", question: "flatpak 和 snap 功能类似，都是通用Linux包格式", answer: true, explain: "正确。两者都是通用的Linux应用分发格式" },
  { type: "truefalse", category: "package", question: "gem 是 Ruby 的包管理工具", answer: true, explain: "正确。gem 用于安装和管理 Ruby 库和程序" },
  { type: "truefalse", category: "package", question: "apt autoremove 会删除所有已安装软件", answer: false, explain: "错误。autoremove 只删除不再需要的依赖包，不会删除正在使用的软件" },
  { type: "truefalse", category: "package", question: "dpkg -L 列出软件包安装的所有文件", answer: true, explain: "正确。dpkg -L 显示指定包安装的所有文件路径" },
  { type: "truefalse", category: "package", question: "yum clean all 清理所有软件包", answer: false, explain: "错误。yum clean all 只清理下载的软件缓存，不删除已安装的软件" },
  { type: "truefalse", category: "package", question: "使用 apt 安装软件通常需要 sudo 权限", answer: true, explain: "正确。软件包安装是系统级操作，需要管理员权限" },
  { type: "truefalse", category: "package", question: "pip freeze 导出当前环境的依赖列表", answer: true, explain: "正确。pip freeze 输出当前安装的所有包及其版本" },
  { type: "truefalse", category: "package", question: "npm run build 用于安装依赖", answer: false, explain: "错误。npm run build 执行package.json中定义的build脚本，不是安装" },
  { type: "truefalse", category: "package", question: "pacman -Syu 用于更新系统", answer: true, explain: "正确。-S (sync) -y (refresh) -u (upgrade) 同步并更新系统" },

  // 磁盘管理类判断题 (10道)
  { type: "truefalse", category: "file", question: "fdisk -l 可以列出所有磁盘分区", answer: true, explain: "正确。fdisk -l 列出系统中所有磁盘和分区信息" },
  { type: "truefalse", category: "file", question: "lsblk 以树状结构显示块设备", answer: true, explain: "正确。lsblk 列出所有块设备及其挂载点" },
  { type: "truefalse", category: "file", question: "mount 命令用于卸载文件系统", answer: false, explain: "错误。mount 用于挂载文件系统，umount 用于卸载" },
  { type: "truefalse", category: "file", question: "sync 命令将内存数据写入磁盘", answer: true, explain: "正确。sync 强制将缓冲区数据同步到磁盘" },
  { type: "truefalse", category: "file", question: "fsck 用于格式化磁盘", answer: false, explain: "错误。fsck 用于检查和修复文件系统，mkfs 用于格式化" },
  { type: "truefalse", category: "file", question: "blkid 显示块设备的UUID", answer: true, explain: "正确。blkid 显示块设备的UUID和文件系统类型" },
  { type: "truefalse", category: "file", question: "eject 用于弹出光盘或USB设备", answer: true, explain: "正确。eject 弹出可移动介质" },
  { type: "truefalse", category: "file", question: "mkfs -t ext4 创建ext4文件系统", answer: true, explain: "正确。mkfs 创建文件系统，-t 指定类型" },
  { type: "truefalse", category: "file", question: "umount -f 是正常卸载文件系统", answer: false, explain: "错误。-f 是强制卸载，只在无法正常卸载时使用" },
  { type: "truefalse", category: "file", question: "parted 支持GPT分区表", answer: true, explain: "正确。parted 支持GPT分区表，适合大容量磁盘" },

  // 用户管理类判断题 (10道)
  { type: "truefalse", category: "permission", question: "useradd -m 创建用户时同时创建主目录", answer: true, explain: "正确。-m (create-home) 创建用户主目录" },
  { type: "truefalse", category: "permission", question: "userdel -r 删除用户但保留主目录", answer: false, explain: "错误。-r (remove) 删除用户及其主目录和邮件" },
  { type: "truefalse", category: "permission", question: "usermod -aG 添加用户到组", answer: true, explain: "正确。-aG (append to group) 将用户添加到附加组" },
  { type: "truefalse", category: "permission", question: "passwd 命令只能修改自己的密码", answer: false, explain: "错误。root 可以修改任何用户密码，普通用户只能修改自己的" },
  { type: "truefalse", category: "permission", question: "groupadd 用于创建新用户组", answer: true, explain: "正确。groupadd 创建新的用户组" },
  { type: "truefalse", category: "permission", question: "gpasswd -a 从组中删除用户", answer: false, explain: "错误。-a 是添加用户到组，-d 才是删除" },
  { type: "truefalse", category: "permission", question: "last 显示用户登录历史", answer: true, explain: "正确。last 显示用户的最近登录记录" },
  { type: "truefalse", category: "permission", question: "w 命令显示当前登录用户及其活动", answer: true, explain: "正确。w 显示登录用户及他们正在执行的命令" },
  { type: "truefalse", category: "permission", question: "who 显示所有系统用户", answer: false, explain: "错误。who 只显示当前登录的用户，不是所有系统用户" },
  { type: "truefalse", category: "permission", question: "lastlog 显示所有用户的最近登录", answer: true, explain: "正确。lastlog 显示系统中所有用户的最近登录信息" },

];

// ============ 填空题 50道 ============
export const FILL_QUESTIONS: Omit<FillQuestion, "id">[] = [
  // 文件管理类填空题 (15道)
  { type: "fill", category: "file", question: "创建多级目录（如果不存在父目录则自动创建）应使用命令：mkdir _____", answer: "-p", explain: "-p (parents) 选项会自动创建不存在的父目录" },
  { type: "fill", category: "file", question: "显示当前工作目录的命令是 _____", answer: ["pwd", "pwd "], explain: "pwd (Print Working Directory) 显示当前完整路径" },
  { type: "fill", category: "file", question: "ls 命令中使用 _____ 选项可以按人类可读格式显示文件大小", answer: "-h", explain: "-h (human-readable) 以 K、M、G 等格式显示大小" },
  { type: "fill", category: "file", question: "_____ ~ 命令可以快速回到用户主目录", answer: "cd", explain: "cd ~ 或单独的 cd 命令都可以回到主目录" },
  { type: "fill", category: "file", question: "删除文件前提示确认，应使用 rm _____ 文件名", answer: "-i", explain: "-i (interactive) 交互模式，删除前提示确认" },
  { type: "fill", category: "file", question: "递归复制目录及其内容，应使用 cp _____ 源目录 目标目录", answer: "-r", explain: "-r (recursive) 递归复制目录及其内容" },
  { type: "fill", category: "file", question: "移动或重命名文件的命令是 _____", answer: "mv", explain: "mv (move) 用于移动或重命名文件" },
  { type: "fill", category: "file", question: "创建空文件或更新时间戳的命令是 _____", answer: "touch", explain: "touch 创建空文件或更新已有文件的时间戳" },
  { type: "fill", category: "file", question: "强制递归删除目录，应使用 rm _____ 目录名", answer: "-rf", explain: "-r 递归，-f 强制，组合使用强制删除目录" },
  { type: "fill", category: "file", question: "显示目录树状结构的命令是 _____", answer: "tree", explain: "tree 以树状图形式显示目录结构" },
  { type: "fill", category: "file", question: "创建软链接（符号链接）应使用 ln _____ 源文件 链接名", answer: "-s", explain: "-s (symbolic) 创建软链接，类似于Windows快捷方式" },
  { type: "fill", category: "file", question: "显示文件详细状态信息的命令是 _____", answer: "stat", explain: "stat 显示文件的详细元数据信息" },
  { type: "fill", category: "file", question: "识别文件类型的命令是 _____", answer: "file", explain: "file 通过检查内容判断文件类型" },
  { type: "fill", category: "file", question: "给文件所有者添加执行权限：chmod _____ 文件名", answer: "u+x", explain: "u(user)+x(execute) 给所有者添加执行权限" },
  { type: "fill", category: "file", question: "修改文件所有者的命令是 _____", answer: "chown", explain: "chown (change owner) 修改文件所有者" },

  // 文本处理类填空题 (12道)
  { type: "fill", category: "text", question: "在 grep 中使用 _____ 选项可以忽略大小写进行搜索", answer: "-i", explain: "-i (ignore case) 选项忽略大小写匹配" },
  { type: "fill", category: "text", question: "实时追踪日志文件新增内容的命令是：tail _____ 文件名", answer: "-f", explain: "-f (follow) 实时显示文件新增内容" },
  { type: "fill", category: "text", question: "显示文件前10行的命令是 _____", answer: "head", explain: "head 默认显示文件的前10行" },
  { type: "fill", category: "text", question: "分页查看大文件的命令是 _____", answer: ["less", "more"], explain: "less 和 more 都用于分页查看大文件" },
  { type: "fill", category: "text", question: "在 less 中按 _____ 键可以退出查看器", answer: "q", explain: "在 less 中按 q (quit) 退出" },
  { type: "fill", category: "text", question: "grep _____ 模式 文件 可以显示不包含该模式的行", answer: "-v", explain: "-v (invert) 反向匹配，显示不匹配的行" },
  { type: "fill", category: "text", question: "wc _____ 文件名 用于统计文件的行数", answer: "-l", explain: "wc -l (line) 统计文件的行数" },
  { type: "fill", category: "text", question: "sort _____ 文件名 可以按数字大小排序", answer: "-n", explain: "-n (numeric) 按数字大小排序" },
  { type: "fill", category: "text", question: "去除相邻重复行的命令是 _____", answer: "uniq", explain: "uniq 去除相邻的重复行" },
  { type: "fill", category: "text", question: "提取文本列的命令是 _____", answer: "cut", explain: "cut 用于提取文件中的指定列" },
  { type: "fill", category: "text", question: "流编辑器，用于文本替换的命令是 _____", answer: "sed", explain: "sed (stream editor) 流编辑器，用于文本处理" },
  { type: "fill", category: "text", question: "awk '{print $_____}' 打印第一列", answer: ["1", "$1"], explain: "$1 表示第一个字段（列）" },

  // 系统监控类填空题 (10道)
  { type: "fill", category: "system", question: "显示所有进程的命令是 ps _____", answer: "aux", explain: "ps aux 显示系统中所有用户的所有进程" },
  { type: "fill", category: "system", question: "实时显示进程状态的命令是 _____", answer: "top", explain: "top 实时显示进程和资源使用情况" },
  { type: "fill", category: "system", question: "top 中按 _____ 键可以按内存排序", answer: ["M", "m"], explain: "按 M 按内存使用率排序，P 按CPU排序" },
  { type: "fill", category: "system", question: "显示磁盘空间使用情况的命令是 _____", answer: "df", explain: "df (disk free) 显示磁盘空间" },
  { type: "fill", category: "system", question: "显示内存使用情况的命令是 _____", answer: "free", explain: "free 显示内存和交换分区使用情况" },
  { type: "fill", category: "system", question: "终止进程的命令是 _____", answer: "kill", explain: "kill 向进程发送终止信号" },
  { type: "fill", category: "system", question: "强制终止进程使用 kill _____ PID", answer: "-9", explain: "-9 (SIGKILL) 强制终止，进程无法忽略" },
  { type: "fill", category: "system", question: "显示系统运行时间的命令是 _____", answer: "uptime", explain: "uptime 显示系统已运行时间" },
  { type: "fill", category: "system", question: "显示当前用户的命令是 _____", answer: "whoami", explain: "whoami 显示当前用户名" },
  { type: "fill", category: "system", question: "htop 是 _____ 的增强版", answer: "top", explain: "htop 是 top 的增强版，有彩色界面和更多功能" },

  // 网络工具类填空题 (8道)
  { type: "fill", category: "network", question: "测试网络连通性的命令是 _____", answer: "ping", explain: "ping 测试与目标主机的网络连通性" },
  { type: "fill", category: "network", question: "从URL传输数据的命令是 _____", answer: "curl", explain: "curl 是强大的数据传输工具" },
  { type: "fill", category: "network", question: "下载文件的命令是 _____", answer: ["wget", "curl"], explain: "wget 和 curl 都用于下载文件" },
  { type: "fill", category: "network", question: "显示网络连接信息的命令是 netstat 或 _____", answer: "ss", explain: "ss 是 netstat 的现代替代品" },
  { type: "fill", category: "network", question: "安全远程登录的命令是 _____", answer: "ssh", explain: "ssh (Secure Shell) 提供加密远程登录" },
  { type: "fill", category: "network", question: "基于SSH安全复制文件的命令是 _____", answer: "scp", explain: "scp (secure copy) 基于SSH复制文件" },
  { type: "fill", category: "network", question: "追踪路由路径的命令是 _____", answer: "traceroute", explain: "traceroute 显示数据包的路由路径" },
  { type: "fill", category: "network", question: "查询DNS记录的命令是 nslookup 或 _____", answer: "dig", explain: "dig 是功能强大的DNS查询工具" },

  // 权限管理类填空题 (5道)
  { type: "fill", category: "permission", question: "修改文件权限的命令是 _____", answer: "chmod", explain: "chmod (change mode) 修改文件权限" },
  { type: "fill", category: "permission", question: "以超级用户权限执行命令使用 _____", answer: "sudo", explain: "sudo (superuser do) 以root权限执行" },
  { type: "fill", category: "permission", question: "chmod 755 中，rwxr-xr-x 的数值表示", answer: "755", explain: "r=4 w=2 x=1，7=4+2+1, 5=4+1" },
  { type: "fill", category: "permission", question: "切换到root用户并加载环境使用 su _____", answer: "-", explain: "su - 切换到root并加载其环境变量" },
  { type: "fill", category: "permission", question: "修改文件所属组的命令是 chgrp 或 chown :_____", answer: "group", explain: "chown :group 修改文件的所属组" },

  // ===== Shell脚本 填空题 (15道) =====
  // 变量系统 (4道)
  { type: "fill", category: "shell", question: "Shell中定义变量 name='Linux'，等号两边_____（能/不能）有空格", answer: "不能", explain: "Shell变量定义时等号两边不能有空格" },
  { type: "fill", category: "shell", question: "引用变量 name 的值使用 $_____", answer: "name", explain: "$变量名 用于引用变量的值" },
  { type: "fill", category: "shell", question: "$0 表示脚本的_____", answer: ["名称", "脚本名", "文件名"], explain: "$0 表示脚本或命令的名称" },
  { type: "fill", category: "shell", question: "$# 表示_____的个数", answer: ["参数", "位置参数"], explain: "$# 表示传递给脚本的参数个数" },

  // 条件判断 (4道)
  { type: "fill", category: "shell", question: "测试数值相等使用 _____ 运算符", answer: "-eq", explain: "-eq 表示 equal，用于数值相等比较" },
  { type: "fill", category: "shell", question: "测试文件是否存在且是普通文件使用 _____ 运算符", answer: "-f", explain: "-f 测试是否为普通文件" },
  { type: "fill", category: "shell", question: "if 语句必须以 _____ 结束", answer: "fi", explain: "if 语句以 fi 结束（if倒过来）" },
  { type: "fill", category: "shell", question: "测试字符串是否为空（长度为0）使用 _____ 运算符", answer: "-z", explain: "-z 测试字符串长度是否为0" },

  // 循环结构 (4道)
  { type: "fill", category: "shell", question: "for 循环必须以 _____ 结束", answer: "done", explain: "for循环以 done 结束" },
  { type: "fill", category: "shell", question: "用于立即退出循环的命令是 _____", answer: "break", explain: "break 用于立即退出整个循环" },
  { type: "fill", category: "shell", question: "for i in {1..5} 会遍历数字 _____ 到 _____", answer: ["1", "5"], explain: "{1..5} 生成1到5的序列" },
  { type: "fill", category: "shell", question: "while 循环在条件为_____时执行循环体", answer: "真", explain: "while 在条件为真（true）时执行" },

  // case语句 (3道)
  { type: "fill", category: "shell", question: "case 语句必须以 _____ 结束", answer: "esac", explain: "case 语句以 esac 结束（case倒过来）" },
  { type: "fill", category: "shell", question: "case语句中，_____ 表示默认匹配（匹配所有其他情况）", answer: "*)", explain: "*) 是默认匹配模式，类似if中的else" },
  { type: "fill", category: "shell", question: "case语句中每个模式的代码块以 _____ 结束", answer: ";;", explain: ";; 表示该模式的代码块结束" },

  // 软件包管理类填空题 (25道)
  { type: "fill", category: "package", question: "在Ubuntu中更新软件包列表使用：apt _____", answer: "update", explain: "apt update 从软件源获取最新的软件包信息" },
  { type: "fill", category: "package", question: "使用apt安装nginx的命令：apt _____ nginx", answer: "install", explain: "apt install 用于安装软件包" },
  { type: "fill", category: "package", question: "使用apt删除软件包并删除配置文件：apt _____ 包名", answer: "purge", explain: "apt purge 彻底删除软件包及配置文件" },
  { type: "fill", category: "package", question: "使用apt升级所有已安装软件：apt _____", answer: "upgrade", explain: "apt upgrade 升级所有已安装的软件包" },
  { type: "fill", category: "package", question: "apt _____ 删除不再需要的依赖包", answer: "autoremove", explain: "autoremove 删除自动安装但不再需要的依赖" },
  { type: "fill", category: "package", question: "使用apt搜索软件包：apt _____ 关键词", answer: "search", explain: "apt search 在软件源中搜索匹配的软件包" },
  { type: "fill", category: "package", question: "dpkg _____ package.deb 安装deb包", answer: "-i", explain: "-i (install) 选项安装deb软件包" },
  { type: "fill", category: "package", question: "dpkg -l 列出所有已_____的包", answer: ["安装", "installed"], explain: "dpkg -l 列出所有已安装的软件包" },
  { type: "fill", category: "package", question: "dpkg _____ /bin/ls 查看文件属于哪个包", answer: "-S", explain: "-S (search) 查找文件属于哪个软件包" },
  { type: "fill", category: "package", question: "dpkg -L 包名 列出包_____的所有文件", answer: ["安装", "包含"], explain: "-L 列出指定软件包安装的所有文件路径" },
  { type: "fill", category: "package", question: "CentOS中安装软件：yum _____ 软件名", answer: "install", explain: "yum install 安装软件包" },
  { type: "fill", category: "package", question: "yum _____ 升级所有已安装的软件包", answer: "update", explain: "yum update 更新系统中所有软件包" },
  { type: "fill", category: "package", question: "yum _____ httpd 搜索软件包", answer: "search", explain: "yum search 在仓库中搜索软件" },
  { type: "fill", category: "package", question: "rpm -i 用于_____rpm包", answer: ["安装", "装"], explain: "-i (install) 安装rpm软件包" },
  { type: "fill", category: "package", question: "rpm -qa 查询_____已安装的包", answer: ["所有", "全部"], explain: "-q (query) -a (all) 查询所有已安装的包" },
  { type: "fill", category: "package", question: "dnf 是 _____ 的下一代版本", answer: ["yum", "YUM"], explain: "dnf 是 yum 的下一代版本" },
  { type: "fill", category: "package", question: "pacman -S 用于_____软件包（Arch Linux）", answer: ["安装", "同步"], explain: "-S (sync) 安装软件包" },
  { type: "fill", category: "package", question: "pacman -R 用于_____软件包", answer: "删除", explain: "-R (remove) 删除软件包" },
  { type: "fill", category: "package", question: "pacman -Syu 同步并_____系统", answer: ["更新", "升级"], explain: "-Syu 同步并更新系统" },
  { type: "fill", category: "package", question: "pip install _____ 从requirements.txt安装", answer: "-r", explain: "-r (requirements) 从文件批量安装依赖" },
  { type: "fill", category: "package", question: "pip _____ 导出当前依赖列表", answer: "freeze", explain: "pip freeze 输出已安装包列表" },
  { type: "fill", category: "package", question: "npm install -g 表示_____安装", answer: ["全局", "global"], explain: "-g (global) 全局安装" },
  { type: "fill", category: "package", question: "npm run build 执行package.json中定义的_____脚本", answer: "build", explain: "npm run 执行scripts中定义的命令" },
  { type: "fill", category: "package", question: "gem install rails 安装_____的gem包", answer: ["rails", "Rails"], explain: "gem 是Ruby的包管理器" },
  { type: "fill", category: "package", question: "snap list 列出已_____的snap软件", answer: ["安装", "装"], explain: "snap list 显示已安装的snap应用" },

  // 磁盘管理类填空题 (15道)
  { type: "fill", category: "file", question: "fdisk _____ 列出所有磁盘分区", answer: "-l", explain: "-l (list) 列出分区表" },
  { type: "fill", category: "file", question: "lsblk 列出_____设备信息", answer: ["块", "block"], explain: "lsblk 列出所有块设备" },
  { type: "fill", category: "file", question: "mount /dev/sdb1 /mnt 将分区_____到/mnt", answer: ["挂载", "mount"], explain: "mount 挂载文件系统" },
  { type: "fill", category: "file", question: "umount /mnt 用于_____文件系统", answer: ["卸载", "unmount"], explain: "umount 卸载已挂载的文件系统" },
  { type: "fill", category: "file", question: "blkid 显示块设备的_____和文件系统类型", answer: ["UUID", "uuid"], explain: "blkid 显示设备的UUID和类型" },
  { type: "fill", category: "file", question: "mkfs -t ext4 创建_____文件系统", answer: ["ext4", "EXT4"], explain: "mkfs 创建文件系统，-t指定类型" },
  { type: "fill", category: "file", question: "sync 将_____数据写入磁盘", answer: ["缓冲区", "缓存", "内存"], explain: "sync 同步文件系统缓冲区" },
  { type: "fill", category: "file", question: "fsck 用于_____和修复文件系统", answer: ["检查", "检测"], explain: "fsck 检查和修复文件系统错误" },
  { type: "fill", category: "file", question: "eject 用于_____光盘或可移动设备", answer: ["弹出", "退出"], explain: "eject 弹出可移动介质" },
  { type: "fill", category: "file", question: "parted 支持_____分区表（大容量磁盘）", answer: ["GPT", "gpt"], explain: "parted 支持GPT分区表" },

  // 用户管理类填空题 (15道)
  { type: "fill", category: "permission", question: "useradd -m 创建用户时创建_____目录", answer: ["主", "home"], explain: "-m (create-home) 创建用户主目录" },
  { type: "fill", category: "permission", question: "userdel -r 删除用户及其_____目录", answer: ["主", "home"], explain: "-r 删除用户及其主目录" },
  { type: "fill", category: "permission", question: "usermod -aG sudo 将用户添加到_____组", answer: "sudo", explain: "-aG 添加用户到附加组sudo" },
  { type: "fill", category: "permission", question: "groupadd 用于创建新_____", answer: ["组", "用户组"], explain: "groupadd 创建新用户组" },
  { type: "fill", category: "permission", question: "gpasswd -a 添加用户到_____", answer: ["组", "用户组"], explain: "-a 添加用户到组" },
  { type: "fill", category: "permission", question: "passwd 用于修改用户_____", answer: ["密码", "口令"], explain: "passwd 修改用户密码" },
  { type: "fill", category: "permission", question: "last 显示用户_____历史", answer: ["登录", "登陆"], explain: "last 显示用户登录历史" },
  { type: "fill", category: "permission", question: "w 显示当前_____用户及其活动", answer: ["登录", "在线"], explain: "w 显示登录用户及其操作" },
  { type: "fill", category: "permission", question: "who 显示当前_____的用户", answer: ["登录", "在线"], explain: "who 显示当前登录的用户" },
  { type: "fill", category: "permission", question: "lastlog 显示_____用户的最近登录", answer: ["所有", "全部"], explain: "lastlog 显示所有用户的最近登录" },

];

// 合并所有题目并添加ID
export function getAllQuestions(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  let id = 1;

  [...CHOICE_QUESTIONS, ...MYSQL_CHOICE_QUESTIONS].forEach(q => {
    questions.push({ ...q, id: id++ } as QuizQuestion);
  });

  [...TRUE_FALSE_QUESTIONS, ...MYSQL_TRUE_FALSE_QUESTIONS].forEach(q => {
    questions.push({ ...q, id: id++ } as QuizQuestion);
  });

  [...FILL_QUESTIONS, ...MYSQL_FILL_QUESTIONS].forEach(q => {
    questions.push({ ...q, id: id++ } as QuizQuestion);
  });

  return questions;
}

// 按类型获取题目
export function getQuestionsByType(type: QuestionType): QuizQuestion[] {
  return getAllQuestions().filter(q => q.type === type);
}

// 按分类获取题目
export function getQuestionsByCategory(category: string): QuizQuestion[] {
  return getAllQuestions().filter(q => q.category === category);
}

// 随机获取指定数量的题目
export function getRandomQuestions(count: number): QuizQuestion[] {
  const all = getAllQuestions();
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, all.length));
}

// 导出总数量
export const TOTAL_QUESTIONS =
  CHOICE_QUESTIONS.length +
  TRUE_FALSE_QUESTIONS.length +
  FILL_QUESTIONS.length +
  MYSQL_CHOICE_QUESTIONS.length +
  MYSQL_TRUE_FALSE_QUESTIONS.length +
  MYSQL_FILL_QUESTIONS.length;
