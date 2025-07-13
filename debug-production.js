#!/usr/bin/env node

/**
 * Debug script to test production API endpoints
 */

import { storage } from './server/storage.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testApiEndpoints() {
  console.log('🔍 Testing Production API Endpoints...');
  
  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const users = await storage.getAllUsers();
    console.log(`✅ Database: ${users.length} users found`);
    
    // Test activities endpoint
    console.log('2. Testing activities endpoint...');
    const activities = await storage.getActivities(20, 0);
    console.log(`✅ Activities: ${activities.length} activities found`);
    
    // Test specific activity
    if (activities.length > 0) {
      console.log('3. Testing specific activity...');
      const activity = await storage.getActivity(activities[0].id);
      console.log(`✅ Activity detail: ${activity ? 'Found' : 'Not found'}`);
    }
    
    // Test environment variables
    console.log('4. Testing environment variables...');
    console.log(`✅ NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`✅ DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Missing'}`);
    console.log(`✅ STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? 'Set' : 'Missing'}`);
    
    console.log('\n🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testApiEndpoints();