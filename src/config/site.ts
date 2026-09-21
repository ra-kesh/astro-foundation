import { z } from 'zod';
import { isSafeHref } from '@/lib/urls';

const href = z.string().trim().min(1).refine(isSafeHref, 'Unsafe URL');

const siteSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  author: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    email: z.email().optional(),
    links: z.array(z.object({ label: z.string().min(1), href })).default([]),
  }),
  experience: z.array(
    z.object({
      role: z.string().min(1),
      company: z.string().min(1),
      start: z.string().min(1),
      end: z.string().min(1),
      href,
    }),
  ),
  language: z.string().min(2),
  locale: z.string().min(2),
  navigation: z.array(z.object({ label: z.string().min(1), href })),
});

const site = siteSchema.parse({
  name: 'Your Name',
  title: 'Your Name — Portfolio',
  description: 'A concise description of the site and its author.',
  author: {
    name: 'Your Name',
    role: 'Design Engineer',
    email: 'hello@example.com',
    links: [
      { label: 'GitHub', href: 'https://github.com/' },
      { label: 'Email', href: 'mailto:hello@example.com' },
    ],
  },
  experience: [
    {
      role: 'Design Engineer',
      company: 'Independent',
      start: '2024',
      end: 'Present',
      href: '/about/',
    },
    {
      role: 'Product Designer',
      company: 'Example Studio',
      start: '2022',
      end: '2024',
      href: '/about/',
    },
  ],
  language: 'en',
  locale: 'en_US',
  navigation: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about/' },
    { label: 'Projects', href: '/projects/' },
    { label: 'Posts', href: '/posts/' },
  ],
});

export default site;
