#!/bin/bash

# UI Testing Script for Traefik Multi-Project Setup
# This script runs Playwright UI tests for the Traefik multi-project environment

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:58002"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_RESULTS_DIR="$SCRIPT_DIR/test-results"
SCREENSHOTS_DIR="$TEST_RESULTS_DIR/screenshots"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18 or later."
        exit 1
    fi
    
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js version 18 or later is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed."
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker."
        exit 1
    fi
    
    log_success "All prerequisites satisfied"
}

setup_dependencies() {
    log_info "Setting up dependencies..."
    
    # Install npm packages if node_modules doesn't exist or package.json is newer
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        log_info "Installing npm dependencies..."
        npm install
    fi
    
    # Install Playwright browsers if not already installed
    if ! npx playwright --version &> /dev/null; then
        log_info "Installing Playwright browsers..."
        npx playwright install
    fi
    
    log_success "Dependencies setup complete"
}

setup_services() {
    log_info "Setting up services..."
    
    # Make management script executable
    chmod +x ./manage.sh
    
    # Create network if it doesn't exist
    docker network create traefik-network 2>/dev/null || true
    
    # Start services
    log_info "Starting Traefik and application services..."
    ./manage.sh start
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f "$BASE_URL" &> /dev/null; then
            log_success "Services are ready!"
            break
        fi
        
        attempt=$((attempt + 1))
        log_info "Attempt $attempt/$max_attempts: Services not ready yet, waiting..."
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "Services failed to start within expected time"
        log_info "Checking service status..."
        ./manage.sh status
        exit 1
    fi
}

run_ui_tests() {
    log_info "Running UI tests..."
    
    # Create results directory
    mkdir -p "$TEST_RESULTS_DIR"
    mkdir -p "$SCREENSHOTS_DIR"
    
    # Set environment variables
    export BASE_URL="$BASE_URL"
    
    # Run tests based on parameters
    local test_args=""
    
    case "$1" in
        "headed")
            test_args="--headed"
            log_info "Running tests in headed mode..."
            ;;
        "debug")
            test_args="--debug"
            log_info "Running tests in debug mode..."
            ;;
        "specific")
            test_args="$2"
            log_info "Running specific test: $2"
            ;;
        "browser")
            test_args="--project=$2"
            log_info "Running tests on browser: $2"
            ;;
        *)
            log_info "Running all tests in headless mode..."
            ;;
    esac
    
    # Run the tests
    if npx playwright test $test_args; then
        log_success "UI tests completed successfully!"
        
        # Generate and show report
        if [ -f "playwright-report/index.html" ]; then
            log_info "Test report generated: playwright-report/index.html"
            log_info "To view the report, run: npm run test:ui:report"
        fi
        
        return 0
    else
        log_error "UI tests failed!"
        
        # Show failure information
        if [ -d "$SCREENSHOTS_DIR" ]; then
            local screenshot_count=$(find "$SCREENSHOTS_DIR" -name "*.png" 2>/dev/null | wc -l)
            if [ "$screenshot_count" -gt 0 ]; then
                log_info "Found $screenshot_count screenshots in $SCREENSHOTS_DIR"
            fi
        fi
        
        return 1
    fi
}

cleanup() {
    log_info "Cleaning up..."
    
    # Stop services if requested
    if [ "$STOP_SERVICES" = "true" ]; then
        log_info "Stopping services..."
        ./manage.sh stop
    else
        log_info "Keeping services running (use --stop to stop them)"
    fi
}

show_help() {
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  test                Run all UI tests (default)"
    echo "  test:headed         Run tests with browser GUI"
    echo "  test:debug          Run tests in debug mode"
    echo "  test:browser <name> Run tests on specific browser (chromium, firefox, webkit)"
    echo "  test:specific <file> Run specific test file"
    echo "  setup               Only setup dependencies and services"
    echo "  status              Show service status"
    echo "  help                Show this help message"
    echo ""
    echo "Options:"
    echo "  --stop              Stop services after tests"
    echo "  --skip-setup        Skip dependency and service setup"
    echo "  --check             Only check prerequisites"
    echo ""
    echo "Examples:"
    echo "  $0                           # Run all tests"
    echo "  $0 test:headed               # Run with browser GUI"
    echo "  $0 test:browser firefox      # Run on Firefox only"
    echo "  $0 test:specific connection  # Run connection tests only"
    echo "  $0 --stop                    # Run tests and stop services"
    echo "  $0 --check                   # Check prerequisites only"
}

# Main execution
main() {
    cd "$SCRIPT_DIR"
    
    # Parse arguments
    STOP_SERVICES="false"
    SKIP_SETUP="false"
    CHECK_ONLY="false"
    COMMAND="test"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --stop)
                STOP_SERVICES="true"
                shift
                ;;
            --skip-setup)
                SKIP_SETUP="true"
                shift
                ;;
            --check)
                CHECK_ONLY="true"
                shift
                ;;
            help|--help|-h)
                show_help
                exit 0
                ;;
            test:*)
                COMMAND="$1"
                shift
                ;;
            *)
                COMMAND="$1"
                shift
                ;;
        esac
    done
    
    # Execute based on command
    log_info "Starting UI test execution..."
    log_info "Command: $COMMAND"
    
    # Always check prerequisites
    check_prerequisites
    
    if [ "$CHECK_ONLY" = "true" ]; then
        log_success "Prerequisites check completed"
        exit 0
    fi
    
    # Setup trap for cleanup
    trap cleanup EXIT
    
    case "$COMMAND" in
        "setup")
            setup_dependencies
            setup_services
            log_success "Setup completed"
            ;;
        "status")
            ./manage.sh status
            ;;
        "test"|"test:headed"|"test:debug")
            if [ "$SKIP_SETUP" != "true" ]; then
                setup_dependencies
                setup_services
            fi
            
            case "$COMMAND" in
                "test:headed") run_ui_tests "headed" ;;
                "test:debug") run_ui_tests "debug" ;;
                *) run_ui_tests ;;
            esac
            ;;
        "test:browser")
            if [ "$SKIP_SETUP" != "true" ]; then
                setup_dependencies
                setup_services
            fi
            run_ui_tests "browser" "$1"
            ;;
        "test:specific")
            if [ "$SKIP_SETUP" != "true" ]; then
                setup_dependencies
                setup_services
            fi
            run_ui_tests "specific" "$1"
            ;;
        *)
            log_error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"