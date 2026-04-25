FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache tzdata \
  && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo "Asia/Shanghai" > /etc/timezone

ENV TZ=Asia/Shanghai

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm install

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 安装生产环境依赖
RUN npm install --only=production

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["npm", "start"]
