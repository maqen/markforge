import type { Rule } from "./types";

export const gfmRules: Record<string, Rule> = {
  taskListItem: {
    filter: (node) => {
      if (!node.is("li")) return false;
      const checkbox = node.find("input[type=checkbox]").first();
      return checkbox.length > 0;
    },
    replacement: (content: string, node, options, $) => {
      const checkbox = $(node).find("input[type=checkbox]").first();
      const isChecked = checkbox.attr("checked") != null;
      const text = content
        .replace(/^\s*/, "")
        .replace(/^[*+-]\s*/, "")
        .replace(/^\[[x\s]\]\s*/i, "")
        .trim();
      return `- [${isChecked ? "x" : " "}] ${text}`;
    },
  },

  strikethrough: {
    filter: ["del", "strike"],
    replacement: (content) => `~~${content}~~`,
  },

  table: {
    filter: "table",
    replacement: (content, node, options, $) => {
      const $table = $(node);
      const rows = $table.find("tr");

      // Process header row
      let headers: string[] = [];
      const headerRow = rows.first();
      headerRow.find("th").map((_, cell) => {
        const $cell = $(cell);
        const text = escapeTableText($cell.text().trim());
        headers = [...headers, text];
      });

      if (headers.length === 0) return content;

      // Get column alignments
      const alignments = headerRow
        .find("th")
        .map((_, cell) => {
          const align = $(cell).attr("align")?.toLowerCase() || "";
          switch (align) {
            case "left":
              return ":--";
            case "right":
              return "--:";
            case "center":
              return ":-:";
            default:
              return "---";
          }
        })
        .get();

      // Process body rows
      let bodyRows: string[][] = [];
      rows.slice(1).map((_, row) => {
        let rowCells: string[] = [];
        $(row)
          .find("td")
          .slice(0, headers.length)
          .map((_, cell) => {
            const text = escapeTableText($(cell).text().trim());
            rowCells = [...rowCells, text];
          });
        bodyRows = [...bodyRows, rowCells];
      });

      // Build the table string
      const headerLine = `| ${headers.join(" | ")} |`;
      const delimiterLine = `| ${alignments.join(" | ")} |`;
      const bodyLines = bodyRows.map((row) => {
        const formattedCells = row.map((cell) => (cell ? ` ${cell} ` : " "));
        return `|${formattedCells.join("|")}|`;
      });

      return [headerLine, delimiterLine, ...bodyLines].join("\n");
    },
  },
};

const escapeTableText = (cell: string) =>
  cell
    .replace(/\s*\n\s*/g, " ")
    .replace(/\|/g, "\\|")
    .replace(/\*/g, "\\*")
    .replace(/'/g, "\\'") || "";
