import { profile, socialLinks, SITE } from '../data/site';
import { absoluteUrl } from './url';

type JsonLd = Record<string, unknown>;

export interface Crumb {
  label: string;
  href: string;
}

export function personLd(site: URL | undefined): JsonLd {
  return {
    '@type': 'Person',
    '@id': `${absoluteUrl('/', site)}#person`,
    name: profile.name,
    jobTitle: profile.headline.pt,
    description: profile.summary.pt,
    url: absoluteUrl('/', site),
    ...(profile.photo ? { image: absoluteUrl(profile.photo, site) } : {}),
    ...(profile.email ? { email: `mailto:${profile.email}` } : {}),
    sameAs: socialLinks().map((s) => s.url),
    knowsAbout: profile.expertise.map((e) => e.title.pt),
  };
}

export function websiteLd(site: URL | undefined): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': `${absoluteUrl('/', site)}#website`,
    name: SITE.title,
    description: SITE.description,
    url: absoluteUrl('/', site),
    inLanguage: 'pt-BR',
    author: { '@id': `${absoluteUrl('/', site)}#person` },
  };
}

export function breadcrumbLd(crumbs: Crumb[], site: URL | undefined): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: absoluteUrl(c.href, site),
    })),
  };
}

export function blogPostingLd(
  args: { title: string; description: string; url: string; date: Date; updated?: Date; image?: string; tags: string[]; category: string },
  site: URL | undefined,
): JsonLd {
  return {
    '@type': 'BlogPosting',
    headline: args.title,
    description: args.description,
    url: args.url,
    mainEntityOfPage: args.url,
    datePublished: args.date.toISOString(),
    dateModified: (args.updated ?? args.date).toISOString(),
    inLanguage: 'pt-BR',
    articleSection: args.category,
    keywords: args.tags.join(', '),
    ...(args.image ? { image: args.image } : {}),
    author: { '@id': `${absoluteUrl('/', site)}#person`, '@type': 'Person', name: profile.name },
    publisher: { '@id': `${absoluteUrl('/', site)}#person` },
  };
}

export function scholarlyArticleLd(
  args: { title: string; authors: string[]; year: number; venue: string; doi?: string; url: string; keywords: string[]; abstract?: string },
): JsonLd {
  return {
    '@type': 'ScholarlyArticle',
    headline: args.title,
    name: args.title,
    author: args.authors.map((name) => ({ '@type': 'Person', name })),
    datePublished: String(args.year),
    isPartOf: { '@type': 'PublicationIssue', name: args.venue },
    keywords: args.keywords.join(', '),
    url: args.url,
    ...(args.abstract ? { abstract: args.abstract } : {}),
    ...(args.doi ? { sameAs: `https://doi.org/${args.doi}`, identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: args.doi } } : {}),
  };
}

/** Agrupa os blocos em um único grafo JSON-LD. */
export function graph(...nodes: (JsonLd | null | undefined)[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) }).replace(/</g, '\\u003c');
}
