// =========================================
// DREVIK — AMOSTRAGEM DE TINTA
// Transforma cada estampa em grãos por pontilhado.
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

// Quanto de tinta cada pixel recebe: corta o ruído do fundo e fecha os pretos
const inkDensity = (peak, lift = 1) => {
    const t = Math.min(Math.max((Math.pow(peak / 255, lift) - 0.1) / 0.72, 0), 1);
    return t * t * (3 - 2 * t);
};

const readPixels = (bitmap, w, h) => {
    const ctx = makeContext(w, h);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h).data;
};

// Pontilhado por difusão de erro (Floyd-Steinberg): cada grão cai onde a tinta
// precisa dele, e não ao acaso. É o que mantém letras e traços finos legíveis.
const samplePoints = (bitmap, count, { keepColor, fitWidth, lift }) => {
    // Primeira leitura só para medir a tinta total e escolher a grade que rende `count` grãos
    const probeW = 256;
    const probeH = Math.round((bitmap.height / bitmap.width) * probeW);
    const probe = readPixels(bitmap, probeW, probeH);
    let totalInk = 0;
    for (let i = 0; i < probeW * probeH; i++) {
        totalInk += inkDensity(Math.max(probe[i * 4], probe[i * 4 + 1], probe[i * 4 + 2]), lift);
    }
    const scale = Math.min(Math.sqrt(count / Math.max(totalInk, 1)), 2200 / Math.max(probeW, probeH));
    const w = Math.max(Math.round(probeW * scale), 2);
    const h = Math.max(Math.round(probeH * scale), 2);

    const data = readPixels(bitmap, w, h);
    const field = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
        field[i] = inkDensity(Math.max(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]), lift);
    }

    const dots = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const p = y * w + x;
            const on = field[p] >= 0.5;
            const error = field[p] - (on ? 1 : 0);
            if (on) dots.push(p);
            if (x + 1 < w) field[p + 1] += error * 7 / 16;
            if (y + 1 < h) {
                if (x > 0) field[p + w - 1] += error * 3 / 16;
                field[p + w] += error * 5 / 16;
                if (x + 1 < w) field[p + w + 1] += error / 16;
            }
        }
    }

    // Embaralhar é essencial: cada grão muda de forma aleatoriamente entre estampas,
    // e qualquer início da lista continua sendo uma amostra da estampa inteira
    for (let i = dots.length - 1; i > 0; i--) {
        const k = Math.floor(Math.random() * (i + 1));
        [dots[i], dots[k]] = [dots[k], dots[i]];
    }

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const norm = fitWidth ? 1 / w : 1 / Math.max(h, w * 1.18);

    for (let n = 0; n < count; n++) {
        // Se sobrarem grãos, eles reforçam pontos já existentes
        const p = dots[n % dots.length];
        const x = p % w;
        const y = Math.floor(p / w);
        const i = p * 4;
        const peak = Math.max(data[i], data[i + 1], data[i + 2]);

        // Deslocamento mínimo: tira o aspecto de grade sem borrar o traço
        positions[n * 3] = (x - w / 2 + 0.5 + (Math.random() - 0.5) * 0.5) * norm;
        positions[n * 3 + 1] = (h / 2 - y - 0.5 + (Math.random() - 0.5) * 0.5) * norm;
        // Relevo discreto: dá para perceber ao girar, sem desfocar as letras
        positions[n * 3 + 2] = (peak / 255 - 0.5) * 0.05;

        if (keepColor) {
            const saturation = (peak - Math.min(data[i], data[i + 1], data[i + 2])) / 255;
            if (saturation > 0.16) {
                colors[n * 3] = data[i] / 255;
                colors[n * 3 + 1] = data[i + 1] / 255;
                colors[n * 3 + 2] = data[i + 2] / 255;
            }
        }
    }
    return { positions, colors };
};

const SHAPES = [
    { name: 'dk', keepColor: false, fitWidth: true },
    { name: 'phase-one', keepColor: true },
    { name: 'the-process', keepColor: false },
    // A ilustração do espelho é feita de cinzas escuros: sobe os meios-tons para não sumir
    { name: 'every-scar', keepColor: false, lift: 0.6 },
    { name: 'stay-hard', keepColor: false }
];

export const sampleAllShapes = async (baseUrl, count) => {
    const bitmaps = await Promise.all(SHAPES.map(async ({ name }) => {
        const response = await fetch(new URL(`img/ink/${name}.webp`, baseUrl));
        return createImageBitmap(await response.blob());
    }));
    return SHAPES.map((shape, index) => samplePoints(bitmaps[index], count, shape));
};
