#!/bin/bash

# Nginx Reverse Proxy Installation Script
# Enables static IP 103.217.173.158 access to Docker containers

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Installing Nginx Reverse Proxy for Static IP Access${NC}"
echo "======================================================"
echo ""

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    SUDO=""
elif command -v sudo &> /dev/null; then
    SUDO="sudo"
    echo -e "${YELLOW}⚠️  This script requires sudo privileges for system installation${NC}"
else
    echo -e "${RED}❌ Error: This script requires root privileges or sudo${NC}"
    exit 1
fi

# Detect the operating system
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    echo -e "${RED}❌ Cannot detect operating system${NC}"
    exit 1
fi

echo -e "${BLUE}📋 System Information:${NC}"
echo "  • OS: $OS"
echo "  • Version: $VER"
echo "  • User: $(whoami)"
echo ""

# Install Nginx based on the operating system
echo -e "${BLUE}📦 Installing Nginx...${NC}"

if [[ $OS == *"Ubuntu"* ]] || [[ $OS == *"Debian"* ]]; then
    $SUDO apt update
    $SUDO apt install -y nginx
elif [[ $OS == *"CentOS"* ]] || [[ $OS == *"Red Hat"* ]] || [[ $OS == *"Rocky"* ]]; then
    $SUDO yum install -y epel-release
    $SUDO yum install -y nginx
elif [[ $OS == *"Fedora"* ]]; then
    $SUDO dnf install -y nginx
elif [[ $OS == *"Amazon Linux"* ]]; then
    $SUDO yum install -y nginx
else
    echo -e "${YELLOW}⚠️  Unsupported OS. Please install Nginx manually${NC}"
    echo "Then run: $0 configure"
    exit 1
fi

echo -e "${GREEN}✅ Nginx installed successfully${NC}"
echo ""

# Create backup of original nginx.conf if it exists
if [[ -f /etc/nginx/nginx.conf ]]; then
    echo -e "${BLUE}📁 Backing up original nginx configuration...${NC}"
    $SUDO cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy our custom nginx configuration
echo -e "${BLUE}⚙️  Configuring Nginx...${NC}"

# Copy main nginx.conf
$SUDO cp ./nginx/nginx.conf /etc/nginx/nginx.conf

# Create sites-available and sites-enabled directories if they don't exist
$SUDO mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

# Copy site configuration
$SUDO cp ./nginx/sites-available/traefik-proxy /etc/nginx/sites-available/

# Enable the site
$SUDO ln -sf /etc/nginx/sites-available/traefik-proxy /etc/nginx/sites-enabled/

# Create SSL directory
$SUDO mkdir -p /etc/nginx/ssl
$SUDO cp ./nginx/ssl/README.md /etc/nginx/ssl/ 2>/dev/null || true

# Set proper permissions
$SUDO chown -R root:root /etc/nginx/sites-available/
$SUDO chown -R root:root /etc/nginx/sites-enabled/
$SUDO chmod 644 /etc/nginx/sites-available/traefik-proxy

# Test nginx configuration
echo -e "${BLUE}🧪 Testing Nginx configuration...${NC}"
if $SUDO nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors. Please check the configuration${NC}"
    exit 1
fi

# Enable and start nginx service
echo -e "${BLUE}🚀 Starting Nginx service...${NC}"
$SUDO systemctl enable nginx
$SUDO systemctl restart nginx

# Check if nginx is running
if $SUDO systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Failed to start Nginx${NC}"
    echo "Check the status with: sudo systemctl status nginx"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Nginx Reverse Proxy Installation Complete!${NC}"
echo ""
echo -e "${BLUE}📊 Configuration Summary:${NC}"
echo "  • Nginx listening on: 103.217.173.158:58002 (HTTP)"
echo "  • Nginx listening on: 103.217.173.158:58003 (HTTPS - redirects to HTTP)"
echo "  • Proxying to: Docker containers via localhost:58002"
echo "  • Log files: /var/log/nginx/traefik-proxy-*.log"
echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo "  • Dashboard: http://103.217.173.158:58002/"
echo "  • Jenkins: http://103.217.173.158:58002/jenkins"
echo "  • Project 1: http://103.217.173.158:58002/project1"
echo "  • Project 2: http://103.217.173.158:58002/project2"
echo "  • Grafana: http://103.217.173.158:58002/grafana"
echo "  • Prometheus: http://103.217.173.158:58002/prometheus"
echo "  • K6 Testing: http://103.217.173.158:58002/k6"
echo ""
echo -e "${BLUE}🔧 Next Steps:${NC}"
echo "  1. Ensure Docker services are running: ./manage.sh start"
echo "  2. Test static IP access: ./test-nginx-proxy.sh"
echo "  3. Configure SSL certificates (optional): see nginx/ssl/README.md"
echo "  4. Check firewall allows ports 58002 and 58003"
echo ""
echo -e "${YELLOW}📝 Important Notes:${NC}"
echo "  • Nginx is now handling static IP binding (103.217.173.158)"
echo "  • Docker containers remain on internal network (localhost:58002)"
echo "  • No more ERR_CONNECTION_REFUSED from static IP"
echo "  • Original Traefik routing still works for internal access"