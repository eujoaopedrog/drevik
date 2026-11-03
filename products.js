// =========================================
// BANCO DE DADOS DE PRODUTOS - DREVIK
// =========================================
// A ordem do array é a ordem do percurso da coleção (etapa 1 a 4).
// printSide indica o lado da camiseta onde está a estampa principal.
const PRODUCTS = [
    {
        id: 'phase-one-tee',
        name: 'Phase One Tee',
        price: 159.90,
        category: 'oversized',
        tagline: 'Phase one begins here.',
        step: 'Começar',
        story: 'Existe um momento em que a decisão de mudar se torna maior do que o medo de começar.',
        printSide: 'costas',
        isNew: true,
        isSoldOut: false,
        colors: [{ name: 'Preto', hex: '#111111' }],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: [],
        images: {
            frente: { src: 'img/colecao/phase-one-frente-modelo.webp', alt: 'Phase One Tee - frente no modelo' },
            costas: { src: 'img/colecao/phase-one-costas-modelo.webp', alt: 'Phase One Tee - costas no modelo, com a estampa da porta iluminada' },
            frenteFlat: { src: 'img/colecao/phase-one-frente.webp', alt: 'Phase One Tee - frente da peça' },
            costasFlat: { src: 'img/colecao/phase-one-costas.webp', alt: 'Phase One Tee - costas da peça' }
        },
        description: [
            'Toda transformação começa antes de ser percebida. Existe um momento em que a decisão de mudar se torna maior do que o medo de começar.',
            'A estampa retrata uma porta iluminada em meio à escuridão, representando a passagem entre aquilo que fomos e aquilo que ainda podemos nos tornar. A luz simboliza a possibilidade de um novo caminho, enquanto o ambiente escuro representa o desconhecido que acompanha toda mudança.',
            'Phase One marca o início. O primeiro movimento de uma jornada construída com intenção, paciência e propósito.',
            'Confeccionada em algodão preto, a peça apresenta modelagem oversized e uma composição gráfica que combina contraste, profundidade e iluminação. A estampa centralizada nas costas transforma a ideia de recomeço em um elemento visual marcante, mantendo uma estética urbana e minimalista.'
        ],
        details: ['Modelagem oversized', 'Base preta', 'Estampa centralizada nas costas']
    },
    {
        id: 'the-process-tee',
        name: 'The Process Tee',
        price: 149.90,
        oldPrice: 189.90,
        category: 'oversized',
        tagline: 'The process is the only way.',
        step: 'Subir',
        story: 'O caminho nem sempre é linear, mas cada passo tem seu propósito.',
        printSide: 'costas',
        isNew: true,
        isSoldOut: false,
        colors: [{ name: 'Branco', hex: '#f5f5f0' }],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: [],
        images: {
            frente: { src: 'img/colecao/the-process-frente-modelo.webp', alt: 'The Process Tee - frente no modelo' },
            costas: { src: 'img/colecao/the-process-costas-modelo.webp', alt: 'The Process Tee - costas no modelo, com a estampa da montanha sinuosa' },
            frenteFlat: { src: 'img/colecao/the-process-frente.webp', alt: 'The Process Tee - frente da peça' },
            costasFlat: { src: 'img/colecao/the-process-costas.webp', alt: 'The Process Tee - costas da peça' }
        },
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
        step: 'Cicatrizar',
        story: 'Nenhuma fase é permanente. Cada experiência constrói uma nova versão de nós mesmos.',
        printSide: 'costas',
        isNew: true,
        isSoldOut: false,
        colors: [{ name: 'Preto', hex: '#111111' }],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: ['P'],
        images: {
            frente: { src: 'img/colecao/every-scar-frente-modelo.webp', alt: 'Every Scar Tee - frente no modelo' },
            costas: { src: 'img/colecao/every-scar-costas-modelo.webp', alt: 'Every Scar Tee - costas no modelo, com a estampa da figura diante do espelho' },
            frenteFlat: { src: 'img/colecao/every-scar-frente.webp', alt: 'Every Scar Tee - frente da peça' },
            costasFlat: { src: 'img/colecao/every-scar-costas.webp', alt: 'Every Scar Tee - costas da peça' }
        },
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
        step: 'Ficar de pé',
        story: 'Aquilo que permanece de pé mesmo depois das provações.',
        printSide: 'frente',
        isNew: false,
        isSoldOut: false,
        colors: [{ name: 'Branco', hex: '#f5f5f0' }],
        sizes: ['P', 'M', 'G', 'GG', 'XG'],
        sizesOutOfStock: [],
        images: {
            frente: { src: 'img/colecao/stay-hard-frente-modelo.webp', alt: 'Stay Hard Tee - frente no modelo, com a estampa da figura sobre as ruínas' },
            costas: { src: 'img/colecao/stay-hard-costas-modelo.webp', alt: 'Stay Hard Tee - costas no modelo' },
            frenteFlat: { src: 'img/colecao/stay-hard-frente.webp', alt: 'Stay Hard Tee - frente da peça' },
            costasFlat: { src: 'img/colecao/stay-hard-costas.webp', alt: 'Stay Hard Tee - costas da peça' }
        },
        description: [
            'Evoluir exige mais do que vontade. Exige disciplina para continuar quando a motivação desaparece e força para permanecer firme diante das dificuldades.',
            'A estampa representa uma figura imponente entre ruínas, simbolizando aquilo que permanece de pé mesmo depois das provações. Stay Hard é um lembrete de que a verdadeira força não está em nunca enfrentar obstáculos, mas em desenvolver a capacidade de atravessá-los sem abandonar o próprio propósito.',
            'A Stay Hard combina uma base off white com uma estampa gráfica de inspiração grega e estética vintage. Sua modelagem regular cria uma silhueta ideal e contemporânea, enquanto a composição visual reforça a identidade da peça. Desenvolvida para quem entende que consistência e evolução caminham juntas.'
        ],
        details: ['Modelagem regular', 'Base off white', 'Estampa gráfica de inspiração grega']
    }
];
