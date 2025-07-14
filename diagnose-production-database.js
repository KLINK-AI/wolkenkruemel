#!/usr/bin/env node

/**
 * DIAGNOSE PRODUCTION DATABASE PROBLEM
 * Analysiert warum Activities API in Production 500-Fehler wirft
 */

import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./shared/schema.js";

// Lade Environment-Variablen
config();

console.log('🔍 DIAGNOSE: Production Database Problem');
console.log('📊 Problem: Activities API 500-Fehler in Production');
console.log('✅ Development: Funktioniert (200 Response)');
console.log('❌ Production: Fehlschlägt (500 Response)');

async function diagnoseDatabaseConnection() {
    console.log('\n🔍 1. Analysiere Database-Konfiguration...');
    
    // Check 1: Environment Variables
    console.log('📋 Environment Variables:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Gesetzt' : 'FEHLT'}`);
    console.log(`   PORT: ${process.env.PORT}`);
    
    if (!process.env.DATABASE_URL) {
        console.log('❌ KRITISCHER FEHLER: DATABASE_URL fehlt!');
        return;
    }
    
    // Check 2: Database URL Format
    console.log('\n📡 Database URL Format:');
    const dbUrl = process.env.DATABASE_URL;
    console.log(`   Protokoll: ${dbUrl.startsWith('postgresql://') ? 'PostgreSQL ✅' : 'UNGÜLTIG ❌'}`);
    console.log(`   Länge: ${dbUrl.length} Zeichen`);
    console.log(`   Erste 50 Zeichen: ${dbUrl.substring(0, 50)}...`);
    
    // Check 3: WebSocket Configuration
    console.log('\n🌐 WebSocket Configuration:');
    neonConfig.webSocketConstructor = ws;
    console.log('   WebSocket Constructor: Gesetzt ✅');
    
    // Check 4: Pool Creation
    console.log('\n🏊 Database Pool Creation:');
    try {
        const pool = new Pool({ 
            connectionString: process.env.DATABASE_URL,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
        console.log('   Pool erstellt: ✅');
        
        // Test connection
        console.log('\n🔌 Teste Database Connection...');
        const client = await pool.connect();
        console.log('   Connection erfolgreich: ✅');
        
        // Test query
        console.log('\n📊 Teste Basic Query...');
        const result = await client.query('SELECT NOW()');
        console.log(`   Query erfolgreich: ${result.rows[0].now} ✅`);
        
        client.release();
        
        // Check 5: Drizzle ORM
        console.log('\n🗄️ Teste Drizzle ORM...');
        const db = drizzle({ client: pool, schema });
        console.log('   Drizzle ORM erstellt: ✅');
        
        // Check 6: Schema Import
        console.log('\n📋 Teste Schema Import...');
        console.log(`   Activities Table: ${schema.activities ? 'Gefunden ✅' : 'FEHLT ❌'}`);
        console.log(`   Users Table: ${schema.users ? 'Gefunden ✅' : 'FEHLT ❌'}`);
        
        // Check 7: Test Activities Query
        console.log('\n🎯 Teste Activities Query...');
        const activities = await db.select().from(schema.activities).limit(5);
        console.log(`   Activities gefunden: ${activities.length} ✅`);
        
        // Check 8: Test Join Query (wie in getActivities)
        console.log('\n🔗 Teste Join Query...');
        const activitiesWithAuth = await db
            .select()
            .from(schema.activities)
            .leftJoin(schema.users, schema.activities.authorId.eq ? schema.activities.authorId.eq(schema.users.id) : undefined)
            .limit(3);
        console.log(`   Join Query erfolgreich: ${activitiesWithAuth.length} Ergebnisse ✅`);
        
        await pool.end();
        
        console.log('\n🎉 DIAGNOSE ABGESCHLOSSEN');
        console.log('✅ Database Connection: Funktioniert');
        console.log('✅ Basic Queries: Funktionieren');
        console.log('✅ Activities Query: Funktioniert');
        console.log('✅ Join Query: Funktioniert');
        console.log('');
        console.log('💡 DIAGNOSE-ERGEBNIS:');
        console.log('   Database ist funktionsfähig - Problem liegt woanders!');
        console.log('');
        console.log('🔍 NÄCHSTE SCHRITTE:');
        console.log('   1. Problem liegt nicht in der Database-Verbindung');
        console.log('   2. Problem liegt in der Production-Umgebung');
        console.log('   3. Möglicherweise Import-Pfad oder Module-Resolution');
        
    } catch (error) {
        console.error('\n❌ DATABASE ERROR:', error);
        console.error('Stack:', error.stack);
        
        console.log('\n🔍 ERROR ANALYSE:');
        if (error.message.includes('timeout')) {
            console.log('   💡 Timeout-Problem - Netzwerk oder Server überlastet');
        } else if (error.message.includes('connection')) {
            console.log('   💡 Connection-Problem - DATABASE_URL oder Netzwerk');
        } else if (error.message.includes('authentication')) {
            console.log('   💡 Auth-Problem - Passwort oder Berechtigungen');
        } else {
            console.log('   💡 Unbekannter Fehler - Benötigt weitere Analyse');
        }
    }
}

diagnoseDatabaseConnection();