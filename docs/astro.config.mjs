import {defineConfig} from "astro/config";
import starlight from "@astrojs/starlight";
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
  site: "https://docs.scrumlr.io",
  base: "/",
  integrations: [
    mermaid({
      theme: "default",
      autoTheme: true,
      mermaidConfig: {
        startOnLoad: false,
      }
    }),
    starlight({
      title: "Scrumlr Docs",
      customCss: [
        // Relative path to your custom CSS file
        "./src/styles/custom.css",
      ],
      social: [{icon: "github", label: "GitHub", href: "https://github.com/inovex/scrumlr.io"}],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            {
              autogenerate: {
                directory: "getting-started",
              },
            },
          ]

        },
        {
          label: "Development",
          items: [
            {
              autogenerate: {
               directory: "dev",
              }
            },
          ]

        },
        {
          label: "Self-Hosted",
          items: [
            {
              autogenerate: {
                directory: "self-hosting",
              },
            },
          ]

        },
      ],
    }),
  ],
});
