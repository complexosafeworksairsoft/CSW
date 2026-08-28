// One-off script: snapshots the public pages from the running dev server into
// self-contained HTML files (CSS inlined, internal links rewritten to local
// filenames, Next.js JS bundles stripped) so they can be opened directly by
// double-click, no server required. Portal de Equipes / login are excluded
// since those need a real backend.
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "http://localhost:3000";
const OUT_DIR = path.resolve(process.cwd(), "export-offline");

const PAGES = [
  { route: "/", file: "index.html" },
  { route: "/o-complexo", file: "o-complexo.html" },
  { route: "/campo", file: "campo.html" },
  { route: "/oficina", file: "oficina.html" },
  { route: "/loja", file: "loja.html" },
  { route: "/treinamentos", file: "treinamentos.html" },
  { route: "/regras", file: "regras.html" },
  { route: "/contato", file: "contato.html" },
  { route: "/operadores", file: "operadores.html" },
];

const ROUTE_TO_FILE = Object.fromEntries(
  PAGES.map((p) => [p.route, p.file])
);

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const { route, file } of PAGES) {
    let html = await fetchText(BASE + route);

    // Inline every stylesheet <link> referenced in <head>.
    const cssHrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/g)].map(
      (m) => m[1]
    );
    for (const href of cssHrefs) {
      const cssUrl = href.startsWith("http") ? href : BASE + href;
      let css;
      try {
        css = await fetchText(cssUrl);
      } catch {
        continue;
      }
      const linkTagRe = new RegExp(
        `<link[^>]+href="${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`
      );
      html = html.replace(linkTagRe, `<style>${css}</style>`);
    }

    // Drop Next.js JS bundles (scripts + modulepreload/preload script links) —
    // this is a static, no-JS preview; keeping them would just 404 offline.
    html = html.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, "");
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "");
    html = html.replace(/<link[^>]+rel="(preload|modulepreload)"[^>]*>/g, "");

    // Rewrite internal nav links to the local exported filenames.
    for (const [r, f] of Object.entries(ROUTE_TO_FILE)) {
      const hrefRe = new RegExp(`href="${r === "/" ? "/" : r}"`, "g");
      html = html.replace(hrefRe, `href="${f}"`);
    }

    // Anything else pointing under /equipes or /operadores/equipe/* has no
    // exported target (needs a real server) — leave as a dead relative link,
    // it's the same page reload / 404 in-browser rather than a crash.

    await writeFile(path.join(OUT_DIR, file), html, "utf8");
    console.log(`wrote ${file}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
