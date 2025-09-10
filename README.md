# Traefik Multi-Project Setup

Konfigurasi Traefik untuk mengelola multiple Docker projects dengan akses port terbatas (hanya port 58002 dan 58003).

## Overview

Setup ini memungkinkan Anda menjalankan multiple project/aplikasi dengan hanya menggunakan 2 port yang diizinkan:
- Port 58002 (HTTP - port 80)
- Port 58003 (HTTPS - port 443)

## Fitur

- ✅ Multiple projects dalam satu infrastruktur
- ✅ Jenkins CI/CD accessible via IP tanpa domain
- ✅ Path-based routing untuk semua services
- ✅ Load balancing otomatis
- ✅ SSL/HTTPS support
- ✅ Dashboard monitoring
- ✅ Easy management scripts
- ✅ **k6 Load Testing Suite** - Comprehensive performance testing

## Structure

```
traefik-multi-project-setup/
├── traefik-docker-compose.yml    # Traefik service
├── projects-docker-compose.yml   # All projects/applications
├── docker-compose.k6.yml         # k6 load testing service (optional)
├── traefik.yml                   # Traefik main configuration
├── dynamic.yml                   # Dynamic routing configuration
├── setup.sh                      # Setup script
├── manage.sh                     # Management script
├── run-k6-tests.sh               # k6 load testing automation script
├── default-site/                 # Default landing page
│   └── index.html
├── project1/                     # Example project 1
├── project2/                     # Example project 2
├── tests/                        # Load testing suite
│   └── k6/                       # k6 test scripts
│       ├── root-endpoint-test.js
│       ├── jenkins-endpoint-test.js
│       ├── project1-endpoint-test.js
│       ├── project2-endpoint-test.js
│       ├── traefik-dashboard-test.js
│       ├── full-system-test.js
│       └── example-custom-test.js
└── README.md
```

## Quick Start

1. **Clone repository:**
   ```bash
   git clone https://github.com/wighdev/traefik-multi-project-setup.git
   cd traefik-multi-project-setup
   ```

2. **Setup:**
   ```bash
   chmod +x setup.sh manage.sh
   ./setup.sh
   ```

3. **Start services:**
   ```bash
   ./manage.sh start
   ```

4. **Access services:**
   - Dashboard: `http://YOUR_IP:58002/`
   - Jenkins: `http://YOUR_IP:58002/jenkins`
   - Project 1: `http://YOUR_IP:58002/project1`
   - Project 2: `http://YOUR_IP:58002/project2`
   - Traefik Dashboard: `http://YOUR_IP:58002/traefik`

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Dashboard | `http://YOUR_IP:58002/` | Landing page dengan akses ke semua services |
| Jenkins | `http://YOUR_IP:58002/jenkins` | CI/CD Pipeline (akses via IP) |
| Project 1 | `http://YOUR_IP:58002/project1` | Example Node.js application |
| Project 2 | `http://YOUR_IP:58002/project2` | Example Python/Django application |
| Traefik Dashboard | `http://YOUR_IP:58002/traefik` | Traefik monitoring dashboard |

## Adding New Project

1. Edit `projects-docker-compose.yml` dan tambahkan service baru:

```yaml
  project3-app:
    image: your-app-image
    container_name: project3-app
    restart: unless-stopped
    networks:
      - traefik-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.project3.rule=PathPrefix(`/project3`)"
      - "traefik.http.routers.project3.service=project3"
      - "traefik.http.services.project3.loadbalancer.server.port=YOUR_APP_PORT"
      - "traefik.http.middlewares.project3-stripprefix.stripprefix.prefixes=/project3"
      - "traefik.http.routers.project3.middlewares=project3-stripprefix"
```

2. Update `default-site/index.html` untuk menambahkan link ke project baru

3. Restart services:
   ```bash
   ./manage.sh restart
   ```

## Management Commands

```bash
./manage.sh start      # Start all services
./manage.sh stop       # Stop all services  
./manage.sh restart    # Restart all services
./manage.sh logs       # Show logs for specific service
./manage.sh status     # Show status of all services
```

## Configuration Files

### traefik.yml
Main Traefik configuration dengan entrypoints, providers, dan certificate resolvers.

### dynamic.yml  
Dynamic routing configuration untuk semua services, middlewares, dan load balancers.

### docker-compose files
- `traefik-docker-compose.yml` - Traefik reverse proxy
- `projects-docker-compose.yml` - All application services

## Security

- Basic auth untuk Traefik dashboard
- CORS middleware tersedia
- SSL/HTTPS support dengan Let's Encrypt
- Isolated Docker networks

## Troubleshooting

### Port sudah digunakan
```bash
sudo lsof -i :58002
sudo lsof -i :58003
```

### Container tidak bisa diakses
```bash
docker network inspect traefik-network
./manage.sh logs traefik
```

### Jenkins prefix issues
Pastikan JENKINS_OPTS sudah set dengan `--prefix=/jenkins`

## Load Testing dengan k6

Repository ini dilengkapi dengan comprehensive load testing suite menggunakan k6, sebuah modern load testing tool yang powerful dan mudah digunakan.

### Apa itu k6?

[k6](https://k6.io/) adalah open-source load testing tool yang dikembangkan oleh Grafana Labs. k6 memungkinkan Anda untuk:

- ✅ Menulis test scripts menggunakan JavaScript ES6+
- ✅ Melakukan load testing dengan berbagai skenario
- ✅ Mengukur performance metrics (response time, throughput, error rate)
- ✅ Mendukung protokol HTTP/1.1, HTTP/2, WebSockets, dan gRPC
- ✅ Terintegrasi dengan CI/CD pipelines
- ✅ Menyediakan hasil yang detail dan mudah dipahami

## UI Testing dengan Playwright

Repository ini juga dilengkapi dengan comprehensive UI testing framework menggunakan Playwright untuk end-to-end testing yang reliable dan powerful.

### Apa itu Playwright?

[Playwright](https://playwright.dev/) adalah modern end-to-end testing framework yang dikembangkan oleh Microsoft. Playwright memungkinkan Anda untuk:

- ✅ Test pada multiple browsers (Chromium, Firefox, Safari)
- ✅ Cross-platform testing (Windows, Linux, macOS)
- ✅ Auto-wait untuk elements tanpa flaky tests
- ✅ Network interception dan mocking
- ✅ Screenshots dan video recording
- ✅ Parallel test execution
- ✅ Terintegrasi dengan CI/CD pipelines

### Struktur UI Testing

```
tests/
├── ui/                          # UI test files
│   ├── connection.test.js       # Service connection tests
│   ├── routing.test.js          # Routing and navigation tests
│   ├── health-checks.test.js    # Health check endpoint tests
│   └── functionality.test.js    # Basic functionality tests
├── fixtures/                    # Test data and fixtures
│   └── test-data.json          # Common test data
├── support/                     # Helper functions and utilities
│   ├── test-helpers.js         # Common test helper functions
│   ├── global-setup.js         # Global test setup
│   ├── global-teardown.js      # Global test teardown
│   └── nginx.conf              # Test report server configuration
└── k6/                         # k6 load tests (existing)
```

### Quick Start UI Testing

1. **Install Dependencies:**
   ```bash
   npm install
   npm run install:browsers
   ```

2. **Run UI Tests:**
   ```bash
   # Run all tests
   ./run-ui-tests.sh
   
   # Run with browser GUI (for debugging)
   ./run-ui-tests.sh test:headed
   
   # Run specific browser
   ./run-ui-tests.sh test:browser chromium
   
   # Run and stop services after
   ./run-ui-tests.sh --stop
   ```

3. **View Test Results:**
   ```bash
   npm run test:ui:report
   ```

### Available UI Tests

| Test File | Description | Coverage |
|-----------|-------------|----------|
| `connection.test.js` | Tests service connectivity through Traefik | Dashboard, Project1, Project2, Jenkins, Traefik dashboard |
| `routing.test.js` | Tests routing between services and deep linking | URL routing, navigation, session persistence |
| `health-checks.test.js` | Tests service health and performance | Response times, error handling, CORS |
| `functionality.test.js` | Tests basic functionality of each service | Interactive elements, API endpoints, responsive design |

### Menjalankan UI Tests

#### 1. Menggunakan Script Otomatis (Recommended)

```bash
# Pastikan services sudah running (atau script akan start otomatis)
./manage.sh start

# Run all UI tests
./run-ui-tests.sh

# Run dengan opsi debugging
./run-ui-tests.sh test:headed

# Run pada browser specific
./run-ui-tests.sh test:browser firefox

# Run test file specific
./run-ui-tests.sh test:specific connection

# Check prerequisites dan service status
./run-ui-tests.sh --check

# Show help
./run-ui-tests.sh help
```

#### 2. Manual Testing dengan npm

```bash
# Install dependencies
npm install
npm run install:browsers

# Start services jika belum running
npm run start:testing

# Run tests
npm run test:ui                # All tests
npm run test:ui:headed         # With browser GUI
npm run test:ui:debug          # Debug mode

# View results
npm run test:ui:report
```

#### 3. Docker-based Testing

```bash
# Run tests in Docker container
docker compose -f docker-compose.testing.yml --profile ui-testing up --build

# View test reports
docker compose -f docker-compose.testing.yml --profile reporting up -d
# Then access http://localhost:58002/test-reports
```

### Memahami Hasil Test Playwright

#### Test Reports

Playwright menyediakan beberapa format report:

1. **HTML Report** (default): Interactive report dengan screenshots dan traces
2. **JSON Report**: Machine-readable results untuk CI/CD
3. **JUnit XML**: Untuk integrasi dengan test management tools

#### Key Metrics

```
Running 25 tests using 1 worker
  25 passed (30s)
  
✓ Service Connection Tests (4 tests)
✓ Service Routing Tests (8 tests)  
✓ Health Check Tests (6 tests)
✓ Service Functionality Tests (7 tests)
```

**Interpretation:**
- **Passed Tests**: Semua tests berhasil dijalankan
- **Duration**: Total waktu execution
- **Screenshots**: Automatic pada test failures
- **Videos**: Recording pada test failures

### Browser Support Matrix

| Browser | Status | Mobile Support | Notes |
|---------|--------|---------------|-------|
| Chromium | ✅ | ✅ | Primary test browser |
| Firefox | ✅ | ❌ | Desktop only |
| Safari (WebKit) | ✅ | ✅ | Cross-platform |
| Edge | ✅ | ❌ | Windows/macOS |

### Test Scenarios Coverage

#### Connection Tests
- ✅ Main dashboard accessibility
- ✅ Project 1 (Node.js) through Traefik
- ✅ Project 2 (Python) through Traefik
- ✅ Jenkins accessibility
- ✅ Traefik dashboard access

#### Routing Tests
- ✅ Navigation between services
- ✅ Deep linking support
- ✅ URL parameters handling
- ✅ Session persistence
- ✅ Error handling (404s)
- ✅ Trailing slash consistency

#### Health Checks
- ✅ Service availability verification
- ✅ Response time monitoring
- ✅ Load testing (concurrent requests)
- ✅ Security headers validation
- ✅ CORS configuration
- ✅ SSL/TLS readiness

#### Functionality Tests
- ✅ Dashboard navigation
- ✅ Project 1 interactive elements
- ✅ Project 2 form handling
- ✅ Jenkins UI elements
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Cross-browser compatibility
- ✅ JavaScript functionality

### Membuat UI Test Baru

#### 1. Create Test File

```bash
# Copy existing test as template
cp tests/ui/connection.test.js tests/ui/my-new-test.js
```

#### 2. Edit Test Structure

```javascript
const { test, expect } = require('@playwright/test');
const { waitForPageLoad, SERVICES } = require('../support/test-helpers.js');

test.describe('My New Test Suite', () => {
  test('should test my new feature', async ({ page }) => {
    await test.step('Navigate to service', async () => {
      await page.goto(SERVICES.project1);
      await waitForPageLoad(page);
    });

    await test.step('Test specific functionality', async () => {
      // Your test logic here
      expect(page.url()).toContain('/project1');
    });
  });
});
```

#### 3. Add Test Data

Update `tests/fixtures/test-data.json`:

```json
{
  "myNewFeature": {
    "expectedElements": ["Button", "Form"],
    "testData": {
      "inputValue": "test-data"
    }
  }
}
```

#### 4. Update Helper Functions

Add new helpers to `tests/support/test-helpers.js` if needed:

```javascript
async function myNewHelper(page, selector) {
  // Helper function implementation
}

module.exports = {
  // ... existing exports
  myNewHelper
};
```

### CI/CD Integration

UI tests terintegrasi dengan GitHub Actions workflow yang akan:

1. **Automatic Testing**: Run pada setiap push dan PR
2. **Multi-Browser**: Test pada Chromium, Firefox, dan WebKit
3. **Parallel Execution**: Tests run dalam parallel untuk efficiency
4. **Artifact Collection**: Screenshots, videos, dan reports
5. **Performance Baseline**: Check performance regression

#### GitHub Actions Workflow

File `.github/workflows/ui-tests.yml` menghandle:

- ✅ Dependency installation
- ✅ Service startup dan health checks
- ✅ Multi-browser test execution
- ✅ Test report generation
- ✅ Artifact upload (screenshots, videos, logs)
- ✅ Cleanup dan service shutdown

### Configuration Files

#### playwright.config.js

Main configuration file yang mengatur:

```javascript
module.exports = defineConfig({
  testDir: './tests/ui',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['json'], ['junit']],
  use: {
    baseURL: 'http://localhost:58002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

#### docker-compose.testing.yml

Docker setup untuk testing environment:

- **playwright-tests**: Service untuk menjalankan Playwright tests
- **test-reporter**: Nginx server untuk test reports
- **test-data-generator**: Utility untuk generate test data

### Best Practices UI Testing

1. **Page Object Model**: Organize tests dengan page objects
2. **Wait Strategies**: Gunakan smart waits, avoid hard delays  
3. **Test Isolation**: Setiap test harus independent
4. **Data Management**: Use fixtures untuk test data
5. **Screenshot Strategy**: Ambil screenshots pada failures
6. **Retry Logic**: Configure retries untuk flaky tests
7. **Parallel Execution**: Run tests dalam parallel ketika possible

### Troubleshooting UI Tests

#### Test Gagal dengan Timeout

```bash
# Check service status
./manage.sh status

# Check service logs
./manage.sh logs

# Run single test untuk debugging
./run-ui-tests.sh test:debug
```

#### Browser Installation Issues

```bash
# Reinstall browsers
npx playwright install --force

# Check browser installation
npx playwright install --dry-run
```

#### Service Tidak Accessible

```bash
# Check network connectivity
curl http://localhost:58002/

# Check Docker network
docker network inspect traefik-network

# Restart services
./manage.sh restart
```

#### CI/CD Pipeline Failures

1. Check GitHub Actions logs
2. Download test artifacts dari failed runs
3. Review screenshots dan videos
4. Check service logs artifacts

### Advanced Configuration

#### Parallel Test Execution

```javascript
// playwright.config.js
module.exports = defineConfig({
  workers: process.env.CI ? 1 : undefined, // Adjust for CI
  fullyParallel: true,
  // ...
});
```

#### Custom Test Reporting

```bash
# Generate custom reports
npx playwright test --reporter=line,html,json

# Merge reports dari multiple runs
npx playwright merge-reports --reporter html ./all-blob-reports
```

#### Environment-Specific Configuration

```bash
# Test against different environments
BASE_URL=http://staging.example.com npx playwright test

# Use environment-specific config
npx playwright test --config=playwright.staging.config.js
```

- ✅ Menulis test scripts menggunakan JavaScript ES6+
- ✅ Melakukan load testing dengan berbagai skenario
- ✅ Mengukur performance metrics (response time, throughput, error rate)
- ✅ Mendukung protokol HTTP/1.1, HTTP/2, WebSockets, dan gRPC
- ✅ Terintegrasi dengan CI/CD pipelines
- ✅ Menyediakan hasil yang detail dan mudah dipahami

### Instalasi k6

#### Opsi 1: Direct Installation

**MacOS:**
```bash
brew install k6
```

**Ubuntu/Debian:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**
```bash
# Using Chocolatey
choco install k6

# Or using Windows Package Manager
winget install k6
```

#### Opsi 2: Docker (Recommended untuk CI/CD)

```bash
# Run individual test
docker run --rm -i grafana/k6:latest run - < tests/k6/root-endpoint-test.js

# Run with network access to services
docker run --rm -i --network traefik-network grafana/k6:latest run -e BASE_URL=http://traefik:80 - < tests/k6/root-endpoint-test.js
```

### Test Scripts yang Tersedia

Repository ini sudah menyertakan test scripts untuk semua endpoints:

| Test Script | Description | Target Endpoint |
|-------------|-------------|-----------------|
| `root-endpoint-test.js` | Test landing page performa dan content | `http://localhost:58002/` |
| `jenkins-endpoint-test.js` | Test Jenkins accessibility dan response time | `http://localhost:58002/jenkins` |
| `project1-endpoint-test.js` | Test Project 1 (Node.js) app performance | `http://localhost:58002/project1` |
| `project2-endpoint-test.js` | Test Project 2 (Python) app performance | `http://localhost:58002/project2` |
| `traefik-dashboard-test.js` | Test Traefik dashboard accessibility | `http://localhost:58002/dashboard/` |
| `full-system-test.js` | Comprehensive user journey test across all services | All endpoints |
| `example-custom-test.js` | Template untuk membuat custom test baru | Custom endpoint |

### Cara Menjalankan Load Testing

#### 1. Menggunakan Script Otomatis (Recommended)

```bash
# Pastikan services sudah running
./manage.sh start

# Run all k6 tests
./run-k6-tests.sh

# Run specific test
./run-k6-tests.sh root-endpoint-test.js

# Check prerequisites dan service status
./run-k6-tests.sh --check

# List available tests
./run-k6-tests.sh --list

# Show help
./run-k6-tests.sh --help
```

#### 2. Manual Testing

```bash
# Test specific endpoint
k6 run --env BASE_URL=http://localhost:58002 tests/k6/root-endpoint-test.js

# Test remote instance
k6 run --env BASE_URL=http://192.168.1.100:58002 tests/k6/project1-endpoint-test.js

# Run with custom VU (Virtual Users) and duration
k6 run --vus 20 --duration 60s tests/k6/full-system-test.js
```

#### 3. Docker-based Testing

```bash
# Start k6 testing service
docker-compose -f docker-compose.k6.yml --profile testing up k6

# Run specific test in container
docker run --rm -i \
  --network traefik-network \
  -v $(pwd)/tests/k6:/tests \
  grafana/k6:latest run \
  --env BASE_URL=http://traefik:80 \
  /tests/root-endpoint-test.js
```

### Memahami Hasil Test k6

#### Key Metrics

k6 menyediakan berbagai metrics penting:

```
✓ http_req_duration..............: avg=125.32ms min=89.21ms med=118.45ms max=287.91ms p(90)=156.78ms p(95)=198.32ms
✓ http_req_failed................: 0.00%   ✓ 0        ✗ 847
✓ http_reqs......................: 847     14.112041/s
✓ iteration_duration.............: avg=1.13s   min=1.09s   med=1.12s   max=1.29s   p(90)=1.16s   p(95)=1.2s
✓ iterations.....................: 847     14.112041/s
✓ vus............................: 15      min=15     max=15
✓ vus_max........................: 15      min=15     max=15
```

**Penjelasan Metrics:**

- **http_req_duration**: Response time dari HTTP requests
  - `avg`: Rata-rata response time
  - `p(95)`: 95% requests selesai dalam waktu ini (target: < 500ms untuk web apps)
- **http_req_failed**: Persentase request yang gagal (target: < 2%)
- **http_reqs**: Total requests dan throughput per detik
- **vus**: Number of Virtual Users (concurrent users)

#### Contoh Interpretasi Hasil

**✅ Good Performance:**
```
http_req_duration: p(95)=245ms  # 95% requests < 500ms
http_req_failed: 0.12%          # Error rate < 2%
http_reqs: 28.5/s               # Good throughput
```

**⚠️ Performance Issues:**
```
http_req_duration: p(95)=1.2s   # Slow response times
http_req_failed: 5.8%           # High error rate
http_reqs: 8.2/s                # Low throughput
```

### Load Testing Scenarios

Setiap test script menggunakan skenario load yang berbeda:

#### 1. Ramp-up Testing
```javascript
stages: [
  { duration: '30s', target: 5 },   // Gradually increase to 5 users
  { duration: '1m', target: 10 },   // Sustain 10 users for 1 minute  
  { duration: '20s', target: 0 },   // Ramp down
]
```

#### 2. Spike Testing
```javascript
stages: [
  { duration: '10s', target: 2 },   // Normal load
  { duration: '30s', target: 50 },  // Sudden spike
  { duration: '10s', target: 2 },   // Back to normal
]
```

#### 3. Stress Testing
```javascript
stages: [
  { duration: '2m', target: 10 },   // Normal load
  { duration: '5m', target: 20 },   // Above normal
  { duration: '2m', target: 30 },   // High load
  { duration: '5m', target: 40 },   // Stress level
]
```

### Membuat Test k6 Baru

#### 1. Copy Template

```bash
cp tests/k6/example-custom-test.js tests/k6/my-new-test.js
```

#### 2. Edit Test Script

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 5 },  // Customize load pattern
    { duration: '40s', target: 5 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Set performance thresholds
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:58002';
  
  // Test your specific endpoint
  const response = http.get(`${baseUrl}/your-new-endpoint`);
  
  // Add custom validations
  check(response, {
    'status is 200': (r) => r.status === 200,
    'contains expected text': (r) => r.body.includes('expected-content'),
    'response time OK': (r) => r.timings.duration < 1000,
  });
  
  sleep(1);
}
```

#### 3. Tambahkan ke Script Runner

Edit `run-k6-tests.sh` dan tambahkan test baru ke array `TEST_FILES`:

```bash
declare -a TEST_FILES=(
    "root-endpoint-test.js"
    "project1-endpoint-test.js"
    "project2-endpoint-test.js"
    "jenkins-endpoint-test.js" 
    "traefik-dashboard-test.js"
    "full-system-test.js"
    "my-new-test.js"  # <-- Add your new test here
)
```

#### 4. Update Descriptions

```bash
declare -A TEST_DESCRIPTIONS=(
    ["my-new-test.js"]="My Custom Endpoint Test"  # <-- Add description
    # ... other descriptions
)
```

### Advanced Setup dengan InfluxDB + Grafana

Untuk monitoring dan visualisasi hasil test yang lebih advanced:

#### 1. Start Advanced Testing Stack

```bash
# Start InfluxDB + Grafana + k6
docker-compose -f docker-compose.k6.yml --profile testing-advanced up -d
```

#### 2. Run Test dengan Output ke InfluxDB

```bash
k6 run --out influxdb=http://localhost:8086/k6 tests/k6/full-system-test.js
```

#### 3. View Results di Grafana

- URL: `http://localhost:3000` atau `http://localhost:58002/grafana`
- Username: `admin`
- Password: `admin123`

### CI/CD Integration

Integrate k6 testing ke pipeline CI/CD:

```yaml
# Example GitHub Actions
- name: Run k6 Load Tests
  run: |
    # Start services
    ./manage.sh start
    
    # Wait for services to be ready
    sleep 30
    
    # Run load tests
    ./run-k6-tests.sh
    
    # Check if any test failed
    if [ $? -ne 0 ]; then
      echo "Load tests failed!"
      exit 1
    fi
```

### Best Practices

1. **Start Small**: Mulai dengan load rendah, kemudian tingkatkan secara bertahap
2. **Set Realistic Thresholds**: Sesuaikan threshold dengan ekspektasi aplikasi
3. **Test Regularly**: Jalankan load test secara regular untuk detect performance regression
4. **Monitor Resources**: Monitor CPU, Memory, dan Disk I/O selama testing
5. **Test Different Scenarios**: User journey, API endpoints, static assets, dll.
6. **Environment Parity**: Test di environment yang mirip dengan production

### Troubleshooting Load Tests

#### Test Gagal dengan Error Connection

```bash
# Check if services are running
./manage.sh status

# Check network connectivity
curl http://localhost:58002/

# Check Docker network
docker network inspect traefik-network
```

#### Performance Rendah

```bash
# Check resource usage
docker stats

# Check logs for errors
./manage.sh logs traefik
./manage.sh logs project1-app
```

#### k6 Installation Issues

```bash
# Verify installation
k6 version

# Check PATH
which k6

# Use Docker alternative
docker run --rm grafana/k6:latest version
```

## Examples

Repository ini sudah include example projects:
- **Project 1**: Node.js application example
- **Project 2**: Python/Django application example  
- **Default Site**: Simple dashboard HTML

## License

MIT License - silakan digunakan dan dimodifikasi sesuai kebutuhan.