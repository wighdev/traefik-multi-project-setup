import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '20s', target: 6 }, // Ramp up to 6 users over 20 seconds
    { duration: '50s', target: 12 }, // Stay at 12 users for 50 seconds
    { duration: '20s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms (Python can be slightly slower)
    http_req_failed: ['rate<0.03'], // Error rate should be less than 3%
    errors: ['rate<0.03'],
  },
};

export default function () {
  // Test Project 2 endpoint (Python app)
  const baseUrl = __ENV.BASE_URL || 'http://localhost:58002';
  
  const response = http.get(`${baseUrl}/project2`);
  
  // Validate response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
    'contains project 2 content': (r) => 
      r.body.toLowerCase().includes('project 2') || 
      r.body.toLowerCase().includes('python') ||
      r.body.toLowerCase().includes('flask'),
    'is not empty response': (r) => r.body.length > 0,
    'content type is HTML or JSON': (r) => {
      const contentType = r.headers['Content-Type'] || '';
      return contentType.includes('text/html') || contentType.includes('application/json');
    },
  });
  
  // Record errors
  errorRate.add(!success);
  
  // Simulate user interaction
  sleep(1.5);
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('🐍 Starting Project 2 (Python) Endpoint Load Test');
  console.log(`Target URL: ${__ENV.BASE_URL || 'http://localhost:58002'}/project2`);
}

// Teardown function (runs once at the end)
export function teardown() {
  console.log('✅ Project 2 Endpoint Load Test completed');
}