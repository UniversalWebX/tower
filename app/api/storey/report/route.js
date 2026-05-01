const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

export async function POST(req) {
  try {
    const user = session.getSessionFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has Storey subscription
    const subscription = storage.getUserSubscription(user.id);
    if (!subscription || !subscription.hasSubscription) {
      return NextResponse.json({ error: "Storey subscription required" }, { status: 403 });
    }

    const { reportedUserId, reason, description } = await req.json();

    if (!reportedUserId || !reason || !description) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Create the user report
    const report = storage.createUserReport(
      user.id,
      reportedUserId,
      reason,
      description
    );

    return NextResponse.json({ 
      message: "User reported successfully",
      report: report 
    });

  } catch (error) {
    console.error('User report error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const user = session.getSessionFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is moderator or has Storey subscription
    const subscription = storage.getUserSubscription(user.id);
    const isModerator = user.isModerator;
    
    if (!isModerator && (!subscription || !subscription.hasSubscription)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all user reports
    const reports = storage.getUserReports();

    // Enrich reports with user information
    const enrichedReports = reports.map(report => {
      const reporter = storage.getUserById(report.reporterId);
      const reportedUser = storage.getUserById(report.reportedUserId);
      
      return {
        ...report,
        reporterUsername: reporter?.username || 'Unknown',
        reportedUsername: reportedUser?.username || 'Unknown'
      };
    });

    return NextResponse.json({ reports: enrichedReports });

  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
