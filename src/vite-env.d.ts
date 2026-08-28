/// <reference types="vite/client" />

// Ambient module declaration for the custom `figma:asset/*` import scheme
// resolved by the figmaAssetResolver plugin in vite.config.ts (maps to
// files under src/assets at build time). Without this, any TypeScript
// tooling that actually type-checks the project -- none currently runs in
// CI or the build, but that's a gap worth someone eventually closing --
// reports "cannot find module" for every one of these imports, even
// though they resolve correctly at build and runtime.
declare module 'figma:asset/*' {
  const src: string;
  export default src;
}
