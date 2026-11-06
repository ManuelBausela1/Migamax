export interface Presentacion {
  id: string;
  nombre: string;
  unidadVenta: string;
  unidadesPorPresentacion: number | null;
  estadoContenido: "pendiente" | "aprobado";
}
export interface Producto {
  id: string;
  nombre: string;
  categoriaId: string;
  descripcion: string | null;
  ingredientes: string[] | null;
  alergenos: string[] | null;
  imagenKey: string;
  presentaciones: Presentacion[];
  activoEnCatalogo: boolean;
  estadoContenido: "pendiente" | "aprobado";
  esDemo: boolean;
}
export interface Linea {
  productoId: string;
  presentacionId: string;
  cantidad: number;
}
export const clave = (l: Linea) => l.productoId + ":" + l.presentacionId;
export const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function cambiar(lineas: Linea[], l: Linea): Linea[] {
  if (!Number.isInteger(l.cantidad) || l.cantidad < 1 || l.cantidad > 99)
    throw Error(
      "El límite técnico es de 1 a 99 presentaciones por línea. Consultanos por mayor.",
    );
  const existe = lineas.some((x) => clave(x) === clave(l));
  if (!existe && lineas.length >= 30)
    throw Error("El límite técnico es de 30 líneas. Consultanos por mayor.");
  return existe
    ? lineas.map((x) => (clave(x) === clave(l) ? l : x))
    : [...lineas, l];
}
export function recuperar(
  raw: string | null,
  productos: Producto[],
  ahora = Date.now(),
): { lineas: Linea[]; aviso: string } {
  if (!raw) return { lineas: [], aviso: "" };
  try {
    const d: unknown = JSON.parse(raw);
    if (
      !d ||
      typeof d !== "object" ||
      !("version" in d) ||
      d.version !== 1 ||
      !("actualizadaEn" in d) ||
      typeof d.actualizadaEn !== "string" ||
      !("lineas" in d) ||
      !Array.isArray(d.lineas)
    )
      throw Error();
    const fecha = Date.parse(d.actualizadaEn);
    if (
      !Number.isFinite(fecha) ||
      fecha > ahora + 60000 ||
      ahora - fecha > 30 * 86400000
    )
      throw Error();
    let lineas: Linea[] = [];
    let ajustada = false;
    for (const x of d.lineas) {
      if (
        !x ||
        typeof x !== "object" ||
        typeof x.productoId !== "string" ||
        typeof x.presentacionId !== "string" ||
        !Number.isInteger(x.cantidad) ||
        x.cantidad < 1
      ) {
        ajustada = true;
        continue;
      }
      const p = productos.find(
        (p) => p.id === x.productoId && p.activoEnCatalogo,
      );
      if (
        !p?.presentaciones.some((v) => v.id === x.presentacionId) ||
        lineas.length >= 30 ||
        lineas.some((l) => clave(l) === clave(x))
      ) {
        ajustada = true;
        continue;
      }
      if (x.cantidad > 99) ajustada = true;
      lineas = cambiar(lineas, {
        productoId: x.productoId,
        presentacionId: x.presentacionId,
        cantidad: Math.min(x.cantidad, 99),
      });
    }
    return {
      lineas,
      aviso: ajustada
        ? "Revisamos tu selección y ajustamos datos que ya no eran válidos."
        : "",
    };
  } catch {
    return {
      lineas: [],
      aviso:
        "La selección guardada venció o no es compatible. Podés armar una nueva.",
    };
  }
}
export function mensajePedido(
  lineas: Linea[],
  productos: Producto[],
  nota = "",
) {
  return (
    "Hola Migamax, quiero consultar por esta selección:\n\n" +
    lineas
      .map((l) => {
        const p = productos.find((p) => p.id === l.productoId);
        const v = p?.presentaciones.find((v) => v.id === l.presentacionId);
        return (
          "• " +
          l.cantidad +
          " × " +
          p?.nombre +
          " — " +
          v?.nombre +
          " (" +
          v?.unidadVenta +
          (v?.unidadesPorPresentacion
            ? ", " + v.unidadesPorPresentacion + " unidades por presentación"
            : "") +
          ")"
        );
      })
      .join("\n") +
    (nota.trim() ? "\n\nAclaración: " + nota.trim().slice(0, 1000) : "") +
    "\n\n¿Me confirman disponibilidad, precio y cómo coordinar entrega o retiro y pago?"
  );
}
export function whatsapp(numero: string, texto: string) {
  if (!/^[1-9]\d{7,14}$/.test(numero)) return null;
  const chat = "https://wa.me/" + numero;
  const url = chat + "?text=" + encodeURIComponent(texto);
  return { url: url.length > 6000 ? chat : url, largo: url.length > 6000 };
}
export const fechaRosario = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
