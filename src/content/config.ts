import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Category for organization
    category: z.enum(['getting-started', 'features', 'troubleshooting']),
    order: z.number().optional(),
  }),
});

const features = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    order: z.number(),
  }),
});

const team = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    github: z.string().optional(),
    twitter: z.string().optional(),
    isHead: z.boolean().optional(),
    order: z.number().optional(),
    socials: z
      .array(
        z.object({
          platform: z.string(),
          url: z.string(),
        })
      )
      .optional(),
  }),
});

const community = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    url: z.string(),
    type: z.enum(['brand', 'symbol', 'forum', 'chat', 'social', 'code']),
    icon: z.string(),
    order: z.number(),
  }),
});

export const collections = { blog, docs, features, team, community };
