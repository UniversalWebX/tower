/**
 * =============================================================================
 * CONTENT SEEDING API - Initialize Preloaded Content
 * =============================================================================
 * 
 * This API endpoint handles the initialization of preloaded content
 * for the Tower platform, ensuring the system is never blank for new users.
 * 
 * Features:
 * - Automatic content generation on first run
 * - Batch content insertion for performance
 * - Statistics reporting
 * - Protection against multiple seedings
 * 
 * @author Tower Development Team
 * @version 2.0.0
 * @since 2026-05-04
 */

const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const { ContentSeeder } = require('@/lib/contentSeeder');

const storage = new Storage();
const seeder = new ContentSeeder();

/**
 * =============================================================================
 * POST /api/seed-content - Initialize Preloaded Content
 * =============================================================================
 * 
 * Generates and inserts preloaded content into the system.
 * 
 * @returns {NextResponse} Seeding results and statistics
 * 
 * Success Response (200):
 * ```json
 * {
 *   "success": true,
 *   "message": "Content seeded successfully",
 *   "stats": {
 *     "users": 50,
 *     "posts": 1000,
 *     "likes": 15000,
 *     "comments": 5000,
 *     "reposts": 2000
 *   }
 * }
 * ```
 * 
 * Error Responses:
 * - 400: Content already seeded
 * - 500: Internal server error
 */
export async function POST() {
  try {
    // Check if content already exists
    const data = storage.loadData();
    
    if (data.users.length > 10) {
      return NextResponse.json({ 
        error: "Content already exists",
        message: "System already has content loaded"
      }, { status: 400 });
    }
    
    console.log('Starting content seeding...');
    
    // Generate preloaded content
    const stats = await seeder.generatePreloadedContent(storage);
    
    console.log('Content seeding completed:', stats);
    
    return NextResponse.json({
      success: true,
      message: "Content seeded successfully",
      stats
    });
    
  } catch (error) {
    console.error('Content seeding error:', error);
    return NextResponse.json({ 
      error: "Internal server error",
      message: "Failed to seed content"
    }, { status: 500 });
  }
}

/**
 * =============================================================================
 * GET /api/seed-content - Check Seeding Status
 * =============================================================================
 * 
 * Checks if content has been seeded and returns current statistics.
 * 
 * @returns {NextResponse} Current content statistics
 */
export async function GET() {
  try {
    const data = storage.loadData();
    
    return NextResponse.json({
      isSeeded: data.users.length > 10,
      stats: {
        users: data.users.length,
        posts: data.posts.length,
        follows: data.follows.length,
        messages: data.messages.length,
        chats: data.chats.length
      }
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ 
      error: "Internal server error"
    }, { status: 500 });
  }
}
