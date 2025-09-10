#!/bin/bash

# Nginx Management Script for Traefik Multi-Project Setup
# Manages Nginx reverse proxy for static IP 103.217.173.158 access

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help function
show_help() {
    echo -e "${BLUE}Nginx Management Script for Static IP Access${NC}"
    echo "============================================="
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo -e "${BLUE}Available Commands:${NC}"
    echo "  install     - Install and configure Nginx reverse proxy"
    echo "  start       - Start Nginx service"
    echo "  stop        - Stop Nginx service"
    echo "  restart     - Restart Nginx service"
    echo "  status      - Show Nginx service status"
    echo "  test        - Test Nginx configuration"
    echo "  logs        - Show Nginx logs"
    echo "  config      - Show current configuration"
    echo "  ssl         - Configure SSL certificates"
    echo "  uninstall   - Remove Nginx configuration"
    echo "  full-setup  - Complete setup (install nginx + start docker)"
    echo "  help        - Show this help message"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  $0 install     # Install Nginx reverse proxy"
    echo "  $0 full-setup  # Complete setup including Docker services"
    echo "  $0 test        # Test configuration and connectivity"
    echo "  $0 logs        # View recent logs"
}

# Check if nginx is installed
check_nginx_installed() {
    if command -v nginx >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check if we need sudo
get_sudo() {
    if [[ $EUID -eq 0 ]]; then
        echo ""
    elif command -v sudo &> /dev/null; then
        echo "sudo"
    else
        echo -e "${RED}❌ Error: This operation requires root privileges${NC}"
        exit 1
    fi
}

# Install Nginx
install_nginx() {
    echo -e "${BLUE}🔧 Installing Nginx Reverse Proxy...${NC}"
    if check_nginx_installed; then
        echo -e "${YELLOW}⚠️  Nginx is already installed${NC}"
        echo -e "${BLUE}Proceeding with configuration...${NC}"
    else
        ./install-nginx-proxy.sh
    fi
    
    # Always update configuration
    SUDO=$(get_sudo)
    echo -e "${BLUE}⚙️  Updating Nginx configuration...${NC}"
    $SUDO cp ./nginx/nginx.conf /etc/nginx/nginx.conf
    $SUDO cp ./nginx/sites-available/traefik-proxy /etc/nginx/sites-available/
    $SUDO ln -sf /etc/nginx/sites-available/traefik-proxy /etc/nginx/sites-enabled/
    
    echo -e "${GREEN}✅ Nginx installation and configuration complete${NC}"
}

# Start Nginx
start_nginx() {
    SUDO=$(get_sudo)
    echo -e "${BLUE}🚀 Starting Nginx service...${NC}"
    
    if ! check_nginx_installed; then
        echo -e "${RED}❌ Nginx is not installed. Run: $0 install${NC}"
        exit 1
    fi
    
    if $SUDO nginx -t; then
        $SUDO systemctl start nginx
        $SUDO systemctl enable nginx
        echo -e "${GREEN}✅ Nginx started successfully${NC}"
    else
        echo -e "${RED}❌ Nginx configuration is invalid${NC}"
        exit 1
    fi
}

# Stop Nginx
stop_nginx() {
    SUDO=$(get_sudo)
    echo -e "${BLUE}⏹️  Stopping Nginx service...${NC}"
    $SUDO systemctl stop nginx
    echo -e "${GREEN}✅ Nginx stopped${NC}"
}

# Restart Nginx
restart_nginx() {
    SUDO=$(get_sudo)
    echo -e "${BLUE}🔄 Restarting Nginx service...${NC}"
    
    if ! check_nginx_installed; then
        echo -e "${RED}❌ Nginx is not installed. Run: $0 install${NC}"
        exit 1
    fi
    
    if $SUDO nginx -t; then
        $SUDO systemctl restart nginx
        echo -e "${GREEN}✅ Nginx restarted successfully${NC}"
    else
        echo -e "${RED}❌ Nginx configuration is invalid${NC}"
        exit 1
    fi
}

# Show Nginx status
show_status() {
    echo -e "${BLUE}📊 Nginx Service Status:${NC}"
    if check_nginx_installed; then
        systemctl status nginx --no-pager -l
    else
        echo -e "${YELLOW}⚠️  Nginx is not installed${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🔌 Network Listening Status:${NC}"
    netstat -tlnp 2>/dev/null | grep -E ":58002|:58003" | grep nginx || echo "No Nginx processes listening on 58002/58003"
}

# Test Nginx configuration
test_nginx() {
    SUDO=$(get_sudo)
    echo -e "${BLUE}🧪 Testing Nginx configuration...${NC}"
    
    if ! check_nginx_installed; then
        echo -e "${RED}❌ Nginx is not installed. Run: $0 install${NC}"
        exit 1
    fi
    
    if $SUDO nginx -t; then
        echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
        echo ""
        echo -e "${BLUE}🌐 Running connectivity tests...${NC}"
        ./test-nginx-proxy.sh
    else
        echo -e "${RED}❌ Nginx configuration has errors${NC}"
        exit 1
    fi
}

# Show Nginx logs
show_logs() {
    echo -e "${BLUE}📜 Nginx Logs:${NC}"
    echo ""
    echo -e "${YELLOW}=== Error Log ===${NC}"
    tail -20 /var/log/nginx/error.log 2>/dev/null || echo "No error log found"
    
    echo ""
    echo -e "${YELLOW}=== Access Log ===${NC}"
    tail -20 /var/log/nginx/access.log 2>/dev/null || echo "No access log found"
    
    echo ""
    echo -e "${YELLOW}=== Traefik Proxy Log ===${NC}"
    tail -20 /var/log/nginx/traefik-proxy-access.log 2>/dev/null || echo "No proxy access log found"
    
    echo ""
    echo -e "${BLUE}💡 To follow logs in real-time:${NC}"
    echo "  sudo tail -f /var/log/nginx/error.log"
    echo "  sudo tail -f /var/log/nginx/traefik-proxy-access.log"
}

# Show configuration
show_config() {
    echo -e "${BLUE}⚙️  Current Nginx Configuration:${NC}"
    echo ""
    echo -e "${YELLOW}=== Main Config ===${NC}"
    if [[ -f /etc/nginx/nginx.conf ]]; then
        grep -v "^#" /etc/nginx/nginx.conf | grep -v "^$" | head -20
        echo "... (truncated)"
    else
        echo "No main config found"
    fi
    
    echo ""
    echo -e "${YELLOW}=== Site Config ===${NC}"
    if [[ -f /etc/nginx/sites-available/traefik-proxy ]]; then
        grep -E "listen|server_name|proxy_pass" /etc/nginx/sites-available/traefik-proxy
    else
        echo "No site config found"
    fi
    
    echo ""
    echo -e "${YELLOW}=== Enabled Sites ===${NC}"
    ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "No enabled sites directory"
}

# Configure SSL
configure_ssl() {
    echo -e "${BLUE}🔒 SSL Configuration Helper${NC}"
    echo ""
    echo -e "${BLUE}Choose SSL configuration method:${NC}"
    echo "1. Generate self-signed certificate (development)"
    echo "2. Use existing certificate files"
    echo "3. Show Let's Encrypt instructions"
    echo "4. Cancel"
    echo ""
    read -p "Enter choice (1-4): " choice
    
    case $choice in
        1)
            echo -e "${BLUE}Generating self-signed certificate...${NC}"
            SUDO=$(get_sudo)
            $SUDO mkdir -p /etc/nginx/ssl
            $SUDO openssl req -x509 -newkey rsa:4096 -keyout /etc/nginx/ssl/key.pem -out /etc/nginx/ssl/cert.pem -days 365 -nodes \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=103.217.173.158"
            $SUDO chmod 600 /etc/nginx/ssl/key.pem
            $SUDO chmod 644 /etc/nginx/ssl/cert.pem
            echo -e "${GREEN}✅ Self-signed certificate generated${NC}"
            echo -e "${YELLOW}⚠️  Remember to uncomment SSL configuration in /etc/nginx/sites-available/traefik-proxy${NC}"
            ;;
        2)
            echo -e "${BLUE}Place your certificate files as:${NC}"
            echo "  /etc/nginx/ssl/cert.pem - Certificate chain"
            echo "  /etc/nginx/ssl/key.pem - Private key"
            echo -e "${YELLOW}Then uncomment SSL configuration and restart nginx${NC}"
            ;;
        3)
            echo -e "${BLUE}Let's Encrypt Instructions:${NC}"
            echo "1. Install certbot: sudo apt install certbot"
            echo "2. Get certificate: sudo certbot certonly --standalone -d your-domain.com"
            echo "3. Copy files: sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /etc/nginx/ssl/cert.pem"
            echo "4. Copy key: sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /etc/nginx/ssl/key.pem"
            echo "5. Uncomment SSL configuration and restart nginx"
            ;;
        *)
            echo "Cancelled"
            ;;
    esac
}

# Uninstall Nginx configuration
uninstall_nginx() {
    SUDO=$(get_sudo)
    echo -e "${YELLOW}⚠️  This will remove Nginx configuration for static IP access${NC}"
    read -p "Are you sure? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🗑️  Removing Nginx configuration...${NC}"
        $SUDO rm -f /etc/nginx/sites-enabled/traefik-proxy
        $SUDO rm -f /etc/nginx/sites-available/traefik-proxy
        if [[ -f /etc/nginx/nginx.conf.backup.* ]]; then
            backup_file=$(ls /etc/nginx/nginx.conf.backup.* | head -1)
            echo -e "${BLUE}Restoring original nginx.conf from: $backup_file${NC}"
            $SUDO cp "$backup_file" /etc/nginx/nginx.conf
        fi
        $SUDO systemctl restart nginx 2>/dev/null || true
        echo -e "${GREEN}✅ Nginx configuration removed${NC}"
    else
        echo "Cancelled"
    fi
}

# Full setup
full_setup() {
    echo -e "${BLUE}🚀 Complete Setup - Nginx + Docker Services${NC}"
    echo "=============================================="
    echo ""
    
    # Install nginx
    install_nginx
    
    # Start docker services
    echo -e "${BLUE}🐳 Starting Docker services...${NC}"
    ./manage.sh start
    
    # Start nginx
    start_nginx
    
    # Test everything
    echo -e "${BLUE}🧪 Testing complete setup...${NC}"
    sleep 5  # Give services time to start
    ./test-nginx-proxy.sh
    
    echo ""
    echo -e "${GREEN}🎉 Full setup complete!${NC}"
    echo -e "${BLUE}🌐 Access your services at:${NC}"
    echo "  • http://103.217.173.158:58002/ (Dashboard)"
    echo "  • http://103.217.173.158:58002/jenkins (Jenkins)"
    echo "  • http://103.217.173.158:58002/grafana (Grafana)"
    echo "  • All other services via path-based routing"
}

# Main script logic
case "${1:-help}" in
    install)
        install_nginx
        ;;
    start)
        start_nginx
        ;;
    stop)
        stop_nginx
        ;;
    restart)
        restart_nginx
        ;;
    status)
        show_status
        ;;
    test)
        test_nginx
        ;;
    logs)
        show_logs
        ;;
    config)
        show_config
        ;;
    ssl)
        configure_ssl
        ;;
    uninstall)
        uninstall_nginx
        ;;
    full-setup)
        full_setup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac