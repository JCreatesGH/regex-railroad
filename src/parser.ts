import { Node } from "./ast.js";

// Recursive-descent parser for a practical regex subset:
// literals, escapes, ., \d \w \s (and negations), [..] classes, ^ $ anchors,
// (groups), (?:...), (?<name>...), | alternation, and * + ? {m,n} quantifiers.
export function parse(source: string): Node {
  let i = 0;
  const peek = () => source[i];
  const eof = () => i >= source.length;

  function parseAlt(): Node {
    const options = [parseSeq()];
    while (peek() === "|") { i++; options.push(parseSeq()); }
    return options.length === 1 ? options[0] : { kind: "alt", options };
  }

  function parseSeq(): Node {
    const items: Node[] = [];
    while (!eof() && peek() !== "|" && peek() !== ")") {
      items.push(parseRepeat());
    }
    if (items.length === 1) return items[0];
    return { kind: "seq", items };
  }

  function parseRepeat(): Node {
    let atom = parseAtom();
    const c = peek();
    if (c === "*" || c === "+" || c === "?") {
      i++;
      const greedy = peek() !== "?"; if (!greedy) i++;
      const ranges: Record<string, [number, number | null]> = { "*": [0, null], "+": [1, null], "?": [0, 1] };
      const [min, max] = ranges[c];
      return { kind: "repeat", min, max, greedy, body: atom };
    }
    if (c === "{") {
      const m = /^\{(\d+)(,(\d*)?)?\}/.exec(source.slice(i));
      if (m) {
        i += m[0].length;
        const min = parseInt(m[1], 10);
        const max = m[2] === undefined ? min : (m[3] === "" || m[3] === undefined ? null : parseInt(m[3], 10));
        const greedy = peek() !== "?"; if (!greedy) i++;
        return { kind: "repeat", min, max, greedy, body: atom };
      }
    }
    return atom;
  }

  function parseAtom(): Node {
    const c = peek();
    if (c === "(") return parseGroup();
    if (c === "[") return parseClass();
    if (c === "^") { i++; return { kind: "anchor", label: "start of line" }; }
    if (c === "$") { i++; return { kind: "anchor", label: "end of line" }; }
    if (c === ".") { i++; return { kind: "charclass", label: "any char", negated: false }; }
    if (c === "\\") return parseEscape();
    i++;
    return { kind: "literal", value: c };
  }

  function parseGroup(): Node {
    i++; // (
    let capturing = true, name: string | undefined;
    if (source.slice(i, i + 2) === "?:") { capturing = false; i += 2; }
    else {
      const nm = /^\?<([A-Za-z_][\w]*)>/.exec(source.slice(i));
      if (nm) { name = nm[1]; i += nm[0].length; }
    }
    const body = parseAlt();
    if (peek() === ")") i++;
    return { kind: "group", capturing, name, body };
  }

  function parseClass(): Node {
    i++; // [
    let negated = false;
    if (peek() === "^") { negated = true; i++; }
    let content = "";
    while (!eof() && peek() !== "]") {
      if (peek() === "\\") { content += source[i] + (source[i + 1] ?? ""); i += 2; }
      else { content += source[i]; i++; }
    }
    if (peek() === "]") i++;
    return { kind: "charclass", label: `[${negated ? "^" : ""}${content}]`, negated };
  }

  function parseEscape(): Node {
    i++; // backslash
    const c = source[i]; i++;
    const named: Record<string, string> = {
      d: "digit", D: "non-digit", w: "word char", W: "non-word",
      s: "whitespace", S: "non-whitespace", b: "word boundary", B: "non-boundary",
    };
    if (c === "b" || c === "B") return { kind: "anchor", label: named[c] };
    if (named[c]) return { kind: "charclass", label: named[c], negated: c === c.toUpperCase() };
    return { kind: "literal", value: c };
  }

  const node = parseAlt();
  return node;
}
