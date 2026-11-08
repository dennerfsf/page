import { DEFAULT_LANG, type Lang } from './ui';

/**
 * Texto localizável nos arquivos de dados (src/data/*.json):
 *   "titulo": "Texto só em português"
 *   "titulo": { "pt": "Texto em português", "en": "Text in English" }
 * Se a tradução não existir, o português é usado.
 */
export type Localized = string | { pt: string; en?: string };

export function l(value: Localized | undefined | null, lang: Lang = DEFAULT_LANG): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return (lang === 'en' ? value.en : undefined) ?? value.pt;
}

export function lList(values: Localized[] | undefined, lang: Lang = DEFAULT_LANG): string[] {
  return (values ?? []).map((v) => l(v, lang)).filter(Boolean);
}

const locale = (lang: Lang) => (lang === 'en' ? 'en-US' : 'pt-BR');

export function formatDate(date: Date, lang: Lang = DEFAULT_LANG): string {
  return new Intl.DateTimeFormat(locale(lang), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatShortDate(date: Date, lang: Lang = DEFAULT_LANG): string {
  return new Intl.DateTimeFormat(locale(lang), {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** "2024-03" → "mar. 2024"; "2024" → "2024"; null → "atual". */
export function formatYearMonth(value: string | null | undefined, lang: Lang = DEFAULT_LANG, present = 'atual'): string {
  if (!value) return present;
  const [y, m] = value.split('-').map(Number);
  if (!m) return String(y);
  return formatShortDate(new Date(Date.UTC(y, m - 1, 1)), lang);
}

export function formatRange(start: string, end: string | null | undefined, lang: Lang = DEFAULT_LANG, present?: string): string {
  return `${formatYearMonth(start, lang)} — ${formatYearMonth(end, lang, present ?? (lang === 'en' ? 'present' : 'atual'))}`;
}
