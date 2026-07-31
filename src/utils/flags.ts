export const flagSvgs: Record<string, string> = {
  'en': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" fill="#012169"/>
    <path d="M0 0l12 12M0 24L12 12M24 0L12 12M24 24L12 12" stroke="#FFF" stroke-width="2.5"/>
    <path d="M0 0l12 12M0 24L12 12M24 0L12 12M24 24L12 12" stroke="#C8102E" stroke-width="1"/>
    <path d="M0 12h24M12 0v24" stroke="#FFF" stroke-width="3.5"/>
    <path d="M0 12h24M12 0v24" stroke="#C8102E" stroke-width="1.5"/>
    <path d="M-1 6h26M-1 18h26" stroke="#FFF" stroke-width="2.5"/>
    <path d="M-1 6h26M-1 18h26" stroke="#C8102E" stroke-width="1"/>
    <path d="M5 0v6M19 0v6M5 18v6M19 18v6" stroke="#FFF" stroke-width="2.5"/>
    <path d="M5 0v6M19 0v6M5 18v6M19 18v6" stroke="#C8102E" stroke-width="1"/>
  </svg>`,
  'es': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" fill="#C60B1E"/>
    <rect y="4" width="24" height="16" fill="#FFC400"/>
    <rect y="6" width="24" height="12" fill="#C60B1E"/>
    <rect y="8" width="24" height="8" fill="#FFC400"/>
    <circle cx="12" cy="12" r="2.5" fill="#C60B1E"/>
  </svg>`,
  'ar': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="8" fill="#CE1126"/>
    <rect y="8" width="24" height="8" fill="#FFF"/>
    <rect y="16" width="24" height="8" fill="#000"/>
    <circle cx="12" cy="12" r="2.5" fill="#C09300"/>
  </svg>`,
  'de': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="8" fill="#000"/>
    <rect y="8" width="24" height="8" fill="#DD0000"/>
    <rect y="16" width="24" height="8" fill="#FFCE00"/>
  </svg>`,
  'fr': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="8" height="24" fill="#002395"/>
    <rect x="8" width="8" height="24" fill="#FFF"/>
    <rect x="16" width="8" height="24" fill="#ED2939"/>
  </svg>`,
  'hi': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="8" fill="#FF9933"/>
    <rect y="8" width="24" height="8" fill="#FFF"/>
    <rect y="16" width="24" height="8" fill="#138808"/>
    <circle cx="12" cy="12" r="3" fill="#000080"/>
  </svg>`,
  'id': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="12" fill="#CE1126"/>
    <rect y="12" width="24" height="12" fill="#FFF"/>
  </svg>`,
  'pl': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="12" fill="#FFF"/>
    <rect y="12" width="24" height="12" fill="#DC143C"/>
  </svg>`,
  'pt-BR': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" fill="#009739"/>
    <polygon points="12,3 21,12 12,21 3,12" fill="#FEDF00"/>
    <circle cx="12" cy="12" r="4" fill="#002776"/>
  </svg>`,
};

export function flagSvg(locale: string): string {
  return flagSvgs[locale] ?? '';
}
