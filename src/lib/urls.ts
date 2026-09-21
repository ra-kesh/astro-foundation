export type HrefKind =
  'absolute' | 'relative' | 'anchor' | 'contact' | 'external' | 'unsafe';

const SCHEME = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

export function classifyHref(value: string): HrefKind {
  const href = value.trim();

  if (!href) return 'unsafe';
  if (href.startsWith('#')) return 'anchor';
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return 'contact';
  if (href.startsWith('/')) return 'absolute';
  if (!SCHEME.test(href)) return 'relative';

  try {
    const url = new URL(href);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? 'external'
      : 'unsafe';
  } catch {
    return 'unsafe';
  }
}

export function isSafeHref(value: string): boolean {
  return classifyHref(value) !== 'unsafe';
}

export function isSafeImageSource(value: string): boolean {
  const kind = classifyHref(value);
  return kind === 'absolute' || kind === 'relative' || kind === 'external';
}

export function absoluteUrl(value: string, site: URL): string {
  return new URL(value, site).href;
}
