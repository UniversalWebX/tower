/**
 * =============================================================================
 * AUTHENTICATION API - User Login & Session Management
 * =============================================================================
 * 
 * This API endpoint handles user authentication, login validation,
 * and session management for the Tower social platform.
 * 
 * Key Features:
 * - Secure password verification with bcrypt
 * - Session creation and cookie management
 * - User suspension checking
 * - Comprehensive error handling
 * - User profile retrieval
 * 
 * Security Measures:
 * - Password hashing verification
 * - Secure session token generation
 * - HttpOnly cookies to prevent XSS
 * - Environment-based HTTPS enforcement
 * 
 * @author Tower Development Team
 * @version 2.0.0
 * @since 2026-05-03
 */

const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Auth = require('@/lib/auth');
const Session = require('@/lib/session');

// Initialize dependencies for data persistence and authentication
const storage = new Storage();
const session = new Session();

/**
 * =============================================================================
 * POST /api/auth/login - User Authentication
 * =============================================================================
 * 
 * Handles user login requests with credential validation and session creation.
 * 
 * @param {Request} req - Next.js request object
 * @returns {NextResponse} Authentication response with session cookie
 * 
 * Request Body:
 * ```json
 * {
 *   "username": "string",
 *   "password": "string"
 * }
 * ```
 * 
 * Success Response (200):
 * ```json
 * {
 *   "success": true,
 *   "user": {
 *     "id": "uuid",
 *     "username": "string",
 *     "age": "number",
 *     "bio": "string",
 *     "avatar": "string"
 *   }
 * }
 * ```
 * 
 * Error Responses:
 * - 400: Missing username or password
 * - 401: Invalid credentials
 * - 403: Account suspended
 * - 500: Internal server error
 * 
 * Security Features:
 * - bcrypt password verification
 * - Secure session cookie attachment
 * - Suspension status checking
 * - Comprehensive error logging
 */
export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    // Input validation
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    // User lookup
    const user = storage.findUser(username);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Suspension checking
    if (user.suspended) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    // Password verification using bcrypt
    const isValid = await Auth.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create authentication session
    const sessionData = storage.createSession(user.id);
    console.log('Session created:', sessionData);

    // Build response with user data
    const response = NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        age: user.age,
        bio: user.bio,
        avatar: user.avatar
      }
    });
    
    // Attach secure session cookie
    response.cookies.set('tower_session', sessionData.token, {
      httpOnly: true,                    // Prevent XSS attacks
      secure: process.env.NODE_ENV === 'production',  // HTTPS-only in production
      sameSite: 'lax',                   // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days expiration
      path: '/',                         // Available site-wide
    });

    console.log('Session cookie attached:', sessionData.token);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * =============================================================================
 * GET /api/auth/login - Current User Session
 * =============================================================================
 * 
 * Retrieves the current authenticated user's profile information.
 * Validates session and returns user data for authenticated requests.
 * 
 * @param {Request} req - Next.js request object
 * @returns {NextResponse} User profile data or error
 * 
 * Success Response (200):
 * ```json
 * {
 *   "id": "uuid",
 *   "username": "string",
 *   "age": "number",
 *   "bio": "string",
 *   "avatar": "string",
 *   "interests": ["string"],
 *   "suspended": "boolean",
 *   "shadowBanned": "boolean"
 * }
 * ```
 * 
 * Error Responses:
 * - 401: Unauthorized (no valid session)
 * 
 * Use Cases:
 * - User profile loading
 * - Session validation
 * - Authentication status checking
 * - User preference retrieval
 */
export async function GET(req) {
  // Validate session and retrieve user
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return comprehensive user profile
  return NextResponse.json({ 
    id: user.id, 
    username: user.username, 
    age: user.age,
    bio: user.bio,
    avatar: user.avatar,
    interests: user.interests || [],
    suspended: user.suspended || false,
    shadowBanned: user.shadowBanned || false
  });
}
