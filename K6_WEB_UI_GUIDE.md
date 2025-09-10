# K6 Web UI Load Testing Guide

## Overview

This repository now includes a comprehensive K6 Load Testing Web UI that provides a modern, user-friendly interface for managing performance tests without requiring terminal access. The implementation transforms command-line K6 testing into a web-based experience with real-time monitoring, historical analysis, and integrated visualizations.

## 🚀 Quick Start

### 1. Setup Host Entry
```bash
# Add to /etc/hosts (required for k6.localhost access)
echo "127.0.0.1 k6.localhost" | sudo tee -a /etc/hosts
```

### 2. Start K6 Web UI
```bash
# Option A: Automated setup
./setup-k6-ui.sh

# Option B: Manual setup
./manage.sh k6 start
```

### 3. Access Web Interface
- **K6 Dashboard**: http://k6.localhost:58002/
- **K6 Grafana**: http://k6.localhost:58002/grafana
- **InfluxDB**: http://localhost:8086

## 🎯 Web Interface Features

### Dashboard (`/`)
- **Active Tests Monitor**: Real-time view of running tests
- **System Statistics**: Success rates, total tests run, system uptime
- **Quick Actions**: Direct links to test runner, history, and monitoring
- **Performance Overview**: Visual cards showing key metrics

### Test Runner (`/tests`)
- **Visual Test Selection**: Grid view of all available test scripts
- **Configuration Forms**: Set VUs, duration, base URL via web forms
- **Real-time Status**: Live updates of test execution status
- **One-click Execution**: Start/stop tests with button clicks

### Test History (`/history`)
- **Complete Test Records**: All past test executions with details
- **Advanced Filtering**: Filter by status, type, time range
- **Log Viewing**: Access detailed test logs directly in browser
- **Performance Trends**: Historical analysis of test results

### System Information (`/system`)
- **K6 Engine Status**: Health monitoring and configuration details
- **Integration Health**: Check InfluxDB, Grafana, Traefik connections
- **Resource Monitoring**: System uptime and performance metrics
- **Configuration Paths**: View mounted directories and settings

### Code Editor (`/tests/{testId}`)
- **Syntax Highlighting**: JavaScript syntax highlighting for test scripts
- **Read-only Viewer**: Safe viewing of test script contents
- **Copy/Download**: Easy script sharing and backup
- **Documentation**: Built-in K6 reference and examples

## 🔧 Architecture

### Components
```
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│   Web Browser   │◄──►│  K6 Dashboard│◄──►│ K6 Engine   │
│  (k6.localhost) │    │  (Node.js)   │    │ (Container) │
└─────────────────┘    └──────────────┘    └─────────────┘
         ▲                       │                 │
         │              ┌────────▼────────┐       │
         │              │    InfluxDB     │◄──────┘
         │              │   (Metrics)     │
         │              └────────┬────────┘
         │                       │
         └───────────────────────▼─────────
                           Grafana
                        (Visualization)
```

### Data Flow
1. **Web UI** → API requests to K6 Dashboard backend
2. **Backend** → Spawns K6 processes with configured parameters  
3. **K6 Engine** → Executes tests and sends metrics to InfluxDB
4. **InfluxDB** → Stores time-series performance data
5. **Grafana** → Visualizes metrics with custom dashboards
6. **WebSocket** → Real-time updates between backend and frontend

## 📊 Available Test Scripts

| Script | Target | Description |
|--------|--------|-------------|
| `root-endpoint-test.js` | `/` | Landing page performance validation |
| `jenkins-endpoint-test.js` | `/jenkins` | CI/CD server accessibility testing |
| `project1-endpoint-test.js` | `/project1` | Node.js application performance |
| `project2-endpoint-test.js` | `/project2` | Python application performance |
| `traefik-dashboard-test.js` | `/dashboard` | Traefik admin interface testing |
| `full-system-test.js` | All | Complete user journey simulation |

## 🛠 Management Commands

### K6 Web UI Management
```bash
./manage.sh k6 start     # Start complete K6 web stack
./manage.sh k6 stop      # Stop K6 services
./manage.sh k6 restart   # Restart K6 web UI
./manage.sh k6 build     # Build K6 dashboard Docker image
./manage.sh k6 logs      # View service logs
```

### Alternative CLI Testing
```bash
./manage.sh test                    # Run CLI-based tests
./manage.sh k6 cli <test-file>     # Run specific test via CLI
./run-k6-tests.sh                  # Original CLI test runner
```

### Service Status
```bash
./manage.sh status       # Check all services including K6
./manage.sh k6           # Show K6-specific help
```

## 📈 Monitoring & Analytics

### Grafana Dashboards
Access via http://k6.localhost:58002/grafana (admin/admin123)

**Key Metrics Tracked:**
- HTTP request duration (avg, p95, p99)
- Request rate (requests/second)
- Error rate percentage
- Virtual Users (VUs) active count
- Test iterations completed
- Response status codes

### InfluxDB Metrics
Direct access via http://localhost:8086 (admin/admin123)

**Database Structure:**
- Database: `k6`
- Retention: 30 days
- Metrics: HTTP timing, error rates, VU counts

## 🔧 Configuration

### Docker Compose Files
- `docker-compose.k6.yml` - Complete web UI stack
- `docker-compose.k6-simple.yml` - Simplified testing setup
- Integration via main `docker-compose.yml` with profiles

### Traefik Routing
```yaml
# k6.localhost subdomain routing
k6-dashboard:
  rule: "Host(`k6.localhost`)"
  service: k6-dashboard-service

k6-grafana:
  rule: "Host(`k6.localhost`) && PathPrefix(`/grafana`)"
  service: k6-grafana-service
```

### Environment Variables
```bash
NODE_ENV=production          # K6 dashboard environment
BASE_URL=http://traefik:80   # Default test target URL
INFLUXDB_DB=k6              # Metrics database name
```

## 🚨 Troubleshooting

### Cannot Access k6.localhost
1. **Check hosts file**: Ensure `127.0.0.1 k6.localhost` is in `/etc/hosts`
2. **Verify services**: Run `./manage.sh status` to check service health
3. **Check ports**: Ensure port 58002 is not blocked by firewall
4. **Test connectivity**: `curl -I http://k6.localhost:58002/`

### K6 Tests Failing
1. **Check target services**: Ensure main services are running
2. **Verify network**: Test `docker network inspect traefik-network`
3. **Check test scripts**: Review test file syntax and endpoints
4. **View logs**: Use `./manage.sh k6 logs k6-dashboard`

### Docker Issues
```bash
# Restart K6 services
./manage.sh k6 restart

# Rebuild containers
./manage.sh k6 build

# Check container status
docker ps | grep k6
```

### Performance Issues
- **Increase resources**: Ensure adequate CPU/memory for containers
- **Check load**: Monitor with `docker stats` during test execution
- **Reduce test intensity**: Lower VUs or duration for initial testing

## 🔒 Security Considerations

- **Network Isolation**: K6 services run in dedicated Docker network
- **Local Access**: Web UI bound to localhost for security
- **No Authentication**: Currently open access (suitable for local development)
- **CORS Policy**: Configured for local development environments

## 📚 Best Practices

### Test Design
1. **Start Small**: Begin with low VU counts and short durations
2. **Realistic Scenarios**: Model actual user behavior patterns
3. **Proper Thresholds**: Set performance expectations based on requirements
4. **Regular Testing**: Integrate into CI/CD for regression detection

### Resource Management
1. **Monitor Usage**: Watch CPU/memory during test execution
2. **Clean Up**: Remove old test data and logs periodically
3. **Scale Appropriately**: Adjust container resources as needed

### Development Workflow
1. **Test Locally**: Validate tests in local environment first
2. **Version Control**: Track test script changes with Git
3. **Document Changes**: Update test descriptions for team clarity
4. **Review Results**: Analyze trends and performance patterns

## 🎉 Success Validation

The implementation has been tested and validated:

✅ **K6 Engine**: Successfully executes load tests with metrics collection  
✅ **Web Interface**: React frontend provides intuitive test management  
✅ **Real-time Updates**: WebSocket integration delivers live test progress  
✅ **Docker Integration**: Containers communicate and share data properly  
✅ **Metrics Storage**: InfluxDB receives and stores performance data  
✅ **Visualization**: Grafana dashboards display comprehensive analytics  
✅ **Traefik Routing**: Subdomain access works with proper configuration  

The K6 Web UI transforms command-line load testing into a modern, accessible, and powerful performance testing solution.