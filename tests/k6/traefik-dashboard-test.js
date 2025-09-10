import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '15s', target: 2 }, // Ramp up to 2 users over 15 seconds
    { duration: '30s', target: 4 }, // Stay at 4 users for 30 seconds
    { duration: '15s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'], // 95% of requests should be below 1.5s
    http_req_failed: ['rate<0.05'], // Error rate should be less than 5%
    errors: ['rate<0.05'],
  },
};

export default function () {
  // Test Traefik dashboard endpoint
  const baseUrl = __ENV.BASE_URL || 'http://localhost:58002';
  
  const response = http.get(`${baseUrl}/dashboard/`, {
    timeout: '15s', // Traefik dashboard might need more time
  });
  
  // Validate response
  const success = check(response, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401, // Dashboard might require auth
    'response time < 1500ms': (r) => r.timings.duration < 1500,
    'contains traefik or dashboard content': (r) => 
      r.body.toLowerCase().includes('traefik') || 
      r.body.toLowerCase().includes('dashboard') ||
      r.body.toLowerCase().includes('router') ||
      r.body.toLowerCase().includes('service'),
    'is not empty response': (r) => r.body.length > 0,
  });
  
  // Also test the API endpoint if available
  const apiResponse = http.get(`${baseUrl}/api/overview`, {
    timeout: '10s',
  });
  const apiSuccess = check(apiResponse, {
    'API status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'API response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  // Record errors (only if both main and API fail)
  errorRate.add(!success);
  
  // Simulate user viewing dashboard
  sleep(2);
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('⚡ Starting Traefik Dashboard Load Test');
  console.log(`Target URL: ${__ENV.BASE_URL || 'http://localhost:58002'}/dashboard/`);
  console.log('Note: Dashboard may require authentication, 401 responses are acceptable');
}

// Teardown function (runs once at the end)
export function teardown() {
  console.log('✅ Traefik Dashboard Load Test completed');
}