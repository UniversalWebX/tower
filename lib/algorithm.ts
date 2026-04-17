export function ageAffinityMultiplier(
  userAge: number,
  ageMin: number,
  ageMax: number,
): number {
  if (userAge >= ageMin && userAge <= ageMax) return 1;
  const gap = userAge < ageMin ? ageMin - userAge : userAge - ageMax;
  return Math.max(0.06, Math.exp(-gap / 5.5));
}

export function tagOverlapScore(userTopics: Set<string>, postTags: string[]): number {
  let hits = 0;
  for (const tag of postTags) {
    if (userTopics.has(tag)) hits += 1;
  }
  return hits;
}

export function freshnessBoost(createdAt: Date, now = Date.now()): number {
  const hours = Math.max(0, (now - createdAt.getTime()) / 3_600_000);
  return Math.exp(-hours / 96);
}

export function rankPost(input: {
  userAge: number;
  userTopics: Set<string>;
  postTags: string[];
  ageMin: number;
  ageMax: number;
  createdAt: Date;
}): number {
  const tags = tagOverlapScore(input.userTopics, input.postTags);
  const age = ageAffinityMultiplier(input.userAge, input.ageMin, input.ageMax);
  const fresh = freshnessBoost(input.createdAt);
  
  // Enhanced algorithm with multiple factors
  const tagScore = tags * 20; // Increased weight for tag relevance
  const ageScore = age * 15; // Strong age targeting
  const freshnessScore = fresh * 10; // Fresh content boost
  const diversityBonus = input.postTags.length >= 10 ? 5 : 0; // Bonus for diverse tagging
  const qualityBonus = tags >= 3 ? 8 : 0; // Bonus for well-matched content
  
  return tagScore + ageScore + freshnessScore + diversityBonus + qualityBonus;
}
