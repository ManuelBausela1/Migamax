import { createContext, useContext } from "react";
import type { Servicios } from "../data/repositories/contracts";
import { productos, categorias } from "../data/local/productos";
import { seleccion, copiar } from "../data/browser/adapters";
export const servicios: Servicios = {
  catalogo: { listar: async () => productos },
  seleccion,
  copiar,
  contactos: {
    productos: import.meta.env.VITE_WHATSAPP_PRODUCTOS ?? "",
    catering: import.meta.env.VITE_WHATSAPP_CATERING ?? "",
    comercios: import.meta.env.VITE_WHATSAPP_COMERCIOS ?? "",
  },
};
export const Dependencias = createContext<Servicios>(servicios);
export const useServicios = () => useContext(Dependencias);
export { categorias };
