import { describe, it, expect } from "vitest";
import { parse } from "./parser";
import { renderRailroad } from "./render";

describe("renderRailroad", () => {
  it("emits a valid SVG with start/end markers", () => {
    const svg = renderRailroad(parse("ab"));
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.endsWith("</svg>")).toBe(true);
    expect(svg).toContain("<circle");        // start & end nodes
  });

  it("renders class labels and repeat annotations", () => {
    const svg = renderRailroad(parse("\\d+"));
    expect(svg).toContain("digit");
    expect(svg).toContain("1+ times");
  });

  it("renders alternation branches", () => {
    const svg = renderRailroad(parse("cat|dog"));
    expect(svg).toContain(">c<");   // 'cat' renders as per-char boxes
    expect(svg).toContain(">d<");   // 'dog' branch
    expect((svg.match(/<line/g) || []).length).toBeGreaterThan(2); // branch lines
  });

  it("renders a complex pattern without throwing", () => {
    const svg = renderRailroad(parse("^(?<id>[A-Z]{2}\\d+)(-\\w+)?$"));
    expect(svg).toContain("«id»");
    expect(svg.length).toBeGreaterThan(200);
  });
});
