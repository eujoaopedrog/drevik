// =========================================
// DREVIK — SCRIPT.JS COMPLETO
// =========================================

// =========================================
// UTILITÁRIOS
// =========================================
const formatPrice = (price) => `R$ ${price.toFixed(2).replace('.', ',')}`;
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// =========================================
// STORAGE
// =========================================
const STORAGE_KEYS = {
    cart: 'drevik_cart',
    wishlist: 'drevik_wishlist',
    recent: 'drevik_recent'
};

const getCart = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
    } catch { return []; }
};

const setCart = (cart) => {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    updateBadges();
};

const getWishlist = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.wishlist) || '[]');
    } catch { return []; }
};

const setWishlist = (list) => {
    localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(list));
    updateBadges();
};

const getRecent = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.recent) || '[]');
    } catch { return []; }
};

const setRecent = (list) => localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(list));

// =========================================
// TOASTS
// =========================================
const showToast = (message, type = 'success') => {
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

// =========================================
// BADGES (Carrinho + Wishlist)
// =========================================
const updateBadges = () => {
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

// =========================================
// 1. PRELOADER
// =========================================
const preloader = $('#preloader');
if (preloader) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            $$('.reveal-text').forEach(el => el.style.animationPlayState = 'running');
        }, 2200);
    });
}

// =========================================
// 2. CURSOR CUSTOMIZADO
// =========================================
const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

    window.attachCursorHover = () => {
        const targets = $$('a, button, .product-card, .product-link, .color-btn, .size-btn, .filter-btn, .thumb, .card-wishlist, .search-result');
        targets.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    };
    window.attachCursorHover();
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
if (menuToggle) {
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = `
        <a href="index.html">Início</a>
        <a href="shop.html">Coleção</a>
        <a href="index.html#manifesto">Manifesto</a>
        <a href="index.html#contact">Contato</a>
    `;
    document.body.appendChild(mobileMenu);

    menuToggle.addEventListener('click', () => {
        const isActive = mobileMenu.classList.toggle('active');
        menuToggle.classList.toggle('active', isActive);
        document.body.classList.toggle('no-scroll', isActive);
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });
}

// =========================================
// 5. PAGE TRANSITION
// =========================================
const pageTransition = $('#page-transition');
if (pageTransition) {
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

// =========================================
// 6. SCROLL REVEAL (index)
// =========================================
const revealElements = $$('.product-item, .section-header, .manifesto-content, .newsletter-content');
if (revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.9s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =========================================
// 8. CART DRAWER
// =========================================
const cartDrawer = $('#cart-drawer');
const cartOverlay = $('#cart-overlay');
const cartItemsEl = $('#cart-items');
const cartFooter = $('#cart-footer');
const cartSubtotal = $('#cart-subtotal');

const openCart = () => {
    if (!cartDrawer) return;
    renderCart();
    cartDrawer.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.classList.add('no-scroll');
};

const closeCart = () => {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
};

const renderCart = () => {
    if (!cartItemsEl) return;
    const cart = getCart();

    if (cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="cart-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <path d="M3 6h18"></path>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p>Seu carrinho está vazio</p>
                <a href="shop.html" data-no-transition>Explorar Coleção</a>
            </div>
        `;
        if (cartFooter) cartFooter.style.display = 'none';
        return;
    }

    if (cartFooter) cartFooter.style.display = 'block';

    cartItemsEl.innerHTML = cart.map((item, index) => `
        <div class="cart-item" data-index="${index}">
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="cart-item-meta">${item.color} / ${item.size}</span>
                <span class="cart-item-price">${formatPrice(item.price)}</span>
                <div class="cart-item-qty">
                    <button class="qty-btn" data-action="minus" data-index="${index}">−</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" data-action="plus" data-index="${index}">+</button>
                </div>
            </div>
            <button class="cart-item-remove" data-index="${index}">Remover</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (cartSubtotal) cartSubtotal.textContent = formatPrice(total);

    // Attach quantity handlers
    cartItemsEl.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            const action = btn.dataset.action;
            const cart = getCart();
            if (!cart[idx]) return;

            if (action === 'plus') {
                cart[idx].quantity += 1;
            } else if (action === 'minus') {
                cart[idx].quantity -= 1;
                if (cart[idx].quantity <= 0) cart.splice(idx, 1);
            }
            setCart(cart);
            renderCart();
        });
    });

    // Attach remove handlers
    cartItemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            const cart = getCart();
            cart.splice(idx, 1);
            setCart(cart);
            renderCart();
            showToast('Produto removido do carrinho', 'info');
        });
    });

    if (window.attachCursorHover) window.attachCursorHover();
};

const addToCart = (product, color, size, quantity = 1) => {
    const cart = getCart();
    const existingIndex = cart.findIndex(
        item => item.id === product.id && item.color === color && item.size === size
    );

    if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0].src,
            color,
            size,
            quantity
        });
    }

    setCart(cart);
    showToast(`${product.name} adicionado ao carrinho`);
};

// Attach cart events
const cartToggle = $('#cart-toggle');
const cartClose = $('#cart-close');
const cartContinue = $('#cart-continue');

if (cartToggle) cartToggle.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
if (cartContinue) cartContinue.addEventListener('click', closeCart);

// Checkout
const checkoutBtn = $('.btn-checkout');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        // Aqui você redireciona para o checkout (Mercado Pago, Yampi, etc)
        showToast('Redirecionando para o checkout seguro...', 'info');
        // window.location.href = 'https://seu-link-de-checkout';
    });
}

// =========================================
// 9. WISHLIST
// =========================================
const toggleWishlist = (productId) => {
    const list = getWishlist();
    const idx = list.indexOf(productId);
    let added = false;

    if (idx >= 0) {
        list.splice(idx, 1);
    } else {
        list.push(productId);
        added = true;
    }
    setWishlist(list);
    return added;
};

const wishlistToggle = $('#wishlist-toggle');
if (wishlistToggle) {
    wishlistToggle.addEventListener('click', () => {
        const list = getWishlist();
        if (list.length === 0) {
            showToast('Sua lista de favoritos está vazia', 'info');
        } else {
            showToast(`Você tem ${list.length} item(ns) nos favoritos`, 'info');
        }
    });
}

// =========================================
// 10. SEARCH
// =========================================
const searchOverlay = $('#search-overlay');
const searchToggle = $('#search-toggle');
const searchClose = $('#search-close');
const searchInput = $('#search-input');
const searchResults = $('#search-results');

const openSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.classList.add('active');
    document.body.classList.add('no-scroll');
    setTimeout(() => {
        if (searchInput) searchInput.focus();
    }, 300);
};

const closeSearch = () => {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
};

if (searchToggle) searchToggle.addEventListener('click', openSearch);
if (searchClose) searchClose.addEventListener('click', closeSearch);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
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

        if (typeof PRODUCTS === 'undefined') return;

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
                <img src="${p.images[0].src}" alt="${p.images[0].alt}">
                <div class="search-result-info">
                    <h4>${p.name}</h4>
                    <p>${formatPrice(p.price)}</p>
                </div>
            </a>
        `).join('');

        if (window.attachCursorHover) window.attachCursorHover();
    });
}

// =========================================
// 11. SHOP RENDERING (shop.html)
// =========================================
const shopGrid = $('#shop-grid');

if (shopGrid && typeof PRODUCTS !== 'undefined') {
    let currentFilter = 'all';
    let currentSort = 'relevance';
    const shopResults = $('#shop-results');

    const renderShop = () => {
        let filtered = currentFilter === 'all'
            ? [...PRODUCTS]
            : currentFilter === 'new'
                ? PRODUCTS.filter(p => p.isNew)
                : PRODUCTS.filter(p => p.category === currentFilter);

        switch (currentSort) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        if (filtered.length === 0) {
            shopGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;opacity:0.5;padding:4rem;">Nenhum produto encontrado.</p>';
            if (shopResults) shopResults.textContent = '0 produtos';
            return;
        }

        if (shopResults) {
            shopResults.textContent = `${filtered.length} ${filtered.length === 1 ? 'peça' : 'peças'}`;
        }

        const wishlist = getWishlist();

        shopGrid.innerHTML = filtered.map(product => {
            const colorsText = product.colors.map(c => c.name).join(' / ');
            const isWished = wishlist.includes(product.id);
            const badges = [];
            if (product.isNew) badges.push('<span class="card-badge">NOVO</span>');
            if (product.isSoldOut) badges.push('<span class="card-badge soldout">ESGOTADO</span>');

            return `
                <div class="product-card" data-id="${product.id}">
                    <a href="product.html?id=${product.id}" class="card-link">
                        <div class="card-image">
                            <img src="${product.images[0].src}" alt="${product.images[0].alt}" loading="lazy">
                            ${badges.length ? `<div class="card-badges">${badges.join('')}</div>` : ''}
                            <button class="card-wishlist ${isWished ? 'active' : ''}" data-wishlist="${product.id}" aria-label="Adicionar aos favoritos">
                                <svg viewBox="0 0 24 24" fill="${isWished ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            </button>
                            <div class="card-actions">
                                <button class="btn-add" ${product.isSoldOut ? 'disabled' : ''}>${product.isSoldOut ? 'Esgotado' : 'Ver Produto'}</button>
                            </div>
                        </div>
                        <div class="card-info">
                            <h3>${product.name}</h3>
                            <p class="price">
                                ${product.oldPrice ? `<span class="old">${formatPrice(product.oldPrice)}</span>` : ''}
                                ${formatPrice(product.price)}
                            </p>
                            <span class="color-tag">${colorsText}</span>
                        </div>
                    </a>
                </div>
            `;
        }).join('');

        // Wishlist handlers
        shopGrid.querySelectorAll('.card-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.dataset.wishlist;
                const added = toggleWishlist(id);
                btn.classList.toggle('active', added);
                const svg = btn.querySelector('svg');
                if (svg) svg.setAttribute('fill', added ? 'currentColor' : 'none');
                showToast(added ? 'Adicionado aos favoritos' : 'Removido dos favoritos', 'info');
            });
        });

        if (window.attachCursorHover) window.attachCursorHover();
    };

    $$('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.filter-btn').forEach(b => b.classList.remove('active'));
            $$('.filter-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            currentFilter = btn.dataset.filter;
            renderShop();
        });
    });

    const sortSelect = $('#sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderShop();
        });
    }

    renderShop();
}

// =========================================
// 12. PRODUCT PAGE (product.html)
// =========================================
const productLayout = $('#product-layout');

if (productLayout && typeof PRODUCTS !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const product = PRODUCTS.find(p => p.id === productId);

    if (!product) {
        productLayout.innerHTML = `
            <div class="loading-state" style="grid-column:1/-1;">
                <h2 style="font-family:var(--font-primary);font-size:2rem;margin-bottom:1rem;">Produto não encontrado</h2>
                <p style="margin-bottom:2rem;opacity:0.6;">O produto que você procura não existe ou foi removido.</p>
                <a href="shop.html" class="btn-primary" data-no-transition>Voltar para a Coleção</a>
            </div>
        `;
    } else {
        document.title = `${product.name} | DREVIK`;

        const bcProduct = $('#breadcrumb-product');
        if (bcProduct) bcProduct.textContent = product.name;

        // Save to recently viewed
        const recent = getRecent().filter(id => id !== product.id);
        recent.unshift(product.id);
        setRecent(recent.slice(0, 6));

        const colors = product.colors;
        const sizes = product.sizes;
        let selectedSize = sizes.find(size => !product.sizesOutOfStock?.includes(size)) || sizes[0];
        const discount = product.oldPrice
            ? Math.round((1 - product.price / product.oldPrice) * 100)
            : 0;

        productLayout.innerHTML = `
            <div class="product-gallery-wrap">
                <div class="thumbnails" id="thumbnails">
                    ${product.images.map((img, i) => `
                        <button type="button" class="thumb ${i === 0 ? 'active' : ''}" data-index="${i}"
                                aria-label="Ver imagem ${i + 1}: ${img.alt}" aria-pressed="${i === 0}">
                            <img src="${img.src}" alt="${img.alt}">
                        </button>
                    `).join('')}
                </div>
                <div class="gallery-main" id="gallery-main" tabindex="0"
                     aria-label="Galeria de ${product.name}. Use as setas esquerda e direita para trocar a imagem.">
                    <img src="${product.images[0].src}" alt="${product.images[0].alt}" id="gallery-main-img">
                    <button type="button" class="gallery-arrow gallery-arrow-prev" id="gallery-prev"
                            aria-label="Ver imagem anterior">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>
                    </button>
                    <button type="button" class="gallery-arrow gallery-arrow-next" id="gallery-next"
                            aria-label="Ver próxima imagem">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
                    </button>
                    <div class="gallery-status">
                        <span id="gallery-caption">${product.images[0].alt.split(' - ').slice(1).join(' - ')}</span>
                        <span id="gallery-counter" aria-live="polite">01 / ${String(product.images.length).padStart(2, '0')}</span>
                    </div>
                </div>
            </div>

            <div class="product-details">
                <span class="brand-tag">DK | DREVIK</span>
                <h1 class="product-name">${product.name}</h1>
                ${product.tagline ? `<p class="product-tagline">"${product.tagline}"</p>` : ''}
                <div class="product-price-row">
                    ${product.oldPrice ? `<span class="product-price-old">${formatPrice(product.oldPrice)}</span>` : ''}
                    <span class="product-price">${formatPrice(product.price)}</span>
                    ${discount > 0 ? `<span class="product-discount">-${discount}%</span>` : ''}
                </div>

                <div class="selector-group">
                    <span class="selector-label">Cor: <strong id="selected-color-name">${colors[0].name}</strong></span>
                    <div class="color-options" id="color-options">
                        ${colors.map((color, i) => `
                            <button class="color-btn ${i === 0 ? 'active' : ''}"
                                    style="background-color: ${color.hex};"
                                    data-color="${color.name}"
                                    aria-pressed="${i === 0}"
                                    aria-label="${color.name}"></button>
                        `).join('')}
                    </div>
                </div>

                <div class="selector-group">
                    <div class="size-header">
                        <span class="selector-label">Tamanho</span>
                        <a href="#" class="size-guide">Guia de Tamanhos</a>
                    </div>
                    <div class="size-options" id="size-options">
                        ${sizes.map((size, i) => {
                            const outOfStock = product.sizesOutOfStock?.includes(size);
                            const isActive = !outOfStock && size === selectedSize;
                            return `<button class="size-btn ${isActive ? 'active' : ''}" aria-pressed="${isActive}" ${outOfStock ? 'disabled aria-label="' + size + ' - esgotado"' : ''}>${size}</button>`;
                        }).join('')}
                    </div>
                </div>

                <div class="product-actions">
                    <button class="btn-add-cart" id="btn-add-cart" ${product.isSoldOut ? 'disabled' : ''}>${product.isSoldOut ? 'Esgotado' : 'Adicionar ao Carrinho'}</button>
                    <button class="btn-buy-now" id="btn-buy-now" ${product.isSoldOut ? 'disabled' : ''}>${product.isSoldOut ? 'Esgotado' : 'Comprar Agora'}</button>
                </div>

                <div class="product-desc">
                    <h3>Detalhes da Peça</h3>
                    ${product.description.map(paragraph => `<p>${paragraph}</p>`).join('')}
                    <ul>${product.details.map(d => `<li>${d}</li>`).join('')}</ul>
                </div>
            </div>
        `;

        // === Galeria ===
        const mainImg = $('#gallery-main-img');
        const thumbs = $$('.thumb');
        const thumbnails = $('#thumbnails');
        const gallery = $('#gallery-main');
        const galleryCaption = $('#gallery-caption');
        const galleryCounter = $('#gallery-counter');
        let activeImageIndex = 0;

        const setActiveImage = (index) => {
            activeImageIndex = (index + product.images.length) % product.images.length;
            const image = product.images[activeImageIndex];

            if (mainImg) {
                mainImg.src = image.src;
                mainImg.alt = image.alt;
            }
            if (galleryCaption) {
                galleryCaption.textContent = image.alt.split(' - ').slice(1).join(' - ');
            }
            if (galleryCounter) {
                galleryCounter.textContent = `${String(activeImageIndex + 1).padStart(2, '0')} / ${String(product.images.length).padStart(2, '0')}`;
            }
            thumbs.forEach((thumb, thumbIndex) => {
                const isActive = thumbIndex === activeImageIndex;
                thumb.classList.toggle('active', isActive);
                thumb.setAttribute('aria-pressed', String(isActive));
                if (isActive && thumbnails && window.matchMedia('(max-width: 768px)').matches) {
                    thumbnails.scrollTo({ left: thumb.offsetLeft, behavior: 'smooth' });
                }
            });
        };

        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                setActiveImage(Number(thumb.dataset.index));
            });
        });

        const galleryPrev = $('#gallery-prev');
        const galleryNext = $('#gallery-next');
        if (galleryPrev) galleryPrev.addEventListener('click', () => setActiveImage(activeImageIndex - 1));
        if (galleryNext) galleryNext.addEventListener('click', () => setActiveImage(activeImageIndex + 1));

        if (gallery) {
            gallery.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    setActiveImage(activeImageIndex - 1);
                } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    setActiveImage(activeImageIndex + 1);
                }
            });

            let pointerStartX = null;
            gallery.addEventListener('pointerdown', (event) => {
                if (event.pointerType === 'touch') pointerStartX = event.clientX;
            });
            gallery.addEventListener('pointerup', (event) => {
                if (pointerStartX === null) return;
                const swipeDistance = event.clientX - pointerStartX;
                pointerStartX = null;
                if (Math.abs(swipeDistance) < 40) return;
                setActiveImage(activeImageIndex + (swipeDistance < 0 ? 1 : -1));
            });
            gallery.addEventListener('pointercancel', () => {
                pointerStartX = null;
            });
        }

        // === Seletores ===
        const colorBtns = $$('.color-btn');
        const sizeBtns = $$('.size-btn');
        const selectedColorName = $('#selected-color-name');

        let selectedColor = colors[0].name;

        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                colorBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                selectedColor = btn.dataset.color;
                if (selectedColorName) selectedColorName.textContent = selectedColor;
            });
        });

        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.disabled) return;
                sizeBtns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                selectedSize = btn.textContent.trim();
            });
        });

        // === Add to cart ===
        const btnAddCart = $('#btn-add-cart');
        const btnBuyNow = $('#btn-buy-now');

        if (btnAddCart && !product.isSoldOut) {
            btnAddCart.addEventListener('click', () => {
                addToCart(product, selectedColor, selectedSize);
                openCart();
            });
        }

        if (btnBuyNow && !product.isSoldOut) {
            btnBuyNow.addEventListener('click', () => {
                addToCart(product, selectedColor, selectedSize);
                showToast('Redirecionando para o checkout...', 'info');
                // window.location.href = 'https://seu-link-checkout';
            });
        }

        // === Sticky mobile ===
        const stickyMobile = $('#sticky-add-mobile');
        const stickyName = $('#sticky-name');
        const stickyPrice = $('#sticky-price');
        const btnStickyCart = $('#btn-sticky-cart');

        if (stickyMobile) {
            if (stickyName) stickyName.textContent = product.name;
            if (stickyPrice) stickyPrice.textContent = formatPrice(product.price);

            window.addEventListener('scroll', () => {
                stickyMobile.classList.toggle('active', window.scrollY > 400);
            }, { passive: true });

            if (btnStickyCart) {
                btnStickyCart.addEventListener('click', () => {
                    if (product.isSoldOut) return;
                    addToCart(product, selectedColor, selectedSize);
                    openCart();
                });
            }
        }

        // === Related Products ===
        const relatedSection = $('#related-section');
        const relatedGrid = $('#related-grid');

        if (relatedSection && relatedGrid) {
            const related = PRODUCTS
                .filter(p => p.id !== product.id && p.category === product.category)
                .slice(0, 4);

            const fallback = PRODUCTS
                .filter(p => p.id !== product.id)
                .slice(0, 4);

            const toShow = related.length > 0 ? related : fallback;

            if (toShow.length > 0) {
                relatedSection.style.display = 'block';
                relatedGrid.innerHTML = toShow.map(p => `
                    <a href="product.html?id=${p.id}" class="product-card">
                        <div class="card-image">
                            <img src="${p.images[0].src}" alt="${p.images[0].alt}" loading="lazy">
                        </div>
                        <div class="card-info">
                            <h3>${p.name}</h3>
                            <p class="price">${formatPrice(p.price)}</p>
                        </div>
                    </a>
                `).join('');

                if (window.attachCursorHover) window.attachCursorHover();
            }
        }

        if (window.attachCursorHover) window.attachCursorHover();
    }
}

// =========================================
// 13. NEWSLETTER
// =========================================
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

// =========================================
// INIT
// =========================================
updateBadges();
renderCart();

// =========================================
// 15. LOOKBOOK REVEAL (index.html)
// =========================================
const lookbookItems = $$('.lookbook-item');
if (lookbookItems.length > 0) {
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