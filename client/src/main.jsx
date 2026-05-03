import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import "./styles/base/reset.css";
import "./styles/base/layout.css";
import "./styles/base/variables.css";
import "./styles/base/typography.css";
import "./styles/base/spacing.css";
import "./styles/components/Button.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
