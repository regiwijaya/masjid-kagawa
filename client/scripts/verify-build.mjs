import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";

const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
// No external resources are loaded: layout must survive a blocked/failed CSS request.
const dom = new JSDOM(html);
const { document } = dom.window;
assert.ok(document.querySelector("style[data-app-styles]"), "Application CSS must travel with the HTML");
assert.equal(document.querySelector('link[rel="stylesheet"][href^="/assets/"]'), null);
document.getElementById("root").innerHTML = '<div class="topbar-inner"><div class="topbar-right">JP ID EN</div></div><section class="hero-section"><div class="hero-bg"></div><h1>Masjid Kagawa</h1></section><nav><img class="logo-img" alt="KMI Kagawa"></nav>';
const style = (selector) => dom.window.getComputedStyle(document.querySelector(selector));
assert.equal(style(".topbar-inner").display, "flex", "Top bar must retain its horizontal layout");
assert.equal(style(".topbar-right").display, "flex");
assert.equal(style(".hero-section").display, "flex", "Hero layout must be applied");
assert.equal(style(".hero-bg").position, "absolute", "Hero background must cover its section");
assert.equal(style(".logo-img").height, "36px", "Logo must not render at its native oversized dimensions");
dom.window.close();
console.log("Build layout verified without external stylesheets: top bar, hero, and logo");
