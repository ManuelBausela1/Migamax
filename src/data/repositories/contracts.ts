import type { Producto, Linea } from "../../domain/model";
export interface CatalogoRepository {
  listar(): Promise<Producto[]>;
}
export interface SeleccionRepository {
  leer(): string | null;
  guardar(lineas: Linea[]): void;
  observar(fn: (raw: string | null) => void): () => void;
}
export interface Servicios {
  catalogo: CatalogoRepository;
  seleccion: SeleccionRepository;
  copiar: (s: string) => Promise<void>;
  contactos: Record<string, string>;
}
