# Search discovery at launch

The site publishes static HTML for every page. Guides also have Markdown copies, a topic index, an RSS feed, and Article structured data. The Markdown files name their canonical HTML source so a reader can attribute an extracted passage to the right page.

These formats make the content easier to find and read. They do not guarantee search positions or AI citations. Google says its AI search features use the usual search requirements and do not need special AI files or markup. Treat `llms.txt` as a convenience for tools that choose to read it, not a Google ranking factor.

## Before deployment

Run `bun run check`, then inspect the build with local Wrangler. Vite development mode does not reproduce the deployed static files or `_headers` rules.

Check the content and source links for the launch version of Metrolist KMP. Keep `GUIDE_REVIEW_DATE` tied to a real review. Do not refresh dates on every build or add a publication date that nobody recorded.

## After deployment

1. Verify the production domain in Google Search Console and Bing Webmaster Tools. Domain verification needs access to the relevant account or DNS settings.
2. Submit `https://metrolist.cc/sitemap.xml`. Use the inspection tools on a guide URL to check the response, rendered content, canonical URL, and index eligibility.
3. Run `bun run indexnow` after the new URLs are public. It reads the sitemap and submits those URLs to participating engines. It does not submit to Google or force an engine to index a page.
4. Check Cloudflare bot and firewall settings. `robots.txt` allows crawling, but a challenge or block at the CDN can still stop a crawler. OpenAI publishes IP ranges for OAI-SearchBot. A request with a copied user-agent alone does not prove those crawler requests can reach the site.
5. Check search impressions, clicks, and crawl reports after launch. Those reports can show whether discovery improved. A successful build cannot measure that outcome.

OpenAI uses OAI-SearchBot for search discovery and GPTBot for potential training collection. They have separate controls. Do not change training preferences just to configure search discovery. This change leaves the existing bot policy intact.

## Public discovery URLs

- `https://metrolist.cc/sitemap.xml` lists indexable HTML pages.
- `https://metrolist.cc/feed.xml` contains guide links and summaries in RSS 2.0 format. Publication dates are omitted because source-review dates are not publication dates.
- `https://metrolist.cc/llms.txt` links to the document collection.
- `https://metrolist.cc/llms-full.txt` combines the page text, with each document naming its HTML source.

Markdown copies have `noindex` headers and HTTP canonical links to their HTML pages. The HTML pages remain indexable. The sitemap omits modification dates because we do not maintain reliable per-URL dates. Do not use the build time as a substitute.

## References

- [Google AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google AI search optimization guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google sitemap formats and modification dates](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [OpenAI crawler controls](https://platform.openai.com/docs/bots)
- [IndexNow documentation](https://www.indexnow.org/documentation)
