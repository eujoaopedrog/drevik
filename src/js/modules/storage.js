import { PRODUCTS } from '../data/products.js';

const STORAGE_KEYS = {
    cart: 'drevik_cart',
    wishlist: 'drevik_wishlist',
    recent: 'drevik_recent'
};

const getList = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
        return [];
    }
};

export const getCart = () => {
    const cart = getList(STORAGE_KEYS.cart);
    let migrated = false;

    const normalizedCart = cart.map((item) => {
        const product = PRODUCTS.find(({ id }) => id === item.id);
        if (!product || item.image === product.images[0].src) return item;

        migrated = true;
        return { ...item, image: product.images[0].src };
    });

    if (migrated) setCart(normalizedCart);
    return normalizedCart;
};
export const setCart = (cart) => localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
export const getWishlist = () => getList(STORAGE_KEYS.wishlist);
export const setWishlist = (wishlist) => localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlist));
export const getRecent = () => getList(STORAGE_KEYS.recent);
export const setRecent = (recent) => localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(recent));
