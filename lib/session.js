const Storage = require('./storage');

class Session {
  constructor() {
    this.storage = new Storage();
  }

  createSession(userId) {
    return this.storage.createSession(userId);
  }

  getSessionFromRequest(req) {
    const cookieHeader = req.headers.get('cookie');
    const tokenMatch = cookieHeader?.match(/tower_session=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      console.log('No session token found');
      return null;
    }

    console.log('Session token from cookie:', token);
    
    const session = this.storage.findSession(token);
    console.log('Session found:', session);

    if (!session) {
      console.log('Session expired or invalid');
      return null;
    }

    const user = this.storage.findUserById(session.userId);
    console.log('User found:', user);

    // Check if user is suspended
    if (user && user.suspended) {
      const now = new Date();
      const suspendedUntil = new Date(user.suspendedUntil);
      
      if (now < suspendedUntil) {
        console.log('User suspended until:', suspendedUntil);
        // Return suspension info instead of null
        return { 
          suspended: true, 
          suspendedUntil: user.suspendedUntil,
          username: user.username 
        };
      } else {
        // Suspension expired, reactivate user
        this.storage.updateUser(user.id, { suspended: false, suspendedUntil: null });
        console.log('Suspension expired, user reactivated');
      }
    }

    return user;
  }

  destroySession(req) {
    const cookieHeader = req.headers.get('cookie');
    const tokenMatch = cookieHeader?.match(/tower_session=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (token) {
      this.storage.deleteSession(token);
    }
  }

  createSessionCookie(token) {
    return `tower_session=${token}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60 * 1000}`;
  }
}

module.exports = Session;
