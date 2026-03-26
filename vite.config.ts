import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 0,
    rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          'ma-demarche': resolve(__dirname, 'ma-demarche.html'),
          mentions: resolve(__dirname, 'mentions-legales.html'),
          '404': resolve(__dirname, '404.html'),
          'film-de-marque': resolve(__dirname, 'projet/film-de-marque/index.html'),
          'mariage': resolve(__dirname, 'projet/mariage/index.html'),
          'direction-artistique': resolve(__dirname, 'projet/direction-artistique/index.html'),
          'film-institutionnel': resolve(__dirname, 'projet/film-institutionnel/index.html'),
          'demande-en-mariage': resolve(__dirname, 'projet/demande-en-mariage/index.html'),
          'contenu-social': resolve(__dirname, 'projet/contenu-social/index.html'),
          'strategie-visuelle': resolve(__dirname, 'projet/strategie-visuelle/index.html'),
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three/')) return 'vendor-three';
            if (id.includes('node_modules/@react-three/fiber')) return 'vendor-r3f';
            if (id.includes('node_modules/@react-three/drei')) return 'vendor-drei';
            if (id.includes('node_modules/@react-three/postprocessing') || id.includes('node_modules/postprocessing')) return 'vendor-postprocessing';
            if (id.includes('node_modules/framer-motion')) return 'vendor-framer';
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor-react';
          },
        },
    },
  },
})
