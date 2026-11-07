
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { MotionProvider, preloadMotion } from "./app/components/MotionProvider";
  import "./styles/index.css";
import { startLogoDownloads } from "./lib/preload";
import { installGrainTile } from "./lib/grain";

  preloadMotion();
// Start fetching the gem and the rest of the logo now, before the page is drawn.
startLogoDownloads();
// A small repeating grain for the orbs' halos (see grain.ts); made once, after the page has started loading.
setTimeout(installGrainTile, 0);
  createRoot(document.getElementById("root")!).render(
    <MotionProvider>
      <App />
    </MotionProvider>
  );
  