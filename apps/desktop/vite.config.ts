import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    host: "127.0.0.1",
    port: Number(process.env.HERRAMIENTAS_VITE_PORT ?? 5175),
    strictPort: true,
    proxy: { "/api": `http://127.0.0.1:${process.env.HERRAMIENTAS_API_PORT ?? 3030}` }
  },
  envPrefix: ["VITE_"]
});
