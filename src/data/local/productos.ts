import type { Producto } from "../../domain/model";
export const categorias = [
  { id: "clasicos", nombre: "Clásicos" },
  { id: "bandejas", nombre: "Bandejas" },
  { id: "especialidades", nombre: "Especialidades" },
];
export const productos: Producto[] = [
  "Jamón y queso",
  "Carlitos",
  "Bandeja surtida",
  "Vegetariano",
  "Tostados",
  "Sándwich triple",
].map((nombre, i) => ({
  id: "demo-" + i,
  nombre,
  categoriaId: i === 2 ? "bandejas" : i > 2 ? "especialidades" : "clasicos",
  descripcion: null,
  ingredientes: null,
  alergenos: null,
  imagenKey: "producto-demo-" + i,
  activoEnCatalogo: true,
  estadoContenido: "pendiente",
  esDemo: true,
  presentaciones: [
    {
      id: "ejemplo-unidad",
      nombre: "Ejemplo · presentación individual",
      unidadVenta: "unidad de ejemplo",
      unidadesPorPresentacion: 1,
      estadoContenido: "pendiente",
    },
    ...(i === 2
      ? [
          {
            id: "ejemplo-bandeja",
            nombre: "Ejemplo · bandeja de 12",
            unidadVenta: "bandeja de ejemplo",
            unidadesPorPresentacion: 12,
            estadoContenido: "pendiente" as const,
          },
        ]
      : []),
  ],
}));
