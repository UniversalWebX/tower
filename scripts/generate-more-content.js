const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simple data storage path
const dataPath = path.join(__dirname, '../tower.json');

// Load existing data
let data = {
  users: [],
  sessions: [],
  posts: [],
  follows: [],
  messages: [],
  chats: [],
  chatMembers: [],
  notifications: [],
  pendingPosts: [],
  voiceCalls: []
};

if (fs.existsSync(dataPath)) {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

// Helper functions
function generateId() {
  return crypto.randomUUID();
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Create additional fake users
function createFakeUsers(count = 50) {
  const firstNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery', 'Quinn', 'Blake', 'Drew', 'Emerson', 'Finley', 'Harper', 'Kai', 'Logan', 'Nova', 'Phoenix', 'River', 'Sage', 'Sky', 'Storm', 'Terra', 'Zephyr', 'Indigo', 'Crimson', 'Violet', 'Azure', 'Iris'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King'];
  const interests = ['gaming', 'music', 'art', 'technology', 'science', 'sports', 'cooking', 'travel', 'photography', 'writing', 'coding', 'design', 'fashion', 'movies', 'books', 'nature', 'fitness', 'meditation', 'comedy', 'history', 'philosophy', 'astronomy', 'psychology', 'economics', 'politics', 'education', 'health', 'environment', 'animals', 'food'];
  
  const newUsers = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    
    const user = {
      id: generateId(),
      username: username,
      passwordHash: hashPassword('password123'),
      email: `${username}@tower.com`,
      age: Math.floor(Math.random() * 50) + 13, // 13-63
      bio: `Passionate about ${interests[Math.floor(Math.random() * interests.length)]} and exploring new ideas. Love connecting with creative minds!`,
      interests: interests.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 5) + 3),
      suspended: false,
      shadowBanned: false,
      avatar: null,
      isModerator: false,
      usernameColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    newUsers.push(user);
  }
  
  return newUsers;
}

// Generate diverse post content
function generatePostContent(index, users) {
  const author = users[Math.floor(Math.random() * users.length)];
  const categories = [
    {
      titles: ['Just discovered something amazing!', 'My latest creation', 'Thoughts on today', 'Random musings', 'Share time!'],
      contents: [
        'Been working on this project for weeks and finally ready to share. The journey taught me so much about persistence and creativity.',
        'Sometimes the smallest moments bring the greatest joy. Today I realized how important it is to appreciate the little things.',
        'Technology is evolving so fast! What are your thoughts on the future of AI and human interaction?',
        'Just finished reading an incredible book that changed my perspective. Highly recommend to everyone!',
        'Nature never ceases to amaze me. Spent the day hiking and found the most beautiful hidden spot.'
      ],
      tags: ['life', 'creativity', 'technology', 'philosophy', 'nature', 'personal', 'growth'],
      ageRange: [13, 100]
    },
    {
      titles: ['Tech Talk', 'Code Update', 'Dev Life', 'Programming Thoughts', 'Software News'],
      contents: [
        'Just deployed a new feature using React and Next.js. The performance improvements are incredible!',
        'Debugging session taught me a valuable lesson about patience and systematic problem-solving.',
        'Open source contribution highlight: Fixed a critical bug in a library I use daily. Community support is amazing!',
        'Machine learning experiment results are in! The accuracy exceeded my expectations. Time to celebrate.',
        'Web development tip: Always optimize for mobile first. Your users will thank you later.'
      ],
      tags: ['technology', 'programming', 'development', 'coding', 'webdev', 'javascript', 'react'],
      ageRange: [16, 100]
    },
    {
      titles: ['Art & Design', 'Creative Process', 'Inspiration', 'Artistic Journey', 'Design Thoughts'],
      contents: [
        'New artwork completed! This piece explores the relationship between color and emotion. What do you think?',
        'Designer block is real, but today I broke through with this concept. Sometimes stepping away helps.',
        'Typography fascination: The right font can completely transform a design. Here\'s my latest experiment.',
        'Digital art vs traditional - why not both? Mixed media approach opened up new creative possibilities.',
        'Color theory in practice: Used complementary colors to create this vibrant composition. The energy is palpable!'
      ],
      tags: ['art', 'design', 'creativity', 'visual', 'digital', 'traditional', 'inspiration'],
      ageRange: [13, 100]
    },
    {
      titles: ['Gaming Life', 'Game Review', 'Esports News', 'Gaming Thoughts', 'Player Experience'],
      contents: [
        'Just finished an incredible indie game that deserves more recognition. The storytelling is phenomenal!',
        'Speedrunning attempt: New personal best! The community around this game is so supportive and creative.',
        'Game design analysis: What makes certain games timeless while others fade away? My thoughts on the matter.',
        'Multiplayer gaming session with friends turned into an unforgettable adventure. These moments are precious.',
        'Retro gaming appreciation: Sometimes the classics remind us why we fell in love with gaming in the first place.'
      ],
      tags: ['gaming', 'esports', 'indie', 'multiplayer', 'retro', 'community', 'entertainment'],
      ageRange: [13, 100]
    },
    {
      titles: ['Music Vibes', 'New Track', 'Musical Journey', 'Sound Exploration', 'Audio Art'],
      contents: [
        'New track just dropped! Experimented with blending electronic and acoustic elements. The result surprised me.',
        'Music production tip: Less is often more. Sometimes removing elements creates more impact than adding.',
        'Live performance energy! There\'s nothing like connecting with an audience through music. Pure magic.',
        'Genre exploration: Been diving into ambient music lately. The atmospheric quality is perfect for focus work.',
        'Collaboration project with another artist yielded unexpected results. Creative synergy is a beautiful thing.'
      ],
      tags: ['music', 'production', 'performance', 'electronic', 'acoustic', 'collaboration', 'creative'],
      ageRange: [13, 100]
    },
    {
      titles: ['Food Adventures', 'Cooking Tips', 'Recipe Share', 'Culinary Journey', 'Food Thoughts'],
      contents: [
        'New recipe creation: Fusion cuisine experiment turned into something amazing. Sharing the process!',
        'Cooking life hack: This simple technique transformed my meal prep game. Efficiency meets flavor!',
        'Local restaurant discovery: Found a hidden gem that serves authentic cuisine from halfway across the world.',
        'Baking adventure: Sourdough journey continues. Each loaf teaches patience and attention to detail.',
        'Food photography tip: Natural lighting makes all the difference. Here\'s my breakfast setup!'
      ],
      tags: ['food', 'cooking', 'recipe', 'culinary', 'baking', 'restaurant', 'photography'],
      ageRange: [13, 100]
    },
    {
      titles: ['Travel Stories', 'Adventure Time', 'Travel Tips', 'Wanderlust', 'Journey Tales'],
      contents: [
        'Spontaneous road trip led to the most breathtaking sunset view. Sometimes the best plans are no plans!',
        'Travel hack learned: Pack light but smart. These 10 items made my 2-week trip effortless.',
        'Cultural immersion experience: Living like a local for a week taught me more than any guidebook could.',
        'Hidden gem discovery: Found a place not in any tourist guide. These authentic experiences are priceless.',
        'Solo travel reflections: Sometimes the journey inward is more important than the destination itself.'
      ],
      tags: ['travel', 'adventure', 'culture', 'exploration', 'wanderlust', 'solo', 'discovery'],
      ageRange: [16, 100]
    },
    {
      titles: ['Fitness Journey', 'Workout Wins', 'Health Tips', 'Training Log', 'Wellness Thoughts'],
      contents: [
        'Personal record achieved! Consistency really does pay off. Here\'s what worked for me.',
        'Morning routine transformation: Starting the day with intention changed everything about my productivity.',
        'Mental health check-in: Remember that rest is productive too. Balance is key to sustainable progress.',
        'Fitness tip: Listen to your body. Some days pushing hard is right, others gentle movement is better.',
        'Community workout session: Exercising with friends creates accountability and makes it fun!'
      ],
      tags: ['fitness', 'health', 'wellness', 'exercise', 'mental-health', 'routine', 'community'],
      ageRange: [13, 100]
    }
  ];
  
  const category = categories[Math.floor(Math.random() * categories.length)];
  const title = category.titles[Math.floor(Math.random() * category.titles.length)];
  const content = category.contents[Math.floor(Math.random() * category.contents.length)];
  const selectedTags = category.tags.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 2);
  
  return {
    title: title,
    content: `${content} Tags: ${selectedTags.join(', ')}`,
    tags: selectedTags,
    ageRange: category.ageRange,
    author: author
  };
}

// Generate thousands of posts
function generatePosts(users, count = 5000) {
  console.log(`Generating ${count} posts from ${users.length} users...`);
  
  const newPosts = [];
  
  for (let i = 0; i < count; i++) {
    const postData = generatePostContent(i, users);
    
    const post = {
      id: generateId(),
      title: postData.title,
      content: postData.content,
      authorId: postData.author.id,
      ageMin: postData.ageRange[0],
      ageMax: postData.ageRange[1],
      likes: Math.floor(Math.random() * 500) + Math.floor(Math.random() * 50),
      dislikes: Math.floor(Math.random() * 20),
      reposts: Math.floor(Math.random() * 100) + Math.floor(Math.random() * 10),
      score: Math.random() * 15 + 5,
      createdAt: new Date(Date.now() - (i * 30000)).toISOString(), // Staggered every 30 seconds
      updatedAt: new Date(Date.now() - (i * 30000)).toISOString()
    };
    
    newPosts.push(post);
    
    if (i % 500 === 0) {
      console.log(`Generated ${i + 1}/${count} posts...`);
    }
  }
  
  console.log(`Successfully generated ${count} posts!`);
  return newPosts;
}

// Generate fake engagement data
function generateEngagement(users, posts) {
  console.log('Generating fake engagement data...');
  
  const follows = [];
  const messages = [];
  
  // Generate some follows
  for (let i = 0; i < users.length * 3; i++) {
    const follower = users[Math.floor(Math.random() * users.length)];
    const following = users[Math.floor(Math.random() * users.length)];
    
    if (follower.id !== following.id) {
      follows.push({
        id: generateId(),
        followerId: follower.id,
        followingId: following.id,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }
  
  // Generate some messages
  for (let i = 0; i < users.length * 2; i++) {
    const sender = users[Math.floor(Math.random() * users.length)];
    const receiver = users[Math.floor(Math.random() * users.length)];
    
    if (sender.id !== receiver.id) {
      messages.push({
        id: generateId(),
        senderId: sender.id,
        receiverId: receiver.id,
        content: [
          'Hey! Great post earlier!',
          'Thanks for sharing your thoughts!',
          'Love your content!',
          'Let\'s connect sometime!',
          'Amazing work! Keep it up!',
          'This resonated with me so much.',
          'Your perspective is refreshing!',
          'Looking forward to more posts!'
        ][Math.floor(Math.random() * 8)],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }
  
  console.log(`Generated ${follows.length} follows and ${messages.length} messages`);
  return { follows, messages };
}

// Save data
function saveData() {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Data saved successfully!');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Main execution
function main() {
  console.log('🚀 Generating massive amount of fake content for Tower...');
  
  // Create fake users
  console.log('Creating fake users...');
  const fakeUsers = createFakeUsers(50);
  
  // Add users to existing data
  data.users.push(...fakeUsers);
  
  // Generate posts from all users (existing + new)
  const allUsers = data.users;
  const newPosts = generatePosts(allUsers, 5000);
  
  // Add posts to existing data
  data.posts.push(...newPosts);
  
  // Generate engagement data
  const { follows, messages } = generateEngagement(allUsers, newPosts);
  data.follows.push(...follows);
  data.messages.push(...messages);
  
  // Save data
  saveData();
  
  console.log('✅ Content generation complete!');
  console.log(`📊 Stats:`);
  console.log(`   Users: ${data.users.length}`);
  console.log(`   Posts: ${data.posts.length}`);
  console.log(`   Follows: ${data.follows.length}`);
  console.log(`   Messages: ${data.messages.length}`);
  console.log('🎉 Tower platform is now filled with realistic content!');
}

// Run the script
main();
