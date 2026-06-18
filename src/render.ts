import { Node, Look } from "./ast.js";

// Render an AST to an SVG railroad diagram. Layout is intentionally simple:
// sequences flow left→right, alternations stack vertically, repeats draw a
// loop-back arrow with a count label.
interface Box { svg: string; w: number; h: number; }

const PAD = 12, H = 34, FONT = 12;

const LOOK_LABELS: Record<Look, string> = {
  "lookahead": "followed by",
  "neg-lookahead": "not followed by",
  "lookbehind": "preceded by",
  "neg-lookbehind": "not preceded by",
};

function term(text: string, fill: string, stroke: string): Box {
  const w = Math.max(40, text.length * 7 + PAD * 2);
  const rx = fill === "#eef" ? 16 : 6;   // pill vs box
  return {
    w, h: H,
    svg: `<g><rect x="0" y="0" width="${w}" height="${H}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>` +
         `<text x="${w / 2}" y="${H / 2 + 4}" text-anchor="middle" font-size="${FONT}" font-family="monospace">${esc(text)}</text></g>`,
  };
}

function place(box: Box, x: number, y: number): string {
  return `<g transform="translate(${x},${y})">${box.svg}</g>`;
}

function layout(node: Node): Box {
  switch (node.kind) {
    case "literal":
      // control/hex/unicode escapes carry a readable label and get the pill style
      return node.label
        ? term(node.label, "#eef", "#88a")
        : term(JSON.stringify(node.value).slice(1, -1), "#fff", "#888");
    case "charclass": return term(node.label, "#eef", "#88a");
    case "anchor": return term(node.label, "#f6f6f6", "#bbb");
    case "backref": return term(/^\d+$/.test(node.ref) ? "↪ \\" + node.ref : "↪ «" + node.ref + "»", "#fdf3e6", "#d0a060");
    case "group": {
      const inner = layout(node.body);
      const label = node.look ? LOOK_LABELS[node.look]
        : node.name ? `«${node.name}»`
        : node.capturing ? "group" : "";
      const stroke = node.look ? "#e0a050" : "#c0b0e0";
      const textFill = node.look ? "#b06f10" : "#7a5fb0";
      const lh = label ? 16 : 0;
      const w = inner.w + 20, h = inner.h + lh + 12;
      return {
        w, h,
        svg: `<rect x="0" y="0" width="${w}" height="${h}" rx="8" fill="none" stroke="${stroke}" stroke-dasharray="4 3"/>` +
             (label ? `<text x="8" y="13" font-size="10" fill="${textFill}" font-family="monospace">${esc(label)}</text>` : "") +
             place(inner, 10, lh + 6),
      };
    }
    case "seq": {
      const boxes = node.items.map(layout);
      const h = Math.max(H, ...boxes.map((b) => b.h));
      let x = 0; const parts: string[] = [];
      boxes.forEach((b, idx) => {
        if (idx > 0) parts.push(`<line x1="${x}" y1="${h / 2}" x2="${x + 14}" y2="${h / 2}" stroke="#888"/>`);
        if (idx > 0) x += 14;
        parts.push(place(b, x, (h - b.h) / 2));
        x += b.w;
      });
      return { w: x, h, svg: parts.join("") };
    }
    case "alt": {
      const boxes = node.options.map(layout);
      const w = Math.max(...boxes.map((b) => b.w)) + 40;
      const gap = 8;
      const h = boxes.reduce((s, b) => s + b.h + gap, 0) - gap;
      let y = 0; const parts: string[] = [];
      for (const b of boxes) {
        const cy = y + b.h / 2;
        parts.push(`<line x1="0" y1="${h / 2}" x2="20" y2="${cy}" stroke="#888"/>`);
        parts.push(place(b, 20, y));
        parts.push(`<line x1="${20 + b.w}" y1="${cy}" x2="${w}" y2="${h / 2}" stroke="#888"/>`);
        y += b.h + gap;
      }
      return { w, h, svg: parts.join("") };
    }
    case "repeat": {
      const inner = layout(node.body);
      const label = repeatLabel(node);
      const w = inner.w + 24, h = inner.h + 22;
      return {
        w, h,
        svg: place(inner, 12, 0) +
          `<path d="M6,${inner.h / 2} Q6,${inner.h + 14} ${w / 2},${inner.h + 14} Q${w - 6},${inner.h + 14} ${w - 6},${inner.h / 2}" fill="none" stroke="#d09030" stroke-dasharray="3 2"/>` +
          `<text x="${w / 2}" y="${inner.h + 20}" text-anchor="middle" font-size="10" fill="#b06f10" font-family="monospace">${esc(label)}</text>`,
      };
    }
  }
}

function repeatLabel(n: Extract<Node, { kind: "repeat" }>): string {
  const g = n.greedy ? "" : " lazy";
  if (n.min === 0 && n.max === null) return "0+ times" + g;
  if (n.min === 1 && n.max === null) return "1+ times" + g;
  if (n.min === 0 && n.max === 1) return "optional" + g;
  if (n.max === null) return `${n.min}+ times` + g;
  if (n.min === n.max) return `${n.min}×`;
  return `${n.min}–${n.max}×` + g;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function renderRailroad(node: Node): string {
  const inner = layout(node);
  const M = 20;
  const w = inner.w + M * 2 + 40, h = inner.h + M * 2;
  const cy = M + inner.h / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<circle cx="${M}" cy="${cy}" r="5" fill="#3fb950"/>` +
    `<line x1="${M}" y1="${cy}" x2="${M + 20}" y2="${cy}" stroke="#888"/>` +
    place(inner, M + 20, M) +
    `<line x1="${M + 20 + inner.w}" y1="${cy}" x2="${w - M}" y2="${cy}" stroke="#888"/>` +
    `<circle cx="${w - M}" cy="${cy}" r="5" fill="#f85149"/></svg>`;
}
