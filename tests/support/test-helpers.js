// @ts-check
const { expect } = require('@playwright/test');

/**
 * Helper functions for Playwright tests
 */

/**
 * Wait for page to load and verify basic elements
 * @param {import('@playwright/test').Page} page
 * @param {string} expectedTitle - Expected page title or partial title
 * @param {number} timeout - Timeout in milliseconds
 */
async function waitForPageLoad(page, expectedTitle = '', timeout = 30000) {
  await page.waitForLoadState('networkidle', { timeout });
  
  if (expectedTitle) {
    await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'), { timeout });
  }
}

/**
 * Check if page is accessible and returns valid response
 * @param {import('@playwright/test').Page} page
 * @param {string} url - URL to check
 * @param {number} expectedStatus - Expected HTTP status code
 */
async function checkPageAccessibility(page, url, expectedStatus = 200) {
  const response = await page.goto(url);
  expect(response.status()).toBe(expectedStatus);
  
  // Wait for page to be fully loaded
  await waitForPageLoad(page);
  
  // Verify no obvious error messages
  const bodyText = await page.textContent('body');
  expect(bodyText).not.toMatch(/error|404|500|502|503/i);
  
  return response;
}

/**
 * Check if navigation links work correctly
 * @param {import('@playwright/test').Page} page
 * @param {Array<{selector: string, expectedUrl: string}>} links
 */
async function checkNavigationLinks(page, links) {
  for (const link of links) {
    await page.click(link.selector);
    await waitForPageLoad(page);
    expect(page.url()).toMatch(new RegExp(link.expectedUrl));
    await page.goBack();
    await waitForPageLoad(page);
  }
}

/**
 * Check health endpoint response
 * @param {import('@playwright/test').Page} page
 * @param {string} healthUrl - Health check endpoint URL
 * @param {Object} expectedData - Expected response data
 */
async function checkHealthEndpoint(page, healthUrl, expectedData = {}) {
  const response = await page.request.get(healthUrl);
  expect(response.status()).toBe(200);
  
  const responseData = await response.json().catch(() => ({}));
  
  if (expectedData.status) {
    expect(responseData.status || responseData.health).toBe(expectedData.status);
  }
  
  return responseData;
}

/**
 * Take screenshot with consistent naming
 * @param {import('@playwright/test').Page} page
 * @param {string} name - Screenshot name
 */
async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Wait for service to be ready with retry logic
 * @param {import('@playwright/test').Page} page
 * @param {string} url - Service URL to check
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryDelay - Delay between retries in ms
 */
async function waitForServiceReady(page, url, maxRetries = 5, retryDelay = 3000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await page.request.get(url);
      if (response.status() < 400) {
        return response;
      }
      throw new Error(`HTTP ${response.status()}`);
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        console.log(`Service not ready, retrying in ${retryDelay}ms... (${i + 1}/${maxRetries})`);
        await page.waitForTimeout(retryDelay);
      }
    }
  }
  
  throw new Error(`Service not ready after ${maxRetries} retries: ${lastError.message}`);
}

/**
 * Service endpoints configuration
 */
const SERVICES = {
  dashboard: '/',
  project1: '/project1',
  project2: '/project2', 
  jenkins: '/jenkins',
  traefik: '/dashboard/'
};

/**
 * Common test data
 */
const TEST_DATA = {
  defaultTimeout: 30000,
  longTimeout: 60000,
  shortTimeout: 10000
};

module.exports = {
  waitForPageLoad,
  checkPageAccessibility,
  checkNavigationLinks,
  checkHealthEndpoint,
  takeScreenshot,
  waitForServiceReady,
  SERVICES,
  TEST_DATA
};