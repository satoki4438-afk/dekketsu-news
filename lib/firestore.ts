import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

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

  for (const { publishedAt, ...rest } of articles) {
    const ref = db.collection("articles").doc();
    const data: Omit<Article, "id"> = {
      ...rest,
      publishedAt: Timestamp.fromDate(new Date(publishedAt)),
      createdAt: Timestamp.now(),
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
    .orderBy("publishedAt", "desc")
    .limit(limit)
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
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Article));
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
    .orderBy("publishedAt", "desc")
    .limit(limit + 1)
    .get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Article))
    .filter((a) => a.id !== excludeId)
    .slice(0, limit);
}

export async function getRecentArticleTitles(): Promise<string[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const snapshot = await db
    .collection("articles")
    .where("publishedAt", ">=", Timestamp.fromDate(yesterday))
    .orderBy("publishedAt", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data().title as string);
}
