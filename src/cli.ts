#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { parse } from "./parser.js";
import { renderRailroad } from "./render.js";

const HELP = `regex-railroad — render a regular expression as an SVG railroad diagram

Usage:
  regex-railroad "<pattern>" [-o out.svg]
  regex-railroad "<pattern>" --ast        print the parsed AST as JSON

Options:
  -o, --out FILE   write the SVG to FILE (default: stdout)
  --ast            print the parsed AST as JSON instead of SVG
  -h, --help       show this help`;

/** Pure entry point: parse args, return an exit code, the text to emit, and an
 * optional output file. Side-effect-free so it can be unit-tested. */
export function run(args: string[]): { code: number; output: string; file?: string } {
  if (args.length === 0) return { code: 1, output: HELP };
  if (args.includes("-h") || args.includes("--help")) return { code: 0, output: HELP };

  let file: string | undefined;
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-o" || a === "--out") file = args[++i];
    else rest.push(a);
  }

  const ast = rest.includes("--ast");
  const pattern = rest.filter((a) => a !== "--ast").join(" ");
  if (!pattern) return { code: 1, output: "Error: no pattern provided" };

  let node;
  try {
    node = parse(pattern);
  } catch (e) {
    return { code: 2, output: `Error: ${(e as Error).message}` };
  }
  return { code: 0, output: ast ? JSON.stringify(node, null, 2) : renderRailroad(node), file };
}

// Execute only when invoked as the CLI binary (not when imported by tests).
if (process.argv[1] && /cli\.js$/.test(process.argv[1])) {
  const { code, output, file } = run(process.argv.slice(2));
  if (code === 0 && file) {
    writeFileSync(file, output);
    console.log(`wrote ${file}`);
  } else {
    (code === 0 ? console.log : console.error)(output);
  }
  process.exit(code);
}
