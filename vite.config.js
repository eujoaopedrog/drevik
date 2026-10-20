import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            input: {
                home: resolve(projectRoot, 'index.html'),
                shop: resolve(projectRoot, 'shop.html'),
                product: resolve(projectRoot, 'product.html')
            }
        }
    }
});
