/**
 * 虚拟文件系统 - 提供安全的命令执行环境，模拟Linux命令行为
 * Ported from Python sandbox.py to TypeScript
 */

export interface VirtualFileData {
  name: string;
  isDir: boolean;
  size: number;
  content: string;
  created: Date;
  modified: Date;
  permissions: string;
  owner: string;
  group: string;
}

export class VirtualFile {
  name: string;
  isDir: boolean;
  size: number;
  content: string;
  created: Date;
  modified: Date;
  permissions: string;
  owner: string;
  group: string;

  constructor(name: string, isDir: boolean = false, size: number = 0, content: string = "") {
    this.name = name;
    this.isDir = isDir;
    this.size = isDir ? 4096 : size;
    this.content = content;
    this.created = new Date();
    this.modified = new Date();
    this.permissions = isDir ? "drwxr-xr-x" : "-rw-r--r--";
    this.owner = "user";
    this.group = "user";
  }

  toJSON(): VirtualFileData {
    return {
      name: this.name,
      isDir: this.isDir,
      size: this.size,
      content: this.content,
      created: this.created,
      modified: this.modified,
      permissions: this.permissions,
      owner: this.owner,
      group: this.group,
    };
  }
}

export class VirtualFileSystem {
  root: Map<string, VirtualFile>;
  cwd: string;
  history: string[];

  constructor() {
    this.root = new Map();
    this.cwd = "/home/user";
    this.history = [];

    // Initialize default directory structure
    this.initializeDefaultStructure();
  }

  private initializeDefaultStructure(): void {
    const defaultDirs = [
      "/",
      "/home",
      "/home/user",
      "/home/user/Documents",
      "/home/user/Downloads",
      "/home/user/Desktop",
      "/etc",
      "/var",
      "/tmp",
    ];

    defaultDirs.forEach((dir) => {
      const name = dir === "/" ? "/" : dir.split("/").pop() || "";
      this.root.set(dir, new VirtualFile(name, true));
    });

    // Add default files
    this.root.set("/home/user/readme.txt", new VirtualFile("readme.txt", false, 27, "欢迎使用Linux学习工具！"));
    this.root.set("/home/user/Documents/note.txt", new VirtualFile("note.txt", false, 15, "这是一个笔记文件。"));
  }

  getAbsolutePath(path: string): string {
    if (path.startsWith("/")) {
      return path;
    }
    if (path === "~") {
      return "/home/user";
    }
    if (path === "-" && this.history.length > 0) {
      return this.history[this.history.length - 1] || this.cwd;
    }
    if (path.startsWith("~/")) {
      return "/home/user" + path.substring(1);
    }

    // Handle relative path
    const parts = [...this.cwd.split("/").filter((p) => p), ...path.split("/")];
    const result: string[] = [];

    for (const part of parts) {
      if (part === "" || part === ".") {
        continue;
      } else if (part === "..") {
        if (result.length > 0) {
          result.pop();
        }
      } else {
        result.push(part);
      }
    }

    return "/" + result.join("/");
  }

  getParentDir(path: string): string {
    if (path === "/") {
      return "/";
    }
    const parts = path.replace(/\/$/, "").split("/").filter((p) => p);
    if (parts.length === 0) {
      return "/";
    }
    parts.pop();
    return "/" + parts.join("/");
  }

  exists(path: string): boolean {
    const absPath = this.getAbsolutePath(path);
    return this.root.has(absPath);
  }

  isDir(path: string): boolean {
    const absPath = this.getAbsolutePath(path);
    const file = this.root.get(absPath);
    return file ? file.isDir : false;
  }

  listDir(path?: string): Map<string, VirtualFile> {
    const target = path === undefined ? this.cwd : this.getAbsolutePath(path);
    const result = new Map<string, VirtualFile>();

    for (const [absPath, fileObj] of this.root.entries()) {
      const parent = this.getParentDir(absPath);
      if (parent === target || parent + "/" === target) {
        if (absPath !== target) {
          result.set(fileObj.name, fileObj);
        }
      }
    }

    // Add . and ..
    const currentDir = this.root.get(target);
    if (currentDir) {
      result.set(".", new VirtualFile(".", true));
      result.set("..", new VirtualFile("..", true));
    }

    return result;
  }

  getFile(path: string): VirtualFile | undefined {
    const absPath = this.getAbsolutePath(path);
    return this.root.get(absPath);
  }

  createFile(path: string, content: string = ""): boolean {
    const absPath = this.getAbsolutePath(path);
    if (this.root.has(absPath)) {
      return false;
    }

    const parent = this.getParentDir(absPath);
    const parentDir = this.root.get(parent);
    if (!parentDir || !parentDir.isDir) {
      return false;
    }

    const name = absPath === "/" ? "/" : absPath.split("/").pop() || "";
    this.root.set(absPath, new VirtualFile(name, false, content.length, content));
    return true;
  }

  createDir(path: string): boolean {
    const absPath = this.getAbsolutePath(path);
    if (this.root.has(absPath)) {
      return false;
    }

    const parent = this.getParentDir(absPath);
    const parentDir = this.root.get(parent);
    if (!parentDir || !parentDir.isDir) {
      return false;
    }

    const name = absPath === "/" ? "/" : absPath.split("/").pop() || "";
    this.root.set(absPath, new VirtualFile(name, true));
    return true;
  }

  remove(path: string, recursive: boolean = false): boolean {
    const absPath = this.getAbsolutePath(path);
    if (!this.root.has(absPath)) {
      return false;
    }

    const fileObj = this.root.get(absPath)!;
    if (fileObj.isDir && !recursive) {
      // Check if directory is empty
      for (const p of this.root.keys()) {
        if (p.startsWith(absPath + "/")) {
          return false;
        }
      }
    }

    // Remove recursively
    const toRemove: string[] = [absPath];
    if (recursive) {
      for (const p of this.root.keys()) {
        if (p.startsWith(absPath + "/")) {
          toRemove.push(p);
        }
      }
    }

    for (const p of toRemove) {
      this.root.delete(p);
    }

    return true;
  }

  move(src: string, dst: string): boolean {
    const srcAbs = this.getAbsolutePath(src);
    const dstAbs = this.getAbsolutePath(dst);

    if (!this.root.has(srcAbs)) {
      return false;
    }

    // If destination is a directory, move into it
    const dstFile = this.root.get(dstAbs);
    let finalDstAbs = dstAbs;
    if (dstFile?.isDir) {
      const name = srcAbs.split("/").pop() || "";
      finalDstAbs = dstAbs.replace(/\/$/, "") + "/" + name;
    }

    const fileObj = this.root.get(srcAbs)!;
    fileObj.name = finalDstAbs.split("/").pop() || "";
    this.root.set(finalDstAbs, fileObj);
    this.root.delete(srcAbs);
    return true;
  }

  copy(src: string, dst: string): boolean {
    const srcAbs = this.getAbsolutePath(src);
    const dstAbs = this.getAbsolutePath(dst);

    if (!this.root.has(srcAbs)) {
      return false;
    }

    const srcObj = this.root.get(srcAbs)!;

    // If destination is a directory, copy into it
    const dstFile = this.root.get(dstAbs);
    let finalDstAbs = dstAbs;
    if (dstFile?.isDir) {
      const name = srcAbs.split("/").pop() || "";
      finalDstAbs = dstAbs.replace(/\/$/, "") + "/" + name;
    }

    if (srcObj.isDir) {
      // Recursively copy directory
      this.root.set(finalDstAbs, new VirtualFile(finalDstAbs.split("/").pop() || "", true));
      for (const [p, f] of this.root.entries()) {
        if (p.startsWith(srcAbs + "/")) {
          const rel = p.substring(srcAbs.length);
          const newPath = finalDstAbs + rel;
          this.root.set(
            newPath,
            new VirtualFile(
              newPath.split("/").pop() || "",
              f.isDir,
              f.size,
              f.content
            )
          );
        }
      }
    } else {
      this.root.set(
        finalDstAbs,
        new VirtualFile(
          finalDstAbs.split("/").pop() || "",
          false,
          srcObj.size,
          srcObj.content
        )
      );
    }
    return true;
  }

  changeDir(path: string): boolean {
    const absPath = this.getAbsolutePath(path);
    const file = this.root.get(absPath);
    if (file?.isDir) {
      this.history.push(this.cwd);
      this.cwd = absPath;
      return true;
    }
    return false;
  }
}

export interface CommandResult {
  success: boolean;
  output: string;
  error: string;
}

export class CommandSimulator {
  fs: VirtualFileSystem;
  private commands: Map<string, (args: string[]) => CommandResult>;

  constructor() {
    this.fs = new VirtualFileSystem();
    this.commands = new Map([
      ["ls", this.cmdLs.bind(this)],
      ["cd", this.cmdCd.bind(this)],
      ["pwd", this.cmdPwd.bind(this)],
      ["mkdir", this.cmdMkdir.bind(this)],
      ["rm", this.cmdRm.bind(this)],
      ["cp", this.cmdCp.bind(this)],
      ["mv", this.cmdMv.bind(this)],
      ["touch", this.cmdTouch.bind(this)],
      ["cat", this.cmdCat.bind(this)],
      ["head", this.cmdHead.bind(this)],
      ["tail", this.cmdTail.bind(this)],
      ["echo", this.cmdEcho.bind(this)],
      ["clear", this.cmdClear.bind(this)],
      ["help", this.cmdHelp.bind(this)],
      ["whoami", this.cmdWhoami.bind(this)],
      ["date", this.cmdDate.bind(this)],
    ]);
  }

  execute(commandLine: string): CommandResult {
    commandLine = commandLine.trim();
    if (!commandLine) {
      return { success: true, output: "", error: "" };
    }

    // Parse command
    const parts = this.parseCommand(commandLine);
    if (!parts.length) {
      return { success: true, output: "", error: "" };
    }

    const cmd = parts[0];
    const args = parts.slice(1);

    // Handle pipes
    if (commandLine.includes("|")) {
      return this.handlePipe(commandLine);
    }

    const command = this.commands.get(cmd);
    if (command) {
      try {
        return command(args);
      } catch (e) {
        return { success: false, output: "", error: `${cmd}: 执行错误: ${e}` };
      }
    } else {
      return { success: false, output: "", error: `${cmd}: 命令未找到` };
    }
  }

  private parseCommand(line: string): string[] {
    const parts: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === " " && !inQuotes) {
        if (current) {
          parts.push(current);
          current = "";
        }
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }

  private handlePipe(commandLine: string): CommandResult {
    const commands = commandLine.split("|");
    if (commands.length < 2) {
      return { success: false, output: "", error: "管道格式错误" };
    }

    // Execute first command
    const firstCmd = commands[0].trim();
    const firstResult = this.execute(firstCmd);

    if (!firstResult.success) {
      return firstResult;
    }

    // Simplified: only support grep and wc
    const second = commands[1].trim();
    if (second.startsWith("grep ")) {
      const pattern = second.substring(5).trim().replace(/^["']|["']$/g, "");
      const lines = firstResult.output.split("\n");
      const filtered = lines.filter((l) => l.includes(pattern));
      return { success: true, output: filtered.join("\n"), error: "" };
    } else if (second.startsWith("wc ")) {
      if (second.includes("-l")) {
        const lines = firstResult.output.trim().split("\n").filter((l) => l);
        return { success: true, output: String(lines.length), error: "" };
      }
      return { success: true, output: String(firstResult.output.length), error: "" };
    }

    return { success: true, output: firstResult.output, error: "" };
  }

  private cmdLs(args: string[]): CommandResult {
    let path = this.fs.cwd;
    let showAll = false;
    let longFormat = false;
    let humanReadable = false;

    for (const arg of args) {
      if (arg.startsWith("-")) {
        if (arg.includes("a")) showAll = true;
        if (arg.includes("l")) longFormat = true;
        if (arg.includes("h")) humanReadable = true;
      } else {
        path = arg;
      }
    }

    try {
      const items = this.fs.listDir(path);
      if (!items.size) {
        return { success: true, output: "", error: "" };
      }

      // Sort: directories first, then by name
      const sortedItems = Array.from(items.entries()).sort((a, b) => {
        if (a[1].isDir !== b[1].isDir) {
          return a[1].isDir ? -1 : 1;
        }
        return a[0].localeCompare(b[0]);
      });

      const filteredItems = showAll
        ? sortedItems
        : sortedItems.filter(([name]) => !name.startsWith("."));

      if (longFormat) {
        const lines: string[] = [];
        for (const [name, fileObj] of filteredItems) {
          let size = fileObj.size;
          let sizeStr: string;
          if (humanReadable) {
            sizeStr = this.humanReadableSize(size);
          } else {
            sizeStr = String(size);
          }
          const modified = fileObj.modified.toLocaleString("zh-CN", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
          const line = `${fileObj.permissions} 1 ${fileObj.owner} ${fileObj.group} ${sizeStr.padStart(8)} ${modified} ${name}`;
          lines.push(line);
        }
        return { success: true, output: lines.join("\n"), error: "" };
      } else {
        const names = filteredItems.map(([name, fileObj]) =>
          fileObj.isDir ? name + "/" : name
        );
        return { success: true, output: names.join("  "), error: "" };
      }
    } catch {
      return { success: false, output: "", error: `ls: 无法访问'${path}': 没有该文件或目录` };
    }
  }

  private cmdCd(args: string[]): CommandResult {
    const path = args[0] || "~";
    if (this.fs.changeDir(path)) {
      return { success: true, output: "", error: "" };
    }
    return { success: false, output: "", error: `cd: 无法进入目录'${path}': 没有该文件或目录` };
  }

  private cmdPwd(_args: string[]): CommandResult {
    return { success: true, output: this.fs.cwd, error: "" };
  }

  private cmdMkdir(args: string[]): CommandResult {
    if (!args.length) {
      return { success: false, output: "", error: "mkdir: 缺少操作数" };
    }

    let recursive = false;
    const paths: string[] = [];

    for (const arg of args) {
      if (arg === "-p") {
        recursive = true;
      } else if (!arg.startsWith("-")) {
        paths.push(arg);
      }
    }

    for (const path of paths) {
      const absPath = this.fs.getAbsolutePath(path);
      if (recursive) {
        // Recursively create parent directories
        const parts = absPath.replace(/^\//, "").split("/");
        let current = "/";
        for (const part of parts) {
          current = current.replace(/\/$/, "") + "/" + part;
          if (!this.fs.root.has(current)) {
            this.fs.createDir(current);
          }
        }
      } else {
        if (!this.fs.createDir(path)) {
          return { success: false, output: "", error: `mkdir: 无法创建目录'${path}': 文件已存在` };
        }
      }
    }
    return { success: true, output: "", error: "" };
  }

  private cmdRm(args: string[]): CommandResult {
    if (!args.length) {
      return { success: false, output: "", error: "rm: 缺少操作数" };
    }

    let recursive = false;
    let force = false;
    const paths: string[] = [];

    for (const arg of args) {
      if (arg === "-r" || arg === "-R") {
        recursive = true;
      } else if (arg === "-f") {
        force = true;
      } else if (!arg.startsWith("-")) {
        paths.push(arg);
      }
    }

    for (const path of paths) {
      if (!this.fs.remove(path, recursive)) {
        if (!force) {
          return { success: false, output: "", error: `rm: 无法删除'${path}': 没有该文件或目录` };
        }
      }
    }
    return { success: true, output: "", error: "" };
  }

  private cmdCp(args: string[]): CommandResult {
    if (args.length < 2) {
      return { success: false, output: "", error: "cp: 缺少目标文件" };
    }

    let recursive = false;
    const paths: string[] = [];

    for (const arg of args) {
      if (arg === "-r" || arg === "-R") {
        recursive = true;
      } else if (!arg.startsWith("-")) {
        paths.push(arg);
      }
    }

    if (paths.length < 2) {
      return { success: false, output: "", error: "cp: 缺少目标文件" };
    }

    const src = paths[0];
    const dst = paths[1];

    if (!this.fs.copy(src, dst)) {
      return { success: false, output: "", error: `cp: 无法复制'${src}'` };
    }
    return { success: true, output: "", error: "" };
  }

  private cmdMv(args: string[]): CommandResult {
    if (args.length < 2) {
      return { success: false, output: "", error: "mv: 缺少目标文件" };
    }

    const paths = args.filter((a) => !a.startsWith("-"));
    if (paths.length < 2) {
      return { success: false, output: "", error: "mv: 缺少目标文件" };
    }

    const src = paths[0];
    const dst = paths[1];

    if (!this.fs.move(src, dst)) {
      return { success: false, output: "", error: `mv: 无法移动'${src}'` };
    }
    return { success: true, output: "", error: "" };
  }

  private cmdTouch(args: string[]): CommandResult {
    if (!args.length) {
      return { success: false, output: "", error: "touch: 缺少文件参数" };
    }

    for (const path of args) {
      if (!path.startsWith("-")) {
        if (!this.fs.exists(path)) {
          this.fs.createFile(path);
        }
      }
    }
    return { success: true, output: "", error: "" };
  }

  private cmdCat(args: string[]): CommandResult {
    if (!args.length) {
      return { success: true, output: "", error: "" };
    }

    const contents: string[] = [];
    for (const path of args) {
      if (!path.startsWith("-")) {
        const fileObj = this.fs.getFile(path);
        if (!fileObj) {
          return { success: false, output: "", error: `cat: ${path}: 没有该文件或目录` };
        }
        if (fileObj.isDir) {
          return { success: false, output: "", error: `cat: ${path}: 是一个目录` };
        }
        contents.push(fileObj.content);
      }
    }

    return { success: true, output: contents.join("\n"), error: "" };
  }

  private cmdHead(args: string[]): CommandResult {
    let lines = 10;
    let path: string | null = null;

    for (const arg of args) {
      if (arg.startsWith("-n")) {
        lines = arg.length > 2 ? parseInt(arg.substring(2)) : 10;
      } else if (!arg.startsWith("-")) {
        path = arg;
      }
    }

    if (!path) {
      return { success: false, output: "", error: "head: 缺少文件参数" };
    }

    const fileObj = this.fs.getFile(path);
    if (!fileObj) {
      return { success: false, output: "", error: `head: 无法打开'${path}': 没有该文件或目录` };
    }

    const contentLines = fileObj.content.split("\n");
    return { success: true, output: contentLines.slice(0, lines).join("\n"), error: "" };
  }

  private cmdTail(args: string[]): CommandResult {
    let lines = 10;
    let path: string | null = null;

    for (const arg of args) {
      if (arg.startsWith("-n")) {
        lines = arg.length > 2 ? parseInt(arg.substring(2)) : 10;
      } else if (!arg.startsWith("-")) {
        path = arg;
      }
    }

    if (!path) {
      return { success: false, output: "", error: "tail: 缺少文件参数" };
    }

    const fileObj = this.fs.getFile(path);
    if (!fileObj) {
      return { success: false, output: "", error: `tail: 无法打开'${path}': 没有该文件或目录` };
    }

    const contentLines = fileObj.content.split("\n");
    return { success: true, output: contentLines.slice(-lines).join("\n"), error: "" };
  }

  private cmdEcho(args: string[]): CommandResult {
    return { success: true, output: args.join(" "), error: "" };
  }

  private cmdClear(_args: string[]): CommandResult {
    return { success: true, output: "__CLEAR__", error: "" };
  }

  private cmdHelp(_args: string[]): CommandResult {
    const helpText = `可用的模拟命令:
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
`;
    return { success: true, output: helpText, error: "" };
  }

  private cmdWhoami(_args: string[]): CommandResult {
    return { success: true, output: "user", error: "" };
  }

  private cmdDate(_args: string[]): CommandResult {
    const now = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formatted = `${days[now.getDay()]} ${months[now.getMonth()]} ${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")} CST ${now.getFullYear()}`;
    return { success: true, output: formatted, error: "" };
  }

  private humanReadableSize(size: number): string {
    const units = ["B", "K", "M", "G", "T"];
    for (const unit of units) {
      if (size < 1024) {
        return `${Math.floor(size)}${unit}`;
      }
      size /= 1024;
    }
    return `${Math.floor(size)}P`;
  }
}

// Global simulator instance map for session management
const simulators = new Map<string, CommandSimulator>();

export function getOrCreateSimulator(sessionId: string): CommandSimulator {
  if (!simulators.has(sessionId)) {
    simulators.set(sessionId, new CommandSimulator());
  }
  return simulators.get(sessionId)!;
}

export function removeSimulator(sessionId: string): boolean {
  return simulators.delete(sessionId);
}

export function listActiveSessions(): string[] {
  return Array.from(simulators.keys());
}
