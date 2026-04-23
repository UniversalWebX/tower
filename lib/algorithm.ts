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
  
  // Enhanced scoring factors
  const tagBonus = tags > 0 ? Math.log(tags + 1) * 8 : 0;
  const agePenalty = Math.abs(input.userAge - (input.ageMin + input.ageMax) / 2) * 0.1;
  const recencyBonus = fresh > 0.5 ? fresh * 6 : fresh * 3;
  const diversityBonus = input.postTags.length > 3 ? 2 : 0;
  
  // Final sophisticated score
  return Math.max(0, 
    tags * 12 * age + 
    recencyBonus + 
    tagBonus + 
    diversityBonus - 
    agePenalty
  );
}
