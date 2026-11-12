// Builds ONLY the logo export page (logo-export/index.html), on its own, for scripts/render-logo-assets.mts. The page is not part of the site's own build.
//   npx vite build --config scripts/logo-export.vite.config.mts
import { defineConfig } from 'vite';
import path from 'node:path';
import os from 'node:os';
import base from '../vite.config.ts';

const root = path.resolve(import.meta.dirname, '..');
export default defineConfig({
  ...(base as object),
  root,
  base: './',
  build: {
    outDir: process.env.LOGO_EXPORT_OUT || path.join(os.homedir(), 'Desktop', 'Nenya Research', 'logo-regen', 'export-build'),
    emptyOutDir: true,
    rollupOptions: { input: { logoExport: path.resolve(root, 'logo-export/index.html') } },
  },
});
