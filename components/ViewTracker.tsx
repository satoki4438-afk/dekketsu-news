"use client";

import { useEffect } from "react";
import { trackView } from "@/app/actions";

export default function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    trackView(articleId);
  }, [articleId]);
  return null;
}
