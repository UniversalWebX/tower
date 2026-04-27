const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');
const Session = require('@/lib/session');

const storage = new Storage();
const session = new Session();

export async function POST(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, callId, toUserId } = await req.json();
    
    switch (action) {
      case 'start':
        if (!toUserId) {
          return NextResponse.json({ error: "Target user ID is required" }, { status: 400 });
        }
        
        const call = storage.createVoiceCall(user.id, toUserId);
        return NextResponse.json({ 
          message: "Voice call initiated",
          call 
        });
        
      case 'accept':
        if (!callId) {
          return NextResponse.json({ error: "Call ID is required" }, { status: 400 });
        }
        
        const updatedCall = storage.updateVoiceCall(callId, { 
          status: 'connected',
          connectedAt: new Date().toISOString()
        });
        
        if (updatedCall) {
          return NextResponse.json({ 
            message: "Call accepted",
            call: updatedCall 
          });
        } else {
          return NextResponse.json({ error: "Call not found" }, { status: 404 });
        }
        
      case 'reject':
        if (!callId) {
          return NextResponse.json({ error: "Call ID is required" }, { status: 400 });
        }
        
        const endedCall = storage.endVoiceCall(callId);
        if (endedCall) {
          return NextResponse.json({ 
            message: "Call rejected",
            call: endedCall 
          });
        } else {
          return NextResponse.json({ error: "Call not found" }, { status: 404 });
        }
        
      case 'end':
        if (!callId) {
          return NextResponse.json({ error: "Call ID is required" }, { status: 400 });
        }
        
        const finalCall = storage.endVoiceCall(callId);
        if (finalCall) {
          return NextResponse.json({ 
            message: "Call ended",
            call: finalCall 
          });
        } else {
          return NextResponse.json({ error: "Call not found" }, { status: 404 });
        }
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Voice call error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  const user = session.getSessionFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userCalls = storage.getVoiceCalls(user.id);
    return NextResponse.json({ calls: userCalls });
  } catch (error) {
    console.error('Get voice calls error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
