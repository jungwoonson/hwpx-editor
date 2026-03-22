import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, 'screenshots');

test.describe('HWPX 뷰어 시각 비교', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
  });

  test('sample01 첫 페이지 렌더링', async ({ page }) => {
    await page.goto('/?sample=sample01');

    // 페이지 렌더링 완료 대기
    const firstPage = page.locator('[data-testid="page-0"]');
    await expect(firstPage).toBeVisible({ timeout: 15000 });

    // 폰트 로딩 대기
    await page.waitForTimeout(1000);

    // 첫 페이지 스크린샷 촬영
    const screenshot = await firstPage.screenshot();
    fs.writeFileSync(path.join(screenshotDir, 'sample01_p0001_current.png'), screenshot);
  });

  test('sample01 전체 페이지 스크린샷', async ({ page }) => {
    await page.goto('/?sample=sample01');

    const firstPage = page.locator('[data-testid="page-0"]');
    await expect(firstPage).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);

    let pageIdx = 0;
    while (true) {
      const pageLocator = page.locator(`[data-testid="page-${pageIdx}"]`);
      const count = await pageLocator.count();
      if (count === 0) break;

      await pageLocator.scrollIntoViewIfNeeded();
      const screenshot = await pageLocator.screenshot();
      const padded = String(pageIdx + 1).padStart(4, '0');
      fs.writeFileSync(path.join(screenshotDir, `sample01_p${padded}_current.png`), screenshot);
      pageIdx++;
    }

    expect(pageIdx).toBeGreaterThan(0);
  });
});
