import { hexFromArgb, TonalPalette, argbFromHex } from '@material/material-color-utilities';
import fs from 'node:fs';
import path from 'node:path';

const sourceColorHex = '#FFFFFF';
const sourceColorArgb = argbFromHex(sourceColorHex);

// For #FFFFFF, we'll extract hue and chroma (which should be 0)
// and force chroma to 0 as requested for a fully achromatic palette.
const palette = TonalPalette.fromHueAndChroma(0, 0);

const mapping = {
  '--md-sys-color-background': 6,
  '--md-sys-color-on-background': 90,
  '--md-sys-color-surface': 6,
  '--md-sys-color-surface-dim': 6,
  '--md-sys-color-surface-bright': 24,
  '--md-sys-color-surface-container-lowest': 4,
  '--md-sys-color-surface-container-low': 10,
  '--md-sys-color-surface-container': 12,
  '--md-sys-color-surface-container-high': 17,
  '--md-sys-color-surface-container-highest': 22,
  '--md-sys-color-surface-variant': 20,
  '--md-sys-color-on-surface': 90,
  '--md-sys-color-on-surface-variant': 80,
  '--md-sys-color-outline': 60,
  '--md-sys-color-outline-variant': 30,
  '--md-sys-color-primary': 80,
  '--md-sys-color-on-primary': 20,
  '--md-sys-color-primary-container': 30,
  '--md-sys-color-on-primary-container': 90
};

let css = ':root {\n';

for (const [token, tone] of Object.entries(mapping)) {
  const argb = palette.tone(tone);
  const hex = hexFromArgb(argb);
  css += `  ${token}: ${hex};\n`;
}

css += '}\n';

const outputPath = path.resolve('src/styles/tokens.css');
fs.writeFileSync(outputPath, css);
console.log(`Tokens written to ${outputPath}`);
