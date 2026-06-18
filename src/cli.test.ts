import { describe, it, expect } from "vitest";
import { run } from "./cli";

describe("cli", () => {
  it("shows help with no args (exit 1) and --help (exit 0)", () => {
    expect(run([]).code).toBe(1);
    expect(run([]).output).toContain("Usage:");
    expect(run(["--help"]).code).toBe(0);
  });

  it("emits an SVG for a pattern", () => {
    const r = run(["a(b|c)+"]);
    expect(r.code).toBe(0);
    expect(r.output.startsWith("<svg")).toBe(true);
    expect(r.output.endsWith("</svg>")).toBe(true);
    expect(r.file).toBeUndefined();
  });

  it("passes through an output file with -o", () => {
    const r = run(["\\d+", "-o", "out.svg"]);
    expect(r.code).toBe(0);
    expect(r.file).toBe("out.svg");
    expect(r.output).toContain("<svg");
  });

  it("prints the AST with --ast", () => {
    const r = run(["a|b", "--ast"]);
    expect(r.code).toBe(0);
    const ast = JSON.parse(r.output);
    expect(ast.kind).toBe("alt");
  });

  it("errors with no pattern", () => {
    expect(run(["--ast"]).code).toBe(1);
  });

  it("exits 2 with a message on a malformed pattern", () => {
    const r = run(["a(bc"]);
    expect(r.code).toBe(2);
    expect(r.output).toMatch(/Unclosed group/);
  });
});
