# Nginx Reverse Proxy Setup for Static IP Access

This guide explains how to configure Nginx as a reverse proxy to enable static IP access (103.217.173.158) to Docker containers running Traefik and other services.

## Problem Solution

**Original Problem:**
- Static IP 103.217.173.158:58002 → ERR_CONNECTION_REFUSED when accessing Docker
- Docker services only accessible via internal IP 192.168.10.84:58002 or localhost:58002
- Docker containers not binding to external static IP interface

**Solution Implemented:**
- Nginx reverse proxy on host server listening on static IP 103.217.173.158
- Proxies requests to internal Docker services on localhost:58002/58003
- Docker containers remain on secure internal network
- All services accessible via path-based routing through static IP

## Architecture

```
External Request → Nginx (103.217.173.158:58002) → Docker Traefik (localhost:58002) → Services
                                 ↓
                   Static IP Interface Binding        Internal Docker Network
```

## Quick Setup

### Option 1: Automated Full Setup
```bash
# Complete setup (installs Nginx + starts Docker services)
./manage-nginx.sh full-setup
```

### Option 2: Step-by-Step Setup
```bash
# 1. Install and configure Nginx reverse proxy
./manage-nginx.sh install

# 2. Start Docker services
./manage.sh start

# 3. Start Nginx service
./manage-nginx.sh start

# 4. Test the setup
./manage-nginx.sh test
```

## File Structure

```
nginx/
├── nginx.conf                    # Main Nginx configuration
├── sites-available/
│   └── traefik-proxy             # Reverse proxy configuration
├── sites-enabled/                # Symlinked enabled sites
├── ssl/                          # SSL certificates directory
│   └── README.md                 # SSL setup instructions
└── logs/                         # Log directory

Scripts:
├── install-nginx-proxy.sh        # Installation script
├── manage-nginx.sh              # Management script
├── test-nginx-proxy.sh          # Testing script
└── nginx-docker-compose.yml     # Optional: Dockerized Nginx (alternative)
```

## Configuration Details

### Nginx Reverse Proxy Configuration

**HTTP (Port 58002):**
- Listens on: `103.217.173.158:58002`
- Proxies to: `http://localhost:58002` (Docker Traefik)
- Headers: Preserves original request info for Traefik routing

**HTTPS (Port 58003):**
- Listens on: `103.217.173.158:58003`
- Currently redirects to HTTP (SSL not configured)
- Can be enabled by uncommenting SSL configuration and adding certificates

### Port Mapping

| External Access | Nginx Proxy | Docker Internal | Service |
|----------------|-------------|-----------------|---------|
| 103.217.173.158:58002 | :58002 | localhost:58002 | All HTTP services |
| 103.217.173.158:58003 | :58003 | localhost:58003 | All HTTPS services |

### Service Routing

All services remain accessible through the same path-based routing:

| Service | URL Pattern | Example |
|---------|-------------|---------|
| Dashboard | `/` | http://103.217.173.158:58002/ |
| Jenkins | `/jenkins` | http://103.217.173.158:58002/jenkins |
| Project 1 | `/project1` | http://103.217.173.158:58002/project1 |
| Project 2 | `/project2` | http://103.217.173.158:58002/project2 |
| Traefik Dashboard | `/dashboard/` | http://103.217.173.158:58002/dashboard/ |
| K6 Load Testing | `/k6` | http://103.217.173.158:58002/k6 |
| Grafana | `/grafana` | http://103.217.173.158:58002/grafana |
| Prometheus | `/prometheus` | http://103.217.173.158:58002/prometheus |

## Management Commands

### Nginx Management
```bash
./manage-nginx.sh install     # Install and configure Nginx
./manage-nginx.sh start       # Start Nginx service
./manage-nginx.sh stop        # Stop Nginx service
./manage-nginx.sh restart     # Restart Nginx service
./manage-nginx.sh status      # Show service status
./manage-nginx.sh test        # Test configuration and connectivity
./manage-nginx.sh logs        # Show recent logs
./manage-nginx.sh config      # Show current configuration
./manage-nginx.sh ssl         # Configure SSL certificates
./manage-nginx.sh uninstall   # Remove Nginx configuration
./manage-nginx.sh full-setup  # Complete automated setup
```

### Docker Services (existing)
```bash
./manage.sh start             # Start Docker services
./manage.sh stop              # Stop Docker services
./manage.sh restart           # Restart Docker services
./manage.sh status            # Show Docker status
```

## Testing

### Automated Testing
```bash
# Test Nginx reverse proxy
./test-nginx-proxy.sh

# Test static IP routing (original)
./test-static-ip-103.217.173.158.sh
```

### Manual Testing
```bash
# Test health endpoint
curl http://103.217.173.158:58002/nginx-health

# Test dashboard
curl http://103.217.173.158:58002/

# Test specific services
curl -I http://103.217.173.158:58002/jenkins
curl -I http://103.217.173.158:58002/grafana
```

## SSL Configuration

### Development (Self-Signed Certificate)
```bash
# Generate self-signed certificate
./manage-nginx.sh ssl
# Select option 1 for self-signed

# Or manually:
sudo openssl req -x509 -newkey rsa:4096 \
  -keyout /etc/nginx/ssl/key.pem \
  -out /etc/nginx/ssl/cert.pem \
  -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=103.217.173.158"

# Uncomment SSL configuration in /etc/nginx/sites-available/traefik-proxy
sudo nano /etc/nginx/sites-available/traefik-proxy

# Restart Nginx
./manage-nginx.sh restart
```

### Production (Let's Encrypt)
```bash
# Install Certbot
sudo apt update && sudo apt install certbot

# Get certificate (requires domain)
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /etc/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /etc/nginx/ssl/key.pem

# Enable SSL configuration and restart
sudo nano /etc/nginx/sites-available/traefik-proxy
./manage-nginx.sh restart
```

## Troubleshooting

### Common Issues

**1. ERR_CONNECTION_REFUSED**
```bash
# Check if Nginx is running
./manage-nginx.sh status

# Check if static IP is configured
ip addr show | grep 103.217.173.158

# Check port binding
sudo netstat -tlnp | grep :58002
```

**2. 502 Bad Gateway**
```bash
# Check if Docker services are running
./manage.sh status

# Check Docker Traefik logs
./manage.sh logs traefik

# Test direct Docker access
curl -I http://localhost:58002/
```

**3. Configuration Errors**
```bash
# Test Nginx configuration
./manage-nginx.sh test

# Check Nginx logs
./manage-nginx.sh logs

# Validate configuration syntax
sudo nginx -t
```

### Log Files
- Nginx errors: `/var/log/nginx/error.log`
- Nginx access: `/var/log/nginx/access.log`
- Proxy access: `/var/log/nginx/traefik-proxy-access.log`
- Proxy errors: `/var/log/nginx/traefik-proxy-error.log`

### Network Diagnostics
```bash
# Check interface binding
sudo netstat -tlnp | grep nginx
sudo ss -tlnp | grep nginx

# Test connectivity
curl -v http://localhost:58002/
curl -v -H "Host: 103.217.173.158:58002" http://localhost:58002/

# Check Docker networking
docker network ls
docker network inspect traefik-network
```

## Security Considerations

1. **Firewall Configuration:**
   ```bash
   # Allow required ports
   sudo ufw allow 58002/tcp
   sudo ufw allow 58003/tcp
   ```

2. **SSL/TLS:**
   - Use proper certificates in production
   - Enable HTTPS configuration
   - Consider HTTP to HTTPS redirect

3. **Access Control:**
   - Consider IP whitelisting if needed
   - Monitor access logs regularly
   - Keep Nginx updated

## Benefits Achieved

✅ **Static IP Access**: 103.217.173.158:58002 now works  
✅ **No Connection Refused**: ERR_CONNECTION_REFUSED errors eliminated  
✅ **External Access**: Services accessible from other machines  
✅ **Secure Internal Network**: Docker containers remain on internal network  
✅ **Path-Based Routing**: All services accessible via unique paths  
✅ **Port Compliance**: Only uses allowed ports 58002 and 58003  
✅ **Backward Compatibility**: Original localhost access still works  
✅ **WebSocket Support**: Real-time applications supported  
✅ **SSL Ready**: HTTPS can be enabled with certificates  

## Maintenance

### Regular Tasks
- Monitor log files for errors
- Update SSL certificates before expiration
- Keep Nginx updated: `sudo apt update && sudo apt upgrade nginx`
- Backup configuration files

### Monitoring
```bash
# Service health check
./manage-nginx.sh status

# Recent activity
./manage-nginx.sh logs

# Test connectivity
./manage-nginx.sh test
```

This Nginx reverse proxy solution provides a robust bridge between the static IP interface and Docker containers, eliminating connection issues while maintaining security and functionality.