import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadEnv } from "vite";
const { render, paginas } = await import(
  pathToFileURL(resolve(".ssr/entry-server.js"))
);
const env = loadEnv("production", process.cwd(), "VITE_");
const publico = env.VITE_CONTENT_MODE === "public";
const base = env.VITE_SITE_URL?.replace(/\/$/, "");
const template = await readFile("dist/index.html", "utf8");
const escape = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
for (const ruta of [...Object.keys(paginas), "/404"]) {
  const m = paginas[ruta] ?? {
    titulo: "Página no encontrada | Migamax",
    descripcion: "Esta página no existe.",
  };
  const url = base ? base + (ruta === "/" ? "/" : ruta) : "";
  const index = publico && !["/mi-pedido", "/404"].includes(ruta);
  const meta =
    "<title>" +
    escape(m.titulo) +
    '</title><meta name="description" content="' +
    escape(m.descripcion) +
    '"><meta name="robots" content="' +
    (index ? "index,follow" : "noindex,nofollow") +
    '"><meta property="og:title" content="' +
    escape(m.titulo) +
    '"><meta property="og:description" content="' +
    escape(m.descripcion) +
    '"><meta property="og:type" content="website"><meta property="og:site_name" content="Migamax"><meta property="og:locale" content="es_AR">' +
    (url
      ? '<link rel="canonical" href="' +
        escape(url) +
        '"><meta property="og:url" content="' +
        escape(url) +
        '">'
      : "");
  const html = template
    .replace("<!--meta-->", meta)
    .replace("<!--app-->", render(ruta));
  const dir = ruta === "/" ? "dist" : "dist" + ruta;
  await mkdir(dir, { recursive: true });
  await writeFile(dir + "/index.html", html);
  if (ruta === "/404") await writeFile("dist/404.html", html);
}
await writeFile(
  "dist/robots.txt",
  publico
    ? "User-agent: *\nAllow: /\nDisallow: /mi-pedido\nSitemap: " +
        base +
        "/sitemap.xml\n"
    : "User-agent: *\nDisallow: /\n",
);
await writeFile(
  "dist/sitemap.xml",
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    (publico
      ? Object.keys(paginas)
          .filter((r) => r !== "/mi-pedido")
          .map((r) => "<url><loc>" + base + r + "</loc></url>")
          .join("")
      : "") +
    "</urlset>",
);
console.log("HTML estático generado para 9 rutas.");
