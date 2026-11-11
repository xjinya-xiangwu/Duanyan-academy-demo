import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { StoreProvider } from "./store";
import "./styles.css";

const rawBase = import.meta.env.BASE_URL;
const basename = rawBase === "/" ? undefined : rawBase.replace(/\/$/, "");

const root = document.getElementById("root");
if (!root) {
  throw new Error("缺少根节点");
}

createRoot(root).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
);
