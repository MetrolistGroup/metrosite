import { getCollection } from 'astro:content';

const site = 'https://metrolist.cc';

export async function GET() {
  const posts = await getCollection('blog');
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Metrolist Blog</title>
    <description>News, updates, and guides for Metrolist, a YouTube Music client for Android.</description>
    <link>${site}/</link>
    ${posts.map(post => `
    <item>
      <title>${post.data.title}</title>
      <link>${site}/blog/${post.slug}/</link>
      <guid isPermaLink="true">${site}/blog/${post.slug}/</guid>
      <description>${post.data.description}</description>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
