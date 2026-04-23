/**
 * E2E tests for homepage (/) — designed for Selenium/WebDriver execution.
 * These tests verify the homepage loads correctly, all modules render,
 * and the first-visit overlay logic works as expected.
 *
 * Prerequisites:
 *   - Application running at BASE_URL (default: http://localhost:3000)
 *   - Selenium WebDriver configured in CI environment
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

describe('Homepage E2E', () => {
  describe('Page Load & Module Rendering', () => {
    it('should load the homepage at /', async () => {
      // Navigate to homepage
      await driver.get(BASE_URL + '/');
      const title = await driver.getTitle();
      expect(title).toContain('公司官网');
    });

    it('should render the Header component', async () => {
      await driver.get(BASE_URL + '/');
      const header = await driver.findElement({ css: 'header' });
      expect(await header.isDisplayed()).toBe(true);
    });

    it('should render the Banner component', async () => {
      await driver.get(BASE_URL + '/');
      const banner = await driver.findElement({ css: '[data-testid="banner"]' });
      expect(await banner.isDisplayed()).toBe(true);
    });

    it('should render the NoticeBar component', async () => {
      await driver.get(BASE_URL + '/');
      const noticeBar = await driver.findElement({ css: '[data-testid="notice-bar"]' });
      expect(await noticeBar.isDisplayed()).toBe(true);
    });

    it('should render the CompanyIntro section', async () => {
      await driver.get(BASE_URL + '/');
      const intro = await driver.findElement({ css: '[data-testid="company-intro"]' });
      expect(await intro.isDisplayed()).toBe(true);
    });

    it('should render the ServicesProducts section', async () => {
      await driver.get(BASE_URL + '/');
      const services = await driver.findElement({ css: '[data-testid="services-products"]' });
      expect(await services.isDisplayed()).toBe(true);
    });

    it('should render the Footer component', async () => {
      await driver.get(BASE_URL + '/');
      const footer = await driver.findElement({ css: 'footer' });
      expect(await footer.isDisplayed()).toBe(true);
    });

    it('should include SEO meta tags', async () => {
      await driver.get(BASE_URL + '/');
      const metaDesc = await driver.findElement({ css: 'meta[name="description"]' });
      const content = await metaDesc.getAttribute('content');
      expect(content).toBeTruthy();
    });
  });

  describe('First Visit Overlay Logic', () => {
    it('should show the first-visit overlay on first visit', async () => {
      // Clear localStorage to simulate first visit
      await driver.get(BASE_URL + '/');
      await driver.executeScript('localStorage.clear()');
      await driver.get(BASE_URL + '/');

      const overlay = await driver.findElement({ css: '[data-testid="first-visit-overlay"]' });
      expect(await overlay.isDisplayed()).toBe(true);
    });

    it('should close the overlay when enter button is clicked', async () => {
      await driver.get(BASE_URL + '/');
      await driver.executeScript('localStorage.clear()');
      await driver.get(BASE_URL + '/');

      const enterButton = await driver.findElement({ css: '[data-testid="first-visit-overlay"] button' });
      await enterButton.click();

      const overlays = await driver.findElements({ css: '[data-testid="first-visit-overlay"]' });
      expect(overlays.length).toBe(0);
    });

    it('should not show the overlay on subsequent visits', async () => {
      await driver.get(BASE_URL + '/');
      await driver.executeScript("localStorage.setItem('visited', 'true')");
      await driver.get(BASE_URL + '/');

      const overlays = await driver.findElements({ css: '[data-testid="first-visit-overlay"]' });
      expect(overlays.length).toBe(0);
    });
  });

  describe('Banner Media Display', () => {
    it('should display banner media (image or video)', async () => {
      await driver.get(BASE_URL + '/');
      const banner = await driver.findElement({ css: '[data-testid="banner"]' });
      const mediaElements = await banner.findElements({ css: 'img, video' });
      expect(mediaElements.length).toBeGreaterThan(0);
    });

    it('should display navigation dots for banner carousel', async () => {
      await driver.get(BASE_URL + '/');
      const dots = await driver.findElements({ css: '[data-testid="banner-dot"]' });
      expect(dots.length).toBeGreaterThan(0);
    });
  });
});
