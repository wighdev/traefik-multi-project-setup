// @ts-check
const { test, expect } = require('@playwright/test');
const { waitForPageLoad, takeScreenshot, SERVICES } = require('../support/test-helpers.js');
const testData = require('../fixtures/test-data.json');

test.describe('Service Functionality Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should test dashboard functionality', async ({ page }) => {
    await test.step('Navigate to dashboard', async () => {
      await page.goto(SERVICES.dashboard);
      await waitForPageLoad(page);
    });

    await test.step('Verify dashboard elements', async () => {
      // Check that all expected services are listed
      for (const element of testData.services.dashboard.expectedElements) {
        const elementLocator = page.getByText(element, { exact: false }).first();
        await expect(elementLocator).toBeVisible({ timeout: 10000 });
      }
    });

    await test.step('Test navigation links from dashboard', async () => {
      // Find and test service links
      const serviceLinks = [
        { text: 'Project 1', expectedPath: '/project1' },
        { text: 'Project 2', expectedPath: '/project2' },
        { text: 'Jenkins', expectedPath: '/jenkins' }
      ];

      for (const link of serviceLinks) {
        // Look for links containing the service name
        const linkElement = page.getByRole('link', { name: new RegExp(link.text, 'i') }).first();
        
        if (await linkElement.isVisible()) {
          await linkElement.click();
          await waitForPageLoad(page);
          expect(page.url()).toContain(link.expectedPath);
          
          // Go back to dashboard
          await page.goto(SERVICES.dashboard);
          await waitForPageLoad(page);
        }
      }
    });

    await test.step('Take dashboard screenshot', async () => {
      await takeScreenshot(page, 'dashboard-functionality');
    });
  });

  test('should test Project 1 (Node.js) functionality', async ({ page }) => {
    await test.step('Navigate to Project 1', async () => {
      await page.goto(SERVICES.project1);
      await waitForPageLoad(page);
    });

    await test.step('Verify Project 1 basic functionality', async () => {
      const bodyText = await page.textContent('body');
      
      // Should contain Node.js or project-related content
      expect(bodyText.toLowerCase()).toMatch(/node|express|project|example/);
      
      // Check for any form elements or interactive components
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        console.log(`Found ${buttonCount} interactive buttons in Project 1`);
        
        // Test first button if it exists
        const firstButton = buttons.first();
        if (await firstButton.isVisible()) {
          await firstButton.click();
          await page.waitForTimeout(1000); // Wait for any JS response
        }
      }
    });

    await test.step('Test API endpoints if available', async () => {
      const apiEndpoints = [
        '/project1/api/status',
        '/project1/health',
        '/project1/api/info'
      ];

      for (const endpoint of apiEndpoints) {
        try {
          const response = await page.request.get(endpoint);
          if (response.status() === 200) {
            console.log(`Project 1 API endpoint working: ${endpoint}`);
            const data = await response.text();
            expect(data).toBeTruthy();
          }
        } catch (error) {
          // Endpoint might not exist, that's okay
          console.log(`Project 1 endpoint ${endpoint} not available`);
        }
      }
    });

    await test.step('Take Project 1 screenshot', async () => {
      await takeScreenshot(page, 'project1-functionality');
    });
  });

  test('should test Project 2 (Python) functionality', async ({ page }) => {
    await test.step('Navigate to Project 2', async () => {
      await page.goto(SERVICES.project2);
      await waitForPageLoad(page);
    });

    await test.step('Verify Project 2 basic functionality', async () => {
      const bodyText = await page.textContent('body');
      
      // Should contain Python/Flask or project-related content
      expect(bodyText.toLowerCase()).toMatch(/python|flask|project|example/);
      
      // Check for any interactive elements
      const forms = page.locator('form');
      const formCount = await forms.count();
      
      if (formCount > 0) {
        console.log(`Found ${formCount} forms in Project 2`);
        
        // Test first form if it exists
        const firstForm = forms.first();
        if (await firstForm.isVisible()) {
          const inputs = firstForm.locator('input[type="text"], input[type="email"]');
          const inputCount = await inputs.count();
          
          if (inputCount > 0) {
            await inputs.first().fill('test-data');
            console.log('Filled test data in Project 2 form');
          }
        }
      }
    });

    await test.step('Test Python/Flask specific features', async () => {
      // Test potential Flask routes
      const flaskRoutes = [
        '/project2/api',
        '/project2/health',
        '/project2/status'
      ];

      for (const route of flaskRoutes) {
        try {
          const response = await page.request.get(route);
          if (response.status() === 200) {
            console.log(`Project 2 Flask route working: ${route}`);
            const data = await response.text();
            expect(data).toBeTruthy();
          }
        } catch (error) {
          console.log(`Project 2 route ${route} not available`);
        }
      }
    });

    await test.step('Take Project 2 screenshot', async () => {
      await takeScreenshot(page, 'project2-functionality');
    });
  });

  test('should test Jenkins functionality', async ({ page }) => {
    await test.step('Navigate to Jenkins', async () => {
      await page.goto(SERVICES.jenkins);
      await waitForPageLoad(page, '', 45000); // Jenkins can be slow to load
    });

    await test.step('Verify Jenkins interface', async () => {
      const bodyText = await page.textContent('body');
      
      // Should contain Jenkins-specific content
      expect(bodyText.toLowerCase()).toMatch(/jenkins|hudson|dashboard|login/);
      
      // Check for Jenkins UI elements
      const jenkinsElements = [
        'New Item',
        'People', 
        'Build History',
        'Manage Jenkins',
        'Dashboard'
      ];

      let foundElements = 0;
      for (const element of jenkinsElements) {
        const elementLocator = page.getByText(element, { exact: false }).first();
        if (await elementLocator.isVisible({ timeout: 5000 }).catch(() => false)) {
          foundElements++;
          console.log(`Found Jenkins element: ${element}`);
        }
      }
      
      // Should find at least some Jenkins elements
      expect(foundElements).toBeGreaterThan(0);
    });

    await test.step('Test Jenkins navigation', async () => {
      // Try to click on available navigation items
      const navItems = ['Dashboard', 'New Item'];
      
      for (const item of navItems) {
        const navLink = page.getByRole('link', { name: item }).first();
        if (await navLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await navLink.click();
          await waitForPageLoad(page);
          console.log(`Successfully navigated to ${item}`);
          break; // Only test one navigation to avoid authentication issues
        }
      }
    });

    await test.step('Take Jenkins screenshot', async () => {
      await takeScreenshot(page, 'jenkins-functionality');
    });
  });

  test('should test responsive design', async ({ page }) => {
    const viewports = testData.browser.viewports;
    
    for (const viewport of viewports) {
      await test.step(`Test ${viewport.name} viewport (${viewport.width}x${viewport.height})`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        
        // Test dashboard in this viewport
        await page.goto(SERVICES.dashboard);
        await waitForPageLoad(page);
        
        // Verify content is still accessible
        const bodyText = await page.textContent('body');
        expect(bodyText).toBeTruthy();
        
        // Check that navigation doesn't break
        const links = page.locator('a');
        const linkCount = await links.count();
        expect(linkCount).toBeGreaterThan(0);
        
        await takeScreenshot(page, `responsive-${viewport.name}`);
        
        console.log(`${viewport.name} viewport test completed`);
      });
    }
  });

  test('should test cross-browser compatibility', async ({ browserName, page }) => {
    await test.step(`Test in ${browserName}`, async () => {
      // Test basic functionality in current browser
      await page.goto(SERVICES.dashboard);
      await waitForPageLoad(page);
      
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      // Test navigation
      await page.goto(SERVICES.project1);
      await waitForPageLoad(page);
      expect(page.url()).toContain('/project1');
      
      console.log(`Cross-browser test completed for ${browserName}`);
    });
  });

  test('should test JavaScript functionality', async ({ page }) => {
    await test.step('Test JavaScript execution', async () => {
      await page.goto(SERVICES.dashboard);
      await waitForPageLoad(page);
      
      // Test basic JavaScript functionality
      const jsResult = await page.evaluate(() => {
        return {
          hasJavaScript: typeof window !== 'undefined',
          userAgent: navigator.userAgent,
          screenWidth: screen.width,
          hasLocalStorage: typeof localStorage !== 'undefined'
        };
      });
      
      expect(jsResult.hasJavaScript).toBeTruthy();
      expect(jsResult.userAgent).toBeTruthy();
      expect(jsResult.hasLocalStorage).toBeTruthy();
      
      console.log('JavaScript functionality verified', jsResult);
    });
  });
});