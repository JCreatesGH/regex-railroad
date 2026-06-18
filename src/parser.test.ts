import { describe, it, expect } from "vitest";
import { parse } from "./parser";
import type { Node } from "./ast";

describe("parse", () => {
  it("literals form a sequence", () => {
    const n = parse("abc");
    expect(n.kind).toBe("seq");
    expect((n as any).items.map((x: any) => x.value)).toEqual(["a", "b", "c"]);
  });

  it("escape classes", () => {
    const d = parse("\\d") as any;
    expect(d.kind).toBe("charclass");
    expect(d.label).toBe("digit");
    expect((parse("\\w") as any).label).toBe("word char");
  });

  it("anchors and dot", () => {
    expect((parse("^") as any).label).toBe("start of line");
    expect((parse("$") as any).label).toBe("end of line");
    expect((parse(".") as any).label).toBe("any char");
  });

  it("character class with negation", () => {
    const c = parse("[^a-z]") as any;
    expect(c.kind).toBe("charclass");
    expect(c.negated).toBe(true);
    expect(c.label).toBe("[^a-z]");
  });

  it("quantifiers: *, +, ?, {m,n}", () => {
    expect(parse("a*")).toMatchObject({ kind: "repeat", min: 0, max: null });
    expect(parse("a+")).toMatchObject({ kind: "repeat", min: 1, max: null });
    expect(parse("a?")).toMatchObject({ kind: "repeat", min: 0, max: 1 });
    expect(parse("a{2,4}")).toMatchObject({ kind: "repeat", min: 2, max: 4 });
    expect(parse("a{3}")).toMatchObject({ kind: "repeat", min: 3, max: 3 });
    expect(parse("a{2,}")).toMatchObject({ kind: "repeat", min: 2, max: null });
  });

  it("lazy quantifier", () => {
    expect(parse("a+?")).toMatchObject({ kind: "repeat", greedy: false });
  });

  it("alternation", () => {
    const n = parse("cat|dog") as any;
    expect(n.kind).toBe("alt");
    expect(n.options).toHaveLength(2);
  });

  it("groups: capturing, non-capturing, named", () => {
    expect(parse("(ab)")).toMatchObject({ kind: "group", capturing: true });
    expect(parse("(?:ab)")).toMatchObject({ kind: "group", capturing: false });
    expect(parse("(?<year>\\d)")).toMatchObject({ kind: "group", name: "year" });
  });

  it("nested: a real-ish pattern", () => {
    const n = parse("^(?<id>[A-Z]{2}\\d+)(-\\w+)?$");
    expect(n.kind).toBe("seq");
  });

  it("lookahead and negative lookahead", () => {
    expect(parse("(?=abc)")).toMatchObject({ kind: "group", look: "lookahead", capturing: false });
    expect(parse("(?!abc)")).toMatchObject({ kind: "group", look: "neg-lookahead" });
  });

  it("lookbehind and negative lookbehind", () => {
    expect(parse("(?<=abc)")).toMatchObject({ kind: "group", look: "lookbehind" });
    expect(parse("(?<!abc)")).toMatchObject({ kind: "group", look: "neg-lookbehind" });
    // a named group is still a named group (not a lookbehind)
    expect(parse("(?<n>a)")).toMatchObject({ kind: "group", name: "n" });
  });

  it("backreferences: numeric and named", () => {
    expect(parse("\\1")).toMatchObject({ kind: "backref", ref: "1" });
    expect(parse("\\12")).toMatchObject({ kind: "backref", ref: "12" });
    expect(parse("\\k<year>")).toMatchObject({ kind: "backref", ref: "year" });
  });

  it("control escapes get readable labels (not literal letters)", () => {
    expect(parse("\\n")).toMatchObject({ kind: "literal", label: "newline" });
    expect(parse("\\t")).toMatchObject({ kind: "literal", label: "tab" });
    expect(parse("\\0")).toMatchObject({ kind: "literal", label: "null" });
  });

  it("hex and unicode escapes keep their escape text as the label", () => {
    expect(parse("\\x41")).toMatchObject({ kind: "literal", label: "\\x41" });
    expect(parse("\\u0041")).toMatchObject({ kind: "literal", label: "\\u0041" });
    expect(parse("\\u{1F600}")).toMatchObject({ kind: "literal", label: "\\u{1F600}" });
  });

  it("an escaped metacharacter is still a plain literal", () => {
    expect(parse("\\.")).toMatchObject({ kind: "literal", value: "." });
    expect((parse("\\.") as any).label).toBeUndefined();
  });
});
