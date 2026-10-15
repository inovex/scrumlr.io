import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    testIsolation: true,
    responseTimeout: 10000
  },
});
