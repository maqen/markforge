import type { Cheerio, CheerioAPI } from "cheerio";
import type { Element, Node, Text } from "domhandler";
import * as cheerio from "cheerio";
import { defaultRules } from "./defaultRules";
import { gfmRules } from "./gfmRules";
import type { MarkforgeOptions, Rule } from "./types";

const DEFAULT_OPTIONS: MarkforgeOptions = {
  headingStyle: "atx",
  hr: "* * *",
  bulletListMarker: "*",
  codeBlockStyle: "indented",
  fence: "```",
  emDelimiter: "_",
  strongDelimiter: "**",
  linkStyle: "inlined",
  linkReferenceStyle: "full",
  br: "  ",
  preformattedCode: false,
};

export class Markforge {
  private options: MarkforgeOptions;
  private rules: Rule[];
  private $!: CheerioAPI;

  constructor(options: Partial<MarkforgeOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.rules = [
      gfmRules.taskListItem,
      gfmRules.strikethrough,
      gfmRules.table,
      ...Object.values(defaultRules),
    ];
  }

  private findMatchingRule(node: Cheerio<Element>): Rule | undefined {
    return this.rules.find((rule) => {
      if (typeof rule.filter === "string") {
        return node.is(rule.filter);
      }
      if (Array.isArray(rule.filter)) {
        return rule.filter.some((f) => node.is(f));
      }
      const element = node.get(0);
      return element ? rule.filter(element) : false;
    });
  }

  private isTextNode(node: Node): node is Text {
    return node.type === "text";
  }

  private isElementNode(node: Node): node is Element {
    return node.type === "tag";
  }

  private processNode(node: Cheerio<Node>): string {
    const element = node.get(0);
    if (!element) return "";

    // Handle text nodes
    if (this.isTextNode(element)) {
      return element.data || "";
    }

    // Handle element nodes
    if (this.isElementNode(element)) {
      const $element = this.$(element);

      // Process children first
      const childContent = $element
        .contents()
        .map((_, child) => this.processNode(this.$(child)))
        .get()
        .join("");

      // Find and apply matching rule
      const rule = this.findMatchingRule($element);
      if (!rule) return childContent;

      return rule.replacement(childContent, element, this.options, this.$);
    }

    return "";
  }

  public toMarkdown(html: string): string {
    if (!html) {
      return "";
    }

    this.$ = cheerio.load(html);
    const body = this.$("body").contents();

    if (body.length === 0) {
      return "";
    }

    return this.processNode(body);
  }

  public addRule(rule: Rule): this {
    this.rules = [rule, ...this.rules];
    return this;
  }

  public removeRule(
    filter: string | string[] | ((node: Cheerio<Element>) => boolean)
  ): this {
    this.rules = this.rules.filter((rule) => rule.filter !== filter);
    return this;
  }

  public keep(selector: string): this {
    this.addRule({
      filter: selector,
      replacement: (_, element) => {
        return this.$.html(element) || "";
      },
    });
    return this;
  }
}

export default Markforge;
