import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '20s', target: 8 }, // Ramp up to 8 users over 20 seconds
    { duration: '1m', target: 15 }, // Stay at 15 users for 1 minute
    { duration: '20s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% of requests should be below 800ms
    http_req_failed: ['rate<0.02'], // Error rate should be less than 2%
    errors: ['rate<0.02'],
  },
};

export default function () {
  // Test Project 1 endpoint (Node.js app)
  const baseUrl = __ENV.BASE_URL || 'http://localhost:58002';
  
  const response = http.get(`${baseUrl}/project1`);
  
  // Validate response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 800ms': (r) => r.timings.duration < 800,
    'contains project 1 content': (r) => 
      r.body.toLowerCase().includes('project 1') || 
      r.body.toLowerCase().includes('node.js'),
    'contains application title': (r) => r.body.includes('Node.js App'),
    'content type is HTML': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('text/html'),
    'has refresh link': (r) => r.body.includes('Refresh'),
  });
  
  // Test API endpoint if available
  const apiResponse = http.get(`${baseUrl}/project1/api/status`);
  const apiSuccess = check(apiResponse, {
    'API status is 200': (r) => r.status === 200,
    'API response is JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    'API contains status': (r) => r.body.includes('status'),
  });
  
  // Record errors
  errorRate.add(!success && !apiSuccess);
  
  // Simulate user interaction
  sleep(1);
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('🚀 Starting Project 1 (Node.js) Endpoint Load Test');
  console.log(`Target URL: ${__ENV.BASE_URL || 'http://localhost:58002'}/project1`);
}

// Teardown function (runs once at the end)
export function teardown() {
  console.log('✅ Project 1 Endpoint Load Test completed');
}