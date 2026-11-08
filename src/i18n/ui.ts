/**
 * Textos de interface por idioma.
 * Português é o idioma principal; o inglês já é usado pelo currículo em /en/resume/.
 * Para traduzir uma nova página, adicione as chaves aqui e use `t(lang)`.
 */

export const LANGS = ['pt-BR', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'pt-BR';

const pt = {
  'site.skip': 'Pular para o conteúdo',
  'nav.home': 'Início',
  'nav.about': 'Sobre',
  'nav.cv': 'Currículo',
  'nav.projects': 'Projetos',
  'nav.blog': 'Blog',
  'nav.publications': 'Publicações',
  'nav.skills': 'Competências',
  'nav.contact': 'Contato',
  'nav.search': 'Buscar',
  'nav.menu': 'Abrir menu',
  'nav.close': 'Fechar menu',
  'nav.main': 'Navegação principal',
  'theme.toggle': 'Alternar tema claro/escuro',
  'breadcrumb.label': 'Você está em',
  'top.back': 'Voltar ao topo',
  'demo.badge': 'Exemplo',
  'demo.title': 'Conteúdo demonstrativo — substitua por informações reais.',
  'cv.title': 'Currículo',
  'cv.summary': 'Resumo profissional',
  'cv.experience': 'Experiência profissional',
  'cv.education': 'Formação acadêmica',
  'cv.certifications': 'Certificações',
  'cv.skills': 'Competências técnicas',
  'cv.languages': 'Idiomas',
  'cv.publications': 'Publicações',
  'cv.projects': 'Projetos relevantes',
  'cv.download': 'Baixar PDF',
  'cv.print': 'Imprimir',
  'cv.switch': 'English version',
  'cv.present': 'atual',
  'cv.contact': 'Contato',
  'footer.rights': 'Todos os direitos reservados.',
  'footer.built': 'Site estático construído com Astro e publicado no GitHub Pages.',
} as const;

export type UIKey = keyof typeof pt;

const en: Partial<Record<UIKey, string>> = {
  'site.skip': 'Skip to content',
  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.cv': 'Resume',
  'nav.projects': 'Projects',
  'nav.blog': 'Blog',
  'nav.publications': 'Publications',
  'nav.skills': 'Skills',
  'nav.contact': 'Contact',
  'nav.search': 'Search',
  'nav.menu': 'Open menu',
  'nav.close': 'Close menu',
  'nav.main': 'Main navigation',
  'theme.toggle': 'Toggle light/dark theme',
  'breadcrumb.label': 'You are here',
  'top.back': 'Back to top',
  'demo.badge': 'Sample',
  'demo.title': 'Sample content — replace with real information.',
  'cv.title': 'Resume',
  'cv.summary': 'Professional summary',
  'cv.experience': 'Professional experience',
  'cv.education': 'Education',
  'cv.certifications': 'Certifications',
  'cv.skills': 'Technical skills',
  'cv.languages': 'Languages',
  'cv.publications': 'Publications',
  'cv.projects': 'Selected projects',
  'cv.download': 'Download PDF',
  'cv.print': 'Print',
  'cv.switch': 'Versão em português',
  'cv.present': 'present',
  'cv.contact': 'Contact',
  'footer.rights': 'All rights reserved.',
  'footer.built': 'Static site built with Astro and hosted on GitHub Pages.',
};

const dictionaries: Record<Lang, Partial<Record<UIKey, string>>> = { 'pt-BR': pt, en };

export function t(lang: Lang = DEFAULT_LANG) {
  return (key: UIKey): string => dictionaries[lang][key] ?? pt[key];
}
