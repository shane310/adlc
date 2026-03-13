# Implementation Plan: 首页页面容器与路由（/）


## Summary

本实现任务旨在依据系统设计与宪章规定，在Next.js前端应用中构建网站首页（路径`/`）的页面容器与路由，完成Header、Banner、公告栏、公司简介、服务与产品展示、Footer模块的可视化布局与响应式展示。  
首页内容由后端配置数据驱动，但当前实现范围仅限前端展示；需支持Banner图片与视频展示、首次访问引导大图逻辑，并保证SEO基础信息与3秒内加载时间。  
本特性交付属于前端模块开发范畴，受“Single Source of Truth”“Explicit Contracts”“Continuous Quality”及“Observability as a First-Class Concern”等宪章条款约束。  
所有实现需满足模块化单体（Modular Monolith）架构原则，确保组件属于Frontend模块子域，符合CI质量门及文档完备要求。  
页面交互与展示逻辑的可测试性必须通过自动化E2E测试（Selenium）验证，并在CI管线中执行。  


## Constitution Check

| Gate Category | Description | Implementation Alignment |
|----------------|--------------|---------------------------|
| **Single Source of Truth** | 所有配置文件与路由声明需纳入Git版本控制；任何环境变量或展示配置文件不得脱离版本管理。 | 通过Next.js配置与`.env.example`纳入版本；前端内容数据以接口mock或JSON示例托管于`/specs/`。 |
| **Explicit Contracts** | 所有后端提供的前端接口必须在`/specs/api`下有OpenAPI定义并进行版本控制。 | 本任务不调用API；若未来接入内容API，需补充OpenAPI 3.x spec。 |
| **Continuous Quality** | Lint、测试、覆盖率≥80%、SAST/DAST扫描通过方可合并。 | CI管线执行ESLint、Jest、Selenium测试；合并前门控。 |
| **Observability as a First-Class Concern** | 页面加载与错误需可监控，可通过CloudWatch日志或等价机制观察。 | 依赖前端日志封装（例如console error上报逻辑，由全局error handler完成）。 |
| **Security by Design** | 符合HIPAA/GDPR网页安全标准，前端不得泄露敏感信息。 | 静态展示页面无需敏感数据，使用HTTPS/TLS发布。 |
| **Infrastructure as Code** | 部署配置应通过Terraform或CDK管理。 | 页面部署依附主站IaC；不单独定义资源。 |
| **Testing & Automation** | 单元测试覆盖核心逻辑；E2E覆盖首次访问逻辑与Banner展示。 | Jest + Selenium测试。 |
| **Documentation-Driven** | `/docs/adr/`中必须创建该模块新增的ADR记录。 | 创建ADR记录：`ADR-frontend-homepage.md`。 |
| **Compliance Table** | Architecture/CI/Security/Observability文档状态在发布前补全。 | 按发布流程执行。 |


## Project Structure

### Source Code (repository root)

```text
/
├─ specs/
│  ├─ api/
│  └─ schema/
├─ apps/
│  └─ frontend/
│     ├─ pages/
│     │  └─ index.tsx
│     ├─ components/
│     │  ├─ Header/
│     │  │  └─ Header.tsx
│     │  ├─ Banner/
│     │  │  ├─ Banner.tsx
│     │  │  └─ BannerMedia.tsx
│     │  ├─ NoticeBar/
│     │  │  └─ NoticeBar.tsx
│     │  ├─ CompanyIntro/
│     │  │  └─ CompanyIntro.tsx
│     │  ├─ ServicesProducts/
│     │  │  └─ ServicesProducts.tsx
│     │  ├─ Footer/
│     │  │  └─ Footer.tsx
│     │  └─ FirstVisitOverlay/
│     │     └─ FirstVisitOverlay.tsx
│     ├─ hooks/
│     │  └─ useFirstVisit.ts
│     ├─ utils/
│     │  └─ seo.ts
│     ├─ styles/
│     │  └─ homepage.module.scss
│     ├─ __tests__/
│     │  ├─ unit/
│     │  │  └─ Banner.test.tsx
│     │  └─ e2e/
│     │     └─ homepage.spec.js
│     └─ next.config.js
├─ docs/
│  ├─ adr/
│  │  └─ ADR-frontend-homepage.md
│  ├─ runbook.md
│  └─ constitution-changelog.md
├─ .github/
│  └─ workflows/
│     └─ ci.yml
└─ package.json
```

**Structure Decision**:  
依据技术宪章“Modular Monolith First”原则，采用monorepo形式，将前端应用置于`apps/frontend/`目录下，保持与NestJS后端共存的整体架构一致。  
所有页面模块按组件分目录，以增强可维护性与测试独立性。页面入口固定为`pages/index.tsx`符合Next.js约定路由。  
SEO、首次访问逻辑、E2E测试分离，以符合“Explicit Contract”“Testability”原则。  
（Assumption：技术设计中的monorepo假设已确认；若团队选择multi-repo，则路径层级应调整为独立frontend仓库。）  


## Complexity Tracking

N/A