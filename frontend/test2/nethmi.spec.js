import { expect, test } from '@playwright/test';

function isoDaysAgo(daysAgo) {
  const date = new Date();
  date.setHours(10, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

async function setAuthUser(page) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'nethmi-student-1',
        _id: 'nethmi-student-1',
        name: 'Nethmi Student',
        email: 'nethmi@student.eduza.test',
        role: 'student',
      })
    );
  });
}

async function mockNethmiApis(page) {
  let gpaProfile = {
    selectedMode: 'Custom-Add your own',
    modules: [
      {
        id: 'g-1',
        moduleName: 'Object Oriented Concepts',
        credits: 3,
        grade: 'B+',
      },
    ],
  };

  const quizAssessments = [
    {
      _id: 'quiz-1',
      moduleCode: 'SE3040',
      moduleName: 'Software Engineering',
      type: 'quiz',
      score: 0,
      questions: [
        {
          id: 'q1',
          text: 'Which principle hides internal implementation details?',
          options: ['Encapsulation', 'Inheritance', 'Abstraction Layer', 'Polymorphism'],
          correctOption: 'A',
        },
        {
          id: 'q2',
          text: 'What artifact captures user needs in agile?',
          options: ['Class Diagram', 'User Story', 'ER Diagram', 'Compiler'],
          correctOption: 'B',
        },
      ],
    },
  ];

  const selfCheckAssessments = [
    {
      _id: 'sc-1',
      moduleCode: 'SE3050',
      moduleName: 'Applied Statistics',
      type: 'selfcheck',
      learningOutcomes: [
        { id: 'lo-1', text: 'I can explain mean, variance, and standard deviation.' },
        { id: 'lo-2', text: 'I can choose a fitting statistical test for sample data.' },
      ],
    },
  ];

  let attempts = [
    {
      _id: 'a-1',
      quizId: 'quiz-1',
      moduleCode: 'SE3040',
      moduleName: 'Software Engineering',
      assessmentType: 'quiz',
      attemptNumber: 1,
      score100: 52,
      correctCount: 1,
      wrongCount: 1,
      totalQuestions: 2,
      submittedAt: isoDaysAgo(2),
    },
    {
      _id: 'a-2',
      quizId: 'quiz-1',
      moduleCode: 'SE3040',
      moduleName: 'Software Engineering',
      assessmentType: 'quiz',
      attemptNumber: 2,
      score100: 76,
      correctCount: 2,
      wrongCount: 0,
      totalQuestions: 2,
      submittedAt: isoDaysAgo(1),
    },
    {
      _id: 'a-3',
      quizId: 'sc-1',
      moduleCode: 'SE3050',
      moduleName: 'Applied Statistics',
      assessmentType: 'selfcheck',
      attemptNumber: 1,
      score100: 70,
      confidenceLevel: 4,
      reflection: 'I improved but need more confidence with test selection.',
      checkedOutcomes: 1,
      totalOutcomes: 2,
      submittedAt: isoDaysAgo(0),
    },
  ];

  await page.route('**/api/gpa', async (route) => {
    const req = route.request();
    const method = req.method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(gpaProfile),
      });
      return;
    }

    if (method === 'PUT') {
      const payload = req.postDataJSON?.() || {};
      gpaProfile = {
        selectedMode: payload.selectedMode || gpaProfile.selectedMode,
        modules: Array.isArray(payload.modules) ? payload.modules : gpaProfile.modules,
      };

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(gpaProfile),
      });
      return;
    }

    await route.continue();
  });

  const handleProgressRoute = async (route) => {
    const req = route.request();
    const method = req.method();
    const url = new URL(req.url());
    const path = url.pathname;
    const type = url.searchParams.get('type');

    if (path.endsWith('/api/progress-assessments/attempts') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(attempts),
      });
      return;
    }

    if (path.endsWith('/api/progress-assessments/attempts') && method === 'POST') {
      const payload = req.postDataJSON?.() || {};
      const created = {
        _id: `a-${attempts.length + 1}`,
        ...payload,
      };
      attempts = [...attempts, created];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
      return;
    }

    const attemptPatchMatch = path.match(/\/api\/progress-assessments\/attempts\/([^/]+)$/);
    if (attemptPatchMatch && method === 'PATCH') {
      const payload = req.postDataJSON?.() || {};
      const id = attemptPatchMatch[1];

      attempts = attempts.map((item) => {
        if (String(item._id) === String(id) || String(item.id) === String(id)) {
          return { ...item, ...payload };
        }
        return item;
      });

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(attempts.find((item) => String(item._id) === String(id)) || {}),
      });
      return;
    }

    if (path.endsWith('/api/progress-assessments') && method === 'GET') {
      if (type === 'quiz') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(quizAssessments),
        });
        return;
      }

      if (type === 'selfcheck') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(selfCheckAssessments),
        });
        return;
      }
    }

    await route.continue();
  };

  await page.route('**/api/progress-assessments**', handleProgressRoute);
  await page.route('**/api/progress-assessments/**', handleProgressRoute);
}

test.describe('Nethmi Academic Flows', () => {
  test.beforeEach(async ({ page }) => {
    await setAuthUser(page);
    await mockNethmiApis(page);
  });

  test('1. gpa calculator loads with core controls', async ({ page }) => {
    await page.goto('/gpa-calculator', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('GPA Calculator').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Module' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Generate Report' })).toBeVisible();
    await expect(page.getByText('Current GPA')).toBeVisible();
  });

  test('2. gpa calculator generates report after adding module data', async ({ page }) => {
    await page.goto('/gpa-calculator', { waitUntil: 'domcontentloaded' });

    const moduleInput = page.getByPlaceholder('Module name').first();
    await moduleInput.fill('Quality Assurance');

    await page.getByRole('button', { name: 'Generate Report' }).click();

    await expect(page.getByRole('heading', { name: 'GPA Report' })).toBeVisible();
    await expect(page.getByText('Performance Level')).toBeVisible();
  });

  test('3. progress tracker opens module quiz category', async ({ page }) => {
    await page.goto('/progress-tracker', { waitUntil: 'domcontentloaded' });

    await page.locator('button:has(h2:has-text("Module Quiz"))').first().click();
    await expect(page.getByText('Module Quiz').first()).toBeVisible();
    await expect(page.getByText('SE3040 - Software Engineering')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Quiz Paper' })).toBeVisible();
  });

  test('4. module quiz can be submitted and shows result block', async ({ page }) => {
    await page.goto('/progress-tracker', { waitUntil: 'domcontentloaded' });

    await page.locator('button:has(h2:has-text("Module Quiz"))').first().click();
    await page.getByRole('button', { name: 'Open Quiz Paper' }).click();

    await page.locator('input[name="quiz-quiz-1-question-0"][value="A"]').check();
    await page.locator('input[name="quiz-quiz-1-question-1"][value="B"]').check();

    await page.getByRole('button', { name: 'Submit Quiz' }).click();

    await expect(page.getByText('Quiz Result')).toBeVisible();
    await expect(page.getByText('Wrong Answers Review')).toBeVisible();
  });

  test('5. progress tracker opens module self-check category', async ({ page }) => {
    await page.goto('/progress-tracker', { waitUntil: 'domcontentloaded' });

    await page.locator('button:has(h2:has-text("Self Check"))').first().click();
    await expect(page.getByText('Self Check').first()).toBeVisible();
    await expect(page.getByText('SE3050 - Applied Statistics')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Self Check' })).toBeVisible();
  });

  test('6. self-check submission creates self-check result', async ({ page }) => {
    await page.goto('/progress-tracker', { waitUntil: 'domcontentloaded' });

    await page.locator('button:has(h2:has-text("Self Check"))').first().click();
    await page.getByRole('button', { name: 'Open Self Check' }).click();

    await page.locator('label', { hasText: 'I can explain mean, variance, and standard deviation.' }).click();
    await page.locator('label', { hasText: 'High' }).first().click();
    await page.getByPlaceholder('What did you learn? What concepts do you still need to work on?').fill('I understand core metrics and need more practice with selecting tests.');

    await page.getByRole('button', { name: 'Submit Self Check' }).first().click();

    await expect(page.getByText('AI-Powered Improvement Suggestions')).toBeVisible();
  });

  test('7. measure category shows performance trend analysis content', async ({ page }) => {
    await page.goto('/progress-tracker', { waitUntil: 'domcontentloaded' });

    await page.locator('button:has(h2:has-text("Measure"))').first().click();

    await expect(page.getByText('Quiz Progress Trend')).toBeVisible();
    await expect(page.getByText('Quiz Repeat Analytics')).toBeVisible();
    await expect(page.getByText('Quiz Repeat History')).toBeVisible();
  });

  test('8. measure category shows repeat analytics metrics', async ({ page }) => {
    await page.goto('/progress-tracker', { waitUntil: 'domcontentloaded' });

    await page.locator('button:has(h2:has-text("Measure"))').first().click();

    await expect(page.getByText('Latest Score')).toBeVisible();
    await expect(page.getByText('Average Score')).toBeVisible();
    await expect(page.getByText('Avg Repeat Gain')).toBeVisible();
    await expect(page.getByText('Module-by-Module Summary')).toBeVisible();
  });

  test('9. streak badge category shows streak and level cards', async ({ page }) => {
    await page.goto('/progress-tracker', { waitUntil: 'domcontentloaded' });

    await page.locator('button:has(h2:has-text("Streak Badge"))').first().click();

    await expect(page.getByText('Current Streak')).toBeVisible();
    await expect(page.getByText('Best Streak')).toBeVisible();
    await expect(page.getByText('Badge Level')).toBeVisible();
    await expect(page.getByText('Study Streak Badge Unlocked')).toBeVisible();
  });

  test('10. streak badge category shows weekly and insights panels', async ({ page }) => {
    await page.goto('/progress-tracker', { waitUntil: 'domcontentloaded' });

    await page.locator('button:has(h2:has-text("Streak Badge"))').first().click();

    await expect(page.getByText('Weekly Activity')).toBeVisible();
    await expect(page.getByText('Reward Catalog')).toBeVisible();
    await expect(page.getByText('AI Performance Insights')).toBeVisible();
  });
});
