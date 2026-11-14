# Metrolist website

Source code for the official [Metrolist](https://github.com/MetrolistGroup/Metrolist) website.

## Tech

- Vue 3
- Vite
- Cloudflare Workers

`bun run build` prerenders every route to static HTML (Vue SSR), then writes per-route metadata, JSON-LD, Markdown twins, `llms.txt`, `sitemap.xml`, and the guide RSS feed at `/feed.xml`. After deploying, run `bun run indexnow` to ask Bing and other IndexNow engines to recrawl. The [search discovery checklist](docs/search-discovery.md) covers domain verification, sitemap submission, and crawler access at launch.

KMP share links at `/watch?v=…`, `/playlist?list=…`, `/browse/:id`, and `/channel/:id` open a shared-music page with Metrolist and YouTube Music links. `/album/:id`, `/artist/:id`, and trusted `/open?url=…` targets are also supported. `/party?r=…` and `/listen?code=…` show the room invitation. These pages are noindex; the build generates Cloudflare `_redirects` rules for path-based IDs.

Browser checks use an external Playwright installation: `PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs bun run test:browser` (install Chromium from that external installation with `bunx playwright install chromium` if needed). The runner serves the fresh build on its own loopback Vite preview server with an OS-assigned port, runs suites sequentially with the same `PLAYWRIGHT_MODULE`, and closes the server even when a suite fails. Vite preview does not reproduce Cloudflare routing or `_headers`; validate those separately with Wrangler.

Metrolist is made by [Mo Agamy](https://github.com/mostafaalagamy) and contributors. The website is made by [Nyx](https://github.com/nyxiereal) with improvements from [contributors](https://github.com/MetrolistGroup/metrosite/graphs/contributors).
