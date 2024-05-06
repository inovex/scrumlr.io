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
      customCss: [
        // Relative path to your custom CSS file
        './src/styles/custom.css',
      ],
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
          autogenerate: { directory: 'self-hosting' },
        },
      ],
    }),
  ],
});
