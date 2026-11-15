/**
 * Configuração do site: navegação, perfis externos e metadados.
 * Dados pessoais (autor) ficam em src/data/profile.json.
 */
import profile from './profile.json';
import type { UIKey } from '../i18n/ui';
import { ROUTES, studyAreaPath } from '../lib/routes';
import { AREAS, type Area } from '../lib/taxonomy';

export const SITE = {
  title: 'Cero',
  /** Frase curta que acompanha o nome. */
  tagline: 'Software, dados, computação e estudos',
  /** Descrição padrão usada quando a página não define uma. */
  description:
    'Cero reúne assuntos e informações sobre desenvolvimento de software, engenharia de dados e analytics, ciência da computação e estudos.',
  /** Temas do site, exibidos na página inicial. */
  topics: [
    { icon: 'code', title: 'Desenvolvimento de software', text: 'Arquitetura, boas práticas, APIs, integrações e ferramentas para construir sistemas.' },
    { icon: 'database', title: 'Engenharia de dados e analytics', text: 'Pipelines, modelagem, governança, BI e análise de dados para apoiar decisões.' },
    { icon: 'cpu', title: 'Ciência da computação', text: 'Algoritmos, estruturas de dados, inteligência artificial e fundamentos da computação.' },
    { icon: 'book', title: 'Estudos', text: 'Anotações, resumos, trilhas de aprendizado e materiais de referência.' },
  ],
  locale: 'pt_BR',
  /** Imagem padrão para compartilhamento (1200×630), em public/. */
  ogImage: '/og-default.png',
  /** Comentários com Giscus (futuro): preencha e ative em BlogPost.astro. */
  giscus: { enabled: false, repo: '', repoId: '', category: '', categoryId: '' },
  /** Analytics (futuro): ex. { provider: 'plausible', domain: '...' }. Desligado por padrão. */
  analytics: null as null | { provider: string; domain: string },
};

/**
 * Menu principal. Itens com `children` viram submenus (suspensos no desktop, recolhíveis no celular).
 * `auto` acrescenta, no build, os itens que vêm do conteúdo (ver src/lib/nav.ts):
 *   - 'news-years': um item por ano de Notícias, com as notícias daquele ano;
 *   - 'ideas': as publicações mais recentes;
 *   - 'study-area': os estudos mais recentes da área indicada em `area`.
 * Assim, um ano novo (ex.: 2027) entra no menu sem editar este arquivo.
 */
export type NavAuto = 'news-years' | 'ideas' | 'study-area';
export interface NavItem {
  key: UIKey;
  href: string;
  children?: NavItem[];
  auto?: NavAuto;
  area?: Area;
}

export const NAV: NavItem[] = [
  {
    key: 'nav.newsIdeas',
    href: ROUTES.newsIdeas,
    children: [
      { key: 'nav.news', href: ROUTES.news, auto: 'news-years' },
      { key: 'nav.ideas', href: ROUTES.ideas, auto: 'ideas' },
    ],
  },
  {
    key: 'nav.studies',
    href: ROUTES.studies,
    children: (Object.keys(AREAS) as Area[]).map((area) => ({
      key: `area.${area}` as UIKey,
      href: studyAreaPath(area),
      auto: 'study-area',
      area,
    })),
  },
  { key: 'nav.articles', href: ROUTES.articles },
  {
    key: 'nav.aboutMenu',
    href: '/sobre/',
    children: [
      { key: 'nav.aboutMe', href: '/sobre/' },
      { key: 'nav.cv', href: '/curriculo/' },
      { key: 'nav.projects', href: '/projetos/' },
      { key: 'nav.skills', href: '/competencias/' },
      { key: 'nav.contact', href: '/contato/' },
    ],
  },
];

export type SocialKey = keyof typeof profile.social;

export const SOCIAL_META: Record<SocialKey, { label: string; icon: string }> = {
  github: { label: 'GitHub', icon: 'github' },
  linkedin: { label: 'LinkedIn', icon: 'linkedin' },
  orcid: { label: 'ORCID', icon: 'orcid' },
  scholar: { label: 'Google Scholar', icon: 'scholar' },
  researchgate: { label: 'ResearchGate', icon: 'researchgate' },
  lattes: { label: 'Currículo Lattes', icon: 'lattes' },
  x: { label: 'X (Twitter)', icon: 'x-brand' },
};

/** Apenas perfis preenchidos em profile.json. */
export function socialLinks(keys?: SocialKey[]) {
  const all = Object.entries(profile.social) as [SocialKey, string][];
  return all
    .filter(([k, url]) => url && (!keys || keys.includes(k)))
    .map(([k, url]) => ({ key: k, url, ...SOCIAL_META[k] }));
}

export { profile };
