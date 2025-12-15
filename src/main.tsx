import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BoardProvider } from "./contexts/BoardContext.tsx";
import { ToastProvider } from "./contexts/ToastContext.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <BoardProvider>
          <App />
        </BoardProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>
);

