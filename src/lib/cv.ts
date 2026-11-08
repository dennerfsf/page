import { profile } from '../data/site';
import type { Lang } from '../i18n/ui';
import { slugify } from './taxonomy';

/**
 * Caminhos dos PDFs do currículo. Eles são gerados por scripts/generate-cv-pdf.mjs
 * a partir das próprias páginas /curriculo/ e /en/resume/, logo após o build.
 */
const slug = slugify(profile.name);

export const CV_PAGES: Record<Lang, { page: string; pdf: string }> = {
  'pt-BR': { page: '/curriculo/', pdf: `/curriculo/${slug}-curriculo.pdf` },
  en: { page: '/en/resume/', pdf: `/en/resume/${slug}-resume.pdf` },
};
