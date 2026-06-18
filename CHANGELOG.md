# Changelog

All notable changes are documented here, following
[Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

## [0.3.0]

### Added
- **Real parse-error reporting.** `parse` now throws a `RegexParseError` (exported, with an
  `index` of the offending character) instead of silently mis-parsing malformed input:
  unclosed groups `(…`, unclosed character classes `[…`, unmatched `)`, a trailing `\`, and
  dangling quantifiers (`*abc`, `a**` → "Nothing to repeat").

### Fixed
- The CLI documented "exit code 2 on a parse error" but the parser never threw, so malformed
  patterns rendered a misleading diagram with exit 0. They now exit `2` with a clear message.

## [0.2.0]

### Added
- A `regex-railroad` CLI: render a pattern to an SVG file (`-o out.svg`) or
  stdout, or print the parsed AST as JSON (`--ast`).
- Control/hex/unicode escape rendering — `\n \t \r \f \v \0`, `\xHH`, `\uHHHH`,
  `\u{…}` now display with readable labels (`newline`, `\x41`, …).

### Fixed
- Escape sequences like `\n` were rendered as a literal letter; they now show as
  the escape they represent.

## [0.1.0]

### Added
- Regex parser + SVG **railroad-diagram** renderer: literals, escape classes,
  character classes, anchors, capturing/non-capturing/named groups, lookaround,
  backreferences, alternation, and quantifiers.
