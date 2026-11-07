
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { MotionProvider, preloadMotion } from "./app/components/MotionProvider";
  import "./styles/index.css";
import { startLogoDownloads } from "./lib/preload";

  preloadMotion();
// Start fetching the gem and the rest of the logo now, before the page is drawn.
startLogoDownloads();
  createRoot(document.getElementById("root")!).render(
    <MotionProvider>
      <App />
    </MotionProvider>
  );
  