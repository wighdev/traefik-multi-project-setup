import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '10s', target: 2 }, // Ramp up to 2 users
    { duration: '20s', target: 2 }, // Stay at 2 users
    { duration: '10s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
    http_req_failed: ['rate<0.05'], // Error rate should be less than 5%
    errors: ['rate<0.05'],
  },
};

export default function () {
  // Example custom test - modify this template for your needs
  const baseUrl = __ENV.BASE_URL || 'http://localhost:58002';
  
  // Test your custom endpoint here
  const response = http.get(`${baseUrl}/your-custom-endpoint`);
  
  // Add your custom validations
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
    'contains expected content': (r) => r.body.includes('your-expected-text'),
    // Add more checks as needed
  });
  
  // Record errors
  errorRate.add(!success);
  
  // Simulate user think time
  sleep(1);
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('🧪 Starting Custom Load Test');
  console.log(`Target URL: ${__ENV.BASE_URL || 'http://localhost:58002'}/your-custom-endpoint`);
}

// Teardown function (runs once at the end)
export function teardown() {
  console.log('✅ Custom Load Test completed');
}