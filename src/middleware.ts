import { defineMiddleware } from 'astro:middleware';
import { defaultLocale, locales } from './i18n';
import { detectLocale } from './i18n/detect';

const COOKIE = 'locale';
const SKIP_PATHS = ['/og-preview', '/sitemap.xml'];
const localeSet = new Set(locales as unknown as string[]);

const cookieOptions = {
  path: '/',
  maxAge: 365 * 24 * 60 * 60,
  sameSite: 'lax' as const,
};

export const onRequest = defineMiddleware((context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Skip locale for non-content paths
  if (SKIP_PATHS.includes(pathname)) {
    return next();
  }

  // Handle ?lang=XX for language switching
  const langParam = url.searchParams.get('lang');
  if (langParam && localeSet.has(langParam)) {
    context.cookies.set(COOKIE, langParam, cookieOptions);
    url.searchParams.delete('lang');
    const qs = url.searchParams.toString();
    return context.redirect(qs ? `${url.pathname}?${qs}` : url.pathname, 302);
  }

  // Backward-compat: old /<locale>/... URLs → clean /... (preserve language via cookie)
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  if (maybeLocale && localeSet.has(maybeLocale)) {
    const rest = '/' + segments.slice(1).join('/');
    context.cookies.set(COOKIE, maybeLocale, cookieOptions);
    return context.redirect(rest || '/', 302);
  }

	// Determine locale: cookie → Accept-Language → default
	const cookie = context.cookies.get(COOKIE)?.value;
	const locale = cookie ?? detectLocale(context.request.headers.get('accept-language'));
	context.cookies.set(COOKIE, locale, cookieOptions);
	context.locals.locale = locale;

	return next();
});
