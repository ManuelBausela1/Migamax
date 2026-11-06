import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Search, Store } from "lucide-react";
import type { Producto } from "../domain/model";
import { normalizar, mensajePedido, fechaRosario } from "../domain/model";
import { categorias } from "../app/dependencies";
import { usePedido } from "./store";
import {
  ImagenContenido,
  Cantidad,
  Lineas,
  Vacio,
  SalidaWhatsApp,
  PasosPedido,
  Breadcrumb,
  Trazo,
} from "./components";
export function Inicio() {
  return (
    <div className="home-page">
      <section className="container home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">DE NUESTRA FAMILIA A TU MESA</p>
          <h1>El sabor de<br /><span className="palabra-trazada">com<Trazo>partir.</Trazo></span></h1>
          <p className="lead">Sándwiches para tu mesa,<br />tu encuentro o tu negocio.</p>
          <div className="home-actions">
            <Link to="/productos" className="btn">Explorá nuestros productos <ArrowRight size={18} /></Link>
            <Link to="/nuestra-familia" className="btn outline">Conocé nuestra historia</Link>
          </div>
        </div>
        <ImagenContenido hero nombre="inicio-hero" />
      </section>
      <section className="container home-categories">
        <h2>Siempre hay <Trazo>un buen motivo</Trazo></h2>
        <div className="home-category-grid">
          {categorias.map((c) => (
            <Link className="home-category" to={"/productos?categoria=" + c.id} key={c.id}>
              <ImagenContenido nombre={"categoria-" + c.id} />
              <h3>{c.id === "bandejas" ? "Bandejas para compartir" : c.nombre} <ArrowRight size={18} /></h3>
            </Link>
          ))}
        </div>
      </section>
      <section className="container home-catering">
        <div>
          <h2>Nos sumamos a tu<br /><Trazo>próximo encuentro.</Trazo></h2>
          <Link className="btn" to="/catering">Conocé nuestro catering <ArrowRight size={18} /></Link>
        </div>
        <ImagenContenido nombre="inicio-catering" />
      </section>
      <section className="container home-family">
        <ImagenContenido nombre="familia-elaboracion" />
        <div>
          <h2>Una familia detrás<br />de cada <Trazo>pedido.</Trazo></h2>
          <p>Somos una fábrica familiar de sándwiches de Rosario. Elaboramos con dedicación recetas clásicas y combinaciones que siempre se disfrutan.</p>
          <Link className="btn" to="/nuestra-familia">Nuestra historia <ArrowRight size={18} /></Link>
        </div>
      </section>
      <section className="container home-commerce" aria-label="Para comercios">
        <Store size={60} strokeWidth={1.3} aria-hidden="true" />
        <h2>Migamax también<br />en tu comercio.</h2>
        <p>Sándwiches prácticos y de calidad<br />para tu local, empresa o evento.</p>
        <Link className="btn" to="/comercios">Conversemos <ArrowRight size={18} /></Link>
      </section>
    </div>
  );
}
export function Productos({
  productos,
  detalle,
  cargando,
  error,
  reintentar,
}: {
  productos: Producto[];
  detalle: (p: Producto) => void;
  cargando: boolean;
  error: boolean;
  reintentar: () => void;
}) {
  const [params, setParams] = useSearchParams();
  const q = params.get("buscar") ?? "";
  const categoria = params.get("categoria") ?? "";
  const { lineas, poner } = usePedido();
  function filtro(k: string, v: string) {
    const n = new URLSearchParams(params);
    if (v) n.set(k, v);
    else n.delete(k);
    setParams(n, { replace: true });
  }
  const visibles = productos.filter(
    (p) =>
      p.activoEnCatalogo &&
      (!categoria || p.categoriaId === categoria) &&
      normalizar(p.nombre).includes(normalizar(q)),
  );
  return (
    <section className="container section catalog-page">
      <Breadcrumb titulo="Productos" />
      <h1 className="functional">Elegí tus <Trazo>favoritos</Trazo></h1>
      <p className="lead">
        Armá tu selección y coordinamos los detalles por WhatsApp.
      </p>
      <div className="catalog-controls">
        <label className="search">
          <Search size={20} />
          <span className="sr-only">Buscar productos</span>
          <input
            placeholder="Buscar productos"
            value={q}
            onChange={(e) => filtro("buscar", e.target.value)}
          />
        </label>
        <div className="filters" aria-label="Categorías">
          {[{ id: "", nombre: "Todos" }, ...categorias].map((c) => (
            <button
              aria-pressed={categoria === c.id}
              key={c.id}
              onClick={() => filtro("categoria", c.id)}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      </div>
      <p className="muted" role="status">
        {cargando
          ? "Cargando catálogo…"
          : visibles.length + " productos de demostración"}
      </p>
      {error ? (
        <div role="alert">
          <p>No pudimos cargar el catálogo.</p>
          <button className="btn" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      ) : cargando ? (
        <div className="skeleton" />
      ) : visibles.length ? (
        <div className="product-grid">
          {visibles.map((p) => {
            const v = p.presentaciones[0];
            const l = lineas.find(
              (l) => l.productoId === p.id && l.presentacionId === v?.id,
            );
            return (
              <article className="product-card" key={p.id}>
                <ImagenContenido nombre={p.imagenKey} />
                <div className="product-body">
                  <span className="tag">Ejemplo · no comercial</span>
                  <h2>{p.nombre}</h2>
                  <p>
                    {p.descripcion ??
                      "Descripción y presentación comercial pendientes."}
                  </p>
                  <button className="text-button" onClick={() => detalle(p)}>
                    Ver detalle <span className="sr-only">de {p.nombre}</span>
                  </button>
                  {p.presentaciones.length > 1 ? (
                    <button className="btn outline" onClick={() => detalle(p)}>
                      Elegir presentación
                    </button>
                  ) : v ? (
                    l ? (
                      <Cantidad linea={l} nombre={p.nombre} />
                    ) : (
                      <button
                        className="btn outline"
                        onClick={() =>
                          poner({
                            productoId: p.id,
                            presentacionId: v.id,
                            cantidad: 1,
                          })
                        }
                      >
                        Agregar al pedido
                      </button>
                    )
                  ) : (
                    <p>Presentación pendiente</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <h2>
            {productos.length
              ? "No encontramos resultados"
              : "El catálogo está vacío"}
          </h2>
          <p>Probá otra búsqueda o consultanos por nuestros canales.</p>
          <button className="btn outline" onClick={() => setParams({})}>
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  );
}
export function Detalle({ p, cerrar }: { p: Producto; cerrar: () => void }) {
  const [id, setId] = useState(
    p.presentaciones.length === 1 ? (p.presentaciones[0]?.id ?? "") : "",
  );
  const [cantidad, setCantidad] = useState(1);
  const poner = usePedido((s) => s.poner);
  return (
    <div className="detail">
      <ImagenContenido nombre={p.imagenKey} />
      <span className="tag">Producto de demostración</span>
      <p>
        Ingredientes y alérgenos pendientes de validación. Consultanos antes de
        elegir si tenés restricciones alimentarias.
      </p>
      <label>
        Presentación
        <select aria-label="Presentación" value={id} onChange={(e) => setId(e.target.value)}>
          <option value="" disabled>
            Elegí una presentación
          </option>
          {p.presentaciones.map((v) => (
            <option value={v.id} key={v.id}>
              {v.nombre} · {v.unidadesPorPresentacion ?? "Cantidad pendiente"}{" "}
              unidades
            </option>
          ))}
        </select>
      </label>
      <label>
        Cantidad de presentaciones
        <input
          type="number"
          min="1"
          max="99"
          step="1"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.valueAsNumber)}
        />
      </label>
      <button
        className="btn"
        disabled={
          !id || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99
        }
        onClick={() => {
          poner({ productoId: p.id, presentacionId: id, cantidad });
          cerrar();
        }}
      >
        Agregar al pedido
      </button>
    </div>
  );
}
export function Pedido({ productos }: { productos: Producto[] }) {
  const { lineas, set } = usePedido();
  const [nota, setNota] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  return (
    <section className="container section pedido-page">
      <Breadcrumb titulo="Mi pedido" />
      <h1 className="functional"><Trazo>Ya casi estamos.</Trazo></h1>
      <p className="lead">Revisá tu selección y continuá la conversación por WhatsApp.</p>
      {!lineas.length ? (
        <Vacio />
      ) : (
        <div className="review-grid">
          <div className="review-items">
            <Lineas productos={productos} />
            <Link className="editorial-link" to="/productos">← Seguir eligiendo productos</Link>
            <label>
              ¿Querés agregar una aclaración? (opcional)
              <textarea
                maxLength={1000}
                rows={2}
                placeholder="Fecha, preferencias o detalles de tu pedido"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
              <small>{nota.length}/1000</small>
            </label>
            <button
              className="text-button"
              onClick={() => (lineas.length > 1 ? setConfirmar(true) : set([]))}
            >
              Vaciar selección
            </button>
            {confirmar && (
              <div className="notice">
                <p>¿Querés quitar todas las líneas de tu selección?</p>
                <button
                  onClick={() => {
                    set([]);
                    setConfirmar(false);
                  }}
                >
                  Sí, vaciar
                </button>
                <button onClick={() => setConfirmar(false)}>
                  Conservar selección
                </button>
              </div>
            )}
          </div>
          <aside className="summary">
            <h2>Tu selección</h2>
            <p>{lineas.length} productos/presentaciones distintos</p>
            <p>
              <strong>{lineas.reduce((a, l) => a + l.cantidad, 0)}</strong>{" "}
              presentaciones seleccionadas
            </p>

            <SalidaWhatsApp
              tipo="productos"
              texto={mensajePedido(lineas, productos, nota)}
            />
          </aside>
        </div>
      )}
      <PasosPedido />
    </section>
  );
}
export function Consulta({ tipo }: { tipo: "catering" | "comercios" }) {
  const catering = tipo === "catering";
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [texto, setTexto] = useState("");
  const cambiarCampo = (k: string, v: string) => {
    setCampos((c) => ({ ...c, [k]: v }));
    setTexto("");
  };
  function enviar(e: FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    const c = campos;
    if (catering) {
      if (
        !/^\d+$/.test(c.personas ?? "") ||
        Number(c.personas) < 1 ||
        Number(c.personas) > 10000
      )
        err.personas = "Ingresá un entero entre 1 y 10000.";
      if ((c.zona ?? "").trim().length < 2)
        err.zona = "Ingresá una zona o localidad de al menos 2 caracteres.";
      if (c.fecha && c.fecha < fechaRosario())
        err.fecha = "Elegí hoy o una fecha futura.";
    } else if ((c.comercio ?? "").trim().length < 2)
      err.comercio = "Ingresá el nombre del comercio (al menos 2 caracteres).";
    setErrores(err);
    if (Object.keys(err).length) {
      setTimeout(() => document.getElementById("errores")?.focus(), 0);
      return;
    }
    setTexto(
      "Hola Migamax, quiero consultar por " +
        (catering ? "un evento" : "mi comercio") +
        ":\n" +
        Object.entries(c)
          .filter(([, v]) => v.trim())
          .map(([k, v]) => k + ": " + v.trim())
          .join("\n") +
        (catering && !c.fecha ? "\nFecha: A definir" : "") +
        "\n¿Podemos conversar sobre opciones y condiciones?",
    );
  }
  const camposDef = catering
    ? [
        ["fecha", "Fecha del evento (opcional)", "date", 10],
        ["personas", "Cantidad de personas", "number", 5],
        ["zona", "Zona o localidad", "text", 120],
      ]
    : [
        ["comercio", "Nombre del comercio", "text", 120],
        ["contacto", "Nombre de contacto (opcional)", "text", 100],
        ["interes", "Productos de interés (opcional)", "text", 250],
        ["cantidad", "Cantidad aproximada con unidad (opcional)", "text", 120],
      ];
  return (
    <>
      <section className="container split section editorial-hero">
        <div>
          <h1>
            {catering ? (
              <>
                Nos sumamos a tu
                <br />
                <Trazo>próximo encuentro.</Trazo>
              </>
            ) : (
              <>
                Tu negocio,
                <br />
                <Trazo>nuestra propuesta.</Trazo>
              </>
            )}
          </h1>
          <p className="lead">
            {catering
              ? "Contanos qué estás organizando. Te acompañamos a pensar la mesa."
              : "Conversemos sobre los productos que necesitás para tu negocio."}
          </p>

          <a href="#consulta" className="btn">
            {catering ? "Consultar por mi evento" : "Consultar por mayor"}{" "}
            <ArrowRight size={18} />
          </a>
        </div>
        <ImagenContenido
          hero
          nombre={catering ? "catering-hero" : "comercios-presentaciones"}
        />
      </section>
      {catering && (
        <section className="container section">
          <h2>Una mesa para <Trazo>compartir</Trazo></h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <article>
              <ImagenContenido nombre="catering-sandwiches" />
              <h3>Sándwiches</h3>
              <p>Propuesta y presentaciones a coordinar.</p>
            </article>
            <article>
              <ImagenContenido nombre="catering-pizzetines" />
              <h3>Pizzetines</h3>
              <p>Opciones y cantidades a confirmar.</p>
            </article>
          </div>
        </section>
      )}
      <section className="soft section" id="consulta">
        <div className="container form-layout">
          <div>

            <h2>
              {catering ? "Contanos sobre tu evento" : "Conozcamos tu comercio"}
            </h2>
            <p>
              Este formulario prepara una consulta para WhatsApp. No se envía
              automáticamente ni confirma una reserva.
            </p>
          </div>
          <form noValidate onSubmit={enviar}>
            {Object.keys(errores).length > 0 && (
              <div id="errores" tabIndex={-1} role="alert" className="notice">
                <strong>Revisá los campos:</strong>
                {Object.entries(errores).map(([k, v]) => (
                  <p key={k}>
                    <a href={"#" + k}>{v}</a>
                  </p>
                ))}
              </div>
            )}
            {camposDef.map(([k, label, type, max]) => (
              <label key={k}>
                {" "}
                {label}
                <input
                  id={String(k)}
                  type={String(type)}
                  maxLength={Number(max)}
                  min={
                    type === "date"
                      ? fechaRosario()
                      : type === "number"
                        ? 1
                        : undefined
                  }
                  max={type === "number" ? 10000 : undefined}
                  value={campos[String(k)] ?? ""}
                  aria-invalid={!!errores[String(k)]}
                  aria-describedby={
                    errores[String(k)] ? String(k) + "-error" : undefined
                  }
                  onChange={(e) => cambiarCampo(String(k), e.target.value)}
                />
                {errores[String(k)] && (
                  <span className="error" id={String(k) + "-error"}>
                    {errores[String(k)]}
                  </span>
                )}
              </label>
            ))}
            <label>
              Comentarios (opcional)
              <textarea
                rows={4}
                maxLength={1000}
                value={campos.comentarios ?? ""}
                onChange={(e) => cambiarCampo("comentarios", e.target.value)}
              />
              <small>{(campos.comentarios ?? "").length}/1000</small>
            </label>
            <button className="btn">
              Preparar consulta <ArrowRight size={18} />
            </button>
            {texto && <SalidaWhatsApp tipo={tipo} texto={texto} />}
          </form>
        </div>
      </section>
    </>
  );
}
export function Familia() {
  return (
    <>
      <section className="container split section editorial-hero family-hero">
        <div>

          <h1>
            Detrás de cada pedido,
            <br />
            <Trazo>estamos nosotros.</Trazo>
          </h1>
          <p className="lead">
            Una empresa familiar de Rosario dedicada a los sándwiches.
          </p>
          <p>
            La mesa es un lugar de encuentro. Queremos ser parte de esos
            momentos con una atención cercana, de persona a persona.
          </p>
          <Link className="btn" to="/productos">
            Conocer productos <ArrowRight size={18} />
          </Link>
        </div>
        <ImagenContenido nombre="familia-equipo" />
      </section>
      <section className="soft section">
        <div className="container split">
          <ImagenContenido nombre="familia-elaboracion" />
          <div>
            <h2>Una historia para <Trazo>contar</Trazo></h2>
            <p>
              Estamos preparando nuestra historia y las fotografías de quienes
              hacen Migamax. Pronto vas a poder conocernos mejor.
            </p>
            <p className="notice">
              Historia, fechas y proceso de elaboración pendientes de
              aprobación.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
export function Contacto() {
  return (
    <section className="container section">

      <h1>Estamos para <Trazo>ayudarte.</Trazo></h1>
      <p className="lead">Elegí el camino que mejor se adapte a tu consulta.</p>
      <div className="grid sm:grid-cols-3 gap-6 contact-cards">
        {[
          [
            "Pedidos y productos",
            "Armá tu selección y revisala antes de consultar.",
            "/productos",
            "Ver productos",
          ],
          [
            "Catering y eventos",
            "Contanos fecha, cantidad de personas y zona.",
            "/catering",
            "Consultar por un evento",
          ],
          [
            "Para comercios",
            "Conversemos sobre lo que necesita tu negocio.",
            "/comercios",
            "Consultar por mayor",
          ],
        ].map(([t, d, url, cta]) => (
          <article key={t}>
            <h2>{t}</h2>
            <p>{d}</p>
            <Link className="editorial-link" to={url ?? "/"}>
              {cta} ↗
            </Link>
          </article>
        ))}
      </div>
      <div className="split section">
        <div>
          <h2>Nos encontrás en Rosario</h2>
          <p>
            Dirección, horarios y modalidades de entrega/retiro pendientes de
            confirmación.
          </p>
          <p>No hay un contacto de WhatsApp aprobado todavía.</p>
        </div>
        <ImagenContenido nombre="contacto-mapa" />
      </div>
    </section>
  );
}
export function Privacidad() {
  return (
    <section className="container section prose">
      <h1>Tu privacidad</h1>
      <h2>Tu selección queda en este navegador</h2>
      <p>
        Guardamos solo los identificadores de producto y presentación,
        cantidades, versión y fecha en el almacenamiento local durante un máximo
        de 30 días. No es una reserva ni una confirmación de disponibilidad.
        Podés borrarla con “Vaciar selección” en Mi pedido o eliminando los
        datos del sitio desde el navegador.
      </p>
      <h2>Consultas y WhatsApp</h2>
      <p>
        Las aclaraciones y los formularios se mantienen en memoria durante esta
        visita y no se guardan en el almacenamiento local. Se usan para preparar
        el texto que elegís copiar o abrir en WhatsApp. El sitio no envía
        mensajes automáticamente ni sabe si los enviaste. WhatsApp aplica sus
        propias condiciones al abrir la conversación.
      </p>
      <h2>Contacto</h2>
      <p>
        El equipo de Migamax atiende las consultas. El contacto del responsable
        de privacidad está pendiente de confirmación antes de publicar el sitio
        comercial.
      </p>
      <p>No usamos analítica, feeds sociales ni cookies de seguimiento.</p>
    </section>
  );
}
export function NotFound() {
  return (
    <section className="container section empty">
      <p className="eyebrow">404</p>
      <h1>Esta página no está en la mesa.</h1>
      <p>Tu selección sigue guardada. Podés seguir eligiendo.</p>
      <Link className="btn" to="/">
        Volver a Inicio
      </Link>
      <Link className="editorial-link" to="/productos">
        Ver productos
      </Link>
    </section>
  );
}
