import { getWishlist, setWishlist } from './storage.js';
import { showToast, updateBadges } from './ui.js';
import { $ } from './utils.js';

export const toggleWishlist = (productId) => {
    const wishlist = getWishlist();
    const index = wishlist.indexOf(productId);
    const added = index < 0;

    if (added) {
        wishlist.push(productId);
    } else {
        wishlist.splice(index, 1);
    }

    setWishlist(wishlist);
    updateBadges();
    return added;
};

export const initializeWishlist = () => {
    const wishlistToggle = $('#wishlist-toggle');
    if (!wishlistToggle) return;

    wishlistToggle.addEventListener('click', () => {
        const wishlist = getWishlist();
        if (wishlist.length === 0) {
            showToast('Sua lista de favoritos está vazia', 'info');
        } else {
            showToast(`Você tem ${wishlist.length} item(ns) nos favoritos`, 'info');
        }
    });
};
