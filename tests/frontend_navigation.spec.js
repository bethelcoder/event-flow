const { test, expect } = require('@playwright/test');

test('navigate through manager pages from home', async ({ page }) => {
  // 1️⃣ Go to the home page
  await page.goto('http://localhost:3000/');

  // 2️⃣ Navigate to Manager Announce page
  await page.click('a#managerAnnounceLink'); // replace with actual selector
  await page.waitForSelector('#form', { state: 'visible' }); // wait for main element
  await expect(page.locator('#form')).toBeVisible();
  await expect(page.locator('#history')).toHaveCSS('display', 'none');

  // Optional: click History tab
  await page.click('.btn_tablink#historyBtn'); // adjust selector
  await expect(page.locator('#history')).toBeVisible();
  await expect(page.locator('#form')).toHaveCSS('display', 'none');

  // 3️⃣ Navigate back to home
  await page.click('a#homeLink'); // or your home button link

  // 4️⃣ Navigate to Manager Guest page
  await page.click('a#managerGuestLink'); // adjust selector
  await page.waitForSelector('#Invitations', { state: 'visible' });
  await expect(page.locator('#Invitations')).toBeVisible();

  // Fill guest form (example)
  await page.fill('#Guest_name', 'John Doe');
  await page.fill('#Guest_email', 'john@example.com');

  page.once('dialog', dialog => {
    expect(dialog.message()).toContain('Invitation successfully sent');
    dialog.dismiss();
  });
  await page.click('#sendInvite');

  // 5️⃣ Navigate back to home
  await page.click('a#homeLink');

  // 6️⃣ Navigate to Manager Task page
  await page.click('a#managerTaskLink'); // adjust selector
  await page.waitForSelector('#management', { state: 'visible' });
  await expect(page.locator('#management')).toBeVisible();
  await expect(page.locator('#workload')).toHaveCSS('display', 'none');

  // Test popup
  await page.click('.Assign');
  await expect(page.locator('#popup')).toHaveCSS('display', 'flex');
  await page.click('.popup_form .cancel');
  await expect(page.locator('#popup')).toHaveCSS('display', 'none');

  // Test tab switching
  await page.click('.btn_tablink#workloadBtn'); // adjust selector
  await expect(page.locator('#workload')).toBeVisible();
  await expect(page.locator('#management')).toHaveCSS('display', 'none');
});
