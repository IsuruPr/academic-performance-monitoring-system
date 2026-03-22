import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: "serve-root-index",
      configureServer(server) {
        // Ensure visiting http://localhost:5173/ returns the Vite entry `index.html`.
        server.middlewares.use((req, res, next) => {
          try {
            const url = req.url ? req.url.split("?")[0] : "/";
            if (url === "/") req.url = "/index.html";
          } catch {
            // If parsing fails, fall back to Vite defaults.
          }
          next();
        });
      },
    },
  ],
  server: {
    proxy: {
     
      '/api': 'http://localhost:17777'
    }
  }
})