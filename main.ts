import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One emoji that stands for the agent: a parrot.
// An agent talks back by echoing what it heard, mimicking voices it was
// trained on, repeating without understanding. A parrot says exactly that.
const ENTRY = "🦜";

function fail(message: string): never {
  throw new Error(message);
}

// Gate: 1 to 16 characters, single line, not only whitespace.
if (ENTRY.length < 1 || ENTRY.length > 16) {
  fail("entry must be 1 to 16 characters");
}
if (ENTRY.trim().length === 0) {
  fail("entry must not be only whitespace");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  fail("entry must be a single line");
}

// Gate: exactly one grapheme, and that grapheme must be an emoji.
// Tighten further: it must be a single code point, so no hidden joiner,
// variation selector, or skin-tone modifier can ride along inside it.
const codePoints = [...ENTRY];
if (codePoints.length !== 1) {
  fail("entry must be a single code point emoji");
}
if (!/\p{Extended_Pictographic}/u.test(ENTRY)) {
  fail("entry must be an emoji");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Round-trip read-back check: what landed on disk must be exactly the entry.
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) {
  fail("round-trip check failed: entry.txt does not match the entry");
}
console.log(`wrote ${outPath} (${Buffer.byteLength(ENTRY, "utf8")} bytes)`);
