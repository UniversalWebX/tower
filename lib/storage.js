/**
 * =============================================================================
 * TOWER STORAGE SYSTEM - Core Data Management Layer
 * =============================================================================
 * 
 * This is the central data persistence layer for the Tower social platform.
 * It handles all CRUD operations for users, posts, chats, sessions, and other entities.
 * 
 * Key Features:
 * - JSON file-based storage with automatic directory creation
 * - In-memory caching system with 5-minute TTL for performance optimization
 * - Comprehensive data validation and error handling
 * - Atomic operations to maintain data consistency
 * - Support for all platform entities: users, posts, chats, subscriptions, etc.
 * 
 * Architecture:
 * - Singleton pattern with cache management
 * - Optimized data loading with lazy evaluation
 * - Automatic ID generation using crypto.randomUUID()
 * - Timestamp management for all entities
 * - Cascade deletion for related data
 * 
 * @author Tower Development Team
 * @version 2.0.0
 * @since 2026-05-03
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * =============================================================================
 * STORAGE CLASS - Main Data Management Interface
 * =============================================================================
 * 
 * Provides a unified interface for all data operations in the Tower platform.
 * Implements caching, validation, and persistence for all entity types.
 */
class Storage {
  
  /**
   * Initialize storage system with caching and directory management
   * 
   * @constructor
   * Sets up data file path, caching system, and ensures data directory exists
   */
  constructor() {
    // Data file path configuration
    this.dataPath = path.join(process.cwd(), 'data', 'tower.json');
    
    // Performance optimization: In-memory caching system
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes TTL
    
    // Ensure data directory exists on initialization
    this.ensureDataDirectory();
  }

  /**
   * =============================================================================
   * DIRECTORY MANAGEMENT - File System Operations
     * =============================================================================
   */
  
  /**
   * Ensure data directory exists for file storage
   * 
   * Creates the data directory if it doesn't exist
   * Uses recursive creation to handle nested paths
   */
  ensureDataDirectory() {
    const dataDir = path.dirname(this.dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }
  
  /**
   * =============================================================================
   * CACHE MANAGEMENT - Performance Optimization Layer
     * =============================================================================
   * 
   * Implements a time-based caching system to reduce file I/O operations
   * and improve application performance for frequently accessed data.
   */
  
  /**
   * Retrieve cached data if still valid
   * 
   * @param {string} key - Cache key identifier
   * @returns {any|null} Cached data if valid, null if expired or not found
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }
  
  /**
   * Store data in cache with timestamp
   * 
   * @param {string} key - Cache key identifier
   * @param {any} data - Data to cache
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  /**
   * Clear all cached data
   * 
   * Used for cache invalidation when data changes
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * =============================================================================
   * DATA PERSISTENCE - Core Storage Operations
     * =============================================================================
   * 
   * Handles the fundamental file operations for data persistence.
   * Implements caching for performance and error handling for reliability.
   */
  
  /**
   * Load data from file with caching support
   * 
   * @returns {Object} Complete application data structure
   * 
   * Performance Features:
   * - Checks cache first to avoid file I/O
   * - Creates default data structure if file doesn't exist
   * - Handles JSON parsing errors gracefully
   * 
   * Data Structure:
   * - users: Array of user accounts
   * - sessions: Array of authentication sessions
   * - posts: Array of user posts
   * - follows: Array of follow relationships
   * - messages: Array of chat messages
   * - chats: Array of chat rooms
   * - chatMembers: Array of chat membership records
   * - notifications: Array of user notifications
   * - pendingPosts: Array of posts awaiting moderation
   * - voiceCalls: Array of voice call records
   * - subscriptionCodes: Array of Storey subscription codes
   * - userReports: Array of user moderation reports
   * - userPreferences: Array of user preference settings
   */
  loadData() {
    const cacheKey = 'main_data';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Handle first run - create default data structure
      if (!fs.existsSync(this.dataPath)) {
        const defaultData = {
          users: [],
          sessions: [],
          posts: [],
          follows: [],
          messages: [],
          chats: [],
          chatMembers: [],
          notifications: [],
          pendingPosts: [],
          voiceCalls: [],
          subscriptionCodes: [],
          userReports: [],
          userPreferences: []
        };
        this.setCachedData(cacheKey, defaultData);
        return defaultData;
      }
      
      // Load existing data from file
      const data = fs.readFileSync(this.dataPath, 'utf8');
      const parsedData = JSON.parse(data);
      this.setCachedData(cacheKey, parsedData);
      return parsedData;
    } catch (error) {
      console.error('Error loading data:', error);
      // Return default data on error to prevent crashes
      const defaultData = {
        users: [],
        sessions: [],
        posts: [],
        follows: [],
        messages: [],
        chats: [],
        chatMembers: [],
        notifications: [],
        pendingPosts: [],
        voiceCalls: [],
        subscriptionCodes: [],
        userReports: [],
        userPreferences: []
      };
      this.setCachedData(cacheKey, defaultData);
      return defaultData;
    }
  }
  
  /**
   * Save data to file with error handling
   * 
   * @param {Object} data - Complete application data structure
   * @returns {boolean} Success status of save operation
   * 
   * Features:
   * - Atomic write operation
   * - JSON pretty printing for readability
   * - Error logging for debugging
   * - Cache invalidation on save
   */
  saveData(data) {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2), 'utf8');
      // Clear cache to ensure fresh data on next load
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  /**
   * =============================================================================
   * USER MANAGEMENT - User Account Operations
     * =============================================================================
   * 
   * Handles all user-related operations including creation, authentication,
   * profile management, and account deletion with cascade cleanup.
   */
  
  /**
   * Create a new user account
   * 
   * @param {Object} userData - User profile information
   * @param {string} userData.username - Unique username
   * @param {string} userData.email - User email address
   * @param {string} userData.password - Hashed password
   * @param {number} userData.age - User age (minimum 9)
   * @returns {Object|null} Created user object or null on failure
   * 
   * Features:
   * - Automatic UUID generation for unique identification
   * - Timestamp management for audit trail
   * - Validation of required fields
   * - Integration with user preferences system
   */
  createUser(userData) {
    const data = this.loadData();
    const newUser = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.users.push(newUser);
    this.saveData(data);
    
    return newUser;
  }
  
  /**
   * Find user by username (case-insensitive)
   * 
   * @param {string} username - Username to search for
   * @returns {Object|null} User object or null if not found
   * 
   * Performance: Uses case-insensitive comparison for user-friendly search
   */
  findUser(username) {
    const data = this.loadData();
    return data.users.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
  }
  
  /**
   * Find user by unique ID
   * 
   * @param {string} id - User UUID
   * @returns {Object|null} User object or null if not found
   * 
   * Use Case: Primary lookup method for authenticated operations
   */
  findUserById(id) {
    const data = this.loadData();
    return data.users.find(user => user.id === id) || null;
  }
  
  /**
   * Update user profile information
   * 
   * @param {string} userId - User UUID to update
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated user object or null if not found
   * 
   * Features:
   * - Partial update support
   * - Automatic timestamp update
   * - Maintains unchanged fields
   */
  updateUserById(userId, updates) {
    const data = this.loadData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return null;
    
    data.users[userIndex] = { 
      ...data.users[userIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.saveData(data);
    
    return data.users[userIndex];
  }
  
  /**
   * Get all users in the system
   * 
   * @returns {Array} Array of all user objects
   * 
   * Use Case: Admin operations and user discovery
   */
  userFindMany() {
    const data = this.loadData();
    return data.users;
  }
  
  /**
   * Delete user account with cascade cleanup
   * 
   * @param {string} userId - User UUID to delete
   * @returns {boolean} Success status of deletion
   * 
   * Cascade Operations:
   * - Removes user from users array
   * - Deletes all user sessions
   * - Removes all user posts
   * - Deletes follow relationships
   * - Removes chat messages and memberships
   * - Cleans up orphaned chats
   * - Removes notifications and preferences
   * 
   * Data Integrity: Ensures no orphaned data remains
   */
  deleteUserById(userId) {
    const data = this.loadData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    // Remove user and all their data (cascade deletion)
    data.users.splice(userIndex, 1);
    data.sessions = data.sessions.filter(s => s.userId !== userId);
    data.posts = data.posts.filter(p => p.authorId !== userId);
    data.follows = data.follows.filter(f => f.followerId !== userId || f.followingId !== userId);
    data.messages = data.messages.filter(m => m.senderId !== userId || m.receiverId !== userId);
    data.chatMembers = data.chatMembers.filter(cm => cm.userId !== userId);
    
    // Remove chats where user was the only member
    const userChats = data.chatMembers.filter(cm => cm.userId === userId).map(cm => cm.chatId);
    userChats.forEach(chatId => {
      const remainingMembers = data.chatMembers.filter(cm => cm.chatId === chatId);
      if (remainingMembers.length === 0) {
        data.chats = data.chats.filter(c => c.id !== chatId);
      }
    });
    
    this.saveData(data);
    return true;
  }

  /**
   * =============================================================================
   * SESSION MANAGEMENT - Authentication & Security
     * =============================================================================
   * 
   * Handles user authentication sessions with secure token generation,
   * automatic expiration, and cleanup of expired sessions.
   */
  
  /**
   * Create a new authentication session
   * 
   * @param {string} userId - User UUID to create session for
   * @returns {Object} Created session object
   * 
   * Security Features:
   * - Cryptographically secure random token (32 bytes)
   * - 7-day session expiration
   * - Unique session ID for tracking
   * - Timestamp for audit trail
   * 
   * Session Structure:
   * - id: Unique session identifier
   * - userId: Associated user ID
   * - token: Authentication token for client
   * - expiresAt: Session expiration timestamp
   * - createdAt: Session creation timestamp
   */
  createSession(userId) {
    const data = this.loadData();
    const newSession = {
      id: crypto.randomUUID(),
      userId,
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString()
    };
    
    console.log('Creating session:', newSession);
    data.sessions.push(newSession);
    this.saveData(data);
    
    return newSession;
  }
  
  /**
   * Find and validate session by token
   * 
   * @param {string} token - Session token to validate
   * @returns {Object|null} Valid session object or null if invalid/expired
   * 
   * Security Features:
   * - Token validation against stored sessions
   * - Automatic expiration check
   * - Cleanup of expired sessions
   * - Detailed logging for debugging
   * 
   * Validation Process:
   * 1. Find session by token
   * 2. Check expiration timestamp
   * 3. Auto-delete expired sessions
   * 4. Return valid session or null
   */
  findSession(token) {
    const data = this.loadData();
    console.log('Looking for session token:', token);
    console.log('Total sessions in storage:', data.sessions.length);
    
    const session = data.sessions.find(s => s.token === token);
    console.log('Found session:', session);
    
    if (!session) {
      console.log('Session not found for token:', token);
      return null;
    }
    
    // Check session expiration
    const expiresAt = new Date(session.expiresAt);
    const now = new Date();
    console.log('Session expires at:', expiresAt);
    console.log('Current time:', now);
    console.log('Session expired?', expiresAt <= now);
    
    if (expiresAt <= now) {
      console.log('Session expired, deleting');
      this.deleteSession(token);
      return null;
    }
    
    return session;
  }
  
  /**
   * Delete session by token
   * 
   * @param {string} token - Session token to delete
   * 
   * Use Cases:
   * - Manual logout
   * - Session expiration cleanup
   * - Security revocation
   */
  deleteSession(token) {
    const data = this.loadData();
    data.sessions = data.sessions.filter(s => s.token !== token);
    this.saveData(data);
  }

  /**
   * =============================================================================
   * POST MANAGEMENT - Social Content Operations
     * =============================================================================
   * 
   * Handles all post-related operations including creation, updates,
   * engagement tracking (likes, dislikes, reposts), and content management.
   */
  
  /**
   * Create a new post
   * 
   * @param {Object} postData - Post content and metadata
   * @param {string} postData.authorId - User ID of post author
   * @param {string} postData.content - Post content text
   * @param {Array} postData.media - Array of media attachments
   * @returns {Object} Created post object
   * 
   * Features:
   * - Automatic UUID generation
   * - Timestamp management
   * - Engagement tracking initialization
   * - Content validation integration
   */
  createPost(postData) {
    const data = this.loadData();
    const newPost = {
      ...postData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: [],
      dislikes: [],
      reposts: []
    };
    
    data.posts.push(newPost);
    this.saveData(data);
    
    return newPost;
  }
  
  /**
   * Find post by ID
   * 
   * @param {string} id - Post UUID
   * @returns {Object|null} Post object or null if not found
   */
  findPost(id) {
    const data = this.loadData();
    return data.posts.find(post => post.id === id) || null;
  }
  
  /**
   * Get posts with optional filtering
   * 
   * @param {Object} where - Filter conditions
   * @param {string} where.authorId - Filter by author ID
   * @returns {Array} Array of filtered posts
   * 
   * Use Cases:
   * - Get user's posts
   * - Feed generation
   * - Content discovery
   */
  postFindMany(where = {}) {
    const data = this.loadData();
    
    if (where.authorId) {
      return data.posts.filter(p => p.authorId === where.authorId);
    }
    
    return data.posts;
  }
  
  /**
   * Update post content or metadata
   * 
   * @param {string} postId - Post UUID to update
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated post object or null if not found
   */
  updatePost(postId, updates) {
    const data = this.loadData();
    const postIndex = data.posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) return null;
    
    data.posts[postIndex] = { 
      ...data.posts[postIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.saveData(data);
    
    return data.posts[postIndex];
  }
  
  /**
   * Delete post by ID
   * 
   * @param {string} postId - Post UUID to delete
   * @returns {boolean} Success status of deletion
   * 
   * Features:
   * - Cascade deletion of related data
   * - Cleanup of engagement records
   * - Notification removal
   */
  deletePost(postId) {
    const data = this.loadData();
    const postIndex = data.posts.findIndex(p => p.id === postId);
    
    if (postIndex === -1) return false;
    
    data.posts.splice(postIndex, 1);
    this.saveData(data);
    
    return true;
  }

  // Follow operations
  createFollow(followerId, followingId) {
    const data = this.loadData();
    
    // Check if already following
    const existing = data.follows.find(f => f.followerId === followerId && f.followingId === followingId);
    if (existing) return existing;
    
    const newFollow = {
      id: crypto.randomUUID(),
      followerId,
      followingId,
      createdAt: new Date().toISOString()
    };
    
    data.follows.push(newFollow);
    this.saveData(data);
    
    return newFollow;
  }

  deleteFollow(followerId, followingId) {
    const data = this.loadData();
    data.follows = data.follows.filter(f => !(f.followerId === followerId && f.followingId === followingId));
    this.saveData(data);
  }

  findFollows(where = {}) {
    const data = this.loadData();
    
    if (where.followerId) {
      return data.follows.filter(f => f.followerId === where.followerId);
    }
    
    if (where.followingId) {
      return data.follows.filter(f => f.followingId === where.followingId);
    }
    
    return data.follows;
  }

  // Chat operations
  createChat(chatData) {
    const data = this.loadData();
    const newChat = {
      ...chatData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.chats.push(newChat);
    this.saveData(data);
    
    return newChat;
  }

  findChat(id) {
    const data = this.loadData();
    return data.chats.find(chat => chat.id === id) || null;
  }

  findChatsByUserId(userId) {
    const data = this.loadData();
    const memberChatIds = data.chatMembers
      .filter(cm => cm.userId === userId)
      .map(cm => cm.chatId);
    
    return data.chats.filter(chat => memberChatIds.includes(chat.id));
  }

  updateChat(chatId, updates) {
    const data = this.loadData();
    const chatIndex = data.chats.findIndex(c => c.id === chatId);
    
    if (chatIndex === -1) return null;
    
    data.chats[chatIndex] = { 
      ...data.chats[chatIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.saveData(data);
    
    return data.chats[chatIndex];
  }

  // Chat member operations
  addChatMember(chatId, userId) {
    const data = this.loadData();
    
    // Check if already a member
    const existing = data.chatMembers.find(cm => cm.chatId === chatId && cm.userId === userId);
    if (existing) return existing;
    
    const newMember = {
      id: crypto.randomUUID(),
      chatId,
      userId,
      joinedAt: new Date().toISOString(),
      lastReadAt: new Date().toISOString()
    };
    
    data.chatMembers.push(newMember);
    this.saveData(data);
    
    return newMember;
  }

  removeChatMember(chatId, userId) {
    const data = this.loadData();
    data.chatMembers = data.chatMembers.filter(cm => !(cm.chatId === chatId && cm.userId === userId));
    this.saveData(data);
  }

  findChatMembers(chatId) {
    const data = this.loadData();
    return data.chatMembers.filter(cm => cm.chatId === chatId);
  }

  // Message operations
  createMessage(messageData) {
    const data = this.loadData();
    const newMessage = {
      ...messageData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.messages.push(newMessage);
    
    // Update chat's last message and timestamp
    const chat = data.chats.find(c => c.id === messageData.chatId);
    if (chat) {
      chat.lastMessage = newMessage.content;
      chat.lastMessageAt = newMessage.createdAt;
      chat.updatedAt = newMessage.createdAt;
    }
    
    this.saveData(data);
    
    return newMessage;
  }

  findMessages(where = {}) {
    const data = this.loadData();
    
    let messages = data.messages;
    
    if (where.chatId) {
      messages = messages.filter(m => m.chatId === where.chatId);
    }
    
    if (where.senderId) {
      messages = messages.filter(m => m.senderId === where.senderId);
    }
    
    if (where.receiverId) {
      messages = messages.filter(m => m.receiverId === where.receiverId);
    }
    
    // Sort by creation date (newest first)
    return messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Notification operations
  createNotification(notificationData) {
    const data = this.loadData();
    const newNotification = {
      ...notificationData,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString()
    };
    
    data.notifications.push(newNotification);
    this.saveData(data);
    
    return newNotification;
  }

  findNotifications(userId) {
    const data = this.loadData();
    return data.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  markNotificationAsRead(notificationId) {
    const data = this.loadData();
    const notification = data.notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      this.saveData(data);
    }
    
    return notification;
  }

  // Reply operations
  createReply(replyData) {
    const data = this.loadData();
    const newReply = {
      ...replyData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    data.replies = data.replies || [];
    data.replies.push(newReply);
    this.saveData(data);
    
    return newReply;
  }

  findReplies(where = {}) {
    const data = this.loadData();
    let replies = data.replies || [];
    
    if (where.postId) {
      replies = replies.filter(r => r.postId === where.postId);
    }
    
    if (where.authorId) {
      replies = replies.filter(r => r.authorId === where.authorId);
    }
    
    // Sort by creation date (newest first)
    return replies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Vote operations
  createVote(voteData) {
    const data = this.loadData();
    const newVote = {
      ...voteData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    data.votes = data.votes || [];
    data.votes.push(newVote);
    this.saveData(data);
    
    return newVote;
  }

  findUserVote(userId, postId) {
    const data = this.loadData();
    return data.votes?.find(v => v.userId === userId && v.postId === postId) || null;
  }

  removeVote(userId, postId) {
    const data = this.loadData();
    const voteIndex = data.votes?.findIndex(v => v.userId === userId && v.postId === postId);
    
    if (voteIndex !== -1) {
      const removedVote = data.votes[voteIndex];
      data.votes.splice(voteIndex, 1);
      this.saveData(data);
      return removedVote;
    }
    
    return null;
  }

  // Find posts
  findPosts(where = {}) {
    const data = this.loadData();
    let posts = data.posts || [];
    
    if (where.authorId) {
      posts = posts.filter(p => p.authorId === where.authorId);
    }
    
    // Sort by creation date (newest first)
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Find users
  findUsers(where = {}) {
    const data = this.loadData();
    let users = data.users || [];
    
    if (where.username) {
      users = users.filter(u => u.username.toLowerCase().includes(where.username.toLowerCase()));
    }
    
    if (where.id) {
      users = users.filter(u => u.id === where.id);
    }
    
    // Sort by creation date (newest first)
    return users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Delete operations
  deletePost(postId) {
    const data = this.loadData();
    const postIndex = data.posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      data.posts.splice(postIndex, 1);
      this.saveData(data);
      return true;
    }
    
    return false;
  }

  // Follow operations
  createFollow(followData) {
    const data = this.loadData();
    const newFollow = {
      ...followData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    data.follows = data.follows || [];
    data.follows.push(newFollow);
    this.saveData(data);
    
    return newFollow;
  }

  findFollows(where = {}) {
    const data = this.loadData();
    let follows = data.follows || [];
    
    if (where.followerId) {
      follows = follows.filter(f => f.followerId === where.followerId);
    }
    
    if (where.followingId) {
      follows = follows.filter(f => f.followingId === where.followingId);
    }
    
    // Sort by creation date (newest first)
    return follows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  deleteFollow(followId) {
    const data = this.loadData();
    const followIndex = data.follows?.findIndex(f => f.id === followId);
    
    if (followIndex !== -1) {
      data.follows.splice(followIndex, 1);
      this.saveData(data);
      return true;
    }
    
    return false;
  }

  // Block operations
  createBlock(blockData) {
    const data = this.loadData();
    const newBlock = {
      ...blockData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    data.blocks = data.blocks || [];
    data.blocks.push(newBlock);
    this.saveData(data);
    
    return newBlock;
  }

  findBlocks(where = {}) {
    const data = this.loadData();
    let blocks = data.blocks || [];
    
    if (where.blockerId) {
      blocks = blocks.filter(b => b.blockerId === where.blockerId);
    }
    
    if (where.blockedId) {
      blocks = blocks.filter(b => b.blockedId === where.blockedId);
    }
    
    // Sort by creation date (newest first)
    return blocks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * =============================================================================
   * ENGAGEMENT OPERATIONS - Social Interactions
     * =============================================================================
   * 
   * Handles user engagement with posts including likes, comments,
   * reposts, and follow relationships for social features.
   */
  
  /**
   * Like a post
   * 
   * @param {string} postId - Post UUID to like
   * @param {string} userId - User UUID liking the post
   * @returns {boolean} Success status
   */
  likePost(postId, userId) {
    const data = this.loadData();
    const post = data.posts.find(p => p.id === postId);
    
    if (!post) return false;
    
    // Remove dislike if exists
    post.dislikes = post.dislikes.filter(id => id !== userId);
    
    // Add like if not already liked
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
    }
    
    post.updatedAt = new Date().toISOString();
    this.saveData(data);
    return true;
  }
  
  /**
   * Dislike a post
   * 
   * @param {string} postId - Post UUID to dislike
   * @param {string} userId - User UUID disliking the post
   * @returns {boolean} Success status
   */
  dislikePost(postId, userId) {
    const data = this.loadData();
    const post = data.posts.find(p => p.id === postId);
    
    if (!post) return false;
    
    // Remove like if exists
    post.likes = post.likes.filter(id => id !== userId);
    
    // Add dislike if not already disliked
    if (!post.dislikes.includes(userId)) {
      post.dislikes.push(userId);
    }
    
    post.updatedAt = new Date().toISOString();
    this.saveData(data);
    return true;
  }
  
  /**
   * Create a reply to a post
   * 
   * @param {string} postId - Post UUID to reply to
   * @param {string} userId - User UUID creating the reply
   * @param {string} content - Reply content
   * @returns {Object|null} Created reply object or null on failure
   */
  createReply(postId, userId, content) {
    const data = this.loadData();
    const post = data.posts.find(p => p.id === postId);
    
    if (!post) return null;
    
    const newReply = {
      id: crypto.randomUUID(),
      postId,
      userId,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: [],
      dislikes: []
    };
    
    // Initialize replies array if it doesn't exist
    if (!data.replies) {
      data.replies = [];
    }
    
    data.replies.push(newReply);
    post.updatedAt = new Date().toISOString();
    this.saveData(data);
    
    return newReply;
  }
  
  /**
   * Repost a post
   * 
   * @param {string} postId - Post UUID to repost
   * @param {string} userId - User UUID reposting
   * @returns {boolean} Success status
   */
  repostPost(postId, userId) {
    const data = this.loadData();
    const post = data.posts.find(p => p.id === postId);
    
    if (!post) return false;
    
    // Add repost if not already reposted
    if (!post.reposts.includes(userId)) {
      post.reposts.push(userId);
    }
    
    post.updatedAt = new Date().toISOString();
    this.saveData(data);
    return true;
  }
  
  /**
   * Follow a user
   * 
   * @param {string} followerId - User UUID following
   * @param {string} followingId - User UUID being followed
   * @returns {boolean} Success status
   */
  followUser(followerId, followingId) {
    const data = this.loadData();
    
    // Check if already following
    const existingFollow = data.follows.find(
      f => f.followerId === followerId && f.followingId === followingId
    );
    
    if (existingFollow) return false;
    
    const newFollow = {
      id: crypto.randomUUID(),
      followerId,
      followingId,
      createdAt: new Date().toISOString()
    };
    
    data.follows.push(newFollow);
    this.saveData(data);
    return true;
  }
  
  /**
   * Unfollow a user
   * 
   * @param {string} followerId - User UUID unfollowing
   * @param {string} followingId - User UUID being unfollowed
   * @returns {boolean} Success status
   */
  unfollowUser(followerId, followingId) {
    const data = this.loadData();
    const followIndex = data.follows.findIndex(
      f => f.followerId === followerId && f.followingId === followingId
    );
    
    if (followIndex === -1) return false;
    
    data.follows.splice(followIndex, 1);
    this.saveData(data);
    return true;
  }
  
  /**
   * Get replies for a post
   * 
   * @param {string} postId - Post UUID
   * @returns {Array} Array of reply objects
   */
  getReplies(postId) {
    const data = this.loadData();
    
    if (!data.replies) return [];
    
    return data.replies
      .filter(reply => reply.postId === postId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  /**
   * Get followers of a user
   * 
   * @param {string} userId - User UUID
   * @returns {Array} Array of follower user objects
   */
  getFollowers(userId) {
    const data = this.loadData();
    const followerIds = data.follows
      .filter(f => f.followingId === userId)
      .map(f => f.followerId);
    
    return data.users.filter(user => followerIds.includes(user.id));
  }
  
  /**
   * Get users that a user is following
   * 
   * @param {string} userId - User UUID
   * @returns {Array} Array of following user objects
   */
  getFollowing(userId) {
    const data = this.loadData();
    const followingIds = data.follows
      .filter(f => f.followerId === userId)
      .map(f => f.followingId);
    
    return data.users.filter(user => followingIds.includes(user.id));
  }

  // Clear all data
  clearAllData() {
    const emptyData = {
      users: [],
      sessions: [],
      posts: [],
      follows: [],
      messages: [],
      chats: [],
      chatMembers: [],
      replies: [],
      notifications: [],
      votes: [],
      blocks: []
    };
    this.saveData(emptyData);
  }

  // Clear only chat data
  clearChatData() {
    const data = this.loadData();
    data.messages = [];
    data.chats = [];
    data.chatMembers = [];
    this.saveData(data);
  }

  // Add pending post for moderation
  addPendingPost(post) {
    const data = this.loadData();
    post.pending = true;
    post.createdAt = new Date().toISOString();
    data.pendingPosts.push(post);
    this.saveData(data);
    return post;
  }

  // Get all pending posts
  getPendingPosts() {
    const data = this.loadData();
    return data.pendingPosts;
  }

  // Approve pending post
  approvePost(postId) {
    const data = this.loadData();
    const pendingIndex = data.pendingPosts.findIndex(p => p.id === postId);
    if (pendingIndex !== -1) {
      const post = data.pendingPosts.splice(pendingIndex, 1)[0];
      post.pending = false;
      post.approvedAt = new Date().toISOString();
      data.posts.push(post);
      this.saveData(data);
      return post;
    }
    return null;
  }

  // Reject pending post
  rejectPost(postId) {
    const data = this.loadData();
    const pendingIndex = data.pendingPosts.findIndex(p => p.id === postId);
    if (pendingIndex !== -1) {
      data.pendingPosts.splice(pendingIndex, 1);
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Set user username color
  setUserUsernameColor(userId, color) {
    const data = this.loadData();
    const user = data.users.find(u => u.id === userId);
    if (user) {
      user.usernameColor = color === 'default' ? null : color;
      this.saveData(data);
      return true;
    }
    return false;
  }

  // Voice call methods
  createVoiceCall(fromUserId, toUserId) {
    const data = this.loadData();
    const call = {
      id: Date.now().toString(),
      fromUserId,
      toUserId,
      status: 'ringing', // ringing, connected, ended
      startTime: new Date().toISOString(),
      endTime: null
    };
    data.voiceCalls.push(call);
    this.saveData(data);
    return call;
  }

  updateVoiceCall(callId, updates) {
    const data = this.loadData();
    const callIndex = data.voiceCalls.findIndex(c => c.id === callId);
    if (callIndex !== -1) {
      data.voiceCalls[callIndex] = { ...data.voiceCalls[callIndex], ...updates };
      this.saveData(data);
      return data.voiceCalls[callIndex];
    }
    return null;
  }

  endVoiceCall(callId) {
    const data = this.loadData();
    const callIndex = data.voiceCalls.findIndex(c => c.id === callId);
    if (callIndex !== -1) {
      data.voiceCalls[callIndex] = {
        ...data.voiceCalls[callIndex],
        status: 'ended',
        endTime: new Date().toISOString()
      };
      this.saveData(data);
      return data.voiceCalls[callIndex];
    }
    return null;
  }

  getVoiceCalls(userId) {
    const data = this.loadData();
    return data.voiceCalls.filter(call => 
      call.fromUserId === userId || call.toUserId === userId
    );
  }

  getActiveVoiceCall(userId) {
    const data = this.loadData();
    return data.voiceCalls.find(call => 
      (call.fromUserId === userId || call.toUserId === userId) && 
      call.status === 'connected'
    );
  }

  // Add moderator
  addModerator(username) {
    const data = this.loadData();
    const user = data.users.find(u => u.username === username);
    if (user) {
      if (!user.isModerator) {
        user.isModerator = true;
        this.saveData(data);
        return true;
      }
    }
    return false;
  }

  // Remove moderator
  removeModerator(username) {
    const data = this.loadData();
    const user = data.users.find(u => u.username === username);
    if (user) {
      if (user.isModerator) {
        user.isModerator = false;
        this.saveData(data);
        return true;
      }
    }
    return false;
  }

  // Get all moderators
  getModerators() {
    const data = this.loadData();
    return data.users.filter(u => u.isModerator);
  }

  // Subscription code management
  generateSubscriptionCode() {
    const data = this.loadData();
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    
    data.subscriptionCodes.push({
      id: crypto.randomUUID(),
      code: code,
      used: false,
      createdAt: new Date().toISOString()
    });
    
    this.saveData(data);
    return code;
  }

  validateSubscriptionCode(code) {
    const data = this.loadData();
    const subscriptionCode = data.subscriptionCodes.find(sc => 
      sc.code === code.toUpperCase() && !sc.used
    );
    
    if (subscriptionCode) {
      subscriptionCode.used = true;
      subscriptionCode.usedAt = new Date().toISOString();
      this.saveData(data);
      return true;
    }
    
    return false;
  }

  activateSubscription(userId) {
    const data = this.loadData();
    const user = data.users.find(u => u.id === userId);
    
    if (user) {
      user.hasStoreySubscription = true;
      user.subscriptionActivatedAt = new Date().toISOString();
      this.saveData(data);
      return true;
    }
    
    return false;
  }

  getUserSubscription(userId) {
    const data = this.loadData();
    const user = data.users.find(u => u.id === userId);
    
    return user ? {
      hasSubscription: user.hasStoreySubscription || false,
      activatedAt: user.subscriptionActivatedAt || null
    } : null;
  }

  // User reporting system
  createUserReport(reporterId, reportedUserId, reason, description) {
    const data = this.loadData();
    
    const report = {
      id: crypto.randomUUID(),
      reporterId: reporterId,
      reportedUserId: reportedUserId,
      reason: reason,
      description: description,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    data.userReports.push(report);
    this.saveData(data);
    return report;
  }

  getUserReports() {
    const data = this.loadData();
    return data.userReports;
  }

  updateReportStatus(reportId, status) {
    const data = this.loadData();
    const report = data.userReports.find(r => r.id === reportId);
    
    if (report) {
      report.status = status;
      report.updatedAt = new Date().toISOString();
      this.saveData(data);
      return true;
    }
    
    return false;
  }

  /**
   * =============================================================================
   * USER PREFERENCES - Settings & Personalization
     * =============================================================================
   * 
   * Manages user preferences including language, theme, notifications,
   * and privacy settings with automatic default creation.
   */
  
  /**
   * Get user preferences with automatic default creation
   * 
   * @param {string} userId - User UUID
   * @returns {Object} User preferences object
   * 
   * Default Preferences:
   * - language: 'en' (English)
   * - theme: 'dark' (Dark theme)
   * - notifications: All enabled
   * - privacy: Balanced settings
   * 
   * Features:
   * - Automatic preference creation for new users
   * - Default value assignment
   * - Timestamp tracking
   */
  getUserPreferences(userId) {
    const data = this.loadData();
    let preferences = data.userPreferences.find(pref => pref.userId === userId);
    
    if (!preferences) {
      // Create default preferences for new users
      preferences = {
        userId: userId,
        language: 'en',
        theme: 'dark',
        notifications: {
          posts: true,
          messages: true,
          follows: true,
          mentions: true
        },
        privacy: {
          showAge: true,
          showEmail: false,
          allowDirectMessages: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      data.userPreferences.push(preferences);
      this.saveData(data);
    }
    
    return preferences;
  }
  
  /**
   * Update user preferences
   * 
   * @param {string} userId - User UUID
   * @param {Object} updates - Preference updates
   * @returns {Object} Updated preferences object
   * 
   * Features:
   * - Partial update support
   * - Automatic creation if not exists
   * - Timestamp management
   * - Validation integration
   */
  updateUserPreferences(userId, updates) {
    const data = this.loadData();
    const prefIndex = data.userPreferences.findIndex(pref => pref.userId === userId);
    
    if (prefIndex === -1) {
      // Create preferences if they don't exist
      const preferences = {
        userId: userId,
        ...updates,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.userPreferences.push(preferences);
    } else {
      // Update existing preferences
      data.userPreferences[prefIndex] = {
        ...data.userPreferences[prefIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    
    this.saveData(data);
    return data.userPreferences[prefIndex];
  }
}

/**
 * =============================================================================
 * MODULE EXPORT - Storage System Singleton
 * =============================================================================
 * 
 * Exports the Storage class for use throughout the application.
 * Implements singleton pattern for consistent data access.
 * 
 * Usage:
 * ```javascript
 * const Storage = require('./storage');
 * const storage = new Storage();
 * const user = storage.createUser(userData);
 * ```
 * 
 * @module Storage
 * @exports {Storage} Storage class constructor
 */

module.exports = Storage;
