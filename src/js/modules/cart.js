import { formatPrice, $ } from './utils.js';
import { getCart, setCart } from './storage.js';
import { attachCursorHover, showToast, updateBadges } from './ui.js';

const cartDrawer = $('#cart-drawer');
const cartOverlay = $('#cart-overlay');
const cartItemsEl = $('#cart-items');
const cartFooter = $('#cart-footer');
const cartSubtotal = $('#cart-subtotal');

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

    cartItemsEl.querySelectorAll('.qty-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const index = parseInt(button.dataset.index);
            const cart = getCart();
            if (!cart[index]) return;

            if (button.dataset.action === 'plus') {
                cart[index].quantity += 1;
            } else {
                cart[index].quantity -= 1;
                if (cart[index].quantity <= 0) cart.splice(index, 1);
            }
            setCart(cart);
            updateBadges();
            renderCart();
        });
    });

    cartItemsEl.querySelectorAll('.cart-item-remove').forEach((button) => {
        button.addEventListener('click', () => {
            const cart = getCart();
            cart.splice(parseInt(button.dataset.index), 1);
            setCart(cart);
            updateBadges();
            renderCart();
            showToast('Produto removido do carrinho', 'info');
        });
    });

    attachCursorHover();
};

export const openCart = () => {
    if (!cartDrawer) return;
    renderCart();
    cartDrawer.classList.add('active');
    if (cartOverlay) cartOverlay.classList.add('active');
    document.body.classList.add('no-scroll');
};

export const closeCart = () => {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('active');
    if (cartOverlay) cartOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
};

export const addToCart = (product, color, size, quantity = 1) => {
    const cart = getCart();
    const existingIndex = cart.findIndex(
        (item) => item.id === product.id && item.color === color && item.size === size
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
    updateBadges();
    showToast(`${product.name} adicionado ao carrinho`);
};

export const initializeCart = () => {
    const cartToggle = $('#cart-toggle');
    const cartClose = $('#cart-close');
    const cartContinue = $('#cart-continue');
    const checkoutBtn = $('.btn-checkout');

    if (cartToggle) cartToggle.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (cartContinue) cartContinue.addEventListener('click', closeCart);

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            showToast('Redirecionando para o checkout seguro...', 'info');
        });
    }

    updateBadges();
    renderCart();
};
