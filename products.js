// =========================================
// BANCO DE DADOS DE PRODUTOS - DREVIK
// =========================================
const PRODUCTS = [
    {
        id: 'the-process-tee',
        name: 'The Process Tee',
        price: 149.90,
        oldPrice: 189.90, // Preço "de" (opcional, para mostrar desconto)
        category: 'oversized',
        tagline: 'The process is the only way.',
        isNew: true,
        isSoldOut: false,
        isFeatured: true,
        colors: [
            { name: 'Preto', hex: '#111111' }
        ],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: [],
        images: [
            'img/products-cape2.jpeg',
            'img/options-black2.jpeg',
            'img/options-black3.jpeg',
            'img/options-black4.jpeg' 
        ],
        description: 'Camiseta oversized em algodão 100% penteado de alta gramatura. Estampa em silk de alta durabilidade. Caimento perfeito para o dia a dia.',
        details: ['100% Algodão', 'Caimento Oversized', 'Lavagem a frio', 'Produzido no Brasil']
    },
    {
        id: 'every-scar-tee',
        name: 'Every Scar Tee',
        price: 149.90,
        category: 'oversized',
        tagline: 'Every scar is temporary.',
        isNew: true,
        isSoldOut: false,
        isFeatured: false,
        colors: [{ name: 'Branco', hex: '#ffffff' }],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: ['P'],
        images: [
            'img/options-white.jpeg',
            'img/options-white2.jpeg',
            'img/options-white3.jpeg'
        ],
        description: 'Estampa exclusiva com arte clássica. Algodão premium com toque macio e resistente. Uma peça que conta uma história.',
        details: ['100% Algodão', 'Estampa Silk', 'Caimento Oversized', 'Produzido no Brasil']
    },
    {
        id: 'stay-hard-tee',
        name: 'Stay Hard Tee',
        price: 149.90,
        category: 'oversized',
        tagline: 'Stay hard.',
        isNew: false,
        isSoldOut: false,
        isFeatured: true,
        colors: [{ name: 'Branco', hex: '#f5f5f0' }],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: [],
        images: [
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop'
        ],
        description: 'Uma declaração de resistência. Estampa em preto de alta definição sobre algodão premium branco.',
        details: ['100% Algodão', 'Estampa Silk', 'Lavagem a frio']
    },
    {
        id: 'dk-essential-tee',
        name: 'DK Essential Tee',
        price: 129.90,
        category: 'regular',
        tagline: 'The essential.',
        isNew: false,
        isSoldOut: false,
        isFeatured: false,
        colors: [
            { name: 'Preto', hex: '#111111' },
            { name: 'Branco', hex: '#f5f5f0' }
        ],
        sizes: ['P', 'M', 'G', 'GG'],
        sizesOutOfStock: [],
        images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200&auto=format&fit=crop'
        ],
        description: 'A camiseta essencial da DREVIK. Logo DK bordada no peito. Perfeita para o dia a dia.',
        details: ['100% Algodão', 'Logo Bordada', 'Caimento Regular']
    },
    {
        id: 'phase-one-tee',
        name: 'Phase One Tee',
        price: 159.90,
        category: 'oversized',
        tagline: 'Phase one begins here.',
        isNew: true,
        isSoldOut: false,
        isFeatured: true,
        colors: [{ name: 'Preto', hex: '#111111' }],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: [],
        images: [
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop'
        ],
        description: 'A peça que marca o início da jornada. Estampa exclusiva Phase One com arte digital em alta definição.',
        details: ['100% Algodão', 'Estampa DTF', 'Caimento Oversized']
    },
    {
        id: 'oversized-black-tee',
        name: 'Oversized Black Tee',
        price: 149.90,
        category: 'oversized',
        tagline: 'Drevik.',
        isNew: false,
        isSoldOut: true,
        isFeatured: false,
        colors: [{ name: 'Preto', hex: '#111111' }],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: ['P', 'M', 'G', 'GG', 'XG'],
        images: [
            'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop'
        ],
        description: 'Básica com assinatura. Logo Drevik em script bordado no peito. O preto perfeito.',
        details: ['100% Algodão', 'Logo Bordada', 'Caimento Oversized']
    },
    {
        id: 'dress-code-tee',
        name: 'Dress Code Tee',
        price: 139.90,
        category: 'regular',
        tagline: 'Dress code.',
        isNew: false,
        isSoldOut: false,
        isFeatured: false,
        colors: [{ name: 'Branco', hex: '#f5f5f0' }],
        sizes: ['P', 'M', 'G', 'GG'],
        sizesOutOfStock: [],
        images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop'],
        description: 'Para quem entende que vestir-se bem é um código. Algodão macio com toque premium.',
        details: ['100% Algodão', 'Caimento Regular', 'Lavagem a frio']
    },
    {
        id: 'manifesto-tee',
        name: 'Manifesto Tee',
        price: 159.90,
        category: 'oversized',
        tagline: 'Armour.',
        isNew: true,
        isSoldOut: false,
        isFeatured: false,
        colors: [{ name: 'Preto', hex: '#111111' }],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: [],
        images: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop'],
        description: 'A peça-manifesto da coleção. Uma armadura para o dia a dia.',
        details: ['100% Algodão', 'Estampa Silk', 'Caimento Oversized']
    }
];