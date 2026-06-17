import { parse } from "./parser.js";
import { renderRailroad } from "./render.js";

export { parse } from "./parser.js";
export { renderRailroad } from "./render.js";
export type { Node, Look } from "./ast.js";

/** Parse a regular expression and render it directly to an SVG railroad diagram. */
export function regexToSvg(source: string): string {
  return renderRailroad(parse(source));
}
