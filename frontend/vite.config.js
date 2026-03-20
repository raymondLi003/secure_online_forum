import { defineConfig } from 'vite';
import fs from 'fs';

// paths to the SSL certificate and key files
const httpsOptions = {
  key: fs.readFileSync('../server/src/certs/server-key.pem'),
  cert: fs.readFileSync('../server/src/certs/server-cert.pem'),
};

export default defineConfig({
  server: {
    port: 3001,
    https: httpsOptions, // Enable HTTPS
    proxy: {
      '/api': {
        target: 'https://localhost:3000',
        secure: false, //  set this to false for using a self-signed certificate
        changeOrigin: false, 
      },
    },
  },
});
