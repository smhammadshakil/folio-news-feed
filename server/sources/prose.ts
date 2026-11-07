import type { StoryImage } from "../../shared/article.js";
import { httpUrl } from "../../shared/url.js";
import { stripHtml } from "./types.js";

const MAX_PARAGRAPHS = 12;
const MAX_IMAGES = 4;

export function paragraphsFromHtml(html: string): string[] {
  const paragraphs: string[] = [];
  for (const match of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = cleanText(stripHtml(match[1] ?? ""));
    if (text.length < 40) continue;
    if (paragraphs.at(-1) === text) continue;
    paragraphs.push(text);
    if (paragraphs.length >= MAX_PARAGRAPHS) break;
  }
  return paragraphs;
}

export function imagesFromHtml(html: string): StoryImage[] {
  const images: StoryImage[] = [];
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const tag = match[1] ?? "";
    const src = /(?:src|data-src)=["']([^"']+)["']/i.exec(tag)?.[1];
    const url = httpUrl(decodeHtml(src ?? ""));
    if (!url || images.some((image) => image.url === url)) continue;
    const alt = cleanText(stripHtml(/alt=["']([^"']*)["']/i.exec(tag)?.[1] ?? ""));
    images.push({ url, caption: alt || undefined });
    if (images.length >= MAX_IMAGES) break;
  }
  return images;
}

export function plainParagraphs(...parts: Array<string | undefined>): string[] {
  const paragraphs: string[] = [];
  for (const part of parts) {
    const text = cleanText(stripHtml(part ?? "").replace(/\s*\[\+\d+\s+chars\]\s*$/i, ""));
    if (text.length < 20) continue;
    if (paragraphs.at(-1) === text) continue;
    paragraphs.push(text);
    if (paragraphs.length >= MAX_PARAGRAPHS) break;
  }
  return paragraphs;
}

export function uniqueImages(images: StoryImage[]): StoryImage[] {
  const kept: StoryImage[] = [];
  for (const image of images) {
    const url = httpUrl(image.url);
    if (!url || kept.some((item) => item.url === url)) continue;
    kept.push({ url, caption: image.caption?.trim() || undefined });
    if (kept.length >= MAX_IMAGES) break;
  }
  return kept;
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}
