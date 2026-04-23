# Story 1.1: Monorepo 项目初始化

## Story Metadata

| Field | Value |
|---|---|
| **Story ID** | 1.1 |
| **Story Key** | 1-1-monorepo-project-initialization |
| **Epic** | Epic 1: 项目基础与认证系统 |
| **Status** | ready-for-dev |
| **Created** | 2026-03-22 |
| **Project** | 智贸（ZhiMao） |

---

## User Story

**As a** 开发者,
**I want** 从架构约定初始化完整 monorepo 骨架,
**So that** 后续模块有统一工程基座。

---

## Acceptance Criteria

```
Given 空仓库或初始提交
When  执行 `pnpm install` 与根脚本 `pnpm setup`
Then  目录包含 apps/api、apps/web、packages/shared-types、turbo.json、ESLint flat config、Prettier、TypeScript 基线
And   apps/api 可启动并返回 GET /api/v1/health → { success: true, data: { status: "ok" } }
And   apps/web 可启动（Vite dev server），集成 Vue 3 + Naive UI（Zm* 包装层骨架）
And   packages/shared-types 含 tsup 构建配置，ESM+CJS 双输出正常
And   packages/database（Prisma schema）含空白迁移占位，可执行 prisma migrate dev 与 prisma generate
And   Docker Compose（docker-compose.dev.yml）可一键启动本机 PostgreSQL 16+
And   pre-commit hook（husky + lint-staged）在提交时运行 ESLint + Prettier
And   commitlint 拒绝非 Conventional Commits 格式的提交信息
And   pnpm dev 并行启动 web + api（Turborepo 编排）
And   pnpm test 并行执行前后端 Vitest 测试并通过
And   pnpm build 成功完成（shared-types → api + web 并行）
```

> **DB:** 无业务表。仅 Prisma 空迁移占位（`0_init.sql`）。

---

## Business Context

这是整个项目的**第一个 Story**，也是工程基座。本 Story 完成后，后续所有 Epic 1-8 的 Story 将在此骨架上构建。架构约定必须从 Day 1 建立正确，因为后续所有模块的代码组织、构建、测试、部署均依赖此基座。

**AR1**（Monorepo 结构：pnpm + Turborepo）在本 Story 完成。

---

## Technical Requirements

### Locked Version Table

| 依赖 | 版本 | 备注 |
|---|---|---|
| Node.js | v22+ LTS | 严格要求，脚本中检查版本 |
| pnpm | v10.x | strict-peer-dependencies, content-addressable store |
| Turborepo | v2.8.17 | 精简 4 任务：build/test/lint/dev |
| NestJS | v11.1.17 | SWC 默认编译器，Vitest 默认测试 |
| Prisma | v7.x | 纯 TypeScript 重写，driver adapter 模式 |
| Vue | v3.x | create-vue v3.22.1，TypeScript 默认 |
| Vite | v6.x | HMR + monorepo optimizeDeps 配置 |
| Naive UI | v2.44.1 | 90+ 组件，TypeScript 原生 |
| TypeScript | v5.7+ | 严格模式（strict: true） |
| PostgreSQL | 16+ | Docker 镜像 postgres:16-alpine |

> ⚠️ **禁止降级**：不得使用旧版本替代品（如 webpack、Jest、npm/yarn）。

---

### Mandatory Directory Structure

以下目录结构必须**精确实现**，后续所有模块依赖此约定：

```
zhimao/
├── apps/
│   ├── web/                          # Vue 3 前端 SPA
│   │   ├── src/
│   │   │   ├── modules/              # 按业务域（Phase 1 只建骨架目录）
│   │   │   │   └── .gitkeep
│   │   │   ├── shared/               # 共享组件/composables
│   │   │   │   └── components/
│   │   │   │       └── zm/           # Zm* 包装组件目录（ZmTable/ZmForm/ZmModal 骨架）
│   │   │   ├── layouts/              # 布局组件
│   │   │   ├── router/
│   │   │   │   └── index.ts
│   │   │   ├── stores/               # Pinia stores
│   │   │   └── App.vue
│   │   ├── .env                      # 非敏感变量（VITE_API_BASE_URL 等）
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── api/                          # NestJS 后端
│       ├── src/
│       │   ├── modules/              # 按业务域（Phase 1 只建骨架目录）
│       │   │   └── .gitkeep
│       │   ├── shared/               # 共享服务（加密/审计/汇率/文件）
│       │   ├── common/               # 通用基础设施（guards/interceptors/filters/pipes）
│       │   │   ├── filters/
│       │   │   ├── interceptors/
│       │   │   └── pipes/
│       │   ├── generated/            # Prisma 7 生成的客户端（勿手动修改）
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── prisma/
│       │   ├── schema.prisma         # Day 1 数据模型（Story 1.2 填充内容）
│       │   └── migrations/
│       │       └── 0_init/           # 空占位迁移
│       ├── .env                      # 敏感变量（DATABASE_URL/LLM_API_KEY 等）
│       ├── .env.example
│       ├── package.json
│       └── nest-cli.json
│
├── packages/
│   └── shared-types/                 # 前后端共享 TypeScript 类型
│       ├── src/
│       │   ├── dto/                  # API 请求/响应 DTO
│       │   ├── enums/                # 共享枚举（OrderStatus, QuoteStatus 等）
│       │   ├── models/               # 值对象（Money, EmailAddress, HsCode）
│       │   └── index.ts              # 统一导出
│       ├── tsup.config.ts            # ESM+CJS 双输出
│       └── package.json
│
├── docker/
│   ├── Dockerfile.api                # 多阶段构建，目标 <200MB，node:22-slim
│   ├── Dockerfile.web                # 多阶段构建，目标 <50MB，Nginx + 静态文件
│   └── nginx.conf
│
├── infra/
│   └── ci/                           # CI/CD pipeline 配置（GitHub Actions）
│
├── scripts/
│   ├── init-project.sh               # 一键初始化脚本
│   └── setup-dev.sh                  # 开发环境快速启动
│
├── tools/
│   └── seed/                         # DB seed 脚本（开发测试数据）
│
├── docker-compose.yml                # 生产部署（app+db+nginx）
├── docker-compose.dev.yml            # 开发模式（仅 db+nginx，前后端主机运行）
├── turbo.json                        # Turborepo 任务编排
├── pnpm-workspace.yaml               # workspace 成员定义
├── package.json                      # 根 package.json（Turborepo + 共享 dev 依赖）
├── .npmrc                            # pnpm 配置
├── eslint.config.js                  # 共享 ESLint flat config（根目录）
├── prettier.config.js                # 共享 Prettier 配置
├── tsconfig.base.json                # 共享 TypeScript base 配置
├── .env.example                      # 全项目环境变量模板
├── .gitignore
├── .dockerignore
├── ARCHITECTURE.md                   # 目录结构、package 职责、常用命令速查
└── README.md
```

> ⚠️ **禁止偏差**：后续所有 Story 的模块目录必须严格遵循此结构。任何新模块：前端建 `apps/web/src/modules/{domain}/`，后端建 `apps/api/src/modules/{domain}/`。

---

### Exact Configuration Files Required

#### `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

#### `turbo.json`（精简 4 任务，Turborepo v2 格式）
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "env": ["DATABASE_URL", "NODE_ENV"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

#### `tsconfig.base.json`（严格模式）
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

#### `.npmrc`
```
strict-peer-dependencies=true
auto-install-peers=true
shamefully-hoist=false
```

#### `eslint.config.js`（ESLint 9 flat config）
```js
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: { parser: tsParser },
    rules: {
      ...tsPlugin.configs['recommended'].rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },
  prettierConfig,
  { ignores: ['**/dist/**', '**/node_modules/**', '**/generated/**'] },
];
```

#### `prettier.config.js`
```js
export default {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  endOfLine: 'lf',
};
```

#### `.commitlintrc.json`
```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "scope-enum": [2, "always", ["api", "web", "types", "infra", "scripts", "deps"]]
  }
}
```

> **scope 规则严格执行**：提交必须使用以上 scope 之一（例：`feat(api): add health check endpoint`）。

#### `docker-compose.dev.yml`（开发模式，仅 DB + Nginx）
```yaml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: zhimao_dev
      POSTGRES_USER: zhimao
      POSTGRES_PASSWORD: ${DB_PASSWORD:-localdevpassword}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U zhimao']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

#### `apps/api/prisma/schema.prisma`（Story 1.1 骨架，Story 1.2 填充）
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Story 1.2 将在此添加 Tenant、User 等实体
// Story 1.1 只需此文件存在并可成功 generate/migrate
```

#### `apps/api/src/main.ts`（NestJS 启动入口）
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' });

  const config = new DocumentBuilder()
    .setTitle('ZhiMao API')
    .setDescription('智贸 AI 外贸工作台 API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
}

bootstrap();
```

#### `apps/api/src/app.module.ts`（健康检查端点）

AppModule 必须注册一个 `/api/v1/health` GET 端点，返回：
```json
{ "success": true, "data": { "status": "ok", "timestamp": "2026-03-22T10:00:00Z" } }
```

---

### Prisma 7 特定配置（关键，勿用旧版写法）

Prisma 7 与 Prisma 5/6 有**破坏性变更**：

1. **generator 输出路径**：必须输出到 `src/generated/prisma`（非 `node_modules/.prisma/client`）
2. **driver adapter 模式**：必须安装 `@prisma/adapter-pg` + `pg`，并在 NestJS 服务中初始化：
   ```typescript
   import { PrismaPg } from '@prisma/adapter-pg';
   import { Pool } from 'pg';
   import { PrismaClient } from '../generated/prisma';

   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   const adapter = new PrismaPg(pool);
   const prisma = new PrismaClient({ adapter });
   ```
3. **schema 中设置**：`moduleFormat = "cjs"` 以确保 NestJS CommonJS 兼容
4. **.gitignore 中排除** `apps/api/src/generated/` 目录（每次 `prisma generate` 重新生成）

---

### packages/shared-types 构建配置

```typescript
// packages/shared-types/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
});
```

```json
// packages/shared-types/package.json（关键字段）
{
  "name": "@zhimao/shared-types",
  "version": "0.1.0",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  }
}
```

在 `apps/api/package.json` 和 `apps/web/package.json` 中引用：
```json
{
  "dependencies": {
    "@zhimao/shared-types": "workspace:*"
  }
}
```

---

### Root package.json Scripts

```json
{
  "name": "zhimao",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "setup": "bash scripts/init-project.sh",
    "db:start": "docker-compose -f docker-compose.dev.yml up -d db",
    "db:stop": "docker-compose -f docker-compose.dev.yml down",
    "db:migrate": "pnpm --filter @zhimao/api prisma migrate dev",
    "db:generate": "pnpm --filter @zhimao/api prisma generate",
    "db:seed": "pnpm --filter @zhimao/api prisma db seed",
    "prepare": "husky"
  }
}
```

---

### Vite Config for apps/web（Monorepo 适配）

```typescript
// apps/web/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // 关键：monorepo 中 workspace 包需要 optimizeDeps 预构建
  optimizeDeps: {
    include: ['@zhimao/shared-types'],
  },
});
```

---

### Zm* Wrapper Component Skeleton

本 Story 只需建立 **骨架文件**，不需要完整实现。后续 Story 填充内容。

```
apps/web/src/shared/components/zm/
├── ZmTable.vue      # 骨架（<template><slot /></template>）
├── ZmForm.vue       # 骨架
├── ZmModal.vue      # 骨架
└── index.ts         # 统一导出
```

UX 要求（UX4, AR7）：所有业务组件通过 Zm* 使用 Naive UI，禁止直接引用 Naive UI 组件（隔离 API，降低替换成本）。

---

### Environment Variables Reference

#### `apps/api/.env.example`
```bash
# Database
DATABASE_URL=postgresql://zhimao:localdevpassword@localhost:5432/zhimao_dev

# JWT（Story 1.3 使用）
JWT_SECRET=change_this_to_a_secure_random_string_min_32_chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Encryption（Story 1.2 使用）
ENCRYPTION_KEY=change_this_to_a_32_byte_hex_string

# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# LLM（Epic 3+ 使用，Story 1.1 不需要）
# LLM_API_KEY=
# LLM_API_BASE_URL=
```

#### `apps/web/.env.example`
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=智贸
```

---

### CI/CD Pipeline（GitHub Actions）

在 `infra/ci/` 创建 `.github/workflows/ci.yml`：

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint-test-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
```

Pipeline 顺序：**lint → test → build**（AR1 要求）。

---

### Dockerfile Specifications

#### `docker/Dockerfile.api`（目标 <200MB）
```dockerfile
FROM node:22-slim AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @zhimao/api build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### `docker/Dockerfile.web`（目标 <50MB）
```dockerfile
FROM node:22-slim AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @zhimao/web build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

---

## Testing Requirements

### What Must Be Tested in This Story

| 测试类型 | 范围 | 工具 |
|---|---|---|
| 单元测试 | 健康检查 controller | Vitest（NestJS 11 默认） |
| 集成测试 | Prisma Client 可连接 DB | Vitest + Docker Compose DB |
| E2E 骨架 | Playwright 安装配置（不写测试用例） | Playwright |

### Test File Locations

- `apps/api/src/app.controller.spec.ts` — 健康检查 controller 单测
- `apps/api/src/app.module.spec.ts` — 模块编译测试
- `apps/web/src/App.spec.ts` — Vue 应用挂载测试（骨架）

### Coverage Requirement

本 Story 代码量少，**不强制 60% 覆盖率**（覆盖率目标从 Epic 1 功能 Story 起计入）。确保测试配置正确、`pnpm test` 命令通过即可。

### Vitest Configuration（apps/api）

NestJS 11 内置 Vitest 集成，使用 `@nestjs/testing` 即可：
```typescript
// apps/api/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/generated/**', 'src/**/*.spec.ts'],
    },
  },
});
```

---

## Architecture Compliance Guardrails

以下规则从 Day 1 强制，后续 Story **不得破坏**：

### ✅ MUST DO

1. **pnpm catalog 统一版本**：所有 workspace 共享依赖版本在根 `package.json` 的 `pnpm.overrides` 或 catalog 中统一声明
2. **strict TypeScript**：`strict: true` + `noUnusedLocals: true` + `noUnusedParameters: true`。禁止 `any` 类型（ESLint 规则 `@typescript-eslint/no-explicit-any: 'error'`）
3. **Prisma 生成文件不入 git**：`.gitignore` 中加入 `apps/api/src/generated/`
4. **模块边界**：后续安装 `eslint-plugin-boundaries`（AR8），本 Story 先建 config 骨架
5. **API 路径前缀**：所有 API 端点必须以 `/api/v1/` 开头
6. **Response Envelope**：所有 API 响应遵循 `{ success, data, meta }` 格式
7. **环境变量注入**：使用 `@nestjs/config` 的 `ConfigService`，禁止直接访问 `process.env`（健壮性）
8. **apps/web 中禁止直接导入 Naive UI 组件**：必须通过 `Zm*` 包装层（仅骨架阶段可例外，但骨架文件需立即创建）

### ❌ MUST NOT DO

1. 不得使用 `npm` 或 `yarn`（纯 pnpm workspace）
2. 不得安装 `webpack`、`Jest`（Vite + Vitest 是唯一选项）
3. 不得将 Prisma Entity 类型放入 `packages/shared-types`（只放 DTO/枚举/值对象）
4. 不得在 Phase 1 引入 Redis、BullMQ、WebSocket（PRD 明确约束）
5. 不得在根目录直接写业务代码（仅配置文件）
6. 不得跳过 pre-commit hook 检查（`git commit --no-verify` 仅紧急情况使用）

---

## Step-by-Step Implementation Order

按以下顺序实现，不要乱序：

1. **创建根目录结构** — `package.json`、`pnpm-workspace.yaml`、`.npmrc`、`turbo.json`、`tsconfig.base.json`
2. **创建前端 apps/web** — `pnpm create vue@latest web -- --typescript --router --pinia --vitest --eslint-with-prettier`，然后安装 Naive UI
3. **创建后端 apps/api** — `npx @nestjs/cli@latest new api --package-manager pnpm --strict`，然后安装 Prisma 7 相关包
4. **配置 Prisma 7** — 修改 schema.prisma（generator 输出路径、driver adapter），执行 `prisma generate`
5. **创建 packages/shared-types** — 手动创建目录，配置 tsup
6. **配置代码质量工具链** — ESLint flat config、Prettier、husky、lint-staged、commitlint
7. **创建 Docker 配置** — `docker-compose.dev.yml`、`Dockerfile.api`、`Dockerfile.web`
8. **实现健康检查端点** — `GET /api/v1/health`
9. **创建 Zm* 骨架** — `ZmTable.vue`、`ZmForm.vue`、`ZmModal.vue`（空骨架）
10. **创建 `scripts/init-project.sh`** — 检查 Node/pnpm 版本 → Docker DB 启动 → `prisma migrate dev` → seed（空）→ `pnpm dev`
11. **创建 CI/CD** — `.github/workflows/ci.yml`
12. **写测试** — 健康检查 controller 单测、Vitest 配置验证
13. **完善文档** — `ARCHITECTURE.md`、`README.md`、`.env.example`

---

## init-project.sh Reference Implementation

```bash
#!/bin/bash
set -e

echo "🚀 智贸（ZhiMao）项目初始化..."

# 检查环境
node --version | grep -E "^v22" || (echo "❌ 需要 Node.js v22+" && exit 1)
pnpm --version | grep -E "^10" || (echo "❌ 需要 pnpm v10+" && exit 1)
docker info > /dev/null 2>&1 || (echo "❌ Docker 未运行" && exit 1)

echo "✅ 环境检查通过"

# 安装依赖
pnpm install

# 启动开发数据库
pnpm db:start
echo "⏳ 等待 PostgreSQL 就绪..."
sleep 3

# 执行数据库迁移
pnpm db:generate
pnpm db:migrate

echo "✅ 初始化完成！运行 pnpm dev 启动开发服务器"
```

---

## Known Architectural Context for Future Stories

> **Dev Agent 必读**：这些决定在本 Story 建立，后续 Story 必须遵守。

| 决定 | 细节 | 适用 Story |
|---|---|---|
| **认证方案** | JWT access token（15min）+ HTTPOnly cookie refresh token（7d），Argon2id 密码哈希 | Story 1.3 |
| **RBAC 设计** | Permission-based（`{resource}:{action}`），Phase 1 只建 admin + user 两角色 | Story 1.3, 1.5 |
| **数据模型策略** | Day 1 设计全流程（覆盖 Phase 4），API/UI 只暴露当前 Phase 功能 | Story 1.2 |
| **多租户隔离** | 每租户独立 Docker Compose 栈 + 独立 Prisma Client 实例（NFR-S6） | 所有后续 Story |
| **API 格式** | Response Envelope：`{ success, data, meta }` | 所有 API Story |
| **错误码格式** | `{MODULE}_{CATEGORY}_{SEQ}`（如 `AUTH_VALID_001`） | Story 1.3+ |
| **加密服务** | AES-256 字段级加密，密钥通过环境变量注入（AR4） | Story 1.2+ |
| **Prisma 中间件** | 全局自动注入租户/用户级数据过滤（`WHERE tenant_id = ?`） | Story 1.2 |
| **缓存策略（Phase 1）** | 无 Redis，内存 Map + TTL（汇率 5min，HS 编码 24h），前端 localStorage | Story 6+ |
| **Phase 1 禁止** | 不引入 Redis、BullMQ、WebSocket、Pgvector | 所有 Phase 1 Story |

---

## Completion Checklist

在标记 Story 完成前，验证以下所有项：

- [ ] `pnpm install` 无报错
- [ ] `pnpm dev` 并行启动 web（5173 端口）和 api（3000 端口）
- [ ] `curl http://localhost:3000/api/v1/health` 返回 `{ "success": true, "data": { "status": "ok" } }`
- [ ] `http://localhost:5173` 可访问，显示 Vue 3 + Naive UI 初始页面
- [ ] `pnpm build` 成功完成（shared-types → api + web 并行）
- [ ] `pnpm test` 所有测试通过
- [ ] `pnpm lint` 无 ESLint/Prettier 报错
- [ ] Docker Compose dev 模式可一键启动 PostgreSQL
- [ ] `pnpm db:migrate` 执行空迁移无报错
- [ ] `pnpm db:generate` 生成 Prisma Client 到 `src/generated/prisma`
- [ ] pre-commit hook 触发（`git commit` 时运行 lint-staged）
- [ ] commitlint 拒绝无效格式提交信息
- [ ] `packages/shared-types` 构建产生 `dist/index.js`（ESM）和 `dist/index.cjs`（CJS）
- [ ] `Zm*` 骨架组件文件已创建
- [ ] `.env.example` 文件存在于 `apps/api/` 和 `apps/web/`
- [ ] `ARCHITECTURE.md` 包含目录结构说明和常用命令速查
- [ ] `infra/ci/` 下有 GitHub Actions CI 配置
- [ ] `.gitignore` 中包含 `apps/api/src/generated/`

---

## Dev Notes Section

> **供 Dev Agent 完成后填写**

```
实现时间：
关键决定：
遇到的问题：
后续 Story 需要注意：
```

---

*Story 状态：ready-for-dev | 由 BMad Scrum Master Agent 生成于 2026-03-22*



