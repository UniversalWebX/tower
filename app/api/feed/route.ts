import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { rankPost } from "@/lib/algorithm";
import { FEED_CANDIDATE_POOL } from "@/lib/constants";

export const dynamic = "force-dynamic";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const offset = clamp(Number(url.searchParams.get("offset") ?? 0) || 0, 0, 10_000);
  const limit = clamp(Number(url.searchParams.get("limit") ?? 18) || 18, 1, 40);

  const topicSet = new Set(user.interests.map((i) => i.topic));

  const pool = await prisma.post.findMany({
    take: FEED_CANDIDATE_POOL,
    orderBy: { createdAt: "desc" },
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

  const ranked = pool
    .map((p) => {
      const tags = p.tags.map((t) => t.tag);
      const score = rankPost({
        userAge: user.age,
        userTopics: topicSet,
        postTags: tags,
        ageMin: p.ageMin,
        ageMax: p.ageMax,
        createdAt: p.createdAt,
      });
      return { ...p, tags, score };
    })
    .sort((a, b) => b.score - a.score);

  const slice = ranked.slice(offset, offset + limit);
  const nextOffset = offset + slice.length;

  return NextResponse.json({
    posts: slice,
    nextOffset,
    hasMore: nextOffset < ranked.length,
    poolSize: ranked.length,
  });
}
