/**
 * Resolve o menu de src/data/site.ts em uma árvore pronta para renderizar,
 * acrescentando os itens que vêm do conteúdo (anos de Notícias, textos recentes).
 */
import { NAV, type NavItem } from '../data/site';
import { t, type Lang } from '../i18n/ui';
import { getPosts, newsYears, type Post } from './content';
import { newsYearPath, postPath, postYear } from './routes';

export interface NavNode {
  label: string;
  href: string;
  children?: NavNode[];
}

/** Quantos textos aparecem em cada grupo do menu (o restante fica na página da seção). */
export const MENU_POST_LIMIT = 5;

const postNodes = (posts: Post[]): NavNode[] =>
  posts.slice(0, MENU_POST_LIMIT).map((p) => ({ label: p.data.title, href: postPath(p) }));

export async function buildNav(lang: Lang = 'pt-BR'): Promise<NavNode[]> {
  const tr = t(lang);
  const posts = await getPosts();
  const news = posts.filter((p) => p.data.secao === 'noticias');

  function resolve(item: NavItem): NavNode {
    const node: NavNode = { label: tr(item.key), href: item.href };
    let children = item.children?.map(resolve);
    if (item.auto === 'news-years') {
      children = newsYears(news).map((year) => {
        const ofYear = postNodes(news.filter((p) => postYear(p) === year));
        return { label: String(year), href: newsYearPath(year), children: ofYear.length ? ofYear : undefined };
      });
    } else if (item.auto === 'ideas') {
      children = postNodes(posts.filter((p) => p.data.secao === 'publicacoes'));
    } else if (item.auto === 'study-area') {
      children = postNodes(posts.filter((p) => p.data.secao === 'estudos' && p.data.area === item.area));
    }
    if (children?.length) node.children = children;
    return node;
  }

  return NAV.map(resolve);
}

/** Verdadeiro se a página atual está no item ou em qualquer descendente. */
export function containsPath(node: NavNode, isActive: (href: string) => boolean): boolean {
  return isActive(node.href) || (node.children ?? []).some((c) => containsPath(c, isActive));
}
