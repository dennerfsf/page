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

/* ---------- Menu móvel ---------- */
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.getElementById('mobile-menu');
if (menuBtn && menu) {
  const setOpen = (open: boolean) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', (open ? menuBtn.dataset.labelClose : menuBtn.dataset.labelOpen) ?? '');
    menu.hidden = !open;
  };
  menuBtn.addEventListener('click', () => setOpen(menu.hidden));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      menuBtn.focus();
    }
  });
  window.matchMedia('(min-width: 1280px)').addEventListener('change', (e) => e.matches && setOpen(false));
}

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
