import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
  build: {
    rollupOptions: {
      // Five pages (the fifth, /my-transcript, is where a person takes back what they allowed for a transcript they sent): the free tool, the separate /coach demo, the owner's private /admin page (not linked anywhere), and /verify,
      // where anyone can check a signed transcript in their own browser.
      input: {
        main: path.resolve(__dirname, 'index.html'),
        coach: path.resolve(__dirname, 'coach/index.html'),
        admin: path.resolve(__dirname, 'admin/index.html'),
        verify: path.resolve(__dirname, 'verify/index.html'),
        myTranscript: path.resolve(__dirname, 'my-transcript/index.html'),
        // /bench: a design page for tuning the logo's gem and orbits side by side (not linked anywhere, not indexed).
        bench: path.resolve(__dirname, 'bench/index.html'),
        // /cell: partner practice, two people in an end-to-end encrypted cell (off unless CELL_ENABLED=true; not indexed).
        cell: path.resolve(__dirname, 'cell/index.html'),
      },
    },
  },
})
