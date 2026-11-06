import { useEffect, useState, useRef, Component, type ReactNode } from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Home,
  Sandwich,
  ShoppingBag,
  BellRing,
  Menu,
  X,
  ArrowRight,
  Camera as Instagram,
} from "lucide-react";
import type { Producto } from "../domain/model";
import { recuperar } from "../domain/model";
import { useServicios } from "./dependencies";
import { paginas } from "./meta";
import { usePedido } from "../ui/store";
import { LogoMarca, Modal, Lineas, Vacio } from "../ui/components";
import {
  Inicio,
  Productos,
  Detalle,
  Pedido,
  Consulta,
  Familia,
  Contacto,
  Privacidad,
  NotFound,
} from "../ui/screens";
const enlaces = [
  ["/", "Inicio"],
  ["/productos", "Productos"],
  ["/catering", "Catering"],
  ["/nuestra-familia", "Nuestra familia"],
  ["/comercios", "Comercios"],
  ["/contacto", "Contacto"],
];
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <main className="container section">
        <h1>No pudimos mostrar esta página</h1>
        <button className="btn" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
export function App({ inicial = [] }: { inicial?: Producto[] }) {
  const servicios = useServicios();
  const [productos, setProductos] = useState<Producto[]>(inicial);
  const [cargando, setCargando] = useState(inicial.length === 0);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [overlay, setOverlay] = useState<"menu" | "pedido" | Producto | null>(
    null,
  );
  const { lineas, aviso, ultima, deshacer } = usePedido();
  const total = lineas.reduce((a, l) => a + l.cantidad, 0);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(false);
    servicios.catalogo
      .listar()
      .then((p) => {
        if (!activo) return;
        setProductos(p);
        let raw = null;
        try {
          raw = servicios.seleccion.leer();
        } catch {
          usePedido
            .getState()
            .avisar(
              "No se puede acceder al almacenamiento. Tu selección seguirá en memoria.",
            );
        }
        const r = recuperar(raw, p);
        usePedido.getState().set(r.lineas);
        if (r.aviso) usePedido.getState().avisar(r.aviso);
        setCargando(false);
      })
      .catch(() => {
        if (activo) {
          setError(true);
          setCargando(false);
        }
      });
    return () => {
      activo = false;
    };
  }, [servicios, intento]);
  useEffect(() => {
    if (cargando || error) return;
    const unsub = usePedido.subscribe((s, prev) => {
      if (s.lineas === prev.lineas || unsubSync) return;
      try {
        servicios.seleccion.guardar(s.lineas);
      } catch {
        usePedido
          .getState()
          .avisar(
            "No pudimos guardar la selección. Sigue disponible durante esta visita.",
          );
      }
    });
    const stop = servicios.seleccion.observar((raw) => {
      const r = recuperar(raw, productos);
      unsubSync = true;
      usePedido.getState().set(r.lineas);
      unsubSync = false;
      if (r.aviso) usePedido.getState().avisar(r.aviso);
    });
    let unsubSync = false;
    void unsubSync;
    return () => {
      unsub();
      stop();
    };
  }, [cargando, error, productos, servicios]);
  useEffect(() => {
    setOverlay(null);
    window.scrollTo(0, 0);
    const meta = paginas[location.pathname];
    document.title = meta?.titulo ?? "Página no encontrada | Migamax";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", meta?.descripcion ?? "Página no encontrada.");
    const base = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
    if (base) {
      document
        .querySelector('link[rel="canonical"]')
        ?.setAttribute("href", base + location.pathname);
      document
        .querySelector('meta[property="og:url"]')
        ?.setAttribute("content", base + location.pathname);
    }
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute(
        "content",
        meta?.titulo ?? "Página no encontrada | Migamax",
      );
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", meta?.descripcion ?? "Página no encontrada.");
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute(
        "content",
        import.meta.env.VITE_CONTENT_MODE === "public" &&
          meta &&
          location.pathname !== "/mi-pedido"
          ? "index,follow"
          : "noindex,nofollow",
      );
  }, [location.pathname]);
  useEffect(() => {
    const pop = () => setOverlay(null);
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    if (overlay === "menu") menuRef.current?.querySelector("a")?.focus();
  }, [overlay]);
  useEffect(() => {
    const m = window.matchMedia("(min-width:1280px)");
    const close = () => setOverlay(null);
    m.addEventListener("change", close);
    return () => m.removeEventListener("change", close);
  }, []);
  function abrir(o: typeof overlay) {
    if (!overlay)
      window.history.pushState({ overlay: true }, "", window.location.href);
    setOverlay(o);
  }
  function cerrar() {
    if (window.history.state?.overlay) window.history.back();
    setOverlay(null);
    if (overlay === "menu") menuTrigger.current?.focus();
  }
  function ir(url: string) {
    if (window.history.state?.overlay) {
      window.history.replaceState(null, "", window.location.href);
    }
    setOverlay(null);
    navigate(url);
  }
  return (
    <>
      <a href="#contenido" className="skip">
        Saltar al contenido
      </a>
      <header className="header home-header">
        <div className="container header-inner">
          <Link to="/" aria-label="Migamax, inicio">
            <LogoMarca />
          </Link>
          <nav className="desktop-nav" aria-label="Principal">
            {enlaces.map(([url, t]) => (
              <NavLink end={url === "/"} key={url} to={url ?? "/"}>
                {t}
              </NavLink>
            ))}
            <button
              className="btn"
              aria-label={"Mi pedido, " + total + " unidades"}
              onClick={() => abrir("pedido")}
            >
              <ShoppingBag size={18} /> Mi pedido{" "}
              <span className="badge">{total > 99 ? "99+" : total}</span>
            </button>
          </nav>
        </div>
      </header>
      <div className="demo-banner sr-only">
        Vista de demostración · fotos, catálogo y contacto pendientes de
        aprobación
      </div>
      {overlay === "menu" ? (
        <nav
          id="menu-movil"
          ref={menuRef}
          className="mobile-menu container"
          aria-label="Más páginas"
          onKeyDown={(e) => {
            if (e.key === "Escape") cerrar();
          }}
        >
          <div className="menu-pages">
            {[
              ["/nuestra-familia", "Nuestra familia"],
              ["/comercios", "Para comercios"],
              ["/contacto", "Contacto y ubicación"],
            ].map(([u, t]) => (
              <Link key={u} to={u ?? "/"} onClick={() => ir(u ?? "/")}>
                {t} <ArrowRight />
              </Link>
            ))}
          </div>
          <Sociales />
        </nav>
      ) : (
        <>
          <main id="contenido" className="site-content">
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route
                path="/productos"
                element={
                  <Productos
                    productos={productos}
                    detalle={abrir}
                    cargando={cargando}
                    error={error}
                    reintentar={() => setIntento((i) => i + 1)}
                  />
                }
              />
              <Route
                path="/mi-pedido"
                element={<Pedido productos={productos} />}
              />
              <Route
                path="/catering"
                element={<Consulta key="catering" tipo="catering" />}
              />
              <Route
                path="/comercios"
                element={<Consulta key="comercios" tipo="comercios" />}
              />
              <Route path="/nuestra-familia" element={<Familia />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/privacidad" element={<Privacidad />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="home-footer">
            <div className="container footer-grid">
              <div>
                <Link to="/" aria-label="Migamax, inicio">
                  <LogoMarca />
                </Link>
                <p>
                  De nuestra familia a tu mesa.
                  <br />
                  Rosario, Santa Fe.
                </p>
              </div>
              <nav aria-label="Enlaces del pie">
                {enlaces.map(([u, t]) => (
                  <Link key={u} to={u ?? "/"}>
                    {t}
                  </Link>
                ))}
              </nav>
              <Sociales />
            </div>
            <div className="container footer-bottom">
              <span>© {new Date().getFullYear()} Migamax</span>
              <Link to="/privacidad">Privacidad</Link>
              <span>Vista de demostración · imágenes y contenido pendientes de aprobación</span>
            </div>
          </footer>
        </>
      )}
      <nav className="bottom-nav" aria-label="Navegación móvil">
        <NavLink to="/" end onClick={() => overlay && cerrar()}>
          <Home />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/productos" onClick={() => overlay && cerrar()}>
          <Sandwich />
          <span>Productos</span>
        </NavLink>
        <button
          aria-label={"Mi pedido, " + total + " unidades"}
          aria-expanded={overlay === "pedido"}
          onClick={() => abrir("pedido")}
        >
          <span className="bag-icon">
            <ShoppingBag />
            {total > 0 && <small>{total > 99 ? "99+" : total}</small>}
          </span>
          <span>Mi pedido</span>
        </button>
        <NavLink to="/catering" onClick={() => overlay && cerrar()}>
          <BellRing />
          <span>Catering</span>
        </NavLink>
        <button
          ref={menuTrigger}
          aria-label={overlay === "menu" ? "Cerrar menú" : "Menú"}
          aria-controls="menu-movil"
          aria-expanded={overlay === "menu"}
          onClick={() => (overlay === "menu" ? cerrar() : abrir("menu"))}
        >
          {overlay === "menu" ? <X /> : <Menu />}
          <span>Menú</span>
        </button>
      </nav>
      <div className="toast" role="status">
        {aviso}
        {ultima && <button onClick={deshacer}>Deshacer</button>}
      </div>
      {overlay && overlay !== "menu" && (
        <Modal
          titulo={overlay === "pedido" ? "Mi pedido" : overlay.nombre}
          panel={overlay === "pedido"}
          cerrar={cerrar}
        >
          {overlay === "pedido" ? (
            <div className="drawer-body">
              {lineas.length ? (
                <>
                  <p>{total} presentaciones seleccionadas</p>
                  <Lineas productos={productos} />
                  <div className="drawer-actions">
                    <button className="btn" onClick={() => ir("/mi-pedido")}>
                      Revisar pedido <ArrowRight size={18} />
                    </button>
                    <button
                      className="text-button"
                      onClick={() => ir("/productos")}
                    >
                      Seguir eligiendo
                    </button>
                  </div>
                </>
              ) : (
                <div
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("a"))
                      ir("/productos");
                  }}
                >
                  <Vacio />
                </div>
              )}
            </div>
          ) : (
            <Detalle p={overlay} cerrar={cerrar} />
          )}
        </Modal>
      )}
    </>
  );
}
function Sociales() {
  return (
    <div className="socials">
      <a
        href="https://www.instagram.com/migamaxsandwiches/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Instagram size={18} />
        <span>
          Instagram Sándwiches<small>@migamaxsandwiches ↗</small>
        </span>
      </a>
      <a
        href="https://www.instagram.com/migamaxcatering/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Instagram size={18} />
        <span>
          Instagram Catering<small>@migamaxcatering ↗</small>
        </span>
      </a>
    </div>
  );
}
