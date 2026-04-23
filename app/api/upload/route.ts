import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db-adapter";

export const dynamic = "force-dynamic";

const uploadSchema = z.object({
  file: z.string().min(1, "File data is required"),
  filename: z.string().min(1, "Filename is required"),
  contentType: z.string().min(1, "Content type is required"),
  size: z.number().min(1, "File size is required")
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images and videos are allowed." }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const uniqueFilename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

    // In production, you'd upload to cloud storage
    // For demo, we'll return the file info
    const fileInfo = {
      originalName: file.name,
      uniqueName: uniqueFilename,
      size: file.size,
      type: file.type,
      url: `/uploads/${uniqueFilename}`, // In production, this would be a cloud URL
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.username
    };

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      file: fileInfo
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // In production, this would list files from cloud storage
  return NextResponse.json({
    files: [], // Placeholder - would be actual file list
    message: "Upload endpoint ready"
  });
}
