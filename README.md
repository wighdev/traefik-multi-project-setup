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

## Structure

```
traefik-multi-project-setup/
├── traefik-docker-compose.yml    # Traefik service
├── projects-docker-compose.yml   # All projects/applications
├── docker-compose.k6.yml         # k6 load testing service (optional)
├── docker-compose.monitoring.yml # Monitoring stack (Prometheus/Grafana)
├── traefik.yml                   # Traefik main configuration
├── dynamic.yml                   # Dynamic routing configuration
├── setup.sh                      # Setup script
├── manage.sh                     # Management script
├── run-k6-tests.sh               # k6 load testing automation script
├── default-site/                 # Default landing page
│   └── index.html
├── project1/                     # Example project 1
├── project2/                     # Example project 2
├── monitoring/                   # Monitoring configuration
│   ├── prometheus.yml            # Prometheus configuration
│   ├── alertmanager.yml          # AlertManager configuration
│   └── grafana/                  # Grafana provisioning
│       ├── provisioning/         # Auto-provisioning configs
│       │   ├── datasources/      # Data source configs
│       │   └── dashboards/       # Dashboard configs
│       └── dashboards/           # Pre-built dashboards
│           ├── traefik-dashboard.json
│           ├── docker-containers-dashboard.json
│           └── system-resources-dashboard.json
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

5. **Start monitoring (optional):**
   ```bash
   ./manage.sh monitoring start
   ```
   - Grafana: `http://monitoring.localhost:58002/` (admin/admin123)
   - Prometheus: `http://prometheus.localhost:58002/`

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Dashboard | `http://YOUR_IP:58002/` | Landing page dengan akses ke semua services |
| Jenkins | `http://YOUR_IP:58002/jenkins` | CI/CD Pipeline (akses via IP) |
| Project 1 | `http://YOUR_IP:58002/project1` | Example Node.js application |
| Project 2 | `http://YOUR_IP:58002/project2` | Example Python/Django application |
| Traefik Dashboard | `http://YOUR_IP:58002/traefik` | Traefik monitoring dashboard |

### Monitoring Services

| Service | URL | Description |
|---------|-----|-------------|
| Grafana | `http://monitoring.localhost:58002/` | Monitoring dashboards dan visualization |
| Prometheus | `http://prometheus.localhost:58002/` | Metrics collection dan querying |
| AlertManager | `http://alerts.localhost:58002/` | Alert notifications (optional) |

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

## Monitoring System dengan Prometheus & Grafana

Repository ini dilengkapi dengan sistem monitoring lengkap menggunakan Prometheus untuk metrics collection dan Grafana untuk visualization dashboard.

### Apa itu Monitoring Stack?

**Prometheus** adalah open-source monitoring system yang powerful untuk:
- ✅ Collecting time-series metrics dari berbagai services
- ✅ Alerting berdasarkan kondisi metrics tertentu  
- ✅ Querying data dengan PromQL (Prometheus Query Language)
- ✅ Service discovery dan auto-configuration

**Grafana** adalah visualization platform untuk:
- ✅ Creating beautiful dashboards dan charts
- ✅ Real-time monitoring dan alerting
- ✅ Multiple data sources support
- ✅ User management dan sharing capabilities

### Quick Start Monitoring

#### 1. Start Core Monitoring Services

```bash
# Start Traefik dan applications terlebih dahulu
./manage.sh start

# Start monitoring stack (Prometheus + Grafana)
./manage.sh monitoring start
```

#### 2. Access Monitoring Dashboards

- **📈 Grafana Dashboard**: `http://monitoring.localhost:58002/`
  - Username: `admin`
  - Password: `admin123`
- **📊 Prometheus**: `http://prometheus.localhost:58002/`

> **Note**: Untuk akses subdomain, tambahkan entri ke `/etc/hosts`:
> ```bash
> echo "127.0.0.1 monitoring.localhost prometheus.localhost alerts.localhost" | sudo tee -a /etc/hosts
> ```

### Pre-built Dashboards

Repository sudah include 3 dashboard siap pakai:

#### 1. Traefik Dashboard
Monitor reverse proxy performance:
- **Request Rate**: Total requests per second per service
- **Response Time**: P50, P95, P99 latency metrics
- **HTTP Status Codes**: Success/error rate breakdown
- **Active Services**: Health status dari semua services

#### 2. Docker Containers Dashboard
Monitor container resource usage:
- **CPU Usage**: Per-container CPU utilization
- **Memory Usage**: RAM consumption per container
- **Network I/O**: Incoming/outgoing traffic
- **Running Containers**: Total active containers

#### 3. System Resources Dashboard
Monitor host system metrics:
- **System Load**: 1m, 5m, 15m load averages
- **CPU Usage**: Overall system CPU utilization
- **Memory Usage**: System RAM usage percentage
- **Disk Usage**: Filesystem usage per mount point
- **Network Traffic**: Host network throughput

### Monitoring Management Commands

```bash
# Core monitoring
./manage.sh monitoring start      # Start Prometheus + Grafana
./manage.sh monitoring stop       # Stop all monitoring services
./manage.sh monitoring restart    # Restart monitoring stack

# Optional monitoring services
./manage.sh monitoring alertmanager     # Start AlertManager
./manage.sh monitoring node-metrics     # Start Node Exporter (system metrics)
./manage.sh monitoring container-metrics # Start cAdvisor (container metrics)

# Monitoring logs
./manage.sh monitoring logs prometheus
./manage.sh monitoring logs grafana
./manage.sh monitoring logs alertmanager
```

### Advanced Monitoring Setup

#### 1. Enable System Metrics (Node Exporter)

```bash
# Start Node Exporter untuk system-level metrics
./manage.sh monitoring node-metrics

# Metrics yang tersedia:
# - CPU, Memory, Disk, Network usage
# - System load, uptime, filesystem stats
# - Hardware temperature (jika tersedia)
```

#### 2. Enable Container Metrics (cAdvisor)

```bash
# Start cAdvisor untuk detailed container metrics
./manage.sh monitoring container-metrics

# Metrics yang tersedia:
# - Per-container resource usage
# - Container lifecycle events
# - Docker daemon metrics
```

#### 3. Enable AlertManager untuk Notifications

```bash
# Start AlertManager
./manage.sh monitoring alertmanager

# Access AlertManager
open http://alerts.localhost:58002/
```

### Metrics yang Dikumpulkan

#### Traefik Metrics
- `traefik_service_requests_total` - Total HTTP requests
- `traefik_service_request_duration_seconds` - Request latency
- `traefik_service_server_up` - Backend health status
- `traefik_entrypoint_requests_total` - Requests per entrypoint

#### Docker Metrics (cAdvisor)
- `container_cpu_usage_seconds_total` - Container CPU usage
- `container_memory_usage_bytes` - Container memory usage
- `container_network_receive_bytes_total` - Network RX
- `container_network_transmit_bytes_total` - Network TX

#### System Metrics (Node Exporter)
- `node_cpu_seconds_total` - Host CPU usage
- `node_memory_MemTotal_bytes` - Total system memory
- `node_filesystem_size_bytes` - Filesystem capacity
- `node_load1`, `node_load5`, `node_load15` - System load

### Custom Dashboards

#### Membuat Dashboard Baru

1. **Access Grafana**: `http://monitoring.localhost:58002/`
2. **Login**: admin / admin123
3. **Create Dashboard**: Click "+" → "Dashboard"
4. **Add Panel**: Click "Add new panel"
5. **Configure Query**: Pilih Prometheus sebagai data source

#### Example PromQL Queries

```promql
# Request rate per service (last 5 minutes)
sum(rate(traefik_service_requests_total[5m])) by (service)

# Response time P95 per service
histogram_quantile(0.95, sum(rate(traefik_service_request_duration_seconds_bucket[5m])) by (service, le))

# Error rate (4xx + 5xx responses)
sum(rate(traefik_service_requests_total{code=~"4..|5.."}[5m])) / sum(rate(traefik_service_requests_total[5m]))

# Container CPU usage
rate(container_cpu_usage_seconds_total{name!=""}[5m]) * 100

# Container memory usage
container_memory_usage_bytes{name!=""} / 1024 / 1024
```

### Alerting Configuration

#### Setup Email Alerts

1. **Edit AlertManager config**: `monitoring/alertmanager.yml`

```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'your-email@gmail.com'

receivers:
  - name: 'email-notifications'
    email_configs:
      - to: 'admin@your-domain.com'
        subject: '🚨 Alert: {{ .GroupLabels.alertname }}'
        body: |
          {{ range .Alerts }}
          **Alert**: {{ .Annotations.summary }}
          **Description**: {{ .Annotations.description }}
          **Severity**: {{ .Labels.severity }}
          {{ end }}
```

2. **Create Alert Rules**: `monitoring/alert_rules.yml`

```yaml
groups:
  - name: traefik_alerts
    rules:
      - alert: HighErrorRate
        expr: sum(rate(traefik_service_requests_total{code=~"5.."}[5m])) / sum(rate(traefik_service_requests_total[5m])) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is above 10% for 5 minutes"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, sum(rate(traefik_service_request_duration_seconds_bucket[5m])) by (service, le)) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is above 1s"
```

### Monitoring Best Practices

#### 1. Dashboard Organization
- **Overview Dashboard**: Key metrics untuk quick health check
- **Detailed Dashboards**: Per-service deep dive
- **Alerting Dashboard**: Active alerts dan silence status

#### 2. Alert Configuration
- **Progressive Severity**: warning → critical → emergency
- **Meaningful Thresholds**: Berdasarkan SLA requirements
- **Alert Fatigue Prevention**: Avoid noisy, low-value alerts

#### 3. Data Retention
- **Short-term**: High resolution (15s) untuk 7 days
- **Long-term**: Lower resolution (5m) untuk 90 days
- **Archive**: Critical metrics untuk compliance

### Troubleshooting Monitoring

#### Prometheus Not Scraping Targets

```bash
# Check target status
curl http://prometheus.localhost:58002/api/v1/targets

# Check network connectivity
./manage.sh monitoring logs prometheus

# Restart monitoring stack
./manage.sh monitoring restart
```

#### Grafana Dashboard Empty

```bash
# Check data source connection
# Grafana → Configuration → Data Sources → Prometheus

# Verify metrics availability
curl http://prometheus.localhost:58002/api/v1/query?query=up

# Check dashboard queries
# Dashboard → Panel → Edit → Query tab
```

#### High Resource Usage

```bash
# Monitor container resources
docker stats

# Check disk usage for metrics storage
df -h | grep -E "(prometheus|grafana)"

# Optimize retention settings in prometheus.yml
```

### Integration dengan External Services

#### Slack Notifications

```yaml
# alertmanager.yml
receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
        channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

#### Webhook Integration

```yaml
receivers:
  - name: 'webhook-notifications'
    webhook_configs:
      - url: 'http://your-webhook-endpoint/alerts'
        send_resolved: true
```

## Examples

Repository ini sudah include example projects:
- **Project 1**: Node.js application example
- **Project 2**: Python/Django application example  
- **Default Site**: Simple dashboard HTML

## License

MIT License - silakan digunakan dan dimodifikasi sesuai kebutuhan.