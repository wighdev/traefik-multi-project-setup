#!/bin/bash

# k6 Load Testing Script for Traefik Multi-Project Setup
# This script runs all k6 tests and saves results to log files

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:58002}"
LOG_DIR="tests/k6/logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Test files
declare -a TEST_FILES=(
    "test_root.js"
    "test_project1.js"
    "test_project2.js"
    "test_jenkins.js" 
    "test_dashboard.js"
    "root-endpoint-test.js"
    "project1-endpoint-test.js"
    "project2-endpoint-test.js"
    "jenkins-endpoint-test.js" 
    "traefik-dashboard-test.js"
    "full-system-test.js"
)

# Test descriptions
declare -A TEST_DESCRIPTIONS=(
    ["test_root.js"]="Root/Landing Page Load Test (New Format)"
    ["test_project1.js"]="Project 1 (Node.js) Load Test (New Format)"
    ["test_project2.js"]="Project 2 (Python) Load Test (New Format)"
    ["test_jenkins.js"]="Jenkins Endpoint Load Test (New Format)"
    ["test_dashboard.js"]="Traefik Dashboard Load Test (New Format)"
    ["root-endpoint-test.js"]="Landing Page Load Test"
    ["project1-endpoint-test.js"]="Project 1 (Node.js) Load Test"
    ["project2-endpoint-test.js"]="Project 2 (Python) Load Test"
    ["jenkins-endpoint-test.js"]="Jenkins Endpoint Load Test"
    ["traefik-dashboard-test.js"]="Traefik Dashboard Load Test"
    ["full-system-test.js"]="Full System Journey Test"
)

# Function to check if k6 is installed
check_k6_installation() {
    if ! command -v k6 &> /dev/null; then
        echo -e "${RED}❌ k6 is not installed!${NC}"
        echo -e "${YELLOW}Please install k6 first:${NC}"
        echo "  • MacOS: brew install k6"
        echo "  • Ubuntu/Debian: sudo apt-get update && sudo apt-get install k6"
        echo "  • Docker: docker run --rm -i grafana/k6:latest"
        echo "  • Or visit: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
}

# Function to check if services are running
check_services() {
    echo -e "${BLUE}🔍 Checking if services are running...${NC}"
    
    # Test connectivity to base URL
    if curl -s --max-time 10 "$BASE_URL" > /dev/null; then
        echo -e "${GREEN}✅ Services are accessible at $BASE_URL${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Cannot reach services at $BASE_URL${NC}"
        echo "   Make sure services are running with: ./manage.sh start"
        echo "   Continuing with tests anyway..."
    fi
}

# Function to create log directory
setup_logging() {
    mkdir -p "$LOG_DIR"
    echo -e "${BLUE}📁 Log directory created: $LOG_DIR${NC}"
}

# Function to run a single test
run_test() {
    local test_file="$1"
    local test_path="tests/k6/$test_file"
    local description="${TEST_DESCRIPTIONS[$test_file]}"
    local log_file="$LOG_DIR/${test_file%.js}_${TIMESTAMP}.log"
    
    echo -e "${PURPLE}🚀 Running: $description${NC}"
    echo "   Test file: $test_file"
    echo "   Log file: $log_file"
    echo ""
    
    # Run k6 test with output to both console and log file
    if k6 run \
        --env BASE_URL="$BASE_URL" \
        --out json="$log_file.json" \
        "$test_path" 2>&1 | tee "$log_file"; then
        echo -e "${GREEN}✅ $description completed successfully${NC}"
    else
        echo -e "${RED}❌ $description failed${NC}"
        return 1
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Function to run all tests
run_all_tests() {
    local failed_tests=0
    local total_tests=${#TEST_FILES[@]}
    
    echo -e "${BLUE}🎯 Running $total_tests k6 load tests...${NC}"
    echo "Base URL: $BASE_URL"
    echo "Timestamp: $TIMESTAMP"
    echo ""
    
    for test_file in "${TEST_FILES[@]}"; do
        if ! run_test "$test_file"; then
            ((failed_tests++))
        fi
        
        # Wait between tests to avoid overwhelming the system
        if [[ "$test_file" != "${TEST_FILES[-1]}" ]]; then
            echo "Waiting 10 seconds before next test..."
            sleep 10
        fi
    done
    
    # Summary
    echo -e "${BLUE}📊 Test Results Summary${NC}"
    echo "========================================"
    echo "Total tests: $total_tests"
    echo "Passed: $((total_tests - failed_tests))"
    echo "Failed: $failed_tests"
    echo "Logs directory: $LOG_DIR"
    echo ""
    
    if [ $failed_tests -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}⚠️  $failed_tests test(s) failed${NC}"
        return 1
    fi
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}k6 Load Testing Script for Traefik Multi-Project Setup${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS] [TEST_NAME]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -l, --list     List available tests"
    echo "  -a, --all      Run all tests (default)"
    echo "  -c, --check    Check prerequisites and service status"
    echo ""
    echo "Environment Variables:"
    echo "  BASE_URL       Base URL for testing (default: http://localhost:58002)"
    echo ""
    echo "Examples:"
    echo "  $0                           # Run all tests"
    echo "  $0 root-endpoint-test.js     # Run specific test"
    echo "  BASE_URL=http://192.168.1.100:58002 $0  # Test remote instance"
    echo ""
}

# Function to list available tests
list_tests() {
    echo -e "${BLUE}Available k6 Tests:${NC}"
    echo ""
    for test_file in "${TEST_FILES[@]}"; do
        echo -e "  ${GREEN}$test_file${NC} - ${TEST_DESCRIPTIONS[$test_file]}"
    done
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking Prerequisites${NC}"
    echo ""
    
    # Check k6 installation
    if command -v k6 &> /dev/null; then
        k6_version=$(k6 version)
        echo -e "${GREEN}✅ k6 is installed: $k6_version${NC}"
    else
        echo -e "${RED}❌ k6 is not installed${NC}"
    fi
    
    # Check curl for service connectivity test
    if command -v curl &> /dev/null; then
        echo -e "${GREEN}✅ curl is available${NC}"
    else
        echo -e "${YELLOW}⚠️  curl is not available (optional)${NC}"
    fi
    
    # Check if test files exist
    echo -e "${BLUE}📁 Checking test files:${NC}"
    for test_file in "${TEST_FILES[@]}"; do
        if [ -f "tests/k6/$test_file" ]; then
            echo -e "${GREEN}✅ $test_file${NC}"
        else
            echo -e "${RED}❌ $test_file (missing)${NC}"
        fi
    done
    
    echo ""
    check_services
}

# Main execution
main() {
    case "${1:-}" in
        -h|--help)
            show_usage
            exit 0
            ;;
        -l|--list)
            list_tests
            exit 0
            ;;
        -c|--check)
            check_prerequisites
            exit 0
            ;;
        -a|--all|"")
            check_k6_installation
            check_services
            setup_logging
            run_all_tests
            exit $?
            ;;
        *.js)
            # Run specific test
            if [[ " ${TEST_FILES[*]} " =~ " $1 " ]]; then
                check_k6_installation
                check_services
                setup_logging
                run_test "$1"
                exit $?
            else
                echo -e "${RED}❌ Test file '$1' not found${NC}"
                echo ""
                list_tests
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"