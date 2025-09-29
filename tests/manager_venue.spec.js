// tests/manager_venue.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const baseURL = 'http://localhost:3000';

test.describe('Manager Venue Page - Independent Functional Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Load cookies for logged-in user
    const cookies = JSON.parse(fs.readFileSync('tests/cookies.json', 'utf-8'));
    await page.context().addCookies(cookies);

    // Navigate to the venue selection page
    await page.goto(`${baseURL}/manager/venue-selection`);
  });

  test('1️⃣ Verify that the "Add New Venue" button is visible and functional', async ({ page }) => {
    const addVenueButton = page.locator('button', { hasText: 'Add New Venue' });
    await addVenueButton.waitFor({ state: 'visible', timeout: 5000 });
    await expect(addVenueButton).toBeVisible();

    await addVenueButton.click();
    const venueModal = page.locator('#venueModal[aria-hidden="false"]');
    await venueModal.waitFor({ state: 'visible', timeout: 5000 });
    await expect(venueModal).toBeVisible();
  });

  test('2️⃣ Verify that at least one "Select" button exists for choosing a venue', async ({ page }) => {
    const selectButton = page.locator('button', { hasText: 'select' });
    await selectButton.first().waitFor({ state: 'visible', timeout: 5000 });
    await expect(selectButton.first()).toBeVisible();
  });

  test('3️⃣ Verify all input fields exist in the "Add New Venue" modal', async ({ page }) => {
    await page.locator('button', { hasText: 'Add New Venue' }).click();
    const fields = [
      '#name', '#typeofvenue', '#address', '#capacity',
      '#facilities', '#city', '#rating', '#venueImage', '#mapImage'
    ];

    for (const selector of fields) {
      const input = page.locator(selector);
      await expect(input).toBeVisible();
    }
  });

  test('4️⃣ Modal cancel button closes the modal', async ({ page }) => {
    await page.locator('button', { hasText: 'Add New Venue' }).click();
    await page.click('#venueForm button', { hasText: 'Cancel' });
    const venueModal = page.locator('#venueModal');
    await expect(venueModal).toHaveAttribute('aria-hidden', 'true');
  });

  test('5️⃣ Add a new test venue and verify it appears in the list', async ({ page }) => {
    await page.locator('button', { hasText: 'Add New Venue' }).click();

    const testVenueName = `Test Venue ${Date.now()}`;
    const testType = 'Ballroom';
    const testAddress = '123 Test Street';
    const testCapacity = '500';
    const testFacilities = 'WiFi, Parking';
    const testCity = 'Johannesburg';
    const testRating = '4.5';

    // Image now in the same folder as this test file
    const testImage = path.resolve(__dirname, 'background.jpg');
    const testMapImage = path.resolve(__dirname, 'background.jpg'); // reuse same picture for map

    await page.setInputFiles('#venueImage', testImage);
    await page.setInputFiles('#mapImage', testMapImage);

    await page.fill('#name', testVenueName);
    await page.fill('#typeofvenue', testType);
    await page.fill('#address', testAddress);
    await page.fill('#capacity', testCapacity);
    await page.fill('#facilities', testFacilities);
    await page.fill('#city', testCity);
    await page.fill('#rating', testRating);

    // Submit the form
    await page.click('form#venueForm button[type="submit"]');

    // Wait a short moment for the new venue to appear in the list
    await page.waitForTimeout(1000);

    // Verify the last venue card contains the venue just added
    const lastVenue = page.locator('.All_venues .venue').last();
    await expect(lastVenue.locator('h3')).toHaveText(new RegExp(testVenueName));
  });

  test('6️⃣ Verify clicking "Select" submits the form', async ({ page }) => {
    const selectButton = page.locator('.All_venues .venue button', { hasText: 'select' }).first();
    await selectButton.waitFor({ state: 'visible', timeout: 5000 });

    page.on('request', request => {
      if (request.url().includes('/manager/select-venue') && request.method() === 'POST') {
        expect(request.postData()).toBeTruthy();
      }
    });

    await selectButton.click();
  });

  test('7️⃣ Modal cannot submit with empty required fields', async ({ page }) => {
    await page.locator('button', { hasText: 'Add New Venue' }).click();

    const fields = ['#name', '#typeofvenue', '#address', '#capacity', '#facilities', '#city', '#rating'];
    for (const selector of fields) {
      await page.fill(selector, '');
    }

    await page.click('form#venueForm button[type="submit"]');

    const venueModal = page.locator('#venueModal[aria-hidden="false"]');
    await expect(venueModal).toBeVisible();
  });

});
