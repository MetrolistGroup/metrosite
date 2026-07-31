import {
  hexFromArgb,
  Hct,
  Scheme,
  TonalPalette,
  sourceColorFromImage,
} from '@material/material-color-utilities';

const TOKEN_KEYS: string[] = [
  '--md-sys-color-background',
  '--md-sys-color-on-background',
  '--md-sys-color-surface',
  '--md-sys-color-surface-dim',
  '--md-sys-color-surface-bright',
  '--md-sys-color-surface-container-lowest',
  '--md-sys-color-surface-container-low',
  '--md-sys-color-surface-container',
  '--md-sys-color-surface-container-high',
  '--md-sys-color-surface-container-highest',
  '--md-sys-color-surface-variant',
  '--md-sys-color-on-surface',
  '--md-sys-color-on-surface-variant',
  '--md-sys-color-outline',
  '--md-sys-color-outline-variant',
  '--md-sys-color-primary',
  '--md-sys-color-on-primary',
  '--md-sys-color-primary-container',
  '--md-sys-color-on-primary-container',
];

const SURFACE_TONES: Array<[string, number]> = [
  ['--md-sys-color-surface-dim', 6],
  ['--md-sys-color-surface-bright', 24],
  ['--md-sys-color-surface-container-lowest', 4],
  ['--md-sys-color-surface-container-low', 10],
  ['--md-sys-color-surface-container', 12],
  ['--md-sys-color-surface-container-high', 17],
  ['--md-sys-color-surface-container-highest', 22],
];

function extractColor(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        sourceColorFromImage(img)
          .then(resolve)
          .catch(() => resolve(null));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

function generatePalette(sourceArgb: number): Record<string, string> {
  const scheme = Scheme.dark(sourceArgb);
  const hct = Hct.fromInt(sourceArgb);
  const neutral = TonalPalette.fromHueAndChroma(hct.hue, 4);

  const tokens: Record<string, string> = {};

  // Scheme-provided tokens
  tokens['--md-sys-color-background'] = hexFromArgb(scheme.background);
  tokens['--md-sys-color-on-background'] = hexFromArgb(scheme.onBackground);
  tokens['--md-sys-color-surface'] = hexFromArgb(scheme.surface);
  tokens['--md-sys-color-surface-variant'] = hexFromArgb(scheme.surfaceVariant);
  tokens['--md-sys-color-on-surface'] = hexFromArgb(scheme.onSurface);
  tokens['--md-sys-color-on-surface-variant'] = hexFromArgb(scheme.onSurfaceVariant);
  tokens['--md-sys-color-outline'] = hexFromArgb(scheme.outline);
  tokens['--md-sys-color-outline-variant'] = hexFromArgb(scheme.outlineVariant);
  tokens['--md-sys-color-primary'] = hexFromArgb(scheme.primary);
  tokens['--md-sys-color-on-primary'] = hexFromArgb(scheme.onPrimary);
  tokens['--md-sys-color-primary-container'] = hexFromArgb(scheme.primaryContainer);
  tokens['--md-sys-color-on-primary-container'] = hexFromArgb(scheme.onPrimaryContainer);

  // Surface-container tokens from neutral palette
  for (const [prop, tone] of SURFACE_TONES) {
    tokens[prop] = hexFromArgb(neutral.tone(tone));
  }

  return tokens;
}

function applyPalette(el: HTMLElement, tokens: Record<string, string>) {
  for (const [key, value] of Object.entries(tokens)) {
    el.style.setProperty(key, value);
  }
}

function restorePalette(el: HTMLElement) {
  for (const key of TOKEN_KEYS) {
    el.style.removeProperty(key);
  }
}

export function setupPaletteSwap() {
  const container = document.querySelector<HTMLElement>('.info-page');
  if (!container) return;

  const cards = container.querySelectorAll<HTMLElement>(
    '.builder-card, .builder-featured'
  );

  const cache = new Map<string, Record<string, string>>();

  // Pre-extract colors during idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      cards.forEach((card) => {
        const img = card.querySelector<HTMLImageElement>('img');
        if (img?.src && !cache.has(img.src)) {
          extractColor(img.src).then((color) => {
            if (color !== null) cache.set(img.src, generatePalette(color));
          });
        }
      });
    });
  }

  cards.forEach((card) => {
    card.addEventListener('mouseenter', async () => {
      const img = card.querySelector<HTMLImageElement>('img');
      if (!img?.src) return;

      let tokens = cache.get(img.src);
      if (!tokens) {
        const color = await extractColor(img.src);
        if (color === null) return;
        tokens = generatePalette(color);
        cache.set(img.src, tokens);
      }

      applyPalette(container, tokens);
    });

    card.addEventListener('mouseleave', () => {
      restorePalette(container);
    });
  });
}
