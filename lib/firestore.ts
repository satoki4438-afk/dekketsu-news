import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  view_count?: number;
  follow_count?: number;
  emoji: string;
  publishedAt: Timestamp;
  // 元記事
  source_url?: string;
  source_name?: string;
  // 本文（three_points が新フィールド、fact は旧フィールドとの互換用）
  three_points?: string;
  fact?: string;
  // 日本メディア
  japan_view: string;
  japan_source?: string;
  japan_tone?: string;
  // 海外メディア（なければ省略）
  world_view?: string;
  world_source?: string;
  world_tone?: string;
  // どっちが正しい（verdict が新フィールド、gap_analysis は旧フィールドとの互換用）
  verdict?: string;
  gap_analysis?: string;
  // 得する・損する
  winners?: string[];
  losers?: string[];
  // 生活への影響
  impacts: { icon: string; title: string; body: string }[];
  // アクション
  actions: string[];
  related_keywords: string[];
  createdAt: Timestamp;
}

type ArticleInput = Omit<Article, "id" | "createdAt" | "publishedAt"> & {
  publishedAt: string;
};

export async function saveArticles(
  articles: ArticleInput[]
): Promise<Article[]> {
  const batch = db.batch();
  const saved: Article[] = [];
  const baseMs = Timestamp.now().toMillis();

  for (let i = 0; i < articles.length; i++) {
    const { publishedAt, ...rest } = articles[i];
    const ref = db.collection("articles").doc();
    const data: Omit<Article, "id"> = {
      ...rest,
      view_count: 0,
      follow_count: 0,
      publishedAt: Timestamp.fromDate(new Date(publishedAt)),
      // バッチ内の順序を保持するため i ミリ秒ずつずらす（新しいものほど大きい値）
      createdAt: Timestamp.fromMillis(baseMs + (articles.length - 1 - i)),
    };
    batch.set(ref, data);
    saved.push({ id: ref.id, ...data });
  }

  await batch.commit();
  return saved;
}

export async function getLatestArticles(limit = 6): Promise<Article[]> {
  const snapshot = await db
    .collection("articles")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
}

export async function getAllArticles(): Promise<Article[]> {
  const snapshot = await db
    .collection("articles")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
}

export async function getArticlesByCategory(
  category: string,
  limit = 6
): Promise<Article[]> {
  const snapshot = await db
    .collection("articles")
    .where("category", "==", category)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
}

export async function getAllArticlesByCategory(category: string): Promise<Article[]> {
  const snapshot = await db
    .collection("articles")
    .where("category", "==", category)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
}

/** カーソルベースのページネーション。PAGE_SIZE+1件だけ読み取る */
export async function getArticlesCursor(
  pageSize: number,
  afterMs?: number,
  category?: string,
): Promise<{ articles: Article[]; hasMore: boolean; lastMs: number | null }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = db.collection("articles").orderBy("createdAt", "desc");
  if (category) query = query.where("category", "==", category);
  if (afterMs != null) query = query.startAfter(Timestamp.fromMillis(afterMs));
  const snapshot = await query.limit(pageSize + 1).get();
  const docs = snapshot.docs.slice(0, pageSize);
  const hasMore = snapshot.docs.length > pageSize;
  const lastDoc = docs[docs.length - 1];
  const lastMs = lastDoc ? (lastDoc.data().createdAt as Timestamp).toMillis() : null;
  return {
    articles: docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as Article)),
    hasMore,
    lastMs,
  };
}

/** 月別フィルター付きページネーション（月内は少数なのでJS側でカテゴリフィルター） */
export async function getArticlesByMonthCursor(
  pageSize: number,
  monthKey: string,
  afterMs?: number,
  category?: string,
): Promise<{ articles: Article[]; hasMore: boolean; lastMs: number | null }> {
  const [year, month] = monthKey.split("-").map(Number);
  const JST_OFFSET = 9 * 60 * 60 * 1000;
  const startUtcMs = new Date(year, month - 1, 1).getTime() - JST_OFFSET;
  const endUtcMs = new Date(year, month, 1).getTime() - JST_OFFSET;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = db
    .collection("articles")
    .where("createdAt", ">=", Timestamp.fromMillis(startUtcMs))
    .where("createdAt", "<", Timestamp.fromMillis(endUtcMs))
    .orderBy("createdAt", "desc");
  if (afterMs != null) query = query.startAfter(Timestamp.fromMillis(afterMs));
  const snapshot = await query.get();
  // カテゴリはJS側でフィルター（月内は少数なので問題なし）
  let all = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as Article));
  if (category) all = all.filter((a: Article) => a.category === category);
  const page = all.slice(0, pageSize);
  const hasMore = all.length > pageSize;
  const lastDoc = page[page.length - 1];
  const lastMs = lastDoc ? (lastDoc.createdAt as Timestamp).toMillis() : null;
  return { articles: page, hasMore, lastMs };
}

export async function getAdjacentArticles(createdAt: Timestamp): Promise<{
  newer: Article | null;
  older: Article | null;
}> {
  const [newerSnap, olderSnap] = await Promise.all([
    db.collection("articles")
      .where("createdAt", ">", createdAt)
      .orderBy("createdAt", "asc")
      .limit(1)
      .get(),
    db.collection("articles")
      .where("createdAt", "<", createdAt)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get(),
  ]);
  return {
    newer: newerSnap.empty ? null : ({ id: newerSnap.docs[0].id, ...newerSnap.docs[0].data() } as Article),
    older: olderSnap.empty ? null : ({ id: olderSnap.docs[0].id, ...olderSnap.docs[0].data() } as Article),
  };
}

export async function getArticleById(id: string): Promise<Article | null> {
  const doc = await db.collection("articles").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Article;
}

export async function getRelatedArticles(
  category: string,
  excludeId: string,
  limit = 3
): Promise<Article[]> {
  const snapshot = await db
    .collection("articles")
    .where("category", "==", category)
    .orderBy("createdAt", "desc")
    .limit(limit + 1)
    .get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Article))
    .filter((a) => a.id !== excludeId)
    .slice(0, limit);
}

export async function incrementViewCount(id: string): Promise<void> {
  await db.collection("articles").doc(id).update({
    view_count: FieldValue.increment(1),
  });
}

export async function getTopArticlesByViews(limit = 5): Promise<Article[]> {
  const snapshot = await db
    .collection("articles")
    .orderBy("view_count", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
}

export async function incrementFollowCount(id: string): Promise<void> {
  await db.collection("articles").doc(id).update({
    follow_count: FieldValue.increment(1),
  });
}

export async function getTopArticlesByFollowCount(limit = 5): Promise<Article[]> {
  const snapshot = await db
    .collection("articles")
    .orderBy("follow_count", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
}

export async function getTopFollowedKeywords(limit = 3): Promise<string[]> {
  const snapshot = await db
    .collection("articles")
    .orderBy("follow_count", "desc")
    .limit(limit)
    .get();
  const articles = snapshot.docs.map((doc) => doc.data() as Article);
  const keywords = articles.flatMap((a) => [
    ...(a.subtitle ? [a.subtitle] : []),
    ...(a.related_keywords ?? []),
  ]);
  return [...new Set(keywords)];
}

export async function searchArticles(query: string): Promise<Article[]> {
  const all = await getAllArticles();
  const q = query.toLowerCase();
  return all.filter((a) => {
    const text = [
      a.title, a.subtitle, a.three_points, a.fact,
      a.japan_view, a.world_view, a.verdict, a.gap_analysis,
    ].filter(Boolean).join(" ").toLowerCase();
    return text.includes(q);
  });
}

export async function getArticleMonths(): Promise<{ month: string; label: string; count: number }[]> {
  // createdAt フィールドだけ取得（効率化）
  const snapshot = await db
    .collection("articles")
    .select("createdAt")
    .get();

  const JST_OFFSET = 9 * 60 * 60 * 1000;
  const counts: Record<string, number> = {};

  for (const doc of snapshot.docs) {
    const ts = doc.data().createdAt as Timestamp;
    if (!ts) continue;
    const jstDate = new Date(ts.toDate().getTime() + JST_OFFSET);
    const key = `${jstDate.getUTCFullYear()}-${String(jstDate.getUTCMonth() + 1).padStart(2, "0")}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([month, count]) => ({ month, label: month.replace("-", "/"), count }))
    .sort((a, b) => b.month.localeCompare(a.month));
}

export async function getRecentArticleTitles(limit: number): Promise<string[]> {
  const snapshot = await db
    .collection("articles")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return (data.subtitle ?? data.title) as string;
  });
}
