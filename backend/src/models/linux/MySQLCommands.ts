export const MYSQL_COMMAND_DB = {
  mysql: {
    name: "mysql",
    desc: "连接 MySQL 数据库客户端",
    longDesc: "mysql 是 MySQL/MariaDB 的命令行客户端，用于连接数据库服务、执行 SQL 语句、管理库表与查询数据。理解它的连接参数和进入交互式会话的方式，是学习数据库的第一步。",
    category: "mysql",
    syntax: "mysql -u 用户名 -p [-h 主机] [-P 端口] [数据库名]",
    options: [
      { flag: "-u", desc: "指定用户名" },
      { flag: "-p", desc: "提示输入密码" },
      { flag: "-h", desc: "指定数据库主机" },
      { flag: "-P", desc: "指定端口号" },
      { flag: "-e", desc: "直接执行一条 SQL 后退出" }
    ],
    examples: [
      { cmd: "mysql -u root -p", desc: "以 root 用户连接本地 MySQL" },
      { cmd: "mysql -u app -p -h 127.0.0.1 -P 3306", desc: "连接指定主机和端口" },
      { cmd: "mysql -u root -p -e \"SHOW DATABASES;\"", desc: "直接执行 SQL 并输出结果" }
    ],
    usageScenarios: [
      "连接数据库服务并进入交互式命令行",
      "执行初始化 SQL 或运维查询",
      "排查数据库连接、权限与查询结果"
    ],
    related: ["show-databases", "use", "select", "create-table"],
    tips: "生产环境连接远程数据库时，优先使用最小权限账号而不是 root。"
  },
  "show-databases": {
    name: "show-databases",
    desc: "查看当前实例中的数据库列表",
    longDesc: "SHOW DATABASES 是最常见的 MySQL 元信息查询语句之一。它用于列出当前账号有权限访问的所有数据库，是确认环境、定位业务库的重要步骤。",
    category: "mysql",
    syntax: "SHOW DATABASES;",
    options: [],
    examples: [
      { cmd: "SHOW DATABASES;", desc: "查看数据库列表" }
    ],
    usageScenarios: [
      "检查实例中已有的业务库",
      "确认当前账号可访问哪些数据库"
    ],
    related: ["create-database", "use", "show-tables"]
  },
  use: {
    name: "use",
    desc: "切换当前会话使用的数据库",
    longDesc: "USE 语句将当前会话的默认数据库切换到指定库。执行后，后续的表操作不需要再写数据库前缀，适合在交互式操作时简化 SQL。",
    category: "mysql",
    syntax: "USE 数据库名;",
    options: [],
    examples: [
      { cmd: "USE training;", desc: "切换到 training 数据库" }
    ],
    usageScenarios: [
      "进入目标业务库后执行增删改查",
      "开发调试时切换不同环境的数据库"
    ],
    related: ["show-databases", "show-tables", "select"]
  },
  "create-database": {
    name: "create-database",
    desc: "创建新的数据库",
    longDesc: "CREATE DATABASE 用于新建数据库，是业务系统初始化时最基础的 DDL 语句之一。可以结合字符集与排序规则，保证中文和多语言内容正确存储与比较。",
    category: "mysql",
    syntax: "CREATE DATABASE 数据库名 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
    options: [],
    examples: [
      { cmd: "CREATE DATABASE training CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", desc: "创建支持完整 Unicode 的数据库" }
    ],
    usageScenarios: [
      "初始化新项目数据库",
      "搭建测试环境或演示环境"
    ],
    related: ["show-databases", "use", "create-table"],
    note: "字符集通常优先选择 utf8mb4，避免 emoji 或特殊字符存储异常。"
  },
  "create-table": {
    name: "create-table",
    desc: "创建数据表并定义字段结构",
    longDesc: "CREATE TABLE 是数据库建模的核心语句。通过它可以定义字段、数据类型、主键、默认值、约束等内容，决定数据如何被存储、校验和查询。",
    category: "mysql",
    syntax: "CREATE TABLE 表名 (字段定义, ...);",
    options: [],
    examples: [
      { cmd: "CREATE TABLE students (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) NOT NULL, score INT DEFAULT 0);", desc: "创建学生表" }
    ],
    usageScenarios: [
      "设计业务数据结构",
      "初始化模块表结构"
    ],
    related: ["describe", "alter-table", "insert", "select"],
    tips: "优先为主键、唯一字段和常用查询条件设计索引。"
  },
  "show-tables": {
    name: "show-tables",
    desc: "查看当前数据库中的表列表",
    longDesc: "SHOW TABLES 用于列出当前数据库中的所有表，是确认建表是否成功、了解库结构的常用命令。",
    category: "mysql",
    syntax: "SHOW TABLES;",
    options: [],
    examples: [
      { cmd: "SHOW TABLES;", desc: "查看当前数据库全部表" }
    ],
    usageScenarios: [
      "检查当前库内有哪些业务表",
      "确认迁移或建表脚本是否执行成功"
    ],
    related: ["use", "describe", "create-table"]
  },
  describe: {
    name: "describe",
    desc: "查看表结构定义",
    longDesc: "DESCRIBE（可简写为 DESC）用于查看表结构，包括字段名、类型、是否可空、默认值、键类型等信息，是排查字段定义和约束的高频语句。",
    category: "mysql",
    syntax: "DESCRIBE 表名;",
    options: [],
    examples: [
      { cmd: "DESCRIBE students;", desc: "查看 students 表结构" },
      { cmd: "DESC students;", desc: "DESC 是 DESCRIBE 的简写" }
    ],
    usageScenarios: [
      "查看字段定义与约束",
      "排查查询报错是否因字段类型不匹配"
    ],
    related: ["create-table", "alter-table", "show-tables"]
  },
  select: {
    name: "select",
    desc: "查询表中的数据",
    longDesc: "SELECT 是最核心的 SQL 查询语句。它可以配合 WHERE、ORDER BY、GROUP BY、LIMIT 等子句，完成筛选、排序、聚合和分页，是数据读取的基础。",
    category: "mysql",
    syntax: "SELECT 字段列表 FROM 表名 [WHERE 条件] [ORDER BY 字段] [LIMIT 数量];",
    options: [],
    examples: [
      { cmd: "SELECT * FROM students;", desc: "查询所有学生记录" },
      { cmd: "SELECT name, score FROM students WHERE score >= 90 ORDER BY score DESC;", desc: "查询高分学生并排序" }
    ],
    usageScenarios: [
      "查看业务数据",
      "筛选满足条件的记录",
      "为报表和接口提供结果集"
    ],
    related: ["insert", "update-sql", "delete-sql", "join-query"]
  },
  insert: {
    name: "insert",
    desc: "向表中新增数据记录",
    longDesc: "INSERT 用于向表中写入新记录。它要求列和值的数量与顺序匹配，是数据持久化最基础的写操作之一。",
    category: "mysql",
    syntax: "INSERT INTO 表名 (列1, 列2, ...) VALUES (值1, 值2, ...);",
    options: [],
    examples: [
      { cmd: "INSERT INTO students (name, score) VALUES ('Alice', 95);", desc: "插入一条学生成绩记录" },
      { cmd: "INSERT INTO students (name, score) VALUES ('Bob', 88), ('Cindy', 91);", desc: "一次插入多条记录" }
    ],
    usageScenarios: [
      "新增业务数据",
      "导入初始化记录"
    ],
    related: ["select", "update-sql", "delete-sql"]
  },
  "update-sql": {
    name: "update-sql",
    desc: "更新已有记录的字段值",
    longDesc: "UPDATE 用于修改表中已存在的数据。它通常配合 WHERE 使用，只更新目标记录；如果省略 WHERE，会影响整张表，风险很高。",
    category: "mysql",
    syntax: "UPDATE 表名 SET 列 = 新值 [, ...] WHERE 条件;",
    options: [],
    examples: [
      { cmd: "UPDATE students SET score = 100 WHERE id = 1;", desc: "更新 id=1 的学生成绩" }
    ],
    usageScenarios: [
      "修正业务数据",
      "批量调整字段状态"
    ],
    related: ["select", "insert", "delete-sql"],
    note: "执行 UPDATE 前先用 SELECT 验证 WHERE 条件范围，是很重要的习惯。"
  },
  "delete-sql": {
    name: "delete-sql",
    desc: "删除表中的记录",
    longDesc: "DELETE 用于删除满足条件的数据记录。与 UPDATE 一样，通常必须配合 WHERE 使用；误删整表数据是数据库事故中的高发问题。",
    category: "mysql",
    syntax: "DELETE FROM 表名 WHERE 条件;",
    options: [],
    examples: [
      { cmd: "DELETE FROM students WHERE id = 3;", desc: "删除 id=3 的记录" }
    ],
    usageScenarios: [
      "清理无效或重复数据",
      "根据条件删除历史记录"
    ],
    related: ["select", "insert", "update-sql"],
    note: "删除前建议先 SELECT 同样的 WHERE 条件确认命中范围。"
  },
  "alter-table": {
    name: "alter-table",
    desc: "修改已有表结构",
    longDesc: "ALTER TABLE 用于在不删除表的前提下修改结构，比如新增字段、修改字段类型、添加索引或约束。它是数据库演进和版本升级中的常用语句。",
    category: "mysql",
    syntax: "ALTER TABLE 表名 ADD COLUMN 字段名 数据类型;",
    options: [],
    examples: [
      { cmd: "ALTER TABLE students ADD COLUMN email VARCHAR(100);", desc: "为 students 表新增 email 字段" }
    ],
    usageScenarios: [
      "需求迭代时扩展表结构",
      "补充索引或约束"
    ],
    related: ["create-table", "describe"]
  },
  "join-query": {
    name: "join-query",
    desc: "关联多张表进行联合查询",
    longDesc: "JOIN 用于按照关联条件组合多张表的数据。它体现了关系型数据库中“结构化建模 + 关联查询”的核心价值，是业务报表、订单详情等场景的基础。",
    category: "mysql",
    syntax: "SELECT 字段 FROM 表A a JOIN 表B b ON a.字段 = b.字段;",
    options: [],
    examples: [
      { cmd: "SELECT s.name, c.course_name FROM students s JOIN courses c ON s.course_id = c.id;", desc: "查询学生及其课程名称" }
    ],
    usageScenarios: [
      "查询主表与明细表组合信息",
      "生成带有多表字段的报表"
    ],
    related: ["select", "create-table"],
    tips: "写 JOIN 时先明确主表、关联条件和最终要返回的字段，查询会更清晰。"
  }
}
