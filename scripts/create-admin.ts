#!/usr/bin/env tsx

import { hashPassword } from '../lib/password';
import EncryptedStorage from '../lib/encrypted-storage';

interface AdminAccount {
  username: string;
  password: string;
  age: number;
  bio: string;
  avatar: string;
  interests: string[];
  role: 'admin';
  permissions: string[];
}

const DEFAULT_ADMIN_ACCOUNT: AdminAccount = {
  username: 'TowerAdmin',
  password: 'TowerAdmin2024!', // Change this in production
  age: 25,
  bio: 'Tower Platform Administrator',
  avatar: '',
  interests: ['Technology', 'Administration', 'Security', 'Development', 'Design'],
  role: 'admin',
  permissions: [
    'admin:users:read',
    'admin:users:write',
    'admin:users:delete',
    'admin:posts:read',
    'admin:posts:write',
    'admin:posts:delete',
    'admin:system:wipe',
    'admin:system:backup',
    'admin:system:restore',
    'admin:analytics:read',
    'admin:settings:write'
  ]
};

async function createAdminAccount() {
  console.log('🔧 Creating Tower Admin Account...\n');

  try {
    // Check if admin already exists
    const existingAdmin = EncryptedStorage.findUser(DEFAULT_ADMIN_ACCOUNT.username);
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);
      console.log('\n💡 To reset admin password, delete the data file and run this script again.');
      return;
    }

    // Hash the password
    console.log('🔐 Hashing admin password...');
    const passwordHash = await hashPassword(DEFAULT_ADMIN_ACCOUNT.password);

    // Create admin account
    console.log('👤 Creating admin account...');
    const adminUser = EncryptedStorage.createUser({
      username: DEFAULT_ADMIN_ACCOUNT.username,
      passwordHash,
      age: DEFAULT_ADMIN_ACCOUNT.age,
      bio: DEFAULT_ADMIN_ACCOUNT.bio,
      avatar: DEFAULT_ADMIN_ACCOUNT.avatar,
      interests: DEFAULT_ADMIN_ACCOUNT.interests,
      suspended: false
    });

    console.log('✅ Admin account created successfully!\n');
    console.log('📋 Admin Account Details:');
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Password: ${DEFAULT_ADMIN_ACCOUNT.password}`);
    console.log(`   Age: ${adminUser.age}`);
    console.log(`   Bio: ${adminUser.bio}`);
    console.log(`   Interests: ${adminUser.interests.join(', ')}`);
    console.log(`   Role: ${DEFAULT_ADMIN_ACCOUNT.role}`);
    console.log(`   Permissions: ${DEFAULT_ADMIN_ACCOUNT.permissions.length} granted`);
    console.log(`   Created: ${adminUser.createdAt}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log(`   Username: ${DEFAULT_ADMIN_ACCOUNT.username}`);
    console.log(`   Password: ${DEFAULT_ADMIN_ACCOUNT.password}`);
    
    console.log('\n⚠️  SECURITY REMINDER:');
    console.log('   1. Change the default password immediately!');
    console.log('   2. Use a strong, unique password');
    console.log('   3. Enable two-factor authentication if available');
    console.log('   4. Keep the admin credentials secure');
    
    console.log('\n🎯 Admin Capabilities:');
    DEFAULT_ADMIN_ACCOUNT.permissions.forEach(permission => {
      console.log(`   ✓ ${permission}`);
    });

  } catch (error) {
    console.error('❌ Failed to create admin account:', error);
    process.exit(1);
  }
}

// Additional admin templates
const ADMIN_TEMPLATES = {
  superAdmin: {
    username: 'SuperAdmin',
    password: 'SuperAdmin2024!',
    age: 30,
    bio: 'Super Administrator with full system access',
    interests: ['Technology', 'Security', 'Development', 'Infrastructure', 'DevOps'],
    permissions: [
      'admin:*', // All admin permissions
      'system:*', // All system permissions
      'user:*'    // All user permissions
    ]
  },
  
  moderator: {
    username: 'Moderator',
    password: 'Moderator2024!',
    age: 22,
    bio: 'Content Moderator',
    interests: ['Community', 'Safety', 'Content', 'Moderation', 'Support'],
    permissions: [
      'admin:posts:read',
      'admin:posts:delete',
      'admin:users:read',
      'admin:analytics:read'
    ]
  },
  
  developer: {
    username: 'Developer',
    password: 'Developer2024!',
    age: 28,
    bio: 'System Developer',
    interests: ['Development', 'API', 'Database', 'Security', 'Testing'],
    permissions: [
      'admin:system:backup',
      'admin:system:restore',
      'admin:analytics:read',
      'admin:settings:read'
    ]
  }
};

async function createMultipleAdmins() {
  console.log('🔧 Creating Multiple Admin Accounts...\n');

  for (const [templateName, template] of Object.entries(ADMIN_TEMPLATES)) {
    try {
      const existingAdmin = EncryptedStorage.findUser(template.username);
      if (existingAdmin) {
        console.log(`⚠️  ${templateName} (${template.username}) already exists`);
        continue;
      }

      const passwordHash = await hashPassword(template.password);
      const adminUser = EncryptedStorage.createUser({
        username: template.username,
        passwordHash,
        age: template.age,
        bio: template.bio,
        avatar: '',
        interests: template.interests,
        suspended: false
      });

      console.log(`✅ ${templateName} created: ${template.username}`);
    } catch (error) {
      console.error(`❌ Failed to create ${templateName}:`, error);
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Tower Admin Account Creator\n');
    console.log('Usage:');
    console.log('  npm run create-admin              # Create default admin');
    console.log('  npm run create-admin --all        # Create all admin templates');
    console.log('  npm run create-admin --help       # Show this help\n');
    console.log('Admin Templates:');
    console.log('  - TowerAdmin (default): Full admin access');
    console.log('  - SuperAdmin: Super user with all permissions');
    console.log('  - Moderator: Content moderation only');
    console.log('  - Developer: Development and system access');
    return;
  }

  if (args.includes('--all')) {
    await createMultipleAdmins();
  } else {
    await createAdminAccount();
  }

  console.log('\n🎉 Admin setup complete!');
  console.log('💾 Data saved to: data/tower-data.enc');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { createAdminAccount, createMultipleAdmins, ADMIN_TEMPLATES };
