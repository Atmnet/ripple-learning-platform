#!/bin/bash
# 部署检查脚本 - 在 Linux 服务器上运行

echo "=== 学员管理平台部署检查 ==="
echo ""

# 检查 Docker
echo "1. 检查 Docker..."
if command -v docker &> /dev/null; then
    echo "   ✓ Docker 已安装: $(docker --version)"
else
    echo "   ✗ Docker 未安装"
    exit 1
fi

# 检查 Docker Compose
echo "2. 检查 Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "   ✓ Docker Compose 已安装: $(docker-compose --version)"
else
    echo "   ✗ Docker Compose 未安装"
    exit 1
fi

# 检查端口
echo "3. 检查端口占用..."
for port in 80 3000 3001 3306; do
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        echo "   ⚠ 端口 $port 已被占用"
    else
        echo "   ✓ 端口 $port 可用"
    fi
done

echo ""
echo "=== 环境检查完成 ==="
echo ""
echo "启动命令:"
echo "  cd docker && docker-compose up -d"
