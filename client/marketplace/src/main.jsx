
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AvisosProvider } from "./components/Avisos.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AvisosProvider>
      <App />
    </AvisosProvider>
  </BrowserRouter>
);
