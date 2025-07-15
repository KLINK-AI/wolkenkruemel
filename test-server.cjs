
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('<!DOCTYPE html><html><body><h1>TEST SERVER WORKS</h1><p>Time: ' + new Date().toLocaleString() + '</p></body></html>');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', time: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
    console.log('✅ Test server running on port', port);
});
