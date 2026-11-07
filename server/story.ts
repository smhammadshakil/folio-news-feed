import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Article, ArticleDetail, StoryImage } from "../shared/article.js";
import { categoryFromGuardianSection, categoryFromNytDesk } from "../shared/categories.js";
import { httpUrl } from "../shared/url.js";
import type { Env } from "./env.js";
import { rebaseToRecent } from "./fixtures/filter.js";
import { mapHttpError, mapThrown } from "./sources/http.js";
import { recallNewsApiStory } from "./sources/newsapi.js";
import { imagesFromHtml, paragraphsFromHtml, plainParagraphs, uniqueImages } from "./sources/prose.js";
import { SourceError, stripHtml } from "./sources/types.js";

const GUARDIAN_ID = /^[a-z0-9][a-z0-9./-]{0,220}$/i;
const NYT_ID = /^nyt:\/\/[a-z0-9][a-z0-9/_-]{0,160}$/i;

export async function loadStory(id: string, env: Env, signal: AbortSignal): Promise<ArticleDetail> {
  if (id.length === 0 || id.length > 500) throw new SourceError("Unknown story");
  if (env.dataMode === "fixture") return loadFixtureStory(id);
  if (id.startsWith("guardian:")) return loadGuardianStory(id.slice("guardian:".length), env.guardianKey, signal);
  if (id.startsWith("nyt:")) return loadNytStory(id.slice("nyt:".length), env.nytKey, signal);
  if (id.startsWith("newsapi:")) return loadNewsApiStory(id, env.newsApiKey, signal);
  throw new SourceError("Unknown story");
}

async function loadFixtureStory(id: string): Promise<ArticleDetail> {
  for (const source of ["guardian", "nyt", "newsapi"]) {
    const file = path.resolve(process.cwd(), "server/fixtures", `${source}.json`);
    const articles = rebaseToRecent(JSON.parse(await readFile(file, "utf8")) as Article[]);
    const article = articles.find((item) => item.id === id);
    if (!article) continue;
    const url = httpUrl(article.url);
    if (!url) break;
    const seed = article.id.replace(/[^a-z0-9]+/gi, "-").slice(0, 48);
    const images = uniqueImages([
      article.imageUrl ? { url: article.imageUrl, caption: article.title } : { url: "" },
      { url: `https://picsum.photos/seed/${seed}-desk/960/640`, caption: "The sample desk." },
      { url: `https://picsum.photos/seed/${seed}-street/960/640`, caption: "Outside the bureau." },
    ]);
    return {
      ...article,
      url,
      imageUrl: httpUrl(article.imageUrl),
      paragraphs: [
        article.summary || article.title,
        "The picture is still forming, and the desk is holding this column for the next edition.",
        `Readers who want the original wire can continue at ${article.sourceName}.`,
      ],
      images,
    };
  }
  throw new SourceError("Unknown story");
}

async function loadGuardianStory(rawId: string, apiKey: string, signal: AbortSignal): Promise<ArticleDetail> {
  if (!apiKey) throw new SourceError("Guardian API key is not set");
  if (!GUARDIAN_ID.test(rawId) || rawId.includes("..")) throw new SourceError("Unknown story");
  const url = new URL(`https://content.guardianapis.com/${rawId}`);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("show-fields", "trailText,thumbnail,byline,body,main");
  url.searchParams.set("show-elements", "image");
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw mapHttpError("Guardian", response.status);
    const payload = (await response.json()) as {
      response?: {
        content?: {
          id?: string;
          webTitle?: string;
          webUrl?: string;
          webPublicationDate?: string;
          sectionId?: string;
          fields?: { trailText?: string; thumbnail?: string; byline?: string; body?: string; main?: string };
          elements?: { type?: string; assets?: { file?: string; typeData?: { width?: number } }[] }[];
        };
      };
    };
    const content = payload.response?.content;
    const pageUrl = httpUrl(content?.webUrl);
    if (!content?.id || !content.webTitle || !pageUrl) throw new SourceError("Unknown story");
    const body = content.fields?.body ?? "";
    const images = uniqueImages([
      ...guardianImages(content.elements, content.fields?.main, content.fields?.thumbnail),
      ...imagesFromHtml(body),
    ]);
    const summary = content.fields?.trailText ? stripHtml(content.fields.trailText) : "";
    const paragraphs = paragraphsFromHtml(body);
    return {
      id: `guardian:${content.id}`,
      title: stripHtml(content.webTitle),
      summary,
      url: pageUrl,
      imageUrl: images[0]?.url,
      publishedAt: content.webPublicationDate ?? "",
      source: "guardian",
      sourceName: "The Guardian",
      author: content.fields?.byline?.trim() || undefined,
      category: content.sectionId ? categoryFromGuardianSection(content.sectionId) : undefined,
      paragraphs: paragraphs.length > 0 ? paragraphs : plainParagraphs(summary),
      images,
    };
  } catch (error) {
    mapThrown("Guardian", error);
  }
}

function guardianImages(
  elements: { type?: string; assets?: { file?: string; typeData?: { width?: number } }[] }[] | undefined,
  main?: string,
  thumbnail?: string,
): StoryImage[] {
  const images: StoryImage[] = [];
  const mainUrl = httpUrl(main);
  if (mainUrl) images.push({ url: mainUrl });
  for (const element of elements ?? []) {
    if (element.type !== "image") continue;
    const assets = [...(element.assets ?? [])].sort((left, right) => (right.typeData?.width ?? 0) - (left.typeData?.width ?? 0));
    const file = httpUrl(assets[0]?.file);
    if (file) images.push({ url: file });
  }
  const thumb = httpUrl(thumbnail);
  if (thumb) images.push({ url: thumb });
  return images;
}

async function loadNytStory(rawId: string, apiKey: string, signal: AbortSignal): Promise<ArticleDetail> {
  if (!apiKey) throw new SourceError("New York Times API key is not set");
  if (!NYT_ID.test(rawId)) throw new SourceError("Unknown story");
  const url = new URL("https://api.nytimes.com/svc/search/v2/articlesearch.json");
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("fq", `_id:("${rawId}")`);
  try {
    const response = await fetch(url, { signal });
    if (!response.ok) throw mapHttpError("New York Times", response.status);
    const payload = (await response.json()) as {
      response?: {
        docs?: {
          _id?: string;
          web_url?: string;
          headline?: { main?: string };
          abstract?: string;
          snippet?: string;
          lead_paragraph?: string;
          pub_date?: string;
          news_desk?: string;
          byline?: { original?: string };
          multimedia?: { caption?: string; default?: { url?: string }; url?: string } | { url?: string; type?: string; legacy?: { xlarge?: string } }[];
        }[];
      };
    };
    const doc = payload.response?.docs?.[0];
    const pageUrl = httpUrl(doc?.web_url);
    if (!doc?._id || !doc.headline?.main || !pageUrl) throw new SourceError("Unknown story");
    const images = nytStoryImages(doc.multimedia);
    const summary = stripHtml(doc.abstract || doc.snippet || "");
    const byline = doc.byline?.original?.replace(/^By\s+/i, "").trim();
    return {
      id: `nyt:${doc._id}`,
      title: doc.headline.main,
      summary,
      url: pageUrl,
      imageUrl: images[0]?.url,
      publishedAt: doc.pub_date ?? "",
      source: "nyt",
      sourceName: "The New York Times",
      author: byline || undefined,
      category: categoryFromNytDesk(doc.news_desk),
      paragraphs: plainParagraphs(doc.lead_paragraph, doc.abstract, doc.snippet),
      images,
    };
  } catch (error) {
    mapThrown("New York Times", error);
  }
}

function nytStoryImages(
  multimedia: { caption?: string; default?: { url?: string }; url?: string } | { url?: string; type?: string; legacy?: { xlarge?: string } }[] | undefined,
): StoryImage[] {
  if (Array.isArray(multimedia)) {
    const image = multimedia.find((item) => item.type === "image" || Boolean(item.url));
    const raw = image?.url ?? image?.legacy?.xlarge;
    const url = raw ? httpUrl(raw.startsWith("http") ? raw : `https://static01.nyt.com/${raw.replace(/^\//, "")}`) : undefined;
    return url ? [{ url }] : [];
  }
  const url = httpUrl(multimedia?.default?.url ?? multimedia?.url);
  if (!url) return [];
  const caption = multimedia?.caption?.trim();
  return [{ url, caption: caption || undefined }];
}

async function loadNewsApiStory(id: string, apiKey: string, signal: AbortSignal): Promise<ArticleDetail> {
  const remembered = recallNewsApiStory(id);
  if (remembered) return remembered;
  if (!apiKey) throw new SourceError("NewsAPI API key is not set");
  const articleUrl = httpUrl(id.slice("newsapi:".length));
  if (!articleUrl) throw new SourceError("Unknown story");
  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", `"${articleUrl}"`);
  url.searchParams.set("pageSize", "5");
  url.searchParams.set("language", "en");
  try {
    const response = await fetch(url, { signal, headers: { "X-Api-Key": apiKey } });
    if (!response.ok) throw mapHttpError("NewsAPI", response.status);
    const payload = (await response.json()) as {
      articles?: {
        title?: string | null;
        description?: string | null;
        url?: string | null;
        urlToImage?: string | null;
        publishedAt?: string | null;
        author?: string | null;
        content?: string | null;
        source?: { name?: string | null };
      }[];
    };
    const match = (payload.articles ?? []).find((article) => httpUrl(article.url) === articleUrl);
    const pageUrl = httpUrl(match?.url);
    if (!match?.title || match.title === "[Removed]" || !pageUrl) throw new SourceError("Unknown story");
    const image = httpUrl(match.urlToImage);
    return {
      id: `newsapi:${pageUrl}`,
      title: match.title,
      summary: match.description ?? "",
      url: pageUrl,
      imageUrl: image,
      publishedAt: match.publishedAt ?? "",
      source: "newsapi",
      sourceName: match.source?.name?.trim() || "NewsAPI",
      author: match.author?.trim() || undefined,
      paragraphs: plainParagraphs(match.description ?? undefined, match.content ?? undefined),
      images: image ? [{ url: image }] : [],
    };
  } catch (error) {
    mapThrown("NewsAPI", error);
  }
}
