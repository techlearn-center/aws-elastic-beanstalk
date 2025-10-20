const express = require('express');
const app = express();

// Get port from environment variable (Beanstalk sets this automatically)
const port = process.env.PORT || 8080;

// Simple in-memory counter (resets when instance restarts)
let visitCount = 0;

// Get instance ID from environment (we'll set this later)
const instanceId = process.env.INSTANCE_ID || 'unknown';

// Root route - MUST return 200 for health checks
app.get('/', (req, res) => {
    visitCount++;
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Beanstalk Demo</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 50px auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .card {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 30px;
                    border-radius: 10px;
                    backdrop-filter: blur(10px);
                }
                h1 { margin-top: 0; }
                .stat {
                    font-size: 48px;
                    font-weight: bold;
                    margin: 20px 0;
                }
                .info {
                    font-size: 14px;
                    opacity: 0.8;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🚀 Elastic Beanstalk Demo</h1>
                <p>This page has been visited:</p>
                <div class="stat">${visitCount} times</div>
                <div class="info">
                    <p>Served by instance: <strong>${instanceId}</strong></p>
                    <p>Refresh to increment counter</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Health check endpoint (optional - root already works)
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});