import { test, expect } from '@playwright/test';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function setAuthUser(page, user) {
  await page.addInitScript((authUser) => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(authUser));
  }, user);
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
      body: JSON.stringify({}),
    });
  });
}

test.describe('Imesh Stress Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthUser(page, {
      id: 'imesh-student-1',
      name: 'Imesh Student',
      role: 'student',
      email: 'imesh@student.eduza.test',
    });
    await mockStressHubApi(page);
  });

  test('input levels navigate to matching output pages', async ({ page }) => {
    const scenarios = [
      { label: 'No Stress', path: '/stress-hub/blue', heading: 'You are calm. You are okay.' },
      { label: 'Mild', path: '/stress-hub/green', heading: 'You are in your best state right now.' },
      { label: 'Moderate', path: '/stress-hub/yellow', heading: 'You are feeling a little stressed.' },
      { label: 'Severe', path: '/stress-hub/orange', heading: 'You are in an elevated stress zone.' },
      { label: 'Worst Possible', path: '/stress-hub/red', heading: 'You are in a high stress condition.' },
    ];

    for (const item of scenarios) {
      await page.goto('/stress-hub');
      await page.getByRole('button', { name: new RegExp(`^${escapeRegex(item.label)}$`, 'i') }).click();

      await expect(page).toHaveURL(new RegExp(`${escapeRegex(item.path)}$`));
      await expect(page.getByRole('heading', { level: 1 })).toContainText(item.heading);
    }
  });

  test('user input saves future-self message on green page', async ({ page }) => {
    await page.goto('/stress-hub');
    await page.getByRole('button', { name: /^Mild$/i }).click();

    await page
      .getByPlaceholder('Write your future-self message here...')
      .fill('Imesh note: breathe slowly, focus, and complete one task now.');

    await page.getByRole('button', { name: 'Save Message' }).click();
    await expect(page.getByText('Saved for your future self.')).toBeVisible();
  });
});
