import { appendFile, readdir, writeFile, mkdir, readFile } from "fs/promises";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const inPath = resolve(dirname(fileURLToPath(import.meta.url)), "in/icons");
const outPath = resolve(dirname(fileURLToPath(import.meta.url)), "out/src");

//* Functions to extract icon names from filenames and vice versa

const iconNameRegex = /^ic-32-(?<name>[\w-]+)-(?<variant>\w+).svg$/;
function filenameToIconName(/** @type {string} */ filename) {
  return iconNameRegex.exec(filename)?.groups?.name;
}

function iconNameToFilename(/** @type {string} */ iconName) {
  return `ic-32-${iconName}-light4dark.svg`;
}

function iconNameToComponentName(/** @type {string} */ iconName) {
  // toCamelCase
  return iconName.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

const allowedResultColors = ["none", "currentColor"];

/**
 * checks whether an svg contains any fill or stroke color that is not in the allowedResultColors array
 * @param {string} svg the svg content to check
 * @param {string} filename the filename of the svg to print in case of error
 */
function checkForInconsistentColors(svg, filename) {
  const allColors = Array.from(svg.matchAll(/((fill)|(stroke))="(?<color>\w+)"/g)).map(match => match.groups?.color);

  allColors.forEach(color => {
    if (!color) return;
    if (!allowedResultColors.includes(color)) {
      console.error(`!! Inconsistent color in ${filename}: ${color}`);
    }
  });
}

async function main() {
  console.log(`This script will:
- read all icons from /in/icons
- change the color of the icons to currentColor
- add a class "icon" to the svg
- write the icons to /out/src/assets/icons
- create an index file in /out/src/components/Icons/index.ts that exports all icons as React components
`);

  console.log("Reading icons from /in...");

  const icons = await readdir(inPath);
  if (icons.length === 0) {
    console.error("No icons found in /in");
    return;
  }

  // collect all unique icon names
  const iconNames = Array.from(new Set(icons.map(filename => {
    const name = filenameToIconName(filename);
    if (!name) {
      console.error(`!! Invalid filename: ${filename}`);
    }
    return name;
  })));

  // setup index file
  const indexFile = resolve(outPath, "./components/Icon/index.ts");
  await mkdir(dirname(indexFile), { recursive: true });
  await writeFile(indexFile, "");

  await appendFile(indexFile, `// This file was generated in generateIcons.mjs

import "./Icon.scss";

`
  );

  // setup icon output folder
  const iconOut = resolve(outPath, "assets/icons");
  await mkdir(iconOut, { recursive: true });

  console.log("Processing", iconNames.length, "icons...");
  for (const iconName of iconNames) {
    if (!iconName) return;

    // load the light variant of the icon
    const lightVariantFile = resolve(inPath, iconNameToFilename(iconName));
    const iconFile = await readFile(lightVariantFile).then(f => f.toString());

    // change the color of the icon to currentColor and add a class "Icon"
    const iconComponentSVG = iconFile.replace(/white/g, "currentColor").replace("<svg", `<svg class="icon"`);

    // check for inconsistent colors
    checkForInconsistentColors(iconComponentSVG, lightVariantFile);

    // write the icon to the output folder
    await writeFile(resolve(outPath, resolve(iconOut, iconName + ".svg")), iconComponentSVG);

    // add the icon to the index file
    const componentName = iconNameToComponentName(iconName);
    await appendFile(indexFile, `export {ReactComponent as ${componentName}} from "assets/icons/${iconName}.svg";\n`);
  }

  console.log("Processing done.\nCheck for any warnings, then merge the out/src folder with the project's src folder.");
}

main();