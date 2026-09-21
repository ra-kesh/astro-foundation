import { getCollection } from 'astro:content';

export async function getPages() {
  const entries = await getCollection('pages', ({ data }) => !data.draft);
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getPosts() {
  const entries = await getCollection('posts', ({ data }) => !data.draft);
  return entries.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}

export async function getProjects() {
  const entries = await getCollection('projects', ({ data }) => !data.draft);
  return entries.sort((a, b) => b.data.year - a.data.year);
}
