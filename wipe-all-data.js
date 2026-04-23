// Immediate data wipe script for Tower platform
import { memoryDb } from './lib/memory-db.ts';

async function wipeAllData() {
  console.log('🧹 Starting complete data wipe...');
  
  try {
    // Get all posts and delete them
    const posts = await memoryDb.findPosts({});
    console.log(`Found ${posts.length} posts to delete...`);
    
    for (const post of posts) {
      await memoryDb.deletePost(post.id);
    }
    console.log(`✅ Deleted ${posts.length} posts`);
    
    // Get all users and delete them
    const users = await memoryDb.findUsers({});
    console.log(`Found ${users.length} users to delete...`);
    
    for (const user of users) {
      // Delete user's sessions first
      await memoryDb.deleteSession({ userId: user.id });
      
      // Delete user's interests
      const interests = await memoryDb.findUserInterests({ userId: user.id });
      for (const interest of interests) {
        await memoryDb.deleteUserInterest(interest.id);
      }
      
      // Delete user
      await memoryDb.deleteUser(user.id);
    }
    console.log(`✅ Deleted ${users.length} users and their associated data`);
    
    // Get all chats and delete them
    const chats = await memoryDb.findChats({});
    console.log(`Found ${chats.length} chats to delete...`);
    
    for (const chat of chats) {
      // Delete chat members
      const members = await memoryDb.findChatMembers({ chatId: chat.id });
      for (const member of members) {
        await memoryDb.deleteChatMember(member.id);
      }
      
      // Delete chat messages
      const messages = await memoryDb.findMessages({ chatId: chat.id });
      for (const message of messages) {
        await memoryDb.deleteMessage(message.id);
      }
      
      // Delete chat
      await memoryDb.deleteChat(chat.id);
    }
    console.log(`✅ Deleted ${chats.length} chats and their associated data`);
    
    console.log('🎉 Complete data wipe finished!');
    console.log('📊 Summary:');
    console.log(`   - Posts deleted: ${posts.length}`);
    console.log(`   - Users deleted: ${users.length}`);
    console.log(`   - Chats deleted: ${chats.length}`);
    console.log('🔄 Platform is now completely empty!');
    
  } catch (error) {
    console.error('❌ Error during data wipe:', error);
    process.exit(1);
  }
}

// Run the wipe immediately
wipeAllData().then(() => {
  console.log('✨ Data wipe script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Data wipe script failed:', error);
  process.exit(1);
});
