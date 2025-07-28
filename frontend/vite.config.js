import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige todas las requests a /swagger.json al backend de Express
      '/swagger.json': 'http://localhost:3010',
      // Redirige todas las requests a /swagger-es.json al backend de Express
      '/swagger-es.json': 'http://localhost:3010'
    }
  }
})
