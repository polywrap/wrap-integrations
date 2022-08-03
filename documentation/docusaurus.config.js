// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/vsLight');
const darkCodeTheme = require('prism-react-renderer/themes/vsDark');

const customFields = {
  githubUrl: `https://github.com/polywrap/integrations`,
  discordUrl: `https://discord.gg/Z5m88a5qWu`,
  handbookUrl: `https://handbook.polywrap.io`,
  twitterUrl: 'https://twitter.com/polywrap_io',
  forumUrl: 'https://forum.polywrap.io',
  daoUrl: 'https://snapshot.org/#/polywrap.eth',
  blogUrl: 'https://blog.polywrap.io/',
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Polywrap Integrations',
  tagline: 'Origin',
  url: 'https://integrations.polywrap.io',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',

  organizationName: 'polywrap',
  projectName: 'integrations',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          sidebarCollapsible: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        googleAnalytics: {
          trackingID: 'UA-160302501-1',
          anonymizeIP: true,
        },
        gtag: {
          trackingID: 'UA-160302501-1',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({ navbar: {
        title: 'Integrations',
        logo: {
          alt: 'Polywrap Icon',
          src: 'img/polywrap-logo-light.png',
          srcDark: 'img/polywrap-logo.png',
          href: '/',
        },
        items: [
          {
            label: 'Polywrap.io',
            href: 'https://polywrap.io',
          },
          {
            label: 'Social',
            position: 'left',
            items: [
              {
                label: 'Blog',
                href: customFields.blogUrl,
                className: 'blog-logo',
                'aria-label': 'Polywrap Blog',
              },
              {
                label: 'Twitter',
                href: customFields.twitterUrl,
                className: 'twitter-logo',
                'aria-label': 'twitter account',
              },
            ],
          },
          {
            label: 'Community',
            position: 'left',
            items: [
              {
                label: 'Code',
                href: customFields.githubUrl,
                className: 'github-logo',
                'aria-label': 'GitHub repository',
              },
              {
                label: 'Discuss',
                href: customFields.forumUrl,
                className: 'forum-logo',
                'aria-label': 'Forum'
              },
              {
                label: 'Chat',
                href: customFields.discordUrl,
                className: 'discord-logo',
                'aria-label': 'Discord server',
              },
              {
                label: 'Govern',
                href: customFields.daoUrl,
                className: 'dao-logo',
                'aria-label': 'dao repo',
              },
              {
                label: 'Handbook',
                href: customFields.handbookUrl,
                className: 'handbook-logo',
                'aria-label': 'handbook',
              },
            ],
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      colorMode: {
        defaultMode: 'dark',
      },
    }),
};

module.exports = config;
