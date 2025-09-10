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

## Structure

```
traefik-multi-project-setup/
├── traefik-docker-compose.yml    # Traefik service
├── projects-docker-compose.yml   # All projects/applications
├── traefik.yml                   # Traefik main configuration
├── dynamic.yml                   # Dynamic routing configuration
├── setup.sh                      # Setup script
├── manage.sh                     # Management script
├── default-site/                 # Default landing page
│   └── index.html
├── project1/                     # Example project 1
├── project2/                     # Example project 2
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

## Examples

Repository ini sudah include example projects:
- **Project 1**: Node.js application example
- **Project 2**: Python/Django application example  
- **Default Site**: Simple dashboard HTML

## License

MIT License - silakan digunakan dan dimodifikasi sesuai kebutuhan.