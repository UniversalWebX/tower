const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class Storage {
  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'tower.json');
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  // Cache management methods
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // Optimized data loading with caching
  loadData() {
    const cacheKey = 'main_data';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
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
      const data = fs.readFileSync(this.dataPath, 'utf8');
      const parsedData = JSON.parse(data);
      this.setCachedData(cacheKey, parsedData);
      return parsedData;
    } catch (error) {
      console.error('Error loading data:', error);
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

  saveData(data) {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  // User operations
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

  findUser(username) {
    const data = this.loadData();
    return data.users.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
  }

  findUserById(id) {
    const data = this.loadData();
    return data.users.find(user => user.id === id) || null;
  }

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

  userFindMany() {
    const data = this.loadData();
    return data.users;
  }

  deleteUserById(userId) {
    const data = this.loadData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return false;
    
    // Remove user and all their data
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

  // Session operations
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

  deleteSession(token) {
    const data = this.loadData();
    data.sessions = data.sessions.filter(s => s.token !== token);
    this.saveData(data);
  }

  // Post operations
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

  findPost(id) {
    const data = this.loadData();
    return data.posts.find(post => post.id === id) || null;
  }

  postFindMany(where = {}) {
    const data = this.loadData();
    
    if (where.authorId) {
      return data.posts.filter(p => p.authorId === where.authorId);
    }
    
    return data.posts;
  }

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

  // User preferences management
  getUserPreferences(userId) {
    const data = this.loadData();
    let preferences = data.userPreferences.find(pref => pref.userId === userId);
    
    if (!preferences) {
      // Create default preferences
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

module.exports = Storage;
