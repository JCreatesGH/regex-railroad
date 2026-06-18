# Changelog

All notable changes are documented here, following
[Keep a Changelog](https://keepachangelog.com/) and [SemVer](https://semver.org/).

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
