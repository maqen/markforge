import type { Cheerio, CheerioAPI } from "cheerio";
import type { Element } from "domhandler";

export interface MarkforgeOptions {
  headingStyle: "setext" | "atx";
  hr: string;
  bulletListMarker: "*" | "+" | "-";
  codeBlockStyle: "indented" | "fenced";
  fence: "```" | "~~~";
  emDelimiter: "_" | "*";
  strongDelimiter: "__" | "**";
  linkStyle: "inlined" | "referenced";
  linkReferenceStyle: "full" | "collapsed" | "shortcut";
  br: string;
  preformattedCode: boolean;
}

export interface Rule {
  filter: string | string[] | ((node: Element) => boolean);
  replacement: (
    content: string,
    node: Element,
    options: MarkforgeOptions,
    $: CheerioAPI
  ) => string;
}
