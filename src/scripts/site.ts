/**
 * JavaScript global (pequeno e progressivo): o site funciona sem ele,
 * exceto pelas melhorias de interação abaixo.
 */

const root = document.documentElement;

/* ---------- Tema claro/escuro (preferência persistida) ---------- */
function syncThemeButtons() {
  const dark = root.classList.contains('dark');
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(dark)));
}
document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const dark = !root.classList.contains('dark');
    root.classList.toggle('dark', dark);
    try {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    } catch {
      /* armazenamento indisponível: mantém só nesta página */
    }
    syncThemeButtons();
    document.dispatchEvent(new CustomEvent('themechange', { detail: { dark } }));
  });
});
syncThemeButtons();

/* ---------- Submenus (desktop: suspensos; celular: recolhíveis) ---------- */
type Submenu = { item: HTMLElement; btn: HTMLButtonElement; panel: HTMLElement; desktop: boolean };
const submenus: Submenu[] = [...document.querySelectorAll<HTMLElement>('[data-submenu]')].map((item) => {
  const btn = item.querySelector<HTMLButtonElement>('[data-submenu-toggle]')!;
  const panel = document.getElementById(btn.getAttribute('aria-controls')!)!;
  return { item, btn, panel, desktop: Boolean(item.closest('[data-desktop-nav]')) };
});
const setSubmenu = (s: Submenu, open: boolean) => {
  s.btn.setAttribute('aria-expanded', String(open));
  s.panel.hidden = !open;
};
for (const s of submenus) {
  s.btn.addEventListener('click', () => {
    const open = s.panel.hidden;
    // No desktop, só um submenu aberto por vez.
    if (open && s.desktop) submenus.filter((o) => o.desktop && o !== s).forEach((o) => setSubmenu(o, false));
    setSubmenu(s, open);
  });
  // Desktop: fecha quando o foco sai do item (ex.: Tab para o próximo item do menu).
  if (s.desktop) {
    s.item.addEventListener('focusout', (e) => {
      if (!s.item.contains(e.relatedTarget as Node | null)) setSubmenu(s, false);
    });
  }
}
// Desktop: clique fora fecha os submenus abertos.
document.addEventListener('click', (e) => {
  for (const s of submenus) if (s.desktop && !s.panel.hidden && !s.item.contains(e.target as Node)) setSubmenu(s, false);
});

/* ---------- Menu móvel ---------- */
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.getElementById('mobile-menu');
const setMenuOpen = (open: boolean) => {
  if (!menuBtn || !menu) return;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', (open ? menuBtn.dataset.labelClose : menuBtn.dataset.labelOpen) ?? '');
  menu.hidden = !open;
};
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => setMenuOpen(menu.hidden));
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => e.matches && setMenuOpen(false));
}

/* Esc: fecha primeiro o submenu aberto (devolvendo o foco ao seu botão); depois, o menu móvel. */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = submenus.find((s) => !s.panel.hidden && (s.desktop || !menu?.hidden));
  if (open) {
    setSubmenu(open, false);
    open.btn.focus();
    return;
  }
  if (menuBtn && menu && !menu.hidden) {
    setMenuOpen(false);
    menuBtn.focus();
  }
});

/* ---------- Voltar ao topo ---------- */
const toTop = document.querySelector<HTMLAnchorElement>('[data-back-to-top]');
if (toTop) {
  const onScroll = () => toTop.toggleAttribute('data-visible', window.scrollY > 600);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', (e) => {
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  });
}

/* ---------- Progresso de leitura (artigos) ---------- */
const progress = document.querySelector<HTMLElement>('[data-reading-progress]');
const article = document.querySelector<HTMLElement>('[data-article-body]');
if (progress && article) {
  const update = () => {
    const rect = article.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const ratio = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
    progress.style.transform = `scaleX(${ratio})`;
    progress.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------- Revelação ao rolar ---------- */
const revealEls = document.querySelectorAll<HTMLElement>('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* ---------- Copiar link ---------- */
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy ?? window.location.href;
    const status = btn.querySelector('[data-copy-status]');
    try {
      await navigator.clipboard.writeText(text);
      if (status) status.textContent = btn.dataset.copied ?? 'Link copiado!';
    } catch {
      if (status) status.textContent = 'Não foi possível copiar';
    }
    setTimeout(() => status && (status.textContent = ''), 2500);
  });
});

/* ---------- Botão de imprimir ---------- */
document.querySelectorAll('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));

/* ---------- Diagramas Mermaid (carregados só quando a página tem ```mermaid) ---------- */
const mermaidBlocks = document.querySelectorAll<HTMLElement>('pre[data-language="mermaid"], pre > code.language-mermaid');
if (mermaidBlocks.length) {
  const sources = [...mermaidBlocks].map((el) => {
    const pre = el.tagName === 'PRE' ? el : (el.parentElement as HTMLElement);
    return { pre, code: pre.textContent ?? '' };
  });
  const containers = sources.map(({ pre, code }) => {
    const div = document.createElement('div');
    div.className = 'mermaid-diagram not-prose';
    div.setAttribute('role', 'img');
    div.setAttribute('aria-label', pre.getAttribute('aria-label') || 'Diagrama');
    div.dataset.source = code;
    pre.replaceWith(div);
    return div;
  });

  const render = async () => {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: root.classList.contains('dark') ? 'dark' : 'neutral',
      fontFamily: 'Inter, system-ui, sans-serif',
    });
    for (const [i, div] of containers.entries()) {
      try {
        const { svg } = await mermaid.render(`mermaid-${i}-${Date.now()}`, div.dataset.source ?? '');
        div.innerHTML = svg;
      } catch {
        div.innerHTML = `<pre>${(div.dataset.source ?? '').replace(/</g, '&lt;')}</pre>`;
      }
    }
  };

  const io = new IntersectionObserver((entries, obs) => {
    if (entries.some((e) => e.isIntersecting)) {
      obs.disconnect();
      render();
    }
  });
  containers.forEach((c) => io.observe(c));
  document.addEventListener('themechange', () => render());
}
