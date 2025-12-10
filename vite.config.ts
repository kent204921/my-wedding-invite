import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This tells Vite to replace 'process.env.API_KEY' with 'import.meta.env.VITE_API_KEY'
    // in your code when building, ensuring the AI service works in the browser.
    'process.env.API_KEY': 'import.meta.env.VITE_API_KEY'
  }
});