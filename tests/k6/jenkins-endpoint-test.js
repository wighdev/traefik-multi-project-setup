import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '20s', target: 3 }, // Ramp up to 3 users over 20 seconds
    { duration: '40s', target: 5 }, // Stay at 5 users for 40 seconds
    { duration: '20s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s (Jenkins can be slower)
    http_req_failed: ['rate<0.05'], // Error rate should be less than 5%
    errors: ['rate<0.05'],
  },
};

export default function () {
  // Test Jenkins endpoint
  const baseUrl = __ENV.BASE_URL || 'http://localhost:58002';
  
  const response = http.get(`${baseUrl}/jenkins`, {
    timeout: '10s', // Jenkins might need more time
  });
  
  // Validate response
  const success = check(response, {
    'status is 200 or 403': (r) => r.status === 200 || r.status === 403, // Jenkins might require auth
    'response time < 2000ms': (r) => r.timings.duration < 2000,
    'contains jenkins or authentication': (r) => 
      r.body.toLowerCase().includes('jenkins') || 
      r.body.toLowerCase().includes('authentication') ||
      r.body.toLowerCase().includes('login'),
    'is not empty response': (r) => r.body.length > 0,
  });
  
  // Record errors
  errorRate.add(!success);
  
  // Simulate user interaction time
  sleep(2);
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('🔧 Starting Jenkins Endpoint Load Test');
  console.log(`Target URL: ${__ENV.BASE_URL || 'http://localhost:58002'}/jenkins`);
  console.log('Note: Jenkins may require authentication, 403 responses are acceptable');
}

// Teardown function (runs once at the end)
export function teardown() {
  console.log('✅ Jenkins Endpoint Load Test completed');
}