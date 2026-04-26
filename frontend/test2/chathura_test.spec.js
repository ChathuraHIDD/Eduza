import { test, expect } from '@playwright/test';
import { Buffer } from 'node:buffer';

const BASE_URL = 'http://localhost:5173';

function datePlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

async function mockScheduleApis(page) {
  await page.route('**/api/modules**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: 'mod-1',
          code: 'CS401',
          name: 'Advanced Web Development',
          status: 'active',
          approvalStatus: 'approved',
        },
      ]),
    });
  });

  await page.route('**/api/ml/task-duration/predict', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ predicted_minutes: 240 }),
    });
  });
}

async function setAuthState(page, user) {
  await page.addInitScript((authUser) => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(authUser));
  }, user);
}

async function mockLecturerModuleApis(page) {
  let createdModules = [];

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'lec-1',
          name: 'Chathura Lecturer',
          email: 'chathura@eduza.test',
          role: 'lecturer',
          department: 'Computer Science & Engineering',
        },
      }),
    });
  });

  await page.route('**/api/modules**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (path.endsWith('/api/modules/upload-week-pdf') && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          pdfFileName: 'week1.pdf',
          pdfFileUrl: 'https://example.test/week1.pdf',
        }),
      });
      return;
    }

    if (path.endsWith('/api/modules') && method === 'POST') {
      const nextModule = {
        _id: `module-${createdModules.length + 1}`,
        code: 'CH401',
        name: 'Chathura Testing Module',
        approvalStatus: 'pending',
        status: 'pending',
        department: 'Computer Science & Engineering',
        credits: 3,
        semester: 'Jan-Jun Semester',
        lecturerId: 'lec-1',
        createdAt: new Date().toISOString(),
      };
      createdModules = [nextModule, ...createdModules];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(nextModule),
      });
      return;
    }

    if (path.endsWith('/api/modules') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(createdModules),
      });
      return;
    }

    await route.continue();
  });
}

async function mockNotificationsApi(page) {
  let notifications = [
    {
      _id: 'n1',
      title: 'Chathura reminder',
      message: 'Assignment deadline is tomorrow',
      read: false,
    },
    {
      _id: 'n2',
      title: 'Module update',
      message: 'Your module submission is pending review',
      read: true,
    },
  ];

  await page.route('**/api/notifications**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (path.endsWith('/api/notifications') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(notifications),
      });
      return;
    }

    if (path.endsWith('/api/notifications') && method === 'DELETE') {
      notifications = [];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
      return;
    }

    const readMatch = path.match(/\/api\/notifications\/([^/]+)\/read$/);
    if (readMatch && method === 'PATCH') {
      const id = readMatch[1];
      notifications = notifications.map((item) =>
        String(item._id) === String(id) ? { ...item, read: true } : item
      );
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
      return;
    }

    const deleteMatch = path.match(/\/api\/notifications\/([^/]+)$/);
    if (deleteMatch && method === 'DELETE') {
      const id = deleteMatch[1];
      notifications = notifications.filter((item) => String(item._id) !== String(id));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe('Chathura Smart Schedule Flows', () => {
  test.beforeEach(async ({ page }) => {
    await mockScheduleApis(page);
  });

  test('Chathura - Assignment plan flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/smart-schedule`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Assignment/i }).first().click();

    await page.locator('select').first().selectOption('mod-1');
    await page.locator('input[type="date"]').first().fill(datePlus(10));
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByRole('button', { name: /Morning Person/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByRole('button', { name: /^A$/ }).first().click();
    await page.getByRole('button', { name: /Generate Schedule/i }).click();

    await expect(page.getByRole('heading', { name: /Your Assignment Schedule/i })).toBeVisible();
  });

  test('Chathura - Mid exam plan flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/smart-schedule`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Semester Mid Exam/i }).first().click();

    await page.locator('input[placeholder="Module / Subject name"]').first().fill('Data Structures');
    await page.locator('input[type="date"]').first().fill(datePlus(14));
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByRole('button', { name: /Morning Person/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByRole('button', { name: /^A$/ }).first().click();
    await page.getByRole('button', { name: /Generate Schedule/i }).click();

    await expect(page.getByRole('heading', { name: /Mid Exam Study Plan/i })).toBeVisible();
  });

  test('Chathura - Final exam plan flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/smart-schedule`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Semester Final Exam/i }).first().click();

    await page.locator('input[placeholder="Module / Subject name"]').first().fill('Operating Systems');
    await page.locator('input[type="date"]').first().fill(datePlus(21));
    await page.getByRole('button', { name: /Continue/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByRole('button', { name: /Morning Person/i }).click();
    await page.getByRole('button', { name: /Continue/i }).click();

    await page.getByRole('button', { name: /^A$/ }).first().click();
    await page.getByRole('button', { name: /Generate Schedule/i }).click();

    await expect(page.getByRole('heading', { name: /Final Exam Study Plan/i })).toBeVisible();
  });

  test('Chathura - Whole semester plan flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/smart-schedule`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Whole Semester/i }).first().click();

    const semesterDates = page.locator('input[type="date"]');
    await semesterDates.nth(0).fill(datePlus(2));
    await semesterDates.nth(1).fill(datePlus(90));
    await page.getByRole('button', { name: /Next/i }).click();

    const moduleNameInputs = page.locator('input[placeholder="e.g. Data Structures & Algorithms"]');
    await moduleNameInputs.nth(0).fill('Chathura Module 1');
    await moduleNameInputs.nth(1).fill('Chathura Module 2');
    await moduleNameInputs.nth(2).fill('Chathura Module 3');
    await page.getByRole('button', { name: /Next/i }).click();

    await page.getByRole('button', { name: /Morning/i }).first().click();
    await page.getByRole('button', { name: /Next/i }).click();

    await page.getByRole('button', { name: /^A$/ }).first().click();
    await page.getByRole('button', { name: /Generate Plan/i }).click();

    await expect(page.getByRole('heading', { name: /Whole Semester Study Plan/i })).toBeVisible();
  });

  test('Chathura - Other exam plan flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/smart-schedule`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Other Exam/i }).first().click();

    await page.getByRole('button', { name: /IELTS/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();

    const paperDateInputs = page.locator('input[type="date"]');
    const dateCount = await paperDateInputs.count();
    for (let i = 0; i < dateCount; i += 1) {
      await paperDateInputs.nth(i).fill(datePlus(20 + i));
    }
    await page.getByRole('button', { name: /Next/i }).click();

    await page.getByRole('button', { name: /Morning Person/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();

    await page.getByRole('button', { name: /^A$/ }).first().click();
    await page.getByRole('button', { name: /Generate Plan/i }).click();

    await expect(page.getByRole('heading', { name: /Other Exam Study Plan/i })).toBeVisible();
  });

  test('Chathura - Other activity plan flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/smart-schedule`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Other Activity/i }).first().click();

    await page.getByRole('button', { name: /Learn to Code/i }).click();
    await page.getByRole('button', { name: /Next/i }).click();

    await page.locator('input[type="date"]').first().fill(datePlus(60));
    await page.getByRole('button', { name: /Next/i }).click();

    await page.getByRole('button', { name: /Morning/i }).first().click();
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByRole('button', { name: /Generate Plan/i }).click();

    await expect(page.getByText(/Personal Goal Plan/i)).toBeVisible();
  });
});

test('Chathura - Lecturer create module with PDF upload', async ({ page }) => {
  await setAuthState(page, {
    id: 'lec-1',
    name: 'Chathura Lecturer',
    email: 'chathura@eduza.test',
    role: 'lecturer',
    department: 'Computer Science & Engineering',
  });
  await mockLecturerModuleApis(page);

  await page.goto(`${BASE_URL}/lecture-profile`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Create Module' }).click();

  await page.locator('input[placeholder="e.g. CS401"]').fill('CH401');
  await page.locator('input[placeholder="e.g. Advanced Web Development"]').fill('Chathura Testing Module');
  await page.locator('input[placeholder="e.g. 2026/2027"]').fill('2026/2027');
  await page.locator('input[placeholder="Week 1 topic"]').fill('Introduction to QA');
  await page.locator('textarea[placeholder="Instructions for week 1 lecture..."]').fill('Read chapter one and finish practical exercise one.');

  const departmentField = page.locator('input[placeholder="e.g. Computer Science & Engineering"]');
  if ((await departmentField.inputValue()).trim() === '') {
    await departmentField.fill('Computer Science & Engineering');
  }

  await page.locator('input[type="file"][accept="application/pdf"]').first().setInputFiles({
    name: 'week1.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF'),
  });

  await expect(page.getByText(/Selected: week1.pdf/i)).toBeVisible();
  await page.getByRole('button', { name: /Submit Module for Approval/i }).click();
  await expect(page.getByText(/Module submitted successfully!/i)).toBeVisible();
});

test('Chathura - Notification panel actions', async ({ page }) => {
  await setAuthState(page, {
    id: 'stu-1',
    name: 'Chathura Student',
    email: 'chathura.student@eduza.test',
    role: 'student',
  });
  await mockNotificationsApi(page);

  await page.goto(`${BASE_URL}/smart-schedule`, { waitUntil: 'domcontentloaded' });

  const bellButton = page.locator('header button:has(svg path[d^="M18 8A6"])');
  await bellButton.click();

  await expect(page.getByText('Notifications')).toBeVisible();
  await expect(page.getByText('Chathura reminder')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await expect(page.getByText('Chathura reminder')).not.toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear all' }).click();
  await expect(page.getByText('No notifications yet.')).toBeVisible();
});
