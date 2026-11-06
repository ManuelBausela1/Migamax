import { useEffect, useRef, useState, type ReactNode } from "react";
import { Image as ImageIcon, X, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import type { Producto, Linea } from "../domain/model";
import { whatsapp } from "../domain/model";
import { usePedido } from "./store";
import { useServicios } from "../app/dependencies";
export function Trazo({ children }: { children: ReactNode }) {
  return (
    <span className="titulo-trazo">
      {children}
      <svg viewBox="0 0 300 32" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M3 24 C75 7 184 1 250 9 C272 11 289 14 297 18 L296 21 C235 9 119 8 4 26 Q1 26 3 24 Z" />
      </svg>
    </span>
  );
}
export function LogoMarca() {
  return (
    <span className="logo-placeholder">
      <strong>MIGAMAX</strong><small>Logo original pendiente</small>
    </span>
  );
}
export function ImagenContenido({
  nombre,
  src,
  alt = "",
  hero = false,
}: {
  nombre: string;
  src?: string | null;
  alt?: string;
  hero?: boolean;
}) {
  const [error, setError] = useState(false);
  return (
    <div className={"imagen " + (hero ? "hero-imagen" : "")} data-asset={nombre}>
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          width="800"
          height="600"
          loading={hero ? "eager" : "lazy"}
          onError={() => setError(true)}
        />
      ) : (
        <div className="placeholder">
          <ImageIcon size={32} strokeWidth={1} aria-hidden="true" />
          <span>Fotografía pendiente</span>
        </div>
      )}
    </div>
  );
}
export function Modal({
  titulo,
  children,
  cerrar,
  panel = false,
}: {
  titulo: string;
  children: ReactNode;
  cerrar: () => void;
  panel?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const trigger = document.activeElement;
    const d = ref.current;
    d?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      d?.close();
      document.body.style.overflow = old;
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={panel ? "drawer" : ""}
      aria-labelledby="dialog-titulo"
      onCancel={(e) => {
        e.preventDefault();
        cerrar();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      <div className="modal-header">
        <h2 id="dialog-titulo">{titulo}</h2>
        <button autoFocus aria-label="Cerrar" onClick={cerrar}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Cantidad({ linea, nombre }: { linea: Linea; nombre: string }) {
  const poner = usePedido((s) => s.poner);
  return (
    <div className="cantidad">
      <button
        aria-label={"Disminuir cantidad de " + nombre}
        disabled={linea.cantidad <= 1}
        onClick={() => poner({ ...linea, cantidad: linea.cantidad - 1 })}
      >
        <Minus size={16} />
      </button>
      <output aria-label={"Cantidad de " + nombre}>{linea.cantidad}</output>
      <button
        aria-label={"Aumentar cantidad de " + nombre}
        disabled={linea.cantidad >= 99}
        onClick={() => poner({ ...linea, cantidad: linea.cantidad + 1 })}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
export function Lineas({ productos }: { productos: Producto[] }) {
  const { lineas, quitar } = usePedido();
  return (
    <div className="lineas">
      {lineas.map((l) => {
        const p = productos.find((p) => p.id === l.productoId);
        const v = p?.presentaciones.find((v) => v.id === l.presentacionId);
        return (
          <article className="linea" key={l.productoId + l.presentacionId}>
            <div className="linea-imagen" aria-hidden="true">
              <ImagenContenido nombre={p?.imagenKey ?? "producto"} />
            </div>
            <div className="linea-info">
              <h3>{p?.nombre}</h3>
              <p>{v?.nombre}</p>
              <small>
                {v?.unidadesPorPresentacion ?? "Cantidad pendiente"} unidades
                por presentación
              </small>
            </div>
            <Cantidad linea={l} nombre={p?.nombre ?? "producto"} />
            <button className="text-button quitar-linea" onClick={() => quitar(l)}>
              Quitar <span className="sr-only">{p?.nombre}</span>
            </button>
          </article>
        );
      })}
    </div>
  );
}
export function PasosPedido() {
  return (
    <ol className="pasos-pedido" aria-label="Cómo hacer tu pedido">
      {[
        ["Revisás", "Chequeá los productos, las cantidades y agregá una aclaración si lo necesitás."],
        ["Enviás tu consulta", "Continuá por WhatsApp para consultar disponibilidad, precio y forma de pago."],
        ["Coordinamos", "Conversamos con vos para confirmar los detalles de tu pedido."],
      ].map(([titulo, texto], i) => (
        <li key={titulo}>
          <span aria-hidden="true">{i + 1}</span>
          <div><h3>{titulo}</h3><p>{texto}</p></div>
        </li>
      ))}
    </ol>
  );
}
export function Breadcrumb({ titulo }: { titulo: string }) {
  return <nav className="breadcrumb" aria-label="Ubicación"><Link to="/">Inicio</Link><span aria-hidden="true">/</span><span aria-current="page">{titulo}</span></nav>;
}
export function Vacio() {
  return (
    <div className="empty">
      <ShoppingBag size={44} />
      <h2>Todavía no agregaste productos</h2>
      <p>Elegí tus favoritos y armá una selección a tu medida.</p>
      <Link className="btn" to="/productos">
        Ver productos
      </Link>
    </div>
  );
}
export function SalidaWhatsApp({
  tipo,
  texto,
  deshabilitado = false,
}: {
  tipo: string;
  texto: string;
  deshabilitado?: boolean;
}) {
  const { contactos, copiar } = useServicios();
  const salida = whatsapp(contactos[tipo] ?? "", texto);
  const [estado, setEstado] = useState("");
  const [manual, setManual] = useState(false);
  const [copiado, setCopiado] = useState(false);
  async function copiarTexto() {
    try {
      await copiar(texto);
      setEstado("Consulta copiada. Podés pegarla en la conversación.");
      setCopiado(true);
    } catch {
      setManual(true);
      setEstado("No pudimos copiar. Seleccioná y copiá el texto completo.");
    }
  }
  return (
    <div className="salida">
      {!salida && (
        <p className="notice">
          Contacto de WhatsApp pendiente de configuración. Esta demostración no
          envía consultas.
        </p>
      )}
      {salida?.largo && (
        <p>
          La consulta es larga. Copiá el texto completo y pegalo al abrir el
          chat.
        </p>
      )}
      {salida && !deshabilitado && (!salida.largo || copiado) ? (
        <a
          className="btn whatsapp"
          href={salida.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Continuar por WhatsApp ↗
        </a>
      ) : (
        <button className="btn whatsapp" disabled>
          Continuar por WhatsApp
        </button>
      )}
      {(!salida || salida.largo) && (
        <button
          className="btn outline"
          disabled={deshabilitado}
          onClick={copiarTexto}
        >
          Copiar consulta completa
        </button>
      )}
      <p role="status">{estado}</p>
      {manual && (
        <label>
          Consulta completa
          <textarea
            readOnly
            value={texto}
            rows={10}
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>
      )}
      <small>
        Se abrirá WhatsApp. Enviá el mensaje para consultar disponibilidad,
        precio y forma de pago. El pedido se confirma al conversar con Migamax.
      </small>
    </div>
  );
}
