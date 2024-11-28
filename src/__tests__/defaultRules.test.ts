import type { Rule, MarkforgeOptions } from "../types";
import { beforeEach, describe, expect, test } from "vitest";
import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

const defaultOptions: MarkforgeOptions = {
  headingStyle: "setext",
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

describe("defaultRules", () => {
  let rules: {
    array: Rule[];
    add: (key: string, rule: Rule) => void;
    keep: (filter: Rule["filter"]) => void;
    remove: (filter: Rule["filter"]) => void;
    forNode: (node: cheerio.Cheerio<any>) => Rule;
  };
  let $: CheerioAPI;

  beforeEach(() => {
    rules = {
      array: [],
      add: (key: string, rule: Rule) => {
        rules.array.push(rule);
      },
      keep: (filter: Rule["filter"]) => {
        rules.array.push({
          filter,
          replacement: (content) => content,
        });
      },
      remove: (filter: Rule["filter"]) => {
        rules.array.push({
          filter,
          replacement: () => "",
        });
      },
      forNode: (node: cheerio.Cheerio<any>) => {
        return (
          rules.array.find((rule) => {
            if (typeof rule.filter === "string") {
              return node.is(rule.filter);
            }
            if (Array.isArray(rule.filter)) {
              return rule.filter.some((f) => node.is(f));
            }
            return rule.filter(node);
          }) || rules.array[0]
        );
      },
    };
    $ = cheerio.load("");
  });

  test("adds rules correctly", () => {
    const rule: Rule = {
      filter: "p",
      replacement: (content) => content,
    };

    rules.add("paragraph", rule);
    expect(rules.array).toContainEqual(rule);
  });

  test("keeps elements", () => {
    rules.keep("div");
    const lastRule = rules.array[rules.array.length - 1];
    expect(lastRule.filter).toBe("div");
  });

  test("removes elements", () => {
    rules.remove("style");
    const lastRule = rules.array[rules.array.length - 1];
    expect(lastRule.filter).toBe("style");
  });

  test("finds rule for node", () => {
    const rule: Rule = {
      filter: "p",
      replacement: (content) => content,
    };
    rules.add("paragraph", rule);

    const $node = $("<p>test</p>");
    expect(rules.forNode($node)).toStrictEqual(rule);
  });
});
