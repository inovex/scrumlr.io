"ts-check";

import { writeFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const outPath = resolve(dirname(fileURLToPath(import.meta.url)), "out");

const unicodeEmojiJsonVersion = "0.5.0";
const emojilibVersion = "3.0.11";

// emojis with multiple skin tones are not supported
const multipleSkinTonesExclude = [
  /^kiss(_(man|woman).*)?$/,
  /^couple_with_heart(_(man|woman).*)?$/,
  /^family(_(man|woman).*)?$/,
];

async function main() {

  console.log("Fetching emoji data...");

  const dataByEmoji = await fetch(`https://unpkg.com/unicode-emoji-json@${unicodeEmojiJsonVersion}/data-by-emoji.json`).then(res => res.json());
  const emojilibData = await fetch(`https://unpkg.com/emojilib@${emojilibVersion}/dist/emoji-en-US.json`).then(res => res.json());

  console.log("Processing emoji data...");

  const result = [];

  for (const [emoji, { slug, skin_tone_support }] of Object.entries(dataByEmoji)) {
    if (!(emoji in emojilibData)) console.warn(`Missing data in emojilib for emoji ${emoji} (${slug})`);

    let /** @type {string[]} */ alternateNames = emojilibData[emoji] ?? [];
    // don't include names with special characters
    alternateNames = alternateNames.filter(name => /^[\w\s]+$/.test(name));

    let skinToneSupport = skin_tone_support;
    if (multipleSkinTonesExclude.some(regex => regex.test(slug))) {
      console.warn(`Excluding skin tone support for emoji ${emoji} (${slug})`);
      skinToneSupport = false;
    }

    result.push(
      [slug, emoji, skinToneSupport, alternateNames]
    );
  }

  console.log("Writing emoji data...");

  const json = JSON.stringify(result);

  await writeFile(outPath + "/emojis.json", json);

  console.log(`Wrote ${result.length} emojis. (/out/emojis.json)`);

  console.log("5 random examples:");
  for (let i = 0; i < 5; i++) {
    console.log(result[Math.floor(Math.random() * result.length)]);
  }

  console.log("Done!");
}

main();
