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
    expect(
      markforge.toMarkdown(
        "<html><body><div><h1>Hello, world!</h1></div></body></html>"
      )
    ).toBe("# Hello, world!");
    expect(
      markforge.toMarkdown(
        `<html>
          <body>
          <div>
            <h1>Hello, world!</h1>
            <table>
            <tr>
            <th>header</th>
            <th>header</th>
            </tr>
              <tr><td>cell</td><td>cell</td></tr>
              <tr><td>cell</td><td>cell</td></tr>
            </table>
          </div>
          <p>paragraph</p>
          <ul>
            <li>item</li>
            <li>item</li>
          </ul>
          <div>
            <p>paragraph</p>
          </div>
          <p><a href="https://example.com">link</a></p>
          <p><strong>strong</strong>Inline <a href="https://example.com">link</a> here</p>
          </body>
        </html>`
      )
    ).toBe(
      "# Hello, world!\n\n| header | header |\n| --- | --- |\n| cell | cell |\n| cell | cell |\n\nparagraph\n\n- item\n- item\n\nparagraph\n\n[link](https://example.com)\n\n**strong**Inline [link](https://example.com) here\n"
    );
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

  test("custom inline link rule", () => {
    markforge.addRule({
      filter: (node) => {
        return node.tagName === "a" && Boolean(node.attribs.href);
      },
      replacement: (content, node) => {
        const href = node.attribs.href.trim();
        let link = href;
        const title = node.attribs.title ? `"${node.attribs.title}"` : "";
        if (title) link = `${href} ${title}`;
        return `[${content.trim()}](${link})`;
      },
    });

    // Test basic link
    expect(
      markforge.toMarkdown('<a href="https://example.com">Example</a>')
    ).toBe("[Example](https://example.com)");

    // Test link with title
    expect(
      markforge.toMarkdown(
        '<a href="https://example.com" title="Visit Example">Example</a>'
      )
    ).toBe('[Example](https://example.com "Visit Example")');

    // Test link with spaces in href and content
    expect(
      markforge.toMarkdown(
        '<a href=" https://example.com/path " title="Example Title"> Link Text </a>'
      )
    ).toBe('[Link Text](https://example.com/path "Example Title")');
  });
});
