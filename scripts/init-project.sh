#!/usr/bin/env bash
set -euo pipefail

echo "🚀 智贸（ZhiMao）项目初始化..."

node --version | grep -E "^v(20|22)" >/dev/null || {
  echo "❌ 需要 Node.js v20+ 或 v22+"
  exit 1
}
pnpm --version | grep -E "^10" >/dev/null || {
  echo "❌ 需要 pnpm v10+"
  exit 1
}
docker info >/dev/null 2>&1 || {
  echo "❌ Docker 未运行"
  exit 1
}

echo "✅ 环境检查通过"

pnpm install

pnpm db:start
echo "⏳ 等待 PostgreSQL 就绪..."
sleep 3

pnpm db:generate
pnpm db:migrate

echo "✅ 初始化完成！运行 pnpm dev 启动开发服务器"
