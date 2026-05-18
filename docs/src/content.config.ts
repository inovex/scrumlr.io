import {defineCollection} from 'astro:content';
import {docsSchema} from '@astrojs/starlight/schema';
import {glob} from "astro/loaders";

export const collections = {
  docs: defineCollection({
    schema: docsSchema(),
    loader: glob({
      pattern: "**/*.{md,mdx}",
      base: "src/content/docs"
    }),
  }),
};
