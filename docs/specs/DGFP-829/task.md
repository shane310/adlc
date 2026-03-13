## 1. Implementation Roadmap


* [ ] **Task 1:** 创建首页页面容器与路由配置 — *Scope: `apps/frontend/pages/index.tsx`*  
* [ ] **Task 2:** 实现 Header 组件结构与样式 — *Scope: `apps/frontend/components/Header/Header.tsx`*  
* [ ] **Task 3:** 实现 Banner 组件（图片/视频展示逻辑） — *Scope: `apps/frontend/components/Banner/Banner.tsx`, `BannerMedia.tsx`*  
* [ ] **Task 4:** 实现公告栏组件（NoticeBar） — *Scope: `apps/frontend/components/NoticeBar/NoticeBar.tsx`*  
* [ ] **Task 5:** 实现公司简介模块（CompanyIntro） — *Scope: `apps/frontend/components/CompanyIntro/CompanyIntro.tsx`*  
* [ ] **Task 6:** 实现服务与产品展示模块（ServicesProducts） — *Scope: `apps/frontend/components/ServicesProducts/ServicesProducts.tsx`*  
* [ ] **Task 7:** 实现 Footer 模块 — *Scope: `apps/frontend/components/Footer/Footer.tsx`*  
* [ ] **Task 8:** 实现首次访问引导大图逻辑 — *Scope: `apps/frontend/components/FirstVisitOverlay/FirstVisitOverlay.tsx`, `hooks/useFirstVisit.ts`*  
* [ ] **Task 9:** 实现 SEO 工具函数并集成页面基础信息 — *Scope: `apps/frontend/utils/seo.ts`, `pages/index.tsx`*  
* [ ] **Task 10:** 实现首页样式与响应式布局 — *Scope: `apps/frontend/styles/homepage.module.scss`*  
* [ ] **Task 11:** 编写单元测试（Banner、首次访问逻辑） — *Scope: `apps/frontend/__tests__/unit/`*  
* [ ] **Task 12:** 编写 E2E 测试（首页加载与首次访问逻辑） — *Scope: `apps/frontend/__tests__/e2e/homepage.spec.js`*  
* [ ] **Task 13:** 创建 ADR 文档记录模块决策 — *Scope: `docs/adr/ADR-frontend-homepage.md`*  
* [ ] **Task 14:** 更新 CI 流程，确保 Lint、测试、覆盖率执行 — *Scope: `.github/workflows/ci.yml`*  


---

## 2. Detailed Execution Guide

### Task 1: 创建首页页面容器与路由配置
* **Target Context:** `apps/frontend/pages/index.tsx`
* **Implementation Logic:**  
  - 使用 Next.js 默认路由机制，导出主页组件。  
  - 按顺序引入 Header、Banner、NoticeBar、CompanyIntro、ServicesProducts、Footer、FirstVisitOverlay。  
  - 确保页面结构语义化（使用 `<main>`、`<section>`）。  
  - 加载时通过 `useFirstVisit` hook 判断是否展示首次访问引导层。  
* **Notes:**  
  - 页面加载时间需控制在 3 秒以内。  
  - 保证 SSR SEO 元信息渲染正确。  

---

### Task 2: 实现 Header 组件结构与样式
* **Target Context:** `apps/frontend/components/Header/Header.tsx`
* **Implementation Logic:**  
  - 包含 Logo、导航菜单、语言切换（如有）。  
  - 响应式布局：移动端折叠菜单，PC端水平导航。  
* **Notes:**  
  - 导航项暂为静态配置，可后续由配置文件驱动。  
  - 确保 Header 固定在页面顶部。  

---

### Task 3: 实现 Banner 组件（图片/视频展示逻辑）
* **Target Context:** `apps/frontend/components/Banner/Banner.tsx`, `BannerMedia.tsx`
* **Implementation Logic:**  
  - 支持图片与视频两种展示方式，通过 props 或配置区分。  
  - `BannerMedia` 负责渲染 `<img>` 或 `<video>` 元素。  
  - 支持自动轮播与手动切换。  
* **Notes:**  
  - 图片延迟加载（lazy load），视频自动播放需静音。  
  - 确保 Banner 高度自适应屏幕比例。  
* **Pseudo Code / Key Logic:**
  ```
  const Banner = ({ items }) => (
     render current item via <BannerMedia type=item.type src=item.src />
  )
  ```

---

### Task 4: 实现公告栏组件（NoticeBar）
* **Target Context:** `apps/frontend/components/NoticeBar/NoticeBar.tsx`
* **Implementation Logic:**  
  - 展示公告文字，支持滚动或淡入淡出切换。  
  - 内容来源暂为本地 JSON mock。  
* **Notes:**  
  - 可通过 props 控制滚动速度与展示样式。  

---

### Task 5: 实现公司简介模块（CompanyIntro）
* **Target Context:** `apps/frontend/components/CompanyIntro/CompanyIntro.tsx`
* **Implementation Logic:**  
  - 展示公司简介文字、配图。  
  - 布局采用两列（文字 + 图片）结构，移动端纵向排列。  

---

### Task 6: 实现服务与产品展示模块（ServicesProducts）
* **Target Context:** `apps/frontend/components/ServicesProducts/ServicesProducts.tsx`
* **Implementation Logic:**  
  - 展示多项服务/产品卡片，含标题、描述、图标。  
  - 数据由本地 mock JSON 提供。  
  - 响应式布局：桌面三列，移动端单列。  

---

### Task 7: 实现 Footer 模块
* **Target Context:** `apps/frontend/components/Footer/Footer.tsx`
* **Implementation Logic:**  
  - 包含公司版权信息、社交媒体链接、备案号等。  
  - 页脚固定在页面底部，背景颜色与 Header 匹配。  

---

### Task 8: 实现首次访问引导大图逻辑
* **Target Context:** `apps/frontend/components/FirstVisitOverlay/FirstVisitOverlay.tsx`, `hooks/useFirstVisit.ts`
* **Implementation Logic:**  
  - `useFirstVisit`：检测浏览器 localStorage 是否存在标记。  
  - 若首次访问，则显示全屏遮罩大图，点击关闭后写入标记。  
* **Notes:**  
  - 保证该逻辑在 SSR 环境下安全执行（仅客户端运行）。  
* **Pseudo Code / Key Logic:**
  ```
  const useFirstVisit = () => {
     if (typeof window === 'undefined') return false;
     return !localStorage.getItem('visited');
  }
  ```

---

### Task 9: 实现 SEO 工具函数并集成页面基础信息
* **Target Context:** `apps/frontend/utils/seo.ts`, `pages/index.tsx`
* **Implementation Logic:**  
  - 封装函数 `applySeoMeta(title, description)`，在页面头部注入 `<meta>` 标签。  
  - 在首页调用以设置标题与描述。  
* **Notes:**  
  - 确保 SSR 输出包含 SEO meta 信息。  

---

### Task 10: 实现首页样式与响应式布局
* **Target Context:** `apps/frontend/styles/homepage.module.scss`
* **Implementation Logic:**  
  - 定义全局布局、间距、色彩变量。  
  - 使用 CSS Grid/Flex 实现响应式布局。  
  - 统一字体与行距，保证视觉一致性。  

---

### Task 11: 编写单元测试（Banner、首次访问逻辑）
* **Target Context:** `apps/frontend/__tests__/unit/`
* **Implementation Logic:**  
  - `Banner.test.tsx`：验证轮播逻辑是否正确切换、媒体类型渲染正确。  
  - `useFirstVisit.test.tsx`：测试首次访问标记的读写逻辑。  
* **Notes:**  
  - 使用 Jest + React Testing Library。  
  - 覆盖率 ≥80%。  

---

### Task 12: 编写 E2E 测试（首页加载与首次访问逻辑）
* **Target Context:** `apps/frontend/__tests__/e2e/homepage.spec.js`
* **Implementation Logic:**  
  - 使用 Selenium 模拟浏览器首次访问。  
  - 验证引导大图是否显示与关闭逻辑。  
  - 检查 Header、Footer、Banner 是否渲染。  
* **Notes:**  
  - 测试在 CI 中自动执行。  

---

### Task 13: 创建 ADR 文档记录模块决策
* **Target Context:** `docs/adr/ADR-frontend-homepage.md`
* **Implementation Logic:**  
  - 记录首页模块的设计决策、组件分层方案、测试策略。  
  - 按 ADR 模板撰写（Context, Decision, Consequences）。  

---

### Task 14: 更新 CI 流程，确保 Lint、测试、覆盖率执行
* **Target Context:** `.github/workflows/ci.yml`
* **Implementation Logic:**  
  - 添加执行步骤：`npm run lint`, `npm run test`, `npm run test:e2e`。  
  - 设置覆盖率门槛 ≥80%。  
  - 所有步骤通过后方可 merge。  

---

## 3. Definition of Done

| 验证维度 | 验证方法 |
|-----------|-----------|
| **功能正确性** | 本地运行 `npm run dev`，访问 `/` 确认页面完整展示；首次访问引导逻辑生效。 |
| **单元测试** | 执行 `npm run test`，所有测试通过且覆盖率 ≥80%。 |
| **E2E 测试** | 执行 `npm run test:e2e`，验证首访逻辑与 Banner 展示。 |
| **SEO 检查** | 查看页面源码，确认 meta title/description 正确输出。 |
| **性能要求** | Lighthouse 分析首页加载时间 <3s。 |
| **CI 合规性** | `.github/workflows/ci.yml` 全部步骤通过。 |
| **文档完整性** | `docs/adr/ADR-frontend-homepage.md` 已提交且符合模板格式。 |