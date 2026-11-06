import { productos } from "./data/local/productos";
import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App, ErrorBoundary } from "./app/App";
import "./styles/index.css";
const root = document.getElementById("root")!;
const app = (
  <ErrorBoundary>
    <BrowserRouter>
      <App inicial={productos} />
    </BrowserRouter>
  </ErrorBoundary>
);
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
