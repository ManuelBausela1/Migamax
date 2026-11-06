# Guía rápida de Migamax

Esta carpeta es el proyecto completo. Usa React, TypeScript, Tailwind CSS y Vite. Todo lo que se suba a GitHub debe salir de `webMigamax/`.

## Trabajar en la web

Abrí una terminal en `webMigamax/` y ejecutá:

```bash
npm ci
npm run dev
```

`npm ci` instala las dependencias la primera vez o después de descargar el proyecto. `npm run dev` muestra la web local y actualiza la página al guardar cambios. Para preparar una versión final y revisar que compile:

```bash
npm run build
npm run preview
```

`build` crea `dist/`, la carpeta que se alojará en el hosting. `preview` muestra esa versión construida. `dist/`, `.ssr/` y `node_modules/` se generan automáticamente y no se suben a GitHub.

## Dónde está cada cosa

| Carpeta o archivo | Para qué sirve |
| --- | --- |
| `src/ui/screens.tsx` | Contenido y estructura de las páginas. |
| `src/ui/components.tsx` | Piezas que se repiten, como logo, imágenes y panel de pedido. |
| `src/styles/` | Colores, tipografía, espacios y diseño responsive. |
| `src/data/local/productos.ts` | Catálogo de demostración. Reemplazar con productos aprobados. |
| `src/data/assets.manifest.ts` | Lista de logos y fotos pendientes. |
| `src/app/` | Navegación y configuración que une las piezas. |
| `src/domain/model.ts` | Reglas de selección y armado del mensaje de WhatsApp. |
| `public/` | Archivos que se copian tal cual al sitio. |
| `scripts/` | Preparación del contenido y HTML para las páginas públicas. |

El sitio sigue en modo demostración. Antes de publicarlo, hay que reemplazar los productos de ejemplo, sumar las fotos y el logo reales, y configurar el número de WhatsApp aprobado por Migamax.

## Subir cambios

Trabajá desde `webMigamax/` en la rama `main`:

```bash
git status
git add .
git commit -m "feat: agregar catálogo de productos"
git push -u origin main
```

Usá el formato `tipo: descripción breve` en cada commit. Los tipos más útiles acá son `feat` (función nueva), `fix` (corrección), `style` (cambio visual), `refactor` (reorganización interna), `docs` (documentación) y `chore` (configuración o mantenimiento). Por ejemplo: `fix: corregir el panel de pedido en mobile`.
Después del primer envío, alcanza con `git push`.

Los archivos `.env` quedan fuera de Git. Las variables `VITE_` se incluyen en la web pública al compilar, así que no guardes secretos ahí.
