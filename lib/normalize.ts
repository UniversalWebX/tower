const COLLAPSE = /\s+/g;

export function normalizeTag(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(COLLAPSE, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeTopics(inputs: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of inputs) {
    const t = normalizeTag(raw);
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export function normalizeTagList(inputs: string[]): string[] {
  return normalizeTopics(inputs);
}
