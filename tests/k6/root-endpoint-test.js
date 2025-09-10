import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 5 }, // Ramp up to 5 users over 30 seconds
    { duration: '1m', target: 10 }, // Stay at 10 users for 1 minute
    { duration: '20s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.02'], // Error rate should be less than 2%
    errors: ['rate<0.02'],
  },
};

export default function () {
  // Test root endpoint (landing page)
  const baseUrl = __ENV.BASE_URL || 'http://localhost:58002';
  
  const response = http.get(`${baseUrl}/`);
  
  // Validate response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'contains dashboard title': (r) => r.body.includes('Server Dashboard'),
    'contains traefik': (r) => r.body.toLowerCase().includes('traefik'),
    'content type is HTML': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('text/html'),
  });
  
  // Record errors
  errorRate.add(!success);
  
  // Simulate user reading page
  sleep(1);
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('🚀 Starting Root Endpoint Load Test');
  console.log(`Target URL: ${__ENV.BASE_URL || 'http://localhost:58002'}/`);
}

// Teardown function (runs once at the end)
export function teardown() {
  console.log('✅ Root Endpoint Load Test completed');
}