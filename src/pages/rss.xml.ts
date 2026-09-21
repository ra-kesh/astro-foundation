import { getContainerRenderer as mdxRenderer } from '@astrojs/mdx/container-renderer';
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { loadRenderers } from 'astro:container';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { render } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import siteConfig from '@/config/site';
import { getPosts } from '@/lib/content';

const allowedTags = [
  'p',
  'br',
  'hr',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'strong',
  'em',
  'del',
  'blockquote',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'figure',
  'figcaption',
  'picture',
  'source',
  'pre',
  'code',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

const allowedAttributes: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'title'],
  img: ['src', 'srcset', 'sizes', 'alt', 'title', 'width', 'height'],
  source: ['srcset', 'sizes', 'type'],
  code: ['class'],
  th: ['colspan', 'rowspan', 'scope'],
  td: ['colspan', 'rowspan'],
};

function resolveUrl(value: string, base: URL): string | undefined {
  if (value.startsWith('#')) return undefined;
  try {
    const url = new URL(value, base);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function absoluteAttributes(attributes: Record<string, string>, base: URL) {
  const result = { ...attributes };

  for (const key of ['href', 'src']) {
    if (!result[key]) continue;
    const resolved = resolveUrl(result[key], base);
    if (resolved) result[key] = resolved;
    else delete result[key];
  }

  if (result.srcset) {
    const candidates = result.srcset
      .split(',')
      .map((candidate) => {
        const [url, ...descriptor] = candidate.trim().split(/\s+/);
        const resolved = url ? resolveUrl(url, base) : undefined;
        return resolved ? [resolved, ...descriptor].join(' ') : undefined;
      })
      .filter((candidate): candidate is string => Boolean(candidate));

    if (candidates.length) result.srcset = candidates.join(', ');
    else delete result.srcset;
  }

  return result;
}

export const GET: APIRoute = async ({ site }) => {
  const root = site ?? new URL('https://example.com');
  const posts = await getPosts();
  const container = await AstroContainer.create({
    renderers: await loadRenderers([mdxRenderer()]),
  });

  const items = await Promise.all(
    posts.map(async (post) => {
      const path = `/posts/${post.id}/`;
      const url = new URL(path, root);
      const { Content } = await render(post);
      const html = await container.renderToString(Content);

      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.publishedAt,
        link: path,
        categories: post.data.tags,
        author: siteConfig.author.email,
        content: sanitizeHtml(html, {
          allowedTags,
          allowedAttributes,
          transformTags: {
            '*': (tagName, attribs) => ({
              tagName,
              attribs: absoluteAttributes(attribs, url),
            }),
          },
        }),
      };
    }),
  );

  return rss({
    title: `${siteConfig.name} — Posts`,
    description: siteConfig.description,
    site: root,
    items,
    customData: `<language>${siteConfig.language}</language>`,
  });
};
