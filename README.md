# drevik
# DREVIK

Loja estática de streetwear da DREVIK, com páginas de coleção e produto, galeria de imagens, carrinho e lista de favoritos.

## Tecnologias

- HTML
- CSS modular
- JavaScript com módulos ES
- Vite para desenvolvimento e build

## Estrutura

```text
.
├── index.html                 # Página inicial
├── shop.html                  # Catálogo e filtros
├── product.html               # Detalhe do produto
├── public/
│   ├── colecao/               # Fotografias dos produtos
│   └── img/                   # Imagens auxiliares
├── src/
│   ├── css/
│   │   ├── base.css           # Reset, variáveis e estilos globais
│   │   ├── layout.css         # Cabeçalho, navegação e estrutura visual
│   │   ├── components.css     # Componentes reutilizáveis
│   │   ├── pages.css          # Seções de página e ajustes responsivos
│   │   └── main.css           # Entrada que importa os módulos CSS
│   └── js/
│       ├── data/products.js   # Catálogo e dados das peças
│       ├── modules/
│       │   ├── storage.js     # Persistência no localStorage
│       │   ├── cart.js        # Carrinho e operações
│       │   ├── wishlist.js    # Lista de favoritos
│       │   ├── catalog.js     # Filtros, ordenação e cartões da loja
│       │   ├── product-page.js # Galeria e detalhes do produto
│       │   ├── ui.js          # Menus, animações, busca e mensagens
│   │   ├── utils.js       # Formatação, imagens responsivas e foco
│   │   └── whatsapp.js    # Montagem dos pedidos para WhatsApp
│       └── main.js            # Entrada JavaScript das três páginas
├── package.json
└── vite.config.js
```

## Desenvolvimento local

Requer Node.js e npm.

```bash
npm install
npm run dev
```

O Vite informa no terminal o endereço local para abrir no navegador.

## Build e pré-visualização

```bash
npm run build
npm run preview
```

O build de produção é gerado em `dist/`. O comando `preview` serve essa pasta localmente para conferir a versão compilada.

## Produtos

Edite `src/js/data/products.js` para adicionar ou atualizar um produto. Cada item define seu identificador, nome, preço, categoria, cores, tamanhos, imagens, descrição e detalhes. As imagens devem ser colocadas em `public/colecao/` e referenciadas a partir da raiz pública, por exemplo:

```js
src: './colecao/the-process/the-process-frente.png'
```

Mantenha o identificador (`id`) único, pois ele é usado nos links das páginas de produto e nos dados salvos no navegador.

## Convenções de nomes

Use `kebab-case` em minúsculas para arquivos e pastas, sem acentos ou espaços. Por exemplo, `Camiseta Preta 1.jpg` deve ser nomeado como `camiseta-preta-1.jpg`.

## Funcionalidades

- Catálogo com filtros e ordenação.
- Página de produto com galeria navegável, variantes e recomendações.
- Seleção de tamanho antes de comprar e atalho para pedido direto via WhatsApp.
- Sacola lateral com quantidades, remoção, subtotal e mensagem de pedido pronta para WhatsApp.
- Wishlist e contadores de itens.
- Persistência de carrinho, wishlist e produtos recentes via `localStorage`.
- Filtros, ordenação, pré-visualização de outra imagem no catálogo e animações acessíveis.
- Imagens responsivas com variantes de resolução para reduzir downloads em telas menores.

O telefone da loja usado para pedidos via WhatsApp é configurado em `src/js/modules/whatsapp.js`. O total enviado considera os produtos; o frete é combinado diretamente com a loja.

## Deploy estático

O projeto não requer servidor de aplicação. Publique o conteúdo de `dist/` em qualquer hospedagem de arquivos estáticos. O build usa caminhos relativos para funcionar também quando publicado em um subdiretório.