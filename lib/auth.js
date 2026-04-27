const bcrypt = require('bcryptjs');

class Auth {
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static validatePassword(password) {
    if (!password || password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters' };
    }
    if (password.length > 100) {
      return { valid: false, error: 'Password must be less than 100 characters' };
    }
    return { valid: true };
  }

  static validateUsername(username) {
    if (!username || username.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' };
    }
    if (username.length > 30) {
      return { valid: false, error: 'Username must be less than 30 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }
    return { valid: true };
  }

  static validateAge(age) {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      return { valid: false, error: 'Age must be between 13 and 120' };
    }
    return { valid: true };
  }

  static validateEmail(email) {
    if (!email) return { valid: true }; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true };
  }

  static validateBio(bio) {
    if (!bio) return { valid: true }; // Bio is optional
    if (bio.length > 500) {
      return { valid: false, error: 'Bio must be less than 500 characters' };
    }
    return { valid: true };
  }
}

module.exports = Auth;
