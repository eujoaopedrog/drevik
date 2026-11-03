// =========================================
// DREVIK — WORKER DA TINTA
// =========================================
import { sampleAllShapes } from './ink-sampler.js';

self.addEventListener('message', async ({ data }) => {
    try {
        const shapes = await sampleAllShapes(data.baseUrl, data.count);
        const buffers = shapes.flatMap(shape => [shape.positions.buffer, shape.colors.buffer]);
        self.postMessage({ shapes }, buffers);
    } catch (error) {
        self.postMessage({ error: String(error) });
    }
});
