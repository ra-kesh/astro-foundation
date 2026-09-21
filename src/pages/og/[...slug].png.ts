import type { APIRoute } from 'astro';
import site from '@/config/site';
import { getPosts, getProjects } from '@/lib/content';
import { renderOgImage } from '@/lib/og';

export async function getStaticPaths() {
  const [posts, projects] = await Promise.all([getPosts(), getProjects()]);

  return [
    {
      params: { slug: 'site' },
      props: { title: site.title, label: 'Website' },
    },
    ...posts.map((post) => ({
      params: { slug: `posts/${post.id}` },
      props: { title: post.data.title, label: 'Article' },
    })),
    ...projects.map((project) => ({
      params: { slug: `projects/${project.id}` },
      props: { title: project.data.title, label: 'Project' },
    })),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const { title, label } = props as { title: string; label: string };
  const body = await renderOgImage({ title, label, siteName: site.name });

  return new Response(body, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
