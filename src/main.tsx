
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { MotionProvider, preloadMotion } from "./app/components/MotionProvider";
  import "./styles/index.css";

  preloadMotion();
  createRoot(document.getElementById("root")!).render(
    <MotionProvider>
      <App />
    </MotionProvider>
  );
  