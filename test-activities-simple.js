#!/usr/bin/env node

/**
 * SIMPLE ACTIVITIES TEST - DIREKTER DATENZUGRIFF
 * Testet nur die Aktivitäten-API ohne komplexe Frontend-Logik
 */

import { config } from 'dotenv';

// Lade Environment-Variablen
config();

console.log('🧪 SIMPLE ACTIVITIES TEST');
console.log('📅 Basiert auf funktionierender Version vor 22:20 CET');
console.log('🎯 Ziel: Direkte Aktivitäten-Daten ohne Frontend-Komplexität');

// Environment anzeigen
console.log('\n📊 Environment:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Vorhanden' : 'Fehlt');
console.log('PORT:', process.env.PORT || '5000');

// Teste direkte Datenbankverbindung
console.log('\n🔍 1. Teste direkte Datenbankverbindung...');

try {
    // Importiere DatabaseStorage direkt (ohne .js Extension)
    const { storage } = await import('./server/storage.ts');
    
    console.log('✅ Storage-Modul geladen');
    
    // Test 1: Benutzer abrufen
    console.log('\n📋 Test 1: Benutzer abrufen...');
    const users = await storage.getAllUsers();
    console.log(`✅ Benutzer gefunden: ${users.length}`);
    if (users.length > 0) {
        console.log(`   Beispiel: ${users[0].username} (ID: ${users[0].id})`);
    }
    
    // Test 2: Activities abrufen (das Problem)
    console.log('\n📋 Test 2: Activities abrufen...');
    const activities = await storage.getActivities(10, 0);
    console.log(`✅ Activities gefunden: ${activities.length}`);
    
    if (activities.length > 0) {
        console.log('   Beispiel Activities:');
        activities.slice(0, 3).forEach(activity => {
            console.log(`   - ${activity.title} (ID: ${activity.id})`);
        });
    }
    
    // Test 3: Spezifische Activity
    if (activities.length > 0) {
        console.log('\n📋 Test 3: Spezifische Activity laden...');
        const activity = await storage.getActivity(activities[0].id);
        console.log(`✅ Activity Details: ${activity ? 'Gefunden' : 'Nicht gefunden'}`);
        if (activity) {
            console.log(`   Titel: ${activity.title}`);
            console.log(`   Schwierigkeit: ${activity.difficulty}`);
            console.log(`   Bilder: ${activity.images?.length || 0}`);
        }
    }
    
    console.log('\n🎉 ALLE DATENBANK-TESTS ERFOLGREICH!');
    console.log('✅ Storage funktioniert einwandfrei');
    console.log('✅ Activities werden korrekt geladen');
    
} catch (error) {
    console.error('\n❌ FEHLER beim Datenbank-Test:', error.message);
    console.error('Stack:', error.stack);
    console.log('\n💡 Dies ist wahrscheinlich das Problem im Deployment');
}

// Teste HTTP-Server direkt
console.log('\n🔍 2. Teste HTTP-Server direkt...');

// Erstelle minimalen Express-Server für Test
import express from 'express';

const app = express();
app.use(express.json());

// Einfache Test-Route für Activities
app.get('/api/activities', async (req, res) => {
    try {
        console.log('📞 API-Aufruf: /api/activities');
        
        const { storage } = await import('./server/storage.ts');
        const activities = await storage.getActivities(10, 0);
        
        console.log(`✅ Activities geladen: ${activities.length}`);
        res.json(activities);
        
    } catch (error) {
        console.error('❌ API-Fehler:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Einfache Test-HTML-Seite
app.get('/test', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Activities Test</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .activity { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
                .error { color: red; }
                .success { color: green; }
            </style>
        </head>
        <body>
            <h1>🧪 Activities Test</h1>
            <button onclick="loadActivities()">Aktivitäten laden</button>
            <div id="result"></div>
            
            <script>
                async function loadActivities() {
                    const resultDiv = document.getElementById('result');
                    resultDiv.innerHTML = '<p>Lädt...</p>';
                    
                    try {
                        const response = await fetch('/api/activities');
                        const activities = await response.json();
                        
                        if (response.ok) {
                            resultDiv.innerHTML = '<div class="success">✅ Aktivitäten erfolgreich geladen!</div>';
                            activities.forEach(activity => {
                                resultDiv.innerHTML += \`
                                    <div class="activity">
                                        <h3>\${activity.title}</h3>
                                        <p>Schwierigkeit: \${activity.difficulty}</p>
                                        <p>Bilder: \${activity.images?.length || 0}</p>
                                    </div>
                                \`;
                            });
                        } else {
                            resultDiv.innerHTML = '<div class="error">❌ Fehler: ' + JSON.stringify(activities) + '</div>';
                        }
                    } catch (error) {
                        resultDiv.innerHTML = '<div class="error">❌ Verbindungsfehler: ' + error.message + '</div>';
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Starte Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Test-Server läuft auf Port ${PORT}`);
    console.log(`🌐 Test-Seite: http://localhost:${PORT}/test`);
    console.log(`📊 API-Endpunkt: http://localhost:${PORT}/api/activities`);
    console.log('\n💡 Öffne die Test-Seite und klicke "Aktivitäten laden"');
});