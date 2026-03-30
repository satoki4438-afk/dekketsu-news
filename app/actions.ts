"use server";

import { incrementViewCount, incrementFollowCount } from "@/lib/firestore";

export async function trackView(id: string): Promise<void> {
  await incrementViewCount(id);
}

export async function followArticle(id: string): Promise<void> {
  await incrementFollowCount(id);
}
