# Screenshots da navegação

Capturas da reestruturação da navegação (branch `feat/nova-estrutura-navegacao`, nov/2026).
Salvo indicação, vêm do **build de produção** (`npm run build`), em que os rascunhos não aparecem.
Os arquivos com sufixo `-dev` vêm do `npm run dev`, em que os dois rascunhos iniciais aparecem e o menu mostra os três níveis completos.

Desktop: 1366 × 768. Celular: 390 × 844 (densidade 2×).

## `menu/desktop/`

| Arquivo | O que mostra |
| --- | --- |
| `01-noticias-e-ideias-claro.png` | Submenu Notícias e ideias › Notícias › 2026 e Publicações (tema claro) |
| `02-noticias-e-ideias-escuro.png` | O mesmo submenu no tema escuro |
| `03-estudos-claro.png` | Submenu Estudos com as 4 áreas |
| `04-sobre-claro.png` | Submenu Sobre (Sobre mim, Currículo, Projetos, Competências, Contato) |
| `05-tres-niveis-com-rascunhos-dev.png` | Três níveis com conteúdo: Notícias › 2026 › título e Publicações › título |

## `menu/celular/`

| Arquivo | O que mostra |
| --- | --- |
| `01-menu-aberto-claro.png` | Menu aberto com os submenus recolhidos |
| `02-submenu-noticias-e-ideias-escuro.png` | Submenu Notícias e ideias expandido (tema escuro) |
| `03-submenu-estudos-claro.png` | Submenu Estudos expandido |
| `04-tres-niveis-com-rascunhos-dev.png` | Três níveis com os rascunhos |

## `paginas/`

| Arquivo | Página |
| --- | --- |
| `01-noticias-e-ideias.png` | `/noticias-e-ideias/` — visão geral |
| `02-noticias-por-ano.png` | `/noticias-e-ideias/noticias/` — agrupamento por ano |
| `03-noticias-2026.png` | `/noticias-e-ideias/noticias/2026/` — página do ano |
| `04-publicacoes.png` | `/noticias-e-ideias/publicacoes/` |
| `05-estudos.png` | `/estudos/` — as 4 áreas |
| `06-estudos-fisica-em-breve.png` | `/estudos/fisica/` — estado vazio "Em breve" |
| `07-artigos.png` | `/artigos/` |
| `08-noticia-2026-rascunho-dev.png` | Notícia de 2026 (rascunho) com a trilha completa |

Para gerar de novo, rode o build e o `npm run dev` e capture as mesmas páginas; os nomes seguem `NN-assunto-tema.png`.
