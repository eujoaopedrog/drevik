import { PRODUCTS } from '../data/products.js';
import { formatPrice, $, $$ } from './utils.js';
import { getWishlist } from './storage.js';
import { attachCursorHover, showToast } from './ui.js';
import { toggleWishlist } from './wishlist.js';

export const initializeCatalog = () => {
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

        attachCursorHover();
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
};
