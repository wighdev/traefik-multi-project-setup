const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;
const K6_TESTS_DIR = '/tests';
const K6_LOGS_DIR = '/logs';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Storage for running tests
const activeTests = new Map();
const testHistory = [];

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 3002 });

// Broadcast to all connected clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// API Routes

// Get available test scripts
app.get('/api/tests', async (req, res) => {
    try {
        const testFiles = await fs.readdir(K6_TESTS_DIR);
        const tests = testFiles
            .filter(file => file.endsWith('.js') && file !== 'README.md')
            .map(file => {
                const testPath = path.join(K6_TESTS_DIR, file);
                const stats = fs.statSync(testPath);
                return {
                    id: file.replace('.js', ''),
                    name: file,
                    path: testPath,
                    size: stats.size,
                    modified: stats.mtime,
                    description: getTestDescription(file)
                };
            });
        
        res.json({ tests });
    } catch (error) {
        console.error('Error reading test files:', error);
        res.status(500).json({ error: 'Failed to read test files' });
    }
});

// Get test file content
app.get('/api/tests/:testId', async (req, res) => {
    try {
        const testFile = `${req.params.testId}.js`;
        const testPath = path.join(K6_TESTS_DIR, testFile);
        
        if (!await fs.pathExists(testPath)) {
            return res.status(404).json({ error: 'Test not found' });
        }
        
        const content = await fs.readFile(testPath, 'utf-8');
        res.json({ content, path: testPath });
    } catch (error) {
        console.error('Error reading test file:', error);
        res.status(500).json({ error: 'Failed to read test file' });
    }
});

// Start a test
app.post('/api/tests/:testId/start', async (req, res) => {
    const testId = req.params.testId;
    const testFile = `${testId}.js`;
    const testPath = path.join(K6_TESTS_DIR, testFile);
    const runId = uuidv4();
    
    try {
        if (!await fs.pathExists(testPath)) {
            return res.status(404).json({ error: 'Test not found' });
        }
        
        if (activeTests.has(testId)) {
            return res.status(400).json({ error: 'Test already running' });
        }
        
        const { baseUrl, vus, duration, iterations } = req.body;
        
        // Prepare K6 command
        const k6Args = ['run'];
        
        // Add environment variables
        if (baseUrl) k6Args.push('--env', `BASE_URL=${baseUrl}`);
        
        // Add load configuration
        if (vus) k6Args.push('--vus', vus.toString());
        if (duration) k6Args.push('--duration', duration);
        if (iterations) k6Args.push('--iterations', iterations.toString());
        
        // Add output configuration for InfluxDB
        k6Args.push('--out', 'influxdb=http://influxdb:8086/k6');
        
        // Add JSON output for real-time processing
        const logFile = path.join(K6_LOGS_DIR, `${runId}.json`);
        k6Args.push('--out', `json=${logFile}`);
        
        // Add test file
        k6Args.push(testPath);
        
        console.log('Starting K6 test:', k6Args.join(' '));
        
        // Start K6 process
        const k6Process = spawn('k6', k6Args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
                ...process.env,
                BASE_URL: baseUrl || process.env.BASE_URL || 'http://traefik:80'
            }
        });
        
        const testRun = {
            runId,
            testId,
            testFile,
            process: k6Process,
            startTime: new Date(),
            status: 'running',
            logs: [],
            config: { baseUrl, vus, duration, iterations }
        };
        
        activeTests.set(testId, testRun);
        
        // Handle process output
        k6Process.stdout.on('data', (data) => {
            const output = data.toString();
            testRun.logs.push({ timestamp: new Date(), type: 'stdout', message: output });
            
            // Broadcast real-time updates
            broadcast({
                type: 'test-output',
                testId,
                runId,
                output,
                timestamp: new Date()
            });
        });
        
        k6Process.stderr.on('data', (data) => {
            const output = data.toString();
            testRun.logs.push({ timestamp: new Date(), type: 'stderr', message: output });
            
            broadcast({
                type: 'test-error',
                testId,
                runId,
                output,
                timestamp: new Date()
            });
        });
        
        k6Process.on('close', (code) => {
            testRun.status = code === 0 ? 'completed' : 'failed';
            testRun.endTime = new Date();
            testRun.exitCode = code;
            
            // Move to history
            testHistory.push({...testRun, process: null});
            activeTests.delete(testId);
            
            // Broadcast completion
            broadcast({
                type: 'test-completed',
                testId,
                runId,
                status: testRun.status,
                exitCode: code,
                endTime: testRun.endTime
            });
            
            console.log(`Test ${testId} completed with code ${code}`);
        });
        
        // Broadcast test start
        broadcast({
            type: 'test-started',
            testId,
            runId,
            config: testRun.config,
            startTime: testRun.startTime
        });
        
        res.json({ 
            message: 'Test started successfully',
            runId,
            testId,
            config: testRun.config
        });
        
    } catch (error) {
        console.error('Error starting test:', error);
        res.status(500).json({ error: 'Failed to start test' });
    }
});

// Stop a test
app.post('/api/tests/:testId/stop', (req, res) => {
    const testId = req.params.testId;
    const testRun = activeTests.get(testId);
    
    if (!testRun) {
        return res.status(404).json({ error: 'Test not running' });
    }
    
    try {
        testRun.process.kill('SIGTERM');
        testRun.status = 'stopped';
        
        broadcast({
            type: 'test-stopped',
            testId,
            runId: testRun.runId,
            timestamp: new Date()
        });
        
        res.json({ message: 'Test stopped successfully' });
    } catch (error) {
        console.error('Error stopping test:', error);
        res.status(500).json({ error: 'Failed to stop test' });
    }
});

// Get active tests
app.get('/api/tests/active', (req, res) => {
    const active = Array.from(activeTests.values()).map(test => ({
        runId: test.runId,
        testId: test.testId,
        testFile: test.testFile,
        startTime: test.startTime,
        status: test.status,
        config: test.config
    }));
    
    res.json({ active });
});

// Get test history
app.get('/api/tests/history', (req, res) => {
    const history = testHistory
        .map(test => ({
            runId: test.runId,
            testId: test.testId,
            testFile: test.testFile,
            startTime: test.startTime,
            endTime: test.endTime,
            status: test.status,
            exitCode: test.exitCode,
            config: test.config
        }))
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .slice(0, 50); // Limit to last 50 tests
    
    res.json({ history });
});

// Get test logs
app.get('/api/tests/:testId/logs/:runId', (req, res) => {
    const { testId, runId } = req.params;
    
    // Check active tests first
    const activeTest = activeTests.get(testId);
    if (activeTest && activeTest.runId === runId) {
        return res.json({ logs: activeTest.logs });
    }
    
    // Check history
    const historicalTest = testHistory.find(test => test.runId === runId);
    if (historicalTest) {
        return res.json({ logs: historicalTest.logs });
    }
    
    res.status(404).json({ error: 'Test run not found' });
});

// Get system info
app.get('/api/system/info', (req, res) => {
    res.json({
        k6Version: 'Latest', // We'll get this dynamically in production
        testsDirectory: K6_TESTS_DIR,
        logsDirectory: K6_LOGS_DIR,
        activeTests: activeTests.size,
        totalHistory: testHistory.length,
        uptime: process.uptime()
    });
});

// Helper functions
function getTestDescription(filename) {
    const descriptions = {
        'root-endpoint-test.js': 'Landing page performance test',
        'jenkins-endpoint-test.js': 'Jenkins CI/CD server accessibility test',
        'project1-endpoint-test.js': 'Node.js application performance test',
        'project2-endpoint-test.js': 'Python application performance test',
        'traefik-dashboard-test.js': 'Traefik dashboard accessibility test',
        'full-system-test.js': 'Complete user journey test across all services',
        'example-custom-test.js': 'Template for creating new custom tests'
    };
    
    return descriptions[filename] || 'Custom load test';
}

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    
    // Send current active tests to new client
    ws.send(JSON.stringify({
        type: 'active-tests',
        tests: Array.from(activeTests.values()).map(test => ({
            runId: test.runId,
            testId: test.testId,
            testFile: test.testFile,
            startTime: test.startTime,
            status: test.status,
            config: test.config
        }))
    }));
    
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

// Error handling
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Ensure required directories exist
async function initializeDirectories() {
    try {
        await fs.ensureDir(K6_LOGS_DIR);
        console.log('Initialized log directory:', K6_LOGS_DIR);
    } catch (error) {
        console.error('Error creating directories:', error);
    }
}

// Start server
app.listen(PORT, async () => {
    await initializeDirectories();
    console.log(`🚀 K6 Web Dashboard running on port ${PORT}`);
    console.log(`📊 WebSocket server running on port 3002`);
    console.log(`📁 Tests directory: ${K6_TESTS_DIR}`);
    console.log(`📋 Logs directory: ${K6_LOGS_DIR}`);
});