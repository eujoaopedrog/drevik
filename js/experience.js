// =========================================
// DREVIK — EXPERIÊNCIA (camada progressiva)
// script.js cuida da loja e funciona sozinho. Este módulo só acrescenta
// movimento: se uma biblioteca não carregar, a compra continua intacta.
// =========================================
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import EmblaCarousel from 'embla-carousel';

gsap.registerPlugin(ScrollTrigger, SplitText);

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = window.matchMedia('(min-width: 769px)').matches;
const page = document.body.dataset.page;

// =========================================
// ROLAGEM SUAVE (Lenis + ScrollTrigger)
// =========================================
let lenis = null;

if (!reducedMotion) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Painéis abertos seguram a rolagem da página
    document.querySelectorAll('dialog').forEach(dialog => {
        new MutationObserver(() => {
            if (dialog.open) lenis.stop(); else lenis.start();
        }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
    });
}

document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href*="#"]');
    if (!link || !lenis) return;
    const url = new URL(link.href);
    if (url.pathname !== window.location.pathname || !url.hash) return;
    const target = document.querySelector(url.hash);
    if (!target) return;
    event.preventDefault();
    link.closest('dialog')?.close();
    lenis.scrollTo(target, { duration: 1.4 });
});

// Chegou por um link com âncora: os blocos presos mudam a altura da página,
// então a posição certa só existe depois de medir tudo
let userScrolled = false;
['wheel', 'touchstart', 'keydown'].forEach(type => {
    window.addEventListener(type, () => {
        userScrolled = true;
    }, { once: true, passive: true });
});

const settleHash = () => {
    if (!window.location.hash || userScrolled) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    ScrollTrigger.refresh();
    lenis?.resize();
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'instant' });
    lenis?.scrollTo(top, { immediate: true, force: true });
};

// =========================================
// TIPOGRAFIA EM MOVIMENTO
// =========================================
const revealLines = (element, vars = {}) => {
    if (reducedMotion || !element) return;
    SplitText.create(element, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
            yPercent: 105,
            duration: 1.05,
            ease: 'expo.out',
            stagger: 0.09,
            ...vars
        })
    });
};

const revealOnScroll = (selector) => {
    if (reducedMotion) return;
    document.querySelectorAll(selector).forEach(element => {
        revealLines(element, {
            scrollTrigger: { trigger: element, start: 'top 88%', once: true }
        });
    });
};

revealOnScroll('[data-reveal]');

// =========================================
// HOME: A JORNADA
// =========================================
const startJourney = async () => {
    const canvas = document.querySelector('#ink-canvas');
    const chapters = gsap.utils.toArray('.chapter');
    if (!canvas || !chapters.length || reducedMotion) return;

    // Quem pediu economia de dados, ou está em rede lenta, fica com as estampas em imagem
    const connection = navigator.connection;
    if (connection && (connection.saveData || /(^|-)2g|3g/.test(connection.effectiveType || ''))) return;

    const { createInkJourney } = await import('./ink-journey.js');
    const coarse = (navigator.hardwareConcurrency || 4) <= 4;
    const lowMemory = (navigator.deviceMemory || 8) <= 2;
    const count = isDesktop ? (coarse ? 140000 : 260000) : (lowMemory ? 45000 : 90000);

    let journey;
    try {
        journey = await createInkJourney(canvas, { count });
    } catch {
        // Sem WebGL: cada capítulo mantém a estampa como imagem
        return;
    }

    root.classList.add('gl-on');
    const { uniforms } = journey;

    const toneColor = { bg: gsap.utils.interpolate('#0b0b0a', '#ece8df'), fg: gsap.utils.interpolate('#ece8df', '#0b0b0a') };
    const state = { tone: 0 };
    const inkColor = uniforms.uInk.value;

    const applyTone = () => {
        const bg = toneColor.bg(state.tone);
        const fg = toneColor.fg(state.tone);
        root.style.setProperty('--bg', bg);
        root.style.setProperty('--fg', fg);
        inkColor.set(fg);
    };
    applyTone();

    gsap.ticker.add((time, delta) => journey.tick(time, delta / 1000));

    gsap.to(uniforms.uIntro, { value: 1, duration: 2.1, ease: 'power3.out', delay: 0.05 });
    revealLines(document.querySelector('.hero-title'), { delay: 0.5 });
    gsap.from('.hero-meta > *', { autoAlpha: 0, y: 14, duration: 0.9, delay: 1, stagger: 0.08, ease: 'power3.out' });

    // Cada capítulo que entra arrasta os grãos para a próxima estampa
    chapters.forEach((chapter, index) => {
        const tone = chapter.classList.contains('tone-light') ? 1 : 0;
        const timeline = gsap.timeline({
            scrollTrigger: { trigger: chapter, start: 'top 92%', end: 'top 8%', scrub: 0.6 }
        });
        timeline.to(uniforms.uProgress, { value: index + 1, ease: 'none', duration: 1 }, 0);
        timeline.to(state, { tone, ease: 'none', duration: 0.1, onUpdate: applyTone }, 0.45);
        timeline.to(uniforms.uGoldMix, { value: index === 0 ? 1 : 0, ease: 'none', duration: 0.5 }, 0.3);

        // Enquanto a estampa está parada, ela gira devagar e mostra o relevo dos grãos
        ScrollTrigger.create({
            trigger: chapter,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => journey.setDrift((self.progress - 0.5) * 0.16),
            onLeave: () => journey.setDrift(0),
            onLeaveBack: () => journey.setDrift(0)
        });

        const verb = chapter.querySelector('.chapter-verb');
        SplitText.create(verb, {
            type: 'chars',
            mask: 'chars',
            charsClass: 'split-char',
            autoSplit: true,
            onSplit: (self) => gsap.from(self.chars, {
                yPercent: 110,
                duration: 1,
                ease: 'expo.out',
                stagger: 0.022,
                scrollTrigger: { trigger: chapter, start: 'top 42%', toggleActions: 'play none none reverse' }
            })
        });

        gsap.from(chapter.querySelectorAll('.chapter-side > *'), {
            autoAlpha: 0,
            y: 18,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.06,
            scrollTrigger: { trigger: chapter, start: 'top 36%', toggleActions: 'play none none reverse' }
        });
    });

    // Depois da última estampa, a tinta se desfaz em poeira e o mundo volta ao escuro
    const after = document.querySelector('#colecao');
    gsap.timeline({ scrollTrigger: { trigger: after, start: 'top 92%', end: 'top 15%', scrub: 0.6 } })
        .to(uniforms.uProgress, { value: 5, ease: 'none', duration: 1 }, 0)
        .to(uniforms.uOpacity, { value: 0.32, ease: 'none', duration: 1 }, 0)
        .to(state, { tone: 0, ease: 'none', duration: 0.1, onUpdate: applyTone }, 0.45);

    // Com o trilho cobrindo a tela, o canvas para de desenhar
    ScrollTrigger.create({
        trigger: '#colecao',
        start: 'top top',
        onEnter: () => journey.setActive(false),
        onLeaveBack: () => journey.setActive(true)
    });

    // Hero sai de cena conforme o DK se desfaz
    gsap.to('.hero-copy', {
        autoAlpha: 0,
        y: -40,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '55% top', scrub: 0.4 }
    });

    ScrollTrigger.refresh();
    settleHash();
};

// =========================================
// HOME: COLEÇÃO NA HORIZONTAL + MANIFESTO
// =========================================
const startJourneyNav = () => {
    const nav = document.querySelector('#journey-nav');
    const chapters = gsap.utils.toArray('.chapter');
    if (!nav || !chapters.length) return;
    const links = nav.querySelectorAll('[data-step]');

    ScrollTrigger.create({
        trigger: '#percurso',
        start: 'top 55%',
        end: 'bottom 55%',
        toggleClass: { targets: nav, className: 'is-visible' }
    });

    chapters.forEach((chapter, index) => {
        ScrollTrigger.create({
            trigger: chapter,
            start: 'top 50%',
            end: 'bottom 50%',
            onToggle: (self) => {
                if (!self.isActive) return;
                links.forEach((link, i) => {
                    if (i === index) link.setAttribute('aria-current', 'step');
                    else link.removeAttribute('aria-current');
                });
            }
        });
    });
};

const startHomeSections = () => {
    startJourneyNav();
    if (reducedMotion) return;

    const track = document.querySelector('.rail-track');
    if (track && isDesktop) {
        const distance = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
                trigger: '#colecao',
                pin: true,
                start: 'top top',
                end: () => `+=${distance()}`,
                scrub: 0.5,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    document.querySelector('.rail-progress span').style.transform = `scaleX(${self.progress})`;
                }
            }
        });
    }

    // Manifesto: palavra por palavra, no ritmo da rolagem
    const manifesto = document.querySelector('.manifesto-title');
    if (manifesto) {
        SplitText.create(manifesto, {
            type: 'words',
            autoSplit: true,
            onSplit: (self) => gsap.from(self.words, {
                opacity: 0.1,
                ease: 'none',
                stagger: 0.1,
                scrollTrigger: { trigger: manifesto, start: 'top 82%', end: 'bottom 45%', scrub: 0.4 }
            })
        });
    }

    gsap.from('.footer-wordmark', {
        yPercent: 22,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: '.footer-wordmark', start: 'top 100%', end: 'bottom 100%', scrub: 0.4 }
    });
};

// =========================================
// COLEÇÃO: ENTRADA DA GRADE
// =========================================
const startShop = () => {
    const grid = document.querySelector('#shop-grid');
    if (!grid || reducedMotion) return;

    revealLines(document.querySelector('.shop-title'));
    gsap.from('#shop-grid .product-card', { y: 50, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.07, delay: 0.2 });

    // O script.js redesenha a grade ao filtrar: os cards novos entram em sequência
    new MutationObserver(() => {
        gsap.from(grid.querySelectorAll('.product-card'), { y: 30, opacity: 0, duration: 0.65, ease: 'expo.out', stagger: 0.05 });
    }).observe(grid, { childList: true });
};

// =========================================
// PRODUTO: CAMISETA 3D + GALERIA (Embla)
// =========================================
const startProduct = async () => {
    const product = window.DREVIK_PRODUCT;
    if (!product) return;

    revealLines(document.querySelector('.product-name'));

    const viewport = document.querySelector('.embla');
    if (viewport) {
        const embla = EmblaCarousel(viewport, { align: 'start', dragFree: true, containScroll: 'trimSnaps' });
        document.querySelector('#gallery-prev')?.addEventListener('click', () => embla.scrollPrev());
        document.querySelector('#gallery-next')?.addEventListener('click', () => embla.scrollNext());
    }

    const stage = document.querySelector('#tee-stage');
    if (!stage) return;

    try {
        const { mountTee } = await import('./tee-viewer.js');
        const controls = document.querySelectorAll('[data-tee-side]');
        const mark = (side) => controls.forEach(button => {
            const active = button.dataset.teeSide === side;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });

        const viewer = await mountTee(stage, {
            front: product.tee.frente,
            back: product.tee.costas,
            initialSide: product.printSide,
            // Peça preta sobre fundo claro projeta sombra; no escuro ela não apareceria
            groundShadow: root.dataset.tone === 'light',
            onSideChange: (side) => mark(side)
        });

        controls.forEach(button => {
            button.addEventListener('click', () => viewer.showSide(button.dataset.teeSide));
        });

        const zoomButton = document.querySelector('#tee-zoom');
        zoomButton?.addEventListener('click', () => {
            const zoomed = viewer.toggleZoom();
            zoomButton.textContent = zoomed ? 'Afastar' : 'Aproximar';
            zoomButton.setAttribute('aria-pressed', String(zoomed));
        });

        stage.addEventListener('tee:touched', () => {
            stage.classList.add('was-touched');
        }, { once: true });

        stage.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') viewer.rotateBy(-0.5);
            if (event.key === 'ArrowRight') viewer.rotateBy(0.5);
        });
        root.classList.add('tee-on');
    } catch {
        // Sem WebGL a foto recortada já está na tela e os botões somem pelo CSS
    }
};

// =========================================
// INÍCIO
// =========================================
if (page === 'home') {
    startHomeSections();
    startJourney();
}
if (page === 'shop') startShop();
if (page === 'product') startProduct();

window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    settleHash();
});

