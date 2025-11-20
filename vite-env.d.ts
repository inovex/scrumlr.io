/// <reference types="./vite-env-override.d.ts" />
/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_HTTP_URL: string;
  readonly VITE_SERVER_WEBSOCKET_URL: string;
  readonly VITE_VERSION: string;
  readonly VITE_PUBLIC_URL: string;
  readonly VITE_LEGACY_CREATE_BOARD: string;
  // Add other env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

