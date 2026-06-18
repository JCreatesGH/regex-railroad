export type Look = "lookahead" | "neg-lookahead" | "lookbehind" | "neg-lookbehind";

/** Thrown by `parse` on a malformed pattern, carrying the offending character offset. */
export class RegexParseError extends Error {
  constructor(reason: string, public readonly index: number) {
    super(`${reason} (at position ${index})`);
    this.name = "RegexParseError";
  }
}

export type Node =
  | { kind: "seq"; items: Node[] }
  | { kind: "alt"; options: Node[] }
  | { kind: "literal"; value: string; label?: string }
  | { kind: "charclass"; label: string; negated: boolean }
  | { kind: "anchor"; label: string }
  | { kind: "backref"; ref: string }
  | { kind: "group"; capturing: boolean; name?: string; look?: Look; body: Node }
  | { kind: "repeat"; min: number; max: number | null; greedy: boolean; body: Node };
