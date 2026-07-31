import { getCollection } from 'astro:content';

const site = 'https://metrolist.cc';
const staticPaths = ['', '/download', '/info', '/blog', '/docs'];

export async function GET() {
  const blogPosts = await getCollection('blog');
  const docs = await getCollection('docs');

  const paths: string[] = [];

  for (const path of staticPaths) {
    paths.push(`${path}/`);
  }
  for (const post of blogPosts) {
    paths.push(`/blog/${post.slug}/`);
  }
  for (const doc of docs) {
    paths.push(`/docs/${doc.slug}/`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(p => `  <url>
    <loc>${site}${p}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
