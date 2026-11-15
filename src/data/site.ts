/**
 * Configuração do site: navegação, perfis externos e metadados.
 * Dados pessoais (autor) ficam em src/data/profile.json.
 */
import profile from './profile.json';
import type { UIKey } from '../i18n/ui';

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

export const NAV: { key: UIKey; href: string }[] = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.about', href: '/sobre/' },
  { key: 'nav.cv', href: '/curriculo/' },
  { key: 'nav.projects', href: '/projetos/' },
  { key: 'nav.blog', href: '/blog/' },
  { key: 'nav.publications', href: '/publicacoes/' },
  { key: 'nav.skills', href: '/competencias/' },
  { key: 'nav.contact', href: '/contato/' },
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
