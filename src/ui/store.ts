import { create } from "zustand";
import type { Linea } from "../domain/model";
import { cambiar, clave } from "../domain/model";
interface Estado {
  lineas: Linea[];
  aviso: string;
  ultima: Linea | null;
  set: (l: Linea[]) => void;
  poner: (l: Linea) => void;
  quitar: (l: Linea) => void;
  deshacer: () => void;
  avisar: (s: string) => void;
}
export const usePedido = create<Estado>((set, get) => ({
  lineas: [],
  aviso: "",
  ultima: null,
  set: (lineas) => set({ lineas }),
  avisar: (aviso) => set({ aviso }),
  poner: (l) => {
    try {
      set({
        lineas: cambiar(get().lineas, l),
        aviso: "Producto agregado o cantidad actualizada.",
      });
    } catch (e) {
      set({ aviso: (e as Error).message });
    }
  },
  quitar: (l) =>
    set({
      lineas: get().lineas.filter((x) => clave(x) !== clave(l)),
      ultima: l,
      aviso: "Producto quitado.",
    }),
  deshacer: () => {
    const l = get().ultima;
    if (l) {
      get().poner(l);
      set({ ultima: null });
    }
  },
}));
