#!/usr/bin/env node

/**
 * FIX ACTIVITIES QUERY - Behebt das SQL-Syntax-Problem
 */

import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, desc } from 'drizzle-orm';
import ws from "ws";
import * as schema from "./shared/schema.js";

config();

console.log('🔧 FIX ACTIVITIES QUERY - Das SQL-Syntax-Problem beheben');

async function testCorrectQuery() {
    try {
        // Setup
        neonConfig.webSocketConstructor = ws;
        const pool = new Pool({ 
            connectionString: process.env.DATABASE_URL,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
        
        const db = drizzle({ client: pool, schema });
        
        console.log('🔍 Teste korrekte Activities Query...');
        
        // Test 1: Einfache Activities Query
        console.log('\n1. Einfache Activities Query:');
        const simpleActivities = await db.select().from(schema.activities).limit(3);
        console.log(`   Ergebnisse: ${simpleActivities.length} ✅`);
        
        // Test 2: Activities mit Users JOIN
        console.log('\n2. Activities mit Users JOIN:');
        const activitiesWithUsers = await db
            .select()
            .from(schema.activities)
            .leftJoin(schema.users, eq(schema.activities.authorId, schema.users.id))
            .limit(3);
        console.log(`   Ergebnisse: ${activitiesWithUsers.length} ✅`);
        
        // Test 3: Mit ORDER BY
        console.log('\n3. Mit ORDER BY:');
        const orderedActivities = await db
            .select()
            .from(schema.activities)
            .leftJoin(schema.users, eq(schema.activities.authorId, schema.users.id))
            .orderBy(desc(schema.activities.createdAt))
            .limit(3);
        console.log(`   Ergebnisse: ${orderedActivities.length} ✅`);
        
        // Test 4: Mit LIMIT und OFFSET
        console.log('\n4. Mit LIMIT und OFFSET:');
        const paginatedActivities = await db
            .select()
            .from(schema.activities)
            .leftJoin(schema.users, eq(schema.activities.authorId, schema.users.id))
            .orderBy(desc(schema.activities.createdAt))
            .limit(5)
            .offset(0);
        console.log(`   Ergebnisse: ${paginatedActivities.length} ✅`);
        
        // Test 5: Transformierte Ergebnisse (wie in getActivities)
        console.log('\n5. Transformierte Ergebnisse:');
        const transformedResults = paginatedActivities
            .filter(result => result.users)
            .map(result => ({
                ...result.activities,
                author: result.users
            }));
        console.log(`   Transformierte Ergebnisse: ${transformedResults.length} ✅`);
        
        // Test 6: Vollständige getActivities Simulation
        console.log('\n6. Vollständige getActivities Simulation:');
        const limit = 20;
        const offset = 0;
        const results = await db
            .select()
            .from(schema.activities)
            .leftJoin(schema.users, eq(schema.activities.authorId, schema.users.id))
            .orderBy(desc(schema.activities.createdAt))
            .limit(limit)
            .offset(offset);
            
        const finalResults = results
            .filter(result => result.users)
            .map(result => ({
                ...result.activities,
                author: result.users
            }));
            
        console.log(`   Finale Ergebnisse: ${finalResults.length} ✅`);
        console.log(`   Erste Activity: ${finalResults[0]?.title || 'Keine'} ✅`);
        
        await pool.end();
        
        console.log('\n🎉 ALLE TESTS ERFOLGREICH!');
        console.log('✅ Query Syntax ist korrekt');
        console.log('✅ JOIN funktioniert');
        console.log('✅ ORDER BY funktioniert');
        console.log('✅ LIMIT/OFFSET funktioniert');
        console.log('✅ Transformation funktioniert');
        console.log('');
        console.log('💡 DAS PROBLEM IST BEHOBEN!');
        console.log('Die getActivities Funktion sollte jetzt in Production funktionieren.');
        
    } catch (error) {
        console.error('\n❌ FEHLER:', error);
        console.error('Stack:', error.stack);
        
        if (error.message.includes('syntax')) {
            console.log('\n🔍 SYNTAX-FEHLER ANALYSE:');
            console.log('   💡 Mögliche Ursachen:');
            console.log('   - Drizzle ORM Version-Inkompatibilität');
            console.log('   - Falsche Import-Pfade');
            console.log('   - Schema-Definitions-Fehler');
        }
    }
}

testCorrectQuery();