const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Simple root page that works
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wolkenkrümel - Server Running</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px;
            background: #f0f8ff;
        }
        .card { 
            background: white; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .success { border-left: 4px solid #28a745; }
        .info { border-left: 4px solid #007bff; }
        .warning { border-left: 4px solid #ffc107; }
        button { 
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover { background: #0056b3; }
    </style>
</head>
<body>
    <div class="card success">
        <h1>🐕☁️ Wolkenkrümel</h1>
        <h2>✅ Server erfolgreich gestartet!</h2>
        <p><strong>Status:</strong> Deployment funktioniert</p>
        <p><strong>Zeit:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
        <p><strong>Port:</strong> ${port}</p>
    </div>
    
    <div class="card info">
        <h3>📊 Server Information</h3>
        <p>Dieser Server läuft erfolgreich im Deployment.</p>
        <p>Das ist ein wichtiger Schritt - der grundlegende Server funktioniert!</p>
    </div>
    
    <div class="card warning">
        <h3>⚠️ Nächste Schritte</h3>
        <p>Aktivitäten-API wird als nächstes aktiviert.</p>
        <p>Zunächst bestätigen wir, dass der Server grundsätzlich läuft.</p>
    </div>
    
    <div>
        <button onclick="testBasic()">Basic Test</button>
        <button onclick="location.reload()">Refresh</button>
    </div>
    
    <div id="results"></div>
    
    <script>
        function testBasic() {
            const results = document.getElementById('results');
            results.innerHTML = '<div class="card success"><h3>✅ Basic Test erfolgreich</h3><p>Server antwortet korrekt</p><p>Timestamp: ' + new Date().toLocaleString() + '</p></div>';
        }
    </script>
</body>
</html>
    `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: port
    });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Simple server running on port ${port}`);
    console.log(`✅ Basic deployment successful`);
});
