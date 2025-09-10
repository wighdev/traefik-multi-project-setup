import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const requestCount = new Counter('total_requests');

export const options = {
  stages: [
    { duration: '30s', target: 5 }, // Ramp up
    { duration: '2m', target: 10 }, // Sustained load
    { duration: '30s', target: 15 }, // Peak load
    { duration: '30s', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.05'], // Error rate should be less than 5%
    errors: ['rate<0.05'],
    total_requests: ['count>100'], // Ensure we make at least 100 requests total
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:58002';
  
  // Test all endpoints in sequence to simulate user journey
  group('Full System Journey', function () {
    
    // 1. Start at landing page
    group('Landing Page', function () {
      const response = http.get(`${baseUrl}/`);
      requestCount.add(1);
      
      const success = check(response, {
        'root: status is 200': (r) => r.status === 200,
        'root: contains dashboard': (r) => r.body.includes('Dashboard'),
        'root: response time < 1000ms': (r) => r.timings.duration < 1000,
      });
      
      errorRate.add(!success);
      sleep(1);
    });
    
    // 2. Navigate to Project 1
    group('Project 1 Navigation', function () {
      const response = http.get(`${baseUrl}/project1`);
      requestCount.add(1);
      
      const success = check(response, {
        'project1: status is 200': (r) => r.status === 200,
        'project1: contains Node.js': (r) => r.body.toLowerCase().includes('node.js'),
        'project1: response time < 1000ms': (r) => r.timings.duration < 1000,
      });
      
      errorRate.add(!success);
      sleep(2);
      
      // Test API endpoint
      const apiResponse = http.get(`${baseUrl}/project1/api/status`);
      requestCount.add(1);
      check(apiResponse, {
        'project1 API: status is 200': (r) => r.status === 200,
      });
    });
    
    // 3. Navigate to Project 2
    group('Project 2 Navigation', function () {
      const response = http.get(`${baseUrl}/project2`);
      requestCount.add(1);
      
      const success = check(response, {
        'project2: status is 200': (r) => r.status === 200,
        'project2: response time < 1500ms': (r) => r.timings.duration < 1500,
      });
      
      errorRate.add(!success);
      sleep(2);
    });
    
    // 4. Check Jenkins (might require auth)
    group('Jenkins Access', function () {
      const response = http.get(`${baseUrl}/jenkins`);
      requestCount.add(1);
      
      const success = check(response, {
        'jenkins: status is 200 or 403': (r) => r.status === 200 || r.status === 403,
        'jenkins: response time < 3000ms': (r) => r.timings.duration < 3000,
      });
      
      // Don't count auth-required as errors
      if (response.status !== 403) {
        errorRate.add(!success);
      }
      sleep(1);
    });
    
    // 5. Check Traefik dashboard
    group('Traefik Dashboard', function () {
      const response = http.get(`${baseUrl}/dashboard/`);
      requestCount.add(1);
      
      const success = check(response, {
        'traefik: status is 200 or 401': (r) => r.status === 200 || r.status === 401,
        'traefik: response time < 2000ms': (r) => r.timings.duration < 2000,
      });
      
      // Don't count auth-required as errors
      if (response.status !== 401) {
        errorRate.add(!success);
      }
      sleep(1);
    });
  });
  
  // Random endpoint selection for load variety
  const endpoints = ['/', '/project1', '/project2'];
  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  
  group('Random Endpoint Load', function () {
    const response = http.get(`${baseUrl}${randomEndpoint}`);
    requestCount.add(1);
    
    check(response, {
      'random endpoint: status is 2xx': (r) => r.status >= 200 && r.status < 300,
      'random endpoint: response time < 1000ms': (r) => r.timings.duration < 1000,
    });
  });
  
  // Think time between iterations
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

// Setup function
export function setup() {
  console.log('🚀 Starting Full System Load Test');
  console.log(`Target Base URL: ${__ENV.BASE_URL || 'http://localhost:58002'}`);
  console.log('Testing complete user journey across all services...');
  
  // Verify system is running
  const baseUrl = __ENV.BASE_URL || 'http://localhost:58002';
  const healthCheck = http.get(`${baseUrl}/`, { timeout: '10s' });
  
  if (healthCheck.status !== 200) {
    console.error('⚠️  Warning: System may not be fully ready. Root endpoint returned:', healthCheck.status);
  } else {
    console.log('✅ System health check passed');
  }
}

// Teardown function
export function teardown(data) {
  console.log('✅ Full System Load Test completed');
  console.log('📊 Test Summary:');
  console.log('   - Tested complete user journey flow');
  console.log('   - Validated all major endpoints');
  console.log('   - Measured performance under sustained load');
}