export const formatPrice = (price) => `R$ ${price.toFixed(2).replace('.', ',')}`;
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

export const responsiveImageSrcset = image => {
    const basePath = image.src.replace(/\.(jpe?g|png|webp)$/i, '');
    const candidates = [160, 320, 480, 800]
        .filter(width => width < image.width)
        .map(width => `${basePath}-${width}w.jpg ${width}w`);

    candidates.push(`${image.src} ${image.width}w`);
    return candidates.join(', ');
};

export const responsiveImageAttributes = (image, sizes) => {
    return `width="${image.width}" height="${image.height}" srcset="${responsiveImageSrcset(image)}" sizes="${sizes}"`;
};

export const trapFocus = (container, event) => {
    const focusable = [...container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter(element => element.getClientRects().length > 0);

    if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
};
