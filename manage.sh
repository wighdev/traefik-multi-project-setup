#!/bin/bash

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fungsi untuk menampilkan status
show_status() {
    echo -e "${BLUE}=== Traefik Services Status ===${NC}"
    docker compose -f traefik-docker-compose.yml ps
    echo ""
    echo -e "${BLUE}=== Project Services Status ===${NC}"
    docker compose -f projects-docker-compose.yml ps
    echo ""
    echo -e "${GREEN}Access URLs:${NC}"
    echo "📊 Dashboard: http://localhost:58002/"
    echo "🔧 Jenkins: http://localhost:58002/jenkins"
    echo "🚀 Project 1: http://localhost:58002/project1"
    echo "🐍 Project 2: http://localhost:58002/project2"
    echo "⚡ Traefik: http://localhost:58002/dashboard/"
}

case $1 in
    "setup")
        echo -e "${YELLOW}Setting up Traefik Multi-Project...${NC}"
        
        # Create network
        echo "Creating Traefik network..."
        docker network create traefik-network 2>/dev/null || echo "Network already exists"
        
        # Create directories
        mkdir -p {certs,logs,default-site,project1,project2}
        
        echo -e "${GREEN}Setup completed!${NC}"
        echo "Run: $0 start"
        ;;
        
    "start")
        echo -e "${YELLOW}Starting all services...${NC}"
        
        # Start Traefik first
        echo "Starting Traefik..."
        docker compose -f traefik-docker-compose.yml up -d
        
        # Wait a bit for Traefik to be ready
        sleep 5
        
        # Start Projects
        echo "Starting Projects..."
        docker compose -f projects-docker-compose.yml up -d
        
        echo -e "${GREEN}All services started!${NC}"
        sleep 3
        show_status
        ;;
        
    "stop")
        echo -e "${YELLOW}Stopping all services...${NC}"
        docker compose -f projects-docker-compose.yml down
        docker compose -f traefik-docker-compose.yml down
        echo -e "${GREEN}All services stopped!${NC}"
        ;;
        
    "restart")
        echo -e "${YELLOW}Restarting all services...${NC}"
        $0 stop
        sleep 3
        $0 start
        ;;
        
    "logs")
        if [ -z "$2" ]; then
            echo -e "${YELLOW}Available services:${NC}"
            echo "- traefik"
            echo "- jenkins" 
            echo "- project1-app"
            echo "- project2-app"
            echo "- default-app"
            echo ""
            echo "Usage: $0 logs <service-name>"
        else
            echo -e "${BLUE}Showing logs for: $2${NC}"
            docker logs -f $2
        fi
        ;;
        
    "status")
        show_status
        ;;
        
    "clean")
        echo -e "${YELLOW}Cleaning up...${NC}"
        $0 stop
        docker system prune -f
        docker volume prune -f
        echo -e "${GREEN}Cleanup completed!${NC}"
        ;;
        
    "update")
        echo -e "${YELLOW}Updating services...${NC}"
        docker compose -f traefik-docker-compose.yml pull
        docker compose -f projects-docker-compose.yml pull
        $0 restart
        echo -e "${GREEN}Update completed!${NC}"
        ;;
        
    "test")
        echo -e "${YELLOW}Running k6 load tests...${NC}"
        
        # Check if k6 is available
        if command -v k6 &> /dev/null; then
            echo "Using local k6 installation"
            ./run-k6-tests.sh
        elif command -v docker &> /dev/null; then
            echo "Using Docker k6"
            echo "Running basic connectivity test..."
            docker run --rm --network traefik-network \
                -v "$(pwd)/tests/k6:/tests" \
                grafana/k6:latest run \
                --env BASE_URL=http://traefik:80 \
                /tests/root-endpoint-test.js
        else
            echo -e "${RED}❌ Neither k6 nor Docker is available${NC}"
            echo "Please install k6 or use: ./run-k6-tests.sh"
            exit 1
        fi
        ;;
        
    "monitoring")
        case $2 in
            "start")
                echo -e "${YELLOW}Starting monitoring stack...${NC}"
                
                # Ensure traefik network exists
                docker network create traefik-network 2>/dev/null || true
                
                # Start core monitoring (Prometheus + Grafana)
                docker compose -f docker-compose.monitoring.yml up -d prometheus grafana
                
                echo -e "${GREEN}Core monitoring started!${NC}"
                echo ""
                echo "📈 Grafana: http://monitoring.localhost:58002/ (admin/admin123)"
                echo "📊 Prometheus: http://prometheus.localhost:58002/"
                echo ""
                echo "To start additional monitoring services:"
                echo "  - AlertManager: $0 monitoring alertmanager"
                echo "  - Node Exporter: $0 monitoring node-metrics"
                echo "  - cAdvisor: $0 monitoring container-metrics"
                ;;
            "stop")
                echo -e "${YELLOW}Stopping monitoring stack...${NC}"
                docker compose -f docker-compose.monitoring.yml down
                echo -e "${GREEN}Monitoring stopped!${NC}"
                ;;
            "alertmanager")
                echo -e "${YELLOW}Starting AlertManager...${NC}"
                docker compose -f docker-compose.monitoring.yml --profile alerting up -d alertmanager
                echo -e "${GREEN}AlertManager started!${NC}"
                echo "🚨 AlertManager: http://alerts.localhost:58002/"
                ;;
            "node-metrics")
                echo -e "${YELLOW}Starting Node Exporter...${NC}"
                docker compose -f docker-compose.monitoring.yml --profile node-metrics up -d node-exporter
                echo -e "${GREEN}Node Exporter started!${NC}"
                ;;
            "container-metrics")
                echo -e "${YELLOW}Starting cAdvisor...${NC}"
                docker compose -f docker-compose.monitoring.yml --profile container-metrics up -d cadvisor
                echo -e "${GREEN}cAdvisor started!${NC}"
                ;;
            "logs")
                if [ -z "$3" ]; then
                    echo -e "${YELLOW}Available monitoring services:${NC}"
                    echo "- prometheus"
                    echo "- grafana"
                    echo "- alertmanager"
                    echo "- node-exporter"
                    echo "- cadvisor"
                    echo ""
                    echo "Usage: $0 monitoring logs <service-name>"
                else
                    echo -e "${BLUE}Showing logs for: $3${NC}"
                    docker logs -f $3
                fi
                ;;
            "restart")
                echo -e "${YELLOW}Restarting monitoring stack...${NC}"
                $0 monitoring stop
                sleep 3
                $0 monitoring start
                ;;
            *)
                echo -e "${BLUE}Monitoring Management Commands${NC}"
                echo ""
                echo -e "${GREEN}Usage: $0 monitoring {command}${NC}"
                echo ""
                echo "Commands:"
                echo "  start            - Start core monitoring (Prometheus + Grafana)"
                echo "  stop             - Stop all monitoring services"
                echo "  restart          - Restart monitoring stack"
                echo "  alertmanager     - Start AlertManager for notifications"
                echo "  node-metrics     - Start Node Exporter for system metrics"
                echo "  container-metrics - Start cAdvisor for container metrics"
                echo "  logs <service>   - Show logs for monitoring service"
                echo ""
                echo -e "${YELLOW}Quick start:${NC}"
                echo "1. $0 monitoring start"
                echo "2. Visit http://monitoring.localhost:58002/"
                ;;
        esac
        ;;
        
    *)
        echo -e "${BLUE}Traefik Multi-Project Management Script${NC}"
        echo ""
        echo -e "${GREEN}Usage: $0 {command}${NC}"
        echo ""
        echo "Commands:"
        echo "  setup   - Initial setup (create network, directories)"
        echo "  start   - Start all services"
        echo "  stop    - Stop all services"
        echo "  restart - Restart all services"
        echo "  status  - Show status and access URLs"
        echo "  logs    - Show logs for specific service"
        echo "  clean   - Stop services and cleanup Docker"
        echo "  update  - Update and restart all services"
        echo "  test    - Run k6 load tests"
        echo "  monitoring - Manage monitoring stack (Prometheus/Grafana)"
        echo ""
        echo -e "${YELLOW}First time setup:${NC}"
        echo "1. $0 setup"
        echo "2. $0 start"
        ;;
esac