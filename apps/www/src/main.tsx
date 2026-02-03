import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { LegalPage } from "./pages/LegalPage";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/privacy" element={<LegalPage type="privacy-policy" />} />
        <Route path="/disclaimer" element={<LegalPage type="disclaimer" />} />
        <Route path="/external-services" element={<LegalPage type="external-services" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
