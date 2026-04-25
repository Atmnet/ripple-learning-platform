"""
Linux 命令智能验证器
将命令解析为结构化数据后进行逻辑验证，而非字符串匹配
"""

import re
from typing import Set, List, Optional, Callable, Dict, Any


class ParsedCommand:
    """解析后的命令结构"""

    def __init__(self, raw_cmd: str = ""):
        self.raw = raw_cmd              # 原始命令字符串
        self.cmd = ""                   # 主命令: 'tar', 'ls', 'head'
        self.options: Set[str] = set()  # 选项集合: {'-c', '-z', '-v', '-f'}
        self.args: List[str] = []       # 参数列表
        self.has_error = False          # 解析是否出错
        self.error_msg = ""             # 解析错误信息

    def __repr__(self):
        return f"ParsedCommand(cmd='{self.cmd}', options={self.options}, args={self.args})"


def parse_command(cmd_str: str) -> ParsedCommand:
    """
    解析命令字符串为结构化数据

    示例:
        'tar -zcvf file.tar dir' -> cmd='tar', options={'-z','-c','-v','-f'}, args=['file.tar','dir']
        'ls -la' -> cmd='ls', options={'-l','-a'}, args=[]
        'head -n5 file.txt' -> cmd='head', options={'-n'}, args=['5','file.txt']
    """
    result = ParsedCommand(cmd_str)

    if not cmd_str or not cmd_str.strip():
        result.has_error = True
        result.error_msg = "空命令"
        return result

    # 处理管道符（只取第一个命令）
    first_cmd = cmd_str.split('|')[0].strip()
    parts = first_cmd.split()

    if not parts:
        result.has_error = True
        result.error_msg = "无法解析命令"
        return result

    result.cmd = parts[0]

    i = 1
    while i < len(parts):
        part = parts[i]

        # 处理选项
        if part.startswith('-') and len(part) > 1:
            if part.startswith('--'):
                # 长选项如 --help, --version
                result.options.add(part)
            elif len(part) == 2:
                # 单字符选项如 -l, -a, -n
                result.options.add(part)
            else:
                # 组合选项如 -la, -czvf, -n5
                # 每个字符都是一个选项
                for char in part[1:]:
                    result.options.add(f'-{char}')
        else:
            # 非选项都是参数
            result.args.append(part)

        i += 1

    return result


class CommandValidator:
    """命令验证器"""

    def __init__(self,
                 expected_cmd: str,
                 required_options: Optional[Set[str]] = None,
                 forbidden_options: Optional[Set[str]] = None,
                 arg_count: Optional[int] = None,
                 arg_patterns: Optional[List[str]] = None,
                 arg_contains: Optional[List[str]] = None,
                 custom_check: Optional[Callable[[ParsedCommand], bool]] = None):
        """
        初始化验证器

        :param expected_cmd: 期望的主命令（如 'tar', 'ls'）
        :param required_options: 必须包含的选项集合
        :param forbidden_options: 禁止包含的选项集合
        :param arg_count: 期望的参数个数
        :param arg_patterns: 参数必须匹配的正则表达式列表
        :param arg_contains: 参数中必须包含的子串列表
        :param custom_check: 自定义验证函数
        """
        self.expected_cmd = expected_cmd
        self.required_options = required_options or set()
        self.forbidden_options = forbidden_options or set()
        self.arg_count = arg_count
        self.arg_patterns = arg_patterns or []
        self.arg_contains = arg_contains or []
        self.custom_check = custom_check

    def validate(self, cmd_str: str) -> tuple[bool, str]:
        """
        验证命令

        :return: (是否通过, 错误信息)
        """
        parsed = parse_command(cmd_str)

        if parsed.has_error:
            return False, parsed.error_msg

        # 1. 验证主命令
        if parsed.cmd != self.expected_cmd:
            return False, f"命令错误: 需要使用 {self.expected_cmd}，而不是 {parsed.cmd}"

        # 2. 验证必需选项
        if self.required_options:
            missing = self.required_options - parsed.options
            if missing:
                opts_str = ', '.join(sorted(missing))
                return False, f"缺少选项: {opts_str}"

        # 3. 验证禁止选项
        if self.forbidden_options:
            forbidden = self.forbidden_options & parsed.options
            if forbidden:
                opts_str = ', '.join(sorted(forbidden))
                return False, f"多余选项: {opts_str}"

        # 4. 验证参数个数
        if self.arg_count is not None:
            if len(parsed.args) < self.arg_count:
                return False, f"参数不足: 需要 {self.arg_count} 个参数，只有 {len(parsed.args)} 个"

        # 5. 验证参数模式（正则）
        for i, pattern in enumerate(self.arg_patterns):
            if i >= len(parsed.args):
                return False, f"缺少第 {i+1} 个参数"
            if not re.search(pattern, parsed.args[i]):
                return False, f"第 {i+1} 个参数格式错误"

        # 6. 验证参数包含特定内容
        for content in self.arg_contains:
            if not any(content in arg for arg in parsed.args):
                return False, f"参数缺少必要内容: {content}"

        # 7. 自定义验证
        if self.custom_check and not self.custom_check(parsed):
            return False, "命令格式不符合要求"

        return True, "验证通过"


# ============ 预设验证器工厂 ============

def make_ls_validator(required_opts: Set[str] = None) -> CommandValidator:
    """创建 ls 命令验证器"""
    return CommandValidator(
        expected_cmd="ls",
        required_options=required_opts,
        arg_count=0  # ls 不需要参数
    )


def make_tar_validator(required_opts: Set[str], archive_ext: str = ".tar") -> CommandValidator:
    """创建 tar 命令验证器"""
    return CommandValidator(
        expected_cmd="tar",
        required_options=required_opts,
        arg_patterns=[rf".*{re.escape(archive_ext)}.*"]  # 参数中必须包含归档文件
    )


def make_head_validator(lines: int, filename: str) -> CommandValidator:
    """创建 head 命令验证器（支持 -n5 和 -n 5 格式）"""
    def check_head(parsed: ParsedCommand) -> bool:
        # 检查 -n 选项
        if "-n" not in parsed.options:
            return False
        # 检查行数：可能在参数中，也可能作为 -5 这样的选项
        has_lines = False
        if str(lines) in parsed.args:
            has_lines = True
        if f"-{lines}" in parsed.options:
            has_lines = True
        if not has_lines:
            return False
        # 检查文件名
        if filename not in parsed.args:
            return False
        return True

    return CommandValidator(
        expected_cmd="head",
        required_options={"-n"},
        custom_check=check_head
    )


def make_tail_validator(lines: int, filename: str) -> CommandValidator:
    """创建 tail 命令验证器"""
    def check_tail(parsed: ParsedCommand) -> bool:
        if "-n" not in parsed.options:
            return False
        # 检查行数：可能在参数中，也可能作为 -5 这样的选项
        has_lines = False
        if str(lines) in parsed.args:
            has_lines = True
        if f"-{lines}" in parsed.options:
            has_lines = True
        if not has_lines:
            return False
        if filename not in parsed.args:
            return False
        return True

    return CommandValidator(
        expected_cmd="tail",
        required_options={"-n"},
        custom_check=check_tail
    )


def make_grep_validator(pattern: str, filename: str, options: Set[str] = None) -> CommandValidator:
    """创建 grep 命令验证器"""
    opts = options or set()

    def check_grep(parsed: ParsedCommand) -> bool:
        # 检查文件名
        if filename not in parsed.args:
            return False
        # 检查搜索词（不区分大小写如果 -i 存在）
        search_term = pattern.lower() if "-i" in opts else pattern
        args_str = ' '.join(parsed.args)
        if "-i" in opts:
            args_str = args_str.lower()
        if search_term not in args_str:
            return False
        return True

    return CommandValidator(
        expected_cmd="grep",
        required_options=opts,
        custom_check=check_grep
    )


def make_ping_validator(count: int, host: str) -> CommandValidator:
    """创建 ping 命令验证器"""
    def check_ping(parsed: ParsedCommand) -> bool:
        # 检查 -c 选项
        if "-c" not in parsed.options:
            return False
        # 检查次数：可能在参数中，也可能作为 -4 这样的选项
        has_count = False
        if str(count) in parsed.args:
            has_count = True
        if f"-{count}" in parsed.options:
            has_count = True
        if not has_count:
            return False
        # 检查主机
        if not any(host in arg for arg in parsed.args):
            return False
        return True

    return CommandValidator(
        expected_cmd="ping",
        required_options={"-c"},
        custom_check=check_ping
    )


def make_sort_uniq_validator(filename: str, with_count: bool = False) -> CommandValidator:
    """创建 sort | uniq 管道命令验证器"""
    def check_sort_uniq(parsed: ParsedCommand) -> bool:
        # 必须是管道命令，解析后会变成 sort 部分
        if filename not in parsed.args:
            return False
        # 检查 -c 选项（如果需要）
        if with_count and "-c" not in parsed.options:
            return False
        return True

    cmd = CommandValidator(
        expected_cmd="sort",
        arg_contains=[filename],
        custom_check=check_sort_uniq
    )
    return cmd


# ============ 快速测试 ============
if __name__ == "__main__":
    # 测试用例
    test_cases = [
        # (命令, 验证器, 期望结果)
        ("ls -la", make_ls_validator({"-l", "-a"}), True),
        ("ls -al", make_ls_validator({"-l", "-a"}), True),
        ("ls -l -a", make_ls_validator({"-l", "-a"}), True),
        ("ls -la .", make_ls_validator({"-l", "-a"}), True),
        ("tar -zcvf file.tar.gz dir", make_tar_validator({"-c", "-z", "-v", "-f"}, ".tar.gz"), True),
        ("tar -czvf file.tar.gz dir", make_tar_validator({"-c", "-z", "-v", "-f"}, ".tar.gz"), True),
        ("head -n 5 file.txt", make_head_validator(5, "file.txt"), True),
        ("head -n5 file.txt", make_head_validator(5, "file.txt"), True),
        ("ping -c 4 baidu.com", make_ping_validator(4, "baidu.com"), True),
        ("ping -c4 baidu.com", make_ping_validator(4, "baidu.com"), True),
    ]

    print("=" * 60)
    print("命令验证器测试")
    print("=" * 60)

    passed = 0
    failed = 0

    for cmd, validator, expected in test_cases:
        result, msg = validator.validate(cmd)
        status = "[PASS]" if result == expected else "[FAIL]"
        if result == expected:
            passed += 1
        else:
            failed += 1
        print(f"{status}: {cmd}")
        if result != expected:
            print(f"       期望: {'通过' if expected else '失败'}, 实际: {'通过' if result else '失败'}")
            print(f"       信息: {msg}")

    print("=" * 60)
    print(f"结果: {passed} 通过, {failed} 失败")
    print("=" * 60)
