import { loadEnv } from "vite";
const e = loadEnv("production", process.cwd(), "VITE_");
if (e.VITE_CONTENT_MODE === "public") {
  console.error(
    "Lanzamiento bloqueado: catálogo demo, assets y contacto no aprobados. Sustituir datos y ampliar esta validación con el manifiesto aprobado.",
  );
  process.exit(1);
}
console.log("Contenido demo identificado; publicación comercial bloqueada.");
