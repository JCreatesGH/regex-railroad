export { parse } from "./parser.js";
export { renderRailroad } from "./render.js";
export type { Node } from "./ast.js";
export function regexToSvg(source: string): string {
  // local import to keep a single public entry
  return renderRailroadOf(source);
}
import { parse } from "./parser.js";
import { renderRailroad } from "./render.js";
function renderRailroadOf(source: string): string { return renderRailroad(parse(source)); }
