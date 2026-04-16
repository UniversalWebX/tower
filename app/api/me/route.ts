import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Always 200 — client checks `user`; avoids fetch/401 quirks and mistaken redirects. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      age: user.age,
      topics: user.interests.map((i) => i.topic),
    },
  });
}
