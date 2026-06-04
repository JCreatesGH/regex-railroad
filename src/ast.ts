export type Node =
  | { kind: "seq"; items: Node[] }
  | { kind: "alt"; options: Node[] }
  | { kind: "literal"; value: string }
  | { kind: "charclass"; label: string; negated: boolean }
  | { kind: "anchor"; label: string }
  | { kind: "group"; capturing: boolean; name?: string; body: Node }
  | { kind: "repeat"; min: number; max: number | null; greedy: boolean; body: Node };
