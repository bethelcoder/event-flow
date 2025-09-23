// tests/manager_chat.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');

const baseURL = 'http://localhost:3000';

test.describe('Manager Chat Page - Independent Functional Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Load cookies for logged-in user
    const cookies = JSON.parse(fs.readFileSync('tests/cookies.json', 'utf-8'));
    await page.context().addCookies(cookies);

    // Navigate to the manager chat page
    await page.goto(`${baseURL}/manager/chat`);
  });

  test('1️⃣ Verify chat page loads successfully with correct URL', async ({ page }) => {
    await expect(page).toHaveURL(/\/manager\/chat/);
  });

  test('2️⃣ Confirm key headers are displayed on the chat page', async ({ page }) => {
    const staffCommHeader = page.locator('h4.heading', { hasText: 'Staff Communication' });
    await staffCommHeader.waitFor({ state: 'visible', timeout: 5000 });
    await expect(staffCommHeader).toBeVisible();

    const staffMembersHeader = page.locator('h4.heading', { hasText: 'Staff Members' });
    await staffMembersHeader.waitFor({ state: 'visible', timeout: 5000 });
    await expect(staffMembersHeader).toBeVisible();
  });

  test('3️⃣ Ensure chat input field works and sends a message', async ({ page }) => {
    const chatInput = page.locator('#input');
    await chatInput.waitFor({ state: 'visible', timeout: 5000 });
    await expect(chatInput).toBeVisible();

    // Type a test message
    const testMessage = `Playwright test message ${Date.now()}`;
    await chatInput.fill(testMessage);

    // Click the send button (form submit)
    await page.click('form#form button[type="submit"]');

    // Verify the message appears in the container
    const lastMessage = page.locator('.message_container .text').last();
    await expect(lastMessage).toHaveText(testMessage, { timeout: 5000 });
  });

});
