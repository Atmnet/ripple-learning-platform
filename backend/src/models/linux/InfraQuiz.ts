type GeneratedQuestionType = "choice" | "truefalse" | "fill";

type TopicDefinition = {
  action: string;
  correct: string;
  distractors: [string, string, string];
  explanation: string;
  fillAnswer?: string | string[];
};

type ChoiceQuestion = {
  type: "choice";
  category: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
};

type TrueFalseQuestion = {
  type: "truefalse";
  category: string;
  question: string;
  answer: boolean;
  explain: string;
};

type FillQuestion = {
  type: "fill";
  category: string;
  question: string;
  answer: string | string[];
  explain: string;
};

function buildQuestionSets(category: string, label: string, topics: TopicDefinition[]) {
  const choiceQuestions: ChoiceQuestion[] = [];
  const trueFalseQuestions: TrueFalseQuestion[] = [];
  const fillQuestions: FillQuestion[] = [];

  topics.forEach((topic, index) => {
    choiceQuestions.push({
      type: "choice",
      category,
      question: `${label} 中，下面哪个命令或关键写法用于${topic.action}？`,
      options: [topic.correct, ...topic.distractors],
      answer: 0,
      explain: topic.explanation,
    });

    const useTrueStatement = index % 2 === 0;
    trueFalseQuestions.push({
      type: "truefalse",
      category,
      question: useTrueStatement
        ? `${topic.correct} 可以用于${topic.action}。`
        : `${topic.distractors[0]} 可以用于${topic.action}。`,
      answer: useTrueStatement,
      explain: useTrueStatement
        ? topic.explanation
        : `${topic.distractors[0]} 不能完成“${topic.action}”，正确写法是 ${topic.correct}。`,
    });

    fillQuestions.push({
      type: "fill",
      category,
      question: `${label} 中，用于${topic.action}的关键命令或写法是：_____`,
      answer: topic.fillAnswer ?? topic.correct,
      explain: topic.explanation,
    });
  });

  return { choiceQuestions, trueFalseQuestions, fillQuestions };
}

const nginxTopics: TopicDefinition[] = [
  { action: "查看 Nginx 版本", correct: "nginx -v", distractors: ["nginx status", "nginx version", "systemctl version nginx"], explanation: "nginx -v 用于输出 Nginx 版本信息。" },
  { action: "检测配置文件语法", correct: "nginx -t", distractors: ["nginx -c", "nginx reload", "systemctl test nginx"], explanation: "nginx -t 会检查配置文件语法和整体有效性。" },
  { action: "重新加载配置而不中断服务", correct: "nginx -s reload", distractors: ["nginx restart", "nginx -t reload", "systemctl reloadconf nginx"], explanation: "nginx -s reload 会向主进程发送重载信号。" },
  { action: "快速停止 Nginx", correct: "nginx -s stop", distractors: ["nginx down", "nginx halt", "systemctl disable nginx"], explanation: "nginx -s stop 用于快速停止服务。" },
  { action: "优雅关闭 Nginx", correct: "nginx -s quit", distractors: ["nginx quit", "nginx graceful", "systemctl quit nginx"], explanation: "nginx -s quit 会等待当前连接处理完再退出。" },
  { action: "查看主配置文件", correct: "/etc/nginx/nginx.conf", distractors: ["/etc/nginx.conf", "/usr/local/nginx/nginx.ini", "/var/nginx/nginx.conf"], explanation: "大多数 Linux 发行版默认主配置文件位于 /etc/nginx/nginx.conf。", fillAnswer: ["/etc/nginx/nginx.conf", "nginx.conf"] },
  { action: "定义虚拟主机配置目录", correct: "/etc/nginx/conf.d/", distractors: ["/etc/nginx/vhost/", "/var/nginx/conf/", "/usr/nginx/site/"], explanation: "常见发行版会把站点配置拆到 /etc/nginx/conf.d/ 目录。", fillAnswer: ["/etc/nginx/conf.d/", "/etc/nginx/conf.d"] },
  { action: "指定静态站点根目录的指令", correct: "root", distractors: ["home", "static", "webroot"], explanation: "root 指令用于定义请求资源的根路径。", fillAnswer: "root" },
  { action: "定义默认首页文件的指令", correct: "index", distractors: ["home", "default", "main"], explanation: "index 指令用于配置默认首页文件名。", fillAnswer: "index" },
  { action: "反向代理到上游服务的指令", correct: "proxy_pass", distractors: ["upstream_pass", "reverse_pass", "pass_proxy"], explanation: "proxy_pass 是 Nginx 反向代理最核心的转发指令。", fillAnswer: "proxy_pass" },
  { action: "声明负载均衡上游组的块名称", correct: "upstream", distractors: ["backend", "servers", "balance"], explanation: "upstream 块用于定义后端服务器组。", fillAnswer: "upstream" },
  { action: "监听 80 端口的指令", correct: "listen 80;", distractors: ["port 80;", "server 80;", "bind 80;"], explanation: "listen 80; 用于让 server 块监听 80 端口。", fillAnswer: ["listen 80;", "listen 80"] },
  { action: "配置访问日志文件的指令", correct: "access_log", distractors: ["log_access", "visit_log", "request_log"], explanation: "access_log 指定访问日志输出位置和格式。", fillAnswer: "access_log" },
  { action: "配置错误日志文件的指令", correct: "error_log", distractors: ["log_error", "err_log", "failure_log"], explanation: "error_log 用于定义错误日志级别和输出位置。", fillAnswer: "error_log" },
  { action: "开启 gzip 压缩的指令", correct: "gzip on;", distractors: ["gzip enable;", "compress on;", "gzip true;"], explanation: "gzip on; 用于开启响应压缩。", fillAnswer: ["gzip on;", "gzip on"] },
  { action: "限制客户端请求体大小的指令", correct: "client_max_body_size", distractors: ["max_request_body", "client_body_limit", "request_max_size"], explanation: "client_max_body_size 常用于控制上传文件大小。", fillAnswer: "client_max_body_size" },
  { action: "配置 HTTPS 证书文件的指令", correct: "ssl_certificate", distractors: ["https_certificate", "ssl_cert_file", "tls_certificate"], explanation: "ssl_certificate 用于指定证书 PEM 文件。", fillAnswer: "ssl_certificate" },
  { action: "配置 HTTPS 私钥文件的指令", correct: "ssl_certificate_key", distractors: ["ssl_key", "https_key_file", "tls_private_key"], explanation: "ssl_certificate_key 用于指定证书私钥文件。", fillAnswer: "ssl_certificate_key" },
  { action: "返回 301 跳转的写法", correct: "return 301", distractors: ["rewrite 301 always", "redirect 301", "status 301"], explanation: "return 301 常用于简单、直接的永久跳转。", fillAnswer: ["return 301", "301"] },
  { action: "按 URI 重写路径的指令", correct: "rewrite", distractors: ["replace", "remap", "redirect_uri"], explanation: "rewrite 指令用于正则重写 URI。", fillAnswer: "rewrite" },
  { action: "匹配请求路径的块名称", correct: "location", distractors: ["path", "route", "match"], explanation: "location 块用于根据 URI 匹配不同处理规则。", fillAnswer: "location" },
  { action: "定义站点域名的指令", correct: "server_name", distractors: ["domain_name", "host_name", "site_name"], explanation: "server_name 用于声明虚拟主机匹配的域名。", fillAnswer: "server_name" },
  { action: "查看 Nginx 主进程 PID 文件位置的常用文件", correct: "/run/nginx.pid", distractors: ["/var/run/http.pid", "/tmp/nginx.pid", "/etc/nginx.pid"], explanation: "许多发行版默认将 Nginx PID 文件写入 /run/nginx.pid。", fillAnswer: ["/run/nginx.pid", "/var/run/nginx.pid"] },
  { action: "通过 systemd 启动 Nginx", correct: "systemctl start nginx", distractors: ["service nginx up", "nginx system start", "systemctl open nginx"], explanation: "systemctl start nginx 是现代发行版启动服务的标准方式。" },
  { action: "通过 systemd 重启 Nginx", correct: "systemctl restart nginx", distractors: ["nginx restart service", "service restart nginx.conf", "systemctl reload nginx.conf"], explanation: "systemctl restart nginx 会先停后启，适合完整重启。" },
  { action: "设置开机自启", correct: "systemctl enable nginx", distractors: ["systemctl autostart nginx", "nginx enable boot", "service nginx enable"], explanation: "systemctl enable nginx 用于建立 systemd 启动链接。" },
  { action: "查看服务状态", correct: "systemctl status nginx", distractors: ["nginx status -a", "service nginx check", "systemctl show nginx.conf"], explanation: "systemctl status nginx 可查看当前运行状态和最近日志。" },
  { action: "查看最近访问日志", correct: "tail -f /var/log/nginx/access.log", distractors: ["cat /var/log/nginx/error.log", "less /etc/nginx/nginx.conf", "tail -f /run/nginx.pid"], explanation: "tail -f access.log 用于实时查看访问日志。" },
  { action: "查看最近错误日志", correct: "tail -f /var/log/nginx/error.log", distractors: ["tail -f /var/log/nginx/access.log", "cat /run/nginx.pid", "journalctl -u nginx --since now"], explanation: "error.log 是定位配置和转发错误最常看的日志文件。" },
  { action: "配置 HTTP 基础认证文件的指令", correct: "auth_basic_user_file", distractors: ["basic_auth_file", "user_auth_file", "passwd_file"], explanation: "auth_basic_user_file 用于指定 htpasswd 认证文件。", fillAnswer: "auth_basic_user_file" },
  { action: "启用目录索引展示的指令", correct: "autoindex on;", distractors: ["dirindex on;", "index_auto on;", "browse on;"], explanation: "autoindex on; 可在无首页文件时显示目录列表。", fillAnswer: ["autoindex on;", "autoindex on"] },
  { action: "把真实客户端地址传给上游的常见头", correct: "X-Forwarded-For", distractors: ["X-Client-Host", "Forwarded-IP", "Client-IP-Forward"], explanation: "X-Forwarded-For 常用于代理链路中传递客户端真实 IP。", fillAnswer: "X-Forwarded-For" },
  { action: "限制请求频率使用的模块指令族", correct: "limit_req", distractors: ["rate_limit", "req_limit", "limit_rate_req"], explanation: "limit_req 及其 zone 配置用于做请求限流。", fillAnswer: "limit_req" },
  { action: "配置静态资源缓存过期时间的指令", correct: "expires", distractors: ["cache_time", "max_age", "cache_expires"], explanation: "expires 可为响应设置 Expires/Cache-Control 过期策略。", fillAnswer: "expires" },
];

const redisTopics: TopicDefinition[] = [
  { action: "进入 Redis 命令行客户端", correct: "redis-cli", distractors: ["redis-shell", "redis console", "redis -i"], explanation: "redis-cli 是 Redis 自带的命令行客户端。" },
  { action: "检测 Redis 服务是否可用", correct: "PING", distractors: ["PONG", "HELLO", "STATUS"], explanation: "PING 正常返回 PONG，常用于探活。", fillAnswer: "PING" },
  { action: "设置字符串键值", correct: "SET", distractors: ["PUT", "ADD", "SAVE"], explanation: "SET key value 是最基础的字符串写入命令。", fillAnswer: "SET" },
  { action: "读取字符串键值", correct: "GET", distractors: ["SHOW", "FETCH", "READ"], explanation: "GET key 可读取字符串键当前的值。", fillAnswer: "GET" },
  { action: "给键设置过期时间（秒）", correct: "EXPIRE", distractors: ["TTL", "TIMEOUT", "DELAY"], explanation: "EXPIRE key seconds 用于设置键剩余寿命。", fillAnswer: "EXPIRE" },
  { action: "查看键剩余生存时间", correct: "TTL", distractors: ["EXPIRETIME", "PTIME", "LIFE"], explanation: "TTL key 返回剩余过期时间，单位是秒。", fillAnswer: "TTL" },
  { action: "删除指定键", correct: "DEL", distractors: ["REMOVE", "DELETE", "DROP"], explanation: "DEL key 用于删除一个或多个键。" },
  { action: "判断键是否存在", correct: "EXISTS", distractors: ["HASKEY", "CHECK", "FIND"], explanation: "EXISTS key 返回键是否存在。" },
  { action: "一次递增整数值", correct: "INCR", distractors: ["INC", "ADDONE", "PLUS"], explanation: "INCR 常用于计数器、访问量统计等场景。", fillAnswer: "INCR" },
  { action: "把哈希字段写入值", correct: "HSET", distractors: ["HASHSET", "HMOD", "SETHASH"], explanation: "HSET key field value 用于写哈希表字段。" },
  { action: "读取哈希字段值", correct: "HGET", distractors: ["HASHGET", "HREAD", "GETHASH"], explanation: "HGET key field 用于读取哈希字段。" },
  { action: "把元素从左侧压入列表", correct: "LPUSH", distractors: ["LISTPUSH", "PUSHL", "LADD"], explanation: "LPUSH key value 从列表左侧插入元素。" },
  { action: "查看列表区间元素", correct: "LRANGE", distractors: ["LIST", "LGET", "RANGE"], explanation: "LRANGE key start stop 用于查看列表片段。" },
  { action: "向集合添加成员", correct: "SADD", distractors: ["SETADD", "ADDSET", "PUSHSET"], explanation: "SADD key member 用于向集合写入成员。" },
  { action: "查看集合全部成员", correct: "SMEMBERS", distractors: ["SGETALL", "GETSET", "MEMBERS"], explanation: "SMEMBERS key 用于读取集合成员。" },
  { action: "向有序集合添加成员和分数", correct: "ZADD", distractors: ["ZSAVE", "SCOREADD", "ADDZSET"], explanation: "ZADD key score member 是有序集合的标准写法。" },
  { action: "按分数顺序读取有序集合区间", correct: "ZRANGE", distractors: ["ZLIST", "ZREAD", "ZSHOW"], explanation: "ZRANGE 常用于排行榜等场景。" },
  { action: "切换逻辑数据库", correct: "SELECT", distractors: ["USE", "DB", "CHANGE"], explanation: "SELECT 0/1/2... 可切换 Redis 逻辑库。" },
  { action: "查看当前实例信息", correct: "INFO", distractors: ["STATUS", "SHOW", "DETAIL"], explanation: "INFO 可查看内存、复制、持久化等信息。", fillAnswer: "INFO" },
  { action: "查看配置项值", correct: "CONFIG GET", distractors: ["SHOW CONFIG", "GET CONFIG", "CONFIG SHOW"], explanation: "CONFIG GET pattern 用于查询配置项。" },
  { action: "临时修改配置项", correct: "CONFIG SET", distractors: ["SET CONFIG", "CHANGE CONFIG", "CONFIG UPDATE"], explanation: "CONFIG SET 可动态调整部分配置。" },
  { action: "手动触发后台 RDB 快照", correct: "BGSAVE", distractors: ["SAVE BG", "SNAPSHOT", "RDBSAVE"], explanation: "BGSAVE 会在后台生成 dump.rdb 快照。" },
  { action: "清空当前数据库", correct: "FLUSHDB", distractors: ["CLEARDB", "DROPDB", "ERASEDB"], explanation: "FLUSHDB 只清空当前逻辑库。" },
  { action: "清空全部逻辑数据库", correct: "FLUSHALL", distractors: ["CLEARALL", "FLUSHDB ALL", "DROPALL"], explanation: "FLUSHALL 会清空整个实例里的所有数据库。" },
  { action: "实时查看执行命令", correct: "MONITOR", distractors: ["TRACE", "WATCHALL", "STREAM"], explanation: "MONITOR 会实时输出实例收到的命令，常用于排障。" },
  { action: "发布订阅消息", correct: "PUBLISH", distractors: ["SEND", "EMIT", "PUSH"], explanation: "PUBLISH channel message 用于发布消息。" },
  { action: "订阅频道消息", correct: "SUBSCRIBE", distractors: ["LISTEN", "WATCH", "CONSUME"], explanation: "SUBSCRIBE channel 用于接收发布到频道的消息。" },
  { action: "查看慢查询日志", correct: "SLOWLOG GET", distractors: ["LOG SLOW", "GET SLOW", "SHOW SLOWLOG"], explanation: "SLOWLOG GET 可查看近期慢命令记录。" },
  { action: "查看当前数据库键数量", correct: "DBSIZE", distractors: ["KEYCOUNT", "COUNTDB", "SIZE"], explanation: "DBSIZE 返回当前数据库里的键总数。" },
  { action: "按游标方式扫描键", correct: "SCAN", distractors: ["KEYS", "ITERATE", "CURSOR"], explanation: "SCAN 更适合线上环境渐进式遍历键。" },
  { action: "设置带过期时间的键值", correct: "SETEX", distractors: ["SETTTL", "SETEXP", "EXSET"], explanation: "SETEX key seconds value 可一次写值并设置过期。" },
  { action: "重命名键", correct: "RENAME", distractors: ["MOVEKEY", "NAMESET", "ALTERKEY"], explanation: "RENAME old new 用于变更键名。" },
  { action: "查看键的数据类型", correct: "TYPE", distractors: ["KIND", "DATATYPE", "CLASS"], explanation: "TYPE key 可返回 string/list/hash/set/zset 等类型。" },
  { action: "批量读取多个键", correct: "MGET", distractors: ["MULTIGET", "GETALL", "BGET"], explanation: "MGET key1 key2... 用于批量读取字符串键。" },
  { action: "将键值追加到字符串末尾", correct: "APPEND", distractors: ["CONCAT", "PUSHSTR", "ADDTAIL"], explanation: "APPEND key value 会把新内容追加到现有字符串后面。" },
];

const dockerTopics: TopicDefinition[] = [
  { action: "查看 Docker 版本信息", correct: "docker version", distractors: ["docker -v info", "docker show version", "docker status"], explanation: "docker version 会同时显示客户端和服务端版本。" },
  { action: "查看本机所有镜像", correct: "docker images", distractors: ["docker image lsall", "docker ps -a", "docker list image"], explanation: "docker images 或 docker image ls 用于列出镜像。" },
  { action: "查看正在运行的容器", correct: "docker ps", distractors: ["docker containers", "docker show", "docker list"], explanation: "docker ps 会列出当前运行中的容器。" },
  { action: "查看包括已停止在内的所有容器", correct: "docker ps -a", distractors: ["docker all", "docker ls -all", "docker history"], explanation: "docker ps -a 会显示所有状态的容器。" },
  { action: "拉取镜像", correct: "docker pull", distractors: ["docker fetch", "docker install", "docker get"], explanation: "docker pull 镜像名 用于从仓库拉取镜像。" },
  { action: "启动一个交互式 Ubuntu 容器", correct: "docker run -it ubuntu bash", distractors: ["docker start ubuntu bash", "docker exec ubuntu bash", "docker create -it ubuntu bash"], explanation: "docker run -it ubuntu bash 会创建并进入交互容器。" },
  { action: "后台运行容器", correct: "docker run -d", distractors: ["docker run -bg", "docker start -d", "docker exec -d"], explanation: "-d 参数表示 detached，后台模式运行。" },
  { action: "为容器映射端口", correct: "docker run -p 8080:80", distractors: ["docker run -port 8080:80", "docker run --map 80:8080", "docker expose 8080:80"], explanation: "-p 宿主机端口:容器端口 用于端口映射。" },
  { action: "进入运行中容器执行命令", correct: "docker exec -it", distractors: ["docker run -it", "docker attach exec", "docker shell"], explanation: "docker exec -it 容器名 命令 可进入已运行容器执行命令。" },
  { action: "查看容器日志", correct: "docker logs", distractors: ["docker print", "docker trace", "docker output"], explanation: "docker logs 容器名 可查看标准输出日志。" },
  { action: "实时跟随日志输出", correct: "docker logs -f", distractors: ["docker log tail", "docker logs --tail-only", "docker watch logs"], explanation: "-f 表示 follow，持续跟踪日志输出。" },
  { action: "停止运行中的容器", correct: "docker stop", distractors: ["docker down", "docker halt", "docker terminate"], explanation: "docker stop 会向容器发送停止信号并优雅关闭。" },
  { action: "启动已停止的容器", correct: "docker start", distractors: ["docker up", "docker run existing", "docker begin"], explanation: "docker start 用于启动已存在但已停止的容器。" },
  { action: "重启容器", correct: "docker restart", distractors: ["docker reload", "docker reboot", "docker renew"], explanation: "docker restart 相当于 stop 后再 start。" },
  { action: "删除容器", correct: "docker rm", distractors: ["docker del", "docker erase", "docker remove-container"], explanation: "docker rm 用于删除已停止的容器。" },
  { action: "强制删除正在运行的容器", correct: "docker rm -f", distractors: ["docker stop -rm", "docker force rm", "docker delete -f"], explanation: "-f 会先强制停止再删除容器。" },
  { action: "删除镜像", correct: "docker rmi", distractors: ["docker rm image", "docker delete image", "docker image rmf"], explanation: "docker rmi 用于删除本地镜像。" },
  { action: "基于 Dockerfile 构建镜像", correct: "docker build -t", distractors: ["docker make -t", "docker create image", "docker compile"], explanation: "docker build -t 名称:标签 路径 用于构建镜像。" },
  { action: "给镜像打新标签", correct: "docker tag", distractors: ["docker label", "docker name", "docker retag image"], explanation: "docker tag 源镜像 新镜像名 用于复用同一镜像 ID。" },
  { action: "推送镜像到远程仓库", correct: "docker push", distractors: ["docker upload", "docker publish image", "docker sync"], explanation: "docker push 用于把镜像推送到仓库。" },
  { action: "登录镜像仓库", correct: "docker login", distractors: ["docker auth", "docker signin", "docker connect registry"], explanation: "docker login 用于输入仓库认证信息。" },
  { action: "查看容器详细元数据", correct: "docker inspect", distractors: ["docker info container", "docker detail", "docker show inspect"], explanation: "docker inspect 可查看 IP、挂载、环境变量等详情。" },
  { action: "查看容器资源占用", correct: "docker stats", distractors: ["docker top", "docker monitor", "docker usage"], explanation: "docker stats 用于查看 CPU、内存、网络 IO 等指标。" },
  { action: "查看容器内进程", correct: "docker top", distractors: ["docker ps inside", "docker proc", "docker task"], explanation: "docker top 容器名 可查看容器内进程列表。" },
  { action: "查看端口映射", correct: "docker port", distractors: ["docker expose show", "docker network port", "docker inspect port"], explanation: "docker port 容器名 可查看当前端口映射关系。" },
  { action: "复制文件到容器内", correct: "docker cp", distractors: ["docker mv", "docker sync", "docker file"], explanation: "docker cp 可在宿主机和容器之间双向复制文件。" },
  { action: "查看网络列表", correct: "docker network ls", distractors: ["docker ls network", "docker net list", "docker networks"], explanation: "docker network ls 会列出 bridge、host、自定义网络等。" },
  { action: "查看数据卷列表", correct: "docker volume ls", distractors: ["docker ls volume", "docker storage ls", "docker volumes"], explanation: "docker volume ls 用于查看本地数据卷。" },
  { action: "清理未使用资源", correct: "docker system prune", distractors: ["docker cleanup", "docker clear", "docker remove unused"], explanation: "docker system prune 可清理无用容器、网络和镜像缓存。" },
  { action: "启动 Docker Compose 服务", correct: "docker compose up -d", distractors: ["docker-compose run -d", "docker compose start all", "docker up compose"], explanation: "docker compose up -d 是当前推荐的 Compose 启动方式。" },
  { action: "停止并移除 Compose 资源", correct: "docker compose down", distractors: ["docker compose stopall", "docker compose rm -a", "docker compose halt"], explanation: "docker compose down 会停止并移除服务、网络等资源。" },
  { action: "导出镜像到 tar 文件", correct: "docker save", distractors: ["docker export image", "docker backup", "docker snapshot"], explanation: "docker save 适合离线分发镜像文件。" },
  { action: "从 tar 文件导入镜像", correct: "docker load", distractors: ["docker import image", "docker open", "docker restore"], explanation: "docker load 用于从 save 导出的 tar 包恢复镜像。" },
  { action: "把容器当前状态提交为镜像", correct: "docker commit", distractors: ["docker save container", "docker build current", "docker snapshot create"], explanation: "docker commit 可以从容器运行态生成新镜像。" },
  { action: "修改容器名称", correct: "docker rename", distractors: ["docker tag container", "docker move", "docker alias"], explanation: "docker rename 只修改容器名字，不改变容器 ID。" },
];

const nginxSets = buildQuestionSets("nginx", "Nginx", nginxTopics);
const redisSets = buildQuestionSets("redis", "Redis", redisTopics);
const dockerSets = buildQuestionSets("docker", "Docker", dockerTopics);

export const INFRA_CHOICE_QUESTIONS = [
  ...nginxSets.choiceQuestions,
  ...redisSets.choiceQuestions,
  ...dockerSets.choiceQuestions,
] as const;

export const INFRA_TRUE_FALSE_QUESTIONS = [
  ...nginxSets.trueFalseQuestions,
  ...redisSets.trueFalseQuestions,
  ...dockerSets.trueFalseQuestions,
] as const;

export const INFRA_FILL_QUESTIONS = [
  ...nginxSets.fillQuestions,
  ...redisSets.fillQuestions,
  ...dockerSets.fillQuestions,
] as const;

export const INFRA_TOTAL_QUESTIONS =
  INFRA_CHOICE_QUESTIONS.length +
  INFRA_TRUE_FALSE_QUESTIONS.length +
  INFRA_FILL_QUESTIONS.length;
