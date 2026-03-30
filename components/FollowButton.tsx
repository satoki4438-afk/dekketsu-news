"use client";

import { useState, useEffect } from "react";
import { followArticle } from "@/app/actions";

export default function FollowButton({ articleId }: { articleId: string }) {
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    const key = `followed_${articleId}`;
    setFollowed(localStorage.getItem(key) === "1");
  }, [articleId]);

  const handleClick = async () => {
    if (followed) return;
    await followArticle(articleId);
    localStorage.setItem(`followed_${articleId}`, "1");
    setFollowed(true);
  };

  return (
    <button
      onClick={handleClick}
      disabled={followed}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
      style={
        followed
          ? {
              background: "rgba(245,200,66,0.15)",
              color: "var(--accent)",
              border: "1px solid rgba(245,200,66,0.4)",
              cursor: "default",
            }
          : {
              background: "var(--surface)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }
      }
    >
      <span>{followed ? "👣" : "👣"}</span>
      <span>{followed ? "おっかけ中" : "おっかける"}</span>
    </button>
  );
}
