import { formatPrice, $, $$, trapFocus, responsiveImageAttributes } from './utils.js';
import { getCart, getWishlist } from './storage.js';
import { PRODUCTS } from '../data/products.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const showToast = (message, type = 'success') => {
    const container = $('#toast-container');
    if (!container) return;

    const icons = {
        success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
        info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `${icons[type] || icons.success}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

export const pulseCartIcon = () => {
    const cartToggle = $('#cart-toggle');
    if (!cartToggle || prefersReducedMotion) return;
    cartToggle.classList.remove('cart-pulse');
    void cartToggle.offsetWidth;
    cartToggle.classList.add('cart-pulse');
    window.setTimeout(() => cartToggle.classList.remove('cart-pulse'), 650);
};

export const updateBadges = () => {
    const cartCount = getCart().reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = getWishlist().length;

    const cartBadge = $('#cart-count');
    const wishlistBadge = $('#wishlist-count');

    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.classList.toggle('active', cartCount > 0);
    }
    if (wishlistBadge) {
        wishlistBadge.textContent = wishlistCount;
        wishlistBadge.classList.toggle('active', wishlistCount > 0);
    }
};

export let attachCursorHover = () => {};

export const initializeUI = ({ closeCart }) => {
const fontPreload = $('link[data-font-stylesheet]');
if (fontPreload) {
    const fontStylesheet = document.createElement('link');
    fontStylesheet.rel = 'stylesheet';
    fontStylesheet.href = fontPreload.href;
    fontStylesheet.media = 'print';
    fontStylesheet.addEventListener('load', () => {
        fontStylesheet.media = 'all';
    }, { once: true });
    document.head.appendChild(fontStylesheet);
}
const socialImage = $('meta[property="og:image"]');
if (socialImage && document.body.dataset.page !== 'product') {
    socialImage.content = new URL('./img/image-section-principal.jpeg', window.location.href).href;
}
const preloader = $('#preloader');
if (preloader) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            $$('.reveal-text').forEach(el => el.style.animationPlayState = 'running');
        }, prefersReducedMotion ? 0 : 500);
    });
}

// =========================================
// 2. CURSOR CUSTOMIZADO
// =========================================
const isDesktop = !prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (isDesktop) {
    document.body.classList.add('has-custom-cursor');
    const dot = $('.cursor-dot');
    const outline = $('.cursor-outline');

    let mx = 0, my = 0, ox = 0, oy = 0;

    window.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        if (dot) {
            dot.style.left = mx + 'px';
            dot.style.top = my + 'px';
        }
    });

    const animate = () => {
        ox += (mx - ox) * 0.15;
        oy += (my - oy) * 0.15;
        if (outline) {
            outline.style.left = ox + 'px';
            outline.style.top = oy + 'px';
        }
        requestAnimationFrame(animate);
    };
    animate();

    attachCursorHover = () => {
        const targets = $$('a, button, .product-card, .product-link, .color-btn, .size-btn, .filter-btn, .thumb, .card-wishlist, .search-result');
        targets.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    };
    attachCursorHover();
}

// =========================================
// 3. HEADER SCROLL
// =========================================
const header = $('#header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
}

// =========================================
// 4. MOBILE MENU
// =========================================
const menuToggle = $('.menu-toggle');
let closeMobileMenu = () => {};
if (menuToggle) {
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.setAttribute('role', 'dialog');
    mobileMenu.setAttribute('aria-modal', 'true');
    mobileMenu.setAttribute('aria-label', 'Menu de navegação');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileMenu.inert = true;
    mobileMenu.innerHTML = `
        <a href="index.html">Início</a>
        <a href="shop.html">Coleção</a>
        <a href="index.html#manifesto">Manifesto</a>
        <a href="index.html#contact">Contato</a>
    `;
    document.body.appendChild(mobileMenu);

    closeMobileMenu = () => {
        if (!mobileMenu.classList.contains('active')) return;
        mobileMenu.classList.remove('active');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.inert = true;
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
        menuToggle.focus();
    };

    menuToggle.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
            closeMobileMenu();
            return;
        }
        mobileMenu.classList.add('active');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileMenu.inert = false;
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');
        mobileMenu.querySelector('a')?.focus();
    });

    mobileMenu.addEventListener('keydown', event => {
        if (event.key === 'Tab') trapFocus(mobileMenu, event);
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
}

// =========================================
// 5. PAGE TRANSITION
// =========================================
const pageTransition = $('#page-transition');
if (pageTransition) {
    if (prefersReducedMotion) {
        pageTransition.classList.remove('active', 'exit');
    } else {
    // Enter animation
    pageTransition.classList.add('active');
    setTimeout(() => {
        pageTransition.classList.remove('active');
        pageTransition.classList.add('exit');
        setTimeout(() => pageTransition.classList.remove('exit'), 700);
    }, 100);

    // Exit transition on internal link click
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href) return;
        if (href.startsWith('#')) return;
        if (href.startsWith('http')) return;
        if (href.startsWith('mailto')) return;
        if (href.startsWith('tel')) return;
        if (link.target === '_blank') return;
        if (link.hasAttribute('data-no-transition')) return;

        e.preventDefault();
        pageTransition.classList.add('active');
        setTimeout(() => {
            window.location.href = href;
        }, 500);
    });
    }
}

// =========================================
// 6. SCROLL REVEAL (index)
// =========================================
const revealElements = $$('.product-item, .section-header, .manifesto-content, .newsletter-content, .reveal-on-scroll');
const lookbookItems = $$('.lookbook-item');
if (prefersReducedMotion) {
    lookbookItems.forEach(item => item.classList.add('revealed'));
}
if (revealElements.length > 0 && !prefersReducedMotion) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(el => {
        el.classList.add('reveal-on-scroll');
        observer.observe(el);
    });
}

// =========================================
// 7. BACK TO TOP
// =========================================
const backToTop = $('#back-to-top');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
}
const searchOverlay = $('#search-overlay');
const searchToggle = $('#search-toggle');
const searchClose = $('#search-close');
const searchInput = $('#search-input');
const searchResults = $('#search-results');

const openSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.classList.add('active');
    searchOverlay.setAttribute('aria-hidden', 'false');
    searchOverlay.inert = false;
    searchToggle?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    setTimeout(() => {
        if (searchInput) searchInput.focus();
    }, prefersReducedMotion ? 0 : 300);
};

const closeSearch = () => {
    if (!searchOverlay || !searchOverlay.classList.contains('active')) return;
    searchOverlay.classList.remove('active');
    searchOverlay.setAttribute('aria-hidden', 'true');
    searchOverlay.inert = true;
    searchToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
    searchToggle?.focus();
};

if (searchToggle) searchToggle.addEventListener('click', openSearch);
if (searchClose) searchClose.addEventListener('click', closeSearch);
if (searchOverlay) {
    searchOverlay.setAttribute('aria-hidden', 'true');
    searchOverlay.inert = true;
    searchOverlay.addEventListener('click', event => {
        if (event.target === searchOverlay) closeSearch();
    });
    searchOverlay.addEventListener('keydown', event => {
        if (event.key === 'Tab') trapFocus(searchOverlay, event);
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMobileMenu();
        closeSearch();
        closeCart();
    }
});

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
            searchResults.innerHTML = '';
            return;
        }

        const matches = PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.tagline && p.tagline.toLowerCase().includes(query)) ||
            p.category.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            searchResults.innerHTML = '<p class="search-no-results">Nenhum produto encontrado</p>';
            return;
        }

        searchResults.innerHTML = matches.map(p => `
            <a href="product.html?id=${p.id}" class="search-result">
                <img src="${p.images[0].src}" alt="${p.images[0].alt}" ${responsiveImageAttributes(p.images[0], '64px')} loading="lazy">
                <div class="search-result-info">
                    <h4>${p.name}</h4>
                    <p>${formatPrice(p.price)}</p>
                </div>
            </a>
        `).join('');

        attachCursorHover();
    });
}
const newsletterForm = $('#newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector('input');
        if (input && input.value) {
            showToast('Inscrição realizada com sucesso!');
            input.value = '';
        }
    });
}

// =========================================
// 14. SIZE GUIDE (placeholder)
// =========================================
document.addEventListener('click', (e) => {
    const link = e.target.closest('.size-guide');
    if (link) {
        e.preventDefault();
        showToast('Guia de tamanhos em breve', 'info');
    }
});
if (lookbookItems.length > 0 && !prefersReducedMotion) {
    const lookbookObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                lookbookObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

    lookbookItems.forEach(item => lookbookObserver.observe(item));
}
};
