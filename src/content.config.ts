import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  BLOG_CATEGORIES,
  PROJECT_CATEGORIES,
  PROJECT_STATUS,
  PUBLICATION_TYPES,
  type ProjectStatus,
  type PublicationType,
} from './lib/taxonomy';

const projectStatus = Object.keys(PROJECT_STATUS) as [ProjectStatus, ...ProjectStatus[]];
const publicationTypes = Object.keys(PUBLICATION_TYPES) as [PublicationType, ...PublicationType[]];

/** Idiomas suportados pelo conteúdo. O português é o padrão. */
const lang = z.enum(['pt-BR', 'en']).default('pt-BR');

/**
 * Blog — notícias e artigos.
 * Arquivos: src/content/blog/<slug>.md ou .mdx  →  URL: /blog/<slug>/
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(120),
      description: z.string().max(300),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      category: z.enum(BLOG_CATEGORIES),
      tags: z.array(z.string()).default([]),
      /** Caminho relativo ao arquivo, ex.: ../../assets/covers/minha-capa.jpg (otimizado no build). */
      cover: image().optional(),
      coverAlt: z.string().default(''),
      author: z.string().optional(),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      /** Marca o conteúdo como demonstrativo (exibe um aviso na página). */
      demo: z.boolean().default(false),
      lang,
      /** Reservado para séries de artigos (funcionalidade futura). */
      series: z.string().optional(),
    }),
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
 * Produção científica.
 * Arquivos: src/content/publications/<slug>.md  →  URL: /publicacoes/<slug>/
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
