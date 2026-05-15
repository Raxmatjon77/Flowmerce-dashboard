// NOTE: Requires backend running on localhost:3000 and Vite dev server on 5174
// Start backend:    cd Flowmerce && npm run start:dev
// Start dashboard:  cd Flowmerce-dashboard && npm run dev
// Run tests:        cd Flowmerce-dashboard && npx playwright test

import { test, expect, Page } from '@playwright/test';

const ADMIN_USER_ID = 'admin';
const ADMIN_PASSWORD = 'admin123';

// ---------------------------------------------------------------------------
// Helper: log in as admin and assert redirect to overview "/"
// ---------------------------------------------------------------------------
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  // Form fields from Login.tsx: id="userId", id="password"
  await page.locator('#userId').fill(ADMIN_USER_ID);
  await page.locator('#password').fill(ADMIN_PASSWORD);
  // Submit button text from Login.tsx: "Sign in"
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/', { timeout: 15_000 });
}

// ---------------------------------------------------------------------------
test.describe('Admin dashboard flow', () => {
  // Log in once before every test — each test gets a fresh page (Playwright default)
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('overview page shows stat summary cards', async ({ page }) => {
    // The overview is the "/" route — already on it after login
    // DashboardSummaryDto fields: totalOrders, totalRevenue — rendered as visible text
    await expect(page.getByText(/orders/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/revenue|amount/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('/orders page loads the order table', async ({ page }) => {
    await page.goto('/orders');
    await expect(
      page.locator('table, [data-testid="orders-list"]').first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('/inventory page loads the inventory table', async ({ page }) => {
    await page.goto('/inventory');
    await expect(
      page.locator('table, [data-testid="inventory-list"]').first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  test('/payments page loads', async ({ page }) => {
    await page.goto('/payments');
    await expect(
      page.locator('table, [data-testid="payments-list"], h1, h2').first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('/shipments page loads', async ({ page }) => {
    await page.goto('/shipments');
    await expect(
      page.locator('table, [data-testid="shipments-list"], h1, h2').first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('/health page loads service health status', async ({ page }) => {
    await page.goto('/health');
    await expect(
      page.getByText(/health|operational|service/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('wrong admin password shows error and stays on /login', async ({ page }) => {
    // Override the beforeEach login by going to login fresh
    await page.goto('/login');
    await page.locator('#userId').fill(ADMIN_USER_ID);
    await page.locator('#password').fill('wrong-password-xyz');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/login failed|invalid credentials|incorrect/i)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page).toHaveURL('/login');
  });

  test('unauthenticated request to protected route redirects to /login', async ({
    browser,
  }) => {
    // Open a fresh context with no stored token
    const freshContext = await browser.newContext();
    const freshPage = await freshContext.newPage();

    await freshPage.goto('http://localhost:5174/orders');
    await expect(freshPage).toHaveURL(/\/login/, { timeout: 10_000 });

    await freshContext.close();
  });
});
