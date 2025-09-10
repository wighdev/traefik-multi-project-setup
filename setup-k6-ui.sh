#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 K6 Load Testing Web UI Setup${NC}"
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if main services are running
if ! docker ps | grep -q traefik; then
    echo -e "${YELLOW}⚠️  Traefik is not running. Starting core services first...${NC}"
    ./manage.sh setup
    ./manage.sh start
    echo ""
fi

echo -e "${YELLOW}📋 Setting up K6 Web UI...${NC}"

# Ensure /etc/hosts entry exists
if ! grep -q "k6.localhost" /etc/hosts 2>/dev/null; then
    echo -e "${YELLOW}Adding k6.localhost to /etc/hosts...${NC}"
    if [ "$EUID" -eq 0 ]; then
        echo "127.0.0.1    k6.localhost" >> /etc/hosts
        echo -e "${GREEN}✅ Added k6.localhost to /etc/hosts${NC}"
    else
        echo -e "${YELLOW}Please add this line to /etc/hosts manually:${NC}"
        echo "127.0.0.1    k6.localhost"
        echo ""
        echo "You can do this by running:"
        echo "sudo echo '127.0.0.1    k6.localhost' >> /etc/hosts"
        echo ""
        read -p "Press Enter when you've added the hosts entry..."
    fi
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p tests/k6/logs
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/influxdb/init

# Check if frontend needs to be built
echo -e "${YELLOW}🏗️  Checking K6 Dashboard build...${NC}"
if [ ! -f "k6-dashboard/frontend/build/index.html" ]; then
    echo -e "${YELLOW}Frontend not built. This is OK - Docker will handle the build.${NC}"
fi

# Start K6 services
echo -e "${YELLOW}🚀 Starting K6 Web UI services...${NC}"
./manage.sh k6 start

echo ""
echo -e "${GREEN}✅ K6 Web UI Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📱 Access URLs:${NC}"
echo "🧪 K6 Dashboard:     http://k6.localhost:58002/"
echo "📊 K6 Grafana:       http://k6.localhost:58002/grafana"
echo "📈 InfluxDB:         http://localhost:8086"
echo "⚡ Main Dashboard:    http://localhost:58002/"
echo ""
echo -e "${BLUE}📚 Quick Commands:${NC}"
echo "./manage.sh k6 start     # Start K6 services"
echo "./manage.sh k6 stop      # Stop K6 services" 
echo "./manage.sh k6 logs      # View K6 logs"
echo "./manage.sh status       # Check all services"
echo ""
echo -e "${YELLOW}🔍 If you can't access k6.localhost, make sure:${NC}"
echo "1. k6.localhost is in /etc/hosts"
echo "2. Services are running (./manage.sh status)"
echo "3. No firewall blocking port 58002"
echo ""
echo -e "${GREEN}🎉 Happy load testing!${NC}"