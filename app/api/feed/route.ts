import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db-adapter";
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

  const topicSet = new Set(user.interests.map((i: any) => i.topic));

  const pool = await db.postFindMany();

  const ranked = pool
    .map((p: any) => {
      const tags = p.tags ? p.tags.map((t: any) => t.tag) : [];
      const score = rankPost({
        userAge: user.age,
        userTopics: topicSet as Set<string>,
        postTags: tags,
        ageMin: p.ageMin,
        ageMax: p.ageMax,
        createdAt: p.createdAt,
      });
      return { ...p, tags, score };
    })
    .sort((a: any, b: any) => b.score - a.score);

  const slice = ranked.slice(offset, offset + limit);
  const nextOffset = offset + slice.length;

  return NextResponse.json({
    posts: slice,
    nextOffset,
    hasMore: nextOffset < ranked.length,
    poolSize: ranked.length,
  });
}
