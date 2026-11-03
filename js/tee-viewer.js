// =========================================
// DREVIK — CAMISETA 3D (Three.js)
// A silhueta da peça é inflada em um volume fechado: frente e costas se
// encontram na borda, com mangas, gola e tecido que reagem ao giro.
// =========================================
import * as THREE from 'three';

const VERTEX = /* glsl */ `
    uniform float uTime;
    uniform float uSway;

    attribute vec2 aMaskUv;
    attribute float aDepth;

    varying vec2 vUv;
    varying vec2 vMaskUv;
    varying float vDepth;
    varying vec3 vNormal;
    varying vec3 vView;

    void main() {
        vUv = uv;
        vMaskUv = aMaskUv;
        vDepth = aDepth;

        vec3 p = position;
        // Mangas e barra atrasam em relação ao corpo quando a peça gira
        float loose = smoothstep(0.25, 1.0, abs(p.x)) + smoothstep(-0.2, -1.0, p.y) * 0.7;
        p.z += uSway * loose * 0.11 * (0.6 + 0.4 * sin(p.y * 3.0 + uTime * 2.2));
        // Tecido respirando
        p.z += sin(p.y * 4.2 + p.x * 1.7 + uTime * 0.6) * 0.004 * loose;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
    }
`;

const FRAGMENT = /* glsl */ `
    uniform sampler2D uMap;
    uniform sampler2D uMask;
    uniform vec3 uBase;

    varying vec2 vUv;
    varying vec2 vMaskUv;
    varying float vDepth;
    varying vec3 vNormal;
    varying vec3 vView;

    void main() {
        float edge = smoothstep(0.38, 0.62, texture2D(uMask, vMaskUv).a);
        if (edge < 0.02) discard;

        vec4 tex = texture2D(uMap, vUv);
        // Onde esta face não tem foto (a gola mais alta do outro lado, por exemplo)
        // aparece o tecido liso, mais escuro no alto: lê como o interior da gola
        float neck = smoothstep(0.72, 0.84, vMaskUv.y) * (1.0 - smoothstep(0.14, 0.24, abs(vMaskUv.x - 0.5)));
        float inside = mix(1.0, 0.55, neck);
        vec3 albedo = mix(uBase * inside, tex.rgb, smoothstep(0.55, 0.9, tex.a));

        // Micro relevo do algodão
        vec3 n = normalize(vNormal);
        vec2 q = vMaskUv * vec2(420.0, 520.0);
        n.xy += vec2(sin(q.x) * cos(q.y * 0.7), cos(q.y) * sin(q.x * 0.7)) * 0.018;
        n = normalize(n);

        float key = max(dot(n, normalize(vec3(-0.5, 0.65, 0.65))), 0.0);
        float fill = max(dot(n, normalize(vec3(0.75, -0.1, 0.45))), 0.0);
        float facing = max(dot(n, vView), 0.0);
        float rim = pow(1.0 - facing, 3.0);
        // A borda fecha em sombra suave, o que dá peso ao tecido
        float occlusion = 0.84 + 0.16 * smoothstep(0.0, 0.035, vDepth);

        vec3 color = albedo * (0.52 + key * 0.46 + fill * 0.1) * occlusion;
        float darkness = 1.0 - dot(albedo, vec3(0.333));
        // Algodão preto não é preto absoluto: a luz rasante revela o volume
        color += vec3(1.0, 0.97, 0.92) * darkness * (rim * 0.09 + pow(key, 6.0) * 0.045);

        gl_FragColor = vec4(color, edge);
        #include <colorspace_fragment>
    }
`;

const MAP_SIZE = 256;
const THICKNESS = 0.075;
const EDGE_RADIUS = 0.2;
// Faixa plana junto à silhueta: as duas faces se encontram antes da borda recortada
const SEAM_MARGIN = 2.5;

const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
});

// Silhueta única: frente + costas espelhadas, nas coordenadas da frente
const buildMaskCanvas = (front, back) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1024;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(front, 0, 0, 1024, 1024);
    ctx.save();
    ctx.translate(1024, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(back, 0, 0, 1024, 1024);
    ctx.restore();
    return canvas;
};

// Mapa de altura: distância até a borda vira um perfil arredondado
const buildHeightMap = (maskCanvas) => {
    const small = document.createElement('canvas');
    small.width = small.height = MAP_SIZE;
    const ctx = small.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(maskCanvas, 0, 0, MAP_SIZE, MAP_SIZE);
    const { data } = ctx.getImageData(0, 0, MAP_SIZE, MAP_SIZE);

    const size = MAP_SIZE;
    const far = 1e6;
    const dist = new Float32Array(size * size);
    for (let i = 0; i < dist.length; i++) dist[i] = data[i * 4 + 3] > 127 ? far : 0;

    // Transformada de distância em duas varreduras (chamfer)
    const diagonal = Math.SQRT2;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const p = y * size + x;
            if (!dist[p]) continue;
            if (x > 0) dist[p] = Math.min(dist[p], dist[p - 1] + 1);
            if (y > 0) {
                dist[p] = Math.min(dist[p], dist[p - size] + 1);
                if (x > 0) dist[p] = Math.min(dist[p], dist[p - size - 1] + diagonal);
                if (x < size - 1) dist[p] = Math.min(dist[p], dist[p - size + 1] + diagonal);
            }
        }
    }
    for (let y = size - 1; y >= 0; y--) {
        for (let x = size - 1; x >= 0; x--) {
            const p = y * size + x;
            if (!dist[p]) continue;
            if (x < size - 1) dist[p] = Math.min(dist[p], dist[p + 1] + 1);
            if (y < size - 1) {
                dist[p] = Math.min(dist[p], dist[p + size] + 1);
                if (x < size - 1) dist[p] = Math.min(dist[p], dist[p + size + 1] + diagonal);
                if (x > 0) dist[p] = Math.min(dist[p], dist[p + size - 1] + diagonal);
            }
        }
    }

    const radius = (EDGE_RADIUS / 2) * size;
    const height = new Float32Array(size * size);
    for (let i = 0; i < height.length; i++) {
        const t = Math.min(Math.max(dist[i] - SEAM_MARGIN, 0) / radius, 1);
        height[i] = 1 - (1 - t) * (1 - t);
    }

    // Suaviza a crista que a distância forma no meio das mangas
    const blurred = new Float32Array(height.length);
    const r = 3;
    for (let pass = 0; pass < 2; pass++) {
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let sum = 0;
                let n = 0;
                for (let k = -r; k <= r; k++) {
                    const qx = pass === 0 ? x + k : x;
                    const qy = pass === 0 ? y : y + k;
                    if (qx < 0 || qy < 0 || qx >= size || qy >= size) continue;
                    sum += height[qy * size + qx];
                    n++;
                }
                blurred[y * size + x] = sum / n;
            }
        }
        height.set(blurred);
    }
    // O perfil precisa continuar zerado na faixa da costura para as faces se fecharem
    for (let i = 0; i < height.length; i++) if (dist[i] <= SEAM_MARGIN) height[i] = 0;

    // Área que recebe malha: a silhueta com folga, para o recorte fino ficar na textura
    const covered = new Uint8Array(height.length);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!dist[y * size + x]) continue;
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const qx = x + dx;
                    const qy = y + dy;
                    if (qx >= 0 && qy >= 0 && qx < size && qy < size) covered[qy * size + qx] = 1;
                }
            }
        }
    }
    return { height, covered };
};

const sampleHeight = (height, u, v) => {
    const x = Math.min(Math.max(u * (MAP_SIZE - 1), 0), MAP_SIZE - 1.001);
    const y = Math.min(Math.max((1 - v) * (MAP_SIZE - 1), 0), MAP_SIZE - 1.001);
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const at = (a, b) => height[b * MAP_SIZE + a];
    return (at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx) * (1 - fy)
        + (at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx) * fy;
};

// Dobras grandes e fixas: o caimento que uma foto plana não tem
const drape = (x, y, side) => {
    const hang = 0.5 - y * 0.5;
    return (
        Math.sin(y * 5.1 + x * 2.3 + side * 0.9) * 0.02 * hang
        + Math.sin(x * 7.4 - y * 2.2 + side * 2.1) * 0.012 * hang
        + Math.sin(x * 2.6 + y * 1.4) * 0.009
    );
};

const buildShell = ({ height, covered }, segments, side) => {
    const count = (segments + 1) * (segments + 1);
    const positions = new Float32Array(count * 3);
    const uvs = new Float32Array(count * 2);
    const maskUvs = new Float32Array(count * 2);
    const depths = new Float32Array(count);

    for (let j = 0; j <= segments; j++) {
        for (let i = 0; i <= segments; i++) {
            const p = j * (segments + 1) + i;
            const u = i / segments;
            const v = j / segments;
            const x = u * 2 - 1;
            const y = v * 2 - 1;
            const h = sampleHeight(height, u, v);
            const z = h * THICKNESS + (h > 0.02 ? drape(x, y, side) * h : 0);

            positions[p * 3] = x;
            positions[p * 3 + 1] = y;
            positions[p * 3 + 2] = side * z;
            maskUvs[p * 2] = u;
            maskUvs[p * 2 + 1] = v;
            // As costas leem a foto espelhada: quem olha por trás vê a estampa certa
            uvs[p * 2] = side > 0 ? u : 1 - u;
            uvs[p * 2 + 1] = v;
            depths[p] = h * THICKNESS;
        }
    }

    const indices = [];
    for (let j = 0; j < segments; j++) {
        for (let i = 0; i < segments; i++) {
            const a = j * (segments + 1) + i;
            const b = a + 1;
            const c = a + segments + 1;
            const d = c + 1;
            // Fora da silhueta não há o que desenhar
            const cellX = Math.min(Math.round(((i + 0.5) / segments) * (MAP_SIZE - 1)), MAP_SIZE - 1);
            const cellY = Math.min(Math.round((1 - (j + 0.5) / segments) * (MAP_SIZE - 1)), MAP_SIZE - 1);
            if (!covered[cellY * MAP_SIZE + cellX]) continue;
            if (side > 0) indices.push(a, b, d, a, d, c);
            else indices.push(a, d, b, a, c, d);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setAttribute('aMaskUv', new THREE.BufferAttribute(maskUvs, 2));
    geometry.setAttribute('aDepth', new THREE.BufferAttribute(depths, 1));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
};

const sampleBase = (image) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, 64, 64);
    // Barra da camiseta: área sem estampa em todas as peças
    const { data } = ctx.getImageData(28, 50, 8, 4);
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 200) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        n++;
    }
    return new THREE.Color().setRGB(r / n / 255, g / n / 255, b / n / 255, THREE.SRGBColorSpace);
};

const buildShadow = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(0,0,0,0.3)');
    gradient.addColorStop(0.55, 'rgba(0,0,0,0.09)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 0.4),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2.6;
    mesh.position.y = -1.08;
    return mesh;
};

export const mountTee = async (container, { front, back, initialSide, groundShadow, onSideChange }) => {
    const [frontImage, backImage] = await Promise.all([loadImage(front), loadImage(back)]);

    const isNarrow = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const canvas = renderer.domElement;
    canvas.className = 'tee-canvas';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);

    const maskCanvas = buildMaskCanvas(frontImage, backImage);
    const height = buildHeightMap(maskCanvas);
    const segments = isNarrow ? 150 : 230;

    const makeTexture = (source) => {
        const texture = new THREE.Texture(source);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.needsUpdate = true;
        return texture;
    };

    const uTime = { value: 0 };
    const uSway = { value: 0 };
    const uMask = { value: makeTexture(maskCanvas) };
    const uBase = { value: sampleBase(frontImage) };

    const makeFace = (image, side) => new THREE.Mesh(
        buildShell(height, segments, side),
        new THREE.ShaderMaterial({
            vertexShader: VERTEX,
            fragmentShader: FRAGMENT,
            uniforms: { uMap: { value: makeTexture(image) }, uMask, uBase, uTime, uSway },
            transparent: true,
            alphaToCoverage: true
        })
    );

    const tee = new THREE.Group();
    tee.add(makeFace(frontImage, 1), makeFace(backImage, -1));
    scene.add(tee);

    const shadow = groundShadow ? buildShadow() : null;
    if (shadow) scene.add(shadow);

    const sideAngle = (side) => (side === 'frente' ? 0 : Math.PI);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Entra pelo lado sem estampa e gira até revelá-la
    let angle = reducedMotion ? sideAngle(initialSide) : sideAngle(initialSide) - Math.PI;
    let target = sideAngle(initialSide);
    let spin = 0;
    let dragging = false;
    let lastX = 0;
    let touched = false;
    let visible = true;
    let tiltTarget = 0;
    let tilt = 0;
    let baseZ = 4.05;
    let zoomed = false;
    let zoomAmount = 0;
    let currentSide = null;

    const resize = () => {
        const { clientWidth: w, clientHeight: h } = container;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Em telas estreitas a câmera recua para a peça inteira caber
        baseZ = 4.25 * Math.max(1, 1 / camera.aspect);
        camera.updateProjectionMatrix();
    };

    const settle = (side) => {
        const base = sideAngle(side);
        const turns = Math.round((angle - base) / (Math.PI * 2));
        target = base + turns * Math.PI * 2;
        spin = 0;
        touched = true;
    };

    canvas.addEventListener('pointerdown', (event) => {
        dragging = true;
        touched = true;
        lastX = event.clientX;
        container.classList.add('is-dragging');
        container.dispatchEvent(new CustomEvent('tee:touched'));
        canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'mouse') {
            const rect = canvas.getBoundingClientRect();
            tiltTarget = ((event.clientY - rect.top) / rect.height - 0.5) * 0.3;
        }
        if (!dragging) return;
        const dx = event.clientX - lastX;
        lastX = event.clientX;
        angle += dx * 0.011;
        target = angle;
        spin = dx * 0.011;
    });
    canvas.addEventListener('pointerleave', () => {
        tiltTarget = 0;
    });
    const release = () => {
        dragging = false;
        container.classList.remove('is-dragging');
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);

    new ResizeObserver(resize).observe(container);
    new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
    }).observe(container);
    resize();

    const clock = new THREE.Clock();
    const frame = () => {
        requestAnimationFrame(frame);
        const delta = Math.min(clock.getDelta(), 0.05);
        if (!visible) return;
        uTime.value += reducedMotion ? 0 : delta;

        if (!dragging) {
            if (Math.abs(spin) > 0.0004) {
                // Inércia depois de soltar
                target += spin;
                spin *= Math.pow(0.02, delta);
            }
            angle += (target - angle) * (1 - Math.pow(0.012, delta));
        }

        // Balanço lento enquanto ninguém mexeu
        const idle = touched || reducedMotion ? 0 : Math.sin(uTime.value * 0.55) * 0.28;
        const previous = tee.rotation.y;
        tee.rotation.y = angle + idle;
        const velocity = (tee.rotation.y - previous) / Math.max(delta, 0.001);
        uSway.value += (THREE.MathUtils.clamp(-velocity * 0.14, -1, 1) - uSway.value) * 0.09;

        tilt += (tiltTarget - tilt) * 0.06;
        tee.rotation.x = tilt;

        zoomAmount += ((zoomed ? 1 : 0) - zoomAmount) * (1 - Math.pow(0.01, delta));
        camera.position.z = baseZ - (baseZ - 2.35) * zoomAmount;
        camera.position.y = -0.06 + 0.22 * zoomAmount;

        const facingFront = Math.cos(tee.rotation.y) >= 0;
        if (shadow) {
            // A sombra afina quando a peça fica de lado
            shadow.scale.x = 0.34 + 0.66 * Math.abs(Math.cos(tee.rotation.y));
            shadow.material.opacity = 1 - zoomAmount;
        }

        const side = facingFront ? 'frente' : 'costas';
        if (side !== currentSide) {
            currentSide = side;
            if (onSideChange) onSideChange(side);
        }

        renderer.render(scene, camera);
    };
    frame();

    container.classList.add('is-ready');

    return {
        showSide: settle,
        rotateBy: (delta) => {
            touched = true;
            target += delta;
            spin = 0;
        },
        toggleZoom: () => {
            zoomed = !zoomed;
            return zoomed;
        }
    };
};
