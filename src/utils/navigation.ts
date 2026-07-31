import type { SearchItem } from './search';

export function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function setupNavigation(searchIndex: SearchItem[] = []) {
	const menuButton = document.getElementById('menu-button');
	const drawerOverlay = document.getElementById('drawer-overlay');
	const body = document.body;

	function toggleDrawer() {
		body.classList.toggle('drawer-open');
	}

	function closeDrawer() {
		body.classList.remove('drawer-open');
	}

	menuButton?.addEventListener('click', toggleDrawer);
	drawerOverlay?.addEventListener('click', closeDrawer);
	
	// Search logic
	const searchContainer = document.getElementById('search-container');
	const searchExpandButton = document.getElementById('search-expand-button');
	const searchCollapseButton = document.getElementById('search-collapse-button');
	const searchInput = document.getElementById('search-input') as HTMLInputElement;
	const searchResults = document.getElementById('search-results-container');

	function openSearch() {
		searchContainer?.classList.add('active');
		body.classList.add('search-active');
		const expandBtn = document.getElementById('search-expand-button');
		expandBtn?.setAttribute('aria-expanded', 'true');
		searchInput?.setAttribute('aria-expanded', 'true');
		setTimeout(() => {
			searchInput?.focus();
		}, 100);
	}

	function closeSearchFn() {
		const expandBtn = document.getElementById('search-expand-button');
		expandBtn?.setAttribute('aria-expanded', 'false');
		searchInput?.setAttribute('aria-expanded', 'false');

		const bar = document.querySelector('.search-bar-expanded');
		bar?.classList.add('closing');

		if (searchResults) searchResults.classList.remove('visible');

		setTimeout(() => {
			searchContainer?.classList.remove('active');
			body.classList.remove('search-active');
			bar?.classList.remove('closing');
			if (searchInput) searchInput.value = '';
			if (searchResults) searchResults.innerHTML = '';
			expandBtn?.focus();
		}, 350);
	}

	searchExpandButton?.addEventListener('click', openSearch);
	searchCollapseButton?.addEventListener('click', (e) => {
		e.stopPropagation();
		closeSearchFn();
	});

	// Close on click outside
	document.addEventListener('click', (e) => {
		if (searchContainer?.classList.contains('active') && !searchContainer.contains(e.target as Node)) {
			closeSearchFn();
		}
	});

	// ESC to close
	window.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			if (searchContainer?.classList.contains('active')) {
				closeSearchFn();
			} else if (body.classList.contains('drawer-open')) {
				closeDrawer();
			}
		}

		// Arrow key navigation in search results
		if (searchContainer?.classList.contains('active') && searchResults?.classList.contains('visible')) {
			const options = searchResults.querySelectorAll('[role="option"]') as NodeListOf<HTMLElement>;
			if (options.length === 0) return;

			const currentActive = searchResults.querySelector('[aria-selected="true"]') as HTMLElement;
			let currentIndex = currentActive ? Array.from(options).indexOf(currentActive) : -1;

			if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (currentIndex < options.length - 1) {
					currentIndex++;
				} else {
					currentIndex = 0;
				}
				updateActiveOption(options, currentIndex, searchInput);
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (currentIndex > 0) {
					currentIndex--;
				} else {
					currentIndex = options.length - 1;
				}
				updateActiveOption(options, currentIndex, searchInput);
			} else if (e.key === 'Enter' && currentActive) {
				e.preventDefault();
				currentActive.click();
			}
		}
	});

	function updateActiveOption(options: NodeListOf<HTMLElement>, index: number, input: HTMLInputElement | null) {
		options.forEach(o => o.removeAttribute('aria-selected'));
		options[index].setAttribute('aria-selected', 'true');
		options[index].scrollIntoView({ block: 'nearest' });
		if (input) input.setAttribute('aria-activedescendant', options[index].id);
	}

	searchInput?.addEventListener('input', (e) => {
		const query = (e.target as HTMLInputElement).value.toLowerCase();
		if (!searchResults) return;

		if (query.length < 2) {
			searchResults.innerHTML = '';
			searchResults.classList.remove('visible');
			searchResults.setAttribute('aria-activedescendant', '');
			return;
		}

		const filtered = searchIndex.filter(item => 
			item.title.toLowerCase().includes(query) || 
			item.snippet.toLowerCase().includes(query)
		);

		searchResults.classList.add('visible');
		searchResults.setAttribute('aria-label', `${filtered.length} search results for "${query}"`);

		if (filtered.length === 0) {
			searchResults.innerHTML = `<p style="padding: 16px; color: var(--md-sys-color-on-surface-variant); text-align: center; font-size: 14px;">No results found for "${escapeHtml(query)}"</p>`;
			return;
		}

		searchResults.innerHTML = filtered.map((item, i) => `
			<a href="${escapeHtml(item.link)}" class="search-result-item" role="option" id="search-result-${i}" style="animation-delay:${i * 50}ms">
				<div class="search-result-header">
					<span class="search-result-title">${escapeHtml(item.title)}</span>
					<span class="search-result-category">${escapeHtml(item.category)}</span>
				</div>
				<p class="search-result-snippet">${escapeHtml(item.snippet)}</p>
			</a>
		`).join('');
	});

	// Handle active state in drawer based on current path
	const currentPath = window.location.pathname;
	const drawerItems = document.querySelectorAll('.drawer-item');
	
	drawerItems.forEach(item => {
		const itemPath = item.getAttribute('href');
		if (itemPath && (currentPath === itemPath || (itemPath !== '/' && currentPath.startsWith(itemPath)))) {
			item.classList.add('active');
		}
	});
}
