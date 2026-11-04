// =========================================
// DREVIK — JORNADA DE TINTA (Three.js)
// Um único campo de partículas que assume a forma de cada estampa.
// =========================================
import * as THREE from 'three';

const VERTEX = /* glsl */ `
    attribute vec3 aDoor;
    attribute vec3 aPath;
    attribute vec3 aMirror;
    attribute vec3 aRuins;
    attribute vec3 aDust;
    attribute vec3 aGold;
    attribute vec4 aRand;

    uniform float uProgress;
    uniform float uIntro;
    uniform float uTime;
    uniform float uScale;
    uniform float uDkScale;
    uniform float uDkY;
    uniform float uCenterY;
    uniform float uSize;
    uniform float uGoldMix;
    uniform float uOpacity;
    uniform vec3 uInk;
    uniform vec3 uPointer;
    uniform float uPointerForce;

    varying vec3 vColor;
    varying float vAlpha;

    vec3 shape(int i) {
        if (i <= 0) return vec3(position.x * uDkScale, position.y * uDkScale + uDkY, position.z);
        if (i == 1) return aDoor * vec3(uScale, uScale, 1.0);
        if (i == 2) return aPath * vec3(uScale, uScale, 1.0);
        if (i == 3) return aMirror * vec3(uScale, uScale, 1.0);
        if (i == 4) return aRuins * vec3(uScale, uScale, 1.0);
        return aDust;
    }

    vec3 centered(int i) {
        // O DK e a poeira usam o centro da tela; estampas sobem para dar lugar ao texto
        vec3 p = shape(i);
        if (i >= 1 && i <= 4) p.y += uCenterY;
        return p;
    }

    void main() {
        int from = int(floor(uProgress));
        float local = uProgress - float(from);

        // Cada grão parte em um instante diferente: a forma se desfaz em vez de deslizar
        float start = aRand.x * 0.45;
        float t = smoothstep(start, start + 0.55, local);
        vec3 pos = mix(centered(from), centered(from + 1), t);

        // Na passagem o grão vira poeira e faz um arco
        float travel = sin(t * 3.14159);
        pos.xy += vec2(
            sin(aRand.y * 40.0 + pos.y * 2.0 + uTime * 0.4),
            cos(aRand.z * 40.0 + pos.x * 2.0 - uTime * 0.3)
        ) * travel * (0.25 + aRand.w * 0.55);
        pos.z += travel * (aRand.y - 0.5) * 1.6;

        // Entrada da página: a poeira se junta no monograma
        float intro = smoothstep(aRand.x * 0.6, aRand.x * 0.6 + 0.4, uIntro);
        pos = mix(aDust, pos, intro);

        // Respiração mínima para a estampa não parecer uma imagem parada
        pos.xy += vec2(sin(uTime * 0.6 + aRand.y * 20.0), cos(uTime * 0.5 + aRand.z * 20.0)) * 0.0007;

        // O ponteiro afasta os grãos, como um dedo passando em tinta fresca
        vec2 away = pos.xy - uPointer.xy;
        float dist = length(away);
        float push = smoothstep(0.42, 0.0, dist) * uPointerForce;
        pos.xy += normalize(away + 0.0001) * push * (0.16 + aRand.w * 0.14);
        pos.z += push * 0.3 * aRand.y;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (0.9 + aRand.w * 0.25) * (6.0 / -mv.z);

        vColor = mix(uInk, aGold, uGoldMix * step(0.001, length(aGold)));
        vAlpha = uOpacity * (0.9 + aRand.y * 0.1);
    }
`;

const FRAGMENT = /* glsl */ `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.4, d) * vAlpha;
        if (a < 0.01) discard;
        gl_FragColor = vec4(vColor, a);
        #include <colorspace_fragment>
    }
`;

// Amostragem fora da thread principal; sem suporte a Worker, roda aqui mesmo
const sampleShapes = (count) => {
    const baseUrl = new URL('../', import.meta.url).href;
    return new Promise((resolve, reject) => {
        const fallback = async () => {
            const { sampleAllShapes } = await import('./ink-sampler.js');
            resolve(await sampleAllShapes(baseUrl, count));
        };
        try {
            const worker = new Worker(new URL('./ink-worker.js', import.meta.url), { type: 'module' });
            worker.addEventListener('message', ({ data }) => {
                worker.terminate();
                if (data.shapes) resolve(data.shapes);
                else fallback().catch(reject);
            });
            worker.addEventListener('error', () => {
                worker.terminate();
                fallback().catch(reject);
            });
            worker.postMessage({ baseUrl, count });
        } catch {
            fallback().catch(reject);
        }
    });
};

export const createInkJourney = async (canvas, { count }) => {
    const [dkPoints, doorPoints, pathPoints, mirrorPoints, ruinsPoints] = await sampleShapes(count);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
    camera.position.z = 6;

    const geometry = new THREE.BufferGeometry();
    const dust = new Float32Array(count * 3);
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
        dust[i * 3] = (Math.random() - 0.5) * 8;
        dust[i * 3 + 1] = (Math.random() - 0.5) * 5;
        dust[i * 3 + 2] = (Math.random() - 0.5) * 3 - 0.5;
        rand[i * 4] = Math.random();
        rand[i * 4 + 1] = Math.random();
        rand[i * 4 + 2] = Math.random();
        rand[i * 4 + 3] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(dkPoints.positions, 3));
    geometry.setAttribute('aDoor', new THREE.BufferAttribute(doorPoints.positions, 3));
    geometry.setAttribute('aGold', new THREE.BufferAttribute(doorPoints.colors, 3));
    geometry.setAttribute('aPath', new THREE.BufferAttribute(pathPoints.positions, 3));
    geometry.setAttribute('aMirror', new THREE.BufferAttribute(mirrorPoints.positions, 3));
    geometry.setAttribute('aRuins', new THREE.BufferAttribute(ruinsPoints.positions, 3));
    geometry.setAttribute('aDust', new THREE.BufferAttribute(dust, 3));
    geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 4));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);

    const uniforms = {
        uProgress: { value: 0 },
        uIntro: { value: 0 },
        uTime: { value: 0 },
        uScale: { value: 1 },
        uDkScale: { value: 1 },
        uDkY: { value: 0 },
        uCenterY: { value: 0 },
        uSize: { value: 2 },
        uGoldMix: { value: 0 },
        uOpacity: { value: 1 },
        uInk: { value: new THREE.Color('#ece8df') },
        uPointer: { value: new THREE.Vector3(99, 99, 0) },
        uPointerForce: { value: 0 }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms,
        transparent: true,
        depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    const pointerTarget = new THREE.Vector2(99, 99);
    let tiltX = 0;
    let tiltY = 0;
    let pointerEnergy = 0;
    let drift = 0;
    let visibleCount = count;
    let sizeBoost = 1;
    let slowFrames = 0;
    let sampledFrames = 0;

    const worldHeight = () => 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

    const resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isNarrow = width < 768;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        const unitsPerPx = worldHeight() / height;
        // Área livre para a estampa acima do verbo gigante
        const printPx = isNarrow ? Math.min(height * 0.42, width * 0.98) : height * 0.7;
        uniforms.uScale.value = printPx * unitsPerPx;
        uniforms.uCenterY.value = (isNarrow ? height * 0.17 : height * 0.1) * unitsPerPx;
        uniforms.uDkScale.value = Math.min(width * (isNarrow ? 0.84 : 0.5), height * 0.92) * unitsPerPx;
        uniforms.uDkY.value = (isNarrow ? height * 0.2 : height * 0.13) * unitsPerPx;
        // Mesmo volume de tinta por área, em qualquer tela
        uniforms.uSize.value = (isNarrow ? 1.05 : 1.15) * dpr * sizeBoost;
    };

    const onPointer = (event) => {
        const h = worldHeight();
        pointerTarget.set(
            (event.clientX / window.innerWidth - 0.5) * h * camera.aspect,
            (0.5 - event.clientY / window.innerHeight) * h
        );
        pointerEnergy = 1;
        tiltY = (event.clientX / window.innerWidth - 0.5) * 0.22;
        tiltX = (event.clientY / window.innerHeight - 0.5) * 0.12;
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('resize', resize);
    resize();

    let active = true;

    return {
        uniforms,
        setActive: (value) => {
            active = value;
            canvas.style.visibility = value ? 'visible' : 'hidden';
        },
        setDrift: (value) => {
            drift = value;
        },
        tick: (seconds, delta) => {
            if (!active) return;

            // Aparelho sofrendo: menos grãos, um pouco maiores, em vez de travar
            sampledFrames++;
            if (delta > 0.03) slowFrames++;
            if (sampledFrames >= 90) {
                if (slowFrames > 45 && visibleCount > count * 0.3) {
                    visibleCount = Math.floor(visibleCount * 0.72);
                    sizeBoost *= 1.12;
                    geometry.setDrawRange(0, visibleCount);
                    resize();
                }
                sampledFrames = 0;
                slowFrames = 0;
            }

            uniforms.uTime.value = seconds;
            uniforms.uPointer.value.x += (pointerTarget.x - uniforms.uPointer.value.x) * 0.14;
            uniforms.uPointer.value.y += (pointerTarget.y - uniforms.uPointer.value.y) * 0.14;
            pointerEnergy *= Math.pow(0.05, delta);
            uniforms.uPointerForce.value += (pointerEnergy - uniforms.uPointerForce.value) * 0.1;
            points.rotation.y += (tiltY + drift - points.rotation.y) * 0.05;
            points.rotation.x += (tiltX - points.rotation.x) * 0.05;
            renderer.render(scene, camera);
        }
    };
};
