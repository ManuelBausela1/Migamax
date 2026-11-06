import { productos } from "./data/local/productos";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { App } from "./app/App";
export { paginas } from "./app/meta";
export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <App inicial={productos} />
    </StaticRouter>,
  );
}
