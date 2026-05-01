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

  // Check if user is moderator
  const MODERATORS = ['darianbayan', 'Admin'];
  if (!MODERATORS.includes(user.username)) {
    return NextResponse.json({ error: "Forbidden: Moderator access required" }, { status: 403 });
  }

  try {
    const { command } = await req.json();
    
    if (!command) {
      return NextResponse.json({ error: "Command is required" }, { status: 400 });
    }

    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    
    switch (cmd) {
      case 'sptc':
        return handleSptc(parts.slice(1));
      
      case 'lockdown':
        return handleLockdown();
      
      case 'moderator':
        return handleModerator(parts.slice(1));
      
      default:
        return NextResponse.json({ error: `Unknown command: ${cmd}` }, { status: 400 });
    }

  } catch (error) {
    console.error('Console command error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function handleSptc(args) {
  if (args.length < 2) {
    return NextResponse.json({ error: "Usage: sptc [color] [username]" }, { status: 400 });
  }

  const [color, username] = args;
  const user = storage.findUser(username);
  
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const success = storage.setUserUsernameColor(user.id, color);
  if (success) {
    return NextResponse.json({ 
      message: `Set ${username}'s username color to ${color === 'default' ? 'default' : color}`,
      user: { username, color: color === 'default' ? null : color }
    });
  } else {
    return NextResponse.json({ error: "Failed to set username color" }, { status: 500 });
  }
}

function handleLockdown() {
  const settings = storage.getSiteSettings();
  const newLockdownState = !settings.lockdown;
  
  storage.updateSiteSettings({ lockdown: newLockdownState });
  
  return NextResponse.json({ 
    message: newLockdownState ? "Website locked down for non-moderators" : "Website lockdown lifted",
    lockdown: newLockdownState
  });
}

function handleModerator(args) {
  if (args.length < 2) {
    return NextResponse.json({ error: "Usage: moderator [add/revoke] [username]" }, { status: 400 });
  }

  const [action, username] = args;
  const user = storage.findUser(username);
  
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let success;
  let message;

  if (action === 'add') {
    success = storage.addModerator(username);
    message = success ? `Added ${username} as moderator` : `Failed to add ${username} as moderator`;
  } else if (action === 'revoke') {
    success = storage.removeModerator(username);
    message = success ? `Revoked moderator status from ${username}` : `Failed to revoke moderator status from ${username}`;
  } else {
    return NextResponse.json({ error: "Action must be 'add' or 'revoke'" }, { status: 400 });
  }

  if (success) {
    return NextResponse.json({ message });
  } else {
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

