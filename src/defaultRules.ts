import type { MarkforgeOptions, Rule } from "./types";

export const defaultRules: Record<string, Rule> = {
  paragraph: {
    filter: "p",
    replacement: (content) => content,
  },

  lineBreak: {
    filter: "br",
    replacement: (content, node, options) => options.br + "\n",
  },

  heading: {
    filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
    replacement: (content, node, options: MarkforgeOptions) => {
      const hLevel = parseInt(node.tagName.charAt(1));

      if (options.headingStyle === "atx") {
        return `${"#".repeat(hLevel)} ${content}`;
      } else {
        const underline = hLevel === 1 ? "=" : "-";
        return `${content}\n${underline.repeat(content.length)}`;
      }
    },
  },

  blockquote: {
    filter: "blockquote",
    replacement: (content) =>
      content.trim().replace(/^/gm, "> ").replace(/^>/gm, ">"),
  },

  list: {
    filter: ["ul", "ol"],
    replacement: (content) => content,
  },

  listItem: {
    filter: "li",
    replacement: (content, node, options) =>
      (options.bulletListMarker || "*") + " " + content,
  },

  code: {
    filter: ["pre", "code"],
    replacement: (content, node, options: MarkforgeOptions, $) => {
      const element = node;
      const isCodeInPre =
        element.tagName === "code" && $(element).parent().is("pre");

      // Handle inline code (single backtick)
      if (element.tagName === "code" && !isCodeInPre) {
        return `\`${content.trim()}\``;
      }

      // Handle code blocks
      if (element.tagName === "code" && isCodeInPre) {
        if (options.codeBlockStyle === "indented") {
          return `    ${content}`;
        } else {
          return `${options.fence || "```"}\n${content}\n${options.fence || "```"}`;
        }
      }

      return content;
    },
  },

  horizontalRule: {
    filter: "hr",
    replacement: (content, node, options) => options.hr || "* * *",
  },

  image: {
    filter: "img",
    replacement: (content, node, options: MarkforgeOptions, $) => {
      const alt = $(node).attr("alt") || "";
      const src = $(node).attr("src") || "";
      return `![${alt}](${src})`;
    },
  },

  link: {
    filter: "a",
    replacement: (content, node, options: MarkforgeOptions, $) => {
      const href = $(node).attr("href") || "";
      return `[${content}](${href})`;
    },
  },

  emphasis: {
    filter: ["em", "i"],
    replacement: (content, node, options) =>
      content.trim()
        ? `${options.emDelimiter || "_"}${content}${options.emDelimiter || "_"}`
        : "",
  },

  strong: {
    filter: ["strong", "b"],
    replacement: (content, node, options) =>
      content.trim()
        ? `${options.strongDelimiter || "**"}${content}${options.strongDelimiter || "**"}`
        : "",
  },
};
