// tests/manager_announcement.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');

const baseURL = 'http://localhost:3000';

test.describe('Manager Announcement Page - Independent Functional Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Load cookies for logged-in user
    const cookies = JSON.parse(fs.readFileSync('tests/cookies.json', 'utf-8'));
    await page.context().addCookies(cookies);

    // Navigate to the announcements page
    await page.goto(`${baseURL}/manager/announcements`);
    await page.waitForLoadState('networkidle'); // ensure the page fully loads
  });

  test('1️⃣5️⃣ Verify that clicking the "History" button shows the announcements history section', async ({ page }) => {
    const historyButton = page.locator('button', { hasText: 'History' });
    await expect(historyButton).toBeVisible();

    // Click the button
    await historyButton.click();

    // Check that the history section is visible
    const historySection = page.locator('#history.History');
    await expect(historySection).toBeVisible();

    // Optionally, check that the description text exists
    const description = historySection.locator('.description');
    await expect(description).toHaveText(/.+/); // non-empty description
  });

  test('1️⃣6️⃣ Verify that the "Audience" input shows correct options when clicked', async ({ page }) => {
    const audienceSelect = page.locator('section.Audience select');
    await expect(audienceSelect).toBeVisible();

    // Check that the select contains the expected options
    const options = await audienceSelect.locator('option').allTextContents();
    expect(options).toEqual([
      'All (Staff & Guests)',
      'Staff only',
      'Guests only'
    ]);
  });

  test('1️⃣7️⃣ Verify that the announcement creation form exists on the page', async ({ page }) => {
    const form = page.locator('form#form.announce');
    await expect(form).toBeVisible();
  });

});
