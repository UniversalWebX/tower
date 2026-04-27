class Validation {
  static validatePost(data) {
    const errors = [];

    // Title validation
    if (!data.title || typeof data.title !== 'string') {
      errors.push('Title is required');
    } else if (data.title.length < 2) {
      errors.push('Title must be at least 2 characters');
    } else if (data.title.length > 140) {
      errors.push('Title must be less than 140 characters');
    }

    // Content validation (optional)
    if (data.content && typeof data.content !== 'string') {
      errors.push('Content must be a string');
    } else if (data.content && data.content.length > 2000) {
      errors.push('Content must be less than 2000 characters');
    }

    // Link URL validation (optional)
    if (data.linkUrl && typeof data.linkUrl !== 'string') {
      errors.push('Link URL must be a string');
    } else if (data.linkUrl && !this.isValidUrl(data.linkUrl)) {
      errors.push('Link URL must be a valid URL');
    }

    // Age validation
    if (!data.ageMin || typeof data.ageMin !== 'number') {
      errors.push('Minimum age is required');
    } else if (data.ageMin < 1 || data.ageMin > 120) {
      errors.push('Minimum age must be between 1 and 120');
    }

    if (!data.ageMax || typeof data.ageMax !== 'number') {
      errors.push('Maximum age is required');
    } else if (data.ageMax < 1 || data.ageMax > 120) {
      errors.push('Maximum age must be between 1 and 120');
    }

    if (data.ageMin > data.ageMax) {
      errors.push('Minimum age cannot be greater than maximum age');
    }

    // Tags validation
    if (!data.tags || !Array.isArray(data.tags)) {
      errors.push('Tags are required');
    } else if (data.tags.length < 3) {
      errors.push('At least 3 tags are required');
    } else if (data.tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    } else {
      for (let i = 0; i < data.tags.length; i++) {
        const tag = data.tags[i];
        if (typeof tag !== 'string') {
          errors.push(`Tag ${i + 1} must be a string`);
        } else if (tag.trim().length === 0) {
          errors.push(`Tag ${i + 1} cannot be empty`);
        } else if (tag.length > 50) {
          errors.push(`Tag ${i + 1} must be less than 50 characters`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static normalizeTags(tags) {
    return tags
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
  }

  static isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  static validateMessage(data) {
    const errors = [];

    if (!data.content || typeof data.content !== 'string') {
      errors.push('Message content is required');
    } else if (data.content.trim().length === 0) {
      errors.push('Message content cannot be empty');
    } else if (data.content.length > 1000) {
      errors.push('Message must be less than 1000 characters');
    }

    if (!data.chatId || typeof data.chatId !== 'string') {
      errors.push('Chat ID is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateChat(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string') {
      errors.push('Chat name is required');
    } else if (data.name.trim().length === 0) {
      errors.push('Chat name cannot be empty');
    } else if (data.name.length > 100) {
      errors.push('Chat name must be less than 100 characters');
    }

    if (!data.type || !['direct', 'group'].includes(data.type)) {
      errors.push('Chat type must be either "direct" or "group"');
    }

    if (data.type === 'group' && (!data.memberIds || !Array.isArray(data.memberIds) || data.memberIds.length < 2)) {
      errors.push('Group chat must have at least 2 members');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateUser(data) {
    const errors = [];

    // Username validation
    if (!data.username || typeof data.username !== 'string') {
      errors.push('Username is required');
    } else if (data.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    } else if (data.username.length > 30) {
      errors.push('Username must be less than 30 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    // Password validation
    if (!data.password || typeof data.password !== 'string') {
      errors.push('Password is required');
    } else if (data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    } else if (data.password.length > 100) {
      errors.push('Password must be less than 100 characters');
    }

    // Age validation
    if (!data.age || typeof data.age !== 'number') {
      errors.push('Age is required');
    } else if (data.age < 9 || data.age > 120) {
      errors.push('Age must be between 9 and 120');
    }

    // Bio validation (optional)
    if (data.bio && typeof data.bio !== 'string') {
      errors.push('Bio must be a string');
    } else if (data.bio && data.bio.length > 500) {
      errors.push('Bio must be less than 500 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = Validation;
