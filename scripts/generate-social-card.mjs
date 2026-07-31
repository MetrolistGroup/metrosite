import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Set viewport to the card size
  await page.setViewportSize({ width: 1200, height: 630 });
  
  try {
    // Navigate to the preview page
    await page.goto('http://localhost:4321/og-preview', { waitUntil: 'networkidle' });
    
    // Wait for fonts and logo to settle
    await new Promise(r => setTimeout(r, 2000));
    
    // Take the screenshot of the card specifically
    await page.screenshot({ 
      path: 'public/images/social-card.png'
    });
    
    console.log('Successfully generated public/images/social-card.png');
  } catch (err) {
    console.error('Error generating social card:', err);
  } finally {
    await browser.close();
  }
}

run();
