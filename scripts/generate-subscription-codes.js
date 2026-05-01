const Storage = require('../lib/storage');

function generateSubscriptionCodes() {
  console.log('🎟️  Generating 1000 Storey subscription codes...');
  
  const storage = new Storage();
  const codes = [];
  
  for (let i = 0; i < 1000; i++) {
    const code = storage.generateSubscriptionCode();
    codes.push(code);
    
    if (i % 100 === 0) {
      console.log(`Generated ${i + 1}/1000 codes...`);
    }
  }
  
  console.log('✅ Successfully generated 1000 subscription codes!');
  console.log('📝 Sample codes:');
  codes.slice(0, 10).forEach((code, index) => {
    console.log(`   ${index + 1}. ${code}`);
  });
  console.log(`   ... and ${codes.length - 10} more codes`);
  
  return codes;
}

// Run the script
generateSubscriptionCodes();
