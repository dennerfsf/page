/**
 * Taxonomias do site. Para criar uma nova categoria, adicione-a aqui:
 * o schema das coleções, os filtros e as páginas de categoria são gerados a partir destas listas.
 */

export const BLOG_CATEGORIES = [
  'Inteligência Artificial',
  'Engenharia de Dados',
  'Governança de Dados',
  'Data Mesh',
  'Business Intelligence',
  'Arquitetura de Software',
  'APIs e Microsserviços',
  'DevOps',
  'Ciência e Pesquisa',
  'IoT',
  'Tecnologia e Inovação',
  'Notícias e Atualizações',
] as const;

/**
 * Seções do conteúdo da coleção `blog` (campo `secao` do front matter).
 * Cada seção tem sua área no menu e suas próprias rotas (ver src/lib/routes.ts).
 */
export const SECOES = {
  noticias: 'Notícias',
  publicacoes: 'Publicações',
  estudos: 'Estudos',
} as const;

/** Áreas de Estudos (campo `area`, obrigatório quando `secao: estudos`). */
export const AREAS = {
  engenharias: 'Engenharias',
  fisica: 'Física',
  computacao: 'Computação',
  economia: 'Economia',
} as const;

/**
 * Anos de Notícias que sempre têm página, mesmo sem notícias publicadas.
 * Os demais anos surgem automaticamente a partir das datas das notícias.
 */
export const NEWS_YEARS = [2026] as const;

export const PROJECT_CATEGORIES = [
  'Engenharia de Dados',
  'Business Intelligence',
  'Inteligência Artificial',
  'Desenvolvimento de Software',
  'Integrações e APIs',
  'Automação de Processos',
  'Pesquisa Científica',
  'IoT e Sistemas Embarcados',
] as const;

export const PROJECT_STATUS = {
  'concluido': 'Concluído',
  'em-andamento': 'Em andamento',
  'pausado': 'Pausado',
  'conceito': 'Conceito / estudo',
} as const;

export const PUBLICATION_TYPES = {
  'artigo-periodico': 'Artigo em periódico',
  'artigo-evento': 'Trabalho em evento',
  'capitulo': 'Capítulo de livro',
  'tese': 'Tese',
  'dissertacao': 'Dissertação',
  'tcc': 'Trabalho de conclusão de curso',
  'relatorio': 'Relatório técnico',
  'apresentacao': 'Apresentação / palestra',
} as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
export type Secao = keyof typeof SECOES;
export type Area = keyof typeof AREAS;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export type ProjectStatus = keyof typeof PROJECT_STATUS;
export type PublicationType = keyof typeof PUBLICATION_TYPES;

/** Converte um rótulo em slug de URL: "APIs e Microsserviços" → "apis-e-microsservicos". */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
