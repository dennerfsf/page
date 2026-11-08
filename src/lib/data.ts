/**
 * Acesso tipado aos arquivos de src/data. Páginas e componentes devem importar daqui,
 * nunca dos JSON diretamente, para que a estrutura dos dados tenha um único contrato.
 */
import type { Localized } from '../i18n/format';
import experienceJson from '../data/experience.json';
import educationJson from '../data/education.json';
import certificationsJson from '../data/certifications.json';
import languagesJson from '../data/languages.json';
import skillsJson from '../data/skills.json';
import researchJson from '../data/research.json';

export interface Experience {
  id: string;
  demo?: boolean;
  role: Localized;
  organization: string;
  location?: string;
  /** AAAA-MM */
  start: string;
  /** AAAA-MM ou null para atual */
  end: string | null;
  summary?: Localized;
  highlights?: Localized[];
  technologies?: string[];
}

export interface Education {
  id: string;
  demo?: boolean;
  degree: Localized;
  institution: string;
  start?: string;
  end?: string | null;
  description?: Localized;
}

export interface Certification {
  id: string;
  demo?: boolean;
  name: Localized;
  issuer: string;
  date?: string;
  url?: string;
}

export interface LanguageSkill {
  name: Localized;
  level: Localized;
  demo?: boolean;
}

export interface SkillGroup {
  id: string;
  icon: string;
  title: Localized;
  items: Localized[];
}

export interface ResearchProject {
  demo?: boolean;
  title: string;
  role?: string;
  institution?: string;
  period?: string;
  description?: string;
  url?: string;
}
export interface ResearchGroup {
  demo?: boolean;
  name: string;
  institution?: string;
  role?: string;
  url?: string;
}
export interface ResearchEvent {
  demo?: boolean;
  name: string;
  year?: number;
  participation?: string;
  location?: string;
  url?: string;
}

const byStartDesc = <T extends { start?: string; end?: string | null }>(a: T, b: T) =>
  (b.end === null ? '9999' : (b.end ?? b.start ?? '')).localeCompare(a.end === null ? '9999' : (a.end ?? a.start ?? '')) ||
  (b.start ?? '').localeCompare(a.start ?? '');

export const experience = (experienceJson as Experience[]).slice().sort(byStartDesc);
export const education = (educationJson as Education[]).slice().sort(byStartDesc);
export const certifications = (certificationsJson as Certification[])
  .slice()
  .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
export const languages = languagesJson as LanguageSkill[];
export const skills = skillsJson as SkillGroup[];
export const research = researchJson as {
  projects: ResearchProject[];
  groups: ResearchGroup[];
  events: ResearchEvent[];
};

/** Itens da linha do tempo (Sobre): experiência + formação, ordem cronológica decrescente. */
export interface TimelineItem {
  kind: 'work' | 'education';
  id: string;
  title: Localized;
  org: string;
  start?: string;
  end?: string | null;
  text?: Localized;
  tags?: string[];
  demo?: boolean;
}

export function timeline(): TimelineItem[] {
  const items: TimelineItem[] = [
    ...experience.map((e) => ({
      kind: 'work' as const,
      id: e.id,
      title: e.role,
      org: e.organization,
      start: e.start,
      end: e.end,
      text: e.summary,
      tags: e.technologies,
      demo: e.demo,
    })),
    ...education.map((e) => ({
      kind: 'education' as const,
      id: e.id,
      title: e.degree,
      org: e.institution,
      start: e.start,
      end: e.end,
      text: e.description,
      demo: e.demo,
    })),
  ];
  return items.sort(byStartDesc);
}
