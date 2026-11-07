import { describe, expect, it } from "vitest";
import { imagesFromHtml, paragraphsFromHtml, plainParagraphs } from "./prose.js";

describe("story prose", () => {
  it("keeps article paragraphs and picture addresses", () => {
    const html = `
      <p>Short.</p>
      <p>Coastal cities are rewriting their storm plans before the next season arrives.</p>
      <img src="https://images.example/one.jpg" alt="Waves at the sea wall" />
      <p>Coastal cities are rewriting their storm plans before the next season arrives.</p>
      <img src="javascript:alert(1)" alt="bad" />
    `;
    expect(paragraphsFromHtml(html)).toEqual([
      "Coastal cities are rewriting their storm plans before the next season arrives.",
    ]);
    expect(imagesFromHtml(html)).toEqual([{ url: "https://images.example/one.jpg", caption: "Waves at the sea wall" }]);
  });

  it("drops the NewsAPI truncation marker", () => {
    expect(plainParagraphs("A dispatch from the bureau. [+1200 chars]")).toEqual(["A dispatch from the bureau."]);
  });
});
