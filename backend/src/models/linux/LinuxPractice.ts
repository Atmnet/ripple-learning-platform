/**
 * Linux Practice 练习模式 - 场景化命令练习
 * 使用 VirtualFileSystem 执行命令并验证结果
 */

import {
  VirtualFileSystem,
  CommandSimulator,
  CommandResult,
} from "./VirtualFileSystem";
import { MYSQL_PRACTICE_SCENARIOS } from "./MySQLPractice";

export interface TaskValidation {
  type: "filesystem" | "output" | "command";
  description?: string;
}

// 文件系统验证 - 检查文件/目录是否存在
export interface FilesystemValidation extends TaskValidation {
  type: "filesystem";
  exists?: string[]; // 应该存在的路径
  notExists?: string[]; // 不应该存在的路径
  isDir?: string[]; // 应该是目录的路径
  isFile?: string[]; // 应该是文件的路径
  fileContent?: { path: string; content: string }[]; // 文件内容检查
}

// 输出验证 - 检查命令输出
export interface OutputValidation extends TaskValidation {
  type: "output";
  contains?: string[]; // 输出应该包含的字符串
  notContains?: string[]; // 输出不应该包含的字符串
  matches?: string; // 正则匹配
}

// 命令验证 - 检查命令本身
export interface CommandValidation extends TaskValidation {
  type: "command";
  startsWith?: string; // 命令以什么开头
  contains?: string[]; // 命令包含哪些参数
}

export interface TaskData {
  prompt: string;
  successMsg: string;
  hint: string;
  explanationOnCorrect: string;
  explanationOnWrong: string;
  category: string;
  // 初始设置命令（在场景开始前执行）
  setup?: string[];
  // 任务验证规则
  validation: FilesystemValidation | OutputValidation | CommandValidation;
}

export class PracticeTask {
  prompt: string;
  successMsg: string;
  hint: string;
  explanationOnCorrect: string;
  explanationOnWrong: string;
  category: string;
  setup: string[];
  validation: FilesystemValidation | OutputValidation | CommandValidation;

  constructor(data: TaskData) {
    this.prompt = data.prompt;
    this.successMsg = data.successMsg || "正确！";
    this.hint = data.hint || "请输入正确的命令";
    this.explanationOnCorrect = data.explanationOnCorrect || "";
    this.explanationOnWrong = data.explanationOnWrong || "";
    this.category = data.category;
    this.setup = data.setup || [];
    this.validation = data.validation;
  }

  /**
   * 验证任务是否完成
   * @param simulator 命令模拟器
   * @param lastCommand 最后执行的命令
   * @param lastOutput 最后命令的输出
   */
  validate(
    simulator: CommandSimulator,
    lastCommand: string,
    lastOutput: string
  ): { success: boolean; message?: string } {
    switch (this.validation.type) {
      case "filesystem":
        return this.validateFilesystem(simulator.fs, this.validation as FilesystemValidation);
      case "output":
        return this.validateOutput(lastOutput, this.validation as OutputValidation);
      case "command":
        return this.validateCommand(lastCommand, this.validation as CommandValidation);
      default:
        return { success: false, message: "未知的验证类型" };
    }
  }

  private validateFilesystem(
    fs: VirtualFileSystem,
    validation: FilesystemValidation
  ): { success: boolean; message?: string } {
    // 检查应该存在的路径
    if (validation.exists) {
      for (const path of validation.exists) {
        if (!fs.exists(path)) {
          return {
            success: false,
            message: `路径 '${path}' 不存在`,
          };
        }
      }
    }

    // 检查不应该存在的路径
    if (validation.notExists) {
      for (const path of validation.notExists) {
        if (fs.exists(path)) {
          return {
            success: false,
            message: `路径 '${path}' 应该被删除`,
          };
        }
      }
    }

    // 检查是否为目录
    if (validation.isDir) {
      for (const path of validation.isDir) {
        if (!fs.exists(path)) {
          return {
            success: false,
            message: `目录 '${path}' 不存在`,
          };
        }
        if (!fs.isDir(path)) {
          return {
            success: false,
            message: `'${path}' 应该是目录`,
          };
        }
      }
    }

    // 检查是否为文件
    if (validation.isFile) {
      for (const path of validation.isFile) {
        if (!fs.exists(path)) {
          return {
            success: false,
            message: `文件 '${path}' 不存在`,
          };
        }
        if (fs.isDir(path)) {
          return {
            success: false,
            message: `'${path}' 应该是文件，不是目录`,
          };
        }
      }
    }

    // 检查文件内容
    if (validation.fileContent) {
      for (const { path, content } of validation.fileContent) {
        const file = fs.getFile(path);
        if (!file) {
          return {
            success: false,
            message: `文件 '${path}' 不存在`,
          };
        }
        if (file.content !== content) {
          return {
            success: false,
            message: `文件 '${path}' 的内容不正确`,
          };
        }
      }
    }

    return { success: true };
  }

  private validateOutput(
    output: string,
    validation: OutputValidation
  ): { success: boolean; message?: string } {
    // 检查应该包含的内容
    if (validation.contains) {
      for (const str of validation.contains) {
        if (!output.includes(str)) {
          return {
            success: false,
            message: `输出应该包含 '${str}'`,
          };
        }
      }
    }

    // 检查不应该包含的内容
    if (validation.notContains) {
      for (const str of validation.notContains) {
        if (output.includes(str)) {
          return {
            success: false,
            message: `输出不应该包含 '${str}'`,
          };
        }
      }
    }

    // 正则匹配
    if (validation.matches) {
      const regex = new RegExp(validation.matches);
      if (!regex.test(output)) {
        return {
          success: false,
          message: "输出格式不正确",
        };
      }
    }

    return { success: true };
  }

  private validateCommand(
    command: string,
    validation: CommandValidation
  ): { success: boolean; message?: string } {
    const cmd = command.trim();

    // 检查命令开头
    if (validation.startsWith) {
      if (!cmd.startsWith(validation.startsWith)) {
        return {
          success: false,
          message: `命令应该以 '${validation.startsWith}' 开头`,
        };
      }
    }

    // 检查包含的参数
    if (validation.contains) {
      for (const str of validation.contains) {
        if (!cmd.includes(str)) {
          return {
            success: false,
            message: `命令应该包含 '${str}'`,
          };
        }
      }
    }

    return { success: true };
  }

  toJSON() {
    return {
      prompt: this.prompt,
      hint: this.hint,
      category: this.category,
    };
  }
}

export interface ScenarioData {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  tasks: TaskData[];
  setup?: string[];
}

export class PracticeScenario {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  tasks: PracticeTask[];
  setup?: string[];

  constructor(data: ScenarioData) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.difficulty = data.difficulty;
    this.category = data.category;
    this.tasks = data.tasks.map((t) => new PracticeTask(t));
    this.setup = data.setup;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      difficulty: this.difficulty,
      category: this.category,
      taskCount: this.tasks.length,
      setup: this.setup,
    };
  }
}

// ============ 场景定义 ============

// ============ 文件管理类练习 ============
const fileScenarios: ScenarioData[] = [
  {
    id: 1,
    title: "目录探索基础",
    description: "学习查看当前位置、列出文件、切换目录的基本操作",
    difficulty: "简单",
    category: "file",
    tasks: [
      {
        prompt: "查看当前所在的完整路径",
        successMsg: "✓ 正确！pwd 显示当前工作目录",
        hint: "pwd",
        explanationOnCorrect: "pwd (print working directory) 显示当前所在目录的完整绝对路径，是定位自己的基础命令。",
        explanationOnWrong: "使用 pwd 命令可以查看当前工作目录的完整路径。",
        category: "file",
        validation: {
          type: "command",
          startsWith: "pwd",
          description: "使用 pwd 命令",
        },
      },
      {
        prompt: "列出当前目录的所有文件和文件夹",
        successMsg: "✓ 很好！ls 列出目录内容",
        hint: "ls",
        explanationOnCorrect: "ls 是最基础的命令，用于列出目录中的文件和子目录。",
        explanationOnWrong: "使用 ls 命令可以列出当前目录的内容。",
        category: "file",
        validation: {
          type: "command",
          startsWith: "ls",
          description: "使用 ls 命令",
        },
      },
      {
        prompt: "进入 Documents 目录",
        successMsg: "✓ 正确！你已进入 Documents 目录",
        hint: "cd <目录名>",
        explanationOnCorrect: "cd (change directory) 用于切换目录。Documents 是常见的用户文档目录。",
        explanationOnWrong: "使用 cd 命令后跟目录名可以进入该目录。例如：cd Documents",
        category: "file",
        setup: [],
        validation: {
          type: "filesystem",
          isDir: ["/home/user/Documents"],
          description: "当前工作目录应该在 Documents",
        },
      },
      {
        prompt: "返回上级目录（home目录）",
        successMsg: "✓ 正确！已返回上级目录",
        hint: "cd ..",
        explanationOnCorrect: ".. 是特殊目录名，表示父目录（上级目录）。cd .. 让你返回上一层。",
        explanationOnWrong: "使用 cd .. 返回上级目录。注意是两个点。",
        category: "file",
        setup: ["cd Documents"],
        validation: {
          type: "filesystem",
          isDir: ["/home/user"],
          description: "当前工作目录应该在 /home/user",
        },
      },
    ],
  },
  {
    id: 2,
    title: "创建目录和文件",
    description: "学习创建目录结构和管理文件",
    difficulty: "简单",
    category: "file",
    tasks: [
      {
        prompt: "创建一个名为 projects 的目录",
        successMsg: "✓ 目录创建成功！",
        hint: "mkdir <目录名>",
        explanationOnCorrect: "mkdir (make directory) 用于创建新目录。这是组织文件的基础操作。",
        explanationOnWrong: "使用 mkdir 后跟目录名来创建目录。例如：mkdir projects",
        category: "file",
        validation: {
          type: "filesystem",
          isDir: ["/home/user/projects"],
        },
      },
      {
        prompt: "进入 projects 目录",
        successMsg: "✓ 已进入项目目录",
        hint: "cd projects",
        explanationOnCorrect: "进入目录后才能在其中创建文件或子目录。",
        explanationOnWrong: "使用 cd 命令进入 projects 目录。",
        category: "file",
        setup: ["mkdir projects"],
        validation: {
          type: "filesystem",
          isDir: ["/home/user/projects"],
        },
      },
      {
        prompt: "在 projects 目录下创建 src 子目录",
        successMsg: "✓ 子目录创建完成！",
        hint: "mkdir src",
        explanationOnCorrect: "mkdir 可以创建多级目录，只要父目录存在即可。",
        explanationOnWrong: "使用 mkdir src 创建子目录。",
        category: "file",
        setup: ["mkdir projects", "cd projects"],
        validation: {
          type: "filesystem",
          isDir: ["/home/user/projects/src"],
        },
      },
      {
        prompt: "创建一个空的 README.txt 文件",
        successMsg: "✓ 文件创建成功！",
        hint: "touch <文件名>",
        explanationOnCorrect: "touch 命令用于创建空文件或更新文件的时间戳。",
        explanationOnWrong: "使用 touch 命令创建空文件，例如：touch README.txt",
        category: "file",
        setup: ["mkdir projects", "cd projects", "mkdir src"],
        validation: {
          type: "filesystem",
          isFile: ["/home/user/projects/README.txt"],
        },
      },
    ],
  },
  {
    id: 3,
    title: "文件操作进阶",
    description: "复制、移动、重命名和删除文件",
    difficulty: "中等",
    category: "file",
    tasks: [
      {
        prompt: "将 old.txt 复制为 backup.txt",
        successMsg: "✓ 复制成功！",
        hint: "cp <源文件> <目标文件>",
        explanationOnCorrect: "cp (copy) 用于复制文件。原文件保留，创建一份副本。",
        explanationOnWrong: "cp 的语法是：cp 源文件 目标文件。例如：cp old.txt backup.txt",
        category: "file",
        setup: ["touch old.txt"],
        validation: {
          type: "filesystem",
          isFile: ["/home/user/old.txt", "/home/user/backup.txt"],
        },
      },
      {
        prompt: "将 backup.txt 重命名为 archive.txt",
        successMsg: "✓ 重命名成功！",
        hint: "mv <原文件> <新文件>",
        explanationOnCorrect: "mv (move) 可以在同一目录内重命名文件，也可以移动到不同目录。",
        explanationOnWrong: "mv 的语法是：mv 原文件名 新文件名。注意这是重命名，不是复制。",
        category: "file",
        setup: ["touch old.txt", "cp old.txt backup.txt"],
        validation: {
          type: "filesystem",
          isFile: ["/home/user/archive.txt"],
          notExists: ["/home/user/backup.txt"],
        },
      },
      {
        prompt: "删除 old.txt 文件",
        successMsg: "✓ 删除成功！",
        hint: "rm <文件>",
        explanationOnCorrect: "rm (remove) 永久删除文件。删除后无法恢复，请谨慎使用！",
        explanationOnWrong: "使用 rm 文件名删除文件。注意：删除后无法恢复，确保输入正确的文件名。",
        category: "file",
        setup: ["touch old.txt", "cp old.txt backup.txt", "mv backup.txt archive.txt"],
        validation: {
          type: "filesystem",
          notExists: ["/home/user/old.txt"],
        },
      },
    ],
  },
];

// ============ 文本处理类练习 ============
const textScenarios: ScenarioData[] = [
  {
    id: 4,
    title: "查看文件内容",
    description: "学习查看文件的多种方法",
    difficulty: "简单",
    category: "text",
    tasks: [
      {
        prompt: "查看 sample.txt 的完整内容",
        successMsg: "✓ 正确！cat 显示文件全部内容",
        hint: "cat <文件>",
        explanationOnCorrect: "cat (concatenate) 将文件内容输出到屏幕，适合查看小文件。",
        explanationOnWrong: "使用 cat 文件名 查看文件内容。cat 是最基础的文件查看命令。",
        category: "text",
        setup: ["echo 'Line 1\\nLine 2\\nLine 3' > sample.txt"],
        validation: {
          type: "output",
          contains: ["Line 1", "Line 2", "Line 3"],
        },
      },
      {
        prompt: "查看 sample.txt 的前2行",
        successMsg: "✓ 正确！head 显示文件开头",
        hint: "head -n 2 sample.txt",
        explanationOnCorrect: "head 默认显示前10行，-n 2 指定只显示前2行。",
        explanationOnWrong: "head -n 2 sample.txt 显示文件前2行。head 默认显示10行，-n 可以指定行数。",
        category: "text",
        setup: ["echo 'Line 1\\nLine 2\\nLine 3\\nLine 4' > sample.txt"],
        validation: {
          type: "command",
          startsWith: "head",
          contains: ["-n", "sample.txt"],
        },
      },
      {
        prompt: "查看 sample.txt 的最后1行",
        successMsg: "✓ 正确！tail 显示文件结尾",
        hint: "tail -n 1 sample.txt",
        explanationOnCorrect: "tail 显示文件末尾内容，常用于查看日志文件。",
        explanationOnWrong: "tail -n 1 sample.txt 显示文件最后1行。tail 默认显示最后10行。",
        category: "text",
        setup: ["echo 'Line 1\\nLine 2\\nLine 3' > sample.txt"],
        validation: {
          type: "command",
          startsWith: "tail",
          contains: ["-n", "sample.txt"],
        },
      },
    ],
  },
];

// ============ 系统监控类练习 ============
const systemScenarios: ScenarioData[] = [
  {
    id: 5,
    title: "查看系统状态",
    description: "学习查看磁盘、内存和进程状态",
    difficulty: "简单",
    category: "system",
    tasks: [
      {
        prompt: "查看当前路径",
        successMsg: "✓ 正确！pwd 显示当前路径",
        hint: "pwd",
        explanationOnCorrect: "pwd 显示当前工作目录的完整路径。",
        explanationOnWrong: "pwd 命令用于显示当前所在目录。",
        category: "system",
        validation: {
          type: "command",
          startsWith: "pwd",
        },
      },
      {
        prompt: "查看当前运行的进程（简单列表）",
        successMsg: "✓ 正确！ps 显示进程状态",
        hint: "ps",
        explanationOnCorrect: "ps (process status) 显示当前 shell 的进程。ps aux 显示所有进程。",
        explanationOnWrong: "ps 显示当前 shell 的进程。想看所有进程用 ps aux，想看实时更新用 top。",
        category: "system",
        validation: {
          type: "command",
          startsWith: "ps",
        },
      },
    ],
  },
  {
    id: 6,
    title: "进程管理",
    description: "学习查看和管理系统进程",
    difficulty: "中等",
    category: "system",
    tasks: [
      {
        prompt: "查看当前运行的所有进程",
        successMsg: "✓ 正确！显示了进程列表",
        hint: "ps aux",
        explanationOnCorrect: "ps aux 显示系统中所有用户的所有进程。",
        explanationOnWrong: "使用 ps aux 查看所有进程。",
        category: "system",
        validation: {
          type: "command",
          contains: ["ps", "aux"],
        },
      },
    ],
  },
];

// ============ 网络工具类练习 ============
const networkScenarios: ScenarioData[] = [
  {
    id: 7,
    title: "网络连通性测试",
    description: "学习测试网络连接",
    difficulty: "简单",
    category: "network",
    tasks: [
      {
        prompt: "测试与百度网站的连通性（ping 4次后停止）",
        successMsg: "✓ 正确！ping 测试网络连通",
        hint: "ping -c 4 baidu.com",
        explanationOnCorrect: "ping 发送 ICMP 包测试连通性，-c 4 表示发送4次后停止。",
        explanationOnWrong: "ping -c 4 baidu.com 发送4个测试包。-c 是 count，如果不加会一直 ping。",
        category: "network",
        validation: {
          type: "command",
          startsWith: "ping",
          contains: ["-c", "baidu.com"],
        },
      },
      {
        prompt: "查看本机网络接口配置",
        successMsg: "✓ 正确！显示网络接口信息",
        hint: "ip addr",
        explanationOnCorrect: "ip addr 是现代 Linux 推荐的方式，显示所有网络接口的 IP 地址。",
        explanationOnWrong: "ip addr 显示网络接口和 IP 地址。ifconfig 是老式命令，新系统可能需要用 ip 命令。",
        category: "network",
        validation: {
          type: "command",
          contains: ["ip", "addr"],
        },
      },
    ],
  },
  {
    id: 8,
    title: "网络诊断",
    description: "学习网络诊断工具",
    difficulty: "中等",
    category: "network",
    tasks: [
      {
        prompt: "追踪到百度网站的路由路径",
        successMsg: "✓ 正确！显示路由路径",
        hint: "traceroute baidu.com",
        explanationOnCorrect: "traceroute 显示数据包到达目标经过的路由节点。",
        explanationOnWrong: "使用 traceroute 命令追踪路由路径。",
        category: "network",
        validation: {
          type: "command",
          startsWith: "traceroute",
        },
      },
    ],
  },
];

// ============ Shell脚本类练习 ============
const shellScenarios: ScenarioData[] = [
  {
    id: 9,
    title: "变量基础",
    description: "学习Shell变量的定义与使用",
    difficulty: "简单",
    category: "shell",
    tasks: [
      {
        prompt: "定义一个名为 name 的变量，值为 'Linux'",
        successMsg: "✓ 正确！变量定义成功",
        hint: "name='Linux'",
        explanationOnCorrect: "Shell变量定义时等号两边不能有空格，值可以用单引号或双引号包围。",
        explanationOnWrong: "变量定义的格式是：变量名=值。注意等号两边不能有空格！",
        category: "shell",
        validation: {
          type: "command",
          contains: ["name="],
        },
      },
      {
        prompt: "输出变量 name 的值",
        successMsg: "✓ 正确！成功输出变量值",
        hint: "echo $name",
        explanationOnCorrect: "$变量名 用于访问变量的值，${变量名} 可以更清晰地界定变量边界。",
        explanationOnWrong: "使用 $变量名 来引用变量的值，例如：echo $name",
        category: "shell",
        validation: {
          type: "command",
          startsWith: "echo",
          contains: ["$name"],
        },
      },
    ],
  },
  {
    id: 10,
    title: "条件判断练习",
    description: "学习使用if语句进行条件判断",
    difficulty: "中等",
    category: "shell",
    tasks: [
      {
        prompt: "测试 /tmp 目录是否存在",
        successMsg: "✓ 正确！目录存在",
        hint: "[ -d /tmp ]",
        explanationOnCorrect: "-d 用于测试文件是否存在且是目录",
        explanationOnWrong: "使用 [ -d /tmp ] 可以测试目录是否存在",
        category: "shell",
        validation: {
          type: "command",
          contains: ["-d"],
        },
      },
    ],
  },
];

// ============ 权限管理类练习 ============
const permissionScenarios: ScenarioData[] = [
  {
    id: 11,
    title: "文件权限基础",
    description: "学习查看和修改文件权限",
    difficulty: "简单",
    category: "permission",
    tasks: [
      {
        prompt: "创建一个名为 testfile.txt 的文件",
        successMsg: "✓ 文件创建成功！",
        hint: "touch <文件>",
        explanationOnCorrect: "touch 用于创建空文件",
        explanationOnWrong: "使用 touch testfile.txt 创建文件",
        category: "permission",
        setup: [],
        validation: {
          type: "filesystem",
          isFile: ["/home/user/testfile.txt"],
        },
      },
      {
        prompt: "给 testfile.txt 添加执行权限",
        successMsg: "✓ 权限修改成功！",
        hint: "chmod +x <文件>",
        explanationOnCorrect: "+x 给文件添加执行权限",
        explanationOnWrong: "使用 chmod +x testfile.txt 添加执行权限",
        category: "permission",
        setup: ["touch testfile.txt"],
        validation: {
          type: "command",
          startsWith: "chmod",
          contains: ["+x"],
        },
      },
    ],
  },
  {
    id: 12,
    title: "目录权限设置",
    description: "学习设置目录访问权限",
    difficulty: "中等",
    category: "permission",
    tasks: [
      {
        prompt: "创建一个名为 private 的目录",
        successMsg: "✓ 目录创建成功！",
        hint: "mkdir <目录>",
        explanationOnCorrect: "mkdir 用于创建目录",
        explanationOnWrong: "使用 mkdir private 创建目录",
        category: "permission",
        validation: {
          type: "filesystem",
          isDir: ["/home/user/private"],
        },
      },
      {
        prompt: "设置 private 目录的权限为 700（仅所有者可访问）",
        successMsg: "✓ 权限设置成功！",
        hint: "chmod 700 private",
        explanationOnCorrect: "700 表示 rwx------，只有所有者有读、写、执行权限",
        explanationOnWrong: "使用 chmod 700 private 设置权限",
        category: "permission",
        setup: ["mkdir private"],
        validation: {
          type: "command",
          startsWith: "chmod",
          contains: ["700"],
        },
      },
    ],
  },
];

// ============ 搜索查找类练习 ============
const searchScenarios: ScenarioData[] = [
  {
    id: 13,
    title: "查找文件",
    description: "学习使用find命令查找文件",
    difficulty: "简单",
    category: "search",
    tasks: [
      {
        prompt: "在当前目录及其子目录中查找所有以 .txt 结尾的文件",
        successMsg: "✓ 查找成功！",
        hint: "find . -name '*.txt'",
        explanationOnCorrect: "find 命令配合 -name 选项可以按文件名查找",
        explanationOnWrong: "使用 find . -name '*.txt' 查找txt文件",
        category: "search",
        validation: {
          type: "command",
          startsWith: "find",
          contains: ["-name", "*.txt"],
        },
      },
    ],
  },
  {
    id: 14,
    title: "查找并删除",
    description: "学习查找并删除文件",
    difficulty: "中等",
    category: "search",
    tasks: [
      {
        prompt: "查找当前目录下所有名为 temp*.txt 的文件",
        successMsg: "✓ 查找成功！",
        hint: "find . -name 'temp*.txt'",
        explanationOnCorrect: "使用通配符 * 匹配任意字符",
        explanationOnWrong: "使用 find . -name 'temp*.txt' 查找文件",
        category: "search",
        setup: ["touch temp1.txt temp2.txt"],
        validation: {
          type: "command",
          startsWith: "find",
          contains: ["-name"],
        },
      },
    ],
  },
];

// ============ 软件包管理类练习 ============
const packageScenarios: ScenarioData[] = [
  {
    id: 15,
    title: "软件包安装基础",
    description: "学习使用apt安装和卸载软件",
    difficulty: "简单",
    category: "package",
    tasks: [
      {
        prompt: "更新软件包列表",
        successMsg: "✓ 软件列表更新成功！",
        hint: "apt update",
        explanationOnCorrect: "apt update 从软件源获取最新的软件包信息",
        explanationOnWrong: "使用 apt update 更新软件包列表",
        category: "package",
        validation: {
          type: "command",
          startsWith: "apt",
          contains: ["update"],
        },
      },
      {
        prompt: "安装 nginx 软件包",
        successMsg: "✓ nginx安装成功！",
        hint: "apt install nginx",
        explanationOnCorrect: "apt install 用于安装软件包",
        explanationOnWrong: "使用 apt install 安装软件",
        category: "package",
        validation: {
          type: "command",
          startsWith: "apt",
          contains: ["install", "nginx"],
        },
      },
      {
        prompt: "删除 nginx 软件包（保留配置）",
        successMsg: "✓ nginx已删除！",
        hint: "apt remove nginx",
        explanationOnCorrect: "apt remove 删除软件但保留配置文件",
        explanationOnWrong: "使用 apt remove 删除软件",
        category: "package",
        validation: {
          type: "command",
          startsWith: "apt",
          contains: ["remove", "nginx"],
        },
      },
    ],
  },
  {
    id: 16,
    title: "软件包搜索和查询",
    description: "学习搜索和查询软件包信息",
    difficulty: "简单",
    category: "package",
    tasks: [
      {
        prompt: "搜索 mysql 相关的软件包",
        successMsg: "✓ 搜索完成！",
        hint: "apt search mysql",
        explanationOnCorrect: "apt search 用于搜索软件包",
        explanationOnWrong: "使用 apt search 搜索软件",
        category: "package",
        validation: {
          type: "command",
          startsWith: "apt",
          contains: ["search", "mysql"],
        },
      },
      {
        prompt: "显示 nginx 软件包的详细信息",
        successMsg: "✓ 信息已显示！",
        hint: "apt show nginx",
        explanationOnCorrect: "apt show 显示软件包的详细信息",
        explanationOnWrong: "使用 apt show 查看软件详情",
        category: "package",
        validation: {
          type: "command",
          startsWith: "apt",
          contains: ["show", "nginx"],
        },
      },
      {
        prompt: "列出所有已安装的软件包",
        successMsg: "✓ 列表已显示！",
        hint: "apt list --installed",
        explanationOnCorrect: "apt list --installed 列出所有已安装的包",
        explanationOnWrong: "使用 apt list --installed 查看已安装软件",
        category: "package",
        validation: {
          type: "command",
          startsWith: "apt",
          contains: ["list"],
        },
      },
    ],
  },
  {
    id: 17,
    title: "系统更新维护",
    description: "学习系统更新和清理",
    difficulty: "中等",
    category: "package",
    tasks: [
      {
        prompt: "升级所有已安装的软件包",
        successMsg: "✓ 系统更新完成！",
        hint: "apt upgrade",
        explanationOnCorrect: "apt upgrade 升级所有已安装的软件包",
        explanationOnWrong: "使用 apt upgrade 升级软件",
        category: "package",
        validation: {
          type: "command",
          startsWith: "apt",
          contains: ["upgrade"],
        },
      },
      {
        prompt: "删除不再需要的依赖包",
        successMsg: "✓ 依赖清理完成！",
        hint: "apt autoremove",
        explanationOnCorrect: "apt autoremove 删除不再需要的依赖",
        explanationOnWrong: "使用 apt autoremove 清理依赖",
        category: "package",
        validation: {
          type: "command",
          startsWith: "apt",
          contains: ["autoremove"],
        },
      },
    ],
  },
];

// ============ 磁盘管理类练习 ============
const diskScenarios: ScenarioData[] = [
  {
    id: 18,
    title: "磁盘使用查看",
    description: "学习查看磁盘和目录使用情况",
    difficulty: "简单",
    category: "file",
    tasks: [
      {
        prompt: "显示磁盘空间使用情况（人类可读格式）",
        successMsg: "✓ 磁盘信息已显示！",
        hint: "df -h",
        explanationOnCorrect: "df -h 显示磁盘使用情况",
        explanationOnWrong: "使用 df -h 查看磁盘空间",
        category: "system",
        validation: {
          type: "command",
          startsWith: "df",
          contains: ["-h"],
        },
      },
      {
        prompt: "查看当前目录的大小",
        successMsg: "✓ 目录大小已显示！",
        hint: "du -sh",
        explanationOnCorrect: "du -sh 显示当前目录总大小",
        explanationOnWrong: "使用 du -sh 查看目录大小",
        category: "system",
        validation: {
          type: "command",
          startsWith: "du",
          contains: ["-s", "-h"],
        },
      },
      {
        prompt: "显示所有块设备信息",
        successMsg: "✓ 块设备信息已显示！",
        hint: "lsblk",
        explanationOnCorrect: "lsblk 列出所有块设备",
        explanationOnWrong: "使用 lsblk 查看磁盘结构",
        category: "file",
        validation: {
          type: "command",
          startsWith: "lsblk",
        },
      },
    ],
  },
];

// ============ 进程管理进阶练习 ============
const processScenarios: ScenarioData[] = [
  {
    id: 19,
    title: "进程控制",
    description: "学习控制和管理进程",
    difficulty: "中等",
    category: "system",
    tasks: [
      {
        prompt: "查找所有 ssh 进程",
        successMsg: "✓ 进程查找成功！",
        hint: "pgrep ssh",
        explanationOnCorrect: "pgrep 按名称查找进程ID",
        explanationOnWrong: "使用 pgrep 查找进程",
        category: "system",
        validation: {
          type: "command",
          startsWith: "pgrep",
          contains: ["ssh"],
        },
      },
      {
        prompt: "终止所有名为 firefox 的进程",
        successMsg: "✓ 进程已终止！",
        hint: "pkill firefox",
        explanationOnCorrect: "pkill 按名称发送信号终止进程",
        explanationOnWrong: "使用 pkill 终止进程",
        category: "system",
        validation: {
          type: "command",
          startsWith: "pkill",
          contains: ["firefox"],
        },
      },
      {
        prompt: "将 PID 1234 的进程优先级降低（设置为10）",
        successMsg: "✓ 优先级已修改！",
        hint: "renice 10 -p 1234",
        explanationOnCorrect: "renice 修改运行中进程的优先级",
        explanationOnWrong: "使用 renice 修改进程优先级",
        category: "system",
        validation: {
          type: "command",
          startsWith: "renice",
          contains: ["10", "1234"],
        },
      },
    ],
  },
  {
    id: 20,
    title: "后台任务管理",
    description: "学习管理后台任务",
    difficulty: "中等",
    category: "system",
    tasks: [
      {
        prompt: "查看当前的后台作业",
        successMsg: "✓ 作业列表已显示！",
        hint: "jobs",
        explanationOnCorrect: "jobs 显示当前shell的后台作业",
        explanationOnWrong: "使用 jobs 查看后台任务",
        category: "system",
        validation: {
          type: "command",
          startsWith: "jobs",
        },
      },
      {
        prompt: "将 jobs 命令放入后台执行",
        successMsg: "✓ 命令已在后台运行！",
        hint: "jobs &",
        explanationOnCorrect: "& 符号使命令在后台运行",
        explanationOnWrong: "在命令末尾添加 & 使其后台运行",
        category: "system",
        validation: {
          type: "command",
          startsWith: "jobs",
          contains: ["&"],
        },
      },
    ],
  },
];

// 合并所有场景
export const ALL_PRACTICE_SCENARIOS: ScenarioData[] = [
  ...fileScenarios,
  ...textScenarios,
  ...systemScenarios,
  ...networkScenarios,
  ...shellScenarios,
  ...permissionScenarios,
  ...searchScenarios,
  ...packageScenarios,
  ...diskScenarios,
  ...processScenarios,
  ...MYSQL_PRACTICE_SCENARIOS,
];

// 创建 PracticeScenario 实例
export const PRACTICE_SCENARIOS: PracticeScenario[] = ALL_PRACTICE_SCENARIOS.map(
  (s) => new PracticeScenario(s)
);

// 辅助函数
export function getScenarioById(id: number): PracticeScenario | undefined {
  return PRACTICE_SCENARIOS.find((s) => s.id === id);
}

export function getScenariosByCategory(category: string): PracticeScenario[] {
  return PRACTICE_SCENARIOS.filter((s) => s.category === category);
}

export function getAllCategories(): string[] {
  const categories = new Set<string>();
  PRACTICE_SCENARIOS.forEach((s) => categories.add(s.category));
  return Array.from(categories);
}

export function getCategoryStats(): { category: string; count: number }[] {
  const stats: Record<string, number> = {};
  PRACTICE_SCENARIOS.forEach((s) => {
    stats[s.category] = (stats[s.category] || 0) + 1;
  });
  return Object.entries(stats).map(([category, count]) => ({ category, count }));
}
