const http = require('http');
const port = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Wolkenkrümel - Minimal Server</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 50px; background: #f0f8ff; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: white; border-radius: 10px; }
        h1 { color: #2c3e50; text-align: center; }
        .status { background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .info { background: #e2e3e5; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐕☁️ Wolkenkrümel</h1>
        <div class="status">
            <h2>✅ Minimal Server läuft!</h2>
            <p><strong>Zeit:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Port:</strong> ${port}</p>
            <p><strong>Node Version:</strong> ${process.version}</p>
        </div>
        <div class="info">
            <h3>📊 Deployment Test</h3>
            <p>Dieser minimale HTTP-Server verwendet nur Node.js Core-Module.</p>
            <p>Keine externen Dependencies, kein Express, kein TypeScript.</p>
            <p>Wenn das funktioniert, können wir schrittweise erweitern.</p>
        </div>
        <div class="info">
            <h3>🔧 Technische Details</h3>
            <p><strong>Request URL:</strong> ${req.url}</p>
            <p><strong>Request Method:</strong> ${req.method}</p>
            <p><strong>User Agent:</strong> ${req.headers['user-agent']}</p>
        </div>
    </div>
</body>
</html>
    `);
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Minimal server running on port ${port}`);
    console.log(`Server started at ${new Date().toISOString()}`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
});