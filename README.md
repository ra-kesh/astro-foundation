# Astro Foundation

An intentionally unstyled Astro and Tailwind foundation for a personal site, portfolio, or publication.

## Start

```sh
cp .env.example .env
pnpm install
pnpm dev
```

Set the production origin in `.env`, then replace the identity and navigation values in `src/config/site.ts`.

## Content

- General pages: `src/content/pages`
- Posts: `src/content/posts`
- Projects: `src/content/projects`

Frontmatter is validated by `src/content.config.ts`. Draft entries are excluded from generated pages and feeds.

## Design

Tailwind utilities are available, but Tailwind Preflight is intentionally omitted. The starter therefore uses native browser presentation. Add tokens, a reset, and components in `src/styles/global.css` when a design direction exists.

## Commands

```sh
pnpm dev
pnpm format
pnpm lint
pnpm check
pnpm build
pnpm validate
```

The production build generates HTML pages, canonical and social metadata, structured data, a sitemap, robots rules, a web manifest, full-content RSS, optimized content images, and social-card images.
