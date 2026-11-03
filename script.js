// =========================================
// DREVIK — SCRIPT.JS COMPLETO
// =========================================

// =========================================
// UTILITÁRIOS
// =========================================
const WHATSAPP_NUMBER = '554199463742';
const FREE_SHIPPING_MIN = 299;
const MAX_INSTALLMENTS = 6;

const formatPrice = (price) => `R$ ${price.toFixed(2).replace('.', ',')}`;
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const whatsappUrl = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const findProduct = (id) => PRODUCTS.find(p => p.id === id);

const HEART_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

// =========================================
// STORAGE
// =========================================
const STORAGE_KEYS = {
    cart: 'drevik_cart',
    wishlist: 'drevik_wishlist'
};

const readList = (key) => {
    try {
        const value = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(value) ? value : [];
    } catch { return []; }
};

const writeList = (key, list) => {
    try {
        localStorage.setItem(key, JSON.stringify(list));
    } catch { /* sem storage, a sacola vale só para esta página */ }
    updateBadges();
};

const getCart = () => readList(STORAGE_KEYS.cart);
const setCart = (cart) => writeList(STORAGE_KEYS.cart, cart);
const getWishlist = () => readList(STORAGE_KEYS.wishlist);
const setWishlist = (list) => writeList(STORAGE_KEYS.wishlist, list);

// Nome, preço e foto vêm sempre do catálogo atual, nunca do que ficou salvo no navegador.
const getCartLines = () => getCart()
    .map((item, index) => ({ ...item, index, product: findProduct(item.id) }))
    .filter(line => line.product);

const getCartTotal = (lines) => lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);

// =========================================
// PAINÉIS (busca, sacola, salvas, menu)
// =========================================
// Injetados aqui para não repetir o mesmo HTML nas três páginas.
document.body.insertAdjacentHTML('beforeend', `
    <dialog class="panel panel-search" id="search-panel" aria-label="Buscar peças">
        <div class="panel-header">
            <label class="panel-title" for="search-input">Buscar</label>
            <button type="button" class="panel-close" data-close>Fechar</button>
        </div>
        <input type="search" class="search-input" id="search-input" placeholder="Nome ou estampa" autocomplete="off">
        <div class="search-results" id="search-results" aria-live="polite"></div>
    </dialog>

    <dialog class="panel panel-drawer" id="cart-panel" aria-labelledby="cart-title">
        <div class="panel-header">
            <h2 class="panel-title" id="cart-title">Sacola</h2>
            <button type="button" class="panel-close" data-close>Fechar</button>
        </div>
        <div class="panel-body" id="cart-items"></div>
        <div class="cart-footer" id="cart-footer">
            <p class="shipping-note" id="shipping-note"></p>
            <div class="shipping-bar" aria-hidden="true"><span id="shipping-bar-fill"></span></div>
            <div class="cart-subtotal">
                <span>Subtotal</span>
                <strong id="cart-subtotal">R$ 0,00</strong>
            </div>
            <a class="btn btn-light btn-block" id="cart-whatsapp" target="_blank" rel="noopener">Finalizar no WhatsApp</a>
            <p class="cart-footnote">Abre uma mensagem pronta. Pagamento e frete são combinados por lá.</p>
        </div>
    </dialog>

    <dialog class="panel panel-drawer" id="saved-panel" aria-labelledby="saved-title">
        <div class="panel-header">
            <h2 class="panel-title" id="saved-title">Salvas</h2>
            <button type="button" class="panel-close" data-close>Fechar</button>
        </div>
        <div class="panel-body" id="saved-items"></div>
    </dialog>

    <dialog class="panel panel-menu" id="menu-panel" aria-label="Menu">
        <div class="panel-header">
            <span class="logo">DK</span>
            <button type="button" class="panel-close" data-close>Fechar</button>
        </div>
        <nav class="menu-links" aria-label="Menu">
            <a href="index.html">Início</a>
            <a href="shop.html">Coleção</a>
            <a href="index.html#manifesto">Manifesto</a>
            <a href="index.html#como-comprar">Como comprar</a>
            <button type="button" id="menu-search">Buscar</button>
            <button type="button" id="menu-saved">Salvas</button>
        </nav>
    </dialog>

    <div class="toast-container" id="toast-container" role="status"></div>
`);

const openPanel = (panel) => {
    if (!panel || panel.open) return;
    $$('dialog[open]').forEach(other => other.close());
    panel.showModal();
};

$$('dialog.panel').forEach(panel => {
    panel.addEventListener('click', (e) => {
        // Clique fora do conteúdo cai no próprio dialog (backdrop)
        if (e.target === panel || e.target.closest('[data-close]')) panel.close();
    });
    panel.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', () => panel.close());
    });
});

// =========================================
// TOASTS
// =========================================
const showToast = (message) => {
    const container = $('#toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
};

// =========================================
// CONTADORES (Sacola + Salvas)
// =========================================
const updateBadges = () => {
    const cartCount = getCartLines().reduce((sum, line) => sum + line.quantity, 0);
    const savedCount = getWishlist().length;

    const cartBadge = $('#cart-count');
    const savedBadge = $('#saved-count');

    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.classList.toggle('active', cartCount > 0);
    }
    if (savedBadge) {
        savedBadge.textContent = savedCount;
        savedBadge.classList.toggle('active', savedCount > 0);
    }
};

// =========================================
// LINKS DE WHATSAPP COM MENSAGEM PRONTA
// =========================================
const applyWhatsappLinks = (root = document) => {
    root.querySelectorAll('[data-wa]').forEach(link => {
        link.href = whatsappUrl(link.dataset.wa);
    });
};

// =========================================
// VIRA — a camiseta gira para mostrar o outro lado
// =========================================
const sideLabel = (side) => side === 'frente' ? 'Ver frente' : 'Ver costas';

const viraHTML = (product, options = {}) => {
    const printSide = product.printSide;
    const otherSide = printSide === 'costas' ? 'frente' : 'costas';
    const printImage = product.images[printSide];
    const otherImage = product.images[otherSide];
    const loading = options.eager ? '' : 'loading="lazy"';

    return `
        <div class="vira" data-vira data-other="${otherSide}" data-print="${printSide}">
            <div class="vira-inner">
                <img class="vira-face" src="${printImage.src}" alt="${printImage.alt}" ${loading}>
                <img class="vira-face vira-face-back" src="${otherImage.src}" alt="" ${loading}>
            </div>
            <a class="vira-hit" href="product.html?id=${product.id}" tabindex="-1" aria-hidden="true"></a>
            <button type="button" class="vira-btn" aria-label="${sideLabel(otherSide)} da ${product.name}">${sideLabel(otherSide)}</button>
        </div>
    `;
};

const setViraTurned = (vira, turned) => {
    vira.classList.toggle('is-turned', turned);
    const nextSide = turned ? vira.dataset.print : vira.dataset.other;
    const button = vira.querySelector('.vira-btn');
    if (!button) return;
    button.textContent = sideLabel(nextSide);
    button.setAttribute('aria-label', button.getAttribute('aria-label').replace(/^Ver \w+/, sideLabel(nextSide)));
};

document.addEventListener('click', (e) => {
    const button = e.target.closest('.vira-btn');
    if (!button) return;
    const vira = button.closest('[data-vira]');
    setViraTurned(vira, !vira.classList.contains('is-turned'));
});

// pointerover/out atravessam os filhos; só mouse vira no hover (toque usa o botão)
document.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const vira = e.target.closest?.('[data-vira]');
    if (vira && !vira.contains(e.relatedTarget)) setViraTurned(vira, true);
});

document.addEventListener('pointerout', (e) => {
    if (e.pointerType !== 'mouse') return;
    const vira = e.target.closest?.('[data-vira]');
    if (vira && !vira.contains(e.relatedTarget)) setViraTurned(vira, false);
});

// =========================================
// CARD DE PRODUTO (coleção, relacionados)
// =========================================
const productCardHTML = (product) => {
    const isSaved = getWishlist().includes(product.id);
    const stepNumber = PRODUCTS.indexOf(product) + 1;

    return `
        <article class="product-card">
            ${viraHTML(product)}
            <button type="button" class="save-btn ${isSaved ? 'active' : ''}" data-save="${product.id}"
                    aria-pressed="${isSaved}" aria-label="Salvar ${product.name}">${HEART_ICON}</button>
            ${product.isSoldOut ? '<span class="card-badge">Esgotado</span>' : ''}
            <div class="card-info">
                <span class="card-step">Etapa ${stepNumber} · ${product.step}</span>
                <h3><a href="product.html?id=${product.id}">${product.name}</a></h3>
                <p class="card-price">
                    ${product.oldPrice ? `<s>${formatPrice(product.oldPrice)}</s>` : ''}
                    ${formatPrice(product.price)}
                </p>
            </div>
        </article>
    `;
};

// =========================================
// SALVAS
// =========================================
const toggleSaved = (productId) => {
    const list = getWishlist();
    const idx = list.indexOf(productId);
    const added = idx < 0;

    if (added) {
        list.push(productId);
    } else {
        list.splice(idx, 1);
    }
    setWishlist(list);
    return added;
};

const syncSaveButtons = (productId, saved) => {
    $$(`[data-save="${productId}"]`).forEach(btn => {
        btn.classList.toggle('active', saved);
        btn.setAttribute('aria-pressed', String(saved));
    });
};

document.addEventListener('click', (e) => {
    const button = e.target.closest('[data-save]');
    if (!button) return;
    const added = toggleSaved(button.dataset.save);
    syncSaveButtons(button.dataset.save, added);
    showToast(added ? 'Peça salva' : 'Peça removida das salvas');
});

const renderSaved = () => {
    const container = $('#saved-items');
    if (!container) return;
    const products = getWishlist().map(findProduct).filter(Boolean);

    if (products.length === 0) {
        container.innerHTML = `
            <div class="panel-empty">
                <p>Nenhuma peça salva. Toque no coração de uma peça para guardar aqui.</p>
                <a class="btn btn-ink" href="shop.html">Ver a coleção</a>
            </div>
        `;
    } else {
        container.innerHTML = products.map(product => `
            <div class="line-item">
                <a class="line-item-img" href="product.html?id=${product.id}" tabindex="-1" aria-hidden="true">
                    <img src="${product.images[product.printSide].src}" alt="">
                </a>
                <div class="line-item-info">
                    <h3><a href="product.html?id=${product.id}">${product.name}</a></h3>
                    <span class="line-item-price">${formatPrice(product.price)}</span>
                    <button type="button" class="line-item-remove" data-saved-remove="${product.id}">Remover</button>
                </div>
            </div>
        `).join('');
    }
    container.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', () => $('#saved-panel').close());
    });
};

const savedPanel = $('#saved-panel');
if (savedPanel) {
    savedPanel.addEventListener('click', (e) => {
        const button = e.target.closest('[data-saved-remove]');
        if (!button) return;
        toggleSaved(button.dataset.savedRemove);
        syncSaveButtons(button.dataset.savedRemove, false);
        renderSaved();
    });
}

const openSaved = () => {
    renderSaved();
    openPanel(savedPanel);
};

const savedToggle = $('#saved-toggle');
if (savedToggle) savedToggle.addEventListener('click', openSaved);

// =========================================
// SACOLA
// =========================================
const cartPanel = $('#cart-panel');
const cartItemsEl = $('#cart-items');
const cartFooter = $('#cart-footer');

const buildOrderMessage = (lines) => {
    const total = getCartTotal(lines);
    const orderLines = lines.map(({ quantity, product, color, size }) =>
        `${quantity}x ${product.name} - ${size} - ${formatPrice(product.price)} cada${color ? ` (${color})` : ''}`
    );

    return [
        'Olá, DREVIK! Quero fazer um pedido:',
        '',
        ...orderLines,
        '',
        `Total dos produtos: ${formatPrice(total)}`,
        total >= FREE_SHIPPING_MIN
            ? 'Pedido com frete grátis. Gostaria de confirmar a disponibilidade.'
            : 'Gostaria de confirmar a disponibilidade e combinar o frete.'
    ].join('\n');
};

const renderCart = () => {
    if (!cartItemsEl) return;
    const lines = getCartLines();

    if (lines.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="panel-empty">
                <p>Sua sacola está vazia. Cada processo começa com uma peça.</p>
                <a class="btn btn-ink" href="shop.html">Ver a coleção</a>
            </div>
        `;
        cartItemsEl.querySelector('a').addEventListener('click', () => cartPanel.close());
        cartFooter.hidden = true;
        return;
    }

    cartFooter.hidden = false;

    cartItemsEl.innerHTML = lines.map(({ index, product, color, size, quantity }) => `
        <div class="line-item">
            <div class="line-item-img">
                <img src="${product.images[product.printSide].src}" alt="">
            </div>
            <div class="line-item-info">
                <h3>${product.name}</h3>
                <span class="line-item-meta">${color} / ${size}</span>
                <span class="line-item-price">${formatPrice(product.price)}</span>
                <div class="qty">
                    <button type="button" class="qty-btn" data-action="minus" data-index="${index}" aria-label="Tirar uma ${product.name}">−</button>
                    <span class="qty-value" aria-label="Quantidade">${quantity}</span>
                    <button type="button" class="qty-btn" data-action="plus" data-index="${index}" aria-label="Adicionar mais uma ${product.name}">+</button>
                    <button type="button" class="line-item-remove" data-action="remove" data-index="${index}">Remover</button>
                </div>
            </div>
        </div>
    `).join('');

    const total = getCartTotal(lines);
    const missing = FREE_SHIPPING_MIN - total;
    $('#cart-subtotal').textContent = formatPrice(total);
    $('#shipping-note').textContent = missing > 0
        ? `Faltam ${formatPrice(missing)} para o frete grátis`
        : 'Frete grátis garantido';
    $('#shipping-note').classList.toggle('done', missing <= 0);
    $('#shipping-bar-fill').style.width = `${Math.min(100, (total / FREE_SHIPPING_MIN) * 100)}%`;
    $('#cart-whatsapp').href = whatsappUrl(buildOrderMessage(lines));
};

if (cartItemsEl) {
    cartItemsEl.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action]');
        if (!button) return;

        const cart = getCart();
        const idx = Number(button.dataset.index);
        if (!cart[idx]) return;

        if (button.dataset.action === 'plus') {
            cart[idx].quantity += 1;
        } else if (button.dataset.action === 'minus' && cart[idx].quantity > 1) {
            cart[idx].quantity -= 1;
        } else {
            cart.splice(idx, 1);
        }
        setCart(cart);
        renderCart();
    });
}

const openCart = () => {
    renderCart();
    openPanel(cartPanel);
};

const addToCart = (product, color, size, quantity = 1) => {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id && item.color === color && item.size === size);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id: product.id, color, size, quantity });
    }

    setCart(cart);
};

const cartToggle = $('#cart-toggle');
if (cartToggle) cartToggle.addEventListener('click', openCart);

// =========================================
// BUSCA
// =========================================
const searchPanel = $('#search-panel');
const searchInput = $('#search-input');
const searchResults = $('#search-results');

const openSearch = () => {
    searchInput.value = '';
    searchResults.innerHTML = '';
    openPanel(searchPanel);
    searchInput.focus();
};

const searchToggle = $('#search-toggle');
if (searchToggle) searchToggle.addEventListener('click', openSearch);

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    if (!query) {
        searchResults.innerHTML = '';
        return;
    }

    const matches = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.tagline.toLowerCase().includes(query) ||
        p.step.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        searchResults.innerHTML = '<p class="search-empty">Nenhuma peça com esse nome. Tente "scar", "process" ou "oversized".</p>';
        return;
    }

    searchResults.innerHTML = matches.map(p => `
        <a href="product.html?id=${p.id}" class="search-result">
            <img src="${p.images[p.printSide].src}" alt="">
            <span class="search-result-name">${p.name}</span>
            <span class="search-result-price">${formatPrice(p.price)}</span>
        </a>
    `).join('');
});

// =========================================
// MENU MOBILE
// =========================================
const menuToggle = $('#menu-toggle');
if (menuToggle) menuToggle.addEventListener('click', () => openPanel($('#menu-panel')));
$('#menu-search').addEventListener('click', openSearch);
$('#menu-saved').addEventListener('click', openSaved);

// =========================================
// O PERCURSO (index.html)
// =========================================
const routeStages = $('#route-stages');
if (routeStages) {
    routeStages.innerHTML = PRODUCTS.map((product, i) => {
        const tone = product.colors[0].name === 'Preto' ? 'stage-dark' : 'stage-light';
        return `
            <article class="stage ${tone}">
                <div class="stage-media">${viraHTML(product)}</div>
                <div class="stage-copy">
                    <p class="stage-step">Etapa ${i + 1} de ${PRODUCTS.length}</p>
                    <h3 class="stage-verb">${product.step}</h3>
                    <p class="script stage-tagline">${product.tagline}</p>
                    <p class="stage-story">${product.story}</p>
                    <div class="stage-buy">
                        <div class="stage-price">
                            <span>${product.name}</span>
                            <strong>${formatPrice(product.price)}</strong>
                        </div>
                        <a class="btn ${tone === 'stage-dark' ? 'btn-light' : 'btn-ink'}" href="product.html?id=${product.id}">Ver a peça</a>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// =========================================
// COLEÇÃO (shop.html)
// =========================================
const shopGrid = $('#shop-grid');

if (shopGrid) {
    let currentFilter = 'all';
    let currentSort = 'relevance';
    const shopResults = $('#shop-results');

    const renderShop = () => {
        const filtered = currentFilter === 'all'
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

        shopResults.textContent = `${filtered.length} ${filtered.length === 1 ? 'peça' : 'peças'}`;
        shopGrid.innerHTML = filtered.map(productCardHTML).join('');
    };

    $$('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.filter-btn').forEach(b => {
                b.classList.toggle('active', b === btn);
                b.setAttribute('aria-pressed', String(b === btn));
            });
            currentFilter = btn.dataset.filter;
            renderShop();
        });
    });

    $('#sort-select').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderShop();
    });

    renderShop();
}

// =========================================
// PÁGINA DE PRODUTO (product.html)
// =========================================
const productLayout = $('#product-layout');

if (productLayout) {
    const params = new URLSearchParams(window.location.search);
    const product = findProduct(params.get('id'));

    if (!product) {
        productLayout.innerHTML = `
            <div class="panel-empty product-missing">
                <h1>Peça não encontrada</h1>
                <p>Esse link não leva a nenhuma peça da coleção atual.</p>
                <a class="btn btn-ink" href="shop.html">Ver a coleção</a>
            </div>
        `;
    } else {
        document.title = `${product.name} | DREVIK`;
        $('#breadcrumb-product').textContent = product.name;

        const otherSide = product.printSide === 'costas' ? 'frente' : 'costas';
        const gallery = [
            product.images[product.printSide],
            product.images[otherSide],
            product.images[`${product.printSide}Flat`],
            product.images[`${otherSide}Flat`]
        ];
        const stepNumber = PRODUCTS.indexOf(product) + 1;
        const colors = product.colors;
        const isSaved = getWishlist().includes(product.id);
        const installment = formatPrice(product.price / MAX_INSTALLMENTS);
        const pairForFreeShipping = product.price * 2 >= FREE_SHIPPING_MIN;
        const sizeQuestion = `Olá, DREVIK! Quais são as medidas da ${product.name}? Quero escolher o tamanho certo.`;

        productLayout.innerHTML = `
            <div class="gallery">
                <div class="gallery-main" id="gallery-main" tabindex="0"
                     aria-label="Galeria de ${product.name}. Use as setas esquerda e direita para trocar a imagem.">
                    <img src="${gallery[0].src}" alt="${gallery[0].alt}" id="gallery-main-img">
                    <button type="button" class="gallery-arrow gallery-arrow-prev" id="gallery-prev" aria-label="Imagem anterior">←</button>
                    <button type="button" class="gallery-arrow gallery-arrow-next" id="gallery-next" aria-label="Próxima imagem">→</button>
                </div>
                <div class="thumbnails" id="thumbnails">
                    ${gallery.map((img, i) => `
                        <button type="button" class="thumb ${i === 0 ? 'active' : ''}" data-index="${i}"
                                aria-label="Ver imagem ${i + 1}: ${img.alt}" aria-pressed="${i === 0}">
                            <img src="${img.src}" alt="" loading="lazy">
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="product-details">
                <p class="stage-step">Etapa ${stepNumber} de ${PRODUCTS.length} · ${product.step}</p>
                <h1 class="product-name">${product.name}</h1>
                <p class="script product-tagline">${product.tagline}</p>

                <div class="product-price-row">
                    ${product.oldPrice ? `<s class="product-price-old">${formatPrice(product.oldPrice)}</s>` : ''}
                    <strong class="product-price">${formatPrice(product.price)}</strong>
                    <span class="product-installments">ou ${MAX_INSTALLMENTS}x de ${installment} sem juros</span>
                </div>

                ${colors.length > 1 ? `
                    <div class="selector-group">
                        <span class="selector-label">Cor: <strong id="selected-color-name">${colors[0].name}</strong></span>
                        <div class="color-options" id="color-options">
                            ${colors.map((color, i) => `
                                <button type="button" class="color-btn ${i === 0 ? 'active' : ''}"
                                        style="background-color: ${color.hex};"
                                        data-color="${color.name}"
                                        aria-pressed="${i === 0}"
                                        aria-label="${color.name}"></button>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <p class="selector-label">Cor: <strong>${colors[0].name}</strong></p>
                `}

                <fieldset class="selector-group" id="size-group">
                    <div class="size-header">
                        <legend class="selector-label">Tamanho</legend>
                        <a class="size-help" href="${whatsappUrl(sizeQuestion)}" target="_blank" rel="noopener">Dúvida na medida? Pergunte</a>
                    </div>
                    <div class="size-options" id="size-options">
                        ${product.sizes.map(size => {
                            const outOfStock = product.sizesOutOfStock.includes(size);
                            return `<button type="button" class="size-btn" data-size="${size}" aria-pressed="false" ${outOfStock ? `disabled aria-label="${size}, esgotado"` : ''}>${size}</button>`;
                        }).join('')}
                    </div>
                    <p class="size-error" id="size-error" role="alert"></p>
                </fieldset>

                <div class="product-actions" id="product-actions">
                    <button type="button" class="btn btn-light btn-block" id="btn-buy-now" ${product.isSoldOut ? 'disabled' : ''}>${product.isSoldOut ? 'Esgotado' : 'Pedir no WhatsApp'}</button>
                    <div class="product-actions-row">
                        <button type="button" class="btn btn-ink btn-block" id="btn-add-cart" ${product.isSoldOut ? 'disabled' : ''}>Colocar na sacola</button>
                        <button type="button" class="save-btn save-btn-inline ${isSaved ? 'active' : ''}" data-save="${product.id}"
                                aria-pressed="${isSaved}" aria-label="Salvar ${product.name}">${HEART_ICON}</button>
                    </div>
                    ${pairForFreeShipping ? '<p class="product-hint">Levando duas peças, o frete sai grátis.</p>' : ''}
                </div>

                <details class="product-desc" open>
                    <summary>A história da estampa</summary>
                    ${product.description.map(paragraph => `<p>${paragraph}</p>`).join('')}
                </details>
                <details class="product-desc">
                    <summary>Detalhes da peça</summary>
                    <ul>${product.details.map(d => `<li>${d}</li>`).join('')}</ul>
                </details>
            </div>
        `;

        // === Galeria ===
        const mainImg = $('#gallery-main-img');
        const thumbs = $$('.thumb');
        const galleryEl = $('#gallery-main');
        let activeImageIndex = 0;

        const setActiveImage = (index) => {
            activeImageIndex = (index + gallery.length) % gallery.length;
            const image = gallery[activeImageIndex];

            mainImg.src = image.src;
            mainImg.alt = image.alt;
            thumbs.forEach((thumb, thumbIndex) => {
                const isActive = thumbIndex === activeImageIndex;
                thumb.classList.toggle('active', isActive);
                thumb.setAttribute('aria-pressed', String(isActive));
            });
        };

        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => setActiveImage(Number(thumb.dataset.index)));
        });

        $('#gallery-prev').addEventListener('click', () => setActiveImage(activeImageIndex - 1));
        $('#gallery-next').addEventListener('click', () => setActiveImage(activeImageIndex + 1));

        galleryEl.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                setActiveImage(activeImageIndex - 1);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                setActiveImage(activeImageIndex + 1);
            }
        });

        let pointerStartX = null;
        galleryEl.addEventListener('pointerdown', (event) => {
            if (event.pointerType === 'touch') pointerStartX = event.clientX;
        });
        galleryEl.addEventListener('pointerup', (event) => {
            if (pointerStartX === null) return;
            const swipeDistance = event.clientX - pointerStartX;
            pointerStartX = null;
            if (Math.abs(swipeDistance) < 40) return;
            setActiveImage(activeImageIndex + (swipeDistance < 0 ? 1 : -1));
        });
        galleryEl.addEventListener('pointercancel', () => {
            pointerStartX = null;
        });

        // === Seletores ===
        let selectedColor = colors[0].name;
        let selectedSize = null;
        const sizeBtns = $$('.size-btn');
        const sizeGroup = $('#size-group');
        const sizeError = $('#size-error');
        const buyBarBtn = $('#buy-bar-btn');

        $$('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.color-btn').forEach(b => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-pressed', String(b === btn));
                });
                selectedColor = btn.dataset.color;
                $('#selected-color-name').textContent = selectedColor;
            });
        });

        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeBtns.forEach(b => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-pressed', String(b === btn));
                });
                selectedSize = btn.dataset.size;
                sizeGroup.classList.remove('has-error');
                sizeError.textContent = '';
                buyBarBtn.textContent = `Colocar ${selectedSize} na sacola`;
            });
        });

        // Tamanho nunca vem pré-selecionado: evita pedido no tamanho errado
        const requireSize = () => {
            if (selectedSize) return true;
            sizeGroup.classList.add('has-error');
            sizeError.textContent = 'Escolha um tamanho para continuar.';
            sizeGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const firstAvailable = [...sizeBtns].find(b => !b.disabled);
            if (firstAvailable) firstAvailable.focus({ preventScroll: true });
            return false;
        };

        const addSelectedToCart = () => {
            if (!requireSize()) return;
            addToCart(product, selectedColor, selectedSize);
            openCart();
        };

        if (!product.isSoldOut) {
            $('#btn-add-cart').addEventListener('click', addSelectedToCart);
            buyBarBtn.addEventListener('click', addSelectedToCart);

            $('#btn-buy-now').addEventListener('click', () => {
                if (!requireSize()) return;
                const line = { quantity: 1, product, color: selectedColor, size: selectedSize };
                window.open(whatsappUrl(buildOrderMessage([line])), '_blank', 'noopener');
            });
        }

        // === Barra de compra (mobile): aparece quando os botões saem da tela ===
        const buyBar = $('#buy-bar');
        $('#buy-bar-name').textContent = product.name;
        $('#buy-bar-price').textContent = formatPrice(product.price);

        if (!product.isSoldOut) {
            new IntersectionObserver(([entry]) => {
                buyBar.hidden = entry.isIntersecting;
            }).observe($('#product-actions'));
        }

        // === Segue o percurso: próximas etapas, em ordem ===
        const relatedSection = $('#related-section');
        const position = PRODUCTS.indexOf(product);
        const related = [...PRODUCTS.slice(position + 1), ...PRODUCTS.slice(0, position)];

        relatedSection.hidden = false;
        $('#related-grid').innerHTML = related.map(productCardHTML).join('');
    }
}

// =========================================
// INIT
// =========================================
applyWhatsappLinks();
updateBadges();
