const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Project 1 - Node.js App</title></head>
            <body style="font-family: Arial; padding: 40px; background: #f0f8ff;">
                <h1 style="color: #2c3e50;">🚀 Project 1 - Node.js Application</h1>
                <p>This is a sample Node.js application running on port 3000</p>
                <p><strong>Server Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
                <a href="/" style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Refresh</a>
                <a href="/jenkins" style="background: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">Jenkins</a>
            </body>
        </html>
    `);
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        timestamp: new Date().toISOString(),
        project: 'Project 1'
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Project 1 app listening at http://0.0.0.0:${port}`);
});