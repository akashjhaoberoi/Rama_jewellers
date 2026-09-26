import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/goldapi': {
                target: 'https://www.goldapi.io/api',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/goldapi/, '')
            },
            '/goldprice': {
                target: 'https://data-asg.goldprice.org',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/goldprice/, '')
            }
        }
    }
});
