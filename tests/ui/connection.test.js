// @ts-check
const { test, expect } = require('@playwright/test');
const { checkPageAccessibility, waitForServiceReady, SERVICES } = require('../support/test-helpers.js');
const testData = require('../fixtures/test-data.json');

test.describe('Service Connection Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should connect to main dashboard', async ({ page }) => {
    await test.step('Navigate to dashboard', async () => {
      await checkPageAccessibility(page, SERVICES.dashboard);
    });

    await test.step('Verify dashboard content', async () => {
      // Check for expected elements from test data
      for (const element of testData.services.dashboard.expectedElements) {
        await expect(page.getByText(element, { exact: false })).toBeVisible();
      }
    });

    await test.step('Verify page performance', async () => {
      const startTime = Date.now();
      await page.reload();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(testData.performance.expectedLoadTime);
    });
  });

  test('should connect to Project 1 through Traefik', async ({ page }) => {
    await test.step('Wait for Project 1 service', async () => {
      await waitForServiceReady(page, SERVICES.project1);
    });

    await test.step('Navigate to Project 1', async () => {
      await checkPageAccessibility(page, SERVICES.project1);
    });

    await test.step('Verify Project 1 content', async () => {
      // Verify we're on the correct service
      expect(page.url()).toContain('/project1');
      
      // Check for Node.js related content
      const bodyText = await page.textContent('body');
      expect(bodyText.toLowerCase()).toMatch(/node|project.*1|express/);
    });
  });

  test('should connect to Project 2 through Traefik', async ({ page }) => {
    await test.step('Wait for Project 2 service', async () => {
      await waitForServiceReady(page, SERVICES.project2);
    });

    await test.step('Navigate to Project 2', async () => {
      await checkPageAccessibility(page, SERVICES.project2);
    });

    await test.step('Verify Project 2 content', async () => {
      // Verify we're on the correct service
      expect(page.url()).toContain('/project2');
      
      // Check for Python/Flask related content
      const bodyText = await page.textContent('body');
      expect(bodyText.toLowerCase()).toMatch(/python|flask|project.*2/);
    });
  });

  test('should connect to Jenkins through Traefik', async ({ page }) => {
    await test.step('Wait for Jenkins service', async () => {
      await waitForServiceReady(page, SERVICES.jenkins, 3, 5000);
    });

    await test.step('Navigate to Jenkins', async () => {
      // Jenkins might redirect or have authentication, so we're more lenient
      const response = await page.goto(`${page.baseURL()}${SERVICES.jenkins}`);
      
      // Accept various redirect responses as valid
      expect([200, 302, 403].includes(response.status())).toBeTruthy();
    });

    await test.step('Verify Jenkins is accessible', async () => {
      // Verify we're on Jenkins (even if login page)
      expect(page.url()).toContain('/jenkins');
      
      // Look for Jenkins-specific elements
      const bodyText = await page.textContent('body');
      expect(bodyText.toLowerCase()).toMatch(/jenkins|hudson|login/);
    });
  });

  test('should connect to Traefik dashboard', async ({ page }) => {
    await test.step('Navigate to Traefik dashboard', async () => {
      const response = await page.goto(`${page.baseURL()}${SERVICES.traefik}`);
      
      // Traefik dashboard might require authentication
      expect([200, 401, 403].includes(response.status())).toBeTruthy();
    });

    await test.step('Verify Traefik dashboard elements', async () => {
      expect(page.url()).toContain('/dashboard');
      
      // Look for Traefik-specific content
      const bodyText = await page.textContent('body');
      expect(bodyText.toLowerCase()).toMatch(/traefik|routers|services|middlewares/);
    });
  });
});