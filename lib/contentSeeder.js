/**
 * =============================================================================
 * TOWER CONTENT SEEDER - Preloaded Content System
 * =============================================================================
 * 
 * This module provides comprehensive content seeding for the Tower platform
 * with preloaded users, posts, and engagement data to ensure the system
 * is never blank for new users.
 * 
 * Key Features:
 * - Predefined user accounts with diverse profiles
 * - Thousands of sample posts across various topics
 * - Realistic engagement (likes, comments, reposts)
 * - Category-based content organization
 * - Automatic content generation on first run
 * 
 * Architecture:
 * - Content templates and generators
 * - Batch insertion for performance
 * - Realistic data patterns
 * - Category and interest matching
 * 
 * @author Tower Development Team
 * @version 2.0.0
 * @since 2026-05-04
 */

const crypto = require('crypto');

/**
 * =============================================================================
 * CONTENT TEMPLATES - Predefined Content Patterns
 * =============================================================================
 */

const userTemplates = [
  {
    username: 'TechExplorer',
    bio: 'Technology enthusiast and gadget reviewer',
    age: 25,
    interests: ['technology', 'gadgets', 'programming', 'ai'],
    avatar: null
  },
  {
    username: 'ArtisticSoul',
    bio: 'Digital artist and creative designer',
    age: 28,
    interests: ['art', 'design', 'photography', 'music'],
    avatar: null
  },
  {
    username: 'FoodieAdventures',
    bio: 'Exploring cuisines and sharing recipes',
    age: 32,
    interests: ['food', 'cooking', 'restaurants', 'travel'],
    avatar: null
  },
  {
    username: 'FitnessGuru',
    bio: 'Personal trainer and wellness coach',
    age: 29,
    interests: ['fitness', 'health', 'nutrition', 'sports'],
    avatar: null
  },
  {
    username: 'BookWorm',
    bio: 'Avid reader and literature enthusiast',
    age: 24,
    interests: ['books', 'reading', 'writing', 'literature'],
    avatar: null
  },
  {
    username: 'MusicLover',
    bio: 'Musician and concert enthusiast',
    age: 26,
    interests: ['music', 'concerts', 'instruments', 'production'],
    avatar: null
  },
  {
    username: 'TravelBug',
    bio: 'World traveler and adventure seeker',
    age: 31,
    interests: ['travel', 'adventure', 'photography', 'culture'],
    avatar: null
  },
  {
    username: 'GamingMaster',
    bio: 'Professional gamer and streamer',
    age: 22,
    interests: ['gaming', 'esports', 'streaming', 'tech'],
    avatar: null
  },
  {
    username: 'NaturePhotographer',
    bio: 'Capturing the beauty of the natural world',
    age: 27,
    interests: ['photography', 'nature', 'wildlife', 'conservation'],
    avatar: null
  },
  {
    username: 'StartupFounder',
    bio: 'Entrepreneur and innovation enthusiast',
    age: 30,
    interests: ['business', 'startups', 'innovation', 'technology'],
    avatar: null
  }
];

const postTemplates = {
  technology: [
    "Just discovered an amazing new AI tool that's completely changing my workflow! 🤖",
    "The latest smartphone release has some incredible camera features worth checking out",
    "Working on a new coding project and the results are exceeding expectations",
    "Quantum computing breakthrough announced today - this could change everything!",
    "Review: The new wireless earbuds I've been testing for the past week",
    "Machine learning tutorial thread: 1/10 - Introduction to neural networks",
    "My home office setup for maximum productivity in 2026",
    "The future of web development: What developers need to know",
    "Cybersecurity tips everyone should implement right now",
    "Comparing the top 5 cloud hosting providers for developers"
  ],
  art: [
    "Just finished this digital painting inspired by the sunset yesterday 🎨",
    "New technique I discovered for creating realistic water textures",
    "My latest character design process - from sketch to final render",
    "Exploring the intersection of AI and traditional art methods",
    "Color theory tips that transformed my digital artwork",
    "Time-lapse video of my latest illustration coming soon!",
    "The best free tools for digital artists in 2026",
    "My journey from traditional to digital art",
    "Creating stunning visual effects with open-source software",
    "Art challenge: Draw something using only 3 colors"
  ],
  food: [
    "This homemade pasta recipe is absolutely divine! 🍝 Recipe in comments",
    "Found the best coffee shop in the city - their lattes are perfection",
    "Weekend baking project: Sourdough bread from scratch",
    "Meal prep Sunday: Healthy lunches for the entire week",
    "Restaurant review: The new Italian place downtown exceeded expectations",
    "Quick 15-minute dinner idea that's both healthy and delicious",
    "My secret ingredient for the perfect chocolate chip cookies",
    "Exploring international cuisines: Today's adventure - Thai cooking",
    "Farmers market haul: Fresh ingredients for the week",
    "Wine pairing guide for beginners"
  ],
  fitness: [
    "New personal record on my morning run today! 🏃‍♂️ Feeling accomplished",
    "Home workout routine that requires zero equipment",
    "The importance of rest days in your fitness journey",
    "Meal prep Sunday: Healthy meals for the entire week",
    "My experience with intermittent fasting for the past 6 months",
    "Yoga poses that helped improve my flexibility significantly",
    "Strength training tips for beginners",
    "The mental health benefits of regular exercise",
    "Recovery day essentials: What I do after intense workouts",
    "Setting realistic fitness goals that actually work"
  ],
  books: [
    "Just finished reading 'The Midnight Library' - absolutely mind-blowing! 📚",
    "Currently reading: 'Project Hail Mary' and I can't put it down",
    "Book recommendations for sci-fi lovers - thread below",
    "My favorite reading spots for maximum comfort",
    "How I read 50 books last year (and you can too!)",
    "Book club discussion: What did everyone think of the ending?",
    "Building the perfect home library on a budget",
    "The benefits of reading physical books vs. digital",
    "Author spotlight: Underrated writers everyone should know",
    "Reading challenge update: 42/50 books completed this year"
  ],
  music: [
    "New music discovery: This artist's latest album is on repeat all day 🎵",
    "Concert review: Last night's show was absolutely incredible!",
    "Learning guitar: Week 3 progress update",
    "Creating the perfect playlist for different moods",
    "Music production tips I wish I knew when starting",
    "The vinyl collection is growing! Latest additions:",
    "Underground artists that deserve more recognition",
    "How music affects productivity and focus",
    "Live session recording from my home studio",
    "Music theory made simple for beginners"
  ],
  travel: [
    "Just arrived in Paris! The Eiffel Tower at night is breathtaking ✨",
    "Travel hack: How I save 50% on flights without sacrificing comfort",
    "Packing tips I've learned from 50+ countries visited",
    "Hidden gems in [City] that tourists never find",
    "Solo travel diary: Day 1 of my Southeast Asia adventure",
    "The best travel apps that make planning effortless",
    "Budget travel: How I explore the world on $30/day",
    "Photography tips for capturing travel memories",
    "Cultural experiences that changed my perspective",
    "Planning the ultimate road trip route across the country"
  ],
  gaming: [
    "Just hit Diamond rank in Valorant! The grind finally paid off 🎮",
    "Review: The new RPG that's taking the gaming world by storm",
    "Setup tour: My battle station for competitive gaming",
    "Tips for improving aim in FPS games",
    "Indie game spotlight: Hidden gems you might have missed",
    "The evolution of gaming graphics over the past decade",
    "Streaming setup guide for aspiring content creators",
    "Gaming chair comparison: Which one is worth the money?",
    "The mental side of competitive gaming",
    "Building a gaming PC on a budget in 2026"
  ],
  photography: [
    "Golden hour magic captured at the beach today 📸",
    "Photography tutorial: Mastering composition in 10 minutes",
    "Editing workflow that transformed my photos",
    "The best camera settings for different scenarios",
    "Building a photography portfolio that gets noticed",
    "Street photography tips from my experience",
    "Nature photography: Patience is everything",
    "Portrait lighting techniques for beginners",
    "The gear I actually use vs. what I thought I needed",
    "Photo challenge: Capture something blue every day for a week"
  ],
  business: [
    "Startup lessons learned: What I wish I knew before starting",
    "Productivity hacks that revolutionized my workday",
    "Networking tips that actually lead to opportunities",
    "The reality of entrepreneurship: Expectation vs. Reality",
    "Building a personal brand that attracts opportunities",
    "Time management strategies for busy professionals",
    "The art of the perfect pitch: What investors look for",
    "Remote work tips for maintaining productivity",
    "Financial planning for freelancers and entrepreneurs",
    "The future of work: Adapting to the new normal"
  ]
};

const engagementTemplates = {
  comments: [
    "This is amazing! Thanks for sharing 🙏",
    "I totally agree with this perspective",
    "Never thought about it this way, interesting!",
    "Could you elaborate more on this point?",
    "This is exactly what I needed to see today",
    "Adding this to my saved posts for later",
    "The quality of content here is incredible",
    "This deserves so much more recognition",
    "You've inspired me to try something similar",
    "Keep up the great work! 💪"
  ],
  reactions: ['👍', '❤️', '🔥', '👏', '🎉', '🤯', '😂', '🙌', '💯', '✨']
};

/**
 * =============================================================================
 * CONTENT SEEDER CLASS - Automated Content Generation
 * =============================================================================
 */
class ContentSeeder {
  
  /**
   * Initialize content seeder
   * 
   * @constructor
   * Sets up content generation system
   */
  constructor() {
    this.userTemplates = userTemplates;
    this.postTemplates = postTemplates;
    this.engagementTemplates = engagementTemplates;
  }
  
  /**
   * Generate comprehensive preloaded content
   * 
   * @param {Object} storage - Storage instance
   * @returns {Object} Generation statistics
   */
  async generatePreloadedContent(storage) {
    const stats = {
      users: 0,
      posts: 0,
      likes: 0,
      comments: 0,
      reposts: 0
    };
    
    // Generate users
    const users = this.generateUsers(50);
    stats.users = users.length;
    
    // Save users to storage
    users.forEach(user => {
      storage.createUser(user);
    });
    
    // Generate posts
    const posts = this.generatePosts(users, 1000);
    stats.posts = posts.length;
    
    // Save posts to storage
    posts.forEach(post => {
      storage.createPost(post);
    });
    
    // Generate engagement
    const engagement = this.generateEngagement(posts, users, storage);
    stats.likes += engagement.likes;
    stats.comments += engagement.comments;
    stats.reposts += engagement.reposts;
    
    // Create some follow relationships
    this.generateFollows(users, storage);
    
    return stats;
  }
  
  /**
   * Generate user accounts
   * 
   * @param {number} count - Number of users to generate
   * @returns {Array} Array of user objects
   */
  generateUsers(count) {
    const users = [];
    const usedUsernames = new Set();
    
    // Add template users first
    this.userTemplates.forEach(template => {
      if (!usedUsernames.has(template.username)) {
        users.push({
          ...template,
          id: crypto.randomUUID(),
          email: `${template.username.toLowerCase()}@tower.social`,
          passwordHash: '$2b$12$placeholder.hash.for.demo.user',
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          suspended: false,
          shadowBanned: false,
          hasStoreySubscription: Math.random() > 0.8,
          usernameColor: this.getRandomColor()
        });
        usedUsernames.add(template.username);
      }
    });
    
    // Generate additional random users
    while (users.length < count) {
      const username = this.generateRandomUsername(usedUsernames);
      const interests = this.getRandomInterests();
      
      users.push({
        username,
        bio: this.generateBio(interests),
        age: Math.floor(Math.random() * 40) + 18,
        interests,
        id: crypto.randomUUID(),
        email: `${username.toLowerCase()}@tower.social`,
        passwordHash: '$2b$12$placeholder.hash.for.demo.user',
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        suspended: false,
        shadowBanned: false,
        hasStoreySubscription: Math.random() > 0.8,
        usernameColor: this.getRandomColor()
      });
      
      usedUsernames.add(username);
    }
    
    return users;
  }
  
  /**
   * Generate posts from users
   * 
   * @param {Array} users - Array of user objects
   * @param {number} count - Number of posts to generate
   * @returns {Array} Array of post objects
   */
  generatePosts(users, count) {
    const posts = [];
    const categories = Object.keys(this.postTemplates);
    
    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const templates = this.postTemplates[category];
      const content = templates[Math.floor(Math.random() * templates.length)];
      
      posts.push({
        authorId: user.id,
        content,
        media: Math.random() > 0.7 ? [this.generateMediaUrl()] : [],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        likes: [],
        dislikes: [],
        reposts: [],
        category,
        isPending: false
      });
    }
    
    // Sort posts by creation date (newest first)
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  /**
   * Generate engagement (likes, comments, reposts)
   * 
   * @param {Array} posts - Array of post objects
   * @param {Array} users - Array of user objects
   * @param {Object} storage - Storage instance
   * @returns {Object} Engagement statistics
   */
  generateEngagement(posts, users, storage) {
    const stats = { likes: 0, comments: 0, reposts: 0 };
    
    posts.forEach((post, index) => {
      // Generate likes (more engagement for newer posts)
      const likeCount = Math.floor(Math.random() * Math.max(1, 50 - index * 0.05));
      for (let i = 0; i < likeCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        if (user.id !== post.authorId) {
          storage.likePost(post.id, user.id);
          stats.likes++;
        }
      }
      
      // Generate comments
      const commentCount = Math.floor(Math.random() * Math.max(1, 20 - index * 0.02));
      for (let i = 0; i < commentCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        if (user.id !== post.authorId) {
          const comment = this.engagementTemplates.comments[
            Math.floor(Math.random() * this.engagementTemplates.comments.length)
          ];
          storage.createReply(post.id, user.id, comment);
          stats.comments++;
        }
      }
      
      // Generate reposts
      if (Math.random() > 0.7) {
        const user = users[Math.floor(Math.random() * users.length)];
        if (user.id !== post.authorId) {
          storage.repostPost(post.id, user.id);
          stats.reposts++;
        }
      }
    });
    
    return stats;
  }
  
  /**
   * Generate follow relationships
   * 
   * @param {Array} users - Array of user objects
   * @param {Object} storage - Storage instance
   */
  generateFollows(users, storage) {
    users.forEach(user => {
      // Each user follows 10-30 random other users
      const followCount = Math.floor(Math.random() * 20) + 10;
      const followedUsers = new Set();
      
      for (let i = 0; i < followCount; i++) {
        const targetUser = users[Math.floor(Math.random() * users.length)];
        if (targetUser.id !== user.id && !followedUsers.has(targetUser.id)) {
          storage.followUser(user.id, targetUser.id);
          followedUsers.add(targetUser.id);
        }
      }
    });
  }
  
  /**
   * Generate random username
   * 
   * @param {Set} usedUsernames - Set of already used usernames
   * @returns {string} Unique username
   */
  generateRandomUsername(usedUsernames) {
    const adjectives = ['Cool', 'Happy', 'Smart', 'Creative', 'Bold', 'Epic', 'Zen', 'Nova', 'Luna', 'Pixel'];
    const nouns = ['Coder', 'Artist', 'Writer', 'Thinker', 'Dreamer', 'Builder', 'Maker', 'Creator', 'Explorer', 'Innovator'];
    const numbers = Math.floor(Math.random() * 9999);
    
    let username;
    do {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      username = `${adj}${noun}${numbers}`;
    } while (usedUsernames.has(username));
    
    return username;
  }
  
  /**
   * Generate random interests
   * 
   * @returns {Array} Array of interest strings
   */
  getRandomInterests() {
    const allInterests = [
      'technology', 'art', 'music', 'food', 'travel', 'fitness', 
      'reading', 'gaming', 'photography', 'business', 'science',
      'movies', 'sports', 'fashion', 'nature', 'cooking'
    ];
    
    const count = Math.floor(Math.random() * 4) + 2;
    const interests = [];
    
    while (interests.length < count) {
      const interest = allInterests[Math.floor(Math.random() * allInterests.length)];
      if (!interests.includes(interest)) {
        interests.push(interest);
      }
    }
    
    return interests;
  }
  
  /**
   * Generate bio based on interests
   * 
   * @param {Array} interests - Array of user interests
   * @returns {string} Bio string
   */
  generateBio(interests) {
    const bioTemplates = [
      `Passionate about ${interests.join(' and ')}`,
      `Exploring the world of ${interests[0]}`,
      `${interests[0]?.charAt(0).toUpperCase() + interests[0]?.slice(1)} enthusiast and ${interests[1] || 'creator'}`,
      `Living life one ${interests[0]} at a time`,
      `Professional ${interests[0]} with a love for ${interests[1] || 'creativity'}`
    ];
    
    return bioTemplates[Math.floor(Math.random() * bioTemplates.length)];
  }
  
  /**
   * Generate random username color
   * 
   * @returns {string} Hex color code
   */
  getRandomColor() {
    const colors = [
      '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#a855f7'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  /**
   * Generate random media URL
   * 
   * @returns {string} Media URL
   */
  generateMediaUrl() {
    const types = ['photo', 'video', 'gif'];
    const type = types[Math.floor(Math.random() * types.length)];
    const id = Math.floor(Math.random() * 10000);
    
    return `https://picsum.photos/seed/${id}/400/300.jpg`;
  }
}

/**
 * =============================================================================
 * MODULE EXPORT - Content Seeder
 * =============================================================================
 * 
 * Exports the ContentSeeder class for use throughout the application.
 * 
 * Usage:
 * ```javascript
 * const { ContentSeeder } = require('./contentSeeder');
 * const seeder = new ContentSeeder();
 * const stats = await seeder.generatePreloadedContent(storage);
 * ```
 */
module.exports = { ContentSeeder };
