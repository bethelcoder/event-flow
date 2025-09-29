// tests/staff_chats.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');

const baseURL = 'http://localhost:3000';

test.describe('Staff Chats Page - Functional Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Load staff cookies
    const cookies = JSON.parse(fs.readFileSync('tests/cookies_staff.json', 'utf-8'));
    await page.context().addCookies(cookies);

    // Go to staff chats page
    await page.goto(`${baseURL}/staff/announcements`);
    await page.waitForLoadState('networkidle');
  });

  test('1️⃣ Send a message via input field and send button', async ({ page }) => {
    const testMessage = 'Automated staff message from Playwright ✅';

    // Fill in input
    await page.fill('#input.input_message', testMessage);

    // Click send (button inside form)
    await page.click('form#form button[type="submit"]');

    // Wait for it to appear
    await page.waitForTimeout(1000);

    // Check last sent message contains text
    const lastMessage = page.locator('.message_sent .text').last();
    await expect(lastMessage).toHaveText(testMessage);
  });

  test('2️⃣ Verify Staff Communication header is visible', async ({ page }) => {
    await expect(page.locator('h4.heading', { hasText: 'Staff Communication' })).toBeVisible();
  });

  test('3️⃣ Verify Staff Members header is visible', async ({ page }) => {
    await expect(page.locator('h4.heading', { hasText: 'Staff Members' })).toBeVisible();
  });

});
