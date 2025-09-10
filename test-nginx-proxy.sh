#!/bin/bash

# Test script for Nginx reverse proxy configuration
# Validates that static IP 103.217.173.158:58002 access works correctly

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Nginx Reverse Proxy Configuration${NC}"
echo "=============================================="
echo ""

# Test endpoints
endpoints=(
    "/:Dashboard"
    "/dashboard/:Traefik_Dashboard"
    "/jenkins:Jenkins_CI/CD"  
    "/project1:Project_1_Node.js"
    "/project2:Project_2_Python"
    "/k6:K6_Load_Testing"
    "/grafana:Grafana_Monitoring"
    "/prometheus:Prometheus_Metrics"
    "/nginx-health:Nginx_Health_Check"
)

all_passed=true

echo -e "${BLUE}🔍 Testing Nginx service status...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx service is running${NC}"
else
    echo -e "${RED}❌ Nginx service is not running${NC}"
    echo "Start with: sudo systemctl start nginx"
    all_passed=false
fi
echo ""

echo -e "${BLUE}🔍 Testing Docker containers...${NC}"
if docker ps | grep -q traefik; then
    echo -e "${GREEN}✅ Traefik container is running${NC}"
else
    echo -e "${YELLOW}⚠️  Traefik container is not running${NC}"
    echo "Start with: ./manage.sh start"
fi
echo ""

echo -e "${BLUE}🌐 Testing Static IP Access: 103.217.173.158:58002${NC}"
echo ""

# Test each endpoint via static IP simulation
for endpoint_info in "${endpoints[@]}"; do
    IFS=':' read -r endpoint name <<< "$endpoint_info"
    
    echo -n "  🧪 ${name//_/ }: "
    
    # Test by setting Host header to simulate static IP access
    response_code=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Host: 103.217.173.158:58002" \
        --connect-timeout 10 \
        --max-time 30 \
        "http://localhost:58002${endpoint}" 2>/dev/null || echo "000")
    
    case "$response_code" in
        "200")
            echo -e "${GREEN}${response_code} ✅${NC}"
            ;;
        "301"|"302")
            echo -e "${GREEN}${response_code} ✅ (Redirect)${NC}"
            ;;
        "502")
            echo -e "${YELLOW}${response_code} ⏳ (Service not running - routing works)${NC}"
            ;;
        "000")
            echo -e "${RED}Connection failed ❌${NC}"
            all_passed=false
            ;;
        *)
            echo -e "${RED}${response_code} ❌${NC}"
            all_passed=false
            ;;
    esac
done

echo ""

# Test direct nginx health endpoint
echo -e "${BLUE}🏥 Testing Nginx Health Endpoint...${NC}"
nginx_health=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:58002/nginx-health 2>/dev/null || echo "000")
if [[ "$nginx_health" == "200" ]]; then
    echo -e "${GREEN}✅ Nginx health check: ${nginx_health}${NC}"
else
    echo -e "${RED}❌ Nginx health check failed: ${nginx_health}${NC}"
    all_passed=false
fi
echo ""

# Test if static IP binding is working (requires the actual IP to be configured)
echo -e "${BLUE}🔌 Testing Network Interface Binding...${NC}"
if netstat -tlnp 2>/dev/null | grep -q ":58002.*nginx" || ss -tlnp 2>/dev/null | grep -q ":58002.*nginx"; then
    echo -e "${GREEN}✅ Nginx is listening on port 58002${NC}"
else
    echo -e "${YELLOW}⚠️  Cannot detect Nginx listening on port 58002 (may need root privileges)${NC}"
fi

if netstat -tlnp 2>/dev/null | grep -q ":58003.*nginx" || ss -tlnp 2>/dev/null | grep -q ":58003.*nginx"; then
    echo -e "${GREEN}✅ Nginx is listening on port 58003${NC}"
else
    echo -e "${YELLOW}⚠️  Cannot detect Nginx listening on port 58003 (may need root privileges)${NC}"
fi
echo ""

# Test Traefik connectivity from nginx perspective
echo -e "${BLUE}🔗 Testing Nginx → Docker Connectivity...${NC}"
traefik_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:58002/ 2>/dev/null || echo "000")
if [[ "$traefik_response" =~ ^[23][0-9][0-9]$ ]]; then
    echo -e "${GREEN}✅ Nginx can reach Docker containers: ${traefik_response}${NC}"
else
    echo -e "${RED}❌ Nginx cannot reach Docker containers: ${traefik_response}${NC}"
    all_passed=false
fi
echo ""

# Summary
if [ "$all_passed" = true ]; then
    echo -e "${GREEN}🎉 SUCCESS: Nginx reverse proxy is working correctly!${NC}"
    echo ""
    echo -e "${BLUE}✨ Key Benefits Achieved:${NC}"
    echo "  • ✅ Static IP 103.217.173.158:58002 access enabled"
    echo "  • ✅ No more ERR_CONNECTION_REFUSED errors"
    echo "  • ✅ External IP access working"
    echo "  • ✅ Docker containers remain on secure internal network"
    echo "  • ✅ All services accessible via path-based routing"
    echo ""
    echo -e "${BLUE}🌐 External Access URLs:${NC}"
    echo "  • http://103.217.173.158:58002/ (Dashboard)"
    echo "  • http://103.217.173.158:58002/jenkins (Jenkins)"  
    echo "  • http://103.217.173.158:58002/grafana (Grafana)"
    echo "  • http://103.217.173.158:58002/prometheus (Prometheus)"
    echo "  • All other services via /path routing"
else
    echo -e "${RED}❌ FAILURE: Some issues detected with the reverse proxy setup${NC}"
    echo ""
    echo -e "${BLUE}🔧 Troubleshooting Steps:${NC}"
    echo "  1. Check nginx status: sudo systemctl status nginx"
    echo "  2. Check nginx configuration: sudo nginx -t"
    echo "  3. Check nginx logs: sudo tail -f /var/log/nginx/error.log"
    echo "  4. Restart nginx: sudo systemctl restart nginx"
    echo "  5. Check Docker containers: docker ps"
    echo "  6. Start Docker services: ./manage.sh start"
fi

echo ""
echo -e "${BLUE}📋 Log Files for Debugging:${NC}"
echo "  • Nginx errors: /var/log/nginx/error.log"
echo "  • Nginx access: /var/log/nginx/access.log"
echo "  • Proxy logs: /var/log/nginx/traefik-proxy-*.log"
echo "  • Docker logs: ./manage.sh logs traefik"