"use server";

import { incrementViewCount } from "@/lib/firestore";

export async function trackView(id: string): Promise<void> {
  await incrementViewCount(id);
}
