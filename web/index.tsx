import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("no root element");
createRoot(root).render(<App />);
