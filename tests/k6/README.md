# k6 Load Testing Suite

This directory contains comprehensive load testing scripts for the Traefik Multi-Project Setup.

## Quick Start

```bash
# From project root directory
./run-k6-tests.sh --all        # Run all tests
./run-k6-tests.sh --list       # List available tests  
./run-k6-tests.sh --check      # Check prerequisites
./manage.sh test               # Alternative way to run tests
```

## Test Files

| File | Description | Target |
|------|-------------|---------|
| `root-endpoint-test.js` | Landing page performance | `/` |
| `jenkins-endpoint-test.js` | Jenkins accessibility | `/jenkins` |
| `project1-endpoint-test.js` | Node.js app performance | `/project1` |
| `project2-endpoint-test.js` | Python app performance | `/project2` |
| `traefik-dashboard-test.js` | Traefik dashboard | `/dashboard/` |
| `full-system-test.js` | Complete user journey | All endpoints |
| `example-custom-test.js` | Template for new tests | Custom |

## Creating New Tests

1. Copy the example template:
   ```bash
   cp example-custom-test.js my-new-test.js
   ```

2. Edit the test script:
   - Modify the endpoint URL
   - Update validation checks
   - Adjust load patterns
   - Set appropriate thresholds

3. Add to the test runner:
   - Edit `../../run-k6-tests.sh`
   - Add your test to `TEST_FILES` array
   - Add description to `TEST_DESCRIPTIONS`

## Load Patterns

Each test uses different load patterns optimized for the endpoint:

- **Static Content** (root): Fast ramp-up, higher concurrency
- **Applications** (project1/2): Moderate load with realistic user behavior
- **Admin Interfaces** (jenkins/traefik): Lower load, longer timeouts
- **System Test**: Variable load simulating real user journeys

## Metrics & Thresholds

All tests include standard thresholds:

- **Response Time**: p(95) < 500ms-2s (depending on service)
- **Error Rate**: < 2-5% (depending on service complexity)
- **Throughput**: Measured but not enforced (depends on hardware)

## Results

Test results are automatically saved to:
- `logs/`: Human-readable test output
- `logs/*.json`: Machine-readable k6 metrics

## Docker Usage

Run tests in Docker for CI/CD environments:

```bash
# Single test
docker run --rm --network traefik-network \
  -v $(pwd):/tests grafana/k6:latest run \
  --env BASE_URL=http://traefik:80 \
  /tests/root-endpoint-test.js

# Using docker-compose
docker-compose -f ../../docker-compose.k6.yml --profile testing up k6
```

For more detailed information, see the main [README.md](../../README.md#load-testing-dengan-k6) file.