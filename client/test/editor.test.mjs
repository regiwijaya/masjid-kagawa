import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";
import { registerHooks } from "node:module";
import { JSDOM } from "jsdom";
import React, { act, createRef } from "react";
import { createRoot } from "react-dom/client";

// Node test runner does not load CSS or Vite's extensionless JS imports.
registerHooks({
  resolve(specifier, context, next) {
    return next(specifier.endsWith("/utils/sanitizeHtml") ? specifier + ".js" : specifier, context);
  },
  load(url, context, next) {
    if (url.endsWith("/RichTextEditor.jsx")) return { format: "module", source: transformSync(readFileSync(new URL(url), "utf8"), { loader: "jsx", jsx: "automatic", format: "esm" }).code, shortCircuit: true };
    return url.endsWith(".css") ? { format: "module", source: "", shortCircuit: true } : next(url, context);
  },
});
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://masjidkagawa.com", pretendToBeVisual: true });
for (const key of ["window", "document", "Node", "Element", "HTMLElement", "Text", "MutationObserver", "DOMParser", "Range", "getComputedStyle"]) {
  globalThis[key] = dom.window[key];
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
Range.prototype.getBoundingClientRect = () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 });
Range.prototype.getClientRects = () => [];
const { default: RichTextEditor } = await import("../src/components/admin/RichTextEditor.jsx");
after(() => dom.window.close());

async function withEditor(value, run, modules = { toolbar: [["bold", "italic"], [{ list: "ordered" }, { list: "bullet" }], ["link", "image"]] }) {
  const host = document.createElement("div"); document.body.append(host);
  const root = createRoot(host);
  const ref = createRef();
  let output;
  const render = async (nextValue) => act(async () => root.render(React.createElement(RichTextEditor, {
    ref, theme: "snow", modules, value: nextValue,
    onChange: (html) => { output = html; },
  })));
  try {
    await render(value);
    await run({ quill: ref.current.getEditor(), host, render, output: () => output });
  } finally { await act(async () => root.unmount()); host.remove(); }
}

test("legacy HTML retains headings, emphasis, bullet/ordered lists, links and images", async () => {
  const html = '<h2>Pengumuman</h2><p><strong>Tebal</strong> <em>Miring</em></p><ul><li>Bullet</li></ul><ol><li>Nomor</li></ol><p><a href="https://masjidkagawa.com">Masjid</a></p><p><img src="https://api.masjidkagawa.com/uploads/posts/test.jpg"></p>';
  await withEditor(html, async ({ quill, output, render }) => {
    await act(async () => quill.insertText(quill.getLength() - 1, " tambahan", "user"));
    const result = new DOMParser().parseFromString(output(), "text/html");
    assert.equal(result.querySelector("h2").textContent, "Pengumuman");
    assert.equal(result.querySelector("strong").textContent, "Tebal");
    assert.equal(result.querySelector("em").textContent, "Miring");
    assert.equal(result.querySelector("ul li").textContent, "Bullet");
    assert.equal(result.querySelector("ol li").textContent, "Nomor");
    assert.equal(result.querySelector("a").getAttribute("href"), "https://masjidkagawa.com");
    assert.equal(result.querySelector("img").getAttribute("src"), "https://api.masjidkagawa.com/uploads/posts/test.jpg");
    await render(output());
    assert.match(quill.getText(), /tambahan/);
    await render("");
    assert.equal(quill.getText(), "\n");
  });
});

test("stored malicious HTML and pasted markup cannot leave executable attributes in saved HTML", async () => {
  await withEditor('<p>Isi</p><img src="x" onerror="alert(1)"><iframe srcdoc="evil"></iframe>', async ({ quill, output }) => {
    assert.equal(quill.root.querySelector("[onerror],iframe,script"), null);
    await act(async () => {
      quill.clipboard.dangerouslyPasteHTML(quill.getLength() - 1, '<p><a href="javascript:alert(1)">tautan</a><img src="x" onerror="alert(1)"></p>', "user");
    });
    const result = new DOMParser().parseFromString(output(), "text/html");
    assert.equal(result.querySelector("[onerror],iframe,script"), null);
    for (const link of result.querySelectorAll("a")) assert.ok(!link.href.startsWith("javascript:"));
  });
});

test("toolbar formatting and custom upload image handler keep the existing editor API", async () => {
  let invoked = false;
  const modules = { toolbar: { container: [["bold", "image"]], handlers: { image() {
    invoked = true;
    this.quill.insertEmbed(0, "image", "https://api.masjidkagawa.com/uploads/about/test.jpg", "user");
  } } } };
  await withEditor("<p>Masjid</p>", async ({ quill, host, output }) => {
    await act(async () => { quill.setSelection(0, 6); host.querySelector(".ql-bold").click(); });
    assert.equal(quill.getFormat(0, 6).bold, true);
    await act(async () => host.querySelector(".ql-image").click());
    assert.equal(invoked, true);
    assert.match(output(), /uploads\/about\/test.jpg/);
  }, modules);
});

test("Quill video HTML export injection is sanitized before application onChange", async () => {
  await withEditor("<p>Video</p>", async ({ quill, output }) => {
    await act(async () => quill.insertEmbed(0, "video", 'https://example.invalid/\" onmouseover=\"alert(1)', "user"));
    const raw = new DOMParser().parseFromString(quill.getSemanticHTML(), "text/html");
    assert.ok(raw.querySelector("[onmouseover]"), "fixture must exercise the upstream export vulnerability");
    const safe = new DOMParser().parseFromString(output(), "text/html");
    assert.equal(safe.querySelector("[onmouseover],script,iframe"), null);
  });
});
