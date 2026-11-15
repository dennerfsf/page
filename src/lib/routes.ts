/**
 * Rotas do site em um só lugar. As funções devolvem caminhos SEM o base path;
 * use `withBase()` (links) ou `absoluteUrl()` (canonical, RSS, JSON-LD) de ./url.ts ao renderizar.
 */
import type { Post, Publication } from './content';
import type { Crumb } from './seo';
import { AREAS, SECOES, slugify, type Area } from './taxonomy';

export const ROUTES = {
  newsIdeas: '/noticias-e-ideias/',
  news: '/noticias-e-ideias/noticias/',
  ideas: '/noticias-e-ideias/publicacoes/',
  studies: '/estudos/',
  articles: '/artigos/',
  categories: '/categorias/',
  tags: '/tags/',
} as const;

export const newsYearPath = (year: number | string) => `${ROUTES.news}${year}/`;
export const studyAreaPath = (area: Area) => `${ROUTES.studies}${area}/`;
export const categoryPath = (category: string) => `${ROUTES.categories}${slugify(category)}/`;
export const tagPath = (tag: string) => `${ROUTES.tags}${slugify(tag)}/`;
export const articlePath = (pub: Publication) => `${ROUTES.articles}${pub.id}/`;

/** Ano de uma notícia (UTC, igual ao exibido nas datas). */
export const postYear = (post: Post) => post.data.date.getUTCFullYear();

/** URL de um texto da coleção `blog`, conforme a seção. */
export function postPath(post: Post): string {
  const d = post.data;
  switch (d.secao) {
    case 'noticias':
      return `${newsYearPath(postYear(post))}${post.id}/`;
    case 'publicacoes':
      return `${ROUTES.ideas}${post.id}/`;
    case 'estudos':
      return `${studyAreaPath(d.area)}${post.id}/`;
  }
}

/** Trilha (breadcrumb) até a lista que contém o texto — sem a página inicial e sem o próprio texto. */
export function sectionCrumbs(post: Post): Crumb[] {
  const d = post.data;
  switch (d.secao) {
    case 'noticias':
      return [
        { label: 'Notícias e ideias', href: ROUTES.newsIdeas },
        { label: SECOES.noticias, href: ROUTES.news },
        { label: String(postYear(post)), href: newsYearPath(postYear(post)) },
      ];
    case 'publicacoes':
      return [
        { label: 'Notícias e ideias', href: ROUTES.newsIdeas },
        { label: SECOES.publicacoes, href: ROUTES.ideas },
      ];
    case 'estudos':
      return [
        { label: SECOES.estudos, href: ROUTES.studies },
        { label: AREAS[d.area], href: studyAreaPath(d.area) },
      ];
  }
}
