# Metrolist website

Source code for the official [Metrolist](https://github.com/MetrolistGroup/Metrolist) website.

## Tech

- Vue 3
- Vite
- Cloudflare Workers

`bun run build` prerenders every route to static HTML (Vue SSR), then writes per-route metadata, JSON-LD, Markdown twins, `llms.txt`, and `sitemap.xml`. After deploying, run `bun run indexnow` to ask Bing and other IndexNow engines to recrawl.

Browser checks use an external Playwright installation: `PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs bun run test:browser` (install Chromium with `npx playwright install chromium` if needed).

Metrolist is made by [Mo Agamy](https://github.com/mostafaalagamy) and contributors. The website is made by [Nyx](https://github.com/nyxiereal) with improvements from [contributors](https://github.com/MetrolistGroup/metrosite/graphs/contributors).
