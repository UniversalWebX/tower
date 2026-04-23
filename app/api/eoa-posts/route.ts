import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { EOAStorage } from "@/lib/eoa-storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = EOAStorage.getAllPosts();
  
  return NextResponse.json({
    posts,
    total: posts.length,
    lastUpdated: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { action, data } = body || {};

  try {
    switch (action) {
      case 'create': {
        const { title, videoUrl, ageMin, ageMax, tags } = data;
        
        if (!title || !ageMin || !ageMax || !tags) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newPost = EOAStorage.savePost({
          title,
          videoUrl,
          ageMin,
          ageMax,
          authorId: user.id,
          authorUsername: user.username,
          tags: Array.isArray(tags) ? tags : [tags]
        });

        return NextResponse.json({ 
          success: true, 
          post: newPost 
        });
      }

      case 'delete': {
        const { postId } = data;
        
        if (!postId) {
          return NextResponse.json({ error: "Post ID required" }, { status: 400 });
        }

        const success = EOAStorage.deletePost(postId);
        
        if (!success) {
          return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({ 
          success: true, 
          message: "Post deleted successfully" 
        });
      }

      case 'deleteAll': {
        EOAStorage.deleteAllPosts();
        
        return NextResponse.json({ 
          success: true, 
          message: "All EOA posts deleted" 
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("EOA posts API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
