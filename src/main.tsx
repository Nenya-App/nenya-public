
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { MotionProvider, preloadMotion } from "./app/components/MotionProvider";
  import "./styles/index.css";
import { startLogoDownloads } from "./lib/preload";
import { guardBackAfterExit } from "./lib/emergencyExit";
import { forwardIdentityLinks } from "./admin/identityRedirect";

// An Identity email link (invite or password reset) lands on this page; pass it on to the owner's page.
forwardIdentityLinks();
// After an emergency exit, Back must not bring this page back.
guardBackAfterExit();

  preloadMotion();
// Start fetching the gem and the rest of the logo now, before the page is drawn.
startLogoDownloads();
  createRoot(document.getElementById("root")!).render(
    <MotionProvider>
      <App />
    </MotionProvider>
  );
  