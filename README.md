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
- ✅ **K6 Load Testing Web UI** - Complete web-based performance testing suite

## Structure

```
traefik-multi-project-setup/
├── traefik-docker-compose.yml    # Traefik service
├── projects-docker-compose.yml   # All projects/applications
├── docker-compose.k6.yml         # K6 load testing services
├── traefik.yml                   # Traefik main configuration
├── dynamic.yml                   # Dynamic routing configuration
├── setup.sh                      # Setup script
├── manage.sh                     # Management script
├── run-k6-tests.sh               # k6 load testing automation script
├── default-site/                 # Default landing page
│   └── index.html
├── project1/                     # Example project 1
├── project2/                     # Example project 2
├── k6-dashboard/                 # K6 Web UI Dashboard
│   ├── server.js                 # Node.js backend API
│   ├── Dockerfile                # K6 dashboard container
│   └── frontend/                 # React web interface
│       ├── src/components/       # UI components
│       ├── src/pages/            # Application pages
│       └── src/hooks/            # WebSocket integration
├── monitoring/                   # Enhanced monitoring setup
│   ├── grafana/                  # Grafana configuration
│   │   ├── dashboards/           # K6 performance dashboards
│   │   └── provisioning/         # Auto-provisioning config
│   └── influxdb/                 # InfluxDB for K6 metrics
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
   ./manage.sh setup
   ```

3. **Start core services:**
   ```bash
   ./manage.sh start
   ```

4. **Start K6 Web UI (Optional):**
   ```bash
   # Add to /etc/hosts: 127.0.0.1 k6.localhost
   ./manage.sh k6 start
   ```

5. **Access services:**
   - Dashboard: `http://YOUR_IP:58002/`
   - Jenkins: `http://YOUR_IP:58002/jenkins`
   - Project 1: `http://YOUR_IP:58002/project1`
   - Project 2: `http://YOUR_IP:58002/project2`
   - Traefik Dashboard: `http://YOUR_IP:58002/dashboard/`
   - **K6 Load Testing**: `http://k6.localhost:58002/` **OR** `http://YOUR_IP:58002/k6`
   - **Grafana**: `http://YOUR_IP:58002/grafana` (works with any IP)
   - **Prometheus**: `http://YOUR_IP:58002/prometheus` (works with any IP)

## K6 Load Testing Web UI 🧪

### Features

- **Web-based Test Management**: Start/stop tests without touching the terminal
- **Real-time Monitoring**: Live test execution progress and results
- **Test History**: Complete test execution history with filtering
- **Performance Dashboards**: Integrated Grafana dashboards for detailed metrics
- **Test Script Viewer**: Built-in code editor for viewing test scripts
- **System Information**: K6 engine status and configuration monitoring

### Quick K6 Setup

```bash
# 1. Add to /etc/hosts
echo "127.0.0.1 k6.localhost" | sudo tee -a /etc/hosts

# 2. Start K6 Web UI
./manage.sh k6 start

# 3. Access web interface
open http://k6.localhost:58002/
```

### K6 Web Interface URLs

| Service | URL | Description |
|---------|-----|-------------|
| K6 Dashboard | `http://k6.localhost:58002/` | Main web UI for test management |
| K6 Grafana | `http://k6.localhost:58002/grafana` | Performance metrics and dashboards |
| InfluxDB | `http://localhost:8086` | K6 metrics database (admin/admin123) |

### K6 Management Commands

```bash
# K6 Web UI Management
./manage.sh k6 start      # Start K6 web interface
./manage.sh k6 stop       # Stop K6 services
./manage.sh k6 restart    # Restart K6 web UI
./manage.sh k6 build      # Build K6 dashboard Docker image
./manage.sh k6 logs       # Show K6 service logs

# CLI K6 Testing (Alternative)
./manage.sh test          # Run CLI-based load tests
./manage.sh k6 cli <test> # Run specific test via CLI
```

### Web UI Features

#### 📊 Dashboard
- Active tests monitoring
- System statistics
- Quick action buttons
- Test success rate tracking

#### 🚀 Test Runner  
- Visual test selection
- Configurable parameters (VUs, duration, base URL)
- Real-time test status
- One-click test execution

#### 📈 Test History
- Complete test execution history
- Filtering by status, type, and time range
- Test log viewing
- Performance trend analysis

#### ⚙️ System Information
- K6 engine status
- Configuration details
- Integration health checks
- System resource monitoring

### K6 Test Scripts

| Test Script | Description | Target Endpoint |
|-------------|-------------|-----------------|
| `root-endpoint-test.js` | Landing page performance | `http://localhost:58002/` |
| `jenkins-endpoint-test.js` | Jenkins accessibility | `http://localhost:58002/jenkins` |
| `project1-endpoint-test.js` | Node.js app performance | `http://localhost:58002/project1` |
| `project2-endpoint-test.js` | Python app performance | `http://localhost:58002/project2` |
| `traefik-dashboard-test.js` | Traefik dashboard | `http://localhost:58002/dashboard/` |
| `full-system-test.js` | Complete user journey | All endpoints |
| `example-custom-test.js` | Template for new tests | Custom endpoint |

## Static IP Access Support

✅ **ALL SERVICES** now support both hostname-based and IP-based access patterns:

### Host-Based Access (Original)
- Requires proper `/etc/hosts` entries for subdomains
- `http://k6.localhost:58002/` - K6 Dashboard
- `http://k6.localhost:58002/grafana` - K6 Grafana  
- `http://monitoring.localhost:58002/` - Monitoring Grafana
- `http://prometheus.localhost:58002/` - Prometheus

### IP-Based Access (ENHANCED - Optimized for Static IP: 103.217.173.158)
- **Static IP Optimized**: Specific routing rules for `103.217.173.158:58002`
- **Universal IP Support**: Works with any IP address (localhost, external IPs, etc.)
- **Path-based Routing**: All services accessible through unique paths
- **Examples with Static IP**:
  - `http://103.217.173.158:58002/` - Root Dashboard
  - `http://103.217.173.158:58002/jenkins` - Jenkins CI/CD
  - `http://103.217.173.158:58002/project1` - Project 1 (Node.js)
  - `http://103.217.173.158:58002/project2` - Project 2 (Python)  
  - `http://103.217.173.158:58002/dashboard/` - Traefik Dashboard
  - `http://103.217.173.158:58002/k6` - K6 Load Testing
  - `http://103.217.173.158:58002/grafana` - Grafana Monitoring
  - `http://103.217.173.158:58002/prometheus` - Prometheus Metrics

### 🔧 Nginx Reverse Proxy Solution (NEW!)

For environments where ERR_CONNECTION_REFUSED occurs when accessing Docker containers via static IP, we provide a comprehensive Nginx reverse proxy solution:

**Quick Setup:**
```bash
# Automated full setup
./manage-nginx.sh full-setup

# Or step by step
./manage-nginx.sh install    # Install Nginx reverse proxy
./manage.sh start            # Start Docker services  
./manage-nginx.sh start      # Start Nginx
./manage-nginx.sh test       # Test setup
```

**Benefits:**
- 🎯 **Eliminates ERR_CONNECTION_REFUSED** - Static IP access works reliably
- 🌐 **External IP Access** - Services accessible from other machines  
- 🔒 **Secure Internal Network** - Docker containers remain isolated
- ⚡ **High Performance** - Nginx handles static IP binding efficiently
- 🔧 **Easy Management** - Simple commands for all operations

**See:** `NGINX_PROXY_SETUP.md` for complete documentation

### Benefits
- 🎯 **Static IP Optimization** - Dedicated routing for 103.217.173.158:58002
- 🚀 **Zero 404 errors** when accessing services via IP addresses
- 🌐 **External IP compatibility** - services accessible from other machines
- 🔄 **Backward compatibility** - original hostname access still works
- 📱 **Mobile/remote access** - use actual server IP instead of localhost
- ⚡ **High Priority Routing** - Static IP gets priority over fallback rules
- 🔒 **Port Restriction Compliant** - Only uses allowed ports 58002 (HTTP) and 58003 (HTTPS)

### Technical Implementation
- **High Priority Rules**: Static IP routes have priority 200
- **Fallback Routes**: General path-based routing with priority 100/90
- **Docker Port Binding**: Correctly bound to 0.0.0.0:58002 and 0.0.0.0:58003
- **Traefik Configuration**: Accepts external IPs with proper forwarded headers
- **Router Rules**: `Host(103.217.173.158) && PathPrefix(/service)` for each service
- **Nginx Reverse Proxy**: Optional layer for static IP interface binding

## Services

| Service | URL | Alternative IP Access | Description |
|---------|-----|-----------------------|-------------|
| Dashboard | `http://YOUR_IP:58002/` | Same | Landing page dengan akses ke semua services |
| Jenkins | `http://YOUR_IP:58002/jenkins` | Same | CI/CD Pipeline (akses via IP) |
| Project 1 | `http://YOUR_IP:58002/project1` | Same | Example Node.js application |
| Project 2 | `http://YOUR_IP:58002/project2` | Same | Example Python/Django application |
| Traefik Dashboard | `http://YOUR_IP:58002/traefik` | Same | Traefik monitoring dashboard |
| **K6 Dashboard** | `http://k6.localhost:58002/` | `http://YOUR_IP:58002/k6` | **Load testing web interface** |
| **Grafana** | `http://k6.localhost:58002/grafana` | `http://YOUR_IP:58002/grafana` | **Performance metrics and dashboards** |
| **Prometheus** | `http://prometheus.localhost:58002/` | `http://YOUR_IP:58002/prometheus` | **Metrics collection and monitoring** |

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
# Docker Services
./manage.sh start      # Start all services
./manage.sh stop       # Stop all services  
./manage.sh restart    # Restart all services
./manage.sh logs       # Show logs for specific service
./manage.sh status     # Show status of all services
./manage.sh k6         # K6 load testing management
./manage.sh monitoring # Monitoring stack management

# Nginx Reverse Proxy (for static IP access)
./manage-nginx.sh install     # Install Nginx reverse proxy
./manage-nginx.sh start       # Start Nginx service
./manage-nginx.sh stop        # Stop Nginx service
./manage-nginx.sh restart     # Restart Nginx service
./manage-nginx.sh status      # Show Nginx status
./manage-nginx.sh test        # Test configuration and connectivity
./manage-nginx.sh logs        # Show Nginx logs
./manage-nginx.sh ssl         # Configure SSL certificates
./manage-nginx.sh full-setup  # Complete setup (Nginx + Docker)
```

## Configuration Files

### traefik.yml
Main Traefik configuration dengan entrypoints, providers, dan certificate resolvers.

### dynamic.yml  
Dynamic routing configuration untuk semua services, middlewares, dan load balancers. Includes K6 subdomain routing.

### docker-compose files
- `traefik-docker-compose.yml` - Traefik reverse proxy
- `projects-docker-compose.yml` - All application services
- `docker-compose.k6.yml` - K6 load testing suite

## K6 Load Testing Architecture

### Components

1. **K6 Web Dashboard**: React-based UI with Node.js backend
2. **K6 Engine**: Containerized k6 for test execution
3. **InfluxDB**: Time-series database for metrics storage
4. **Grafana**: Performance visualization and dashboards
5. **WebSocket**: Real-time test progress updates

### Data Flow

```
Web UI → API Server → K6 Engine → InfluxDB → Grafana
    ↑                      ↓
    ← WebSocket Updates ←
```

### Metrics Collected

- HTTP request duration (avg, p95, p99)
- Request rate (requests/second)
- Error rate percentage
- Virtual Users (VUs) active count
- Test iterations completed
- Response status codes

## Security

- Basic auth untuk Traefik dashboard
- CORS middleware tersedia untuk K6 API
- SSL/HTTPS support dengan Let's Encrypt
- Isolated Docker networks
- K6 subdomain routing with middleware

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

### K6 Web UI Issues
```bash
# Check K6 services
./manage.sh k6 logs k6-dashboard

# Rebuild K6 dashboard
./manage.sh k6 build

# Check network connectivity
curl -I http://k6.localhost:58002/
```

### Jenkins prefix issues
Pastikan JENKINS_OPTS sudah set dengan `--prefix=/jenkins`

## Examples

Repository ini sudah include example projects:
- **Project 1**: Node.js application example
- **Project 2**: Python/Django application example  
- **Default Site**: Simple dashboard HTML
- **K6 Dashboard**: Complete load testing web interface

## License

MIT License - silakan digunakan dan dimodifikasi sesuai kebutuhan.