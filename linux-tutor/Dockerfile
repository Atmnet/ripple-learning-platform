FROM python:3.12-slim

WORKDIR /app

# 安装依赖（使用清华镜像源，增加超时时间）
RUN pip install --no-cache-dir --timeout 60 -i https://pypi.tuna.tsinghua.edu.cn/simple flask flask-cors rich

# 复制项目文件
COPY . /app/

# 暴露端口
EXPOSE 5000

# 运行Flask应用
CMD ["python", "app.py"]
