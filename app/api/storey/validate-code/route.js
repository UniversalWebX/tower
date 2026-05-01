const { NextResponse } = require('next/server');
const Storage = require('@/lib/storage');

const storage = new Storage();

export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Validate the subscription code
    const isValid = storage.validateSubscriptionCode(code);

    if (isValid) {
      return NextResponse.json({ 
        message: "Code validated successfully",
        valid: true 
      });
    } else {
      return NextResponse.json({ 
        error: "Invalid or already used code",
        valid: false 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Code validation error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
