import { describe, expect, test, beforeEach } from "vitest";
import Markforge from "../markforge";

describe("GitHub Flavored Markdown", () => {
  let markforge: Markforge;

  beforeEach(() => {
    markforge = new Markforge();
  });

  test("strikethrough", () => {
    expect(markforge.toMarkdown("<del>deleted</del>")).toBe("~~deleted~~");
    expect(markforge.toMarkdown("<strike>struck</strike>")).toBe("~~struck~~");
  });

  describe("tables", () => {
    test("basic table structure", () => {
      expect(
        markforge
          .toMarkdown(
            `
        <table>
          <thead>
            <tr>
              <th>foo</th>
              <th>bar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>baz</td>
              <td>bim</td>
            </tr>
          </tbody>
        </table>
      `
          )
          .trim()
      ).toBe("| foo | bar |\n| --- | --- |\n| baz | bim |");
    });

    test("cell alignment", () => {
      expect(
        markforge
          .toMarkdown(
            `
        <table>
          <thead>
            <tr>
              <th align="left">abc</th>
              <th align="center">defghi</th>
              <th align="right">jk</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td align="left">left</td>
              <td align="center">center</td>
              <td align="right">right</td>
            </tr>
          </tbody>
        </table>
      `
          )
          .trim()
      ).toBe(
        "| abc | defghi | jk |\n" +
          "| :-- | :-: | --: |\n" +
          "| left | center | right |"
      );
    });

    test("escaping pipes and formatting", () => {
      expect(
        markforge
          .toMarkdown(
            `
        <table>
          <thead>
            <tr>
              <th>f|oo</th>
              <th>b*az</th>
              <th>b'|'ar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>b \| az</td>
              <td>b**im</td>
              <td>b'|'az</td>
            </tr>
          </tbody>
        </table>
      `
          )
          .trim()
      ).toBe(
        "| f\\|oo | b\\*az | b\\'\\|\\'ar |\n" +
          "| --- | --- | --- |\n" +
          "| b \\| az | b\\*\\*im | b\\'\\|\\'az |"
      );
    });

    test("varying cell widths and empty cells", () => {
      expect(
        markforge
          .toMarkdown(
            `
        <table>
          <thead>
            <tr>
              <th>abc</th>
              <th>defghi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td></td>
              <td>bar</td>
            </tr>
            <tr>
              <td>baz</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      `
          )
          .trim()
      ).toBe(
        "| abc | defghi |\n" + "| --- | --- |\n" + "| | bar |\n" + "| baz | |"
      );
    });

    test("single column table", () => {
      expect(
        markforge
          .toMarkdown(
            `
        <table>
          <thead>
            <tr><th>foo</th></tr>
          </thead>
          <tbody>
            <tr><td>bar</td></tr>
          </tbody>
        </table>
      `
          )
          .trim()
      ).toBe("| foo |\n| --- |\n| bar |");
    });
  });

  test("task lists", () => {
    expect(
      markforge.toMarkdown('<li><input type="checkbox" checked> Task</li>')
    ).toBe("- [x] Task");
    expect(markforge.toMarkdown('<li><input type="checkbox"> Task</li>')).toBe(
      "- [ ] Task"
    );
  });
});
