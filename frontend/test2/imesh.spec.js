import { test, expect } from '@playwright/test';

async function setAuthUser(page) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'imesh-student-1',
        name: 'Imesh Student',
        role: 'student',
        email: 'imesh@student.eduza.test',
      })
    );
  });
}

async function mockStressHubApi(page) {
  let futureMessage = 'You can do this. Stay calm and move one step at a time.';

  await page.route('**/api/stress-hub/**', async (route) => {
    const req = route.request();
    const method = req.method();
    const path = new URL(req.url()).pathname;

    if (path.endsWith('/api/stress-hub/stress-logs') && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          stressLog: {
            _id: 'stress-log-imesh-1',
            stressScore: 4,
            stressLevel: 'MOCK',
          },
        }),
      });
      return;
    }

    if (path.endsWith('/api/stress-hub/future-self-message') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: futureMessage }),
      });
      return;
    }

    if (path.endsWith('/api/stress-hub/future-self-message') && method === 'POST') {
      const payload = req.postDataJSON?.() || {};
      futureMessage = payload.message || futureMessage;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: futureMessage }),
      });
      return;
    }

    if (path.endsWith('/api/stress-hub/calm-streak') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          streakDays: 3,
          milestone: { badge: 'Calm Builder', message: 'Great job keeping your balance.' },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });
}

test.describe('Imesh Stress Hub Pages', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthUser(page);
    await mockStressHubApi(page);
  });

  test('1. No Stress routes to blue page', async ({ page }) => {
    await page.goto('/stress-hub', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /No Stress/i }).click();

    await expect(page).toHaveURL(/\/stress-hub\/blue$/);
    await expect(page.getByText('You are calm. You are okay. This is a good place to be.')).toBeVisible();
  });

  test('2. Mild routes to green page', async ({ page }) => {
    await page.goto('/stress-hub', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Mild/i }).click();

    await expect(page).toHaveURL(/\/stress-hub\/green$/);
    await expect(page.getByText('You are in your best state right now. Use it. Grow it. Enjoy it.')).toBeVisible();
  });

  test('3. Moderate routes to yellow page', async ({ page }) => {
    await page.goto('/stress-hub', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Moderate/i }).click();

    await expect(page).toHaveURL(/\/stress-hub\/yellow$/);
    await expect(page.getByText('You are feeling a little stressed. That is okay.')).toBeVisible();
  });

  test('4. Severe routes to orange page', async ({ page }) => {
    await page.goto('/stress-hub', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /^Severe Stress feels heavy/i }).click();

    await expect(page).toHaveURL(/\/stress-hub\/orange$/);
    await expect(page.getByText('You are in an elevated stress zone.')).toBeVisible();
  });

  test('5. Worst Possible routes to red page', async ({ page }) => {
    await page.goto('/stress-hub', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Worst Possible/i }).click();

    await expect(page).toHaveURL(/\/stress-hub\/red$/);
    await expect(page.getByText('You are in a high stress condition.')).toBeVisible();
  });

  test('6. Blue page shows calm streak and modal open/close', async ({ page }) => {
    await page.goto('/stress-hub/blue', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Calm Streak')).toBeVisible();
    await expect(page.getByText(/for\s*3\s*day/i)).toBeVisible();

    await page.getByRole('heading', { name: 'Sharpen Your Mind' }).first().click();
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('button', { name: 'Close' })).not.toBeVisible();
  });

  test('7. Green page saves future-self message', async ({ page }) => {
    await page.goto('/stress-hub/green', { waitUntil: 'domcontentloaded' });

    await page
      .getByPlaceholder('Write your future-self message here...')
      .fill('Imesh note: breathe, reset, and move one step forward.');

    await page.getByRole('button', { name: 'Save Message' }).click();
    await expect(page.getByText('Saved for your future self.')).toBeVisible();
  });

  test('8. Yellow page Talk to Someone opens group chat route', async ({ page }) => {
    await page.goto('/stress-hub/yellow', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: /^Talk to Someone$/i }).click();
    await expect(page).toHaveURL(/\/group-chat$/);
  });

  test('9. Orange page breathing CTA opens underwater game page', async ({ page }) => {
    await page.goto('/stress-hub/orange', { waitUntil: 'domcontentloaded' });

    await page.getByRole('button', { name: 'Start Breathing Exercise' }).click();
    await expect(page).toHaveURL(/\/stress-hub\/orange\/games\/underwater-drift$/);
    await expect(page.getByText('Soft directional guide')).toBeVisible();
  });

  test('10. Red page shows hospital support section and links', async ({ page }) => {
    await page.goto('/stress-hub/red', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('You are in a high stress condition.')).toBeVisible();
    await expect(page.getByText('Direct Sri Lanka Hospital Links')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Map' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Official Website' }).first()).toBeVisible();
  });
});
