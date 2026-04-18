// Simple test to verify memory database is working
import { memoryDb } from './lib/memory-db.js';

async function testDatabase() {
  console.log('Testing memory database...');
  
  // Create a test user
  const user = await memoryDb.createUser({
    username: 'testuser',
    passwordHash: '$2b$11$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', // 'password'
    age: 25,
    suspended: false
  });
  
  console.log('Created user:', user);
  
  // Find the user
  const foundUser = await memoryDb.findUser({ username: 'testuser' });
  console.log('Found user:', foundUser);
  
  // Create a session
  const session = await memoryDb.createSession({
    userId: user.id,
    token: 'test-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  });
  
  console.log('Created session:', session);
  
  console.log('Database test complete!');
}

testDatabase().catch(console.error);
