import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  AREAS,
  BLOG_CATEGORIES,
  PROJECT_CATEGORIES,
  PROJECT_STATUS,
  PUBLICATION_TYPES,
  type Area,
  type ProjectStatus,
  type PublicationType,
} from './lib/taxonomy';

const areas = Object.keys(AREAS) as [Area, ...Area[]];
const projectStatus = Object.keys(PROJECT_STATUS) as [ProjectStatus, ...ProjectStatus[]];
const publicationTypes = Object.keys(PUBLICATION_TYPES) as [PublicationType, ...PublicationType[]];

/** Idiomas suportados pelo conteúdo. O português é o padrão. */
const lang = z.enum(['pt-BR', 'en']).default('pt-BR');

/**
 * Notícias, publicações e estudos (campo `secao`).
 * Organização sugerida das pastas (a URL vem do front matter, não da pasta):
 *   src/content/blog/noticias/<ano>/<slug>.md      →  /noticias-e-ideias/noticias/<ano>/<slug>/
 *   src/content/blog/publicacoes/<ano>/<slug>.md   →  /noticias-e-ideias/publicacoes/<slug>/
 *   src/content/blog/estudos/<area>/<slug>.md      →  /estudos/<area>/<slug>/
 * O id (slug) é o nome do arquivo, sem as pastas — por isso ele precisa ser único na coleção.
 */
const blog = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\.mdx?$/, '').split('/').pop()!,
  }),
  schema: ({ image }) => {
    const base = z.object({
      title: z.string().max(120),
      description: z.string().max(300),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      category: z.enum(BLOG_CATEGORIES),
      tags: z.array(z.string()).default([]),
      /** Caminho relativo ao arquivo, ex.: ../../../assets/covers/minha-capa.jpg (otimizado no build). */
      cover: image().optional(),
      coverAlt: z.string().default(''),
      author: z.string().optional(),
      /** true = só aparece em `npm run dev`; fica fora do build de produção. */
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      /** Marca o conteúdo como demonstrativo (exibe um aviso na página). */
      demo: z.boolean().default(false),
      lang,
      /** Reservado para séries de artigos (funcionalidade futura). */
      series: z.string().optional(),
    });
    return z.discriminatedUnion('secao', [
      base.extend({ secao: z.literal('noticias') }),
      base.extend({ secao: z.literal('publicacoes') }),
      // Em Estudos, a área é obrigatória.
      base.extend({ secao: z.literal('estudos'), area: z.enum(areas) }),
    ]);
  },
});

/**
 * Projetos.
 * Arquivos: src/content/projects/<slug>.md  →  URL: /projetos/<slug>/
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(300),
      category: z.enum(PROJECT_CATEGORIES),
      /** Categorias adicionais em que o projeto também deve aparecer nos filtros. */
      extraCategories: z.array(z.enum(PROJECT_CATEGORIES)).default([]),
      technologies: z.array(z.string()).default([]),
      status: z.enum(projectStatus).default('concluido'),
      date: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      /** "public" exibe links; "private" mostra apenas informações autorizadas e oculta links. */
      visibility: z.enum(['public', 'private']).default('public'),
      role: z.string().optional(),
      repo: z.url().optional(),
      demoUrl: z.url().optional(),
      cover: image().optional(),
      coverAlt: z.string().default(''),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      demo: z.boolean().default(false),
      lang,
    }),
});

/**
 * Artigos (produção científica).
 * Arquivos: src/content/publications/<slug>.md  →  URL: /artigos/<slug>/
 * O corpo do Markdown é o resumo (abstract).
 */
const publications = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/publications' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(publicationTypes),
    authors: z.array(z.string()).min(1),
    year: z.number().int(),
    /** Periódico, evento, instituição ou editora. */
    venue: z.string(),
    /** DOI sem prefixo de URL, ex.: 10.1234/abcd.5678 */
    doi: z.string().regex(/^10\.\d{4,9}\/\S+$/, 'DOI inválido (use o formato 10.xxxx/...)').optional(),
    url: z.url().optional(),
    /** Caminho do PDF dentro de public/, ex.: /papers/meu-artigo.pdf. Use somente se a distribuição for permitida. */
    pdf: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    language: z.string().default('pt-BR'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    demo: z.boolean().default(false),
  }),
});

export const collections = { blog, projects, publications };
