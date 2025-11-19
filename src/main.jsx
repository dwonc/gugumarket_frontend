import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // ✅ 이게 있는지 확인!
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
