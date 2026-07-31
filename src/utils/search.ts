import { getCollection } from 'astro:content';

export interface SearchItem {
	title: string;
	snippet: string;
	category: 'DOCS' | 'BLOG' | 'INFO' | 'LANDING';
	link: string;
}

let cachedIndex: SearchItem[] | null = null;

export async function getSearchIndex(): Promise<SearchItem[]> {
	if (cachedIndex) return cachedIndex;

	const blogPosts = await getCollection('blog');
	const docsEntries = await getCollection('docs');
	const teamEntries = await getCollection('team');
	const featuresEntries = await getCollection('features');

	const index: SearchItem[] = [
		...blogPosts.map(post => ({
			title: post.data.title,
			snippet: post.data.description,
			category: 'BLOG' as const,
			link: `/blog/${post.slug}`
		})),
		...docsEntries.map(doc => ({
			title: doc.data.title,
			snippet: doc.data.description,
			category: 'DOCS' as const,
			link: `/docs/${doc.slug}`
		})),
		...teamEntries.map(member => ({
			title: member.data.name,
			snippet: member.data.bio || member.data.role,
			category: 'INFO' as const,
			link: '/info'
		})),
		...featuresEntries.map(feature => ({
			title: feature.data.title,
			snippet: feature.data.description,
			category: 'LANDING' as const,
			link: '/#features'
		})),
		{
			title: 'Download Metrolist',
			snippet: 'Get the latest stable or nightly builds of Metrolist for Android.',
			category: 'INFO' as const,
			link: '/download'
		}
	];

	cachedIndex = index;
	return index;
}
