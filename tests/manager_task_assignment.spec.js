// tests/manager_task_assignment.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');

const baseURL = 'http://localhost:3000';

test.describe('Manager Task Assignment Page - Independent Functional Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Load cookies for logged-in user
    const cookies = JSON.parse(fs.readFileSync('tests/cookies.json', 'utf-8'));
    await page.context().addCookies(cookies);

    // Navigate to Task Assignment page
    await page.goto(`${baseURL}/manager/task_assignment`);
    await page.waitForLoadState('networkidle');
  });

  test('1️⃣8️⃣ Verify that the "Assign New Task" button opens the assignment form', async ({ page }) => {
    const assignButton = page.locator('button.Assign', { hasText: 'Assign New Task' });
    await expect(assignButton).toBeVisible();

    // Click the button
    await assignButton.click();

    // Check that the modal/form appears
    const popupForm = page.locator('section#popup form.popup_form');
    await expect(popupForm).toBeVisible();
  });

  test('1️⃣9️⃣ Verify that the "Task Management" button switches to the management section', async ({ page }) => {
    const managementButton = page.locator('button.btn_tablink', { hasText: 'Task Management' });
    await expect(managementButton).toBeVisible();

    await managementButton.click();

    const managementSection = page.locator('section.tasks#management');
    await expect(managementSection).toBeVisible();
  });

  test('2️⃣0️⃣ Verify that the "Team Workload" button switches to the workload section', async ({ page }) => {
    const workloadButton = page.locator('button.btn_tablink', { hasText: 'Team Workload' });
    await expect(workloadButton).toBeVisible();

    await workloadButton.click();

    const workloadSection = page.locator('section.Workload#workload');
    await expect(workloadSection).toBeVisible();
  });

});
