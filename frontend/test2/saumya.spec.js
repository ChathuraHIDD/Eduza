import { test, expect } from '@playwright/test';
import { Buffer } from 'node:buffer';

async function setAuthUser(page) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'saumya-student-1',
        _id: 'saumya-student-1',
        name: 'Saumya Student',
        email: 'saumya@student.eduza.test',
        role: 'student',
        year: '3rd Year',
        semester: 'Semester 1',
      })
    );
  });
}

async function mockSaumyaApis(page) {
  const kuppiSessions = [
    {
      _id: 'k-1',
      title: 'SE Group Kuppi',
      timeRange: '10:00 AM - 11:00 AM',
      day: 'Tuesday',
      date: 18,
      month: 'April',
      yearNumber: 2026,
      subject: 'Software Engineering',
      year: '3rd Year',
      semester: 'Semester 1',
      sessionType: 'today',
      category: 'Revision',
      conductorName: 'Kasuni',
      location: 'Online',
    },
    {
      _id: 'k-2',
      title: 'DBMS Discussion',
      timeRange: '2:00 PM - 3:00 PM',
      day: 'Friday',
      date: 22,
      month: 'April',
      yearNumber: 2026,
      subject: 'Database',
      year: '3rd Year',
      semester: 'Semester 1',
      sessionType: 'upcoming',
      category: 'Theory',
      conductorName: 'Raveen',
      location: 'Lab 2',
    },
  ];

  const softwareList = [
    {
      _id: 'soft-1',
      title: 'VS Code',
      softwareName: 'Visual Studio Code',
      size: '350 MB',
      type: 'free',
      category: 'development',
      windowsLink: 'https://example.test/vscode-win',
      macLink: 'https://example.test/vscode-mac',
      about: 'Code editor for modern development workflows.',
      version: '1.0.0',
      createdAt: '2026-04-01T10:00:00.000Z',
    },
    {
      _id: 'soft-2',
      title: 'MySQL Workbench',
      softwareName: 'MySQL Workbench',
      size: '120 MB',
      type: 'open-source',
      category: 'database',
      windowsLink: 'https://example.test/mysql-win',
      macLink: 'https://example.test/mysql-mac',
      about: 'Database modeling and SQL management tool.',
      version: '8.0',
      createdAt: '2026-04-02T10:00:00.000Z',
    },
  ];

  const groups = [
    {
      _id: 'g-1',
      name: 'SE 3rd Year Group',
      members: [
        { _id: 'saumya-student-1', name: 'Saumya Student' },
        { _id: 'u-2', name: 'Nethmi' },
        { _id: 'u-3', name: 'Kasuni' },
      ],
      admins: ['saumya-student-1'],
      createdBy: 'saumya-student-1',
      lastMessage: 'Hello team',
      updatedAt: '2026-04-25T09:15:00.000Z',
    },
  ];

  let messages = [
    {
      _id: 'm-1',
      groupId: 'g-1',
      text: 'Hello team',
      type: 'text',
      sender: { _id: 'u-2', name: 'Nethmi' },
      createdAt: '2026-04-25T09:15:00.000Z',
    },
  ];

  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const method = req.method();
    const path = new URL(req.url()).pathname;

    if (path.endsWith('/api/kuppi-sessions') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: kuppiSessions }),
      });
      return;
    }

    if (path.endsWith('/api/kuppi-sessions/conductor/apply') && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { _id: 'app-1', status: 'pending' } }),
      });
      return;
    }

    if (path.endsWith('/api/software') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(softwareList),
      });
      return;
    }

    const softwareMatch = path.match(/\/api\/software\/([^/]+)$/);
    if (softwareMatch && method === 'GET') {
      const found = softwareList.find((item) => String(item._id) === String(softwareMatch[1]));
      await route.fulfill({
        status: found ? 200 : 404,
        contentType: 'application/json',
        body: JSON.stringify(found || { message: 'Not found' }),
      });
      return;
    }

    if (path.endsWith('/api/chat/groups') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(groups),
      });
      return;
    }

    const groupMessagesMatch = path.match(/\/api\/chat\/groups\/([^/]+)\/messages$/);
    if (groupMessagesMatch && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(messages),
      });
      return;
    }

    if (groupMessagesMatch && method === 'POST') {
      const payload = req.postDataJSON?.() || {};
      const created = {
        _id: `m-${messages.length + 1}`,
        groupId: groupMessagesMatch[1],
        text: payload.text || '',
        type: payload.type || 'text',
        sender: { _id: 'saumya-student-1', name: 'Saumya Student' },
        createdAt: new Date().toISOString(),
      };
      messages = [...messages, created];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
      return;
    }

    if (path.endsWith('/api/chat-users/search') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ _id: 'u-3', name: 'Kasuni', email: 'kasuni@student.eduza.test' }]),
      });
      return;
    }

    if (path.endsWith('/api/chat-users/direct') && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(groups[0]),
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

async function fillConductorForm(page) {
  await page.getByPlaceholder('Ex: Web Development').fill('Web Development');
  await page.getByPlaceholder('Ex: SE3040 / Database Systems').fill('SE3040');
  await page.getByPlaceholder('Ex: 3.45').fill('3.40');
  await page.getByPlaceholder('07xxxxxxxx').fill('0712345678');
  await page.getByPlaceholder('Ex: Mon / Wed evenings').fill('Mon evenings');
  await page.getByPlaceholder('Ex: React, Java, DBMS').fill('React, Node');
  await page.getByPlaceholder('Write a short explanation...').fill('I can guide juniors on web modules.');
}

test.describe('Saumya Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthUser(page);
    await mockSaumyaApis(page);
  });

  test('1. kuppi sessions page loads', async ({ page }) => {
    await page.goto('/kuppi-sessions', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Kuppi Sessions').first()).toBeVisible();
    await expect(page.getByText('SE Group Kuppi')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Join as a Kuppi Conductor' })).toBeVisible();
  });

  test('2. kuppi sessions shows second mocked session', async ({ page }) => {
    await page.goto('/kuppi-sessions', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('DBMS Discussion')).toBeVisible();
  });

  test('3. kuppi conductor form opens and submits', async ({ page }) => {
    await page.goto('/kuppi-sessions', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Join as a Kuppi Conductor' }).click();

    await fillConductorForm(page);

    page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain('Kuppi conductor request sent to admin successfully!');
      dialog.accept();
    });

    await page.getByRole('button', { name: 'Submit Application' }).click();
    await expect(page.getByText('Join as a Kuppi Conductor')).not.toBeVisible();
  });

  test('4. software hub loads with software cards', async ({ page }) => {
    await page.goto('/software-hub', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Software Hub').first()).toBeVisible();
    await expect(page.getByText('VS Code').first()).toBeVisible();
    await expect(page.getByText('MySQL Workbench').first()).toBeVisible();
  });

  test('5. software search filters results', async ({ page }) => {
    await page.goto('/software-hub', { waitUntil: 'domcontentloaded' });

    await page.getByPlaceholder('Search software').fill('mysql');
    await expect(page.getByText('MySQL Workbench').first()).toBeVisible();
    await expect(page.getByText('VS Code').first()).not.toBeVisible();
  });

  test('6. software card opens details page', async ({ page }) => {
    await page.goto('/software-hub', { waitUntil: 'domcontentloaded' });

    await page.getByText('VS Code').first().click();
    await expect(page).toHaveURL(/\/software\/soft-1$/);
    await expect(page.getByText('Software Details')).toBeVisible();
  });

  test('7. group chat loads default group and message', async ({ page }) => {
    await page.goto('/group-chat', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('SE 3rd Year Group').first()).toBeVisible();
    await expect(page.getByText('Hello team').first()).toBeVisible();
  });

  test('8. group chat sends a new message', async ({ page }) => {
    await page.goto('/group-chat', { waitUntil: 'domcontentloaded' });

    await page.getByPlaceholder('Type here').fill('This is a test message from Saumya spec');
    await page.getByRole('button', { name: 'Send ➤' }).click();
    await expect(page.getByText('This is a test message from Saumya spec')).toBeVisible();
  });

  test('9. ai notes uploads pdf and generates output', async ({ page }) => {
    await page.goto('/ai-notes', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('AI Notes Workspace')).toBeVisible();

    await page.locator('input[type="file"][accept="application/pdf,.pdf"]').setInputFiles({
      name: 'lecture.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF'),
    });

    await expect(page.getByText('Uploaded Lecture')).toBeVisible();
    await page
      .getByPlaceholder('Ask the AI note bot what to create from this lecture PDF...')
      .fill('Summarize this lecture into exam-ready notes.');

    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('AI Notes Bot')).toBeVisible();
    await expect(page.getByText(/# Short Note: lecture/i)).toBeVisible();
  });

  test('10. ai notes creates a new chat session', async ({ page }) => {
    await page.goto('/ai-notes', { waitUntil: 'domcontentloaded' });

    const deleteButtons = page.getByRole('button', { name: 'Delete' });
    await expect(deleteButtons).toHaveCount(1);

    await page.getByRole('button', { name: '+ New chat' }).click();
    await expect(deleteButtons).toHaveCount(2);
    await expect(page.getByRole('heading', { name: 'New AI note' })).toBeVisible();
  });
});
