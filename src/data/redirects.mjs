/**
 * URLs antigas → novas (reestruturação da navegação, nov/2026).
 * Usado em astro.config.mjs (`redirects`, gera páginas estáticas de redirecionamento)
 * e em scripts/check-links.mjs (garante que cada destino existe).
 * Caminhos sem o base path: o Astro o acrescenta no build.
 *
 * Os textos e publicações de exemplo foram removidos; suas URLs levam à lista da seção.
 */

const OLD_POSTS = ['introducao-data-mesh', 'governanca-de-dados-na-pratica', 'llms-em-pipelines-de-dados'];
const OLD_PUBLICATIONS = ['exemplo-artigo-periodico', 'exemplo-trabalho-evento'];
const OLD_CATEGORIES = ['data-mesh', 'governanca-de-dados', 'inteligencia-artificial'];
const OLD_TAGS = [
  'arquitetura',
  'catalogo',
  'data-mesh',
  'engenharia-de-dados',
  'governanca',
  'ia-generativa',
  'llm',
  'produtos-de-dados',
  'python',
  'qualidade-de-dados',
  'sql',
];

/** @type {Record<string, string>} */
export const REDIRECTS = {
  '/blog': '/noticias-e-ideias/',
  ...Object.fromEntries(OLD_POSTS.map((slug) => [`/blog/${slug}`, '/noticias-e-ideias/publicacoes/'])),
  ...Object.fromEntries(OLD_CATEGORIES.map((slug) => [`/blog/categoria/${slug}`, '/categorias/'])),
  ...Object.fromEntries(OLD_TAGS.map((slug) => [`/blog/tag/${slug}`, '/tags/'])),
  '/publicacoes': '/artigos/',
  ...Object.fromEntries(OLD_PUBLICATIONS.map((slug) => [`/publicacoes/${slug}`, '/artigos/'])),
};
