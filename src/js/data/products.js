// =========================================
// BANCO DE DADOS DE PRODUTOS - DREVIK
// =========================================
export const PRODUCTS = [
    {
        id: 'the-process-tee',
        name: 'The Process Tee',
        price: 149.90,
        oldPrice: 189.90,
        category: 'oversized',
        tagline: 'The process is the only way.',
        isNew: true,
        isSoldOut: false,
        isFeatured: true,
        colors: [{ name: 'Branco', hex: '#f5f5f0' }],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: [],
        images: [
            {
                src: './colecao/the-process/the-process-frente-modelo.png',
                alt: 'The Process Tee - frente no modelo'
            },
            {
                src: './colecao/the-process/the-process-frente.png',
                alt: 'The Process Tee - frente'
            },
            {
                src: './colecao/the-process/the-process-costa-modelo.png',
                alt: 'The Process Tee - costas no modelo'
            },
            {
                src: './colecao/the-process/the-process-costas.png',
                alt: 'The Process Tee - costas'
            }
        ],
        description: [
            'A evolução não acontece de uma vez. Ela é construída em cada escolha, em cada tentativa e em cada etapa do caminho.',
            'A estampa representa uma montanha sinuosa cercada pela natureza, simbolizando os desafios e as mudanças que fazem parte do crescimento. O caminho nem sempre é linear, mas cada passo tem seu propósito. Para a Drevik, o processo não é apenas parte da conquista — é o que torna a conquista possível.',
            'Confeccionada em algodão, a peça combina conforto, estrutura e uma estética minimalista com referências vintage. A modelagem oversized proporciona um caimento amplo, enquanto a estampa em preto cria contraste com a base off white, trazendo personalidade sem excessos.'
        ],
        details: ['Modelagem oversized', 'Base off white', 'Estampa preta com referências vintage']
    },
    {
        id: 'every-scar-tee',
        name: 'Every Scar Tee',
        price: 149.90,
        category: 'regular',
        tagline: 'Every scar is temporary.',
        isNew: true,
        isSoldOut: false,
        isFeatured: false,
        colors: [{ name: 'Preto', hex: '#111111' }],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: ['P'],
        images: [
            {
                src: './colecao/every-scar/every-scar-frente-modelo.jpg',
                alt: 'Every Scar Tee - frente no modelo'
            },
            {
                src: './colecao/every-scar/every-scar-frente.png',
                alt: 'Every Scar Tee - frente'
            },
            {
                src: './colecao/every-scar/every-scar-costas-modelo.png',
                alt: 'Every Scar Tee - costas no modelo'
            },
            {
                src: './colecao/every-scar/every-scar-costas.png',
                alt: 'Every Scar Tee - costas'
            }
        ],
        description: [
            'A evolução transforma não apenas aquilo que fazemos, mas também quem nos tornamos ao longo do caminho.',
            'A estampa apresenta uma figura marcada pela luta, acompanhada por uma presença sombria que representa os conflitos internos e os desafios que enfrentamos durante o processo. A composição simboliza a relação entre força e vulnerabilidade, lembrando que nenhuma fase é permanente e que cada experiência contribui para a construção de uma nova versão de nós mesmos.',
            'Mais do que resistir, evoluir significa aprender a mudar sem perder a própria essência.',
            'A Every Scar apresenta uma estética dark com referências artísticas e elementos gráficos fortes. A base preta destaca a ilustração monocromática nas costas, criando uma peça de presença visual. A modelagem regular completa a proposta com um caimento perfeito e uma silhueta alinhada ao streetwear contemporâneo.'
        ],
        details: ['Modelagem regular', 'Base preta', 'Ilustração monocromática nas costas']
    },
    {
        id: 'stay-hard-tee',
        name: 'Stay Hard Tee',
        price: 149.90,
        category: 'regular',
        tagline: 'Stay hard.',
        isNew: false,
        isSoldOut: false,
        isFeatured: true,
        colors: [{ name: 'Branco', hex: '#f5f5f0' }],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: [],
        images: [
            {
                src: './colecao/stay-hard/stay-hard-frente-modelo.jpg',
                alt: 'Stay Hard Tee - frente no modelo'
            },
            {
                src: './colecao/stay-hard/stay-hard-frente.png',
                alt: 'Stay Hard Tee - frente'
            },
            {
                src: './colecao/stay-hard/stay-hard-costas-modelo.png',
                alt: 'Stay Hard Tee - costas no modelo'
            },
            {
                src: './colecao/stay-hard/stay-hard-costas.png',
                alt: 'Stay Hard Tee - costas'
            }
        ],
        description: [
            'Evoluir exige mais do que vontade. Exige disciplina para continuar quando a motivação desaparece e força para permanecer firme diante das dificuldades.',
            'A estampa representa uma figura imponente entre ruínas, simbolizando aquilo que permanece de pé mesmo depois das provações. Stay Hard é um lembrete de que a verdadeira força não está em nunca enfrentar obstáculos, mas em desenvolver a capacidade de atravessá-los sem abandonar o próprio propósito.',
            'A Stay Hard combina uma base off white com uma estampa gráfica de inspiração grega e estética vintage. Sua modelagem regular cria uma silhueta ideal e contemporânea, enquanto a composição visual reforça a identidade da peça. Desenvolvida para quem entende que consistência e evolução caminham juntas.'
        ],
        details: ['Modelagem regular', 'Base off white', 'Estampa gráfica de inspiração grega']
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
            {
                src: './colecao/phase-one/phase-one-frente-modelo.jpg',
                alt: 'Phase One Tee - frente no modelo'
            },
            {
                src: './colecao/phase-one/phase-one-frente.png',
                alt: 'Phase One Tee - frente'
            },
            {
                src: './colecao/phase-one/phase-one-costas-modelo.jpg',
                alt: 'Phase One Tee - costas no modelo'
            },
            {
                src: './colecao/phase-one/phase-one-costas.png',
                alt: 'Phase One Tee - costas'
            }
        ],
        description: [
            'Toda transformação começa antes de ser percebida. Existe um momento em que a decisão de mudar se torna maior do que o medo de começar.',
            'A estampa retrata uma porta iluminada em meio à escuridão, representando a passagem entre aquilo que fomos e aquilo que ainda podemos nos tornar. A luz simboliza a possibilidade de um novo caminho, enquanto o ambiente escuro representa o desconhecido que acompanha toda mudança.',
            'Phase One marca o início. O primeiro movimento de uma jornada construída com intenção, paciência e propósito.',
            'Confeccionada em algodão preto, a peça apresenta modelagem oversized e uma composição gráfica que combina contraste, profundidade e iluminação. A estampa centralizada nas costas transforma a ideia de recomeço em um elemento visual marcante, mantendo uma estética urbana e minimalista.'
        ],
        details: ['Modelagem oversized', 'Base preta', 'Estampa centralizada nas costas']
    }
];
