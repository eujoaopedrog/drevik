import { PRODUCTS } from '../data/products.js';
import { formatPrice, $, $$, responsiveImageAttributes } from './utils.js';
import { getWishlist } from './storage.js';
import { attachCursorHover, showToast } from './ui.js';
import { toggleWishlist } from './wishlist.js';
import { addToCart, openCart } from './cart.js';

export const initializeCatalog = () => {
const shopGrid = $('#shop-grid');

if (shopGrid && typeof PRODUCTS !== 'undefined') {
    let currentFilter = 'all';
    let currentSort = 'relevance';
    let renderVersion = 0;
    const shopResults = $('#shop-results');

    const renderSkeletons = () => {
        shopGrid.setAttribute('aria-busy', 'true');
        shopGrid.innerHTML = Array.from({ length: 4 }, () =>
            '<div class="skeleton-card" aria-hidden="true"><div class="skeleton-image"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>'
        ).join('');
    };

    const renderShop = () => {
        shopGrid.setAttribute('aria-busy', 'false');
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
            const secondaryImage = product.images[1];

            return `
                <article class="product-card" data-id="${product.id}">
                    <div class="card-image">
                        <a href="product.html?id=${product.id}" class="card-media-link" aria-label="Ver ${product.name}">
                            <img class="card-image-primary" src="${product.images[0].src}" alt="${product.images[0].alt}" ${responsiveImageAttributes(product.images[0], '(max-width: 768px) 50vw, 33vw')} loading="lazy">
                            ${secondaryImage ? `<img class="card-image-alt" src="${secondaryImage.src}" alt="" ${responsiveImageAttributes(secondaryImage, '(max-width: 768px) 50vw, 33vw')} loading="lazy" aria-hidden="true">` : ''}
                        </a>
                        ${badges.length ? `<div class="card-badges">${badges.join('')}</div>` : ''}
                        <button type="button" class="card-wishlist ${isWished ? 'active' : ''}" data-wishlist="${product.id}" aria-label="${isWished ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}" aria-pressed="${isWished}">
                            <svg viewBox="0 0 24 24" fill="${isWished ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                        <div class="card-actions">
                            <label class="visually-hidden" for="card-size-${product.id}">Tamanho de ${product.name}</label>
                            <select id="card-size-${product.id}" class="card-size-select" aria-label="Escolha o tamanho de ${product.name}" ${product.isSoldOut ? 'disabled' : ''}>
                                <option value="" selected disabled>Tamanho</option>
                                ${product.sizes.map(size => `<option value="${size}" ${product.sizesOutOfStock?.includes(size) ? 'disabled' : ''}>${size}</option>`).join('')}
                            </select>
                            <button type="button" class="btn-add" data-add="${product.id}" disabled>${product.isSoldOut ? 'Esgotado' : 'Adicionar à Sacola'}</button>
                        </div>
                    </div>
                    <div class="card-info">
                        <a href="product.html?id=${product.id}" class="card-link">
                            <h3>${product.name}</h3>
                            <p class="price">
                                ${product.oldPrice ? `<span class="old">${formatPrice(product.oldPrice)}</span>` : ''}
                                ${formatPrice(product.price)}
                            </p>
                        </a>
                        <span class="color-tag">${colorsText}</span>
                    </div>
                </article>
            `;
        }).join('');

        shopGrid.querySelectorAll('.card-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.dataset.wishlist;
                const added = toggleWishlist(id);
                btn.classList.toggle('active', added);
                btn.setAttribute('aria-pressed', String(added));
                btn.setAttribute('aria-label', added ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
                const svg = btn.querySelector('svg');
                if (svg) svg.setAttribute('fill', added ? 'currentColor' : 'none');
                showToast(added ? 'Adicionado aos favoritos' : 'Removido dos favoritos', 'info');
            });
        });

        shopGrid.querySelectorAll('.card-size-select').forEach(select => {
            select.addEventListener('change', () => {
                const addButton = select.parentElement.querySelector('.btn-add');
                if (addButton) addButton.disabled = !select.value;
            });
        });

        shopGrid.querySelectorAll('.btn-add').forEach(button => {
            button.addEventListener('click', () => {
                const product = PRODUCTS.find(item => item.id === button.dataset.add);
                const select = button.parentElement.querySelector('.card-size-select');
                if (!product || !select?.value) {
                    select?.focus();
                    showToast('Escolha um tamanho para continuar.', 'info');
                    return;
                }
                addToCart(product, product.colors[0].name, select.value);
                openCart();
            });
        });

        attachCursorHover();
    };

    const refreshShop = () => {
        const version = ++renderVersion;
        renderSkeletons();
        const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160;
        window.setTimeout(() => {
            if (version === renderVersion) renderShop();
        }, delay);
    };

    $$('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.filter-btn').forEach(b => b.classList.remove('active'));
            $$('.filter-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            currentFilter = btn.dataset.filter;
            refreshShop();
        });
    });

    const sortSelect = $('#sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            refreshShop();
        });
    }

    renderShop();
}
};
