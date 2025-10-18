// tests/staff_incidents.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');

const baseURL = 'http://localhost:3000';

test.describe('Staff Incident Reporting Page - Functional Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Load staff cookies for authentication
    const cookiePath = 'tests/cookies_staff.json';
    if (fs.existsSync(cookiePath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'));
      await page.context().addCookies(cookies);
    }

    // Go to the staff incidents page. Use DOMContentLoaded because socket.io keeps network busy.
    await page.goto(`${baseURL}/staff/incidents`, { waitUntil: 'domcontentloaded' });
    // Sanity: wait for page header to exist
    await page.waitForSelector('h1', { timeout: 5000 });
  });

  test('1️⃣ Verify "Report Incident" button shows the report form', async ({ page }) => {
    const reportBtn = page.locator('button', { hasText: 'Report Incident' });
    await expect(reportBtn).toBeVisible();
    await reportBtn.click();
    await expect(page.locator('form#report')).toBeVisible();
  });

  test('2️⃣ Verify "My Reports" button shows the My Reports section', async ({ page }) => {
    const myReportsBtn = page.locator('button', { hasText: 'My Reports' });
    await expect(myReportsBtn).toBeVisible();
    await myReportsBtn.click();
    await expect(page.locator('#my_reports')).toBeVisible();
  });

  test('3️⃣ Verify "Staff Issues" button shows the Staff Issues section', async ({ page }) => {
    const staffIssuesBtn = page.locator('button', { hasText: 'Staff Issues' });
    await expect(staffIssuesBtn).toBeVisible();
    await staffIssuesBtn.click();
    await expect(page.locator('#staff_issues')).toBeVisible();
  });

  test('4️⃣ Verify "Guest Issues" button shows the Guest Issues section', async ({ page }) => {
    const guestIssuesBtn = page.locator('button', { hasText: 'Guest Issues' });
    await expect(guestIssuesBtn).toBeVisible();
    await guestIssuesBtn.click();
    await expect(page.locator('#guest_issues')).toBeVisible();
  });

  test('5️⃣ Submit a new incident report (submit button works => test passes)', async ({ page }) => {
    // Ensure the report form is visible
    const reportBtn = page.locator('button', { hasText: 'Report Incident' });
    await reportBtn.click();
    const reportForm = page.locator('form#report');
    await expect(reportForm).toBeVisible();

    // Fill the form fields as requested
    const title = 'Testing from playwright incident';
    await page.fill('input[name="title"]', title);
    await page.selectOption('select[name="priority"]', 'Medium');
    await page.selectOption('select[name="category"]', 'Technical');
    await page.fill('input[name="location"]', 'automated testing location');
    await page.fill('textarea[name="description"]', 'This is an automated incident from playwright');

    // Wait for the submit button and click
    const submitButton = page.locator('form#report button.report');
    await expect(submitButton).toBeVisible();

    // Wait for the POST request to /staff/report-incident — if it happens, the submit worked
    const waitForRequest = page.waitForRequest(req =>
      req.url().includes('/staff/report-incident') && req.method() === 'POST',
      { timeout: 5000 }
    );

    await submitButton.click();

    const request = await waitForRequest;
    // Basic assertion: request should exist (submission happened)
    expect(request).toBeTruthy();
  });

});
