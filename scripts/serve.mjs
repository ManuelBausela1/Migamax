import {URL} from 'node:url';
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("dist");
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      let f = resolve(root, "." + pathname);
      if (f !== root && !f.startsWith(root + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      let status = 200;
      try {
        if ((await stat(f)).isDirectory()) f = resolve(f, "index.html");
        await stat(f);
      } catch {
        status = 404;
        f = resolve(root, "404.html");
      }
      res.writeHead(status, {
        "Content-Type": types[extname(f)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
      });
      res.end(await readFile(f));
    } catch {
      res.writeHead(500);
      res.end("No pudimos cargar el recurso.");
    }
  })
  .listen(port, "127.0.0.1", () =>
    console.log("Local: http://127.0.0.1:" + port),
  );
