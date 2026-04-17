import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  
  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      videoUrl: true,
      ageMin: true,
      ageMax: true,
      createdAt: true,
      author: { select: { id: true, username: true } },
      tags: { select: { tag: true } },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const tags = post.tags.map(t => t.tag);
  
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
  const post = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const isAdmin = ["Admin", "DarianBayan", "TowerAdmin"].includes(user.username);
  
  if (post.authorId !== user.id && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.post.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
