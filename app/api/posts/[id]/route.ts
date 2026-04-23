import { NextResponse } from "next/server";
import { db } from "@/lib/db-adapter";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  
  const post = await db.postFind(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Get author and tags
  const [author, tags] = await Promise.all([
    db.userFind({ id: post.authorId }),
    db.postTagFindMany({ postId: post.id })
  ]);

  
  return NextResponse.json({
    ...post,
    tags,
    author: post.author,
  });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  
  // Check if user owns the post or is admin
  const post = await db.postFind(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const isAdmin = ["Admin", "DarianBayan", "TowerAdmin"].includes(user.username);
  
  if (post.authorId !== user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.postDelete(post.id);

  return NextResponse.json({ success: true });
}
