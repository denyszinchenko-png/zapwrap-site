#!/usr/bin/env node
/* Prerender the language pages: /es/ /ru/ /uk/ /he/ from index.html + i18n.js.
   Why: the runtime ?lang= swap is invisible to crawlers - the raw HTML of every
   ?lang= URL was identical English with a canonical pointing at "/", so the
   whole hreflang cluster collapsed and only EN got indexed. Baking real pages
   fixes that while ?lang= keeps working as the widget's runtime state.

   Run from the repo root:  node dev/build-i18n.js
   Never edit es/ ru/ uk/ he/ by hand - they are build output. */

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ORIGIN = "https://zapwrapnaples.com";
const LANGS = ["es", "ru", "uk", "he"];
const RTL = { he: true };
const OG_LOCALE = { en: "en_US", es: "es_US", ru: "ru_RU", uk: "uk_UA", he: "he_IL" };
/* cyrillic pages preload the cyrillic subset on top of latin (codes/badges stay latin) */
const EXTRA_FONT = { ru: "montserrat-cyrillic.woff2", uk: "montserrat-cyrillic.woff2" };

function langUrl(lang) {
  return ORIGIN + "/" + (lang === "en" ? "" : lang + "/");
}

/* ---- pull DICT out of i18n.js: slice the object literal and evaluate it ---- */
function loadDict() {
  const src = fs.readFileSync(path.join(ROOT, "i18n.js"), "utf8");
  const start = src.indexOf("var DICT = {");
  const end = src.indexOf("\n  };", start);
  if (start === -1 || end === -1) throw new Error("DICT literal not found in i18n.js");
  const literal = src.slice(start + "var DICT = ".length, end + "\n  }".length);
  return new Function("return " + literal + ";")();
}

/* ---- entity decode for JSON-LD text (schema wants plain text, not markup) ---- */
function plainText(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&middot;/g, "·").replace(/&rarr;/g, "→")
    .replace(/&ntilde;/g, "ñ").replace(/&Ntilde;/g, "Ñ")
    .replace(/&aacute;/g, "á").replace(/&eacute;/g, "é")
    .replace(/&iacute;/g, "í").replace(/&oacute;/g, "ó")
    .replace(/&uacute;/g, "ú").replace(/&Uacute;/g, "Ú")
    .replace(/&iquest;/g, "¿").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
}

/* ---- swap the innerHTML of every [data-i18n] element ---- */
/* depth-counting close finder: same-tag children (span-in-span arrows) are real */
function findClose(html, tag, from) {
  const closeStr = "</" + tag + ">";
  const openRe = new RegExp("<" + tag + "[\\s>/]", "gi");
  let depth = 1;
  let i = from;
  for (;;) {
    const nextClose = html.indexOf(closeStr, i);
    if (nextClose === -1) return -1;
    openRe.lastIndex = i;
    const m = openRe.exec(html);
    if (m && m.index < nextClose) {
      depth++;
      i = m.index + 1;
    } else {
      depth--;
      if (depth === 0) return nextClose;
      i = nextClose + closeStr.length;
    }
  }
}

function swapContent(html, dict, lang) {
  let misses = 0;
  const re = /<([a-z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*?\sdata-i18n="([^"]+)"(?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let out = "";
  let last = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    const [open, tag, , key] = m;
    const openEnd = m.index + open.length;
    const closeAt = findClose(html, tag, openEnd);
    if (closeAt === -1) throw new Error(`${lang}: no closing </${tag}> for data-i18n="${key}"`);
    const inner = html.slice(openEnd, closeAt);
    const v = dict[key];
    if (v == null) misses++;
    out += html.slice(last, openEnd) + (v != null ? v : inner);
    last = closeAt;
    re.lastIndex = closeAt;
  }
  out += html.slice(last);
  return { html: out, misses };
}

/* ---- swap placeholder/label attributes for [data-i18n-ph] / [data-i18n-label] ---- */
function swapAttrs(html, dict) {
  html = html.replace(/(<[^>]*data-i18n-ph="([^"]+)"[^>]*>)/g, (tagStr, _all, key) => {
    const v = dict[key];
    if (v == null) return tagStr;
    if (v.includes('"')) throw new Error(`placeholder value for ${key} contains a double quote`);
    return tagStr.replace(/placeholder="[^"]*"/, 'placeholder="' + v + '"');
  });
  html = html.replace(/(<[^>]*data-i18n-label="([^"]+)"[^>]*>)/g, (tagStr, _all, key) => {
    const v = dict[key];
    if (v == null) return tagStr;
    if (v.includes('"')) throw new Error(`label value for ${key} contains a double quote`);
    return tagStr.replace(/\slabel="[^"]*"/, ' label="' + v + '"');
  });
  return html;
}

/* ---- head surgery: lang/dir, title, metas, canonical, og, font preload ---- */
function bakeHead(html, dict, lang) {
  const title = plainText(dict["meta.title"] || "");
  const desc = plainText(dict["meta.desc"] || "");
  if (!title || !desc) throw new Error(`${lang}: meta.title / meta.desc missing in DICT`);

  html = html.replace(/<html lang="en">/, `<html lang="${lang}" dir="${RTL[lang] ? "rtl" : "ltr"}" data-baked="${lang}">`);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`);
  html = html.replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${OG_LOCALE[lang]}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${langUrl(lang)}$2`);
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${langUrl(lang)}$2`);

  if (EXTRA_FONT[lang]) {
    html = html.replace(
      /(<link rel="preload" as="font" type="font\/woff2" href="\/assets\/fonts\/montserrat-latin\.woff2" crossorigin \/>)/,
      `$1\n  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/${EXTRA_FONT[lang]}" crossorigin />`
    );
  }
  return html;
}

/* ---- root-relative every local reference so the page works from /xx/ ---- */
function rootRelative(html) {
  return html
    .replace(/(href|src)="styles\.css/g, '$1="/styles.css')
    .replace(/(href|src)="legal\.css/g, '$1="/legal.css')
    .replace(/(href|src)="app\.js/g, '$1="/app.js')
    .replace(/(href|src)="i18n\.js/g, '$1="/i18n.js')
    .replace(/(href|src|srcset)="assets\//g, '$1="/assets/')
    .replace(/srcset="([^"]+)"/g, (m, set) => 'srcset="' + set.replace(/(^|,\s*)assets\//g, "$1/assets/") + '"')
    .replace(/href="privacy\.html/g, 'href="/privacy.html')
    .replace(/href="terms\.html/g, 'href="/terms.html');
}

/* ---- FAQPage JSON-LD gets the translated questions ---- */
function bakeFaqSchema(html, dict, lang) {
  return html.replace(/\{ "@type": "Question", "name": "([^"]+)", "acceptedAnswer": \{ "@type": "Answer", "text": "([^"]+)" \} \}/g,
    (whole, q) => {
      const idx = FAQ_EN.indexOf(q);
      if (idx === -1) throw new Error(`${lang}: FAQ schema question not mapped: ${q}`);
      const tq = plainText(dict[`faq.${idx + 1}.q`] || q);
      const ta = plainText(dict[`faq.${idx + 1}.a`] || "");
      if (!ta) throw new Error(`${lang}: missing faq.${idx + 1}.a`);
      return `{ "@type": "Question", "name": ${JSON.stringify(tq)}, "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(ta)} } }`;
    });
}
let FAQ_EN = [];

/* ---- hreflang cluster shared by root, language pages and the sitemap ---- */
function hreflangLinks() {
  const langs = ["en", ...LANGS];
  return langs.map((l) => `  <link rel="alternate" hreflang="${l}" href="${langUrl(l)}" />`).join("\n")
    + `\n  <link rel="alternate" hreflang="x-default" href="${langUrl("en")}" />`;
}

function bakeHreflang(html) {
  return html.replace(/(  <link rel="alternate" hreflang="en"[^]*?hreflang="x-default"[^>]*\/>)/, hreflangLinks());
}

/* ---- sitemap with the full cluster on every localized URL ---- */
function sitemap(today) {
  const cluster = ["en", ...LANGS]
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${langUrl(l)}" />`)
    .join("\n") + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${langUrl("en")}" />`;
  const urls = ["en", ...LANGS].map((l) => `  <url>
    <loc>${langUrl(l)}</loc>
${cluster}
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${l === "en" ? "1.0" : "0.8"}</priority>
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
  <url>
    <loc>${ORIGIN}/privacy.html</loc>
    <lastmod>2026-07-19</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${ORIGIN}/terms.html</loc>
    <lastmod>2026-07-19</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
`;
}

/* ---------------- main ---------------- */
const source = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const DICT = loadDict();

FAQ_EN = [...source.matchAll(/\{ "@type": "Question", "name": "([^"]+)"/g)].map((m) => m[1]);
if (FAQ_EN.length < 8) throw new Error("FAQ schema extraction looks wrong: " + FAQ_EN.length + " questions");

for (const lang of LANGS) {
  const dict = DICT[lang];
  if (!dict) throw new Error("no dict for " + lang);
  let html = source;
  html = bakeHead(html, dict, lang);
  const swapped = swapContent(html, dict, lang);
  html = swapAttrs(swapped.html, dict);
  html = bakeFaqSchema(html, dict, lang);
  html = rootRelative(html);
  const dir = path.join(ROOT, lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  console.log(`${lang}/index.html written (${(html.length / 1024).toFixed(1)} KB, ${swapped.misses} keys fell back to EN)`);
}

const today = process.argv[2] || new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap(today));
console.log("sitemap.xml written (" + (LANGS.length + 3) + " URLs)");
