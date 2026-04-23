/**
 * E2E tests for homepage (/) — designed for Selenium/WebDriver execution.
 * These tests verify the homepage loads correctly, all modules render,
 * and the first-visit overlay logic works as expected.
 *
 * Prerequisites:
 *   - Application running at BASE_URL (default: http://localhost:3000)
 *   - Selenium WebDriver configured in CI environment
 */

const { until } = require('selenium-webdriver');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/** Skip first-visit overlay and wait for React to paint main content (avoids stale elements). */
async function loadHomeVisited() {
  await driver.get(BASE_URL + '/');
  await driver.executeScript("localStorage.setItem('visited', 'true')");
  await driver.get(BASE_URL + '/');
  await driver.wait(
    until.elementLocated({ css: '[data-testid="banner"]' }),
    20000
  );
}

/** Visibility check in one round-trip to avoid stale element references after hydration. */
async function isElementUsable(selector) {
  return driver.executeScript(
    `
    const sel = arguments[0];
    const el = document.querySelector(sel);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      Number(style.opacity) > 0 &&
      r.width > 0 &&
      r.height > 0
    );
    `,
    selector
  );
}

async function waitForUsable(selector, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isElementUsable(selector)) return;
    await driver.sleep(100);
  }
  throw new Error(`Timeout waiting for usable element: ${selector}`);
}

describe('Homepage E2E', () => {
  describe('Page Load & Module Rendering', () => {
    it('should load the homepage at /', async () => {
      await driver.get(BASE_URL + '/');
      const title = await driver.getTitle();
      expect(title).toContain('公司官网');
    });

    it('should render the Header component', async () => {
      await loadHomeVisited();
      await waitForUsable('header');
    });

    it('should render the Banner component', async () => {
      await loadHomeVisited();
      await waitForUsable('[data-testid="banner"]');
    });

    it('should render the NoticeBar component', async () => {
      await loadHomeVisited();
      await waitForUsable('[data-testid="notice-bar"]');
    });

    it('should render the CompanyIntro section', async () => {
      await loadHomeVisited();
      await waitForUsable('[data-testid="company-intro"]');
    });

    it('should render the ServicesProducts section', async () => {
      await loadHomeVisited();
      await waitForUsable('[data-testid="services-products"]');
    });

    it('should render the Footer component', async () => {
      await loadHomeVisited();
      await driver.executeScript(
        'document.querySelector("footer")?.scrollIntoView({ block: "end" });'
      );
      await waitForUsable('footer');
    });

    it('should include SEO meta tags', async () => {
      await loadHomeVisited();
      const start = Date.now();
      let content = '';
      while (Date.now() - start < 20000) {
        content = await driver.executeScript(`
          const m = document.querySelector('meta[name="description"]');
          return m ? m.getAttribute('content') : '';
        `);
        if (content) break;
        await driver.sleep(100);
      }
      expect(content).toBeTruthy();
    });
  });

  describe('First Visit Overlay Logic', () => {
    it('should show the first-visit overlay on first visit', async () => {
      await driver.get(BASE_URL + '/');
      await driver.executeScript('localStorage.clear()');
      await driver.get(BASE_URL + '/');

      const overlay = await driver.findElement({
        css: '[data-testid="first-visit-overlay"]',
      });
      expect(await overlay.isDisplayed()).toBe(true);
    });

    it('should close the overlay when enter button is clicked', async () => {
      await driver.get(BASE_URL + '/');
      await driver.executeScript('localStorage.clear()');
      await driver.get(BASE_URL + '/');

      const enterButton = await driver.findElement({
        css: '[data-testid="first-visit-overlay"] button',
      });
      await driver.executeScript('arguments[0].click()', enterButton);

      const overlays = await driver.findElements({
        css: '[data-testid="first-visit-overlay"]',
      });
      expect(overlays.length).toBe(0);
    });

    it('should not show the overlay on subsequent visits', async () => {
      await driver.get(BASE_URL + '/');
      await driver.executeScript("localStorage.setItem('visited', 'true')");
      await driver.get(BASE_URL + '/');

      const overlays = await driver.findElements({
        css: '[data-testid="first-visit-overlay"]',
      });
      expect(overlays.length).toBe(0);
    });
  });

  describe('Banner Media Display', () => {
    it('should display banner media (image or video)', async () => {
      await loadHomeVisited();
      const count = await driver.executeScript(`
        const root = document.querySelector('[data-testid="banner"]');
        if (!root) return 0;
        return root.querySelectorAll('img, video').length;
      `);
      expect(count).toBeGreaterThan(0);
    });

    it('should display navigation dots for banner carousel', async () => {
      await loadHomeVisited();
      const dots = await driver.findElements({ css: '[data-testid="banner-dot"]' });
      expect(dots.length).toBeGreaterThan(0);
    });
  });
});
