// tests/coverageHelper.js
const fs = require('fs');
const path = require('path');

const COVERAGE_FILE = path.resolve(__dirname, 'frontend-coverage.json');

async function startCoverage(page) {
  // start Playwright JS coverage (Chromium)
  await page.coverage.startJSCoverage();
}

async function stopAndSaveCoverage(page) {
  // stop and get coverage entries from this page
  const entries = await page.coverage.stopJSCoverage();
  // read existing coverage array if exists
  let accumulated = [];
  if (fs.existsSync(COVERAGE_FILE)) {
    try { accumulated = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf8')); } catch (e) { accumulated = []; }
  }
  // append new entries
  accumulated = accumulated.concat(entries);
  fs.writeFileSync(COVERAGE_FILE, JSON.stringify(accumulated, null, 2));
}

module.exports = {
  startCoverage,
  stopAndSaveCoverage,
  COVERAGE_FILE
};
