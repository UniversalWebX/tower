/**
 * =============================================================================
 * SESSION MANAGEMENT - Authentication & Security Layer
 * =============================================================================
 * 
 * This module provides a high-level session management interface for the Tower platform.
 * It handles user authentication, session validation, cookie management, and suspension checking.
 * 
 * Key Features:
 * - Secure session token extraction from HTTP cookies
 * - Automatic session validation and expiration handling
 * - User suspension checking with automatic reactivation
 * - Secure cookie generation with proper security flags
 * - Integration with storage layer for persistence
 * 
 * Architecture:
 * - Wrapper around Storage class for session operations
 * - HTTP request parsing for session tokens
 * - Security-focused cookie management
 * - Suspension state management
 * 
 * @author Tower Development Team
 * @version 2.0.0
 * @since 2026-05-03
 */

const Storage = require('./storage');

/**
 * =============================================================================
 * SESSION CLASS - Authentication Management Interface
 * =============================================================================
 * 
 * Provides a comprehensive session management system with security features
 * and user state validation for the Tower social platform.
 */
class Session {
  
  /**
   * Initialize session management system
   * 
   * @constructor
   * Creates storage instance for data persistence
   */
  constructor() {
    this.storage = new Storage();
  }

  /**
   * Create a new authentication session
   * 
   * @param {string} userId - User UUID to create session for
   * @returns {Object} Created session object
   * 
   * Features:
   * - Delegates to storage layer for persistence
   * - Returns complete session object with token
   * - Integrates with storage security features
   */
  createSession(userId) {
    return this.storage.createSession(userId);
  }

  /**
   * Extract and validate session from HTTP request
   * 
   * @param {Request} req - Next.js request object
   * @returns {Object|null} User object or suspension info, null if invalid
   * 
   * Security Features:
   * - Secure cookie parsing for session token
   * - Session validation against storage
   * - Automatic suspension checking
   * - User reactivation on suspension expiration
   * 
   * Cookie Format:
   * - Name: tower_session
   * - Value: Secure session token
   * - Flags: HttpOnly, Secure, SameSite=Lax
   * 
   * Suspension Handling:
   * - Checks user suspension status
   * - Returns suspension info if active
   * - Auto-reactivates expired suspensions
   * 
   * @example
   * ```javascript
   * const user = session.getSessionFromRequest(req);
   * if (user && user.suspended) {
   *   // Handle suspension
   * }
   * ```
   */
  getSessionFromRequest(req) {
    // Extract session token from HTTP cookies
    const cookieHeader = req.headers.get('cookie');
    const tokenMatch = cookieHeader?.match(/tower_session=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      console.log('No session token found');
      return null;
    }

    console.log('Session token from cookie:', token);
    
    // Validate session against storage
    const session = this.storage.findSession(token);
    console.log('Session found:', session);

    if (!session) {
      console.log('Session expired or invalid');
      return null;
    }

    // Retrieve user associated with session
    const user = this.storage.findUserById(session.userId);
    console.log('User found:', user);

    // Check user suspension status
    if (user && user.suspended) {
      const now = new Date();
      const suspendedUntil = new Date(user.suspendedUntil);
      
      if (now < suspendedUntil) {
        console.log('User suspended until:', suspendedUntil);
        // Return suspension information for UI handling
        return { 
          suspended: true, 
          suspendedUntil: user.suspendedUntil,
          username: user.username 
        };
      } else {
        // Suspension expired - automatically reactivate user
        this.storage.updateUser(user.id, { suspended: false, suspendedUntil: null });
        console.log('Suspension expired, user reactivated');
      }
    }

    return user;
  }

  /**
   * Destroy session from HTTP request
   * 
   * @param {Request} req - Next.js request object
   * 
   * Use Cases:
   * - Manual logout
   * - Session revocation
   * - Security cleanup
   * 
   * Features:
   * - Extracts token from request cookies
   * - Deletes session from storage
   * - Handles missing tokens gracefully
   */
  destroySession(req) {
    const cookieHeader = req.headers.get('cookie');
    const tokenMatch = cookieHeader?.match(/tower_session=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (token) {
      this.storage.deleteSession(token);
    }
  }

  /**
   * Create secure session cookie string
   * 
   * @param {string} token - Session token to encode in cookie
   * @returns {string} Complete cookie string for HTTP headers
   * 
   * Security Features:
   * - HttpOnly: Prevents client-side JavaScript access
   * - Secure: HTTPS-only in production
   * - SameSite=Lax: Prevents CSRF while allowing navigation
   * - Path=/: Available across entire site
   * - Max-Age: 7 days expiration
   * 
   * @example
   * ```javascript
   * const cookie = session.createSessionCookie(token);
   * res.setHeader('Set-Cookie', cookie);
   * ```
   */
  createSessionCookie(token) {
    return `tower_session=${token}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60 * 1000}`;
  }
}

/**
 * =============================================================================
 * MODULE EXPORT - Session Management System
 * =============================================================================
 * 
 * Exports the Session class for use throughout the application.
 * Provides centralized authentication management for the Tower platform.
 * 
 * Usage:
 * ```javascript
 * const Session = require('./session');
 * const session = new Session();
 * const user = session.getSessionFromRequest(req);
 * ```
 * 
 * @module Session
 * @exports {Session} Session class constructor
 */

module.exports = Session;
