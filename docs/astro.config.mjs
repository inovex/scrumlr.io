import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
// TODO Later on replace site with docs.scrumlr.io
export default defineConfig({
  site: "https://inovex.github.io",
  // base: "/scrumlr.io/",
  integrations: [
    starlight({
      title: 'Scrumlr Docs',
      social: {
        github: 'https://github.com/inovex/scrumlr.io',
      },
      sidebar: [
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'Development',
          autogenerate: {
            directory: 'dev',
          },
        },
        {
          label: 'Self-Hosted',
          autogenerate: { directory: 'self-hosted' },
        },
      ],
    }),
  ],
});
