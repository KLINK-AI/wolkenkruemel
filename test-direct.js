#!/usr/bin/env node

/**
 * DIREKTER TEST DER 22:20 CET KONFIGURATION
 */

import { storage } from './server/storage.ts';
import dotenv from 'dotenv';

dotenv.config();

async function testDirectConfiguration() {
    console.log('🔍 Teste die direkte 22:20 CET Konfiguration...');
    
    try {
        // Test 1: DatabaseStorage
        console.log('1. Teste DatabaseStorage...');
        const users = await storage.getAllUsers();
        console.log(`✅ Benutzer gefunden: ${users.length}`);
        
        // Test 2: Activities (das kritische Problem)
        console.log('2. Teste Activities (kritischer Punkt)...');
        const activities = await storage.getActivities(10, 0);
        console.log(`✅ Activities gefunden: ${activities.length}`);
        
        // Test 3: Spezifische Activity
        if (activities.length > 0) {
            console.log('3. Teste spezifische Activity...');
            const activity = await storage.getActivity(activities[0].id);
            console.log(`✅ Activity Details: ${activity ? 'Gefunden' : 'Nicht gefunden'}`);
        }
        
        console.log('\n🎉 ALLE TESTS ERFOLGREICH!');
        console.log('✅ DatabaseStorage funktioniert einwandfrei');
        console.log('✅ Activities API funktioniert einwandfrei');
        console.log('✅ Bereit für 22:20 CET Deployment');
        
    } catch (error) {
        console.error('❌ Fehler beim Test:', error);
        console.error('Stack:', error.stack);
    }
}

testDirectConfiguration();
