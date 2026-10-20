import { PRODUCTS } from '../data/products.js';
import { formatPrice, $, $$, responsiveImageAttributes, responsiveImageSrcset } from './utils.js';
import { getRecent, setRecent } from './storage.js';
import { addToCart, openCart } from './cart.js';
import { attachCursorHover, showToast } from './ui.js';
import { openWhatsAppOrder } from './whatsapp.js';

export const initializeProductPage = () => {
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
        const description = product.description[0];
        const socialImage = new URL(product.images[0].src, window.location.href).href;
        const descriptionMeta = $('meta[name="description"]');
        const socialTitleMeta = $('meta[property="og:title"]');
        const socialDescriptionMeta = $('meta[property="og:description"]');
        const socialImageMeta = $('meta[property="og:image"]');

        if (descriptionMeta) descriptionMeta.content = description;
        if (socialTitleMeta) socialTitleMeta.content = `${product.name} | DREVIK`;
        if (socialDescriptionMeta) socialDescriptionMeta.content = description;
        if (socialImageMeta) socialImageMeta.content = socialImage;

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description.join(' '),
            image: product.images.map(image => new URL(image.src, window.location.href).href),
            brand: { '@type': 'Brand', name: 'DREVIK' },
            sku: product.id,
            offers: {
                '@type': 'Offer',
                priceCurrency: 'BRL',
                price: product.price.toFixed(2),
                availability: product.isSoldOut
                    ? 'https://schema.org/OutOfStock'
                    : 'https://schema.org/InStock',
                url: window.location.href
            }
        };
        let structuredDataScript = $('script[type="application/ld+json"]');
        if (!structuredDataScript) {
            structuredDataScript = document.createElement('script');
            structuredDataScript.type = 'application/ld+json';
            document.head.appendChild(structuredDataScript);
        }
        structuredDataScript.textContent = JSON.stringify(structuredData);

        const bcProduct = $('#breadcrumb-product');
        if (bcProduct) bcProduct.textContent = product.name;

        // Save to recently viewed
        const recent = getRecent().filter(id => id !== product.id);
        recent.unshift(product.id);
        setRecent(recent.slice(0, 6));

        const colors = product.colors;
        const sizes = product.sizes;
        let selectedSize = '';
        const discount = product.oldPrice
            ? Math.round((1 - product.price / product.oldPrice) * 100)
            : 0;

        productLayout.innerHTML = `
            <section class="product-gallery-wrap" aria-label="Galeria de imagens do produto">
                <div class="thumbnails" id="thumbnails" aria-label="Miniaturas do produto">
                    ${product.images.map((img, i) => `
                        <button type="button" class="thumb ${i === 0 ? 'active' : ''}" data-index="${i}"
                                aria-label="Ver imagem ${i + 1}: ${img.alt}" aria-pressed="${i === 0}">
                            <img src="${img.src}" alt="" ${responsiveImageAttributes(img, '(max-width: 768px) 15vw, 76px')} loading="lazy">
                        </button>
                    `).join('')}
                </div>
                <div class="gallery-main" id="gallery-main" role="region" aria-roledescription="carrossel" tabindex="0"
                     aria-label="Galeria de ${product.name}. Use as setas esquerda e direita para trocar a imagem.">
                    <img src="${product.images[0].src}" alt="${product.images[0].alt}" ${responsiveImageAttributes(product.images[0], '(max-width: 768px) 100vw, 60vw')} id="gallery-main-img" loading="eager" fetchpriority="high">
                    <button type="button" class="gallery-arrow gallery-arrow-prev" id="gallery-prev" aria-controls="gallery-main"
                            aria-label="Ver imagem anterior">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>
                    </button>
                    <button type="button" class="gallery-arrow gallery-arrow-next" id="gallery-next" aria-controls="gallery-main"
                            aria-label="Ver próxima imagem">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
                    </button>
                    <div class="gallery-status">
                        <span id="gallery-caption">${product.images[0].alt.split(' - ').slice(1).join(' - ')}</span>
                        <span id="gallery-counter" aria-live="polite">01 / ${String(product.images.length).padStart(2, '0')}</span>
                    </div>
                </div>
            </section>

            <section class="product-details" aria-labelledby="product-title">
                <span class="brand-tag">DK | DREVIK</span>
                <h1 class="product-name" id="product-title">${product.name}</h1>
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
                    <div class="size-options" id="size-options" role="group" aria-label="Escolha um tamanho">
                        ${sizes.map((size, i) => {
                            const outOfStock = product.sizesOutOfStock?.includes(size);
                            return `<button type="button" class="size-btn" aria-pressed="false" aria-label="${size}${outOfStock ? ' - esgotado' : ''}" ${outOfStock ? 'disabled' : ''}>${size}</button>`;
                        }).join('')}
                    </div>
                    <p class="size-hint" id="size-hint" aria-live="polite">Escolha um tamanho para continuar.</p>
                </div>

                <div class="product-actions">
                    <button class="btn-add-cart" id="btn-add-cart" disabled>${product.isSoldOut ? 'Esgotado' : 'Adicionar à Sacola'}</button>
                    <button class="btn-buy-now" id="btn-buy-now" disabled>${product.isSoldOut ? 'Esgotado' : 'Comprar via WhatsApp'}</button>
                </div>

                <div class="product-desc">
                    <h3>Detalhes da Peça</h3>
                    ${product.description.map(paragraph => `<p>${paragraph}</p>`).join('')}
                    <ul>${product.details.map(d => `<li>${d}</li>`).join('')}</ul>
                </div>
            </section>
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
                mainImg.srcset = responsiveImageSrcset(image);
                mainImg.alt = image.alt;
                mainImg.width = image.width;
                mainImg.height = image.height;
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
                    thumbnails.scrollTo({
                        left: thumb.offsetLeft,
                        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
                    });
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
                const sizeHint = $('#size-hint');
                if (sizeHint) sizeHint.textContent = `Tamanho selecionado: ${selectedSize}`;
                [$('#btn-add-cart'), $('#btn-buy-now'), $('#btn-sticky-cart')].forEach(button => {
                    if (button) button.disabled = product.isSoldOut;
                });
            });
        });

        // === Add to cart ===
        const btnAddCart = $('#btn-add-cart');
        const btnBuyNow = $('#btn-buy-now');

        if (btnAddCart && !product.isSoldOut) {
            btnAddCart.addEventListener('click', () => {
                if (!selectedSize) {
                    showToast('Escolha um tamanho para continuar.', 'info');
                    [...sizeBtns].find(button => !button.disabled)?.focus();
                    return;
                }
                addToCart(product, selectedColor, selectedSize);
                openCart();
            });
        }

        if (btnBuyNow && !product.isSoldOut) {
            btnBuyNow.addEventListener('click', () => {
                if (!selectedSize) {
                    showToast('Escolha um tamanho para continuar.', 'info');
                    [...sizeBtns].find(button => !button.disabled)?.focus();
                    return;
                }
                openWhatsAppOrder([{
                    quantity: 1,
                    name: product.name,
                    color: selectedColor,
                    size: selectedSize,
                    price: product.price
                }], product.price);
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
                    if (!selectedSize) {
                        showToast('Escolha um tamanho para continuar.', 'info');
                        [...sizeBtns].find(button => !button.disabled)?.focus();
                        return;
                    }
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
                    <article class="product-card">
                    <a href="product.html?id=${p.id}" class="card-link">
                        <div class="card-image">
                            <img src="${p.images[0].src}" alt="${p.images[0].alt}" ${responsiveImageAttributes(p.images[0], '(max-width: 768px) 50vw, 25vw')} loading="lazy">
                        </div>
                        <div class="card-info">
                            <h3>${p.name}</h3>
                            <p class="price">${formatPrice(p.price)}</p>
                        </div>
                    </a>
                    </article>
                `).join('');

                attachCursorHover();
            }
        }

        attachCursorHover();
    }
}
};
