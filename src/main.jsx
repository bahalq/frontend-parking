import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { HashRouter } from "react-router-dom";
import "./i18n"; // تهيئة i18next
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { RealtimeProvider } from "./context/RealtimeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RealtimeProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </RealtimeProvider>
    </AuthProvider>
  </StrictMode>,
);
