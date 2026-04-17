import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { normalizeTagList } from "@/lib/normalize";
import { TAG_MAX, TAG_MIN } from "@/lib/constants";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().min(2).max(140),
  videoUrl: z.string().min(8).max(2048),
  ageMin: z.number().int().min(1).max(120),
  ageMax: z.number().int().min(1).max(120),
  tags: z.array(z.string()).min(TAG_MIN).max(TAG_MAX),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid post payload" }, { status: 400 });
  }

  const { title, videoUrl, ageMin, ageMax, tags } = parsed.data;
  if (ageMin > ageMax) {
    return NextResponse.json({ error: "ageMin cannot be greater than ageMax" }, { status: 400 });
  }

  const normalized = normalizeTagList(tags);
  if (normalized.length < TAG_MIN || normalized.length > TAG_MAX) {
    return NextResponse.json(
      { error: `After normalization, use between ${TAG_MIN} and ${TAG_MAX} distinct tags` },
      { status: 400 },
    );
  }

  const post = await prisma.$transaction(async (tx) => {
    const p = await tx.post.create({
      data: {
        authorId: user.id,
        title,
        videoUrl,
        ageMin,
        ageMax,
      },
      select: { id: true },
    });
    await tx.postTag.createMany({
      data: normalized.map((tag) => ({ postId: p.id, tag })),
    });
    return p;
  });

  return NextResponse.json({ id: post.id });
}
