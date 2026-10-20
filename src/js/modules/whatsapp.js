import { formatPrice } from './utils.js';

const WHATSAPP_NUMBER = '554199463742';

export const createWhatsAppOrderUrl = (items, total) => {
    if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
        throw new Error('O número de WhatsApp da loja está inválido.');
    }

    const lines = items.map(({ quantity, name, color, size, price }) =>
        `${quantity}x ${name} - ${size} - ${formatPrice(price)} cada${color ? ` (${color})` : ''}`
    );
    const message = [
        'Olá, DREVIK! Quero fazer um pedido:',
        '',
        ...lines,
        '',
        `Total dos produtos: ${formatPrice(total)}`,
        'Gostaria de confirmar disponibilidade e combinar o frete.'
    ].join('\n');

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const openWhatsAppOrder = (items, total) => {
    const url = createWhatsAppOrderUrl(items, total);
    window.open(url, '_blank', 'noopener,noreferrer');
};
