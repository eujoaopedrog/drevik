import { initializeCart, closeCart } from './modules/cart.js';
import { initializeCatalog } from './modules/catalog.js';
import { initializeProductPage } from './modules/product-page.js';
import { initializeUI } from './modules/ui.js';
import { initializeWishlist } from './modules/wishlist.js';

initializeUI({ closeCart });
initializeCart();
initializeWishlist();
initializeCatalog();
initializeProductPage();
