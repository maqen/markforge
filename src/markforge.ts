import type { Cheerio, CheerioAPI } from "cheerio";
import type { Element, AnyNode } from "domhandler";
import { ElementType } from "domelementtype";
import { isTag } from "domhandler";
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

  private findMatchingRule(element: Element): Rule | undefined {
    return this.rules.find((rule) => {
      if (typeof rule.filter === "string") {
        return this.$(element).is(rule.filter);
      }
      if (Array.isArray(rule.filter)) {
        return rule.filter.some((f) => this.$(element).is(f));
      }
      return rule.filter(element);
    });
  }

  private isTextNode(node: AnyNode) {
    return node.type === ElementType.Text;
  }

  private isElementNode(node: AnyNode): node is Element {
    return isTag(node);
  }

  private processNode(node: AnyNode | undefined): string {
    if (!node) return "";

    if (this.isTextNode(node)) {
      return node.data.trim() || "";
    }

    // Handle element nodes
    if (this.isElementNode(node)) {
      const element = node;

      // Process children first
      const childContent = this.$(element)
        .contents()
        .map((_, child) => this.processNode(child))
        .get()
        .join("");

      // Find and apply matching rule
      const rule = this.findMatchingRule(element);
      if (!rule) return childContent;

      return rule.replacement(childContent, element, this.options, this.$);
    }

    return "";
  }

  public toMarkdown(html: string, selector: string = "body"): string {
    if (!html) {
      return "";
    }

    this.$ = cheerio.load(html);

    const content = this.$(selector);

    if (!content.length) {
      return "";
    }

    return this.processNode(content[0]);
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
