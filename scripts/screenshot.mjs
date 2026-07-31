import { chromium } from 'playwright';
import fs from 'fs';

async function takeScreenshots() {
  const outputDir = 'public/images/screenshots';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set a consistent viewport
  await page.setViewportSize({ width: 1280, height: 720 });

  const pages = [
    { name: 'landing', url: 'http://localhost:4321/' },
    { name: 'download', url: 'http://localhost:4321/download' },
    { name: 'docs-index', url: 'http://localhost:4321/docs' },
    { name: 'docs-article', url: 'http://localhost:4321/docs/getting-started' },
    { name: 'blog-index', url: 'http://localhost:4321/blog' },
    { name: 'blog-post', url: 'http://localhost:4321/blog/welcome' },
    { name: 'style-guide', url: 'http://localhost:4321/blog/style-guide' },
    { name: 'readme-test', url: 'http://localhost:4321/blog/metrolist-readme' }
  ];

  for (const { name, url } of pages) {
    console.log(`Taking screenshot of ${name} at ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: true });
      console.log(`Saved ${outputDir}/${name}.png`);
    } catch (error) {
      console.error(`Failed to capture ${name}:`, error.message);
    }
  }

  await browser.close();
}

takeScreenshots();
