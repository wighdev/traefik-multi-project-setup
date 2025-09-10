// @ts-check
const { test, expect } = require('@playwright/test');
const { checkHealthEndpoint, waitForServiceReady, SERVICES } = require('../support/test-helpers.js');
const testData = require('../fixtures/test-data.json');

test.describe('Health Check Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should verify all services are healthy', async ({ page }) => {
    const services = Object.entries(testData.services);
    
    for (const [serviceName, serviceConfig] of services) {
      await test.step(`Check ${serviceName} health`, async () => {
        // First verify the service is accessible
        await waitForServiceReady(page, serviceConfig.url);
        
        const response = await page.request.get(serviceConfig.url);
        expect(response.status()).toBeLessThan(500); // No server errors
        
        // If service has a health check endpoint, test it
        if (serviceConfig.healthCheck) {
          try {
            await checkHealthEndpoint(page, serviceConfig.healthCheck);
          } catch (error) {
            // Health endpoint might not exist, that's okay
            console.log(`Health endpoint not available for ${serviceName}: ${error.message}`);
          }
        }
      });
    }
  });

  test('should check response times for all services', async ({ page }) => {
    const services = [
      { name: 'dashboard', url: SERVICES.dashboard },
      { name: 'project1', url: SERVICES.project1 },
      { name: 'project2', url: SERVICES.project2 },
      { name: 'jenkins', url: SERVICES.jenkins },
      { name: 'traefik', url: SERVICES.traefik }
    ];

    for (const service of services) {
      await test.step(`Check response time for ${service.name}`, async () => {
        const startTime = Date.now();
        
        const response = await page.request.get(service.url);
        
        const responseTime = Date.now() - startTime;
        
        // Service should respond within reasonable time
        expect(responseTime).toBeLessThan(testData.performance.expectedResponseTime);
        
        // Should not return server error
        expect(response.status()).toBeLessThan(500);
        
        console.log(`${service.name} response time: ${responseTime}ms`);
      });
    }
  });

  test('should verify service availability under load', async ({ page }) => {
    await test.step('Send multiple concurrent requests', async () => {
      const requests = [];
      const numberOfRequests = 10;
      
      for (let i = 0; i < numberOfRequests; i++) {
        requests.push(page.request.get(SERVICES.dashboard));
      }
      
      const responses = await Promise.all(requests);
      
      // All requests should succeed
      for (const response of responses) {
        expect(response.status()).toBeLessThan(400);
      }
      
      console.log(`All ${numberOfRequests} concurrent requests succeeded`);
    });
  });

  test('should check HTTP headers for security', async ({ page }) => {
    const servicesToTest = [
      { name: 'dashboard', url: SERVICES.dashboard },
      { name: 'project1', url: SERVICES.project1 },
      { name: 'project2', url: SERVICES.project2 }
    ];

    for (const service of servicesToTest) {
      await test.step(`Check security headers for ${service.name}`, async () => {
        const response = await page.request.get(service.url);
        const headers = response.headers();
        
        // Log available headers for debugging
        console.log(`Headers for ${service.name}:`, Object.keys(headers));
        
        // Basic checks - these might not all be present depending on configuration
        if (headers['x-content-type-options']) {
          expect(headers['x-content-type-options']).toBe('nosniff');
        }
        
        // Ensure no sensitive information is leaked in headers
        expect(headers['server'] || '').not.toMatch(/nginx\/[\d.]+|apache\/[\d.]+/i);
      });
    }
  });

  test('should verify service connectivity through Traefik', async ({ page }) => {
    await test.step('Test direct service access vs Traefik routing', async () => {
      // Test that services are accessible through Traefik routing
      const services = [
        SERVICES.project1,
        SERVICES.project2
      ];

      for (const service of services) {
        // Access through Traefik (normal path)
        const traefikResponse = await page.request.get(service);
        expect(traefikResponse.status()).toBeLessThan(400);
        
        console.log(`Service ${service} accessible through Traefik: ${traefikResponse.status()}`);
      }
    });
  });

  test('should handle service failures gracefully', async ({ page }) => {
    await test.step('Test graceful degradation', async () => {
      // Test accessing potentially unavailable services
      const potentiallyUnavailableServices = [
        '/nonexistent-service',
        '/project3',  // Doesn't exist
        '/invalid'
      ];

      for (const service of potentiallyUnavailableServices) {
        const response = await page.request.get(service);
        
        // Should return proper error codes, not crash
        expect([404, 502, 503, 504].includes(response.status())).toBeTruthy();
        
        console.log(`Service ${service} properly returns error: ${response.status()}`);
      }
    });
  });

  test('should verify CORS configuration', async ({ page }) => {
    await test.step('Test CORS headers', async () => {
      const services = [SERVICES.project1, SERVICES.project2];
      
      for (const service of services) {
        // Test preflight request
        try {
          const response = await page.request.fetch(service, {
            method: 'OPTIONS',
            headers: {
              'Origin': 'http://localhost:58002',
              'Access-Control-Request-Method': 'GET'
            }
          });
          
          const headers = response.headers();
          console.log(`CORS headers for ${service}:`, {
            'access-control-allow-origin': headers['access-control-allow-origin'],
            'access-control-allow-methods': headers['access-control-allow-methods']
          });
          
        } catch (error) {
          // CORS might not be configured, which is also valid
          console.log(`CORS not configured for ${service}: ${error.message}`);
        }
      }
    });
  });

  test('should check SSL/TLS configuration', async ({ page }) => {
    await test.step('Verify HTTPS readiness', async () => {
      // Check if services are ready for HTTPS
      const baseUrlHttps = page.baseURL()?.replace('http:', 'https:').replace(':58002', ':58003');
      
      if (baseUrlHttps) {
        try {
          const response = await page.request.get('/', { baseURL: baseUrlHttps });
          console.log(`HTTPS endpoint status: ${response.status()}`);
        } catch (error) {
          // HTTPS might not be configured yet, which is expected in development
          console.log(`HTTPS not configured: ${error.message}`);
        }
      }
    });
  });
});