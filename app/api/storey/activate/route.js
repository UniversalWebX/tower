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

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Activate the subscription
    const activated = storage.activateSubscription(userId);

    if (activated) {
      return NextResponse.json({ 
        message: "Storey subscription activated successfully",
        activated: true 
      });
    } else {
      return NextResponse.json({ 
        error: "Failed to activate subscription",
        activated: false 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Subscription activation error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
