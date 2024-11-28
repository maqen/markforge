import { beforeEach, describe, expect, test } from "vitest";
import { Markforge } from "../markforge";

describe("Markforge", () => {
  let markforge: Markforge;

  beforeEach(() => {
    markforge = new Markforge();
  });

  test("basic markdown conversion", () => {
    expect(markforge.toMarkdown("<h1>Hello World</h1>")).toBe("# Hello World");
    expect(markforge.toMarkdown("<p>Hello World</p>")).toBe("Hello World");
    expect(markforge.toMarkdown("<strong>Hello World</strong>")).toBe(
      "**Hello World**"
    );
    expect(markforge.toMarkdown("<em>Hello World</em>")).toBe("_Hello World_");
  });

  test("empty input handling", () => {
    expect(markforge.toMarkdown(null as any)).toBe("");
    expect(markforge.toMarkdown(undefined as any)).toBe("");
    expect(markforge.toMarkdown("")).toBe("");
  });

  test("custom rules", () => {
    markforge.addRule({
      filter: "span",
      replacement: (content: string) => `{${content}}`,
    });

    expect(markforge.toMarkdown("<span>wrapped</span>")).toBe("{wrapped}");
  });

  test("keep filter", () => {
    markforge.keep("div.custom");
    const html = '<div class="custom">preserved</div>';
    expect(markforge.toMarkdown(html)).toContain(html);
  });

  test("remove filter", () => {
    markforge.removeRule("style");
    expect(markforge.toMarkdown("<style>.css{}</style><p>content</p>")).toBe(
      "content"
    );
  });

  test("heading style options", () => {
    const html = "<h1>Heading</h1>";
    const atxMarkforge = new Markforge({ headingStyle: "atx" });
    const setextMarkforge = new Markforge({ headingStyle: "setext" });

    expect(atxMarkforge.toMarkdown(html)).toBe("# Heading");
    expect(setextMarkforge.toMarkdown(html)).toBe("Heading\n=======");
  });

  test("code block style options", () => {
    const html = "<pre><code>code</code></pre>";
    const indentedMarkforge = new Markforge({ codeBlockStyle: "indented" });
    const fencedMarkforge = new Markforge({ codeBlockStyle: "fenced" });

    expect(indentedMarkforge.toMarkdown(html)).toBe("    code");
    expect(fencedMarkforge.toMarkdown(html)).toBe("```\ncode\n```");
  });

  test("emphasis delimiter options", () => {
    const html = "<em>emphasis</em>";
    const underscoreMarkforge = new Markforge({ emDelimiter: "_" });
    const asteriskMarkforge = new Markforge({ emDelimiter: "*" });

    expect(underscoreMarkforge.toMarkdown(html)).toBe("_emphasis_");
    expect(asteriskMarkforge.toMarkdown(html)).toBe("*emphasis*");
  });
});
