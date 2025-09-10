// @ts-check
const { test, expect } = require('@playwright/test');
const { waitForPageLoad, checkNavigationLinks, SERVICES } = require('../support/test-helpers.js');
const testData = require('../fixtures/test-data.json');

test.describe('Service Routing Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should route correctly between services', async ({ page }) => {
    await test.step('Start from dashboard', async () => {
      await page.goto(SERVICES.dashboard);
      await waitForPageLoad(page);
    });

    await test.step('Navigate to Project 1 and back', async () => {
      await page.goto(SERVICES.project1);
      await waitForPageLoad(page);
      expect(page.url()).toContain('/project1');
      
      await page.goBack();
      await waitForPageLoad(page);
      expect(page.url()).not.toContain('/project1');
    });

    await test.step('Navigate to Project 2 and back', async () => {
      await page.goto(SERVICES.project2);
      await waitForPageLoad(page);
      expect(page.url()).toContain('/project2');
      
      await page.goBack();
      await waitForPageLoad(page);
      expect(page.url()).not.toContain('/project2');
    });

    await test.step('Navigate to Jenkins and back', async () => {
      await page.goto(SERVICES.jenkins);
      await waitForPageLoad(page);
      expect(page.url()).toContain('/jenkins');
      
      await page.goBack();
      await waitForPageLoad(page);
      expect(page.url()).not.toContain('/jenkins');
    });
  });

  test('should handle deep linking correctly', async ({ page }) => {
    const testRoutes = [
      { path: '/project1', expectedContent: 'project.*1|node' },
      { path: '/project2', expectedContent: 'project.*2|python|flask' },
      { path: '/jenkins', expectedContent: 'jenkins|hudson' },
      { path: '/dashboard/', expectedContent: 'traefik|dashboard' }
    ];

    for (const route of testRoutes) {
      await test.step(`Test direct access to ${route.path}`, async () => {
        await page.goto(route.path);
        await waitForPageLoad(page);
        
        expect(page.url()).toContain(route.path);
        
        const bodyText = await page.textContent('body');
        expect(bodyText.toLowerCase()).toMatch(new RegExp(route.expectedContent, 'i'));
      });
    }
  });

  test('should handle URL parameters and query strings', async ({ page }) => {
    await test.step('Test Project 1 with query parameters', async () => {
      await page.goto('/project1?test=true&mode=demo');
      await waitForPageLoad(page);
      
      expect(page.url()).toContain('/project1');
      expect(page.url()).toContain('test=true');
    });

    await test.step('Test Project 2 with URL fragments', async () => {
      await page.goto('/project2#section1');
      await waitForPageLoad(page);
      
      expect(page.url()).toContain('/project2');
      expect(page.url()).toContain('#section1');
    });
  });

  test('should maintain session across different services', async ({ page }) => {
    // Set a cookie on the main domain
    await page.goto(SERVICES.dashboard);
    await page.context().addCookies([{
      name: 'test-session',
      value: 'ui-test-session',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax'
    }]);

    // Navigate to different services and verify cookie persistence
    const servicesToTest = [SERVICES.project1, SERVICES.project2];
    
    for (const service of servicesToTest) {
      await test.step(`Check session persistence in ${service}`, async () => {
        await page.goto(service);
        await waitForPageLoad(page);
        
        const cookies = await page.context().cookies();
        const sessionCookie = cookies.find(cookie => cookie.name === 'test-session');
        
        expect(sessionCookie).toBeDefined();
        expect(sessionCookie.value).toBe('ui-test-session');
      });
    }
  });

  test('should handle 404 errors gracefully', async ({ page }) => {
    await test.step('Test non-existent routes', async () => {
      const nonExistentRoutes = [
        '/nonexistent',
        '/project3',
        '/invalid-service'
      ];

      for (const route of nonExistentRoutes) {
        const response = await page.goto(route, { waitUntil: 'networkidle' });
        
        // Should get 404 or redirect to error page
        expect([404, 502, 503].includes(response.status())).toBeTruthy();
      }
    });
  });

  test('should handle trailing slashes consistently', async ({ page }) => {
    const routesToTest = [
      { without: '/project1', with: '/project1/' },
      { without: '/project2', with: '/project2/' },
      { without: '/jenkins', with: '/jenkins/' }
    ];

    for (const routes of routesToTest) {
      await test.step(`Test trailing slash for ${routes.without}`, async () => {
        // Test without trailing slash
        await page.goto(routes.without);
        await waitForPageLoad(page);
        const urlWithout = page.url();

        // Test with trailing slash  
        await page.goto(routes.with);
        await waitForPageLoad(page);
        const urlWith = page.url();

        // Both should work and potentially normalize to the same URL
        expect(urlWithout).toContain(routes.without.replace('/', ''));
        expect(urlWith).toContain(routes.without.replace('/', ''));
      });
    }
  });

  test('should handle concurrent requests to different services', async ({ browser }) => {
    await test.step('Create multiple contexts for concurrent testing', async () => {
      const contexts = await Promise.all([
        browser.newContext(),
        browser.newContext(),
        browser.newContext()
      ]);

      const pages = await Promise.all([
        contexts[0].newPage(),
        contexts[1].newPage(), 
        contexts[2].newPage()
      ]);

      try {
        // Navigate to different services concurrently
        await Promise.all([
          pages[0].goto(SERVICES.project1),
          pages[1].goto(SERVICES.project2),
          pages[2].goto(SERVICES.jenkins)
        ]);

        // Wait for all pages to load
        await Promise.all([
          waitForPageLoad(pages[0]),
          waitForPageLoad(pages[1]),
          waitForPageLoad(pages[2])
        ]);

        // Verify all navigations were successful
        expect(pages[0].url()).toContain('/project1');
        expect(pages[1].url()).toContain('/project2');
        expect(pages[2].url()).toContain('/jenkins');

      } finally {
        // Cleanup contexts
        await Promise.all(contexts.map(context => context.close()));
      }
    });
  });
});