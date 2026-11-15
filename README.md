# Cero — software, dados, computação e estudos

Site estático que reúne **notícias e ideias, estudos e artigos** sobre desenvolvimento de software, engenharia de dados e analytics, ciência da computação e estudos, além da parte pessoal do autor (**sobre, currículo web + PDF, projetos**), publicado gratuitamente no **GitHub Pages**. Todo o conteúdo é editado por arquivos no próprio repositório: um commit na branch `main` publica o site automaticamente.

- **Endereço padrão:** https://dennerfsf.github.io/page/
- **Sem servidor, banco de dados nem serviços pagos:** o HTML é gerado no build.

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Tecnologias](#2-tecnologias)
3. [Requisitos](#3-requisitos)
4. [Instalação](#4-instalação)
5. [Execução local](#5-execução-local)
6. [Build de produção e validação](#6-build-de-produção-e-validação)
7. [Tarefas comuns: publicar uma notícia, publicação, estudo ou artigo](#7-tarefas-comuns-publicar-uma-notícia-publicação-estudo-ou-artigo)
8. [Como adicionar um projeto](#8-como-adicionar-um-projeto)
9. [Como atualizar o currículo](#9-como-atualizar-o-currículo)
10. [Como inserir uma publicação científica](#10-como-inserir-uma-publicação-científica)
11. [Como substituir imagens](#11-como-substituir-imagens)
12. [Como configurar os links profissionais](#12-como-configurar-os-links-profissionais)
13. [Como publicar no GitHub Pages](#13-como-publicar-no-github-pages)
14. [Como configurar domínio personalizado](#14-como-configurar-domínio-personalizado)
15. [Como atualizar o site após a publicação](#15-como-atualizar-o-site-após-a-publicação)
16. [Estrutura do projeto](#16-estrutura-do-projeto)
17. [Conteúdo demonstrativo](#17-conteúdo-demonstrativo)
18. [Evoluções futuras](#18-evoluções-futuras)

---

## 1. Visão geral

| Página | URL | Fonte do conteúdo |
| --- | --- | --- |
| Início | `/` | `src/data/profile.json` + coleções |
| Sobre (linha do tempo) | `/sobre/` | `profile.json`, `experience.json`, `education.json` |
| Currículo (pt / en) + PDF | `/curriculo/`, `/en/resume/` | `src/data/*.json` + projetos e publicações |
| Projetos | `/projetos/` e `/projetos/<slug>/` | `src/content/projects/*.md` |
| Notícias e ideias | `/noticias-e-ideias/`, `/noticias-e-ideias/noticias/<ano>/<slug>/`, `/noticias-e-ideias/publicacoes/<slug>/` | `src/content/blog/` (`secao: noticias` / `publicacoes`) |
| Estudos | `/estudos/`, `/estudos/<area>/<slug>/` | `src/content/blog/` (`secao: estudos` + `area`) |
| Artigos (produção científica) | `/artigos/` e `/artigos/<slug>/` | `src/content/publications/*.md` + `research.json` |
| Categorias e tags | `/categorias/…`, `/tags/…` | geradas a partir de `category` e `tags` |
| Competências | `/competencias/` | `skills.json`, `certifications.json`, `languages.json` |
| Contato | `/contato/` | `profile.json` |
| Busca | `/busca/` | índice estático gerado pelo Pagefind |

Recursos incluídos: tema claro/escuro com preferência salva, menu responsivo, breadcrumbs, barra de progresso de leitura, sumário do artigo, voltar ao topo, busca por título e conteúdo, filtros por categoria/tag, ordenação, artigos relacionados, compartilhamento (LinkedIn, X, WhatsApp, e-mail, copiar link), destaque de sintaxe, diagramas Mermaid, RSS, sitemap, robots.txt, Open Graph/Twitter Cards, JSON-LD (`Person`, `WebSite`, `BlogPosting`, `ScholarlyArticle`, `BreadcrumbList`), metadados `citation_*` para o Google Scholar e BibTeX das publicações.

## 2. Tecnologias

| Ferramenta | Uso |
| --- | --- |
| [Astro 7](https://astro.build) | Framework de site estático, Content Collections, otimização de imagens e fontes |
| TypeScript | Tipagem de componentes, dados e schemas |
| Tailwind CSS 4 + Typography | Estilos e tipografia dos artigos |
| Markdown / MDX | Artigos, projetos e publicações |
| Shiki | Destaque de sintaxe no build (sem JavaScript no cliente) |
| Mermaid | Diagramas (carregado sob demanda, apenas em páginas que os usam) |
| Pagefind | Busca full-text estática |
| Playwright Core | Geração do PDF do currículo e testes no navegador |
| GitHub Actions + Pages | Integração e publicação contínuas |

**Decisões principais**

- **Astro** gera HTML puro; o JavaScript do cliente se resume a pequenas melhorias progressivas (tema, menu, filtros). O site funciona com JS desativado, exceto filtros e busca.
- **Conteúdo separado da apresentação:** dados em `src/data/*.json` e coleções em `src/content/`, validados por schema (`src/content.config.ts`). Um campo errado quebra o build com uma mensagem clara, em vez de publicar algo inconsistente.
- **PDF a partir da mesma página:** o PDF do currículo é renderizado a partir de `/curriculo/` com a folha de impressão — web e PDF nunca divergem.
- **Base path automático:** todos os links passam por `withBase()` (`src/lib/url.ts`), e o workflow obtém o endereço e o base path do próprio GitHub Pages.
- **Sem dados inventados:** itens não confirmados ficam marcados com `"demo": true` e exibem o selo **Exemplo**.

## 3. Requisitos

- **Node.js ≥ 22.23.4** (recomendado: Node 24 LTS — veja `.nvmrc`). O Astro 7 recusa versões anteriores.
- **npm** 10 ou superior.
- **Google Chrome, Microsoft Edge ou Chromium** instalado — usado para gerar o PDF do currículo e rodar os testes. Se estiver em um local não padrão, defina `CHROME_PATH`.
- Git.

> Verifique sua versão com `node -v`. Para atualizar: baixe o instalador LTS em https://nodejs.org ou use `nvm install` / `nvm use` (ou `fnm`, `volta`).

## 4. Instalação

```bash
git clone https://github.com/dennerfsf/page.git
cd page
npm install
```

## 5. Execução local

```bash
npm run dev
```

Acesse http://localhost:4321/page/. As alterações aparecem instantaneamente. No modo de desenvolvimento, artigos com `draft: true` são exibidos e a busca de conteúdo completo fica indisponível (o índice é gerado no build).

## 6. Build de produção e validação

```bash
npm run build      # gera dist/: páginas + índice de busca + PDFs do currículo
npm run preview    # serve dist/ em http://localhost:4321/page/
```

| Comando | O que faz |
| --- | --- |
| `npm run check` | Verificação de tipos e de schemas (`astro check`) |
| `npm run build` | Astro build → Pagefind → PDF do currículo |
| `npm run test:links` | Confere se todo link/recurso interno existe e respeita o base path |
| `npm run test:e2e` | Testes no navegador: tema, menu, filtros, busca, PDF, RSS, sitemap, erros de JS |
| `npm run validate` | Executa tudo acima, em sequência |
| `npm run images` | Regenera `public/og-default.png` e `public/apple-touch-icon.png` a partir do nome/título |
| `npm run cv:pdf` | Regenera apenas os PDFs (após um build) |

Para simular localmente o build de um domínio próprio:

```bash
# bash / macOS / Linux
SITE_URL=https://seudominio.com.br BASE_PATH= npm run build
```

```powershell
# PowerShell
$env:SITE_URL="https://seudominio.com.br"; $env:BASE_PATH=""; npm run build
```

Também é possível criar um arquivo `.env` (veja `.env.example`).

## 7. Tarefas comuns: publicar uma notícia, publicação, estudo ou artigo

O menu do site tem três seções de conteúdo: **Notícias e ideias** (Notícias e Publicações), **Estudos** e **Artigos**.
Notícias, publicações e estudos ficam na mesma coleção (`src/content/blog/`), diferenciados pelo campo `secao`; artigos científicos ficam em `src/content/publications/`.

| O que publicar | Pasta | Front matter obrigatório | URL gerada |
| --- | --- | --- | --- |
| Notícia | `src/content/blog/noticias/<ano>/` | `secao: noticias` | `/noticias-e-ideias/noticias/<ano>/<arquivo>/` |
| Publicação (texto técnico ou de opinião) | `src/content/blog/publicacoes/<ano>/` | `secao: publicacoes` | `/noticias-e-ideias/publicacoes/<arquivo>/` |
| Estudo | `src/content/blog/estudos/<area>/` | `secao: estudos` + `area` | `/estudos/<area>/<arquivo>/` |
| Artigo científico | `src/content/publications/` | ver abaixo | `/artigos/<arquivo>/` |

**Notícia, publicação ou estudo**

1. Copie `src/content/blog/_modelo.md` para a pasta da tabela. O nome do arquivo vira o fim da URL e precisa ser **único** em toda a coleção (ex.: `sobre-datamesh-como-comecar.md`). Use `.mdx` se quiser HTML/componentes no texto.
2. Preencha o cabeçalho:

   ```yaml
   ---
   title: "Sobre Datamesh: Como começar"
   description: "Resumo de 1–2 frases (cards, buscadores e redes sociais)."
   date: "2026-11-15"          # nas notícias, o ano desta data define a página do ano
   secao: publicacoes          # noticias | publicacoes | estudos
   # area: computacao          # obrigatório só em estudos: engenharias | fisica | computacao | economia
   category: "Data Mesh"       # uma das BLOG_CATEGORIES de src/lib/taxonomy.ts
   tags:
     - Data Mesh
   cover: ../../../../assets/covers/data-mesh.jpg   # opcional, relativo ao arquivo
   coverAlt: "Diagrama de domínios de dados"        # descreva a imagem
   draft: false                # true = só aparece em `npm run dev`
   featured: false
   ---
   ```

   - O build falha se `secao` faltar, se `area` faltar em um estudo ou se `category` não estiver em `BLOG_CATEGORIES`.
   - A **pasta** só organiza os arquivos; a URL vem de `secao`, `area` e `date`.
   - **Anos novos:** uma notícia com data em 2027 cria a página `/noticias-e-ideias/noticias/2027/` e o item "2027" no menu no próximo build, sem editar o menu. Para manter uma página de ano mesmo sem notícias, inclua o ano em `NEWS_YEARS` (`src/lib/taxonomy.ts`).
   - Sem `cover`, uma arte geométrica é gerada automaticamente.
3. Escreva em Markdown. Recursos suportados: tabelas, citações, imagens, blocos de código com destaque (` ```python `) e diagramas (` ```mermaid `).
4. Rode `npm run dev` para revisar (rascunhos aparecem só aí), mude `draft` para `false`, faça commit e push. Menu, páginas de ano/área, categorias (`/categorias/`), tags (`/tags/`), RSS (notícias e publicações), busca e sitemap são atualizados automaticamente.

**Artigo científico** — veja a [seção 10](#10-como-inserir-uma-publicação-científica).

**Menu:** a estrutura fica em `NAV` (`src/data/site.ts`). Itens com `children` viram submenus; `auto` preenche anos e textos recentes a partir do conteúdo (`src/lib/nav.ts`, até 5 textos por grupo).

**URLs antigas:** os redirecionamentos de `/blog/…` e `/publicacoes/…` estão em `src/data/redirects.mjs`. Ao renomear uma URL publicada, acrescente a antiga ali.

## 8. Como adicionar um projeto

1. Copie `src/content/projects/_modelo.md` para `src/content/projects/nome-do-projeto.md`.
2. Preencha `title`, `summary`, `category` (lista `PROJECT_CATEGORIES`), `technologies`, `status`, `date` e, se houver, `repo`, `demoUrl` e `cover`.
3. Descreva no corpo: contexto e problema, objetivos, arquitetura (pode usar Mermaid) e resultados.
4. `featured: true` coloca o projeto na Home e no currículo.

**Projetos confidenciais:** use `visibility: "private"`. Links de repositório/demonstração são ocultados e um aviso de confidencialidade é exibido. Publique apenas informações autorizadas — nunca credenciais, dados internos, nomes de sistemas, endpoints ou arquiteturas sensíveis.

## 9. Como atualizar o currículo

Os dados ficam em `src/data/` e alimentam ao mesmo tempo o site, o currículo web e o PDF:

| Arquivo | Conteúdo |
| --- | --- |
| `profile.json` | nome, título, resumo, biografia, visão, e-mail, localização, foto, redes, áreas de atuação, pesquisa e interesses |
| `experience.json` | experiências (`start`/`end` no formato `AAAA-MM`; `"end": null` = atual) |
| `education.json` | formação acadêmica |
| `certifications.json` | certificações |
| `languages.json` | idiomas |
| `skills.json` | competências por categoria |
| `research.json` | projetos de pesquisa, grupos e eventos |

**Português e inglês:** qualquer texto pode ser simples (`"Texto"`) ou bilíngue (`{ "pt": "Texto", "en": "Text" }`). Sem tradução, o português é usado. A versão em inglês fica em `/en/resume/`.

Remova `"demo": true` de cada item depois de preenchê-lo com dados reais. O PDF é regenerado automaticamente a cada build — não é preciso editar nenhum arquivo PDF.

## 10. Como inserir uma publicação científica

Publicações científicas aparecem em **Artigos** (`/artigos/`), no currículo e na Home.

1. Copie `src/content/publications/_modelo.md` para um novo arquivo, ex.: `ferreira-2026-governanca.md` (URL: `/artigos/ferreira-2026-governanca/`).
2. Preencha `title`, `type`, `authors`, `year`, `venue`, `keywords` e, quando houver, `doi` (formato `10.xxxx/...`, validado no build), `url` e `pdf`.
3. Escreva o resumo (abstract) no corpo do arquivo.
4. PDFs: coloque o arquivo em `public/papers/` e use `pdf: "/papers/arquivo.pdf"` — **somente se a distribuição for permitida** pela editora.

Projetos de pesquisa, grupos e participações em eventos ficam em `src/data/research.json`. Os dados são inseridos manualmente; o site não depende de APIs externas.

## 11. Como substituir imagens

| Imagem | Onde |
| --- | --- |
| Foto profissional | coloque em `public/images/` (ex.: `perfil.webp`, quadrada, ≥ 400 px) e defina `"photo": "/images/perfil.webp"` em `profile.json` |
| Capas de artigos/projetos | `src/assets/covers/` e referência relativa no cabeçalho (`cover: ../../assets/covers/x.jpg`). O Astro converte para WebP, gera tamanhos responsivos e aplica lazy loading |
| Imagens dentro do texto | `src/assets/...` com caminho relativo em Markdown (`![alt](../../assets/x.png)`), ou `public/images/` |
| Imagem de compartilhamento padrão | `public/og-default.png` (1200×630). Regenere com `npm run images` após mudar nome/título |
| Favicon | `public/favicon.svg` e `public/apple-touch-icon.png` |

Sempre preencha o texto alternativo (`coverAlt` / `![descrição](...)`).

## 12. Como configurar os links profissionais

Em `src/data/profile.json`:

```json
"email": "seu.email@dominio.com",
"location": "Cidade — UF",
"social": {
  "github": "https://github.com/dennerfsf",
  "linkedin": "https://www.linkedin.com/in/seu-perfil",
  "orcid": "https://orcid.org/0000-0000-0000-0000",
  "scholar": "https://scholar.google.com/citations?user=XXXX",
  "researchgate": "https://www.researchgate.net/profile/Seu-Nome",
  "lattes": "http://lattes.cnpq.br/0000000000000000",
  "x": ""
}
```

Campos vazios são ocultados em todo o site (cabeçalho do currículo, Home, rodapé, Contato, Publicações e JSON-LD `sameAs`).

## 13. Como publicar no GitHub Pages

O workflow `.github/workflows/deploy.yml` já está pronto. É preciso ativar o Pages **uma única vez**:

1. Envie o código para o GitHub: `git push origin main`.
2. No repositório, abra **Settings → Pages**.
3. Em **Build and deployment → Source**, selecione **GitHub Actions**.
4. Abra a aba **Actions** e acompanhe o workflow *Build e publicação no GitHub Pages* (ou execute-o em **Run workflow**).
5. Ao final, o site estará em `https://<usuario>.github.io/<repositorio>/` — neste repositório, https://dennerfsf.github.io/page/.

O workflow, a cada push na `main`: instala dependências → verifica tipos → compila → verifica links → roda os testes no navegador → publica. Em pull requests, ele valida sem publicar. Se qualquer etapa falhar, a versão anterior continua no ar.

O endereço e o base path são obtidos automaticamente do GitHub Pages (`actions/configure-pages`), então renomear o repositório não exige mudanças. Para forçar valores, crie as variáveis `SITE_URL` e `BASE_PATH` em **Settings → Secrets and variables → Actions → Variables**.

> Repositório com o nome `<usuario>.github.io` é publicado na raiz (`https://<usuario>.github.io/`); o base path vazio é detectado sozinho.

## 14. Como configurar domínio personalizado

1. No provedor do domínio, crie os registros DNS:
   - **Domínio raiz** (`seudominio.com.br`): registros `A` para `185.199.108.153`, `185.199.109.153`, `185.199.110.153` e `185.199.111.153` (e, opcionalmente, `AAAA` para `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`).
   - **Subdomínio** (`www.seudominio.com.br`): registro `CNAME` apontando para `dennerfsf.github.io`.
2. Em **Settings → Pages → Custom domain**, informe o domínio e salve. Aguarde a verificação do DNS e marque **Enforce HTTPS**.
3. Execute o workflow novamente (push ou **Run workflow**). O GitHub Pages passa a informar o novo endereço com base path vazio, e o build ajusta automaticamente canonical, sitemap, RSS, Open Graph e todos os links.

Com publicação via GitHub Actions, **não é necessário** arquivo `CNAME` no repositório. Recomenda-se verificar o domínio em **Settings (da conta) → Pages** para evitar sequestro de domínio.

## 15. Como atualizar o site após a publicação

Edite os arquivos (diretamente no GitHub ou localmente) e faça commit na `main`:

```bash
git add .
git commit -m "Novo artigo: governança de dados"
git push
```

Em cerca de 1–2 minutos o workflow publica a nova versão. Também é possível editar pelo navegador: abra o arquivo no GitHub, clique no ícone de lápis, edite e use **Commit changes**. Recomenda-se rodar `npm run validate` localmente antes de mudanças grandes.

## 16. Estrutura do projeto

```text
/
├── .github/workflows/deploy.yml   # CI: validação + publicação no Pages
├── public/                        # arquivos copiados como estão (favicon, og-default.png, papers/, images/)
├── scripts/
│   ├── generate-cv-pdf.mjs        # PDF do currículo a partir de dist/
│   ├── generate-images.mjs        # og-default.png e apple-touch-icon.png
│   ├── check-links.mjs            # verificação de links/base path
│   ├── smoke-test.mjs             # testes no navegador
│   ├── static-server.mjs          # servidor estático usado pelos scripts
│   └── browser.mjs                # localiza Chrome/Edge/Chromium
├── src/
│   ├── assets/covers/             # imagens otimizadas no build
│   ├── components/                # Header, Footer, BlogCard, ProjectCard, Resume, Timeline, …
│   ├── content/
│   │   ├── blog/                  # notícias, publicações e estudos (campo `secao`)
│   │   │   ├── noticias/<ano>/
│   │   │   ├── publicacoes/<ano>/
│   │   │   └── estudos/<area>/
│   │   ├── projects/              # projetos
│   │   └── publications/          # artigos (produção científica)
│   ├── content.config.ts          # schemas das coleções
│   ├── data/                      # site.ts (menu), redirects.mjs, profile, experience, skills, … (JSON)
│   ├── i18n/                      # textos de interface (pt-BR / en) e formatação
│   ├── layouts/                   # BaseLayout e PostLayout (página de texto)
│   ├── lib/                       # url (base path), routes (URLs das seções), nav (menu), seo, content, taxonomy, cv
│   ├── pages/                     # rotas (index, noticias-e-ideias/, estudos/, artigos/, categorias/, tags/, sobre, …)
│   ├── scripts/                   # JS do cliente (tema, menu, busca)
│   └── styles/global.css          # tokens de cor, tema, tipografia e impressão
├── astro.config.mjs
└── package.json
```

**Internacionalização:** os textos de interface estão em `src/i18n/ui.ts` e os dados aceitam `{ "pt", "en" }`. Para traduzir outra página, crie-a em `src/pages/en/` passando `lang="en"` ao `BaseLayout`. Não há tradução automática em tempo de execução.

## 17. Conteúdo demonstrativo

Para validar o layout, o site inclui exemplos marcados com o selo **Exemplo** (`demo: true`):

- 4 projetos (1 confidencial) — os textos e publicações científicas de exemplo foram removidos;
- experiências, certificação, idiomas e itens de pesquisa com campos "a informar".

Os títulos, organizações e veículos de publicação de exemplo são fictícios e estão identificados como tal — **nenhum deve ser divulgado como real**. Substitua-os ou apague os arquivos antes de divulgar o site. Para encontrar todos: pesquise por `demo` em `src/`.

## 18. Evoluções futuras

A arquitetura já reserva pontos de extensão, sem implementá-los:

- **Comentários (Giscus):** configure `SITE.giscus` em `src/data/site.ts` e insira o widget no local marcado em `src/layouts/PostLayout.astro`.
- **Analytics:** `SITE.analytics` em `src/data/site.ts` (prefira soluções sem cookies).
- **Séries de artigos:** campo `series` já existe no schema do blog.
- **Palestras, newsletter, dashboard de projetos, GitHub API, CMS baseado em Git (ex.: Decap/Sveltia):** podem ser adicionados como novas coleções/páginas sem alterar as existentes.
