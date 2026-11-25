import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const index = path.join(dist, "index.html");
let html = await readFile(index, "utf8");
let count = 0;
for (const match of html.matchAll(/<link\b[^>]*>/g)) {
  const tag = match[0];
  if (!/\brel=["']stylesheet["']/.test(tag)) continue;
  const href = tag.match(/\bhref=["']([^"']+)["']/)?.[1];
  if (!href?.startsWith("/assets/")) continue;
  const file = path.resolve(dist, "." + href);
  if (!file.startsWith(path.resolve(dist, "assets") + path.sep)) throw new Error("Invalid CSS asset path");
  const css = await readFile(file, "utf8");
  if (!css.trim() || /<\/style/i.test(css)) throw new Error("Invalid CSS asset: " + href);
  // Ship layout with the document so a separate CSS fetch/cache failure cannot unstyle the site.
  html = html.replace(tag, () => '<style data-app-styles="' + href + '">' + css + '</style>');
  count++;
}
if (count === 0) throw new Error("Build has no application stylesheet to embed");
await writeFile(index, html);
console.log("Embedded " + count + " application stylesheet(s) in index.html");
