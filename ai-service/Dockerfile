FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache tzdata \
  && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
  && echo "Asia/Shanghai" > /etc/timezone

ENV TZ=Asia/Shanghai

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npm install --omit=dev

EXPOSE 3002

CMD ["npm", "start"]
