import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        server: {
            proxy: {
                '/goldapi': {
                    target: 'https://www.goldapi.io/api',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/goldapi/, ''),
                    headers: {
                        'x-access-token': env.GOLDAPI_KEY,
                        'Content-Type': 'application/json'
                    }
                },
                '/goldprice': {
                    target: 'https://data-asg.goldprice.org',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/goldprice/, '')
                }
            }
        }
    };
});
