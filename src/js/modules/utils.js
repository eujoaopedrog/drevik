export const formatPrice = (price) => `R$ ${price.toFixed(2).replace('.', ',')}`;
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);
