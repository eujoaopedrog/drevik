// =========================================
// DREVIK — AMOSTRAGEM DE TINTA
// Sorteia grãos proporcionalmente à quantidade de tinta em cada pixel.
// Roda em um Worker para não travar a página durante o carregamento.
// =========================================
const makeContext = (w, h) => {
    if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(w, h).getContext('2d', { willReadFrequently: true });
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas.getContext('2d', { willReadFrequently: true });
};

const samplePoints = (bitmap, count, { keepColor, fitWidth }) => {
    const maxSide = 640;
    const ratio = Math.min(maxSide / bitmap.width, maxSide / bitmap.height);
    const w = Math.round(bitmap.width * ratio);
    const h = Math.round(bitmap.height * ratio);
    const ctx = makeContext(w, h);
    ctx.drawImage(bitmap, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const norm = fitWidth ? 1 / w : 1 / Math.max(h, w * 1.18);
    let placed = 0;
    let guard = 0;

    while (placed < count && guard < count * 400) {
        guard++;
        const x = Math.floor(Math.random() * w);
        const y = Math.floor(Math.random() * h);
        const i = (y * w + x) * 4;
        const peak = Math.max(data[i], data[i + 1], data[i + 2]);
        const luma = peak / 255;
        if (luma < 0.08 || Math.random() > luma * luma + 0.04) continue;

        positions[placed * 3] = (x - w / 2 + Math.random()) * norm;
        positions[placed * 3 + 1] = (h / 2 - y - Math.random()) * norm;
        // Pontos mais claros ficam mais à frente: a estampa ganha relevo ao girar
        positions[placed * 3 + 2] = (luma - 0.5) * 0.24;

        if (keepColor) {
            const saturation = (peak - Math.min(data[i], data[i + 1], data[i + 2])) / 255;
            if (saturation > 0.16) {
                colors[placed * 3] = data[i] / 255;
                colors[placed * 3 + 1] = data[i + 1] / 255;
                colors[placed * 3 + 2] = data[i + 2] / 255;
            }
        }
        placed++;
    }
    return { positions, colors };
};

const SHAPES = [
    { name: 'dk', keepColor: false, fitWidth: true },
    { name: 'phase-one', keepColor: true },
    { name: 'the-process', keepColor: false },
    { name: 'every-scar', keepColor: false },
    { name: 'stay-hard', keepColor: false }
];

export const sampleAllShapes = async (baseUrl, count) => {
    const bitmaps = await Promise.all(SHAPES.map(async ({ name }) => {
        const response = await fetch(new URL(`img/ink/${name}.webp`, baseUrl));
        return createImageBitmap(await response.blob());
    }));
    return SHAPES.map((shape, index) => samplePoints(bitmaps[index], count, shape));
};
