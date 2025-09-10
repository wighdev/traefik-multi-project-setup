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
- ✅ **Prometheus & Grafana Monitoring** - Complete observability stack
- ✅ **Metrics Collection** - Application and infrastructure monitoring
- ✅ **Alerting System** - Proactive issue detection

## Structure

```
traefik-multi-project-setup/
├── traefik-docker-compose.yml    # Traefik service
├── projects-docker-compose.yml   # All projects/applications
├── docker-compose.k6.yml         # k6 load testing service (optional)
├── docker-compose.monitoring.yml # Prometheus & Grafana monitoring stack
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
│       ├── test_root.js          # Root endpoint test (new format)
│       ├── test_jenkins.js       # Jenkins endpoint test (new format)
│       ├── test_project1.js      # Project 1 test (new format)
│       ├── test_project2.js      # Project 2 test (new format)
│       ├── test_dashboard.js     # Traefik dashboard test (new format)
│       ├── root-endpoint-test.js # Legacy format tests
│       ├── jenkins-endpoint-test.js
│       ├── project1-endpoint-test.js
│       ├── project2-endpoint-test.js
│       ├── traefik-dashboard-test.js
│       ├── full-system-test.js
│       └── example-custom-test.js
├── monitoring/                   # Monitoring configuration
│   └── prometheus.yml            # Prometheus configuration
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

5. **Optional: Start monitoring stack:**
   ```bash
   # Start Prometheus & Grafana monitoring
   docker compose -f docker-compose.monitoring.yml up -d
   
   # Access monitoring dashboards:
   # - Prometheus: http://YOUR_IP:58002/prometheus
   # - Grafana: http://YOUR_IP:58002/grafana (admin/admin)
   ```

6. **Optional: Run load testing:**
   ```bash
   # Check available tests
   ./run-k6-tests.sh --list
   
   # Run all k6 load tests
   ./run-k6-tests.sh
   ```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Dashboard | `http://YOUR_IP:58002/` | Landing page dengan akses ke semua services |
| Jenkins | `http://YOUR_IP:58002/jenkins` | CI/CD Pipeline (akses via IP) |
| Project 1 | `http://YOUR_IP:58002/project1` | Example Node.js application |
| Project 2 | `http://YOUR_IP:58002/project2` | Example Python/Django application |
| Traefik Dashboard | `http://YOUR_IP:58002/traefik` | Traefik monitoring dashboard |
| **Prometheus** | `http://YOUR_IP:58002/prometheus` | **Metrics collection & monitoring** |
| **Grafana** | `http://YOUR_IP:58002/grafana` | **Dashboard visualization & alerting** |

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

## Monitoring Stack dengan Prometheus dan Grafana

Repository ini menyediakan monitoring stack yang komprehensif menggunakan Prometheus untuk metrics collection dan Grafana untuk dashboard visualization, terintegrasi penuh dengan Traefik multi-project setup.

### Komponen Monitoring

#### 1. Prometheus
- **Fungsi**: Time-series database untuk metrics collection
- **Port**: Diakses via Traefik di `http://localhost:58002/prometheus`
- **Konfigurasi**: `monitoring/prometheus.yml`
- **Data**: Stored in Docker volume `prometheus_data`

#### 2. Grafana
- **Fungsi**: Dashboard visualization dan alerting
- **Port**: Diakses via Traefik di `http://localhost:58002/grafana`
- **Default Login**: admin / admin (akan diminta ganti password pertama kali)
- **Data**: Stored in Docker volume `grafana_data`

### Setup Monitoring

#### 1. Start Monitoring Stack

```bash
# Start Traefik dan projects terlebih dahulu
./manage.sh start

# Start monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Verifikasi services running
docker-compose -f docker-compose.monitoring.yml ps
```

#### 2. Akses Prometheus

```bash
# Buka browser ke:
http://localhost:58002/prometheus

# Atau gunakan curl untuk test
curl http://localhost:58002/prometheus/api/v1/status/config
```

#### 3. Akses Grafana

```bash
# Buka browser ke:
http://localhost:58002/grafana

# Login dengan:
Username: admin
Password: admin
```

### Konfigurasi Prometheus

File `monitoring/prometheus.yml` sudah dikonfigurasi untuk monitoring:

#### Target Metrics yang Dikumpulkan

1. **Traefik Metrics**
   - Response times dan status codes
   - Request rates per service
   - Backend health status
   - Load balancer metrics

2. **Application Metrics** (jika tersedia)
   - Project 1 (Node.js) metrics di `/metrics`
   - Project 2 (Python Flask) metrics di `/metrics`
   - Jenkins metrics di `/prometheus`

3. **System Metrics** (opsional)
   - Docker container metrics via cAdvisor
   - Node exporter untuk sistem metrics
   - Blackbox exporter untuk endpoint monitoring

#### Example Prometheus Queries

```promql
# HTTP request rate untuk semua services
rate(traefik_service_requests_total[5m])

# Response time percentiles
histogram_quantile(0.95, rate(traefik_service_request_duration_seconds_bucket[5m]))

# Error rate per service
rate(traefik_service_requests_total{code!~"2.."}[5m])

# Service availability
up{job="traefik"}
```

### Setup Grafana Dashboards

#### 1. Add Prometheus Data Source

Setelah login ke Grafana:

1. Go to **Configuration** → **Data Sources**
2. Click **Add data source**
3. Select **Prometheus**
4. Configure:
   ```
   Name: Prometheus
   URL: http://prometheus:9090
   Access: Server (default)
   ```
5. Click **Save & Test**

#### 2. Import Pre-built Dashboards

Grafana menyediakan dashboard siap pakai:

```bash
# Traefik Dashboard
Dashboard ID: 4475
URL: https://grafana.com/grafana/dashboards/4475

# Docker Container Monitoring
Dashboard ID: 193
URL: https://grafana.com/grafana/dashboards/193

# Node Exporter Dashboard
Dashboard ID: 1860
URL: https://grafana.com/grafana/dashboards/1860
```

**Cara Import:**
1. Di Grafana, go to **Dashboards** → **Import**
2. Enter Dashboard ID atau upload JSON file
3. Select Prometheus data source
4. Click **Import**

#### 3. Custom Dashboard untuk Traefik Multi-Project

Create dashboard dengan panels:

##### Panel 1: Request Rate
```promql
sum(rate(traefik_service_requests_total[5m])) by (service)
```

##### Panel 2: Response Times
```promql
histogram_quantile(0.95, 
  sum(rate(traefik_service_request_duration_seconds_bucket[5m])) by (service, le)
)
```

##### Panel 3: Error Rate
```promql
sum(rate(traefik_service_requests_total{code!~"2.."}[5m])) by (service)
```

##### Panel 4: Service Status
```promql
up{job="traefik"}
```

### Alerting Setup

#### 1. Configure Alert Notifications

Di Grafana:
1. Go to **Alerting** → **Notification channels**
2. Add channel (Email, Slack, WebHook, dll.)
3. Test notification

#### 2. Create Alerts

Example alert rules:

```yaml
# High Error Rate Alert
Alert Name: High Error Rate
Condition: 
  Query: sum(rate(traefik_service_requests_total{code!~"2.."}[5m])) by (service)
  Threshold: > 0.05 (5% error rate)

# High Response Time Alert  
Alert Name: Slow Response Time
Condition:
  Query: histogram_quantile(0.95, sum(rate(traefik_service_request_duration_seconds_bucket[5m])) by (le))
  Threshold: > 2 (2 seconds)

# Service Down Alert
Alert Name: Service Down
Condition:
  Query: up{job="traefik"}
  Threshold: < 1
```

### Advanced Monitoring Features

#### 1. Log Aggregation

Untuk centralized logging, tambahkan ke `docker-compose.monitoring.yml`:

```yaml
  loki:
    image: grafana/loki:latest
    container_name: loki
    ports:
      - "3100:3100"
    networks:
      - traefik-network

  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./monitoring/promtail.yml:/etc/promtail/config.yml
    networks:
      - traefik-network
```

#### 2. Metrics Export dari Applications

**Node.js (Project 1) - Express Metrics:**
```javascript
const prometheus = require('prom-client');
const express = require('express');

// Create metrics
const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Export metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

**Python Flask (Project 2) - Flask Metrics:**
```python
from prometheus_flask_exporter import PrometheusMetrics

app = Flask(__name__)
metrics = PrometheusMetrics(app)

# Metrics akan tersedia di /metrics endpoint
```

### Monitoring Commands

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Stop monitoring stack
docker-compose -f docker-compose.monitoring.yml down

# View monitoring logs
docker-compose -f docker-compose.monitoring.yml logs -f

# Backup Grafana data
docker run --rm -v prometheus_data:/data alpine tar czf - /data > prometheus_backup.tar.gz
docker run --rm -v grafana_data:/data alpine tar czf - /data > grafana_backup.tar.gz

# Restore Grafana data
docker run --rm -v grafana_data:/data alpine tar xzf - < grafana_backup.tar.gz
```

### Troubleshooting Monitoring

#### Prometheus tidak bisa scrape targets

```bash
# Check targets status
curl http://localhost:58002/prometheus/api/v1/targets

# Check network connectivity
docker exec prometheus ping traefik

# Check Prometheus config
docker exec prometheus cat /etc/prometheus/prometheus.yml
```

#### Grafana tidak bisa connect ke Prometheus

```bash
# Test connection dari Grafana container
docker exec grafana curl http://prometheus:9090/api/v1/status/config

# Check data source config di Grafana UI
# Configuration → Data Sources → Prometheus → Test
```

#### Missing Metrics

```bash
# Check if applications expose metrics
curl http://localhost:58002/project1/metrics
curl http://localhost:58002/project2/metrics

# Check Traefik metrics
curl http://localhost:8080/metrics  # Direct Traefik API
```

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

Repository ini sudah menyertakan test scripts untuk semua endpoints dalam dua format:

#### Format Baru (Recommended)
| Test Script | Description | Target Endpoint |
|-------------|-------------|-----------------|
| `test_root.js` | Test landing page performa dan content | `http://localhost:58002/` |
| `test_jenkins.js` | Test Jenkins accessibility dan response time | `http://localhost:58002/jenkins` |
| `test_project1.js` | Test Project 1 (Node.js) app performance | `http://localhost:58002/project1` |
| `test_project2.js` | Test Project 2 (Python) app performance | `http://localhost:58002/project2` |
| `test_dashboard.js` | Test Traefik dashboard accessibility | `http://localhost:58002/dashboard/` |

#### Format Legacy (Tetap Didukung)
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