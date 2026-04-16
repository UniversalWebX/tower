export type EmbedKind = "youtube" | "video" | "link";

export function toEmbedSrc(url: string): { kind: EmbedKind; src: string } {
  const trimmed = url.trim();
  if (!trimmed) return { kind: "link", src: "" };

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return { kind: "youtube", src: `https://www.youtube.com/embed/${id}` };
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return { kind: "youtube", src: `https://www.youtube.com/embed/${v}` };
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" && parts[1]) {
        return { kind: "youtube", src: `https://www.youtube.com/embed/${parts[1]}` };
      }
      if (parts[0] === "embed" && parts[1]) {
        return { kind: "youtube", src: `https://www.youtube.com/embed/${parts[1]}` };
      }
    }
  } catch {
    // fall through
  }

  if (/^https?:\/\//i.test(trimmed) && /\.(mp4|webm|ogg)(\?|$)/i.test(trimmed)) {
    return { kind: "video", src: trimmed };
  }

  return { kind: "link", src: trimmed };
}
