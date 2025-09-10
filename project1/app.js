const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Project 1 - Node.js App</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background: #f0f8ff; }
                    .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    h1 { color: #007cba; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Project 1 - Node.js Application</h1>
                    <p>This is an example Node.js application running through Traefik reverse proxy.</p>
                    <p><strong>Port:</strong> ${PORT}</p>
                    <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}</p>
                    <p><a href="/">Back to Dashboard</a></p>
                </div>
            </body>
        </html>
    `);
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        port: PORT,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Project 1 running on port ${PORT}`);
});