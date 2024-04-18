import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
// TODO Later on replace site with docs.scrumlr.io
export default defineConfig({
  site: "https://inovex.github.io",
  base: "/scrumlr.io/",
  integrations: [
    starlight({
      title: 'Scrumlr Docs',
      social: {
        github: 'https://github.com/inovex/scrumlr.io',
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Example Guide', link: '/guides/example/' },
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
});
