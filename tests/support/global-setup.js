// @ts-check
const { execSync } = require('child_process');
const { chromium } = require('@playwright/test');

/**
 * Global setup for Playwright tests
 * Ensures services are running before tests start
 */
async function globalSetup() {
  console.log('🚀 Starting global setup for UI tests...');

  try {
    // Check if services are already running
    console.log('📊 Checking service status...');
    const statusOutput = execSync('./manage.sh status', { 
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    
    // If services aren't running, start them
    if (!statusOutput.includes('Up')) {
      console.log('🔧 Starting Traefik and project services...');
      execSync('./manage.sh start', { 
        stdio: 'inherit',
        cwd: process.cwd(),
        timeout: 120000 // 2 minutes timeout
      });
      
      // Wait a bit for services to be fully ready
      console.log('⏳ Waiting for services to be ready...');
      await new Promise(resolve => setTimeout(resolve, 15000));
    }

    // Verify services are accessible
    console.log('🔍 Verifying service accessibility...');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    try {
      // Test main dashboard
      await page.goto('http://localhost:58002/', { timeout: 30000 });
      console.log('✅ Main dashboard accessible');
      
      // Test project1
      await page.goto('http://localhost:58002/project1', { timeout: 30000 });
      console.log('✅ Project1 accessible');
      
      // Test project2
      await page.goto('http://localhost:58002/project2', { timeout: 30000 });
      console.log('✅ Project2 accessible');
      
    } finally {
      await browser.close();
    }
    
    console.log('🎉 Global setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error.message);
    
    // Try to get logs for debugging
    try {
      console.log('📋 Service logs for debugging:');
      const logs = execSync('./manage.sh logs', { encoding: 'utf-8', cwd: process.cwd() });
      console.log(logs);
    } catch (logError) {
      console.error('Could not retrieve logs:', logError.message);
    }
    
    throw error;
  }
}

module.exports = globalSetup;