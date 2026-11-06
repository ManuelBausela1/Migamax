import type { SeleccionRepository } from "../repositories/contracts";
const key = "migamax.seleccion.v1";
export const seleccion: SeleccionRepository = {
  leer: () => localStorage.getItem(key),
  guardar: (lineas) =>
    localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        actualizadaEn: new Date().toISOString(),
        lineas,
      }),
    ),
  observar: (fn) => {
    const handler = (e: StorageEvent) => {
      if (e.key === key || e.key === null) fn(e.newValue);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  },
};
export const copiar = (texto: string) => navigator.clipboard.writeText(texto);
