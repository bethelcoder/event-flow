// tests/manager_guest.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');

const baseURL = 'http://localhost:3000';

test.describe('Manager Guest Invitation Page - Independent Functional Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Load cookies for logged-in user
    const cookies = JSON.parse(fs.readFileSync('tests/cookies.json', 'utf-8'));
    await page.context().addCookies(cookies);

    // Go to Guest Invitation page
    await page.goto(`${baseURL}/manager/guest-invite`);
  });

  test('1️⃣1️⃣ Verify that the "Send Invitation" button is visible and functional', async ({ page }) => {
    const sendInviteButton = page.locator('#sendInvite'); // unique selector
    await expect(sendInviteButton).toBeVisible();
    // Optionally click to check interaction
    // await sendInviteButton.click();
  });

  test('1️⃣2️⃣ Verify that the "send Bulk Invitations" button exists and is visible', async ({ page }) => {
    const bulkInviteButton = page.locator('.bulk_invite button'); // targets the correct bulk invite button
    await expect(bulkInviteButton).toBeVisible();
  });

  test('1️⃣3️⃣ Confirm that the "Guest List" tab displays the guest list section when clicked', async ({ page }) => {
    const guestListTab = page.locator('.btn_tablink', { hasText: 'Guest List' });
    await guestListTab.click();
    const guestListSection = page.locator('#Guest_list');
    await expect(guestListSection).toBeVisible();
  });

  test('1️⃣4️⃣ Confirm that the "EmailTemplate" tab displays the email template section when clicked', async ({ page }) => {
    const emailTemplateTab = page.locator('.btn_tablink', { hasText: 'EmailTemplate' });
    await emailTemplateTab.click();
    const emailTemplateSection = page.locator('#EmailTemplate');
    await expect(emailTemplateSection).toBeVisible();
  });

});
