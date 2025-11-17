import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  // Base URL für Deployment auf https://maximilianhaak.de/CasinoIdleSlots/
  base: process.env.NODE_ENV === 'production' ? '/CasinoIdleSlots/' : '/',
  
  plugins: [
    react(),
    tailwindcss(),
  ],
  
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  
  build: {
    // Optimierungen für Production
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // esbuild ist schneller und default in Vite
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-tabs'],
          'phosphor-icons': ['@phosphor-icons/react'],
        }
      }
    }
  },
});
