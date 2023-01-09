module.exports = {
  appUrl: '/docs/api',
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  /**
   * Change to false after your app is registered in configuration files
   */
  interceptChromeConfig: false,
  /**
   * Add additional webpack plugins
   */
  plugins: [],
  sassPrefix: '.api-docs, .apiDocs',
  routes: {
    ...(process.env.CONFIG_PORT && {
      '/beta/config': {
        host: `http://localhost:${process.env.CONFIG_PORT}`,
      },
      '/config': {
        host: `http://localhost:${process.env.CONFIG_PORT}`,
      },
    }),
  },
  moduleFederation: {
    exclude: ['react-router-dom'],
    shared: [{ 'react-router-dom': { singleton: true } }],
  },
};
