# ADR: Frontend Homepage Module Architecture

**Status**: Accepted  
**Date**: 2026-03-13  
**Deciders**: Frontend Team  
**Ticket**: DGFP-829

## Context

The project requires a homepage at route `/` that serves as the primary entry point for public visitors. The page must include six core modules (Header, Banner, NoticeBar, CompanyIntro, ServicesProducts, Footer), support responsive layout, a first-visit overlay mechanism, and baseline SEO.

Key constraints:
- Next.js is the chosen frontend framework (convention-based routing).
- The project follows a Modular Monolith architecture with the frontend under `apps/frontend/`.
- Content is driven by configurable data; backend configuration is out of scope.
- Page load time must be under 3 seconds.
- Test coverage must be ≥80%.

## Decision

### Component Architecture
Each homepage module is implemented as an independent React component under `components/<ModuleName>/`. This ensures isolated testability and clear ownership boundaries.

### Routing
We use Next.js file-based routing via `pages/index.tsx`. No custom route configuration is needed for the homepage.

### First-Visit Overlay
The first-visit detection uses `localStorage` (browser-scoped, not account-scoped per project assumptions). The `useFirstVisit` custom hook encapsulates the read/write logic and is SSR-safe (guards against `window` being `undefined`).

### Banner Carousel
The Banner component supports both image and video media types via a `BannerMedia` sub-component. Auto-rotation is interval-based with configurable timing. Videos autoplay muted per browser policies.

### SEO Strategy
SEO meta information (title, description, Open Graph) is generated via a utility function `generateSeoMeta()` and injected using Next.js `<Head>`. SSR ensures meta tags are present in the initial HTML response.

### Styling
CSS Modules with SCSS are used for scoped, maintainable styles. Responsive breakpoints use a mobile-first approach with a 768px breakpoint.

### Testing Strategy
- **Unit tests**: Jest + React Testing Library covering all components, hooks, and utilities. Coverage ≥80%.
- **E2E tests**: Selenium-based tests verifying page load, module rendering, first-visit overlay flow, and banner display.

## Consequences

### Positive
- Clear component boundaries make individual modules independently testable and replaceable.
- `localStorage`-based first-visit is simple, requires no backend, and works offline.
- SSR-rendered SEO meta ensures search engine visibility from day one.
- CSS Modules prevent style leakage between components.

### Negative
- `localStorage` first-visit state is device/browser-scoped; clearing site data resets it.
- Static mock data is used for content; future API integration will require refactoring data sources.
- No image optimization (Next.js `<Image>`) is used for Banner yet due to external image source uncertainty.

### Risks
- Performance budget (3s load) depends on asset sizes and hosting; needs Lighthouse validation in staging.
- E2E tests require a running application instance and Selenium driver in CI.
