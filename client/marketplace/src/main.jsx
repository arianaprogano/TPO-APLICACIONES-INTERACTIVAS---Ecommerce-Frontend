import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { AvisosProvider } from "./components/Avisos.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <AvisosProvider>
        <App />
      </AvisosProvider>
    </BrowserRouter>
  </Provider>
);