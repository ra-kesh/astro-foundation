const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

document
  .querySelectorAll<HTMLButtonElement>('[data-dialog-trigger]')
  .forEach((trigger) => {
    const id = trigger.dataset.dialogTrigger;
    const dialog = id
      ? (document.getElementById(id) as HTMLDialogElement | null)
      : null;
    if (!dialog) return;

    const close = () => dialog.close();
    trigger.addEventListener('click', () => {
      dialog.showModal();
      document.body.classList.add('dialog-open');
      dialog.querySelector<HTMLElement>('[data-dialog-close]')?.focus();
    });
    dialog
      .querySelector('[data-dialog-close]')
      ?.addEventListener('click', close);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      trigger.focus();
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        ),
      ];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  });

document
  .querySelectorAll<HTMLElement>('[data-shared-highlight]')
  .forEach((container) => {
    const highlight = container.querySelector<HTMLElement>('.shared-highlight');
    const items = container.querySelectorAll<HTMLElement>(
      '[data-highlight-item]',
    );
    if (!highlight) return;
    const activate = (item: HTMLElement) => {
      highlight.style.height = `${item.offsetHeight}px`;
      highlight.style.transform = `translateY(${item.offsetTop}px)`;
      highlight.classList.add('is-visible');
    };
    items.forEach((item) => {
      item.addEventListener('mouseenter', () => activate(item));
      item.addEventListener('focus', () => activate(item));
    });
    container.addEventListener('mouseleave', () =>
      highlight.classList.remove('is-visible'),
    );
    container.addEventListener('focusout', (event) => {
      if (!container.contains(event.relatedTarget as Node | null))
        highlight.classList.remove('is-visible');
    });
  });

document.querySelectorAll<HTMLElement>('[data-spotlight]').forEach((row) => {
  if (!finePointer.matches || reducedMotion.matches) return;
  row.addEventListener('pointerenter', () => row.classList.add('is-spotlit'));
  row.addEventListener('pointerleave', () =>
    row.classList.remove('is-spotlit'),
  );
  row.addEventListener('pointermove', (event) => {
    const rect = row.getBoundingClientRect();
    row.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
    row.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
  });
});

document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((item) => {
  if (!finePointer.matches || reducedMotion.matches) return;
  item.addEventListener('pointermove', (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(x, y);
    const scale = Math.max(0, 1 - distance / 100);
    item.style.transform = `translate(${x * 0.3 * scale}px, ${y * 0.3 * scale}px)`;
  });
  item.addEventListener('pointerleave', () => {
    item.animate(
      [
        { transform: getComputedStyle(item).transform },
        { transform: 'translate(0, 0)' },
      ],
      { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' },
    );
    item.style.transform = 'translate(0, 0)';
  });
});

const themeButtons = document.querySelectorAll<HTMLButtonElement>(
  '[data-theme-option]',
);
const themeIndicator = document.querySelector<HTMLElement>(
  '.theme-switch__indicator',
);
const updateTheme = (theme: string) => {
  themeButtons.forEach((button) =>
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.themeOption === theme),
    ),
  );
  const active = [...themeButtons].find(
    (button) => button.dataset.themeOption === theme,
  );
  if (active && themeIndicator) {
    themeIndicator.style.width = `${active.offsetWidth}px`;
    themeIndicator.style.transform = `translateX(${active.offsetLeft - 2}px)`;
  }
};
updateTheme(localStorage.getItem('theme') ?? 'system');
themeButtons.forEach((button) =>
  button.addEventListener('click', () => {
    const theme = button.dataset.themeOption ?? 'system';
    localStorage.setItem('theme', theme);
    if (theme === 'light' || theme === 'dark')
      document.documentElement.dataset.theme = theme;
    else document.documentElement.removeAttribute('data-theme');
    updateTheme(theme);
  }),
);

const loopItems = document.querySelectorAll<HTMLElement>('.footer-loop__item');
if (loopItems.length > 1 && !reducedMotion.matches) {
  let loopIndex = 0;
  window.setInterval(() => {
    loopItems[loopIndex]?.classList.remove('is-active');
    loopIndex = (loopIndex + 1) % loopItems.length;
    loopItems[loopIndex]?.classList.add('is-active');
  }, 2000);
}

const copyButton = document.querySelector<HTMLButtonElement>('[data-copy-url]');
copyButton?.addEventListener('click', () => {
  const state = copyButton.querySelector<HTMLElement>('[data-copy-state]');
  if (!state) return;
  state.classList.add('is-morphing');
  window.setTimeout(() => {
    state.textContent = 'Copied';
    state.classList.remove('is-morphing');
  }, 120);
  void navigator.clipboard.writeText(window.location.href).catch(() => {
    // Clipboard access can be unavailable in previews or restricted contexts.
  });
  window.setTimeout(() => {
    state.classList.add('is-morphing');
    window.setTimeout(() => {
      state.textContent = 'Copy';
      state.classList.remove('is-morphing');
    }, 120);
  }, 2000);
});

const progress = document.querySelector<HTMLElement>('.scroll-progress span');
if (progress) {
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    progress.style.transform = `scaleX(${value})`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
}
