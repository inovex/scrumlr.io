// Checks that every emoji of the original en.json is present in the translated emoji files.
// Language-independent fields are deep-compared; shortcodes, annotation and tags are translated and thus ignored.
// Usage: node scripts/checkEmojiData.mjs
import {readFileSync, readdirSync} from "node:fs";
import {isDeepStrictEqual} from "node:util";
import path from "node:path";
import {fileURLToPath} from "node:url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/emoji-data");
const ORIGINAL = "en.json";
const TRANSLATED_KEYS = new Set(["shortcodes", "annotation", "tags"]);

const load = (file) => JSON.parse(readFileSync(path.join(dir, file), {encoding: "utf8"}).toString());
const strip = (entry) => Object.fromEntries(Object.entries(entry).filter(([key]) => !TRANSLATED_KEYS.has(key)));
const byEmoji = (entries) => new Map(entries.map((entry) => [entry.emoji, strip(entry)]));

const original = byEmoji(load(ORIGINAL));
let failed = false;

for (const file of readdirSync(dir).filter((f) => f.endsWith(".json") && f !== ORIGINAL)) {
  const translated = byEmoji(load(file));
  const missing = [];
  const differing = [];

  for (const [emoji, entry] of original) {
    if (!translated.has(emoji)) missing.push(emoji);
    else if (!isDeepStrictEqual(entry, translated.get(emoji))) differing.push(emoji);
  }
  const extra = [...translated.keys()].filter((emoji) => !original.has(emoji));

  const ok = !missing.length && !differing.length && !extra.length;
  failed ||= !ok;
  console.log(`${ok ? "OK  " : "FAIL"} ${file} (${translated.size}/${original.size})`);
  if (missing.length) console.log(`  missing: ${missing.join(" ")}`);
  if (differing.length) console.log(`  differing data: ${differing.join(" ")}`);
  if (extra.length) console.log(`  not in original: ${extra.join(" ")}`);
}

process.exit(failed ? 1 : 0);
