# regex-railroad

[![CI](https://github.com/JCreatesGH/regex-railroad/actions/workflows/ci.yml/badge.svg)](https://github.com/JCreatesGH/regex-railroad/actions)
[![TypeScript](https://img.shields.io/badge/types-included-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Make regexes readable. `regex-railroad` parses a regular expression into an AST and renders it as an SVG **railroad diagram** — the format that actually shows what a pattern matches.

![screenshot](assets/screenshot.png)

## Install

```bash
npm install regex-railroad
```

## CLI

Installing the package adds a `regex-railroad` command:

```bash
regex-railroad '^(?<id>[A-Z]{2}\d+)(-\w+)?$' -o id.svg   # write the diagram to a file
regex-railroad '\d{3}-\d{4}'                              # …or print SVG to stdout
regex-railroad 'a(b|c)+' --ast                            # inspect the parsed AST as JSON
```

Exit code is `2` on a parse error, `0` otherwise.

## Use it as a library

```ts
import { parse, renderRailroad, regexToSvg } from "regex-railroad";

const svg = regexToSvg("^(?<id>[A-Z]{2}\\d+)(-\\w+)?$");
// or work with the AST directly:
const ast = parse("\\d{3}-\\d{4}");
const diagram = renderRailroad(ast);
```

## Supported syntax

- **Literals** and escapes; `.` (any char)
- **Classes** `\d \w \s` and negations, plus `[a-z]` / `[^...]` character sets
- **Control & code-point escapes** — `\n \t \r \f \v \0`, `\xHH`, `\uHHHH`, `\u{…}`, drawn with readable labels (`newline`, `\x41`, …) instead of a stray letter
- **Anchors** `^ $ \b \B`
- **Groups** — capturing `(…)`, non-capturing `(?:…)`, named `(?<name>…)`
- **Lookaround** — `(?=…)`, `(?!…)`, `(?<=…)`, `(?<!…)`, drawn as labeled zero-width assertions ("followed by", "not preceded by", …)
- **Backreferences** — `\1` … `\99` and `\k<name>`
- **Alternation** `a|b|c`
- **Quantifiers** `* + ?`, `{m}`, `{m,}`, `{m,n}`, including lazy (`+?`)

## Error reporting

Malformed patterns fail loudly instead of rendering a misleading diagram. `parse` throws a
`RegexParseError` carrying the offending character `index`, and the CLI exits `2` with the
message:

```bash
$ regex-railroad 'a(bc'
Error: Unclosed group: expected ')' (at position 4)
```

Detected: unclosed groups `(…`, unclosed character classes `[…`, unmatched `)`, a trailing
`\`, and a dangling quantifier (`*abc`, `a**` → "Nothing to repeat").

```ts
import { parse, RegexParseError } from "regex-railroad";
try { parse("a(bc"); }
catch (e) { if (e instanceof RegexParseError) console.log(e.index); /* 4 */ }
```

## How it draws

The renderer lays sequences left→right, stacks alternation branches vertically, wraps groups in a dashed box (with the capture name), tints lookaround assertions amber with a plain-English label, and draws quantifiers as a loop-back arrow annotated with a human label ("1+ times", "optional", "2–4×"). Output is a self-contained SVG — no canvas, no runtime deps.

## Development

```bash
npm install && npm test    # 36 tests (parser + renderer + CLI)
npm run build              # tsc, clean
```

## License

MIT
