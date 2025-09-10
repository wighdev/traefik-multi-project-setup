// @ts-check

/**
 * Global teardown for Playwright tests
 * Cleanup actions after all tests complete
 */
async function globalTeardown() {
  console.log('🧹 Starting global teardown for UI tests...');
  
  // In CI environment, we might want to stop services to clean up
  if (process.env.CI) {
    const { execSync } = require('child_process');
    try {
      console.log('🛑 Stopping services in CI environment...');
      execSync('./manage.sh stop', { 
        stdio: 'inherit',
        cwd: process.cwd(),
        timeout: 60000 // 1 minute timeout
      });
      console.log('✅ Services stopped successfully');
    } catch (error) {
      console.error('⚠️ Warning: Could not stop services:', error.message);
      // Don't fail the teardown if we can't stop services
    }
  } else {
    console.log('💡 Keeping services running for local development');
  }
  
  console.log('✨ Global teardown completed');
}

module.exports = globalTeardown;